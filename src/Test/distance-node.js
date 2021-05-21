const crypto =require('crypto');
/**
 * NodeJS端计算两个ID间的距离
 * @param  {[type]} left  [description]
 * @param  {[type]} right [description]
 * @return {[type]}       [description]
 */
function getDistance(left, right) {
  let res = new Buffer.alloc(20);
  for(let i = 0; i < 20; i++) {
    res[i] = left[i] ^ right[i];
  }
  return res;
}

/** 
 * @note 即使字符串不事先转成Buffer，在异或时也是比较字符对应的Hex;
 */
let left  = '1asa09nsan390san0bsa';
let right = '12nsj0amrbn439ansaam';
console.log(getDistance(left, right));

/** 
 * @note 即使字符串不事先转成Buffer，在异或时也是比较字符对应的Hex;
 */
let leftBuf = Buffer.from(left);
let rightBuf = Buffer.from(right);
console.log(leftBuf);
console.log(rightBuf);
console.log(getDistance(leftBuf, rightBuf));

console.log('------')

//test
crypto.randomBytes(20, (err, buf) => {
  if(err)
    console.log(err);
  console.log(buf);
});

let shasum = crypto.createHash('sha1');
shasum.update('jiege');
console.log(shasum.digest())