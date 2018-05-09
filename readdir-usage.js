const walk = require('./readdir');

const dir = "/home/micha/Schreibtisch/moduleMA";

walk(dir, function(err, results) {
  if (err) throw err;
  console.log(results);
});