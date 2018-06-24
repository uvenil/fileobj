// PropAttr wurden ersetzt durch die ObjPath-Klasse
// veraltet da zum Teil redundant, aber funktionieren

const { objequals } = require('./../module/objequals');

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
const isObject = (testObj) => {
  return (typeof testObj === "object" && !Array.isArray(testObj) && !!Object.keys(testObj)[0]);
};

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
    if (isObject(obj[key])) {
      attrPath = attrPathFromObj(obj[key], delimin, pathKey + delim + key, Array.from(attrPath));
    }
  });
  return attrPath;
};
const objFromAttrPath = (attrPath, delim = '"]["') => { // 
  const obj = {};
  let uoAttrPath = [];
  let ebenenAttr = attrPath.filter(pa => pa.pathKey.indexOf(delim) === -1); // nur die erste Ebene, deren pathKey kein delim enthält
  ebenenAttr.forEach(pa => {
    if (isObject(pa.val)) {
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
class PathKeyVal {
  constructor(pathKey, val) {
    this.pathKey = pathKey;
    this.val = val;
  }
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
      nextObjKeys = Object.keys(aktObj).filter(key => isObject(aktObj[key])); // Objekt-Keys der nächsten Ebene des aktuellen Objects
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
    if (isObject(pa.val) === true) eval('obj["' + pa.pathKey + '"] = {}') // beim Objekt als Wert wird ein leeres Objekt erzeugt
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
    if (isObject(pa.val)) {
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
const o1 = { "a": 1, "b": { "e": 5 } };
objequal(o1, o1);

module.exports = { objpath, objFromPath, objPropAttr, PropAttr, objFromPropAttr };
