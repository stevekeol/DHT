
/**
 * Simple no-network RPC implementation, for testing purposes.
 * Author: stevekeol
 * Date: 2021-04-18 17:30
 * UpdateDate: 2021-05-01 22:35
 */

import EventEmitter from './Utils/EventEmitter';

export type Endpoint = string;
export type Handlers = {
  //
}

// interface MockRpc {
//   on(event: 'hello', listener: (name: string) => void): this;
//   on(event: string, listener: Function): this;
// }

class MockRpc extends EventEmitter {
  private handlers: Handlers = {};
  private glNetwork: Map<string, string>; //待
  private readonly TIMEOUT: number = 500;

  constructor(public endpoint: Endpoint) {
    super();
    this.glNetwork[endpoint] = this;
  }

  get() {
    return this.endpoint;
  }

  static spawn() {
    process.nextTick((endpoint, callback) => {
      callback(null, new MockRpc(endpoint));
    })
  }

  private error(code, message) {
    const err = new Error(message) as any;
    err.code = code; 
    return err;
  }  

  close() {
    delete this.glNetwork[this.endpoint];
  }

  send(message, endpoint, payload, callback) {
    if(!endpoint) {
      return process.nextTick(() => callback('EINVALIDEP', 'invalid endpoint'))
    }

    const self = this;
    const node = this.glNetwork[endpoint];
    let res = false;
    setTimeout(() => {
      if(res) return;
      res = true;
      return callback(this.error('TIMEOUT', 'mock rpc timeout'))
    }, this.TIMEOUT);

    if(typeof node === 'undefined') return;
    setTimeout(() => {
      let result;
      if(res) return;
      res = true;
      try {
        result = node.handlers[message](self.endpoint, payload);
      } catch (err) {
        node.emit('error', err);
        return callback(this.error('EREMOTEERR', 'remote node errored'));
      }
      return callback(null, result);
    }, 0);
  }

  ping(endpoint, payload, callback) {
    this.send('ping', endpoint, payload, callback);
  }

  store(endpoint, payload, callback) {
    this.send('store', endpoint, payload, callback);
  }

  findNode(endpoint, payload, callback) {
    this.send('findNode', endpoint, payload, callback);
  }

  receive(message, handler) {
    if(typeof handler === 'undefined')
      return this.handlers[message];
    if(this.handlers[message])
      throw this.error('EHANDLEREXISTS', `a handler is already registered for: ${message}`);
    this.handlers[message] = handler;
  }
}

export default MockRpc;