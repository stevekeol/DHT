/**
 * kBucket-以二叉树形式实现kad-dht的kBucket
 * Author: stevekeol
 * Date: 2021-12-26 13:00
 */
import EventEmitter from '../src/utils/EventEmitter'

type Id = Uint8Array
type Contact = {
  id: Uint8Array;
  vectorClock: number;
}
type BitIndex = number

export default class KBucket extends EventEmitter {
  constructor(
    public localNodeId: Uint8Array = randomBytes(20), 
    public numberOfNodesPerKBucket: Number = 20,
    public numberOfNodesToPing: Number = 3,
    public getDistance = KBucket.getDistance,
    public arbiter = KBucket.arbiter,
    public metadata,
    public root
  ) {
    super()
    this.metadata = Object.assign({}, this.metadata)
    this.root = KBucket.createNode()
  }


  /**
   * 决定id的bitIndex位是0还是1
   * 当bitIndex是0时返回左边的叶节点，是1时返回右边的叶节点
   * @param {[type]}   node     有left和right叶节点的内部对象
   * @param {Id}       id       要和localNodeId比对的Id
   * @param {BitIndex} bitIndex 待比对的bit位
   */
  private determineNode (node, id: Id, bitIndex: BitIndex) {
    const bytesDescriptionByBitIndex = bitIndex >> 3
    const bitIndexWithinByte = bitIndex % 8
    if ((id.length <= bytesDescriptionByBitIndex) && (bitIndexWithinByte !== 0)) {
      return node.left
    }

    // 判断Uint8Array类型的Id在第x个字节，在第bitIndexWithinByte位是否是1，是的话返回右叶节点，否的话返回左叶节点
    if (id[bytesDescriptionByBitIndex] & (1 << (7 - bitIndexWithinByte))) { return node.right } 
    else { return node.left }
  }

  /**
   * 默认的逻辑距离计算方式（异或距离）
   * @param  {Id}     firstId  Uint8Array类型的Id
   * @param  {Id}     secondId Uint8Array类型的Id
   * @return {Number}          两个Id的异或距离（整数）
   *
   * @remarks Uint8Array中每一次的异或距离计算，和上一次相比，都相当于左移8位（实际上，索引i为0时，比较的是最高的一个字节，而非最低的一个字节，应该逐个左移8位才对。但逻辑距离有对称性，所以有什么关系呢）
   */
  static getDistance (firstId: Id, secondId: Id): Number {
    let distance = 0, i = 0
    const min = Math.min(firstId.length, secondId.length)
    const max = Math.max(firstId.length, secondId.length)
    for (; i < min; i++) distance = (distance << 8) + firstId[i] ^ secondId[i]
    for (; i < max; i++) distance = (distance << 8) + 255
    return distance
  }

  /**
   * 当有相同Id的contacts时，应选择哪个来更新k-bucket的逻辑
   * @param  {Contact} current   当前存储在k桶中的contact
   * @param  {Contact} candidate 将被加入k桶中的contact
   * @return {Contact}           最终挑选的用来更新k桶的contact
   *
   * @remarks 何时会有相同Id的contact, vectorClock如何定义的?
   */
  static arbiter (current: Contact, candidate: Contact): Contact {
    return current.vectorClock > candidate.vectorClock ? current : candidate
  }

  /**
   * 将一个contact加入k桶
   * @param {Contact} contact 将被加入k桶的contact对象
   */
  add (contact: Contact) {
    let bitIndex = 0, node = this.root

    while (node.contacts === null) {
      node = this.determineNode(node, contact.id, bitIndex++)
    }
  }
}
