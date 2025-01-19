import { EventEmitter } from './eventEmitter';
import { Message, Room, User, SocketEvents } from '../types';
import { mockRooms, mockUsers } from './mockData';

let messageCounter = 0;

class MockSocketService extends EventEmitter {
  private static instance: MockSocketService;
  private connected: boolean = false;
  private rooms: Room[] = [...mockRooms];
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';
  private connectionListeners: Set<(status: string) => void> = new Set();
  private messageCache: Set<string> = new Set();

  private constructor() {
    super();
    // 自动连接
    this.connect();
  }

  static getInstance(): MockSocketService {
    if (!MockSocketService.instance) {
      MockSocketService.instance = new MockSocketService();
    }
    return MockSocketService.instance;
  }

  getConnectionStatus(): string {
    return this.connectionStatus;
  }

  onConnectionStatusChange(callback: (status: string) => void): () => void {
    this.connectionListeners.add(callback);
    return () => this.connectionListeners.delete(callback);
  }

  private updateConnectionStatus(status: typeof MockSocketService.prototype.connectionStatus) {
    this.connectionStatus = status;
    this.connectionListeners.forEach(listener => listener(status));
  }

  connect(): void {
    if (this.connected) return;

    this.updateConnectionStatus('connecting');

    // Simulate connection delay
    setTimeout(() => {
      this.connected = true;
      this.updateConnectionStatus('connected');
      this.emit('connect');

      // Emit initial rooms immediately after connection
      this.rooms.forEach(room => {
        this.emit('roomCreated', room);
      });
    }, 100); // Reduced delay for better user experience
  }

  on<T extends keyof SocketEvents>(event: T, callback: SocketEvents[T]): void {
    super.on(event, callback as any);
  }

  off<T extends keyof SocketEvents>(event: T, callback: SocketEvents[T]): void {
    super.off(event, callback as any);
  }

  emit<T extends keyof SocketEvents>(
    event: T,
    ...args: Parameters<SocketEvents[T]>
  ): boolean {
    if (!this.connected && event !== 'connect') {
      console.warn('Socket not connected, message queued');
      return false;
    }

    if (event === 'message') {
      const message = args[0] as Message;
      const messageId = message.id || `msg_${Date.now()}_${messageCounter++}`;
      
      if (this.messageCache.has(messageId)) {
        return false;
      }
      
      this.messageCache.add(messageId);
      
      const finalMessage = {
        ...message,
        id: messageId,
      };

      setTimeout(() => {
        this.emit('messageAck', messageId);
      }, 500);

      return super.emit(event, finalMessage);
    }

    return super.emit(event, ...args);
  }

  disconnect(): void {
    this.connected = false;
    this.updateConnectionStatus('disconnected');
    this.emit('disconnect');
    this.messageCache.clear();
    this.removeAllListeners();
  }
}

export const mockSocketService = MockSocketService.getInstance();