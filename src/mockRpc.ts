/**
 * Simple no-network RPC implementation, for testing purposes.
 * Author: stevekeol
 * Date: 2021-04-18 17:30
 */

import EventEmitter from './Utils/EventEmitter';

export type Endpoint = string;
export default class MockRpc extends EventEmitter {
  constructor(public endpoint: Endpoint){
    super();
  }
}