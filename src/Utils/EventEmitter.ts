/**
 * Simple EventEmitter in Typesript
 * Author: stevekeol
 * Reference: https://github.com/developit/mitt/blob/master/src/index.ts
 * Date: 2021-04-18 16:30 ~ 17:20
 */

export type EventType = string | symbol;
export type Handler = (event: EventType) => void;
export type EventHandlerList = Array<Handler>;
export type EventHandlerMap = Map<EventType, EventHandlerList>;

export interface EventEmitter {
  events: EventHandlerMap;
  on(type: EventType, handler: Handler): void;
  off(type: EventType, handler: Handler): void;
  emit<T = any>(type: EventType, event?: T): void;
}

export default function eventEmitter(events?: EventHandlerMap): EventEmitter {
  events = events || new Map();
  return {
    /**
     * 事件统一的注册中心
     * @type {EventHandlerMap}
     */
    events,

    /**
     * 为给定的事件类型, 注册一个事件处理器
     * @param {EventType} type    监听的事件类型
     * @param {Handler}   handler 收到给定事件时,要调用的处理函数
     */
    on(type: EventType, handler: Handler) {
      const handlers = events.get(type);
      const added = handlers && handlers.push(handler);
      if(!added) {
        events.set(type, [handler]);
      }
    },

    /**
     * 为给定的事件类型, 移除一个事件处理器
     * @param {EventType} type    监听的事件类型
     * @param {Handler}   handler 收到给定事件时,要移除的处理函数
     */
    off(type: EventType, handler: Handler) {
      const handlers = events.get(type);
      if(handlers) {
        handlers.splice(handlers.indexOf(handler) >>> 0, 1);
      }
    },
    /**
     * 为给定事件类型, 调用所有的事件处理器
     * @param {EventType} type 待调用的事件类型
     * @param {Any} event 传递给事件处理器的Object
     * @note Array.slice() 拷贝一份handlers是为了原handlers不受影响的向外服务
     */
    emit<T = any>(type: EventType, event: T) {
      const handlers = events.get(type) || [];
      handlers.slice().map(handler => { handler(event); });
    }
  }
}

/*----------------------------------------------*/
export class EventEmitter<Events, K = keyof Events|symbol> {
  addListener(event: K, listener: (...args: any[]) => void): this;
  on(event: K, listener: (...args: any[]) => void): this;
  once(event: K, listener: (...args: any[]) => void): this;
  removeListener(event: K, listener: (...args: any[]) => void): this;
  removeAllListeners(event?: K): this;
  setMaxListeners(n: number): this;
  getMaxListeners(): number;
  listeners(event: K): Function[];
  emit(event: K, ...args: any[]): boolean;
  listenerCount(type: K): number;
  // Added in Node 6...
  prependListener(event: K, listener: (...args: any[]) => void): this;
  prependOnceListener(event: K, listener: (...args: any[]) => void): this;
  eventNames(): (K)[];
}

interface PingEvent extends Event {
  msg :string
}

interface FooEvents {
  "change": Event,
  "ping": PingEvent
}

class Foo extends EventEmitter<FooEvents> {
  triggerPing(msg :string) {
    this.emit("ping", msg)
  }
}

const foo = new Foo()
foo.on("ping", msg => console.log('ping event with message', msg))
foo.triggerPing('hello')