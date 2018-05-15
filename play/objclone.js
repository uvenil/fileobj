const deepclone = (obj) => {
  let clone = new Object();
  clone = Object.assign(clone, obj);
  return clone
}; // hier vernünftige Objectkopie tief mit Unterobjekten,  evtl. mit objpath !!!
const clone = (obj) => {
  return clone = Object.assign(clone, obj);
};
const clone2 = (obj) => {  // Objekt klonen aus fs.js
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
console.log("oa", oa);
let flat = Object.flatten(oa);
console.log("oa", oa);
console.log("flat", flat);

