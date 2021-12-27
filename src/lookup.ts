/**
 * lookup(为查找某个节点创建的查找器)
 * Author: stevekeol
 * createDate: 2021-05-06 01:50
 * updateDate: 2021-05-31 12:10
 */
import EventEmitter from './utils/EventEmitter';
import LookupList from './lookupList';
import Contact from './contact';
import Id from './id';

export default class Lookup extends EventEmitter {
  private list: LookupList;
  private concurrents: number = 0;

  /**
   * constructor
   * @param {Id}        public targetId  待查找的节点Id     
   * @param {Contact[]} seeds  用于查找targetId，传入的种子节点
   * @param {any}       public opts          [description]
   */
  constructor(public targetId: Id, seeds: Contact[], public opts: any) {
    super();
    this.list = new LookupList(targetId, opts.size);
    this.list.insertMany(seeds);
  }

  /**
   * proceed
   * @param {Id}        targetId [description]
   * @param {Contact[]} seeds    [description]
   * @param {any}       opts     [description]
   * @param {()     =>       {}}        callback [description]
   */
  static proceed(targetId: Id, seeds: Contact[], opts: any, callback: () => {}) {
    /** @TODO callback更合适的处理方式 */
    let lookup = new Lookup(targetId, seeds, opts);
    lookup.proceed(callback);
    return lookup;
  }

  /**
   * proceed
   * @param {() => {}} callback [description]
   */
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

  /**
   * [forContact description]
   * @param {Contact} contact Lookup列表中尚未处理的某个节点
   * @param {()   =>      {}}        callback [description]
   */
  forContact(contact: Contact, callback) {
    const self = this;
    /** opts.findNode() 在哪儿定义的? */
    this.opts.findNode(contact, this.targetId, (err, contacts) => {
      if(err) {
        self.list.remove(contact);
      } else {
        self.list.insertMany(contacts);
      }
      const next = self.list.next();
      if(next)
        return self.forContact(next, callback);
      --self.concurrents;
      if(self.concurrents === 0)
        return callback(null, self.list.getContacts());
    })
  }
}