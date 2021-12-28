/**
 * kBucket-以二叉树形式实现kad-dht的kBucket
 * Author: stevekeol
 * Date: 2021-12-26 13:00
 * Reference: https://github.com/tristanls/k-bucket/blob/master/index.js
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
    public localNodeId: Uint8Array = KBucket.randomBytes(20), 
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
   * 将一个contact加入k桶
   * @param {Contact} contact 将被加入k桶的contact对象
   *
   */
  add(contact: Contact) {
    let bitIndex = 0, node = this.root

    while (node.contacts === null) {
      // 当node不是一个leaf节点，而仅仅只是一个具有left/right分支的内部抽象节点时，
      // 需要根据bitIndex进一步处理
      node = this.determineNode(node, contact.id, bitIndex++)
    }

    const index = this.getIdIndex (node, contact.id)
    if (index >= 0) {
      this.update(node, index, contact)
      return this
    }

    if (node.contacts.length < this.numberOfNodesPerKBucket) {
      node.contacts.push(contact)
      this.emit('added', contact)
      return this
    }

    if (node.dontSplit) {
      // @tofixed
      this.emit('ping', node.contacts.slice(0, this.numberOfNodesPerKBucket), conatct)
      return this
    }

    this.split(node, bitIndex)
    return this.add(contact)
  }


  /**
   * Helper
   */

  /**
   * 需要新创建一个Id时，生成随机20个字节数
   * @param  {number} length 要生成的长度字节数
   * @return {Id}            Uint8Array 生成的随机Id
   */
  private static randomBytes(length: number): Id {
    // @todo
    return new Uint8Array()
  }

  private static createNode() {
    return {
      contacts: [],
      dontSplit: false,
      left: null,
      right: null
    }
  }


  /**
   * 决定id的bitIndex位是0还是1
   * 当bitIndex是0时返回左边的叶节点，是1时返回右边的叶节点
   * @param {[type]}   node     有left和right叶节点的内部对象
   * @param {Id}       id       要和localNodeId比对的Id
   * @param {BitIndex} bitIndex 待比对的bit位
   *
   * @remarks 1. Id和Hash值域相同，都是SHA-1即160位，即20字节，即0~f有40位，即Uint8Array的长度为20（Id是用Uint8Array表示的!!!）
   *          2. BitIndex是这160个bit位的某一个具体位置，由于Uint8Array是一个字节一个元素，因此`bitIndex >> 3`表示第几个元素，`(bitIndex >> 3) % 8`表示这个元素中的第几个bit位
   *          3. 当id的长度不够bitIndex来判断，且还有需要额外考虑的bit位时，id则太短，需要放入低位桶中
   *          4. 判断bitIndex对应的第n个元素的第x个bit位是0（返回left）还是1（返回right）
   * @questions bitIndex是什么场景下由谁传入的?
   */
  private determineNode(node, id: Id, bitIndex: BitIndex) {
    const bytesIndex = bitIndex >> 3
    const bitIndexWithinByte = bitIndex % 8
    if ((id.length <= bytesIndex) && (bitIndexWithinByte !== 0)) {
      return node.left
    }

    if (id[bytesIndex] & (1 << (7 - bitIndexWithinByte))) { return node.right } 
    return node.left
  }

  /**
   * 默认的逻辑距离计算方式（异或距离）
   * @param  {Id}     firstId  Uint8Array类型的Id
   * @param  {Id}     secondId Uint8Array类型的Id
   * @return {Number}          两个Id的异或距离（整数）
   *
   * @remarks Uint8Array中每一次的异或距离计算，和上一次相比，都相当于左移8位（实际上，索引i为0时，比较的是最高的一个字节，而非最低的一个字节，应该逐个左移8位才对。但逻辑距离有对称性，所以有什么关系呢）
   */
  private static getDistance(firstId: Id, secondId: Id): Number {
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
  static arbiter(current: Contact, candidate: Contact): Contact {
    return current.vectorClock > candidate.vectorClock ? current : candidate
  }

  
  /**
   * 取出节点中某个Id的索引
   * @param  {[type]} node k桶中某个二叉树前缀对应的存有contacts的leaf节点
   * @param  {Id}     id   节点Id
   * @return {number}      索引位置(存在的话)
   */
  private getIdIndex(node, id: Id): number {
    for (let i = 0; i < node.contacts.length; i++) {
      if (this.idEquals(node.contacts[i].id, id)) { return i }
    }
    return -1
  }

  /**
   * 判断给定的两个Id是否相等
   * @param  {Id}      id1 [description]
   * @param  {Id}      id2 [description]
   * @return {boolean}     [description]
   */
  private idEquals(id1: Id, id2: Id): boolean {
    if (id1 === id2) return true
    if (id1.length !== id2.length) return false
    for (let i = 0, length = id1.length; i < length; ++i) {
      if (id1[i] !== id2[i]) return false
    }
    return true    
  }

  /**
   * 更新节点k桶中的contact
   * @param {[type]}  node    待更新的leaf节点
   * @param {number}  index   待更新的contact在leaf节点中的索引位置
   * @param {Contact} contact 待更新的contact候选者
   */
  private update(node, index: number, contact: Contact) {
    if (!this.idEquals(node[index].id, contact.id)) {
      throw new Error('wrong index for update')
    }

    const current = node.contacts[index]
    const selection = this.arbiter(current, contact)
    if (selection === current && current !== contact) return

    node.contacts.splice(index, 1)
    node.contacts.push(selection)
    this.emit('update', { current, selection }) // @ToFixed
  }

  /**
   * 根据bitIndex将node的contacts拆分成两个k桶，并将该node标记为内部抽象节点
   * @param {[type]} node     待拆分的leaf节点
   * @param {[type]} bitIndex 拆分依据的索引位置
   */
  private split(node, bitIndex) {
    node.left = KBucket.createNode()
    node.right = KBucket.createNode()

    for (const contact of node.contacts) {
      this.determineNode(node, contact.id, bitIndex).contacts.push(contact)
    }

    node.contacts = null

    // ???
    const detNode = this.determineNode(node, this.localNodeId, bitIndex)
    const otherNode = node.left === detNode ? node.right : node.left
    otherNode.dontSplit = true    
  }
}
