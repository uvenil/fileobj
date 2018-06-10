const { ObjPath, objwrap } = require("./../module/ObjPath.js");

const o1 = { "a": 1, "b": [6, { "e": 5 }, [1, 2]] };
const delim = '"]["';
const arraySolve = true;
const op = new ObjPath(o1, delim, arraySolve);

module.exports = { o1, op, delim };