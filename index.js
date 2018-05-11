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
  // Einstellungen
  const ord = "/home/micha/Schreibtisch/werkma/modulema";
  const exclOrdner = ["node_modules", "alt"];  // nicht verwendete Ordner 
  const inclDateien = ["package.json"]; // gesuchte Dateinamen
  const resPath = './../result';
  const zuerstZeile = true;

const filelist = async (ordner = ord) => { // liest alle Dateipfade aus dem Ordner ordner und seinen Unterordnern 
  try {
    const fileList = await readDirAsync(ordner);
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
  let fileList = await filelist(ordner); // filelist = Liste mit Dateipfaden
  let filtEx = filterEx(fileList, exclOrdner);  // hinausfiltern
  let filtIn = filterIn(filtEx, inclDateien); // herausziehen
  let indArr = filtIn.map((el) => el.replace(ordner, ""));  // Array mit relativen Dateipfaden wird zu den keys
  let jsonArr = await readJsonArr(filtIn); // Array aus Json-Objekten
  let jsonObj = keyArrObj(jsonArr, indArr); // Objekt aus json-Objekten mit keys indArr
  return jsonObj;  // Objekt aus Json-Objekten mit relativem Dateipfad als key
};
const csvAusJson = (jsonObj, zuerstZ = true) => { // erstellt aus einem verschachtelten json-Objekt eine csv-Tabelle, zuerstZ -> äußere Attribute bilden die Zeile
  let obj = jsonObj;
  let z1 = "Attr2 \\ Attr1";
  if (!zuerstZ) {
    obj = objinout(obj);
    z1 = "Attr1 \\ Attr2";
  }  
  let keys = Object.keys(obj);  // alle vorkommenden Attribute in der 1. Ebene
  z1 = keys.reduce((a, v) => a.concat("," + String(v).replace(/,/g, '-')), z1);
  let set = new Set([]);  // alle vorkommenden Attribute in der 2. Ebene
  keys.forEach((key) => {
    Object.keys(obj[key]).forEach((k) => set.add(k))
  });
  let z = [z1];
  let i = 1;
  Array.from(set).map((k2) => {
    z[i] = String(k2).replace(/,/g, '-');
    z[i] = keys.reduce((a, v) => {
      let val = obj[v][k2];
      if (typeof val === "object")  val = JSON.stringify(val);  // Objekte und Arrays in json-Strings umwandeln
      return a.concat("," + String(val).replace(/,/g, '-'));
    }, z[i]);
    i++;
  });
  return z.join("\r\n");
};
const main = async (ordner = ord) => {  // äußere Attribute vom Json-Objekt mit ineren vertauschen
  let jsonObj = await jsonAusOrdner(ordner);
  let csvObj = csvAusJson(jsonObj, zuerstZeile); // csv erzeugen
  if (!fs.existsSync(resPath)) fs.mkdirSync(resPath); // Ergebnispfad erzeugen
  await fs.writeJson(path.join(resPath, 'jsonObj.json'), jsonObj);
  await fs.writeFile(path.join(resPath, 'jsonObj.csv'), csvObj); // csv-Datei speichern
  let inoutObj = objinout(jsonObj); // äußere Attribute mit ineren vertauschen
  let csvInout = csvAusJson(inoutObj, zuerstZeile); // csv erzeugen
  await fs.writeJson(path.join(resPath, 'inoutObj.json'), inoutObj);
  await fs.writeFile(path.join(resPath, 'inoutObj.csv'), csvInout); // csv-Datei speichern
  return inoutObj;
};
main().then((result) => {
  // console.log(Object.keys(objObj));
  // console.log(result);
  console.log('Erfolg!');
}).catch((error) => {
  console.error('error', error);
});
// Testcode
  // const csv = async () => { // wird nicht verwendet
  //   let json = await fs.readJson('./result/inoutObj.json');
  //   let csv = csvAusJson(json, zuerstZeile);
  //   await fs.writeFile('./result/inoutObj.csv', csv); // csv-Datei speichern
  //   return csv;
  // };
  // let a1 = [2];
  // let k1 = [1,2];
  // let res = keyArrObj(a1, k1);
  // console.log(res);
  // filtIn.forEach((el) => {
  //   console.log(`${path.dirname(el)}: ${path.basename(el)},`);
  // })
  // .catch((err)=>console.log(err));

  // await fs.writeJson('./pack1.json', { ...packObj, name: 'fs-extra', micha: 'lieb!' })
