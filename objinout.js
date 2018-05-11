'use strict'

const objinout = (obj) => {
  let inoutObj = {};
  let outKey, inKey;

  for (outKey in obj) {
    for (inKey in obj[outKey]) {
      inoutObj[inKey] = inoutObj[inKey] || {};
      if (obj[outKey][inKey] !== undefined) {
        inoutObj[inKey][outKey] = obj[outKey][inKey];
      }
    }
  }
  return inoutObj;
};
module.exports = objinout;