/**
 * bucket
 * Author: stevekeol
 * Date: 2021-05-03 00:52
 */

import Id from './id';
import Contact from './contact';


/**
 * 存储contacts(头旧尾新)
 * contact = id + endpoint; endpoint 可变
 */
export default class Bucket {
  private _store: Array<Contact> = [];
  constructor(public readonly capacity: number) {
    if(capacity <= 0)
      throw new Error('invalid bucket capacity');
  }


  /**
   * 移除一个contact
   * 成功移除时,返回true; 无该contact时,返回false;
   * @param {Contact} contact 联系对象
   */
  remove(contact: Contact) {
    this._store.forEach((item, index) => {
      if(item.id.equal(contact.id)) {
        this._store.splice(index, 1);
        return true;
      }
    })
    return false;
  }

  /**
   * 存储一个新的contact
   * 假如有旧的该contact,则先移除;
   * 当bucket中无更多空间时,返回false;
   * 当bucket中有空间,则将该contact后缀在队尾;
   * @param {Contact} contact 联系对象
   */
  store(contact: Contact) {
    this.remove(contact);
    if(this._store.length === this.capacity)
      return false;
    this._store.push(contact);
    return true;
  }


  /**
   * 从bucket中获取n个contacts(不足则取尽)
   * @param {number} n 希望取出的contact的个数
   */
  obtain(n: number) {
    if(typeof n === 'undefined')
      n = this._store.length;
    if(this._store.length <= n)
      return this._store;
    return this._store.slice(0, n);
  }
}