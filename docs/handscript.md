## MockRpc的优雅改写之路
+ [√] EventEmitter的class改写;
+ [] [DingTalk-sdk的类型系统和代码架构](https://github.com/Luncher/alipay/blob/master/src/config/index.ts)


---

## Notice
+ []代码重构
```js
// return process.nextTick(function () {
//     return cb();
// });
return Promise.resolve().then(() => cb())
```

> 是否可以参考 [ipfs中dht的js实现](https://github.com/libp2p/js-libp2p-kad-dht)
--- 

## How
+ Typescript中Buffer的使用

## TODO
+ [] 覆盖toString
+ [] import { asyncMap } from 'slide';多个异步任务按序执行 （async/await?）
```js
  private async storeToMany(key, value, contacts, callback) {
    const self = this;
    contacts.forEach(contact => {
      await self.storeTo(key, value, contact, callback);
    })
  }
```
+ [] import {crypto} from 'crypto'; crypto.randomBytes和crypto.createHash的web原生替代;
```js
window.crypto.getRandomValues(array);
```
+ [] Int16Array 和 NodeJS中的Buffer的类型对标和内置方法对标

