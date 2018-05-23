'use strict'
const filterEx = (filtArr, exclArr) => {  // verwirft Pfade, in denen ein Element aus exclArr enthalten ist
  let filtered = [...filtArr].filter((el) => {
    let exclude = false;
    exclArr.forEach((suchEl) => {
      if (suchEl==="") return;  // "" wird ignoriert
      // console.log(el.search(suchEl) > -1);  // RegExpr
      // console.log(el.indexOf(suchEl) > -1); // Str
      if (!exclude) exclude = el.indexOf(suchEl) > -1;
    });
    return !exclude;
  });
  // console.log("fil", filtered);
  return filtered
};
const filterIn = (filtArr, inclArr) => { // zieht Pfade heraus, in denen ein Element aus inclArr enthalten ist
  if (!inclArr.length>0)  return filtArr;
  let filtered = [...filtArr].filter((el) => {
    let include = false;
    inclArr.forEach((suchEl) => {
      if (suchEl === "") return;  // "" wird ignoriert
      if (!include) include = el.indexOf(suchEl) > -1; // alternativ: if (!include) include = path.basename(el) === suchEl;
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