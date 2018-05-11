var v1 = 'abc';
var v2 = true;
var v3 = 10;
var v4 = Symbol('foo');

// var obj = Object.create({ "g": 2, "h": [null, { "i": v2 }, undefined, v3, v4] }); // Object.create eher für Prototypen-Vererbung
var obj = Object.assign({"g":2, "h":[null, {"i":v2 }, undefined, v3, v4]});  // Object.assing zum Kopieren von Objekten
// var obj = Object.assign({}, v1, null, v2, undefined, v3, v4); 
// Primitives will be wrapped, null and undefined will be ignored.
// Note, only string wrappers can have own enumerable properties.
console.log(obj); // { "0": "a", "1": "b", "2": "c" }
