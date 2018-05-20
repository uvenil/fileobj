const fk = (arr) => {
  arr.reverse();
  return arr;
};

let ar = [1, 2, 3];
console.log(ar);
const res = fk(ar);
console.log(ar);
console.log("res",res);

