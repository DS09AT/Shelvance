export class EventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(eventName: string, listener: Function): void {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(listener);
  }

  off(eventName: string, listener: Function): void {
    if (!this.events[eventName]) return;
    this.events[eventName] = this.events[eventName].filter(
      (l) => l !== listener
    );
  }

  emit(eventName: string, ...args: any[]): void {
    if (!this.events[eventName]) return;
    this.events[eventName].forEach((listener) => {
      listener(...args);
    });
  }
}
