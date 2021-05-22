type Bit = 1 | 0; // 需统一暴露

/**
 * @note nodejs版的id长度为20位(SHA1);web版的id长度为32位(SHA256)
 */
export default class Id {
  static readonly SIZE: number = 32;
  static readonly BIT_SIZE: number = Id.SIZE * 8;
  static readonly SHORT_STR_PRE_LEN: number = 5; //id缩写前缀位数
  static readonly SHORT_STR_SUF_LEN: number = 2; //id缩写后缀位数
  buf: Uint8Array;

  /**
   * [constructor description]
   * @param {Buffer} public buf [description]
   * @TODO buffer在TS中的类型应该怎么定义?
   * @note 不同于Nodejs环境下通过id的Buffer直接构建该id; 
   *       web环境下设定为id的String构建id，同时内部初始化ArrayBuffer,用于异或计算等;
   */
  constructor(public id: string) {
    if(id.length !== Id.SIZE) {
      throw new Error('invalid id');
    };
    this.buf = Id.getIdBuf(id);
  }

  /**
   * 将string转换成ArrayBuffer
   * @param {string} id 节点的原始id
   * @return {Uint8Array} buf 节点id对应的ArrayBuffer
   * @note 采用ArrayBuffer是为了满足js中按位异或的操作(不能直接异或字符)
   *
   * @todo str => U8A: U8A = new TextEncoder().encode(str);
   */
  static getIdBuf(id: string) {
    if(id.length !== Id.SIZE) {
      throw new Error('invalid id');
    };    
    let buffer = new ArrayBuffer(Id.SIZE);
    let dataView = new Uint8Array(buffer);
    for(let i = 0; i < Id.SIZE; i++) {
      /** 取出每个字符的ASCII码依次放在ArrayBuffer中 */
      dataView[i] = String.prototype.charCodeAt(i);
    }
    return dataView;
  }

  /**
   * 计算表示为ArrayBuffer的两个节点id之间的距离
   * @param {Id} other 待比较的contact
   * @return {Uint8Array} dataView 距离值对应的ArrayBuffer
   */
  distanceTo(other: Id) {
    let buffer = new ArrayBuffer(Id.SIZE);
    let dataView = new Uint8Array(buffer);
    for(let i = 0; i < Id.SIZE; i++) {
      /** 每个字符对应的ASCII码依次按位异或 */
      dataView[i] = this.buf[i] ^ other.buf[i];
    }
    return dataView;
  }

  /**
   * 比较本地id和给定的两个id(first和second)的距离谁更近
   * first距离更远,返回1;
   * second距离更远，返回-1;
   * 距离相等,返回0;
   * @param {Id} left  待比较距离的Id
   * @param {Id} right 待比较距离的Id
   * @return {Number} 
   */
  compareDistance(left: Id, right: Id) {
    for(let i = 0; i < Id.SIZE; i++) {
      let bt1 = this.buf[i] ^ left.buf[i];
      let bt2 = this.buf[i] ^ right.buf[i];
      if(bt1 > bt2) return 1;
      if(bt1 < bt2) return -1;
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
   * 提取字符串形式的id对应的二进制串，对应的索引位置的bit位
   * @param {number} index 字符串id对应二进制的索引位置
   * @note 获取某个bit位的值的按位操作，骚!(@stevekeol)
   * @note 主要用于前缀二叉树的判断处理
   */
  at(index: number) {
    return (this.buf[index / 8 | 0] & (1 << (7 - index % 8))) > 0;
  }

  /**
   * 字符串id对应的二进制中，在给定的索引位置设置bit位
   * @param {number} index 给定的索引位置
   * @param {Bit} bit   给定位置需要设置的bit值
   */
  set(index: number, bit: Bit) {
    let miniIndex = index / 8 | 0;
    let mask = 1 << (7 - index % 8);
    if(bit) {
      this.buf[miniIndex] |= mask;
    } else {
      this.buf[index] &= 255 ^ mask;
    }
  }

  /**
   * 将本地id转为16进制,可选择是否缩写
   * @param {boolean} short 是否缩写
   */
  toString(short: boolean) {
    let str = this.buf.map(code => code.toString(16).padStart(2, 0)).join('');
    if(short) {
      return `${str.slice(0, Id.SHORT_STR_PRE_LEN)}..${str.slice(str.length - Id.SHORT_STR_SUF_LEN)}`;
    }
    return str;
  }

  /**
   * 随机生成一个节点的标识符id,并执行回调
   * @param {Function} callback 成功生成节点标识符后，待执行的回调
   */
  static generate(callback: Function) {
    function randomStr() {
      const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
      let id = '';
      for (let i = Id.SIZE; i > 0; --i) id += BASE58[Math.floor(Math.random() * BASE58.length)];
      return id;
    }

    callback(null, new Id(randomStr()));
  }

  /**
   * 利用给定的key为节点生成一个标识符id
   * @param {string} key [description]
   * @note nodejs版 key:string => hash => Buffer
   * @note web版 key:string => hash => ArrayBuffer => string
   */
  static fromKey(key: string) {
    /** 将字符串key编码位Uint8Array */
    const keyU8A = new TextEncoder().encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-A56', keyU8A);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    /**
     * @todo hashHex此处为64个字符，但Id应该为32位，需要额外处理;
     */
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return new Id(hashHex);
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
    let buffer = new ArrayBuffer(Id.SIZE * 2);
    let buf = new Int16Array(buffer);
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