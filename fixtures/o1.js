const { ObjPath, objwrap } = require("./../module/ObjPath.js");

const o1 = { "a": 1, "b": [6, { "e": 5 }, [1, 2]] };
const o2 = { "d": { "g": { "i": 7 }, "h": 6 }, "e": { "i": 8 } }; // "c": { "f": 5 },
const delim = '"]["';
const arraySolve = true;
const op1 = new ObjPath(o1, delim, arraySolve);

module.exports = { o1, o2, op1, delim, arraySolve };