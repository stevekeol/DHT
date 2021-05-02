/**
 * Simple EventEmitter in Typesript
 * Author: stevekeol
 * Reference: https://github.com/developit/mitt/blob/master/src/index.ts
 * Date: 2021-04-18 16:30 ~ 17:20
 */

type EventType = string | symbol;
type Handler = (event: EventType) => void;
type EventHandlerList = Array<Handler>;
type EventHandlerMap = Map<EventType, EventHandlerList>;

interface EventEmitter {
  events: EventHandlerMap;
  on(type: EventType, handler: Handler): void;
  off(type: EventType, handler: Handler): void;
  emit<T>(type: EventType, event?: T): void;
}

class EventEmitter implements EventEmitter {

  /**
   * 事件统一的注册中心
   * @type {EventHandlerMap}
   */
  constructor(public events: EventHandlerMap = new Map()) {}

  /**
   * 为给定的事件类型, 注册一个事件处理器
   * @param {EventType} type    监听的事件类型
   * @param {Handler}   handler 收到给定事件时,要调用的处理函数
   */
  on(type: EventType, handler: Handler) {
    const handlers = this.events.get(type);
    const added = handlers && handlers.push(handler);
    if(!added) {
      this.events.set(type, [handler]);
    }
  }

  /**
   * 为给定的事件类型, 移除一个事件处理器
   * @param {EventType} type    监听的事件类型
   * @param {Handler}   handler 收到给定事件时,要移除的处理函数
   */
  off(type: EventType, handler: Handler) {
    const handlers = this.events.get(type);
    if(handlers) {
      handlers.splice(handlers.indexOf(handler) >>> 0, 1);
    }
  }
  /**
   * 为给定事件类型, 调用所有的事件处理器
   * @param {EventType} type 待调用的事件类型
   * @param {Any} event 传递给事件处理器的Object
   * @note Array.slice() 拷贝一份handlers是为了原handlers不受影响的向外服务
   */
  emit<T = any>(type: EventType, event: T) {
    const handlers = this.events.get(type) || [];
    handlers.slice().map(handler => { handler(event) });
  }
}

export default EventEmitter;