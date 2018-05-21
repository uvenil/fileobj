const { objequals } = require('./module/objequals');
console.log("--- objclone ---");

let delim = '"]["';

// Klassenmethoden (static)
const commonStartString = (words) => {  // words = [str1, str2, ...], 
  // aus: https://stackoverflow.com/questions/1916218/find-the-longest-common-starting-substring-in-a-set-of-strings, 
  // Originalname commonSubstring; Lsg 1 (Fkt common_substring funktioniert nicht fehlerfrei)
  var iChar, iWord,
    refWord = words[0],
    lRefWord = refWord.length,
    lWords = words.length;
  for (iChar = 0; iChar < lRefWord; iChar += 1) {
    for (iWord = 1; iWord < lWords; iWord += 1) {
      if (refWord[iChar] !== words[iWord][iChar]) {
        return refWord.substring(0, iChar);
      }
    }
  }
  return refWord;
};
const getIntersect = (arr1, arr2) => {  // Schnittmenge zweier Arrays
  // aus: http://www.falsepositives.com/index.php/2009/12/01/javascript-function-to-get-the-intersect-of-2-arrays/
  var r = [], o = {}, l = arr2.length, i, v;
  for (i = 0; i < l; i++) {
    o[arr2[i]] = true;
  }
  l = arr1.length;
  for (i = 0; i < l; i++) {
    v = arr1[i];
    if (v in o) {
      r.push(v);
    }
  }
  return r;
};
const schnittString = (strArr) => {  // strArr = [str1, str2, ...],
  // !!!commonStartString verändert für interne Strings
  // let schnittIx = schnittix(strArr[1], strArr[2]);
  // if (schnittIx.length === 0)  return "";
  let temp = null;
  if (str1.length > str2.length) { // str1 soll der kleinere String sein
    temp = str1;
    str1 = str2;
    str2 = temp;
  }
  let schnittIx = [];
  let testLen = Math.floor(str1.length / 2);
  let hits = schnittHits(str1, str2, testLen); // // [[str1-Index, str2-Index, testLen], ...]
  // testLen schrittweise erhöhen oder erniedrigen
  if (hits.length > 0) {
    while (hits.length > 0 && testLen <= str1.length) {
      schnittIx = Array.from(hits); // letzte Treffer speichern
      hits = schnittHits(str1, str2, testLen++);
    }
    if (hits.length > 0) schnittIx = Array.from(hits);
  } else {
    while (hits.length == 0 && testLen > 1) {
      hits = schnittHits(str1, str2, testLen--);
    };
    schnittIx = Array.from(hits);
  };
  if (temp != null) schnittIx = schnittIx.map(el => [el[1], el[0], el[2]]);  // ggf. zurücktauschen
  return schnittIx; // [[str1-Index, str2-Index, testLen], ...]
};
const schnittix = (str1, str2) => {  // liefert [] oder[[str1-Index, str2-Index, maxLen], ...]
  let schnittIx = [];
  let testLen = Math.floor(str1.length/2);
  let hits = schnittHits(str1, str2, testLen); // // [[str1-Index, str2-Index, testLen], ...]
  // testLen schrittweise erhöhen oder erniedrigen
  if (hits.length > 0) {
    while (hits.length > 0 && testLen <= str1.length) {
      schnittIx = Array.from(hits); // letzte Treffer speichern
      hits = schnittHits(str1, str2, testLen++);
    }
    if (hits.length > 0) schnittIx = Array.from(hits);
  } else {
    while (hits.length == 0 && testLen > 1) {
      hits = schnittHits(str1, str2, testLen--);
    };
    schnittIx = Array.from(hits);
  };
  return schnittIx; // [[str1-Index, str2-Index, testLen], ...]
};
const schnittHits = (str1, str2, testLen) => {  // liefert [[str1-Index, str2-Index, testLen]
  if (!testLen || testLen<0) return [];
  let temp = null;
  if (str1.length > str2.length) { // str1 soll der kleinere String sein
    temp = str1;
    str1 = str2;
    str2 = temp;
  }
  let ix1, ix2
  let hits = []; // [[str1-Index, str2-Index, testLen], ...]
  for (ix1 = 0; ix1 < (str1.length - testLen + 1); ix1++) {
    ix2 = str2.indexOf(str1.slice(ix1, ix1 + testLen));
    if (ix2 !== -1) hits.push([ix1, ix2, testLen]);
  };
  if (temp != null) hits = hits.map(el => [el[1], el[0], el[2]]);  // ggf. zurücktauschen
  return hits;
};
Array.prototype.flat = (nestedArr = [[]], depth = 0) => { // rekusiv, ersetzt flatcomplete (depth = 0) und flatten
  let flatArr = Array.from(nestedArr);
  nestedArr.forEach(el => {
    if (Array.isArray(el)) flatArr.splice(flatArr.indexOf(el), 1, ...el)
  });
  // ggf. Rekursion
  if (depth==0) { // flat complete
    let isFlat = flatArr.findIndex(el => Array.isArray(el)) === -1;
    if (!isFlat)  flatArr = Array.prototype.flat(flatArr, depth);
  }
  else if (depth-- > 1) { // weitere flatten-Stufen
    flatArr = Array.prototype.flat(flatArr, depth);
  }
  return flatArr;
};
Object.prototype.isObject = (testObj) => {
  return (typeof testObj === "object" && !Array.isArray(testObj) && !!Object.keys(testObj)[0]);
};
// ToDo: 
// schnittix, pkvNorm
// beliebige keys zusammenführen, analog attrPathFlat !!!
// Subobjekt nach oben holen und in Excel darstellen
// gute Funktionen in Module zusammenfassen

// attrPath
const pathArrFlat = (pathArr, fromTop = true, joinStr = "--") => { // flatted die PathKeys des PathArr um 1 Ebene
  if (!fromTop) pathArr = pathArr.map(el => el.reverse());  // !fromTop => beide unteren Ebenen zusammenführen
  pathArr.forEach(el => {
    if (el.length > 1) {
      el.splice(0, 2, fromTop ? el[0] + joinStr + el[1] : el[1] + joinStr + el[0]); // 1. und 2. Ebene zusammenführen
    }
    return el;
  });
  if (!fromTop) pathArr = pathArr.map(el => el.reverse());
  return pathArr;
};
const attrPathFlat = (attrPath, depth = 0, fromTop = false, joinStr = "--", delim = '"]["') => {
  let flatAttrPath = Array.from(attrPath);  // Kopie des übergebenen AttrPath erzeugen
  // Extrahieren von pathArr
  let pathArr = flatAttrPath.map(el => el.pathKey.split(delim)); // Array mit den pathKey-Arrays aus dem AttrPath extrahieren
  let flatPa = pathArrFlat(pathArr, fromTop, joinStr);  // pathArr zunächst 1 Ebene flatten
  // ggf. weitere Aufrufe von pathArrFlat
  while (depth == 0 || (depth-- > 1)) { // flat complete
    flatPa = pathArrFlat(pathArr, joinStr);
    let isFlat = flatPa.findIndex(el => el.length!==1) === -1;
    if (isFlat) depth = 1;  // keine weiteren Aufrufe
  };
  // geflattetes pathArr (flatPa) in flatAttrPath reinjizieren
  flatPa.forEach((el, ix) => flatAttrPath[ix].pathKey = el.join(delim));  // geänderte pathKeys zurückwandeln in Strings und in den AttrPath zurückschreiben
  return flatAttrPath;
};
const attrPathFromObj = (obj = {}, delimin = '"]["', pathKey = "", attrPath = []) => { //  erstellt Array mit pathKeys, val (attrPath) von obj
  if (pathKey == "") attrPath = []; // Ergebnis-Array Zeichen für 1. Objektebene
  let pathObj;
  let keys = Object.keys(obj);
  keys.forEach(key => {
    if (pathKey == "") delim = "";
    else delim = delimin;
    attrPath.push({
      pathKey: pathKey + delim + key,
      val: obj[key]
    });
    // rekursiv
    if (Object.isObject(obj[key])) {
      attrPath = attrPathFromObj(obj[key], delimin, pathKey + delim + key, Array.from(attrPath));
    }
  });
  return attrPath;
};
class ObjPath { // früher AttrPath, Vorteil: kas kann unabhängig von den val in pkvs bearbeitet werden und dann ein neues pkvs erzeugt werden (pkvsVonKas()) 
  constructor(obj = {}, delimin = '"]["', pathKey = "", objPath = []) { //  erstellt Array mit pathKeys, val (objPath) von obj
    if (pathKey == "") objPath = []; // Ergebnis-Array Zeichen für 1. Objektebene
    let pathObj;
    let keys = Object.keys(obj);
    keys.forEach(key => {
      if (pathKey == "") delim = "";
      else delim = delimin;
      objPath.push({
        pathKey: pathKey + delim + key,
        val: obj[key]
      });
      // rekursiv
      if (Object.isObject(obj[key])) {
        objPath = new ObjPath(obj[key], delimin, pathKey + delim + key, Array.from(objPath)).pkvs;
      }
    });
    this.pkvs = objPath; // pkvs = pathKeyValues (früher: attrPath) = [ {pathKey:, val:}, {pathKey:, val:}, ...];  pathKey = pathKeyStr
    this.kas = this.kasVonPkvs(delimin);  // kas = keyArrays (früher: pathArr) = [[pathKeyArr1], [pathKeyArr2], ...]
  };
  kasVonPkvs(delim = '"]["') {
    return this.pkvs.map(el => el.pathKey.split(delim)); // Array mit den pathKey-Arrays aus dem objPath extrahieren
  };
  pkvsVonKas(delim = '"]["') {
    this.kas.forEach((el, ix) => this.pkvs[ix].pathKey = el.join(delim));  // geänderte pathKeys zurückwandeln in Strings und in den AttrPath zurückschreiben
    return this.pkvs;
  };
  kasFlat(depth = 0, fromTop = true, joinStr = "--") { // flatted die PathKeys des this.kas komplett (depth=0) oder um depth Ebenen
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
  pkvsFlat(depth = 0, fromTop = false, joinStr = "--", delim = '"]["') {
    this.kas = this.kasVonPkvs(delim);  // zunächst kas aktualisieren und flatten
    this.kas = this.kasFlat(depth, fromTop, joinStr);
    this.pkvs = this.pkvsVonKas(delim);
    return this.pkvs;
  };
  obj(delim = '"]["') { // erstellt zugehöriges Objekt
    const obj = {};
    let uoAttrPath = [];
    let ebenenPkvs = this.pkvs.filter(pa => pa.pathKey.indexOf(delim) === -1); // nur die erste Ebene, deren pathKey kein delim enthält
    ebenenPkvs.forEach(pa => {
      if (Object.isObject(pa.val)) {
        uoAttrPath = this.pkvs.filter(upa => upa.pathKey.startsWith(pa.pathKey + delim));
        uoAttrPath = uoAttrPath.map(pa => ({
          pathKey: pa.pathKey.split(delim).slice(1).join(delim),  // 1. Ebene vom pathKey entfernen
          val: pa.val
        }));
        obj[pa.pathKey] = this.obj(delim); // Objekt rekursiv zuordnen
      } else obj[pa.pathKey] = pa.val; // bei Nicht-Objekt als Wert wird dieser dem Kex zugewiesen
    });
    return obj;
  };
  subPkvs(pathKey, fromStart, delim = '"]["') {
    if (fromStart !== true && fromStart !== false) fromStart = null;
    switch (fromStart) {
      case true: // pathKey am Anfang (benötigt delim)
        return this.pkvs.filter(pkv => pkv.pathKey.startsWith(pathKey + delim));
        break;
      case false: // pathKey am Ende (benötigt delim)
        return this.pkvs.filter(pkv => pkv.pathKey.endsWith(delim + pathKey));
        break;
      default:  // pathKey überhaupt enthalten
        return this.pkvs.filter(pkv => pkv.pathKey.indexOf(pathKey)!==-1);
    }
  };
  pkvNorm(pkvs) {
    // !!! normieren
  }
};
class PathKeyVal {
  constructor(pathKey, val) {
    this.pathKey = pathKey;
    this.val = val;
  }
};
const objFromAttrPath = (attrPath, delim = '"]["') => { // 
  const obj = {};
  let uoAttrPath = [];
  let ebenenAttr = attrPath.filter(pa => pa.pathKey.indexOf(delim) === -1); // nur die erste Ebene, deren pathKey kein delim enthält
  ebenenAttr.forEach(pa => {
    if (Object.isObject(pa.val)) {
      uoAttrPath = attrPath.filter(upa => upa.pathKey.startsWith(pa.pathKey + delim));
      uoAttrPath = uoAttrPath.map(pa => ({
        pathKey: pa.pathKey.split(delim).slice(1).join(delim),  // 1. Ebene vom pathKey entfernen
        val: pa.val
      }));
      obj[pa.pathKey] = objFromAttrPath(uoAttrPath); // Objekt rekursiv zuordnen
    } else obj[pa.pathKey] = pa.val; // bei Nicht-Objekt als Wert wird dieser dem Kex zugewiesen
  });
  return obj;
};

// PropAttr
class PropAttr {  // (pathKey, val, attrInd), Attribute der Property (key) eines Objekts
  constructor(pathKey, val, attrInd) {
    this.pathKey = pathKey; // Pfad bis zum key als Objekt-eindeutiger key 
    this.val = val;
    let pathArr = pathKey.split(delim);
    this.key = pathArr[pathArr.length - 1];
    this.parentKey = pathArr[pathArr.length - 2] || ""; // falls delim = "";
    this.attrInd = attrInd; // Index im Array der Keys des Objekts
    this.objEbene = pathArr.length - 1; // Ebene im Objekt (0=Objekt)
  }
}
const objPropAttr = (obj, objPathKey) => { // erstellt Array mit PropAttr der 1. Ebene von obj
  let i = 0;
  let keys = Object.keys(obj);
  let objKeys = keys.map((key) => {
    // (pathKey, val, attrInd)
    return new PropAttr(objPathKey + delim + key, obj[key], i++)
  });
  return objKeys;
};
const objpath = (obj = {}) => {  // liefert ein Array aller Unterobjekte (unterobj, objPathKey, propAttr) (shallow)
  let objPath = [];
  let nextEbenenObjects = [];
  let nextUnterObjects = []; // Array mit den Kind-Objekten
  let nextObjKeys = []; // Keys der Kind-Objekte zum aktuelle Unterobjekt
  let aktObj; // aktuelles Unterobjekt
  let i = 0;  // Anzahl Objekt-Ebenen
  let aktEbenenObjects = [{   // Ebenen-Array startetmit root-Objekt als einzigem Unterobjekt
    "objPathKey": '', // PathKey (z.B. Obj;Attr1;Attr2) des Eltern-Objektes
    "unterobj": obj, // Unterobjekt in dieser Ebene des Hauptobjekts
    "propAttr": [] // Array mit zu berechneten PropAttr-Objekte zum Unterobjekt
  }];
  while (aktEbenenObjects.length > 0 && i < 20) {
    (i === 0) ? delim = '' : delim = '"]["';
    // console.log("aktEbenenObjects.objPathKey", aktEbenenObjects.map(obj=>obj.objPathKey));
    nextEbenenObjects = []; // wird geleert, um das Ergebnis dieser Schleife zu speichern
    aktEbenenObjects.forEach((uo) => { // Unterobjekte der Ebene durchlaufen
      aktObj = uo["unterobj"];
      uo["propAttr"] = objPropAttr(aktObj, uo["objPathKey"])  // neues Objekt-Array definieren und daraus Ebenen-Array der nächsten Ebene machen
      // Unterobjekt-Keys finden die weitere Unterobjekte enthalten
      nextObjKeys = Object.keys(aktObj).filter(key => Object.isObject(aktObj[key])); // Objekt-Keys der nächsten Ebene des aktuellen Objects
      // console.log(nextObjKeys);
      if (nextObjKeys.length > 0) { // falls es Unterobjekte zum aktuellen Objekt gibt
        nextUnterObjects = nextObjKeys.map((key) => ({ // keys durch Objekte austauschen
          "objPathKey": uo.objPathKey + delim + key,
          "unterobj": aktObj[key],
          "propAttr": [] // wird im nächsten Zyklus befüllt
        }));
        nextEbenenObjects.push(...nextUnterObjects);
      }
      i++;
    });
    objPath.push(...aktEbenenObjects);
    aktEbenenObjects = nextEbenenObjects;
  }
  return objPath;
};
const propAttrFromObj = (obj) => {  // liefert ein Array aller(!) PropAttr von obj
  let objPath = objpath(obj);
  return Array.prototype.flat(objPath.map(ob => ob.propAttr));
};
const objFromPropAttrAlt = (propAttrArr) => { // tiefer Objektaufbau vom Array mit PropAttr (pathKey, val) über eval, benötigt Objectpath mit delim = '"]["' 
  const obj = {};
  // alle Keys im neuen Objekt von oben nach unten erzeugen, erzeugt leere Objekte
  propAttrArr.forEach(pa => {
    if (Object.isObject(pa.val) === true) eval('obj["' + pa.pathKey + '"] = {}') // beim Objekt als Wert wird ein leeres Objekt erzeugt
    else eval('obj["' + pa.pathKey + '"] = ' + pa.val); // bei Nicht-Objekt als Wert wird dieser dem Kex zugewiesen
  });
  return obj;
};
const objFromPropAttr = (propAttrArr) => { // tiefer Objektaufbau vom Array mit PropAttr {pathKey:, val:} ohne eval mit delim = '"]["'
  const obj = {};
  let key;  // aktueller key des Attributs
  let pathArr;  // in Array aufgeteilter key-Pfad
  let uoPropAttr = [];  // Teil-Array von propAttrArr, der sich aus des Unterobjekt bezieht
  let startEbene = Math.min(...propAttrArr.map(pa => pa.objEbene)); // Start mit der höchsten Ebene (niedrigster Index)
  let ebenenAttr = propAttrArr.filter(pa => pa.objEbene === startEbene).sort((a, b) => a.attrInd - b.attrInd);
  // alle Keys im neuen Objekt in der Reihenfolge des attrInd durchlaufen
  ebenenAttr.forEach(pa => {
    pathArr = pa.pathKey.split(delim);
    key = pathArr[pathArr.length - 1];
    if (Object.isObject(pa.val)) {
      uoPropAttr = propAttrArr.filter(upa => upa.pathKey.startsWith(pa.pathKey + delim));

      obj[key] = objFromPropAttr(uoPropAttr) // beim Objekt wird rekursiv die aktuelle Funktion aufgerufen
    }
    else obj[key] = pa.val; // bei Nicht-Objekt als Wert wird dieser dem Kex zugewiesen
  });
  return obj;
};
const objFromPath = (objPath) => { // tiefer Objektaufbau vom ObjectPath mit delim = '"]["' 
  const propAttrArr = Array.prototype.flat(objPath.map(obj => obj.propAttr));  // alle(!) PropAttr
  const obj = objFromPropAttr(propAttrArr);
  return obj;
};

// clone
const cloneobjpath = (obj) => { // tiefe Objektkopie, benötigt objectpath mit delim = '"]["' 
  console.log("- cloneobjpath -");
  const objPath = objpath(obj); // Pathkeys aller Unterobjekte
  const copy = objFromPath(objPath);
  return copy;
};
const clonestringify = (obj) => {  // tiefe, einfache Objektkopie, es dürfen aber keine Funktionen im Objekt enthalte sein
  return JSON.parse(JSON.stringify(obj));
};
const cloneinstance = (obj) => { // tiefe rekursive Objektkopie, aus https://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object/30042948#30042948
  var copy;
  
  // Handle the 3 simple types, and null or undefined
  if (null == obj || "object" != typeof obj) return obj;
  
  // Handle Date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    copy = [];
    for (var i = 0, len = obj.length; i < len; i++) {
      copy[i] = cloneinstance(obj[i]);
    }
    return copy;
  }
  
  // Handle Object
  if (obj instanceof Object) {
    copy = {};
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = cloneinstance(obj[attr]);
    }
    return copy;
  }
  
  throw new Error("Unable to copy obj! Its type isn't supported.");
};
const cloneass = (obj) => {  // einfachste flache Objektkopie, Kopie ist nicht unabhängig!
  return Object.assign({}, obj);
};
const cloneproto = (obj) => {  // Objekt klonen aus fs.js, Kopie ist nicht unabhängig!
  if (obj === null || typeof obj !== 'object')
  return obj;
  if (obj instanceof Object)
  var copy = { __proto__: obj.__proto__ };
  else
  var copy = Object.create(null);
  Object.getOwnPropertyNames(obj).forEach(function (key) {
    Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key))
  })
  return copy;
};

// Check
const objequal = (obj, copy) => {
  console.log("- objequal -");
  console.log("obj", obj);
  console.log("cop", copy);
  console.log("is: ", Object.is(obj, copy));  // immer falsch außer evtl. Identität
  console.log("==: ", obj == copy);  // immer falsch außer evtl. Identität
  console.log("Js: ", JSON.stringify(obj) == JSON.stringify(copy));
  let opk = objpath(obj).map(o => o.objPathKey);
  let cpk = objpath(copy).map(o => o.objPathKey);
  console.log("ops: ", JSON.stringify(opk) == JSON.stringify(cpk)); // ObjectPathString
  console.log("oe: ", objequals(obj, copy));
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
  let pk2 = op.subPkvs("d", true);
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
  const a0 = [ "a", 1, "b", 2 ];
  const a1 = [ "a", 1, "b", [ "e", 5 ] ];
  const a2 = [ "d", [ "g", [ "i", ["j", 7] ], "h", 6 ], "e", [ "i", 8 ] ]; // "c", [ "f", 5 ],
  const a3 = [ ...a1, ...a2 ];

  console.log("a",a2);
  
  flat = Array.prototype.flat(a2);
  console.log("flat",flat);
  
};
const check3 = () => {
  let strArr = ["bcdefg", "bcdefg", "bcdefg", "bcde"];
  let sub = commonString(strArr);
  console.log(strArr);
  console.log(sub);
};
const check4 = () => {
  let s1 = "bcebhjf";
  let s2 = "abcdebjf";
  let st = schnittix(s1, s2);
  console.log(st);
};
const spliceTest = () => {
  let a1 = [1, 2, 3, 4];
  console.log(a1);
  let rem = a1.splice(2, 1)
  console.log(a1, ": rem", rem);
};
check4();

module.exports = { 
  objpath, 
  objPropAttr, 
  PropAttr, 
  objFromPropAttr,
  cloneobjpath,
  cloneinstance  
};
