/**
 * Dht: 在分布式网络中存储键值对
 * Author: stevekeol
 * Date: 2021-04-20 12:25
 * 
 * @Note `rpc`必须为DHT的本地node提供一些必要的Kadmelia RPC methods
 * @TODO 
 * 1. 类型文件的导出
 * 2. 返回值的类型，先不管
 * 3. Microtask的调整改写
 * 4. process.nextTick(cb);的意义何在啊
 */

import { asyncMap } from 'slide';
import Id from './id';
import RoutingTable from './routingTable';
import Lookup from './lookup';
import Contact from './contact';

/**
 * Kadmelia协议的几种消息对应的功能
 * ping: 测试节点是否仍在线
 * store: 在某个节点中存储一个键值对
 * findNode: 该消息的接收者将返回自己桶中离键值对最近的K个节点
 * findValue: 该消息的接收者存有请求者所请求的键的时候，将返回相应键的值(每一个RPC消息都包含一个发起者加入的随机值，来确保收到响应消息能够与之匹配)
 */
const RPC_FUNCTIONS: ReadonlyArray<string> = ['ping', 'store', 'findNode', 'findValue', 'receive'];

export default class Dht implements DHT.Dht {
  cache: object = {};
  locals: object = {};
  routes: DHT.RoutingTable;
  pendingContact: DHT.Contact | null = null;
  lookupOpts: {
    size: number;
    concurrency: number;
    findNode;
  }

  constructor(public readonly rpc: DHT.Rpc, public id: DHT.Id, public opts) {
    if(!this.checkInterface(rpc, RPC_FUNCTIONS))
      throw new Error("the RPC interface is not fully defined.");

    rpc.receive('ping', this.onPing.bind(this));
    rpc.receive('store', this.onStore.bind(this));
    rpc.receive('findNode', this.onFindNode(this));
    rpc.receive('findValue', this.onFindValue.bind(this));

    this.routes = new RoutingTable(id, opts.bucketSize);
    this.lookupOpts.size = opts.size;
    this.lookupOpts.concurrency = opts.concurrency;
    this.lookupOpts.findNode = this.findNode.bind(this);
  }

  /**
   * 使用随机ID创建Dht实例
   * @param {[type]}   rpc      [description]
   * @param {[type]}   seeds    [description]
   * @param {[type]}   opts     [description]
   * @param {Function} callback [description]
   */
  public spawn(rpc: DHT.Rpc, seeds: Array<DHT.Dht>, opts: any, callback) {
    if(typeof callback === 'undefined') {
      callback = opts;
      opts = {};
    }

    /** @TODO remove these props from here */
    opts.bucketSize = opts.bucketSize || 20;
    opts.concurrency = opts.concurrency || 3;
    opts.expireTime = opts.expireTime || 60 * 60 * 24;
    opts.refreshTime = opts.refreshTime || 60 * 60;
    opts.replicateTime = opts.replicateTime || 60 * 60;
    opts.republishTime = opts.republishTime || 60 * 60 * 24;

    Id.generate((err, id) => {
      if(err) return callback(err);
      let dht = new Dht(rpc, id, opts);
      dht.bootstrap(seeds, err => { callback(null, dht) });
    })
  }

  /**
   * 给定seeds的引导处理
   * @param {[type]}   seeds    [description]
   * @param {Function} callback [description]
   */
  public bootstrap(seeds: Array<any>, callback) {
    if(!seeds.length) {
      /**
       * @TODO process.nextTick()限制了只在NodeJS中
       */
      return process.nextTick(() => callback());
    }
    const self = this;
    let payload = {
      id: this.routes.id,
      targetId: this.routes.id
    }
    let remain = seeds.length;
    function bootstrapSome(endpoint, err, res) {
      --remain;
      if(err) {
        if(!remain) return self.bootstrapLookup(callback);
        return;
      }
      const contact = new Contact(res.remoteId, endpoint);
      self.routes.store(contact);
      if(!remain) {
        return self.bootstrapLookup(callback);
      }
    }
    seeds.forEach(endpoint => {
      this.rpc.ping(endpoint, payload, bootstrapSome(endpoint));
    })
  }

  /**
   * 在Dht中存储键值对
   * @param {[type]}   key      [description]
   * @param {[type]}   value    [description]
   * @param {Function} callback [description]
   */
  public set(key, value, callback) {
    const self = this;
    this.locals[key] = value;
    this.lookupKey(key, (err, id, contacts) => {
      if(err) return callback(err);
      self.storeToMany(key, value, contacts, callback);
    })
  }

  /**
   * 获取给定key对应的value
   * @param {[type]}   key      [description]
   * @param {Function} callback [description]
   */
  public get(key, callback) {
    const self = this;
    const value = this.peek(key);
    if(value) {
      /**
       * @TODO process.nextTick()限制了只在NodeJS中
       */
      return process.nextTick(cb.bind(null, null, val));
    }
    this.lookupKey(key, (err, id, contacts) => {
      if(err) return callback(err);
      if(!contacts.length) {
        return callback(null, void 0);
      }
      return self.getFrom(id, key, contacts, callback);
    })
  }

  /**
   * 关闭该Dht的rpc
   */
  public close() {
    this.rpc.close();
  }

  /**
   * 检查给定obj是否具有指定功能
   * @param  {DHT.Rpc}               obj   待检查的对象(rpc)
   * @param  {ReadonlyArray<string>} funcs 预定义的功能
   * @return {boolean}                     是否具有这些功能
   */
  private checkInterface(obj: DHT.Rpc, funcs: ReadonlyArray<string>): boolean {
    funcs.every(func => typeof obj[func] === 'function');
  }

  /**
   * 在Dht自己的id上进行查找
   * @param {Function} callback [description]
   * @note 可以填补路由表的副作用
   */
  private bootstrapLookup(callback) {
    const seeds = this.routes.find(this.routes.id, this.opts.concurrency);
    Lookup.proceed(this.routes.id, seeds, this.lookupOpts, (err, contacts) => callback());
  }  

  /**
   * 查找给定key对应的contacts
   * @param {[type]}   key      [description]
   * @param {Function} callback [description]
   */
  private lookupKey(key, callback) {
    const id = Id.fromKey(key);
    const seeds = this.routes.find(this.routes.id, this.opts.concurrency);
    Lookup.proceed(id, seeds, this.lookupOpts. (err, contacts) => callback(err, id, contacts));
  }

  /**
   * 将键值对存储在指定的contact中
   * @param {[type]}   key      [description]
   * @param {[type]}   value    [description]
   * @param {[type]}   contact  [description]
   * @param {Function} callback [description]
   */
  private storeTo(key, value, contact, callback) {
    if(contact.id.equal(this.routes.id)) {
      this.cache[key] = value;
      return process.nextTick(callback);
    }
    const payload = {
      id: this.routes.id,
      key,
      value
    }
    this.rpc.store(contact.endpoint, payload, (err, result) => callback());
  }

  /**
   * 将键值对存储在一些指定的contacts中
   * @param {[type]}   key      [description]
   * @param {[type]}   value    [description]
   * @param {[type]}   contacts [description]
   * @param {Function} callback [description]
   */
  private async storeToMany(key, value, contacts, callback) {
    const self = this;
    contacts.forEach(contact => {
      await self.storeTo(key, value, contact, callback);
    })
  }

  /**
   * 如果本地可用,就同步获取值
   * @param {[type]} key [description]
   */
  private peek(key) {
    this.cache.hasOwnProperty(key) ? this.cache[key] : null;
  }

  /**
   * 从contacts数组中获取指定key对应的节点???
   * @param {[type]}   id       [description]
   * @param {[type]}   key      [description]
   * @param {[type]}   contacts [description]
   * @param {Function} callback [description]
   */
  private getFrom(id, key, contacts, callback) {
    const self = this;
    const contact = contacts.shift();
    const payload = {
      id: this.routes.id,
      targetId: this.routes.id,
      key
    }
    this.rpc.findValue(contact.ednpoint, payload, (err, result) => {
      if(err || typeof result.value === 'undefined') {
        if(!contacts.length) {
          return callback(null, void 0);
        }
        return self.getFrom(id, key, contacts,callback);
      }
      return callback(null, result.value);
    })
  }

  /**
   * Lookup算法助手
   * @param {[type]}   contact  [description]
   * @param {[type]}   targetId [description]
   * @param {Function} callback [description]
   */
  private findNode(contact, targetId, callback) {
    const self = this;
    const payload = {
      id: this.routes.id,
      targetId
    }
    this.rpc.findNode(contact.endpoint, payload, (err, result) => {
      if(err) return callback(err);
      self.discovered(contact.id, contact.endpoint);
      return callback(null, result.contacts);
    })
  }

  /**
   * 处理刚发现的contact
   * @param {[type]} id       [description]
   * @param {[type]} endpoint [description]
   */
  private discovered(id: DHT.Id, endpoint) {
    const contact = new Contact(id, endpoint);
    /**
     * @TODO 
     * 不应该一次又一次的检查相同的old contact. 警惕DoS攻击
     * 刚ping成功的contact应该在数分钟内持续有效，oldContact应该数小时/数天有效
     * 也许应该去ping 2nd oldest, 3rd... ?
     */
    const oldContact = this.routes.store(contact);
    if(oldContact && !this.pendingContact) {
      const self = this;
      this.pendingContact = oldContact;
      this.rpc.ping(oldContact.endpoint, { id: this.routes.id }, (err, res) => {
        self.pendingContact = null;
        if(!(err || !res.remoteId.equal(contact.id))) return;
        self.routes.remove(oldContact);
        self.routes.store(contact);
      })
    }
  }

  /**
   * 代表指定的contact: 去ping该DHT
   * @param {[type]} endpoint [description]
   * @param {[type]} payload  [description]
   */
  private onPing(endpoint, payload) {
    this.discovered(payload.id, endpoint);
    return { remoteId: this.routes.id };
  }

  /**
   * 代表指定的contact: 存储key/value
   * @param {[type]} endpoint [description]
   * @param {[type]} payload  [description]
   */
  private onStore(endpoint, payload) {
    this.discovered(payload.id, endpoint);
    this.cache[payload.key] = payload.value;
  }

  /**
   * 获取离指定的id最近的已知节点们
   * @param {[type]} endpoint [description]
   * @param {[type]} payload  [description]
   */
  private onFindNode(endpoint, payload) {
    this.discovered(payload.id, endpoint);
    return {
      contacts: this.routes.find(payload.targetId)
    };
  }

  /**
   * 获取离指定的id最近的已知节点们;或者直接返回与id相关联的值
   * @param {[type]} endpoint [description]
   * @param {[type]} payload  [description]
   */
  private onFindValue(endpoint, payload) {
    this.discovered(payload.id, endpoint);
    if(this.cache.hasOwnProperty(payload.key))
      return {
        value: this.cache[payload.key]
      };
    return {
      contacts: this.routes.find(payload.targetId)
    };
  }
}