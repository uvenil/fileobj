console.log("--- schnittstr.js ---");

// Umbenennen in reststrs !!!
const restarr = (strArr, fromTop = true) => { // Restmengenstring, => restarr = Restmengenstring-Array = strArr ohne schnittStr
  if (!strArr.length>0) return [];
  if (strArr.length === 1) return strArr;
  // const { str, bOnce, testStr, testInd, foundArr } = schnittstr(strArr);
  const schnittObj = schnittstr(strArr);
  const foundInd = schnittObj.testStr.indexOf(schnittObj.str);
  // console.log("O:", schnittObj);
  // Arrays herausfiltern, die sich auf den SchnittStr str beziehen
  let filtArr = [];
  schnittObj.foundArr.forEach(e1 => {
    filtArr.push(e1.filter( e2 => foundInd === e2[0] ));
  });
  // Array mit der Restmengen-Strings bilden
  let restArr = [];
  strArr.forEach((el, ix) => {
    const ind = fromTop ? 0 : filtArr[ix].length -1;
    const s1 = el.slice(0, filtArr[ix][ind][1]);  // schnittStr jeweils fromTop herausschneiden
    const s2 = el.slice(filtArr[ix][ind][1] + filtArr[ix][ind][2]);
    restArr.push(s1 + s2);
  });
  return restArr;
};
const schnittstr = (strArr) => { // => {str: gemeinsamer String, bOnce: Einmaligkeit in jedem String};
  if (!strArr.length > 0) return {str: "", bOnce: null}
  if (strArr.length === 1) return {str: strArr[0], bOnce: true}
  let lenArr = strArr.map(el => el.length);
  let testInd = lenArr.indexOf(Math.min.apply({}, lenArr));
  let testStr = strArr[testInd];
  // console.log("testStr",testStr);
  let testLen = Math.round(testStr.length / 2);
  let arr, ix;
  let hitsArr = hitsarr(testStr, strArr, testLen); // [[str1-Index, str2-Index, maxLen]
  // testLen schrittweise erhöhen oder erniedrigen
  if (hitsArr.length > 0) {
    while (hitsArr.length > 0 && testLen++ <= testStr.length) {
      foundArr = Array.from(hitsArr); // letzte Treffer speichern
      hitsArr = hitsarr(testStr, strArr, testLen);
    }
    if (hitsArr.length > 0) foundArr = Array.from(hitsArr);
  } else {
    while (hitsArr.length == 0 && testLen-- > 0) {
      hitsArr = hitsarr(testStr, strArr, testLen);
    };
    foundArr = Array.from(hitsArr);
  };
  if (foundArr.length===0) return {str: "", bOnce: null}; // kein gemeinsamer String
  // Test auf Einzigartigkeit in jedem String
  let bOnce = true;
  foundArr.forEach(e1 => {
    if (e1.length === 1) return;
    let testIx = e1[0][0];  // erster Index darf für Einzigartigkeit nicht noch einmal vorkommen
    e1.slice(1).forEach(e2 => {
      if (testIx === e2[0]) bOnce = false;
    });
  });
  // Ergebnisse
  let foundInd = foundArr[0][0][0];
  let foundLen = foundArr[0][0][2];
  let str = testStr.slice(foundInd, foundInd + foundLen);
  return { str, bOnce, testStr, testInd, foundArr }; // {str: gemeinsamer String, bOnce: Einmaligkeit in jedem String};
};
const hitsarr = (testStr, restArr, testLen) => {  // liefert [[str1-Index, str2-Index, testLen]
  let hitsArr = [];
  for (let ixa = 0; ixa < restArr.length; ixa++) {
    const el = restArr[ixa];
    const hits = schnitthits(testStr, el, testLen); // [[str1-Index, str2-Index, testLen], ...]
    if (hits.length === 0) {
      hitsArr = [];
      break;
    }
    else hitsArr.push(hits);
  };
  return hitsArr;
};
const schnitthits = (str1, str2, testLen) => {  // liefert [[str1-Index, str2-Index, testLen]
  // findet nur den Index des ersten und letzten Fundes 
  if (!testLen || testLen<0) return [];
  let temp = null;
  if (str1.length > str2.length) { // str1 soll der kleinere String sein
    temp = str1;
    str1 = str2;
    str2 = temp;
  }
  let ix1, ix2, ix2l
  let hits = []; // [[str1-Index, str2-Index, testLen], ...]
  for (ix1 = 0; ix1 < (str1.length - testLen + 1); ix1++) {
    ix2 = str2.indexOf(str1.slice(ix1, ix1 + testLen));
    if (ix2 === -1) continue;
    hits.push([ix1, ix2, testLen]);
    ix2l = str2.lastIndexOf(str1.slice(ix1, ix1 + testLen));
    if (ix2l !== -1 && ix2 !== ix2l)  hits.push([ix1, ix2l, testLen]);
  };
  if (temp != null) hits = hits.map(el => [el[1], el[0], el[2]]);  // ggf. zurücktauschen
  return hits;
};
// unter Fkt nicht benötigt für schnittstr
const schnittix = (str1, str2) => {  // liefert [] oder [[str1-Index, str2-Index, maxLen], ...]
  let schnittIx = [];
  let testLen = Math.floor(str1.length / 2);
  let hits = schnitthits(str1, str2, testLen); // // [[str1-Index, str2-Index, testLen], ...]
  // testLen schrittweise erhöhen oder erniedrigen
  if (hits.length > 0) {
    while (hits.length > 0 && testLen++ <= str1.length) {
      schnittIx = Array.from(hits); // letzte Treffer speichern
      hits = schnitthits(str1, str2, testLen);
    }
    if (hits.length > 0) schnittIx = Array.from(hits);
  } else {
    while (hits.length == 0 && testLen-- > 1) {
      hits = schnitthits(str1, str2, testLen);
    };
    schnittIx = Array.from(hits);
  };
  return schnittIx; // [[str1-Index, str2-Index, testLen], ...]
};
const commonStartString = (words) => {  // words = [str1, str2, ...], 
  // aus: https://stackoverflow.com/questions/1916218/find-the-longest-common-starting-substring-in-a-set-of-strings, 
  // Originalname commonSubstring; Lsg 1 (Fkt common_substring funktioniert nicht fehlerfrei)
  var iChar, iWord,
    refWord = words[0],
    lRefWord = refWord.length,
    lWords = words.length;
  for (iChar = 0; iChar < lRefWord; iChar += 1) {
    for (iWord = 1; iWord < lWords; iWord += 1) {
      if (refWord[iChar] !== words[iWord][iChar]) {
        return refWord.substring(0, iChar);
      }
    }
  }
  return refWord;
};
const getIntersect = (arr1, arr2) => {  // Schnittmenge zweier Arrays
  // aus: http://www.falsepositives.com/index.php/2009/12/01/javascript-function-to-get-the-intersect-of-2-arrays/
  var r = [], o = {}, l = arr2.length, i, v;
  for (i = 0; i < l; i++) {
    o[arr2[i]] = true;
  }
  l = arr1.length;
  for (i = 0; i < l; i++) {
    v = arr1[i];
    if (v in o) {
      r.push(v);
    }
  }
  return r;
};
const check3 = () => {
  let strArr = ["bdefgcd", "xxcdx", "abcde", "bdefgcde"];
  let sub = schnittstr(strArr);
  console.log(strArr);
  console.log(sub);
};
const check4 = () => {
  let s1 = "bcdefgcd";
  let s2 = "xcdxx";
  let st = schnitthits(s1, s2, 2);
  console.log(st);
};
const spliceTest = () => {
  let a1 = [1, 2, 3, 4];
  console.log(a1);
  let rem = a1.splice(2, 1)
  console.log(a1, ": rem", rem);
};
module.exports = { schnittstr, restarr };
