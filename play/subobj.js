const o0 = { "a": 1, "b": 2 };
const o1 = { "a": 1, "b": { "e": 5 } };
const o2 = { "c": { "f": 5 }, "d": { "g": { "i": 7 }, "h": 6 }, "e": { "i": 8 } };
let o3 = {...o1, ...o2};
const delim = ";"
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
Array.prototype.flatcomplete = (nestedArr = [[]]) => {
  let i = 0;
  let flatArr = Array.from(nestedArr);
  let flat = false;
  while (!flat && i++<20) {
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
Object.prototype.flatte = (obj = {}, ebenen = 1, stringLength = 20) => { // fasst die erste und zweite Keys zusammen
  // let flatObj = clone(obj);
  let outKey, inKey;
  while (ebenen > 0) { 
    for (outKey in flatObj) {
      if (Object.isObject(flatObj[outKey])) {
        for (inKey in flatObj[outKey]) {
          
          if (Object.isObject(flatObj[outKey][inKey])) {
            console.log("io",flatObj[outKey][inKey]);
            
            
            if (flatObj["b"]) {
              // delete flatObj["b"];
              delete flatObj.d.h;
              // delete flatObj[outKey][inKey];
              console.log("f", flatObj);
              console.log("o", obj);
            }
          
            
            flatObj[outKey.slice(0, stringLength - 1) + delim + inKey] = {...flatObj[outKey][inKey]};
            delete flatObj[outKey][inKey];
          }
        }
      }
    }
    ebenen--;
  }
  return flatObj;
};
const isPrimitve = (testPrim) => {
  if (testPrim === null || testPrim === undefined) return true;
  return (!Array.isArray(testPrim) && !Object.isObject(testPrim));
};
class PropAttr {  // (pathKey, val, levelInd), Attribute der Property (key) eines Objekts
  constructor(pathKey, val, levelInd) {
    this.pathKey = pathKey; // Pfad bis zum key als Objekt-eindeutiger key 
    this.val = val;
    let pathArr = pathKey.split(delim);
    this.key = pathArr[pathArr.length-1];
    this.levelInd = levelInd; // Index im Array der Keys des Objekts
    this.objLevel = pathArr.length - 1; // Ebene im Objekt (0=Objekt)
    this.parentKey = pathArr[pathArr.length - 2];
  }
}
const objPropAttr = (obj, objPathKey) => { // erstellt Array mit PropAttr von obj
  let i = 0;
  let keys = Object.keys(obj);
  let objKeys = keys.map((key) => {
    // (pathKey, val, levelInd)
    return new PropAttr(objPathKey + delim + key, obj[key], i++)
  });
  return objKeys;
};
const objpath = (obj = {}, objName = "Obj") => {  // liefert ein Array aller Unterobjekte (unterobj, objPathKey, propAttr) (shallow)
  let objPath = [];
  let nextEbenenObjects = [];
  let nextUnterObjects = []; // Array mit den Kind-Objekten
  let nextObjKeys = []; // Keys der Kind-Objekte zum aktuelle Unterobjekt
  let aktObj; // aktuelles Unterobjekt
  let i = 0;
  let aktEbenenObjects = [{   // Ebenen-Array startetmit root-Objekt als einzigem Unterobjekt
    "objPathKey": objName, // PathKey (z.B. Obj;Attr1;Attr2) des Eltern-Objektes
    "unterobj": obj, // Unterobjekt in dieser Ebene des Hauptobjekts
    "propAttr": [] // Array mit zu berechneten PropAttr-Objekte zum Unterobjekt
  }];
  while (aktEbenenObjects.length>0 && i++<20) {
    console.log("aktEbenenObjects.objPathKey", aktEbenenObjects.map(obj=>obj.objPathKey));
    nextEbenenObjects = [];
    aktEbenenObjects.forEach((uo) => { // Unterobjekte der Ebene durchlaufen
      aktObj = uo["unterobj"];
      uo["propAttr"] = objPropAttr(aktObj, uo["objPathKey"])  // neues Objekt-Array definieren und daraus Ebenen-Array der nächsten Ebene machen
      // Unterobjekt-Keys finden die weitere Unterobjekte enthalten
      nextObjKeys = Object.keys(aktObj).filter(key => Object.isObject(aktObj[key])); // Objekt-Keys der nächsten Ebene des aktuellen Objects
      // console.log(nextObjKeys);
      if (nextObjKeys.length>0) { // falls es Unterobjekte zum aktuellen Objekt gibt
        nextUnterObjects = nextObjKeys.map((key) => ({ // keys durch Objekte austauschen
          "objPathKey": uo.objPathKey+delim+key,
          "unterobj": aktObj[key],
          "propAttr": [] // wird im nächsten Zyklus befüllt
        }) );
        nextEbenenObjects.push(...nextUnterObjects);
      }
    });
    objPath.push(...aktEbenenObjects);
    aktEbenenObjects = nextEbenenObjects;
  }
  return objPath;
};
// ToDo: Subobjekt nach oben holen und in Excel darstellen!
const keysdeep = (obj) => {  // liefert ein Array aller keys (deep)
  let pfad = [];  // aktueller pfad
  let keys = [];  // sammelt alle keys
  let k1 = Object.keys(obj);
  // let ok1 = k1.filter()

  let k2 = keys.find(key => Object.keys(obj[key][0])); // 
  if (k) return obj[k];
};
const subobjekte = (obj) => { // Array der Objekte der 2. Ebene, [] falls keine vorhanden
  let objkeys = Object.keys(obj).filter(el => Object.keys(obj[el])[0]); // nur keys, deren Werte Objekte sind
  console.log(objkeys);
  let objarr = objkeys.map(el => obj[el]);  // keys durch Objekte austauschen
  return objarr;
};
const keyfind = (obj, key) => { // liefert den ersten passenden Key in den Attributen der ersten Ebene oder false, falsch keiner gefunden wird
  let keys = Object.keys(obj).filter(el => el === key);
  if (keys[0]) return keys[0];
  else return false;
};
const keyfindArr = (objarr, key) => { // liefert aus dem Objektarray den ersten passenden Key in den Attributen der ersten Ebene oder false, falsch keiner gefunden wird
  let k = false;
  let obj = objarr.find((obj, ind) => k = keyfind(obj, key));
  return ind; // gefundener Index
};
const objdive = () => {

};
const keyfindAll = (obj, key) => { // liefert den ersten passenden Key oder false, falsch keiner gefunden wird
  let k = keyfind(obj, key);
  if (k) return k;
  Object.keys(obj).forEach(el => {
    let k2 = Object.keys(obj[el]);
    if (k2) {
      let k = keyfind(obj[el], key);
      if (k) return k;
    }
    if (typeof obj[el] === "object" && !obj[el][0]) { }
  });
};
// let path = objpath(o3);
// console.log("o3", o3);
// console.log("path", path);

o3 = [1, [2, [5, [[7],8], 3], 9], 4];
let flat = Array.prototype.flatcomplete(o3);
console.log("o3", o3);
console.log("flat", flat);


module.exports = { objpath };

// alter Code
  // let paArr = ["key", "par", 2, 0, "obj.par.key", 3];
  // let pa = new PropAttr(...paArr);
  // console.log("oa", isPrimitve({"a":2}));
  // console.log("oa", Object.isObject(oa));
  // console.log("p",o2["f"]);
  // 
  // 
  // export default class ExpenseForm extends React.Component {
  //   constructor(props) {
  //     super(props);
  //     this.state = {
  //     };
  //   }
  //   onDescriptionChange = (e) => {
  //   };
  // }

  // const subobj = (obj, key) => { // einfachere Alternative: return obj[key]
  //   let k = Object.keys(obj).find(el => el === key)
  //   if (k) return obj[k];
  //   else return undefined;
  // };

  // const subobjAlt = (obj, key) => {
  //   k = Object.keys(obj).filter(el => el === key)
  //   let subobj = obj[k[0]];
  //   if (subobj) return subobj;
  //   else return false;
  // };

