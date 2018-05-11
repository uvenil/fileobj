const fs = require('fs-extra');
const path = require('path');
const { promisify } = require('util');

const readDir = require('./readdir');
// const el = (v) => { console.log(`-> ${v}: ${eval(v)}`); }; // Eval-Logger Kurzform, Aufruf: el("v"); v = zu loggende Variable

const aktFile = path.basename(__filename);
console.log(`>--- ${aktFile} ---<`);
const readDirAsync = promisify(readDir);
const filePath = process.argv[2];
const ord = "/home/micha/Schreibtisch/moduleMA";
const exclOrdner = ["node_modules"];  // nicht verwendete Ordner 
const inclDateien = ["package.json"]; // gesuchte Dateinamen

const flist = async (dir) => { // liest alle Dateipfade aus dem Ordner dir und seinen Unterordnern 
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
const readArr = async (fileArr) => {  // liest JSON-Objekt-Array aus Dateipfad-Array
  let objRead = {};
  try{
    let objArr = await Promise.all(fileArr.map(async (file) => {
      objRead = await fs.readJson(file);
      console.log("read:", objRead.name);
      return objRead;
    }));
    console.log('success!');
    return objArr;
  }catch(error){
    console.error('error', error);
  }
};
const keyArr = (arr, keys) => {  // erstellt aus einem Array und ein Attribut-Array ein Objekt
  let obj = {};
  let i = 0;
  keys.forEach((key) => {
    obj[new String(key)] = arr[i++] || null;
  });
  if (arr.length>keys.length) {
    obj["restarray"] = arr.slice(keys.length, arr.length);
  }  
  return obj;
};
const jsonAusOrdner = async (ordner = ord) => {  // bestimmte json-Dateien aus ordner und Unterordnern herauslesen 
  flist(ordner).then((fl) => { // fl = filelist
    let filtEx = filterEx(fl, exclOrdner);
    let filtIn = filterIn(filtEx, inclDateien);
    let indArr = filtIn.map((el) => el.replace(ordner, ""));
    console.log(indArr);
    
    return readArr(filtIn);
  }).then((objArr) => {
    // console.log(filtIn);
    console.log(objArr[2]);
  }).catch((error) => {
    console.error('error', error);
  });
};
let a1 = [2];
let k1 = [1,2];
let res = keyArr(a1, k1);
console.log(res);

// jsonAusOrdner(ord);
  // filtIn.forEach((el) => {
  //   console.log(`${path.dirname(el)}: ${path.basename(el)},`);
  // })
// .catch((err)=>console.log(err));

// await fs.writeJson('./pack1.json', { ...packObj, name: 'fs-extra', micha: 'lieb!' })
