# DHT

**DHT** 是一个基于Typescript，网络无关的[Distributed Hash Table](http://en.wikipedia.org/wiki/Distributed_hash_table)在[Kademlia](http://en.wikipedia.org/wiki/Kademlia)算法和数据结构下的实现. 同时支持Node端和Web端.

在本地节点视角: DHT就像一个哈希表。提供了两个主要的操作 `set(key, value)` 和 `get(key)` .

> DHT中的D，即分布式，是说这些键值对是存储在互联的节点网络中的.

> 值的一提的是，此处的DHT将网络层的RPC留给用户或第三方库.

## TODO
- the handling of time-driven behaviors: key/value pairs expiration, bucket refresh, replication, and pairs republish.
- 时间驱动行为的处理: 键值对到期，桶刷新，复制，键值对的重新发布

- an implementation of the Rpc usable out-of-the-box (it will be done as a separate library) even though it's possible to use your own already;
- 一个现成可用的RPC的实现

## TODO - 第一里程碑
> DHT(TS版)通过examples中的demo

- 选取vite, rollup, webpack等工具，使得DHT编译打包后适合Node端和Web端(参考bcoin在这块儿的实现)(ts.config.js中配置即可)
- 先把各个模块的类型代码就写在对应文件中，后期再解耦隔离
- 后面尝试将一些配置性的参数，从文件中移除(如id.js中的BIT_SIZE等)

## TODO - 第二里程碑
> 参考业界优秀论文，改进代码

- 以TS中优秀精简的写法重构代码;