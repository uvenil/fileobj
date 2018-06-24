// Importe
  'use strict'
  
  const fs = require('fs-extra');
  const path = require('path');
  const { promisify } = require('util');

  const readDir = require('./readdir');
  const objinout = require('./objinout');
  const { filterEx, filterIn, keyArrObj } = require('./arrayfkt');
  const { schnittstr, reststrs } = require('./schnittstr');
  const { objwrap } = require("./ObjPath");
  // const el = (v) => { console.log(`-> ${v}: ${eval(v)}`); }; // Eval-Logger Kurzform, Aufruf: el("v"); v = zu loggende Variable

  const aktFile = path.basename(__filename);
  console.log(`>--- ${aktFile} ---<`);
  const readDirAsync = promisify(readDir);
  const filePath = process.argv[2];
  // Einstellungen
  const ord1 = "./";
  const ord2 = './put/output';
  const ord3 = "/home/micha/Schreibtisch/tests/jsonZuCsv";
  const ord4 = "/home/micha/Schreibtisch/werkma/modulema";
  const ord5 = "/home/micha/Schreibtisch/VSC-Arbeitsbereiche";
  const ord6 = "/home/micha/Schreibtisch/UdemyNodeReact";
  const resPath = ord3;
  const exclPfadStrings = ["node_modules", "alt"];  // es werden auch Teile von Pfaden (Dateiname+Ordner) durchsucht,  z.B. nicht verwendete Ordner
  const inclPfadStrings = ["package.json"]; // es werden auch Teile von Pfaden (Dateiname+Ordner) durchsucht,  z.B. gesuchte Dateinamen
  const zuerstZeile = true;
  const leerWert = "---"; // Leer-Wert, falls Schlüssel in diesem Objekt nicht existiert

// filelist filter
const filelist = async (ordner = ord1) => { // liest alle Dateipfade aus dem Ordner ordner und seinen Unterordnern 
  try {
    const fileList = await readDirAsync(ordner);
    return fileList;
  }
  catch (err) {
    console.log('ERROR:', err);
  }
}
const filelistfilter = (fileList = [], exclStrings = [], inclStrings = [], filterTyp = 0, regExpr = false, restStrings = false) => {
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
  
  // Vergleiche
  let filtEx = filterEx(startList, exclStrings, regExpr);  // hinausfiltern
  // console.log("---filtEx", filtEx.length);
  // console.log("---filtEx", reststrs(filtEx));
  let filtIn = filterIn(filtEx, inclStrings, regExpr); // herausziehen
  // console.log("---filtIn", filtIn.length);

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

// read json csv save
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
  // ordner -> fileList -> filteredList -> jsonArr -> indArr -> jsonObj
  exclStrings = [],
  inclStrings = [], 
  filterTyp = 0, 
  regExpr = false, 
  restStrings = false) => {  // bestimmte json-Dateien aus ordner und Unterordnern herauslesen 
  // json-Array erzeugen
  const fileList = await filelist(ordner); // filelist = Liste mit Dateipfaden
  const filteredList = filelistfilter(fileList, exclStrings, inclStrings); // herausziehen
  const jsonArr = await readJsonArr(filteredList); // Array aus Json-Objekten
  if (bArray) return {jsonArr, filteredList};
  // json-Objekt erzeugen
  let indArr = reststrs(filteredList);  // Array mit relativen Dateipfaden wird zu den keys
  indArr = reststrs(indArr);  // ggf. erneut gleichen String entfernen
  // const indArr = filteredList.map((el) => path.basename(el));  // Array mit relativen Dateipfaden wird zu den keys
  // console.log("indArr",indArr);
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
  let primitives = false; 
  let keys = Object.keys(obj);  // alle vorkommenden Attribute in der 1. Ebene
  z1 = keys.reduce((a, v) => a.concat("," + String(v).replace(/,/g, '-')), z1); // 1. Zeile
  let z = [z1]; // Array aus den einzelnen Zeilen wird am Ende zusammengesetzt, 1. Zeile = z[0]
  // Attribute der 2. Ebene zusammenstellen (Zeilenbeschriftungen)
  let set = new Set([]);  // alle vorkommenden Attribute in der 2. Ebene
  let testPrim = 'typeof obj[key] === "string"';
  keys.forEach((key) => {
    if (eval(testPrim)) {
      primitives = true;
    } else {
      Object.keys(obj[key]).forEach((k) => {
        set.add(k)
      })
    }
  });
  // Falls es primitive Werte gibt, werden diese in die 2. Zeile geschrieben
  let i = 1;  // Zeilenindex, 1. Zeile = z[0]
  if (primitives) {
    i = 2;
    let z2 = "Werte";
    z2 = keys.reduce((a, key) => {
      let val = ",";
      if (eval(testPrim)) val += String(obj[key]).replace(/,/g, '-');
      return a.concat(val);
    }, z2);
    // Alternativ zu reduce:
    // keys.forEach((key) => {
    //   z2 = z2.concat(",");
    //   if (eval(testPrim)) z2 = z2.concat(obj[key])
    // });
    z[1] = z2;
  }
  // Werte mit 2 Schlüsseln in die Tabelle schreiben
  Array.from(set).map((k2) => { // je 1 Zeile pro Attribut der 2. Ebene
    z[i] = String(k2).replace(/,/g, '-'); // Zeile beginnt mit Attribut der 2. Ebene
    z[i] = keys.reduce((a, v) => {  // Werte mit Kommata hinzufügen
      let val = obj[v][k2] || leerWert; // Leer-Wert, falls Schlüssel in diesem Objekt nicht existiert
      if (typeof val === "object")  val = JSON.stringify(val);  // Objekte und Arrays in json-Strings umwandeln
      return a.concat("," + String(val).replace(/,/g, '-'));
    }, z[i]);
    i++;  // Index für die nächste Zeile
  });
  return z.join("\r\n");
};
const savecsvjson = async ({ fileNames, jsonArr, csvArr, savePath = resPath }) => {
  if (!fs.existsSync(savePath)) fs.mkdirSync(path.resolve(savePath)); // Ergebnispfad erzeugen
  fileNames.forEach(async (el, ix) => {
    await fs.writeJson(path.join(savePath, el + '.json'), jsonArr[ix]);
    await fs.writeFile(path.join(savePath, el + '.csv'), csvArr[ix]); // csv-Datei speichern
  });
};

// arr-csv und obj-csv-inout
const csvinoutOrg = async (ordner = ord6, exclStrings = exclPfadStrings, inclStrings = inclPfadStrings, filterTyp = 0) => {  // äußere Attribute vom Json-Objekt mit ineren vertauschen
  // jsonArr -> csvArr -> fileNames -> save
  let jsonZ = await jsonAusOrdner(ordner, false, exclStrings, inclStrings, filterTyp);
  let jsonS = objinout(jsonZ); // äußere Attribute mit ineren vertauschen
  let csvZ = csvAusJson(jsonZ, zuerstZeile); // csv erzeugen
  let csvS = csvAusJson(jsonS, zuerstZeile); // csv erzeugen
  const name = inclStrings.map(el => el.replace(".","-")).join("-");
  const fileNames = [name + "_Z", name + "_S"];  // oberste Ebene in der 1. Zeile bzw.. Spalte
  await savecsvjson({ fileNames, jsonArr: [jsonZ, jsonS], csvArr: [csvZ, csvS], savePath: resPath });
  return jsonS;
};
const makecsvinout = (ordner = ord6) => {
  csvinout(ordner).then((result) => {
    // console.log(Object.keys(objObj));
    // console.log(result);
    console.log(`makecsvinout - Csv-Dateien erstellt im Ordner ${resPath}!`);
  }).catch((error) => {
    console.error('error', error);
  });
};
const csvAusJsonFile = async (ordner = ord5, zuerstZ = false) => { // csv-Dateien erstellen aus json-Dateien aus Ordner oder Array mit Dateipfaden
  // Csv aus Json-Dateien im Ordner (+ Unterordner),  jsonArr -> csvArr -> fileNames -> save
  let { jsonArr, filteredList } = await jsonAusOrdner(ordner, true);  // true => Array
  let csvArr = jsonArr.map(el => csvAusJson(el, zuerstZ));
  const fileNames = filteredList.map(el => path.basename(el));
  // Alternativ: const fileNames = reststrs(filteredList);  // Array mit relativen Dateipfaden
  // let fileName = ordner.split("/")[ordner.split("/").length-1];
  // let arr = path.dirname(el).split(path.sep);
  // let folder = arr[arr.length - 1];
  await savecsvjson({ fileNames, jsonArr, csvArr, savePath: resPath }); // Dateien speichern
  return;  // Objekt aus Json-Objekten mit relativem Dateipfad als key
};
const makecsv = (ordner = ord5) => {
  csvAusJsonFile(ordner, false).then((result) => {
    // console.log(Object.keys(objObj));
    // console.log(result);
    console.log(`makecsv - Csv-Dateien erstellt im Ordner ${resPath}!`);
  }).catch((error) => {
    console.error('error', error);
  });
};
const csvinout = async (ordner = ord6, exclStrings = exclPfadStrings, inclStrings = inclPfadStrings, filterTyp = 0) => {  // äußere Attribute vom Json-Objekt mit ineren vertauschen
  // jsonArr -> csvArr -> fileNames -> save
  let jsonZ = await jsonAusOrdner(ordner, false, exclStrings, inclStrings, filterTyp);
  let jsonS = objinout(jsonZ); // äußere Attribute mit ineren vertauschen
  let csvZ = csvAusJson(jsonZ, zuerstZeile); // csv erzeugen
  let csvS = csvAusJson(jsonS, zuerstZeile); // csv erzeugenjsonZ
  const name = inclStrings.map(el => el.replace(".", "-")).join("-");
  const fileNames = [name + "_Z", name + "_S"];  // oberste Ebene in der 1. Zeile bzw.. Spalte
  await savecsvjson({ fileNames, jsonArr: [jsonZ, jsonS], csvArr: [csvZ, csvS], savePath: resPath });
  // flatten
  // const op = new ObjPath(jsonZ);
  let arraySolve = false;
  let keys = ["scripts", "dependencies", "devDependencies"];
  let depth = 1;
  let fromTop = true;
  const objFlat = objwrap("pkvsFlat");
  // kasFlat(keys = "", depth = 0, fromTop = true, joinStr = "--") { // flatted die Keyarrays (kas, PathKeys) komplett (depth=0) oder um depth Ebenen
  let fJson = objFlat(jsonZ, arraySolve, keys, depth, fromTop, "++");
  let fCsv = csvAusJson(fJson, zuerstZeile); // csv erzeugen

  await savecsvjson({ fileNames: ["flat"], jsonArr: [fJson], csvArr: [fCsv], savePath: resPath });

  return jsonS;
};

makecsvinout();
module.exports = { jsonAusOrdner, csvAusJson, savecsvjson, filelistfilter };
