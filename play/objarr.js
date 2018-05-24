const check1 = () => {
  console.log("- check1 -", this.name);
  const o0 = { "a": 1, "b": 2 };
  const o1 = { "a": 1, "b": { "e": 5 } };
  const o2 = { "d": { "g": { "i": 7 }, "h": 6 }, "e": { "i": 8 } }; // "c": { "f": 5 },
  const o3 = { ...o1, ...o2 };

  // console.log("o0 o1", o0,"  ",o1);
  let a1 = [o0, o1];
  console.log("a1", a1);
  let o5 = { "a": 1 };
  let o6 = { "b": 2 };
  
  // let a5 = [].push({ "a": 1 });//[{...jsonZ}, jsonS]; !!!! Problem Array aus Objekten
  // let a5 = [].push(o5);//[{...jsonZ}, jsonS]; !!!! Problem Array aus Objekten
  let a5 = [1,4].push("as");//[{...jsonZ}, jsonS]; !!!! Problem Array aus Objekten
  let a9 = [o5];
  let a8 = [o5, o6];
  // console.log("a5",a5);
  console.log("a5",JSON.stringify(a5));
  
  console.log("a8", a8);

};
check1();
