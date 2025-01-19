import { Message } from '../types';

const DB_NAME = 'chatDB';
const DB_VERSION = 1;
const MESSAGES_STORE = 'messages';

class DBService {
  private db: IDBDatabase | null = null;
  private connecting: Promise<IDBDatabase> | null = null;

  async connect(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.connecting) return this.connecting;

    this.connecting = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(request.error);
        this.connecting = null;
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
        this.connecting = null;
      };

      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains(MESSAGES_STORE)) {
          const store = db.createObjectStore(MESSAGES_STORE, { keyPath: 'id' });
          store.createIndex('roomId', 'roomId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });

    return this.connecting;
  }

  async getMessagesByRoomId(roomId: string): Promise<Message[]> {
    const db = await this.connect();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(MESSAGES_STORE, 'readonly');
      const store = transaction.objectStore(MESSAGES_STORE);
      const index = store.index('roomId');
      const request = index.getAll(IDBKeyRange.only(roomId));

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const messages = request.result;
        resolve(messages.sort((a, b) => a.timestamp - b.timestamp));
      };
    });
  }

  async addMessage(message: Message): Promise<void> {
    const db = await this.connect();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(MESSAGES_STORE, 'readwrite');
      const store = transaction.objectStore(MESSAGES_STORE);
      const request = store.add(message);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async updateMessage(message: Message): Promise<void> {
    const db = await this.connect();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(MESSAGES_STORE, 'readwrite');
      const store = transaction.objectStore(MESSAGES_STORE);
      const request = store.put(message);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async deleteMessagesByRoomId(roomId: string): Promise<void> {
    const db = await this.connect();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(MESSAGES_STORE, 'readwrite');
      const store = transaction.objectStore(MESSAGES_STORE);
      const index = store.index('roomId');
      const request = index.openKeyCursor(IDBKeyRange.only(roomId));

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          store.delete(cursor.primaryKey);
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }
}

export const dbService = new DBService();