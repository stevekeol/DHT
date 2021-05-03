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

  
}