'use strict'
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
const keyArrObj = (arr, keys) => {  // erstellt aus einem Array und ein Attribut-Array ein Objekt
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