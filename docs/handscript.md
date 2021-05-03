## MockRpc的优雅改写之路
+ [√] EventEmitter的class改写;
+ [] 


---

## Notice
+ []代码重构
```js
// return process.nextTick(function () {
//     return cb();
// });
return Promise.resolve().then(() => cb())
```

--- 

## How
+ Typescript中Buffer的使用
