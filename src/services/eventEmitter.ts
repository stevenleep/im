type EventCallback = (...args: any[]) => void;

export class EventEmitter {
  private events: Map<string, Set<EventCallback>>;

  constructor() {
    this.events = new Map();
  }

  on(event: string, callback: EventCallback): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)?.add(callback);
  }

  off(event: string, callback: EventCallback): void {
    this.events.get(event)?.delete(callback);
    if (this.events.get(event)?.size === 0) {
      this.events.delete(event);
    }
  }

  emit(event: string, ...args: any[]): boolean {
    if (!this.events.has(event)) {
      return false;
    }

    this.events.get(event)?.forEach(callback => {
      callback(...args);
    });

    return true;
  }

  removeAllListeners(): void {
    this.events.clear();
  }
}