const { reststrs, schnittstr, schnitthits } = require('./schnittstr');
const { ObjPath, objwrap, objkaswrap, sortObject } = require("./ObjPath.js");

// Checks
const vars = () => ({
  "o0": { "a": 1, "b": 2 },
  "o1": { "a": 1, "b": [6, { "e": 5 }, [1, 2]] },
  "o2": { "d": { "g": { "i": 7 }, "h": 6 }, "e": { "i": 8 } }, // "c": { "f": 5 },
  // "o3" : { ...vars.o1, ...vars.o2 },
  "ka": ['b', '0', '1', 'c', '2'],
  "exclArr": ['g'],
  "inclArr": [''],
  "regExpr": false,
  "key": "b",
  "depth": 1,
  "fromTop": true,
});
const checkh = () => {
  console.log("- check -");
  const v = vars();
  o3 = { ...v.o1, ...v.o2 };
  const o = { "b": 2, "a": 1 };
  const os = sortObject(o);

  console.log("o", o);
  console.log("os", os);
};
const checkg = () => {
  console.log("- check -");
  const v = vars();
  o3 = { ...v.o1, ...v.o2 };
  const okeymove = objkaswrap("keyexchange");

  let o4 = okeymove(o3, true, "d", 1);
  console.log("o3", o3);
  console.log("o4", o4);
};
const checkf = () => {
  console.log("- check -");
  const v = vars();
  o3 = { ...v.o1, ...v.o2 };
  const okeymove = objwrap("pkeymove");

  let o4 = okeymove(o3, true, "e", -1);
  console.log("o3", o3);
  console.log("o4", o4);
};
const checke = () => {
  console.log("- check -");
  const v = vars();
  o3 = { ...v.o1, ...v.o2 };
  console.log("o3", o3);
  let op = new ObjPath(o3);
  console.log("op.kas", op.kas);
  // op.pkeymove = op.pkvswrap(op.keymove);
  console.log("op.pkvs", op.pkvs);
  op.subpkeymove = op.subwrap("pkeymove", v.exclArr, v.inclArr, v.regExpr);
  op.subpkeymove("d", 2);
  console.log("op.pkvs", op.pkvs);
  console.log("op.kas", op.kas);
};
const checkd = () => {
  console.log("- check -");
  const o0 = { "a": 1, "b": 2 };
  const o1 = { "a": 1, "b": [{ "e": 5 }, 6, [1, 2]] };
  const o2 = { "d": { "g": { "i": 7 }, "h": 6 }, "e": { "i": 8 } }; // "c": { "f": 5 },
  const o3 = { ...o1, ...o2 };
  const keys = ["e", "2"];
  const depth = 1;
  const fromTop = true;
  const joinStr = "--";
  let delim;

  console.log("o3", o3);
  let op1 = new ObjPath(o3);
  let op2 = new ObjPath(o3);
  let flat1 = op1.pkvsFlat(keys, depth, fromTop, joinStr);
  console.log("fl1", flat1);

  // op2.pkvsFlat2 = op2.pkvswrap(delim, op2.kasFlat, keys, depth, fromTop, joinStr);
  op2.pkvsFlat2 = op2.pkvswrap(op2.kasFlat, delim);

  let flat2 = op2.pkvsFlat2(keys, depth, fromTop, joinStr);
  // let flat3 = op2.pkvsFlat2(keys, depth, fromTop, joinStr);
  console.log("fl2", flat2);
  // console.log("fl3", op2.pkvs);

  // let flat = op.kasFlat("", 1, true, "-");
  // console.log("fl", flat);
  // console.log("op", op);
};
const checkc = () => {
  console.log("- check -");
  const v = vars();
  o3 = { ...v.o1, ...v.o2 };
  console.log("o3", o3);
  let op = new ObjPath(o3);
  let op2 = new ObjPath(o3);
  console.log("op", op2.pkvs);

  let sf = op.subFlat(v.exclArr, v.inclArr, v.key, v.depth, v.fromTop);
  console.log("sf", sf);
  op2.subFlat2 = op2.subwrap("pkvsFlat", v.exclArr, v.inclArr, v.regExpr);
  const sf2 = op2.subFlat2(v.key, v.depth, v.fromTop);
  // const sf2 = op2.subFlat(v.exclArr, v.inclArr, v.key, v.depth, v.fromTop);
  console.log("sf2", sf2);
  // console.log("op", op);
};
const checkb = () => {
  console.log("- check -");
  const o0 = { "a": 1, "b": 2 };
  const o1 = { "a": 1, "b": [{ "e": 5 }, 6, [1, 2]] };
  const o2 = { "d": { "g": { "i": 7 }, "h": 6 }, "e": { "i": 8 } }; // "c": { "f": 5 },
  const o3 = { ...o1, ...o2 };
  const ka = ['b', '0', '1', 'c', '2'];
  const exclArr = ["0"];
  const inclArr = ['2'];
  const depth = 1;
  const fromTop = true;

  console.log("o3", o3);
  let op = new ObjPath(o3);
  console.log("op", op);
  let kf = op.kasFlat('e', 0, true);
  console.log("kf", kf);
};
const checka = () => {
  console.log("- check -");
  const o0 = { "a": 1, "b": 2 };
  const o1 = { "a": 1, "b": [{ "e": 5 }, 6, [1, 2]] };
  const o2 = { "d": { "g": { "i": 7 }, "h": 6 }, "e": { "i": 8 } }; // "c": { "f": 5 },
  const o3 = { ...o1, ...o2 };
  const ka = ['b', '0', '1', 'c', '2'];
  const exclArr = ["0"];
  const inclArr = ['2'];
  const depth = 1;
  const fromTop = true;

  console.log("o3", o3);
  let op = new ObjPath(o3);
  console.log("op", op);

  console.log(ka);
  let kaf = op.kaFlat(ka, "", 3, false);
  console.log(kaf);
};
const check = () => {
  console.log("- check -");
  const o0 = { "a": 1, "b": 2 };
  const o1 = { "a": 1, "b": { "e": 5 } };
  const o2 = { "d": { "g": { "i": 7 }, "h": 6 }, "e": { "i": 8 } }; // "c": { "f": 5 },
  const o3 = { ...o1, ...o2 };

  console.log("o3", o3);
  let op = new ObjPath(o3);
  console.log("op", op);
  let pk2 = op.subObjPath("d", true);
  console.log("pk2", pk2);
  // let o4 = op.obj();
  // console.log("o4",o4);

  // let kf = op.kasFlat(1,false);
  // console.log("kf", kf);
  // let pkvs = op.pkvsVonKas();
  // console.log("pkvs", pkvs);
  // let kas = op.kasVonPkvs();
  // console.log("kas", kas);
  // let flat = attrPathFlat(op.pkvs, 1, false, "--");
  // console.log("fl", flat);

  // let copy = cloneobjpath(o3);
  // objequal(o3, copy);
  // delete copy.d.g;
  // objequal(o3, copy);
};
const check2 = () => {
  console.log("- check -");
  const a0 = ["a", 1, "b", 2];
  const a1 = ["a", 1, "b", ["e", 5]];
  const a2 = ["d", ["g", ["i", ["j", 7]], "h", 6], "e", ["i", 8]]; // "c", [ "f", 5 ],
  const a3 = [...a1, ...a2];

  console.log("a", a2);

  flat = Array.prototype.flat(a2);
  console.log("flat", flat);

};
const check3 = () => {
  let strArr = ["bcdefgcd", "xxcdx", "abcde", "bcdefgcde"];
  let sub = schnittstr(strArr);
  console.log(strArr);
  console.log(sub.foundArr);
};
const check4 = () => {
  let s1 = "bcdefgcd";
  let s2 = "xcdxx";
  let st = schnitthits(s1, s2, 2);
  console.log(st);
};
const check5 = () => {
  console.log("- check -");
  const o0 = { "a": 1, "b": 2 };
  const o1 = { "a": 1, "b": [{ "e": 5 }, 6, [1, 2]] };
  const o2 = { "d": { "g": { "i": 7 }, "h": 6 }, "e": { "i": 8 } }; // "c": { "f": 5 },
  const o3 = { ...o1, ...o2 };

  console.log("o3", o3);
  let op = new ObjPath(o3);
  console.log("op", op.pkvs);
  let sp = op.subObjPath('e', true);
  console.log("sp", sp);
  // let pn = sp.pkvNorm();
  // console.log("pn", pn);
  let so = sp.obj();
  console.log("so", so);
  let so2 = op.subObj('e', true);
  console.log("so2", so2);

  let pk2 = op.pkvObj({}, op.pkvs[2]);
  console.log("pk2", pk2);
};
const check6 = () => {
  let strArr = ["bcdefgcd", "decdx", "abcde", "bcdefgcde"];
  let sub = reststrs(strArr, true);
  console.log(strArr);
  console.log(sub);
};
const check7 = () => {
  console.log("- check -");
  const o0 = { "a": 1, "b": 2 };
  const o1 = { "a": 1, "b": { "e": 5 } };
  const o2 = { "d": { "g": { "i": 7 }, "h": 6 }, "e": { "i": 8 } }; // "c": { "f": 5 },
  const o3 = { ...o1, ...o2 };

  console.log("o3", o3);
  let op = new ObjPath(o3);
  console.log("op", op);
  let ob = op.obj();
  console.log("ob", ob);

  // let pk2 = op.subPkvs("d", true);
  // console.log("pk2", pk2);
};
const check8 = () => {
  console.log("- check -");
  const o0 = { "a": 1, "b": 2 };
  const o1 = { "a": 1, "b": { "e": 5 } };
  const o2 = { "d": { "g": { "i": 7 }, "h": 6 }, "e": { "i": 8 } }; // "c": { "f": 5 },
  const o3 = { ...o1, ...o2 };

  console.log("o3", o3);
  let op = new ObjPath(o3);
  console.log("op", op);
  // let kf = op.kasFlat(1,false);
  // console.log("kf", kf);
  // let pkvs = op.pkvsVonKas();
  // console.log("pkvs", pkvs);
  let flat2 = op.pkvsFlat("", 1, false, "--");
  console.log("fl2", flat2);
  let flat = op.kasFlat("", 1, true, "--");
  console.log("fl", flat);
  console.log("op", op);
};
const check9 = () => {
  console.log("- check -");
  const o0 = { "a": 1, "b": 2 };
  const o1 = { "a": 1, "b": { "e": 5 } };
  const o2 = { "d": { "g": { "i": 7 }, "h": 6 }, "e": { "i": 8 } }; // "c": { "f": 5 },
  const o3 = { ...o1, ...o2 };
  // const o3 = Object.assign(o1,o2);

  console.log("o1", o1);
  console.log("o2", o2);
  console.log("o3", o3);
  let op1 = new ObjPath(o1);
  const op2 = new ObjPath(o2);
  const opa = op1.assign(op2);
  console.log("op1", op1);
  console.log("op2", op2);
  console.log("opa", opa);
  const opao = opa.obj();
  console.log("opao", opao);
  console.log("o3", o3);
};
checkh();
