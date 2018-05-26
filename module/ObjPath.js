const { reststrs, schnittstr, schnitthits } = require('./schnittstr');
console.log("--- ObjPath ---");

let delim = '"]["';

// Klassenmethoden (static)
Array.prototype.flat = (nestedArr = [[]], depth = 0) => { // rekusiv, ersetzt flatcomplete (depth = 0) und flatten
  let flatArr = Array.from(nestedArr);
  nestedArr.forEach(el => {
    if (Array.isArray(el)) flatArr.splice(flatArr.indexOf(el), 1, ...el)
  });
  // ggf. Rekursion
  if (depth == 0) { // flat complete
    let isFlat = flatArr.findIndex(el => Array.isArray(el)) === -1;
    if (!isFlat) flatArr = Array.prototype.flat(flatArr, depth);
  }
  else if (depth-- > 1) { // weitere flatten-Stufen
    flatArr = Array.prototype.flat(flatArr, depth);
  }
  return flatArr;
};
Object.prototype.isObject = (testObj) => {
  return (typeof testObj === "object" && !Array.isArray(testObj) && !!Object.keys(testObj)[0]);
};
class ObjPath { // früher AttrPath, Vorteil: kas kann unabhängig von den val in pkvs bearbeitet werden und dann ein neues pkvs erzeugt werden (pkvsVonKas())
  // Array-Werte scheinen hier ihre enthaltenen Objekte zu verstecken!
  constructor(obj = {}, delimin = '"]["', pathKey = "", objPath = [], arraySolve = true) { //  erstellt Array mit pathKeys, val (objPath) von obj
    if (pathKey == "") objPath = []; // Ergebnis-Array wird zu pkvs,  leerer pathKey ist das Zeichen für 1. Objektebene bei Rekursion
    let keys = [];
    if (arraySolve && Array.isArray(obj)) keys = [...obj.keys()]
    else keys = Object.keys(obj);
    // keys iterieren
    keys.forEach(key => {
      if (pathKey == "") delim = "";  // 1. Ebene
      else delim = delimin;
      // rekursiv
      if (Object.isObject(obj[key]) || (arraySolve && Array.isArray(obj[key]))) {
        objPath = new ObjPath(obj[key], delimin, pathKey + delim + key, Array.from(objPath)).pkvs;
      } else {
        objPath.push({
          pathKey: pathKey + delim + key,
          val: obj[key]
        });
      }
    });
    // pkvs ist das ObjPath-konstituierende Attribut
    // Indices von pkvs und kas korrespondieren
    this.pkvs = objPath; // pkvs = pathKeyValues (früher: attrPath) = [ {pathKey:, val:}, {pathKey:, val:}, ...];  pathKey = pathKeyStr
    this.kas = this.kasVonPkvs(delimin);  // kas = keyArrays (früher: pathArr) = [[pathKeyArr1], [pathKeyArr2], ...]
  };
  kasVonPkvs(delim = '"]["') {
    return this.pkvs.map(el => el.pathKey.split(delim)); // Array mit den pathKey-Arrays aus dem objPath extrahieren
  };
  pkvsVonKas(delim = '"]["') {  // nur bei kas.length = pkvs.length
    this.kas.forEach((el, ix) => this.pkvs[ix].pathKey = el.join(delim));  // geänderte pathKeys zurückwandeln in Strings und in den AttrPath zurückschreiben
    return this.pkvs;
  };
  kasFlat(depth = 0, fromTop = true, joinStr = "--") { // flatted die Keyarrays (kas, PathKeys) komplett (depth=0) oder um depth Ebenen
    if (!this.kas) this.kasVonPkvs();
    if (!fromTop) this.kas = this.kas.map(el => el.reverse());  // !fromTop => beide unteren Ebenen zusammenführen
    this.kas.forEach(el => {
      if (el.length > 1) {
        el.splice(0, 2, fromTop ? el[0] + joinStr + el[1] : el[1] + joinStr + el[0]); // 1. und 2. Ebene zusammenführen
      }
      return el;
    });
    if (!fromTop) this.kas = this.kas.map(el => el.reverse());
    // ggf. weitere Aufrufe von kasFlat
    while (depth == 0 || (depth-- > 1)) { // weitere Runden, wenn nicht bereits flat
      let isFlat = this.kas.findIndex(el => el.length !== 1) === -1;  // komplett flat?
      if (!isFlat) this.kas = this.kasFlat(depth, fromTop, joinStr);
      else depth = 1;  // keine weiteren Aufrufe
    };
    return this.kas;
  };
  pkvsFlat(depth = 0, fromTop = true, joinStr = "--", delim = '"]["') { // flatted die PathKeysValues (pkvs) und Keyarrays (kas) komplett (depth=0) oder um depth Ebenen
    this.kas = this.kasVonPkvs(delim);  // zunächst kas aktualisieren und flatten
    this.kas = this.kasFlat(depth, fromTop, joinStr);
    this.pkvs = this.pkvsVonKas(delim);
    return this.pkvs;
  };
  obj(delim = '"]["') { // erstellt zugehöriges Objekt
    let pKarr;
    let obj;
    pKarr = this.pkvs[0].pathKey.split(delim);
    if (pKarr[0] >= 0) obj = []  // erster Key = Zahl => Array
    else obj = {};  // erster  Key = String => Objekt
    // für jedes pkv das Objekt mit einem Unterobjekt ergänzen
    this.pkvs.forEach(pkv => {
      obj = this.pkvObj(obj, pkv);
    });
    return obj;
  };
  pkvObj(obj = {}, pkv = { pathKey: "", val: null }, delim = '"]["') {
    if (pkv.pathKey.indexOf(delim) === -1) { // kein delim im pathKey => direkte Zuordnung
      obj[pkv.pathKey] = pkv.val;
    } else {  // pathKey enthält delim => Rekursion
      const pKarr = pkv.pathKey.split(delim);
      pkv.pathKey = pKarr.slice(1).join(delim);
      // Rekursion
      if (pKarr[1] >= 0) {  // nächster Key = Zahl => Array
        obj[pKarr[0]] = obj[pKarr[0]] || []; // ggf. leeres Objekt erzeugen
        obj[pKarr[0]] = this.pkvObj(Array.from(obj[pKarr[0]]), pkv);
      } else {  // nächster Key = String => Objekt
        obj[pKarr[0]] = obj[pKarr[0]] || {}; // ggf. leeres Objekt erzeugen
        obj[pKarr[0]] = this.pkvObj(Object.assign({}, obj[pKarr[0]]), pkv);
      }
    };
    return obj;
  };
  subObjPath(pathKey, fromStart = null, delim = '"]["') {
    if (fromStart !== true && fromStart !== false) fromStart = null;
    const subOp = new ObjPath();
    switch (fromStart) {
      case true: // pathKey am Anfang (benötigt delim)
        subOp.pkvs = this.pkvs.filter(pkv => pkv.pathKey.startsWith(pathKey));
        break;
      case false: // pathKey am Ende (benötigt delim)
        subOp.pkvs = this.pkvs.filter(pkv => pkv.pathKey.endsWith(pathKey));
        break;
      default:  // pathKey überhaupt enthalten
        subOp.pkvs = this.pkvs.filter(pkv => pkv.pathKey.indexOf(pathKey)!==-1);
    }
    return subOp;
  };
  subObj(pathKey, fromStart = null, delim = '"]["') { // subObjekt extrahieren
    const subOp = this.subObjPath(pathKey, fromStart = null, delim = '"]["');
    subOp.pkvNorm();
    return subOp.obj();
  };
  pkvNorm() { // normiert die pkvs pathKeys mit reststrs
    let pathKeys = this.pkvs.map(el => el.pathKey);
    pathKeys = reststrs(pathKeys);
    this.pkvs = this.pkvs.map((el, ix) => ({
      "pathKey": pathKeys[ix],
      "val": el.val
    }));
    return this.pkvs;
  };
};

// Checks
const check = () => {
  console.log("- check -");
  const o0 = { "a": 1, "b": 2 };
  const o1 = { "a": 1, "b": { "e": 5 } };
  const o2 = { "d": { "g": { "i": 7 }, "h": 6 }, "e": { "i": 8 } }; // "c": { "f": 5 },
  const o3 = { ...o1, ...o2 };

  console.log("o3", o3);
  let op = new ObjPath(o3);
  console.log("op", op);
  let pk2 = op.subObjPath("d", true);
  console.log("pk2", pk2);
  // let o4 = op.obj();
  // console.log("o4",o4);

  // let kf = op.kasFlat(1,false);
  // console.log("kf", kf);
  // let pkvs = op.pkvsVonKas();
  // console.log("pkvs", pkvs);
  // let kas = op.kasVonPkvs();
  // console.log("kas", kas);
  // let flat = attrPathFlat(op.pkvs, 1, false, "--");
  // console.log("fl", flat);

  // let copy = cloneobjpath(o3);
  // objequal(o3, copy);
  // delete copy.d.g;
  // objequal(o3, copy);
};
const check2 = () => {
  console.log("- check -");
  const a0 = ["a", 1, "b", 2];
  const a1 = ["a", 1, "b", ["e", 5]];
  const a2 = ["d", ["g", ["i", ["j", 7]], "h", 6], "e", ["i", 8]]; // "c", [ "f", 5 ],
  const a3 = [...a1, ...a2];

  console.log("a", a2);

  flat = Array.prototype.flat(a2);
  console.log("flat", flat);

};
const check3 = () => {
  let strArr = ["bcdefgcd", "xxcdx", "abcde", "bcdefgcde"];
  let sub = schnittstr(strArr);
  console.log(strArr);
  console.log(sub.foundArr);
};
const check4 = () => {
  let s1 = "bcdefgcd";
  let s2 = "xcdxx";
  let st = schnitthits(s1, s2, 2);
  console.log(st);
};
const check5 = () => {
  console.log("- check -");
  const o0 = { "a": 1, "b": 2 };
  const o1 = { "a": 1, "b": [{ "e": 5 }, 6, [1, 2]] };
  const o2 = { "d": { "g": { "i": 7 }, "h": 6 }, "e": { "i": 8 } }; // "c": { "f": 5 },
  const o3 = { ...o1, ...o2 };

  console.log("o3", o3);
  let op = new ObjPath(o3);
  console.log("op", op.pkvs);
  let sp = op.subObjPath('b');
  console.log("sp", sp);
  let pn = sp.pkvNorm();
  console.log("pn", pn);
  let so = sp.obj();
  console.log("so", so);
  let so2 = op.subObj('b');
  console.log("so2", so2);

  // let pk2 = op.pkvObj({}, op.pkvs[7]);
  // console.log("pk2", pk2);
};
const check6 = () => {
  let strArr = ["bcdefgcd", "decdx", "abcde", "bcdefgcde"];
  let sub = reststrs(strArr, true);
  console.log(strArr);
  console.log(sub);
};
const check7 = () => {
  console.log("- check -");
  const o0 = { "a": 1, "b": 2 };
  const o1 = { "a": 1, "b": { "e": 5 } };
  const o2 = { "d": { "g": { "i": 7 }, "h": 6 }, "e": { "i": 8 } }; // "c": { "f": 5 },
  const o3 = { ...o1, ...o2 };

  console.log("o3", o3);
  let op = new ObjPath(o3);
  console.log("op", op);
  let ob = op.obj();
  console.log("ob", ob);

  // let pk2 = op.subPkvs("d", true);
  // console.log("pk2", pk2);
};
const check8 = () => {
  console.log("- check -");
  const o0 = { "a": 1, "b": 2 };
  const o1 = { "a": 1, "b": { "e": 5 } };
  const o2 = { "d": { "g": { "i": 7 }, "h": 6 }, "e": { "i": 8 } }; // "c": { "f": 5 },
  const o3 = { ...o1, ...o2 };

  console.log("o3", o3);
  let op = new ObjPath(o3);
  console.log("op", op);
  // let kf = op.kasFlat(1,false);
  // console.log("kf", kf);
  // let pkvs = op.pkvsVonKas();
  // console.log("pkvs", pkvs);
  let flat2 = op.pkvsFlat(1, false, "--");
  console.log("fl2", flat2);
  let flat = op.kasFlat(true, "--");
  console.log("fl", flat);
  console.log("op", op);

};
check8();

module.exports = ObjPath;
