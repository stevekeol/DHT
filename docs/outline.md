# 源码梳理

## memo
+ mock-rpc.js: 依赖了nodejs中的events和utils
> 先暂用，后再替换为自己的封装原生库
+ 先梳理js版的实现，熟悉后再改写

## demo.js
> 该demo的含义是: 
1. 在localhost:9876上创建一个节点1,并返回该节点的dht1;
2. 创建成功后,以localhost:9876为种子在localhost:4321上创建节点2,并返回该节点的dht2;
3. 在节点1上设置key:value,在节点2上去取该key,并将value与原值对比;

因此，可以搞清楚三个问题:

+ 创建节点时,内部创建dht的机制是怎样的?
+ 节点1上set(key, value)时,内部的处理机制是怎样的?
+ 节点2上get(key)时,节点2和节点1的处理机制和衔接是怎样的?

## 创建节点
> 创建的节点由dht和rpc组成
```js
const spawn(endpoint, seeds, callback) {
  MockRpc.spawn(endpoint, (err, rpc) => {
    Dht.spawn(rpc, seeds, (err, dht) => {
      callback(err, dht);
    })
  })
}
```
> 【疑问】: 创建的节点,endpoint采用ip:port的话...

## `MockRpc.spawn(endpoint, (err, rpc) => {})` 

## 

+ MockRpc.spwan(endpoint, seeds, cb):
+ Dht.spwan(endpoint, cb):

```js                                                                      
Dht {                                                                      
 _cache: {},                                                               
 _locals: {},                                                              
 _routes: RoutingTable { _bucketSize: 20, _root: Bucket { _store: [] } },  
 _opts: {                                                                  
   bucketSize: 20,                                                         
   concurrency: 3,                                                         
   expireTime: 86400,                                                      
   refreshTime: 3600,                                                      
   replicateTime: 3600,                                                    
   republishTime: 86400                                                    
 },                                                                        
 _pendingContact: null,                                                    
 _lookupOpts: { size: 20, concurrency: 3, findNode: [Function: bound ] }   
}
```
```                                                                        
MockRpc {                                                                   
 _events: [Object: null prototype] {},                                     
 _eventsCount: 0,                                                          
 _maxListeners: undefined,                                                 
 _endpoint: 'localhost:9876',                                              
 _handlers: {                                                              
   ping: [Function: bound ],                                               
   store: [Function: bound ],                                              
   findNode: [Function: bound ],                                           
   findValue: [Function: bound ]                                           
 },                                                                        
 [Symbol(kCapture)]: false                                                 
}
```