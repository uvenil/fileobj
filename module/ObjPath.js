const { reststrs, schnittstr, schnitthits } = require('./schnittstr');
const { filt, filter } = require('./arrayfkt');
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
  // Umwandlung: Obj <-> ObjPath, pkvs <-> kas
  constructor(obj = {}, delim = '"]["', arraySolve = true) { //  erstellt Array mit pathKeys, val (objPath) von obj
    this.pkvs = this.pkvsVonObj(obj, delim, arraySolve, ""); // pkvs = pathKeyValues (früher: attrPath) = [ {pathKey:, val:}, {pathKey:, val:}, ...];  pathKey = pathKeyStr
    this.kas = this.kasVonPkvs(delim);  // kas = keyArrays (früher: pathArr) = [[pathKeyArr1], [pathKeyArr2], ...]
    this.pkvsFlat = this.pkvswrap(this.kasFlat, delim); // liefert zur kasfkt zugehörige pkvsfkt
  };
  pkvsVonObj(obj = {}, delim = '"]["', arraySolve = true, pathKey = "") { //  erstellt objPath = Array mit pathKeys, val (objPath) von obj
    let val, key, delimin;
    if (pathKey === "") { // Gesamt-Objekt
      delimin = "";
      key = "";
      val = obj;
    } else {  // Attribut mit pathKey
      delimin = delim;
      key = pathKey.split(delim).reverse()[0];
      val = obj[key];
    }
    let keys = [];
    let objPath = [];
    if (Object.isObject(val) || (arraySolve && Array.isArray(val))) { // val = Objekt oder Array: Keys ermitteln und durchlaufen
      if (arraySolve && Array.isArray(val)) keys = [...val.keys()]  // Array
      else keys = Object.keys(val); // Objekt
      keys.forEach((k) => { // alle keys durchlaufen
        let pK = pathKey + delimin + k; // key wird zum pathKey hinzugefügt
        objPath = objPath.concat(this.pkvsVonObj(val, delim, arraySolve, pK));
      });
    } else {  // primitiver Wert: pathKey und Wert zuweisen
      let pkv = { pathKey, val };
      return [pkv];
    }
    return objPath;
  };
  obj(delim = '"]["') { // erstellt zum pkvs gehöriges Objekt
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
  pkvObj(obj = {}, pkv = { pathKey: "", val: null }, delim = '"]["') {  // erstellt pkv-Subobjekt
    if (pkv.pathKey.indexOf(delim) === -1) { // kein delim im pathKey => direkte Zuordnung
      obj[pkv.pathKey] = pkv.val;
    } else {  // pathKey enthält delim => Rekursion
      const pkvCopy = JSON.parse(JSON.stringify(pkv));  // da dies nachfolgend verändert wird, während pkv unverändert bleiben soll
      const pKarr = pkvCopy.pathKey.split(delim);
      pkvCopy.pathKey = pKarr.slice(1).join(delim);
      // Rekursion
      if (pKarr[1] >= 0) {  // nächster Key = Zahl => Array
        obj[pKarr[0]] = obj[pKarr[0]] || []; // ggf. leeres Objekt erzeugen
        obj[pKarr[0]] = this.pkvObj(Array.from(obj[pKarr[0]]), pkvCopy);
      } else {  // nächster Key = String => Objekt
        obj[pKarr[0]] = obj[pKarr[0]] || {}; // ggf. leeres Objekt erzeugen
        obj[pKarr[0]] = this.pkvObj(Object.assign({}, obj[pKarr[0]]), pkvCopy);
      }
    };
    return obj;
  };
  kasVonPkvs(delim = '"]["') {
    // let kas =  this.pkvs.map(el => el.pathKey.split(delim)); // Array mit den pathKey-Arrays aus dem objPath extrahieren
    // return kas;
    return this.pkvs.map(el => el.pathKey.split(delim)); // Array mit den pathKey-Arrays aus dem objPath extrahieren
  };
  pkvsVonKas(delim = '"]["') {  // nur bei kas.length = pkvs.length
    this.kas.forEach((el, ix) => this.pkvs[ix].pathKey = el.join(delim));  // geänderte pathKeys zurückwandeln in Strings und in den AttrPath zurückschreiben
    return this.pkvs;
  };
  pkvswrap(kasfkt, delim = '"]["', ...args) { // liefert zur kasfkt zugehörige pkvsfkt
    // ersetzt Meth pkvsFlat durch den Aufruf: op.pkvsFlat = op.pkvswrap(op.kasFlat, delim);
    let pkvsfkt = (...args) => {
      this.kas = this.kasVonPkvs(delim);  // zunächst kas aktualisieren und flatten
      this.kas = kasfkt.apply(this, args);
      this.pkvs = this.pkvsVonKas(delim);
      return this.pkvs;
    };
    return pkvsfkt;
  };
  // Kombination und Teilobjekte
  assign(...ObjPathes) {  // liefert einen aus mehreren ObjPathes kombinierten ObjPath über die Fkt. Object.assign()
    // merge auf Objektebene mit Object.assign() möglich
    const objarr = ObjPathes.map(op => op.obj()); // Objekte aus den ObjPath-Argumenten
    objarr.unshift(this.obj());
    const assObj = Object.assign.apply({}, objarr);  // kombiniertes Objekt
    const assOp = new ObjPath(assObj);
    return assOp;
  };
  subObjPathFilter(exclArr, inclArr, regExpr = false) {  // Sub-ObjPath von exclArr und inclArr
    const pkArr = this.pkvs.map(pkv => pkv.pathKey);  // Array von PathKeys
    let filtIx = filt(pkArr, exclArr, inclArr, regExpr, true);  // ausgewählte Indices
    let subOp = new ObjPath();
    subOp.pkvs = this.pkvs.filter((el, ix) => filtIx.indexOf(ix) !== -1); // nur pkvs der ausgewählten Indices
    // subOp.kas = subOp.kasVonPkvs();  // kas werden erst bei Bedarf ermittelt
    return { subOp, filtIx }; // neben Subo-ObjPath die verwendeten Indices
  };
  subObjPath(pathKey, fromStart = null) { // Sub-ObjPath von pathKey-String
    if (fromStart !== true && fromStart !== false) fromStart = null;
    const subOp = new ObjPath();
    switch (fromStart) {
      case true: // pathKey am Anfang
        subOp.pkvs = this.pkvs.filter(pkv => pkv.pathKey.startsWith(pathKey));
        break;
      case false: // pathKey am Ende
        subOp.pkvs = this.pkvs.filter(pkv => pkv.pathKey.endsWith(pathKey));
        break;
      default:  // pathKey überhaupt enthalten
        subOp.pkvs = this.pkvs.filter(pkv => pkv.pathKey.indexOf(pathKey)!==-1);
    }
    return subOp;
  };
  subObj(pathKey, fromStart = null, delim = '"]["') { // Sub-Objekt aus pathKey, subObjekt extrahieren
    const subOp = this.subObjPath(pathKey, fromStart, delim);
    subOp.pkvNorm(delim);
    return subOp.obj();
  };
  subwrap(opfktName, exclArr = [], inclArr = [], regExpr = false, ...args) { // erstellt Funktion zur Modifikation eines Sub-ObjPath aus ObjPath-Funktion (opfktName)
    const subfkt = (...args) => {  // flattet ein Sub-ObjPath im ObjPath
      let { subOp, filtIx } = this.subObjPathFilter(exclArr, inclArr, regExpr);
      subOp[opfktName].apply(subOp, args); 
      subOp.pkvs.forEach((el, ix) => this.pkvs[filtIx[ix]] = el); // geflattete Sub-pkvs in pkvs einfügen
      return this.pkvs;
    };
    return subfkt;
  };
  // Manipulation
  pkvNorm(delim = '"]["') { // normiert die pkvs pathKeys mit reststrs
    let pathKeys = this.pkvs.map(el => el.pathKey);
    if (schnittstr(pathKeys).str!==delim)  pathKeys = reststrs(pathKeys); // delim alleine nicht rausschneiden
    this.pkvs = this.pkvs.map((el, ix) => ({
      "pathKey": pathKeys[ix],
      "val": el.val
    }));
    return this.pkvs;
  };
  kaFlat(ka = [], key = "", depth = 0, fromTop = true, joinStr = "--") {  // flattet ka ab key
    // ! modifiziert ka direkt
    if (!ka)  return ka; 
    if (!key) fromTop ? key = ka[0] : key = ka[ka.length-1]; 
    const keyIx = ka.indexOf(key);
    if (keyIx === -1) return ka;
    const isFlat = fromTop ? keyIx >= ka.length-1 : keyIx <= 0;
    if (isFlat) return ka;
    // key-Ebene mit nachfolgender/vorheriger zusammenführen
    let nextKey;
    if (fromTop) {
      nextKey = ka[keyIx] + joinStr + ka[keyIx + 1];
      ka.splice(keyIx, 2, nextKey); // key-Ebene mit nachfolgender zusammenführen
    } else {
      nextKey = ka[keyIx - 1] + joinStr + ka[keyIx];
      ka.splice(keyIx - 1, 2, nextKey); // key-Ebene mit vorheriger zusammenführen
    };
    // ggf. Rekursion
    if (depth == 0 || (depth-- > 1)) {
      ka = this.kaFlat(ka, nextKey, depth, fromTop, joinStr);
    };
    return ka;
  };
  kasFlat(key = "", depth = 0, fromTop = true, joinStr = "--") { // flatted die Keyarrays (kas, PathKeys) komplett (depth=0) oder um depth Ebenen
    if (!this.kas || this.kas.length === 0) this.kasVonPkvs();
    this.kas.forEach(ka => {
      this.kaFlat(ka, key, depth, fromTop, joinStr);  // flattet ka
    });
    return this.kas;
  };
  keymove(key = "", steps = 1) {  // unfertig!
  };
  // Sub-Manipulation
  subFlat(exclArr, inclArr, key = "", depth = 0, fromTop = true, joinStr = "--") {  // flattet ein Sub-ObjPath im ObjPath
    // ersetzt durch: Def.: op.subFlat = op.subwrap("pkvsFlat", exclArr, inclArr, regExpr);   Aufruf: const sf = op2.subFlat(key, depth, fromTop);
    const regExpr = false;
    let { subOp, filtIx } = this.subObjPathFilter(exclArr, inclArr, regExpr);
    subOp.pkvsFlat(key, depth, fromTop, joinStr);
    subOp.pkvs.forEach((el, ix) => this.pkvs[filtIx[ix]] = el); // geflattete Sub-pkvs in pkvs einfügen
    return this.pkvs;
  };
};
// Checks
const vars = () => ({
  "o0" : { "a": 1, "b": 2 },
  "o1" : { "a": 1, "b": [{ "e": 5 }, 6, [1, 2]] },
  "o2" : { "d": { "g": { "i": 7 }, "h": 6 }, "e": { "i": 8 } }, // "c": { "f": 5 },
  // "o3" : { ...vars.o1, ...vars.o2 },
  "ka" : ['b', '0', '1', 'c', '2'],
  "exclArr" : ["0"],
  "inclArr" : ['b'],
  "regExpr" : false,
  "key" : "2",
  "depth" : 1,
  "fromTop" : true,
});
const checkd = () => {
  console.log("- check -");
  const o0 = { "a": 1, "b": 2 };
  const o1 = { "a": 1, "b": [{ "e": 5 }, 6, [1, 2]] };
  const o2 = { "d": { "g": { "i": 7 }, "h": 6 }, "e": { "i": 8 } }; // "c": { "f": 5 },
  const o3 = { ...o1, ...o2 };
  const key = "";
  const depth = 1;
  const fromTop = false;
  const joinStr = "--";
  let delim;

  console.log("o3", o3);
  let op1 = new ObjPath(o3);
  let op2 = new ObjPath(o3);
  let flat1 = op1.pkvsFlat(key, depth, fromTop, joinStr);
  console.log("fl1", flat1);

  // op2.pkvsFlat2 = op2.pkvswrap(delim, op2.kasFlat, key, depth, fromTop, joinStr);
  op2.pkvsFlat2 = op2.pkvswrap(op2.kasFlat, delim);
  
  let flat2 = op2.pkvsFlat2(key, depth, fromTop, joinStr);
  // let flat3 = op2.pkvsFlat2(key, depth, fromTop, joinStr);
  console.log("fl2", flat2);
  // console.log("fl3", op2.pkvs);

  // let flat = op.kasFlat("", 1, true, "-");
  // console.log("fl", flat);
  // console.log("op", op);
};
const checkc = () => {
  console.log("- check -");
  const v = vars();
  o3 = { ...v.o1, ...v.o2 };
  console.log("o3", o3);
  let op = new ObjPath(o3);
  let op2 = new ObjPath(o3);
  console.log("op", op2.pkvs);

  let sf = op.subFlat(v.exclArr, v.inclArr, v.key, v.depth, v.fromTop);
  console.log("sf", sf);
  op2.subFlat2 = op2.subwrap("pkvsFlat", v.exclArr, v.inclArr, v.regExpr);
  const sf2 = op2.subFlat2(v.key, v.depth, v.fromTop);
  // const sf2 = op2.subFlat(v.exclArr, v.inclArr, v.key, v.depth, v.fromTop);
  console.log("sf2", sf2);
  // console.log("op", op);
};
const checkb = () => {
  console.log("- check -");
  const o0 = { "a": 1, "b": 2 };
  const o1 = { "a": 1, "b": [{ "e": 5 }, 6, [1, 2]] };
  const o2 = { "d": { "g": { "i": 7 }, "h": 6 }, "e": { "i": 8 } }; // "c": { "f": 5 },
  const o3 = { ...o1, ...o2 };
  const ka = ['b', '0', '1', 'c', '2'];
  const exclArr = ["0"];
  const inclArr = ['2'];
  const depth = 1;
  const fromTop = true;

  console.log("o3", o3);
  let op = new ObjPath(o3);
  console.log("op", op);
  let kf = op.kasFlatKey('e', 0, true);
  console.log("kf",kf);
};
const checka = () => {
  console.log("- check -");
  const o0 = { "a": 1, "b": 2 };
  const o1 = { "a": 1, "b": [{ "e": 5 }, 6, [1, 2]] };
  const o2 = { "d": { "g": { "i": 7 }, "h": 6 }, "e": { "i": 8 } }; // "c": { "f": 5 },
  const o3 = { ...o1, ...o2 };
  const ka = ['b', '0', '1', 'c', '2'];
  const exclArr = ["0"];
  const inclArr = ['2'];
  const depth = 1;
  const fromTop = true;

  console.log("o3", o3);
  let op = new ObjPath(o3);
  console.log("op", op);

  console.log(ka);
  let kaf = op.kaFlat(ka, "", 3, false);
  console.log(kaf);
};
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
  let sp = op.subObjPath('e', true);
  console.log("sp", sp);
  // let pn = sp.pkvNorm();
  // console.log("pn", pn);
  let so = sp.obj();
  console.log("so", so);
  let so2 = op.subObj('e', true);
  console.log("so2", so2);

  let pk2 = op.pkvObj({}, op.pkvs[2]);
  console.log("pk2", pk2);
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
  let flat2 = op.pkvsFlat("", 1, false, "--");
  console.log("fl2", flat2);
  let flat = op.kasFlat("", 1, true, "--");
  console.log("fl", flat);
  console.log("op", op);
};
const check9 = () => {
  console.log("- check -");
  const o0 = { "a": 1, "b": 2 };
  const o1 = { "a": 1, "b": { "e": 5 } };
  const o2 = { "d": { "g": { "i": 7 }, "h": 6 }, "e": { "i": 8 } }; // "c": { "f": 5 },
  const o3 = { ...o1, ...o2 };
  // const o3 = Object.assign(o1,o2);

  console.log("o1", o1);
  console.log("o2", o2);
  console.log("o3", o3);
  let op1 = new ObjPath(o1);
  const op2 = new ObjPath(o2);
  const opa = op1.assign(op2);
  console.log("op1", op1);
  console.log("op2", op2);
  console.log("opa", opa);
  const opao = opa.obj();
  console.log("opao", opao);
  console.log("o3", o3);
};
checkc();

module.exports = ObjPath;
