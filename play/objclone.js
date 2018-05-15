const { objpath } = require('./subobj');
const o0 = { "a": 1, "b": 2 };
const o1 = { "a": 1, "b": { "e": 5 } };
const o2 = { "c": { "f": 5 }, "d": { "g": { "i": 7 }, "h": 6 }, "e": { "i": 8 } };
const o3 = { ...o1, ...o2 };
const delim = ";"

const cloneobjpath = (obj) => {
  const objPath = objpath(obj);
  let copy = {};
  objPath.forEach(uo => {
    if (Object.isObject(uo.unterobj)) {

    } else {

    }
  });

  // let copy = Object.assign({}, obj);
  return objPath;
}; // hier vernünftige Objectkopie tief mit Unterobjekten,  evtl. mit objpath !!!
const clonehelper= (uo) => {
  if (Object.isObject(uo.unterobj)) {
   
  } else {
    objPathKey.split(delim);
  }

};
const clonestringify = (obj) => {  // tiefe, einfache Objektkopie, es dürfen aber keine Funktionen im Objekt enthalte sein
  return JSON.parse(JSON.stringify(obj));
};
const clonecreate = (obj) => {  // funktioniert nicht!!!, Object.create erwartet einen Prototyp [o = {}; is equivalent to: o = Object.create(Object.prototype);]
  // class Copy {
  //   constructor() {
  //     obj.prototype.constructor.call(this);
  //   }
  // }
  // console.log(obj);
  // console.log(typeof obj);
  // console.log(obj.prototype.__proto__);
  
  // Copy.prototype = Object.create(obj.prototype);
  // Copy.prototype.constructor = Copy;
  // return new Copy;
  return Object.create(obj.prototype);
};
const cloneinstance = (obj) => { // tiefe Objektkopie, aus https://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object/30042948#30042948
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
      copy[i] = clone(obj[i]);
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
const cloneass = (obj) => {  // einfachste flache Objektkopie
  return Object.assign({}, obj);
};
const cloneproto = (obj) => {  // Objekt klonen aus fs.js
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
console.log("o3", o3);
// delete copy.d.g;
console.log("co", copy.map(obj=>obj.propAttr).flatten());
// console.log("o3", o3);

