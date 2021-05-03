/**
 * @TODO 待移除crypto和util
 */
import crypto from 'crypto';
import util from 'util';

export default class Id {
  static readonly SIZE: number = 20;
  static readonly BIT_SIZE: number = Id.SIZE * 8;
  static readonly SHORT_STR_PRE_LEN: number = 5;
  static readonly SHORT_STR_SUF_LEN: number = 2;

  /**
   * [constructor description]
   * @param {Buffer} public buf [description]
   * @TODO buffer在TS中的类型应该怎么定义?
   */
  constructor(public buf: Buffer) {
    if(buf.length !== Id.SIZE) {
      throw new Error('invalid buffer');
    };
  }

  /**
   * 计算表示为Buffer的两个节点ID之间的距离
   * @param {Id} other 待比较的contact
   * @TODO 待检验new Int8Array(buffer)是否位数和type有效
   */
  distanceTo(other: Id) {
    let buffer = new ArrayBuffer(Id.SIZE);
    let res = new Int8Array(buffer);

    for(let i = 0; i < Id.SIZE; i++) {
      res[i] = this.buf[i] ^ other.buf[i];
    }
    return res;
  }

  /**
   * 比较本地id和给定的两个id: first和second的距离谁更近
   * 距离相等,返回0;
   * first距离更近,返回1;
   * second距离更近，返回-1;
   * @param {Id} first  待比较距离的Id
   * @param {Id} second 待比较距离的Id
   */
  compareDistance(first: Id, second: Id) {
    for(let i = 0; i < Id.SIZE; i++) {
      let bt1 = this.buf[i] ^ first.buf[i];
      let bt2 = this.buf[i] ^ second.buf[i];
      if(bt1 > bt2) return -1;
      if(bt1 < bt2) return 1;
    }
    return 0;
  }

  /**
   * 判断当前id和给定的id是否相等
   * @param {Id} other [description]
   */
  equal(other: Id) {
    for(let i = 0; i < Id.SIZE; i++) {
      if(this.buf[i] !== other.buf[i])
        return false;
      return true;
    }
  }

  /**
   * 提取给定索引位置的bit
   * @param {[type]} index 给定的索引位置
   */
  at(index: number) {
    return (this.buf[index / 8 | 0] & (1 << (7 - index % 8))) > 0;
  }

  /**
   * 在给定的索引位置设置bit位
   * @param {number} index 给定的索引位置
   * @param {number} bit   给定位置需要设置的bit值
   */
  set(index: number, bit: number) {
    let _index = index / 8 | 0;
    let mask = 1 << (7 - index % 8);
    if(bit) {
      this.buf[_index] |= mask;
    } else {
      this.buf[index] &= 255 ^ mask;
    }
  }

  /**
   * 将本地ID转为16进制,可选择是否缩写
   * @param {boolean} short 是否缩写
   */
  toString(short: boolean) {
    let str = this.buf.toString('hex');
    if(short) {
      return util.format('%s..%s', str.slice(0, Id.SHORT_STR_PRE_LEN), str.slice(str.length - Id.SHORT_STR_SUF_LEN));
    }
    return str;
  }

  /**
   * 随机生成一个节点的标识符,并执行回调
   * @param {Function} callback [description]
   */
  static generate(callback) {
    crypto.randomBytes(Id.SIZE, (err: Error, buf: Buffer) => {
      if(err)
        callback(err);
      callback(null, new Id(buf));
    });
  }

  /**
   * 利用给定的key为节点生成一个标识符
   * @param {string} key [description]
   * @TODO SHA1的安全性有问题,需要改进
   */
  static fromKey(key: string) {
    let shasum = crypto.createHash('sha1');
    shasum.update(key);
    return new Id(shasum.digest());
  }

  /**
   * 将1和0组成的字符串转为数组前缀
   * Example: '101' => [true, false, true]
   * @param {string} str [description]
   */
  static convertPrefix(str: string) {
    let res = new Array(str.length);
    for(let i = 0; i < str.length; i++) {
      res[i] = str[i] === '1';
    }
    return res;
  }

  /**
   * 创建标识符: 0
   * @TODO TS中buffer的使用
   */
  static zero() {
    let buffer = new ArrayBuffer(Id.SIZE);
    let buf = new Int8Array(buffer);
    for(let i = 0; i < Id.SIZE; i++) {
      buf[i] = 0;
    }
    return new Id(buf);
  }


  /**
   * 利用给定的前缀为节点生成一个标识符
   * @param {string | Array<boolean>} prefix 给定的id前缀(10字符串/boolean数组)
   */
  static fromPrefix(prefix: string | Array<boolean>) {
    if(prefix.length >= Id.SIZE)
      throw new Error("id prefix is too long");

    let id = Id.zero();
    if(typeof prefix === 'string')
      prefix = Id.convertPrefix(prefix);
    for(let i = 0; i < prefix.length; i++)
      id.set(i, prefix[i] ? 1 : 0);

    return id;
  }

  static fromHex(prefix, suffix) {
    let id = Id.zero();
    // 假如buf: Buffer的话，buf.write()固然没问题，但...
    id.buf.write(prefix, 0, 0, 'hex');
    if(suffix) {
      id.buf.write(suffix, Id.SIZE - suffix.length / 2, 0, 'hex');
    }
    return id;
  }
};