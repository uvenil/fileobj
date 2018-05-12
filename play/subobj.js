const o0 = { "a": 1, "b": 2 };
const o1 = { "a": 1, "b": { "e": 5 } };
const o2 = { "c": { "f": 5 }, "d": { "g": 6, "h": { "i": 7 } } };
const oa = [o1, o2];
const delim = ";"
Object.prototype.isObject = (testObj) => {
  return (typeof testObj === "object" && !Array.isArray(testObj) && !!Object.keys(testObj)[0]);
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
const objPropAttr = (obj, parentPathKey) => { // erstellt Array mit PropAttr von obj
  let i = 0;
  let keys = Object.keys(obj);
  let objKeys = keys.map((key) => {
    // (pathKey, val, levelInd)
    return new PropAttr(parentPathKey + delim + key, obj[key], i++)
  });
  return objKeys;
};
const keysshallow = (obj = {}, objName = "Objekt") => {  // liefert ein Array aller keys (shallow)
  let objKeys = [];
  let levelKeys = [];
  // let objLevel = 0;  // Attribute der 1. Ebene
  // let levelInd = 0; // Index im Array der Keys der Ebene
  let objarr = [obj]; // aktuelles Objekt-Array
  let parentPathArr = [objName];
  let gesArr = [{   // Gesamt und Ergebnis-Array
    "o": obj,
    "parentPathArr": objName,
    "objKeys": []
  }];
  let i = 0;
  gesArr.forEach((o) => {
    o["objKeys"] = objPropAttr(o["o"], o["parentPathArr"])
  });
  objKeys.push(gesArr[0]["objKeys"]);
  console.log(objKeys);
  
  // let k2 = k1.forEach((v,i,a) => {
  //   Object.keys(obj[key][0]); // 
  // }
};
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
let p = keysshallow(o1, "o1");
// console.log(pa);

// let paArr = ["key", "par", 2, 0, "obj.par.key", 3];
// let pa = new PropAttr(...paArr);
// console.log("oa", isPrimitve({"a":2}));
// console.log("oa", Object.isObject(oa));
// console.log("p",o2["f"]);
// alter Code
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

