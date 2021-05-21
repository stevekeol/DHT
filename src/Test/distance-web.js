/**
 * Web端计算两个ID间的距离
 * @param  {[type]} left  [description]
 * @param  {[type]} right [description]
 * @return {[type]}       [description]
 */

var a = '1asa09nsan390san0bsa';
var b = '12nsj0amrbn439ansaam';

function str2buf(str) {
  let buffer = new ArrayBuffer(str.length);
  let dataView = new Uint8Array(buffer);

  for(let i = 0; i < str.length; i++) {
    dataView[i] = str[i].charCodeAt();
  }

  return dataView;
}

function getDistance(left, right) {
  let length = Math.max(left.length, right.length);
  let buffer = new ArrayBuffer(length);
  let view   = new Uint8Array(buffer);
  for(let i = 0; i < length; i++) {
    view[i] = left[i] ^ right[i];
  }
  return view;
}

function toString(arrBuf) {
  let str = '';
  for(let i = 0; i < 20; i++) {
    let item = arrBuf[i].toString(16);
    str += item.length > 1 ? item : '0' + item;
  }
  return str;
}

let distance = getDistance(str2buf(a), str2buf(b))
console.log(distance);
console.log(toString(distance));





// Function.prototype._bind = function(thisObj) {
//   // 判断是否为函数调用
//   if(typeof target !== 'function' || Object.prototype.toString().call(target) !== '[object Function]') {
//     throw new TypeError(this + ' must be a function');
//   }
//   const self = this;
//   const args = [...arguments].slice(1);
//   let bound = function() {
//     let finalArgs = [...args, ...arguments];
//     //检测是否被new调用
//     if(new.target !== undefined) {
//       let result = self.apply(this, finalArgs);
//       if(result instanceof Object) {
//         return result;
//       }
//       return this;
//     }
//   }
// }