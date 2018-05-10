const fs = require('fs-extra');
const path = require('path');
const { promisify } = require('util');

const readDir = require('./readdir');
// const el = (v) => { console.log(`-> ${v}: ${eval(v)}`); }; // Eval-Logger Kurzform, Aufruf: el("v"); v = zu loggende Variable

const aktFile = path.basename(__filename);
console.log(`>--- ${aktFile} ---<`);

const readDirAsync = promisify(readDir);
const filePath = process.argv[2];
const dir = "/home/micha/Schreibtisch/moduleMA";
const exclOrdner = ["node_modules"];  // nicht verwendete Ordner 
const inclDateien = ["package.json", "index.js"]; // gesuchte Dateinamen

flist = async () => {
    try {
      const fileList = await readDirAsync(dir);
      return fileList;
    }
    catch (err) {
      console.log('ERROR:', err);
    }
  }

const filterEx = (filtArr, exclArr) => {  // verwirft Pfade, in denen ein Element aus exclArr enthalten ist
  return [...filtArr].filter((el) => {
    let exclude = false;
    exclArr.forEach((suchEl) => {
      if (!exclude && el.search(suchEl) > -1) exclude = true;
    });
    return !exclude;
  });
};

const filterIn = (filtArr, inclArr) => { // zieht Pfade heraus, in denen ein Element aus inclArr enthalten ist
  return [...filtArr].filter((el) => {
    let include = false;
    inclArr.forEach((suchEl) => {
      if (!include) include = el.search(suchEl) > -1; // alternativ: if (!include) include = path.basename(el) === suchEl;
    });
    return include;
  });
};

flist().then((fl) => {
  let filtEx = filterEx(fl, exclOrdner);
  let filtIn = filterIn(filtEx, inclDateien);
  filtIn.forEach((el) => {
    console.log(`${path.dirname(el)}: ${path.basename(el)},`);
  })
})
.catch((err)=>console.log(err));
