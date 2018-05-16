const pathKey = 'Obj;d;g;i';
const pk = 'Obj[\"d\"][\"g\"][\"i\"]';
const pk2 = 'Obj[\"d\"]';
const pk3 = 'Obj["d"]';
const keyArr = pathKey.split(";");

let Obj = {};
// https://stackoverflow.com/questions/197769/when-is-javascripts-eval-not-evil
eval(pk3+"=7;");
// const str = JSON.stringify();
console.log(pk2);
// const str = JSON.parse(pk);
console.log(Obj);
