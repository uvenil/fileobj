'use strict'
// mit Indices
const filtEx = (filtArr, exclArr, regExpr = false, ix = true) => {  // liefert die Indices, in denen ein Element aus exclArr nicht enthalten ist
  let inIx = []; // ausgewählte Indices
  let filtered = [...filtArr].filter((el, ix) => {
    let exclude = false;
    exclArr.forEach((suchEl) => {
      if (suchEl === "") return;  // "" wird ignoriert
      if (!exclude) {
        if (regExpr) exclude = el.search(suchEl) > -1;  // RegExpr
        else exclude = el.indexOf(suchEl) > -1; // Str
      }
    });
    if (!exclude) inIx.push(ix);
    return !exclude;
  });
  if (ix) return inIx;
  return filtered;
};
const filtIn = (filtArr, inclArr, regExpr = false, ix = true) => { // liefert die Indices, in denen ein Element aus inclArr enthalten ist
  let allIx = filtArr.map((el, ix) => ix);
  
  let ret = ix ? allIx : filtArr; // Return-Wert bei ungültigem inclArr
  if (!inclArr.length > 0) return ret;
  if (inclArr.filter(el => (el.length > 0)).length === 0) return ret; // keine inclArr-Elemente mit length > 0
  // Elemente auswählen
  let inIx = []; // ausgewählte Indices
  let filtered = [...filtArr].filter((el, ix) => {
    
    let include = false;
    inclArr.forEach((suchEl) => {
      if (suchEl === "") return;  // "" wird ignoriert
      if (!include) {
        if (regExpr) include = el.search(suchEl) > -1; // RegExpr,  alternativ: if (!include) include = path.basename(el) === suchEl;
        else include = el.indexOf(suchEl) > -1; // Str,  alternativ: if (!include) include = path.basename(el) === suchEl;
      }
    });
    if (include)  inIx.push(ix);
    return include;
  });
  if (ix) return inIx;
  return filtered;
};
const filt = (filtArr, exclArr, inclArr, regExpr = false, ix = true) => { // 1. filterEx, 2. filterIn
  let exEl = filtEx(filtArr, exclArr, regExpr, ix);
  let inEl = filtIn(filtArr, inclArr, regExpr, ix);
  let filtEl = exEl.filter(el => inEl.indexOf(el) !== -1); // nur die Schnittmenge beider Filter
  return filtEl;
};
const check = () => {
  const filtArr = ["abcde","bcdef","cdefg"];
  const exclArr = ["a"];
  const inclArr = ["b"];
  const fi = filt(filtArr, exclArr, inclArr, false, true);
  console.log("fi",fi);
};
// check();
// ohne Indices
const filterEx = (filtArr, exclArr, regExpr = false) => {  // verwirft Pfade, in denen ein Element aus exclArr enthalten ist
  let filtered = [...filtArr].filter((el) => {
    let exclude = false;
    exclArr.forEach((suchEl) => {
      if (suchEl==="") return;  // "" wird ignoriert
      if (!exclude) {
        if (regExpr) exclude = el.search(suchEl) > -1;  // RegExpr
        else exclude = el.indexOf(suchEl) > -1; // Str
      }
    });
    return !exclude;
  });
  // console.log("fil", filtered);
  return filtered
};
const filterIn = (filtArr, inclArr, regExpr = false) => { // zieht Pfade heraus, in denen ein Element aus inclArr enthalten ist
  if (!inclArr.length>0)  return filtArr;
  if (inclArr.filter(el => (el.length > 0)).length === 0) return filtArr; // keine inclArr-Elemente mit length > 0
  let filtered = [...filtArr].filter((el) => {
    let include = false;
    inclArr.forEach((suchEl) => {
      if (suchEl === "") return;  // "" wird ignoriert
      if (!include) {
        if (regExpr) include = el.search(suchEl) > -1; // RegExpr,  alternativ: if (!include) include = path.basename(el) === suchEl;
        else include = el.indexOf(suchEl) > -1; // Str,  alternativ: if (!include) include = path.basename(el) === suchEl;
      }
    });
    return include;
  });
  return filtered;
};
const filter = (filtArr, exclArr, inclArr, regExpr = false) => { // 1. filterEx, 2. filterIn
  let filtEx = filterEx(filtArr, exclArr, regExpr);
  let filtered = filterIn(filtEx, inclArr, regExpr);
  return filtered;
};
const keyArrObj = (arr, keys) => {  // erstellt aus einem Array und einem Attribut-Array ein Objekt
  let obj = {};
  let i = 0;
  keys.forEach((key) => {
    obj[new String(key)] = arr[i++] || null;  // keys ohne zugehörige Werte erhalten den Wert null
  });
  if (arr.length > keys.length) {
    obj["restarray"] = arr.slice(keys.length, arr.length);  // restliches Array befindet sich im Attribut "restarray"
  }
  return obj;
};
module.exports = { filt, filter, filterEx, filterIn, keyArrObj };