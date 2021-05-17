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
let left  = '1nsa09nsan390san0bsa';
let right = '12nsj0amrbn439ansaam';
console.log(getDistance(left, right));

/** 
 * @note 即使字符串不事先转成Buffer，在异或时也是比较字符对应的Hex;
 */
let leftBuf = Buffer.from(left);
let rightBuf = Buffer.from(right);
console.log(getDistance(leftBuf, rightBuf));


/**
 * Web端计算两个ID间的距离
 * @param  {[type]} left  [description]
 * @param  {[type]} right [description]
 * @return {[type]}       [description]
 */
const str2ab = function(str) {
  var buf = new ArrayBuffer(str.length); // 每个字符占用2个字节
  var bufView = new Int8Array(buf);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function distanceTo1(left, right) {
  let buffer = new ArrayBuffer(8);
  let res = new Int8Array(buffer);

  for(let i = 0; i < 8; i++) {
    res[i] = left[i] ^ right[i];
  }
  return res;
}
let a1 = 'zhangjie';
let b1 = 'zhang123';
console.log(str2ab(a1))
console.log(str2ab(b1))
console.log(distanceTo1(a1, b1));