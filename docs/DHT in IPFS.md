# The theory and implement of DHT in libp2p
> [libp2p-dht](https://github.com/libp2p/js-libp2p-kad-dht/blob/master/docs/IMPL_SUMMARY.MD)

## Introduce

#### Identity
`libp2p`中节点有两种身份:
+ `provider`: 通过使用DHT，广而告之自己拥有某个特定的内容片段;
+ `querying`: 通过使用DHT，找出拥有某个特定内容片段的某个/些节点;

> 内容片段被建模为由key标识的value, 其中key和value都是Buffers.

#### DHT中的标识符
`libp2p`的DHT中的标识符使用SHA256:
+ 对`peers`而言，DHT的标识符是`PeerId`的哈希;
+ 对`content`而言，DHT的标识符是内容片段的key的哈希;

## HowToUse

#### 查找节点
```js
findPeer(PeerId): PeerInfo;
```
地址空间太大（2^256）势必导致DHT中ids的间隔太大，且节点会频繁的进出DHT;
因此，为了找到某个特定的节点:
+ `querying node`将`PeerId`转换成`DHT id`;
+ `querying node`向已知的，且离该`DHT id`最近的那些节点发送一个请求;
+ 那些节点返回他们已知的，且离该`DHT id`最近的节点;
+ 该`querying node`将响应`closest peers`排序，并递归的查询离该`DHT id`最近的节点，直到找到该节点或查询完所有的`closest peers`;

#### 存储键值
```js
put(key, value);
```
为了在DHT中存储一个值, `provider node`需要:
+ 将该`key`转换为`DHT id`;
+ 遵循上述`closest peers`算法，找出离该`DHT id`最近的那些节点;
+ 将值发送给那些最近的节点;

> 注意: `DHT nodes`只会存储那些被`validators`接受的值. 可通过配置来验证键/值，以确保节点只存储其关心的内容类型;

#### 读取键值
```js
get(key): [value];
```
要从DHT中取出某个值，`querying node`需要:
+ 将该`key`转换为`DHT id`;
+ 遵循上述`closest peers`算法，找出离该`DHT id`最近的那些节点;
+ 在该算法的每一次迭代中，如果某个节点拥有该value则自主返回(除了那些更近的节点 - 何解?);

> 注意: 某个特定的key对应的value是被多个节点存储的，这些节点是异步的接收`put(key, value)`请求的，因此这些节点对于相同的key是有可能存储不同的values的； 因此，可能针对DHT的 `get(key)` 会从那些靠近该key的节点中收集不同的values。DHT拥有`selectors`，可用来配置选择`最佳的`value。

#### PROVIDE
```js
provide(key)
```
`provider node`为了广而告之它拥有某个key对应的content，`provider node`需要:
+ 将`key`转换成`DHT id`;
+ 遵循上述`closest peers`算法，找出离该`DHT id`最近的那些节点;
+ 向这些节点发送`provide`消息;
+ 这些邻居节点存储该```provider```节点和该```key```的关联信息;

#### FIND_PROVIDE
```js
findProviders(key): [PeerInfo]
```
为了找到某个特定key对应的的`providers`，`querying node`需要:
+ 将`key`转换成`DHT id`;
+ 遵循上述`closest peers`算法，找出离该`DHT id`最近的那些节点;
+ 在该算法的每一次迭代过程中，加入某个`peer`知道哪些`nodes`在供应该`value`，该`peer`直接响应这些`provider nodes`（除了那些更近的节点 - 何解?）