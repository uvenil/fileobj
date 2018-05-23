'use strict'
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
module.exports = { filterEx, filterIn, keyArrObj };