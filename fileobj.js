console.log("test");

const fs = require('fs-extra');
const path = require('path');
const { promisify } = require('util');

const readDir = require('./readdir');

const readDirAsync = promisify(readDir);
const filePath = process.argv[2];
const dir = "/home/micha/Schreibtisch/moduleMA";
(() => {
  async function main() {
    try {
      const el = (v) => { console.log(`-> ${v}: ${eval(v)}`); }; // Eval-Logger Kurzform, Aufruf: el("v"); v = zu loggende Variable
      const fileList = await readDirAsync(dir);
      // console.log("fileList", fileList);
      el("fileList[0]");
    }
    catch (err) {
      console.log('ERROR:', err);
    }
  }

  main();

})();