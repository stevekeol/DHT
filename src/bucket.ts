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

  /**
   * 根据每个contact的id的前nth位，将bucket切割成left和right两个bucket. 
   * @param {number} nth   id的前n位(前缀位数)
   * @param {Bucket} left  切割后的左子桶
   * @param {Bucket} right 切割后的右子桶
   */
  split(nth: number, left: Bucket, right: Bucket) {
    this._store.forEach(contact => {
      contact.id.at(nth) ? right.store(contact) : left.store(contact);
    })
  }

  /**
   * 将bucket中所有contact缀连并转成字符串
   * @TODO 待实现
   */
  toString() {
    console.log('Bucket.toString() is on the road...');
  }

  /**
   * 获取bucket当前的大小
   * @TODO Proxy可能更简单?
   * @HoToUse (new Bucket()).length
   */
  get length() {
    return this._store.length;
  }

  /**
   * 获取bucket中最旧的contact
   */
  get oldest() {
    return this._store.length === 0 ? null : this._store[0];
  }
}