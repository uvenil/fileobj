console.log("objclone");
const { objpath, objFromPath } = require('./../play/PropAttr');

// assign
// aus: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
function completeAssign(target, ...sources) {// This is an assign function that copies full descriptors
  sources.forEach(source => {
    let descriptors = Object.keys(source).reduce((descriptors, key) => {
      descriptors[key] = Object.getOwnPropertyDescriptor(source, key);
      return descriptors;
    }, {});
    // by default, Object.assign copies enumerable Symbols too
    Object.getOwnPropertySymbols(source).forEach(sym => {
      let descriptor = Object.getOwnPropertyDescriptor(source, sym);
      if (descriptor.enumerable) {
        descriptors[sym] = descriptor;
      }
    });
    Object.defineProperties(target, descriptors);
  });
  return target;
}

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

// check
const o1 = { "a": 1, "b": { "e": 5 } };
const o2 = cloneobjpath(o1);
console.log(o1);
console.log(o2);

module.exports = { cloneobjpath, cloneinstance };
