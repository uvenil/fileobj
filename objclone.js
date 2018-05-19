const { objequals } = require('./module/objequals');
console.log("--- objclone ---");

let delim = '"]["';

// Klassenmethoden (static)
Array.prototype.flatten = (nestedArr = [[]], depth = 1) => {
  let flatArr = Array.from(nestedArr);
  while (depth-- > 0) {
    nestedCopy = Array.from(flatArr);
    flatArr = [];
    nestedCopy.forEach(el => {
      if (Array.isArray(el)) {
        el.forEach(uel => flatArr.push(uel))
      } else {
        flatArr.push(el)
      }
    });
  }
  return flatArr;
};
Array.prototype.flat = (nestedArr = [[]]) => {
  let i = 0;
  let flatArr = Array.from(nestedArr);
  let flat = false;
  while (!flat && i++ < 20) {
    flat = true;
    nestedCopy = Array.from(flatArr);
    flatArr = [];
    nestedCopy.forEach(el => {
      if (Array.isArray(el)) {  // es gibt noch eine Verschachtelung
        if (flat) flat = false;
        el.forEach(uel => flatArr.push(uel))
      } else {
        flatArr.push(el)
      }
    });
  }
  return flatArr;
};
Object.prototype.isObject = (testObj) => {
  return (typeof testObj === "object" && !Array.isArray(testObj) && !!Object.keys(testObj)[0]);
};

// attrPath
const attrPathFromObj = (obj = {}, delimin = '"]["', pathKey = "", attrPath = []) => { //  erstellt Array mit pathKeys von obj
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
    if (Object.isObject(obj[key])) {
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
// ToDo: 
// Subobjekt nach oben holen und in Excel darstellen!!!
// gute Funktionen in Module zusammenfassen
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

// T
const objequal = (obj, copy) => {
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
const objequalcheck = () => {
  console.log("- objequalcheck -");
  const o0 = { "a": 1, "b": 2 };
  const o1 = { "a": 1, "b": { "e": 5 } };
  const o2 = { "d": { "g": { "i": 7 }, "h": 6 }, "e": { "i": 8 } }; // "c": { "f": 5 },
  const o3 = { ...o1, ...o2 };

  console.log("o3",o3);
  let ap = attrPathFromObj(o3);
  let copy = objFromAttrPath(ap);
  // console.log("ap", ap);
  console.log("co", copy);
  
  // let copy = cloneobjpath(o3);
  objequal(o3, copy);
  delete copy.d.g;
  objequal(o3, copy);
};
objequalcheck();

module.exports = { 
  objpath, 
  objPropAttr, 
  PropAttr, 
  objFromPropAttr,
  cloneobjpath,
  cloneinstance  
};
