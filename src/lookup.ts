/**
 * lookup
 * Author: stevekeol
 * createDate: 2021-05-06 01:50
 */
import util from 'util';
import EventEmitter from './Utils/EventEmitter';
import LookupList from './lookupList';

export default class Lookup extends EventEmitter {
  private list;
  private concurrents: number = 0;

  constructor(public targetId: any, seeds: any[], public opts: any) {
    super();
    this.list = new LookupList(targetId, opts.size);
    this.list.insertMany(seeds);
  }

  static proceed(targetId, seeds, opts, callback) {
    /** @TODO callback更合适的处理方式 */
    let lookup = new Lookup(targetId, seeds, opts, callback);
    lookup.proceed(callback);
    return lookup;
  }

  proceed(callback) {
    for(let i = 0; i < this.opts.concurrency; i++) {
      let next = this.list.next();
      if(!next) break;
      ++this.concurrents;
      this.forContact(next, callback);
    }
    if(this.concurrents === 0)
      return callback(null, []);
  }

  forContact(contact, callback) {
    const self = this;
    this.opts.findNode(contact, this.targetId, (err, contacts) => {
      if(err) {
        self.list.remove(contact);
      } else {
        self.list.insertMany(contacts);
      }
      const next = self.list.next();
      if(next != null)
        return self.forContact(next, callback);
      --self.concurrents;
      if(self.concurrents === 0)
        return callback(null, self.list.getContacts());
    })
  }
}
