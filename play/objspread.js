const o = {"a":1, "b": 2};
const s = { ...o, "c": 3 };
const t = { "c": 3, ...o };
console.log("s",s);
console.log("t",t);
