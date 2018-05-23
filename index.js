// Importe
  'use strict'
  const fs = require('fs-extra');
  const path = require('path');
  const { promisify } = require('util');

  const readDir = require('./module/readdir');
  const objinout = require('./module/objinout');
  const { filterEx, filterIn, keyArrObj } = require('./module/arrayfkt');
  const { schnittstr, reststrs } = require('./module/schnittstr');
  // const el = (v) => { console.log(`-> ${v}: ${eval(v)}`); }; // Eval-Logger Kurzform, Aufruf: el("v"); v = zu loggende Variable

  const aktFile = path.basename(__filename);
  console.log(`>--- ${aktFile} ---<`);
  const readDirAsync = promisify(readDir);
  const filePath = process.argv[2];
  // Einstellungen
  const ord1 = "./";
  const ord2 = "/home/micha/Schreibtisch/werkma/modulema";
  const ord3 = "/home/micha/Schreibtisch/tests/jsonZuCsv";
  const ord4 = "/home/micha/Schreibtisch/VSC-Arbeitsbereiche";
  const ord5 = './put/output';
  const exclPfadStrings = ["node_modules", "alt"];  // es werden auch Teile von Pfaden (Dateiname+Ordner) durchsucht,  z.B. nicht verwendete Ordner
  const inclPfadStrings = ["package.json"]; // es werden auch Teile von Pfaden (Dateiname+Ordner) durchsucht,  z.B. gesuchte Dateinamen
  const resPath = ord3;
  const zuerstZeile = true;
  const leerWert = "---"; // Leer-Wert, falls Schlüssel in diesem Objekt nicht existiert

const filelist = async (ordner = ord1) => { // liest alle Dateipfade aus dem Ordner ordner und seinen Unterordnern 
  try {
    const fileList = await readDirAsync(ordner);
    return fileList;
  }
  catch (err) {
    console.log('ERROR:', err);
  }
}
const filelistfilter = (fileList = [], exclPfadStrings = [], inclPfadStrings = [], filterTyp = 0, regExpr = false, restStrings = false) => {
  // Parameter
  if (regExpr !== false) regExpr = true;  // nur ganzes Wort (Ordnername, Dateiname, Extension) vergleichen
  if (restStrings !== false) restStrings = true;  // nur die sich unterscheidenden Strings, macht v.a.  Sinn bei Pfaden, Fkt. reststrs (Bsp.: ord/datei1, ord/datei2 => 1, 2)
  // if (filterTyp = 0)  filterTyp = "all";  // komplette Pfade
  // else if (filterTyp === 1) filterTyp = "dateiname inkl. extension" // path.basename 
  // else if (filterTyp === 2) filterTyp = "dateiname ohne extension"  // path.basename - path.extension
  // else if (filterTyp === 3) filterTyp = "extension" // path.extension
  // else if (filterTyp === 4) filterTyp = "pfad"  // path.dirname, irgendein Ordner oder Ordnerfolge
  // else if (filterTyp === 5) filterTyp = "untersterordner"  // path.dirname().split(path.sep)[len-1]
  // else if (filterTyp === 6) filterTyp = "obersterordner"  // path.dirname().split(path.sep)[0]
  // else if (filterTyp === 7) filterTyp = "mittelordner"  // path.dirname().split(path.sep).slice(1,len-1)

  // Variablen
  let startList;
  if (filterTyp === 0) startList = [...fileList];  // unterschiedliche komplette Pfade
  else if (filterTyp === 1) startList = [...fileList].map(el => path.basename(el));// "dateiname inkl. extension" path.basename 
  // else if (filterTyp === 2) startList = [...fileList].map(el => reststrs([path.basename(el), path.extname(el)])[0]);// "dateiname ohne extension"  // path.basename - path.extension
  else if (filterTyp === 2) startList = [...fileList].map(el => path.basename(el).slice(0, path.basename(el).indexOf(path.extname(el)))); // "dateiname ohne extension"  // path.basename - path.extension
  else if (filterTyp === 3) startList = [...fileList].map(el => path.extname(el));// "extension" path.extname
  else if (filterTyp === 4) startList = [...fileList].map(el => path.dirname(el));// "pfad"  path.dirname, irgendein Ordner oder Ordnerfolge
  else if (filterTyp >= 5 && filterTyp<=7) { // Ordner
    startList = [...fileList].map(el => {
      let arr = path.dirname(el).split(path.sep);
      if (arr[0] === "") arr = arr.slice(1);
      let folder;
      if (filterTyp === 5) folder = arr[arr.length-1];  // "untersterordner"  path.dirname().split(path.sep)[len-1]
      else if (filterTyp === 6) folder = arr[0];  // "obersterordner"  path.dirname().split(path.sep)[0]
      else if (filterTyp === 7) folder = arr.slice(1,arr.length-1).join(path.sep);  // "mittelordner"  path.dirname().split(path.sep).slice(1,len-1)
      return folder;
    });
  }
  if (restStrings === true) startList = reststrs(startList);  // nur die sich unterscheidenden Strings, Fkt. reststrs (Bsp.: ord/datei1, ord/datei2 => 1, 2)
  // console.log("startList", startList);
  // console.log("startList", reststrs(startList));
  
  // Vergleiche
  let filtEx = filterEx(startList, exclPfadStrings, regExpr);  // hinausfiltern
  // console.log("---filtEx", filtEx);
  // console.log("---filtEx", reststrs(filtEx));
  let filtIn = filterIn(filtEx, inclPfadStrings, regExpr); // herausziehen
  return filtIn;
};
const checkfilelistfilter = () => {
  const fileList = [ord2+"/test1.json", ord3+"/test2.txt", ord4+"/muster3.json"];
  const excl = ["test."];
  const incl = [""];
  // console.log("-- fileList", fileList);
  // console.log("fl : ", reststrs(fileList));
  const flf = filelistfilter(fileList, excl, incl, 1, true, false);
  console.log("flf: ", reststrs(flf));
};
const readJsonArr = async (fileArr) => {  // liest JSON-Objekt-Array aus Dateipfad-Array
  let objRead = {};
  try {
    // console.log(fileArr);
    let objArr = await Promise.all(fileArr.map(async (file) => {
      objRead = await fs.readJson(file);
      // console.log("read:", file);
      // console.log("read:", objRead.name);
      return objRead;
    }));
    return objArr;
  } catch(error) {
    console.error('error', error);
  }
};
const jsonAusOrdner = async ( ordner = ord1, bArray = false, 
  exclPfadStrings = [], 
  inclPfadStrings = [], 
  filterTyp = 0, 
  regExpr = false, 
  restStrings = false) => {  // bestimmte json-Dateien aus ordner und Unterordnern herauslesen 
  // json-Array erzeugen
  const fileList = await filelist(ordner); // filelist = Liste mit Dateipfaden
  const filteredList = filelistfilter(fileList, exclPfadStrings, inclPfadStrings); // herausziehen
  const jsonArr = await readJsonArr(filteredList); // Array aus Json-Objekten
  if (bArray) return {jsonArr, filteredList};
  // json-Objekt erzeugen
  const indArr = filteredList.map((el) => path.basename(el));  // Array mit relativen Dateipfaden wird zu den keys
  const jsonObj = keyArrObj(jsonArr, indArr); // Objekt aus json-Objekten mit keys indArr
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
      let val = obj[v][k2] || leerWert; // Leer-Wert, falls Schlüssel in diesem Objekt nicht existiert
      if (typeof val === "object")  val = JSON.stringify(val);  // Objekte und Arrays in json-Strings umwandeln
      return a.concat("," + String(val).replace(/,/g, '-'));
    }, z[i]);
    i++;
  });
  return z.join("\r\n");
};
const csvinout = async (ordner = ord1) => {  // äußere Attribute vom Json-Objekt mit ineren vertauschen
  let jsonObj = await jsonAusOrdner(ordner, false);
  let csvObj = csvAusJson(jsonObj, zuerstZeile); // csv erzeugen
  let inoutObj = objinout(jsonObj); // äußere Attribute mit ineren vertauschen
  let csvInout = csvAusJson(inoutObj, zuerstZeile); // csv erzeugen
  // Dateien speichern
  if (!fs.existsSync(resPath)) fs.mkdirSync(resPath); // Ergebnispfad erzeugen
  await fs.writeJson(path.join(resPath, 'jsonObj.json'), jsonObj);
  await fs.writeFile(path.join(resPath, 'jsonObj.csv'), csvObj); // csv-Datei speichern
  await fs.writeJson(path.join(resPath, 'inoutObj.json'), inoutObj);
  await fs.writeFile(path.join(resPath, 'inoutObj.csv'), csvInout); // csv-Datei speichern
  return inoutObj;
};
const makecsvinout = (ordner = ord4) => {
  csvinout(ordner).then((result) => {
    // console.log(Object.keys(objObj));
    // console.log(result);
    console.log(`makecsvinout - Csv-Dateien erstellt im Ordner ${resPath}!`);
  }).catch((error) => {
    console.error('error', error);
  });
};
// Csv aus Json im Ordner
const csvAusJsonFile = async (ordner = "./", zuerstZ = false) => { // csv-Dateien erstellen aus json-Dateien aus Ordner oder Array mit Dateipfaden
  let { jsonArr, filteredList } = await jsonAusOrdner(ordner, true);  // true => Array
  let csvArr = jsonArr.map(el => csvAusJson(el, zuerstZ));
  // Dateien speichern
  await savecsvjson({ fileList: filteredList, jsonArr, csvArr, savePath: resPath });
  return;  // Objekt aus Json-Objekten mit relativem Dateipfad als key
};
const savecsvjson = async ({ fileList, jsonArr, csvArr, savePath = resPath}) => {
  if (!fs.existsSync(savePath)) fs.mkdirSync(savePath); // Ergebnispfad erzeugen
  fileList.forEach(async (el, ix) => {
    // let fileName = ordner.split("/")[ordner.split("/").length-1];
    // let arr = path.dirname(el).split(path.sep);
    // let folder = arr[arr.length - 1];
    let fileName = path.basename(el);
    await fs.writeJson(path.join(savePath, fileName + '.json'), jsonArr[ix]);
    await fs.writeFile(path.join(savePath, fileName + '.csv'), csvArr[ix]); // csv-Datei speichern
  });

};
const makecsv = (ordner = ord4) => {
  csvAusJsonFile(ordner, false).then((result) => {
    // console.log(Object.keys(objObj));
    // console.log(result);
    console.log(`makecsv - Csv-Dateien erstellt im Ordner ${resPath}!`);
  }).catch((error) => {
    console.error('error', error);
  });
};
makecsv();
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
