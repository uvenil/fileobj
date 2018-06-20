// Die ObjPath-Klasse dient dazu Objektstrukturen zu manipulieren

const { reststrs, schnittstr, schnitthits } = require('./schnittstr');
const { filt, filter } = require('./arrayfkt');
// console.log("--- ObjPath ---");

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
const objwrap = (pkvsfktname, obj = {}, arraySolve = true, ...args) => { // liefert zur pkvsfkt zugehörige objfkt
  let objfkt = (obj, arraySolve, ...args) => {
    let delim = '"]["';
    let op = new ObjPath(obj, delim, arraySolve);
    op[pkvsfktname].apply(op.pkvs, args);
    let retObj = op.obj(delim);
    return retObj;
  };
  return objfkt;
};
const objkaswrap = (kasfktname, obj = {}, arraySolve = true, ...args) => { // liefert zur kasfkt zugehörige objfkt
  let objfkt = (obj, arraySolve, ...args) => {
    let delim = '"]["';
    let op = new ObjPath(obj, delim, arraySolve);
    op.kas = op.kasVonPkvs(delim);  // zunächst kas aktualisieren und flatten
    op.kas = op[kasfktname].apply(op, args);
    op.pkvs = op.pkvsVonKas(delim);
    let retObj = op.obj(delim);
    return retObj;
  };
  return objfkt;
};
class ObjPath { // früher AttrPath, Vorteil: kas kann unabhängig von den val in pkvs bearbeitet werden und dann ein neues pkvs erzeugt werden (pkvsVonKas())
  // Umwandlung: Obj <-> ObjPath, pkvs <-> kas
  constructor(obj = {}, delim = '"]["', arraySolve = true) { //  erstellt Array mit pathKeys, val (objPath) von obj
    this.pkvs = this.pkvsVonObj(obj, delim, arraySolve, ""); // pkvs = pathKeyValues (früher: attrPath) = [ {pathKey:, val:}, {pathKey:, val:}, ...];  pathKey = pathKeyStr
    this.kas = this.kasVonPkvs(delim);  // kas = keyArrays (früher: pathArr) = [[pathKeyArr1], [pathKeyArr2], ...]
    this.pkvsFlat = this.pkvswrap(this.kasFlat, delim); // liefert zur kasfkt zugehörige pkvsfkt
    this.pkeymove = this.pkvswrap(this.keymove, delim);
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
        let pK = pathKey + delimin + k; // pathKey wird generiert, indem key hinzugefügt wird, wenn noch Objekt oder Array
        objPath = objPath.concat(this.pkvsVonObj(val, delim, arraySolve, pK));
      });
    } else {  // primitiver Wert: pathKey und Wert zuweisen
      let pkv = { pathKey, val }; // generierter pathKey und val werden erst bei primitiven Wert gespeichert
      return [pkv];
    }
    return objPath;
  };
  obj(delim = '"]["') { // erstellt zum pkvs gehöriges Objekt
    let pKarr;
    let obj;
    this.pkvsSort();  // Zahlen-keys nach hinten (hoher Index), damit ggf. ein Objekt statt ein Array entsteht und keine Objektattribute durch einen anfänglichen Array verloren gehen
    pKarr = this.pkvs[0].pathKey.split(delim);
    if (pKarr[0] >= 0) obj = []  // erster Key = Zahl => Array
    else obj = {};  // erster  Key = String => Objekt
    // für jedes pkv das Objekt mit einem Unterobjekt ergänzen
    this.pkvs.forEach(pkv => {
      obj = this.pkvObj(obj, pkv, delim);
      return obj;
    });
    return obj;
  };
  pkvObj(obj = {}, pkv = { pathKey: "", val: null }, delim = '"]["') {  // erstellt pkv-Subobjekt
    if (pkv.pathKey.indexOf(delim) === -1) { // kein delim im pathKey => direkte Zuordnung
      obj[pkv.pathKey] = pkv.val;
    } else {  // pathKey enthält delim => Rekursion
      // Parameter subPkv
      const subPkv = JSON.parse(JSON.stringify(pkv));  // da dies nachfolgend verändert wird, während pkv unverändert bleiben soll
      const keys = subPkv.pathKey.split(delim);  // Array der keys
      subPkv.pathKey = keys.slice(1).join(delim); // erster key abgespalten zur neuen Objektbezeihnung keys[0]
      // Parameter subObj
      let key = keys[0];  // aktueller oberster key
      let subObj = {};
      if (Array.isArray(obj[key])) { // Array-Kopie
        subObj = Array.from(obj[key]);
      } else if (Object.isObject(obj[key])){  // Objekt-Kopie
        subObj = Object.assign({}, obj[key]);
      } else if (keys[1] >= 0) {  // nächster Key = Zahl => Array
        subObj = []; // ggf. leeres Array erzeugen
      } else {  // nächster Key = String => Objekt
        subObj = {}; // ggf. leeres Objekt erzeugen
      }
      obj[key] = this.pkvObj(subObj, subPkv, delim);  // Rekursion
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
  pkvsSort() { // sortiert die kas, so dass Zahlen-keys hinten sind
    this.pkvs.sort((a, b) => this.kaSort(a.pathKey, b.pathKey));
    return this.pkvs;
  };
  kaSort(ka1, ka2) {  // Sortierfunktion für pkvsSort, vergleicht 2 Keyarrays
    // console.log("ka1", ka1, "ka2", ka2);
    if (ka1[0] === ka2[0]) {  // 1. key gleich
      if (ka1.length === 1) return -1 // keine weitere keys im 1. keyarray
      else if (ka2.length === 1) return 1  // keine weitere keys im 2. keyarray
      return this.kaSort(ka1.slice(1), ka2.slice(1));  // Rekursion
    } else {
      if (ka1[0] >= 0 && !(ka2[0] >= 0)) return 1 // vertauschen, da 1. key nur im 1. keyarray ist Zahl
      return -1;  // nicht vertauschen
    }
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
      this.kaFlat(ka, key, depth, fromTop, joinStr);  // flattet ka = keyarray
    });
    return this.kas;
  };
  keyexchange(key = "", steps = 1) {  // tauscht einen key mit dem key aus der steps weiter liegt
    if (!this.kas || this.kas.length === 0) this.kasVonPkvs();
    this.kas.filter(ka => ka.indexOf(key) !== -1).map(ka => {
      let ixKey = ka.indexOf(key);
      let ixChange = ixKey + steps;
      ixChange = Math.max(0, ixChange);
      ixChange = Math.min(ka.length - 1, ixChange);
      const temp = ka[ixKey];
      ka[ixKey] = ka[ixChange];
      ka[ixChange] = temp;
      return ka;
    });
    return this.kas;
  };
  keymove(key = "", steps = 1) {  // verschiebt key um steps in kas
    if (!this.kas || this.kas.length === 0) this.kasVonPkvs();
    this.kas.filter(ka => ka.indexOf(key) !== -1).map(ka => {
      let ixKey = ka.indexOf(key);
      let ixChange = ixKey + steps;
      ixChange = Math.max(0, ixChange);
      ixChange = Math.min(ka.length - 1, ixChange);
      const temp = ka[ixKey];
      let i = ixKey;
      const step = steps / Math.abs(steps); // +1 oder -1
      while (i !== ixChange && (i+step) >=0 && (i+step) < ka.length) {
        ka[i] = ka[i + step];
        i += step;
      }
      ka[ixChange] = temp;
      return ka;
    });
    return this.kas;
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
module.exports = { ObjPath, objwrap, objkaswrap };
// export { ObjPath, objwrap };
