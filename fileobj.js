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
const exklOrdner = ["node_modules"];  // nicht verwendete Ordner 
const suchDatei = ["package.json", "index.js"]; // gesuchte Dateinamen

flist = async () => {
    try {
      const fileList = await readDirAsync(dir);
      // console.log("fileList[0]", fileList[0]);
      // console.log("base", path.basename(fileList[0]));
      return fileList;
    }
    catch (err) {
      console.log('ERROR:', err);
    }
  }

flist().then((fl) => {

  let filtEx = [...fl];
  filtEx = filtEx.filter((el) => {
    
    let exclude = false;
    exklOrdner.forEach((suchEl) => {
      if (!exclude && el.search(suchEl)>-1) exclude = true;
    })
    return !exclude;
  });

  let filtIn = [...filtEx];
  filtIn = filtIn.filter((el) => {
    let include = false;
    suchDatei.forEach( (suchEl)=>{
      if (!include) include = path.basename(el)===suchEl;
    });
    return include;
  });

 filtIn.forEach((el) => {
    let name = path.basename(el);
    console.log(`${path.dirname(el)}: ${path.basename(el)},`);
  })

})
  .catch((err)=>console.log(err));
  ;
