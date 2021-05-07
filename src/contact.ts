/**
 * contact = id + ednpoint
 * Author: stevekeol
 * Date: 2021-05-03 00:20
 */
import DHT from './types';

export default class Contact {
  constructor(public readonly id: DHT.Id, public readonly endpoint: string) {}

  toString(shortId: DHT.Id) {
    const ids = this.id.toString(shortId);
    if(typeof this.endpoint === 'undefined')
      return ids;
    return `${ids}/${this.endpoint}`;
  }
}