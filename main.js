// Importe
  'use strict'
  const fs = require('fs-extra');
  const path = require('path');
  const { promisify } = require('util');

  const readDir = require('./readdir');
  const objinout = require('./objinout');
  const { filterEx, filterIn, keyArrObj } = require('./arrayfkt');
  // const el = (v) => { console.log(`-> ${v}: ${eval(v)}`); }; // Eval-Logger Kurzform, Aufruf: el("v"); v = zu loggende Variable

  const aktFile = path.basename(__filename);
  console.log(`>--- ${aktFile} ---<`);
  const readDirAsync = promisify(readDir);
  const filePath = process.argv[2];
  const ord = "/home/micha/Schreibtisch/werkma/modulema";
  const exclOrdner = ["node_modules"];  // nicht verwendete Ordner 
  const inclDateien = ["package.json"]; // gesuchte Dateinamen

const filelist = async (dir) => { // liest alle Dateipfade aus dem Ordner dir und seinen Unterordnern 
  try {
    const fileList = await readDirAsync(dir);
    return fileList;
  }
  catch (err) {
    console.log('ERROR:', err);
  }
}
const readJsonArr = async (fileArr) => {  // liest JSON-Objekt-Array aus Dateipfad-Array
  let objRead = {};
  try{
    let objArr = await Promise.all(fileArr.map(async (file) => {
      objRead = await fs.readJson(file);
      // console.log("read:", objRead.name);
      return objRead;
    }));
    return objArr;
  }catch(error){
    console.error('error', error);
  }
};
const jsonAusOrdner = async (ordner = ord) => {  // bestimmte json-Dateien aus ordner und Unterordnern herauslesen 
  let fl = await filelist(ordner); // fl = filelist = Liste mit Dateipfaden
  let filtEx = filterEx(fl, exclOrdner);
  let filtIn = filterIn(filtEx, inclDateien);
  let indArr = filtIn.map((el) => el.replace(ordner, ""));  // Array mit relativen Dateipfaden wird zu den keys
  let jsonArr = await readJsonArr(filtIn); // Array aus Json-Objekten
  let jsonObj = keyArrObj(jsonArr, indArr);
  return jsonObj;  // Objekt aus Json-Objekten mit relativem Dateipfad als key
};
const main = async (ordner = ord) => {  // äußere Attribute vom Json-Objekt mit ineren vertauschen
  let jsonObj = await jsonAusOrdner(ordner);
  let resPath = './result';
  if (!fs.existsSync(resPath)) fs.mkdirSync(resPath); // Ergebnispfad erzeugen
  await fs.writeJson(path.join(resPath, 'jsonObj.json'), jsonObj);
  let inoutObj = objinout(jsonObj); // äußere Attribute mit ineren vertauschen
  await fs.writeJson(path.join(resPath, 'inoutObj.json'), inoutObj);
  return inoutObj;
};
main().then((result) => {
  // console.log(Object.keys(objObj));
  console.log(result);
  console.log('Erfolg!');
}).catch((error) => {
  console.error('error', error);
});
// Testcode
  // let a1 = [2];
  // let k1 = [1,2];
  // let res = keyArrObj(a1, k1);
  // console.log(res);
  // filtIn.forEach((el) => {
  //   console.log(`${path.dirname(el)}: ${path.basename(el)},`);
  // })
  // .catch((err)=>console.log(err));

  // await fs.writeJson('./pack1.json', { ...packObj, name: 'fs-extra', micha: 'lieb!' })
