/**
 * routing-table
 * Author: stevekeol
 * Date: 2021-04-19 19:30
 * @TODO 
 * 1. 样式文件的导出: DHT.Id, DHT.RoutingTable, DHT.ClosestBucket, DHT.Contact
 * 2. 返回值的类型，先不管
 */
import { Bucket } from './bucket';
import { Id } from './id';
import { Contact } from './contact';
import { LookupList } from './lookupList';


export default class RoutingTable implements DHT.RoutingTable {
  root: DHT.Bucket = new Bucket(this.bucketSize);

  constructor(public readonly id: DHT.Id, public bucketSize: number) {}

  /**
   * 在路由表中，存储contact
   * @param {DHT.Contact} contact 联系人:id & endpoint
   * @note 当bucket已满且不允许分割时，调用者需要检查返回contact的合法性，然后再尝试添加新contact
   */
  public store(contact: DHT.Contact) {
    if (contact.id.equal(this.id))
      return null;
    let res = this.findBucket(contact);
    if(res.bucket.store(contact))
      return null;

    /** 当bucket已满且不允许分割,则返回最老的contact */
    if(!res.allowSplit || res.nth + 1 === Id.BIT_SIZE) {
      return res.bucket.oldest;
    }

    this.splitAndStore(contact, res);
    return null;
  }

  /**
   * 在路由表中，批量存储contact
   * @param {Array<DHT.Contact>} contacts 联系人数组
   */
  public storeSome(contacts: Array<DHT.Contact>) {
    contacts.forEach(contact => this.store(contact));
  }

  /**
   * 在路由表中，移除某个contact
   * @param {DHT.Contact} contact [description]
   */
  public remove(contact: DHT.Contact) {
    let res = this.findBucket(contact);
    res.bucket.remove(contact);
  }

  /**
   * 获取与给定id最接近的count个已知联系人
   * 理想情况下,返回离给定id最近的bucket中所有的contacts;
   * 如果没达到BUCKET_SIZE的大小，则需邻桶的配合;
   * @param {DHT.Id}    id 节点id
   * @param {number =  this.bucketSize} count 。。。
   */
  public find(id: DHT.Id, count: number = this.bucketSize) {
    const list = new LookupList(id, count);
    this.search(id, 0, this.root, count, list);
    return list.getContacts();
  }

  /**
   * 将XXX转换成字符串
   * @param {number = 0} indent 缩进量
   */
  public toString(indent: number = 0) {
    return nodeToString(this.root, '', indent);
  }

  /**
   * 将节点转换成字符串
   * @param {any}    node   待转换的节点
   * @param {string} prefix 添加的前缀(若需要)
   * @param {number} indent 缩进量
   */
  private nodeToString(node: any, prefix: string, indent: number) {
    let res = '';
    if (node instanceof Bucket) {
        res += new Array(indent).join(' ') + node.toString(indent + 4) + '\n';
    } else {
        res += new Array(indent).join(' ') + '+ ' + prefix + '0:\n';
        res += nodeToString(node.left, prefix + '0', indent + 4);
        res += new Array(indent).join(' ') + '+ ' + prefix + '1:\n';
        res += nodeToString(node.right, prefix + '1', indent + 4);
    }
    return res;
  }

  /**
   * 左右子树中递归查找XXX
   * @param {DHT.Contact}    id    [description]
   * @param {number}         rank  [description]
   * @param {DHT.Bucket}     node  [description]
   * @param {number}         count [description]
   * @param {DHT.LookupList} list  [description]
   */
  private search(id: DHT.Id, rank: number, node: DHT.Bucket, count: number, list: DHT.LookupList) {
    if(node instanceof Bucket) {
      list.insertMany(node.obtain());
      return;
    }
    const self = this;
    function findIn(main, other) {
      self.search(id, rank + 1, main, count, list);
      if(list.length < count) {
        self.search(id, rank + 1, other, count, list);
      }
    }
    if(id.at(rank)) {
      findIn(node.right, node.left);
    } else {
      findIn(node.left, node.right);
    }
  }

  /**
   * 查找最接近给定ID的存储桶
   * @param {DHT.Contact} contact 联系人
   * @note 最长公共前缀二叉树的逻辑
   */
  private findBucket(contact: DHT.Contact) {
    let parent = null;
    let node = this.root;
    let allowSplit = true;

    for(let i = 0; i < Id.BIT_SIZE; i++) {
      const bit = contact.id.at(i);
      allowSplit &= bit === this.id.at(i);
      if(node instanceof Bucket) {
        return {
          bit,
          parent,
          allowSplit,
          nth: i,
          bucket: node
        }
      }
      parent = node;
      node = bit ? node.right : node.left;
    }
  }

  /**
   * 切割桶，创建一个新的节点，并插入新的contact
   * @param {DHT.Contact} contact 联系人
   * @param {object} opt Bucket的超集
   * @note 根据联系人ID的opt.nth位，将opt.bucket左右拆分
   */
  private splitAndStore(contact: DHT.Contact, opt: object) {
    const node = {
      left: new Bucket(this.bucketSize);
      right: new Bucket(this.bucketSize);
    }
    opt.bucket.split(opt.nth, node.left, node.right);
    if(opt.parent === null) {
      this.root = node;
    } else if(opt.parent.left === opt.bucket) {
      opt.parent.left = node;
    } else {
      opt.parent.right = node;
    }
    let bucket = opt.bit ? node.right : node.left;
    return bucket.store(contact);
  }
}