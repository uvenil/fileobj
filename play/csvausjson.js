const { jsonAusOrdner, csvAusJson, savecsvjson, filelistfilter } = require("./../module/jsoncsv");

const jsonObj = {
  "a++license": "ISC",
  "a++dependencies": {
    "express": "^4.14.0",
    "moment": "^2.15.1",
    "socket.io": "^1.4.8"
  }
};
const zuerstZ = true;
const csv = csvAusJson(jsonObj, zuerstZ);
console.log("csv",csv);
