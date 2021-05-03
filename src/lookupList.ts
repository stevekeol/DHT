/**
 * lookupList
 * Author: stevekeol
 * createDate: 2021-05-03 17:23
 */

import Id from './id';
import Contact from './contact';

type Capacity = number;
type Slot = {
  contact: Contact;
  processed: boolean;
}

export default class LookupList {
  private slots: Array<Slot> = [];
  constructor(public id: Id, private _capacity: Capacity) {
    if(_capacity <= 0)
      throw new Error('invalid capacity');
  }

  /**
   * 找出该list中未处理的一个conatct
   */
  next() {

  }

  /**
   * 使用新发现的contacts更新该list
   * @param {Array<Contact>} contacts [description]
   */
  insertMany(contacts: Array<Contact>) {

  }

  /**
   * 使用新发现的contact更新该list
   * 1. 若contact已存在,则丢弃;
   * 2. 若contact比list中最远的contact还远,仍丢弃;
   * 3. 此时就可以insert该contact,并丢弃最远的contact;
   * @param {Contact} contact [description]
   */
  insert(contact: Contact) {

  }

  /**
   * 从该list中丢弃指定的contact. 
   * Example: 无响应的contacts(unresponding contacts)
   * @param {Contact} contact [description]
   * @return 成功丢弃则返回true
   */
  remove(contact: Contact) {

  }

  /**
   * 获取所有已知的contacts
   */
  getContacts() {

  }

  /**
   * 获取该list中contacts的实际个数?
   */
  get length() {
    return this.slots.length;
  }

  /**
   * 获取该list创建时设定的容量大小
   */
  get capacity() {
    return this._capacity;
  }

  /**
   * 将该list所有Slot{contact, processed}字符串化
   * @param {any} shortIds [description]
   */
  toString(shortIds: any) {
    //
  }
} 