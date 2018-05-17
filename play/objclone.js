const { objpath } = require('./subobj');
const { objequals } = require('./objequals');
const o0 = { "a": 1, "b": 2 };
const o1 = { "a": 1, "b": { "e": 5 } };
const o2 = { "d": { "g": { "i": 7 }, "h": 6 }, "e": { "i": 8 } }; // "c": { "f": 5 },
const o3 = { ...o1, ...o2 };
const delim = '"]["';

const objequaltests = (obj, copy) => {
  console.log("- objequaltests -");
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
const objFromPropAttr = (propAttrArr) => { // tiefer Objektaufbau vom Array mit PropAttr (pathKey, val) über eval, benötigt Objectpath mit delim = '"]["' 
  const obj = {};
  // alle Keys im neuen Objekt von oben nach unten erzeugen, erzeugt leere Objekte
  propAttrArr.forEach(pa => {
    if (Object.isObject(pa.val) === true) eval('obj["' + pa.pathKey + '"] = {}') // beim Objekt als Wert wird ein leeres Objekt erzeugt
    else eval('obj["' + pa.pathKey + '"] = ' + pa.val); // bei Nicht-Objekt als Wert wird dieser dem Kex zugewiesen
  });
  return obj;
};
const objFromPath = (objPath) => { // tiefer Objektaufbau vom ObjectPath über eval, benötigt Objectpath mit delim = '"]["' 
  const propAttrArr = Array.prototype.flat(objPath.map(obj => obj.propAttr));  // alle(!) PropAttr
  const obj = objFromPropAttr(propAttrArr);
  return obj;
};
const cloneobjpath = (obj) => { // tiefe Objektkopie über eval, benötigt Objectpath mit delim = '"]["' 
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
let copy = cloneobjpath(o3);
objequaltests(o3, copy);
delete copy.d.g;
objequaltests(o3, copy);
