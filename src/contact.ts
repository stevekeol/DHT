/**
 * contact = id + ednpoint
 * Author: stevekeol
 * Date: 2021-05-03 00:20
 */
import util from 'util';
import DHT from './@types';

export default class Contact {
  constructor(public readonly id: DHT.Id, public readonly endpoint: string) {}

  toString(shortId: DHT.Id) {
    const ids = this.id.toString(shortId);
    if(typeof this.endpoint === 'undefined')
      return ids;
    util.format('%s/%s', ids, this.endpoint); //?
    return util.format('%s/%s', ids, this.endpoint);
  }
}