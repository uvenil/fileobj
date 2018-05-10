const fs = require('fs-extra');
const { promisify } = require('util');
const path = require('path');

const readDir = require('./readdir');
// const el = (v) => { console.log(`-> ${v}: ${eval(v)}`); }; // Eval-Logger Kurzform, Aufruf: el("v"); v = zu loggende Variable

const aktFile = path.basename(__filename);
console.log(`>--- ${aktFile} ---<`);

const readDirAsync = promisify(readDir);
const filePath = process.argv[2];
const dir = "/home/micha/Schreibtisch/moduleMA";

async function main() {
    try {
      const fileList = await readDirAsync(dir);
      console.log("fileList[0]", fileList[0]);
    }
    catch (err) {
      console.log('ERROR:', err);
    }
  }

  main();
