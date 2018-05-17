const { 
  objpath,
  objPropAttr,
  PropAttr,
  objFromPropAttr,
  cloneobjpath,
  cloneinstance 
} = require('./objclone');
console.log("--- subobj.js ---");


const o0 = { "a": 1, "b": 2 };
const o1 = { "a": 1, "b": { "e": 5 } };
const o2 = { "c": { "f": 5 }, "d": { "g": { "i": 7 }, "h": 6 }, "e": { "i": 8 } };
let o3 = {...o1, ...o2};


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
let path = subobjekte(o3);
console.log("o3", o3);
console.log("path", path);

