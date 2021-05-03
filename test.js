function distanceTo(left, right) {
  let res = new Buffer(20);
  for(let i = 0; i < 20; i++) {
    res[i] = left[i] ^ right[i];
  }
  return res;
}

let left = '1nsa09nsan390san0bsa';
let right = '12nsj0amrbn439ansaam';

console.log(distanceTo(left, right))