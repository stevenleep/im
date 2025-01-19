import Peer from 'simple-peer';
import { CallState } from '../types';

class PeerService {
  private static instance: PeerService;
  private peer: Peer.Instance | null = null;

  private constructor() {}

  static getInstance(): PeerService {
    if (!PeerService.instance) {
      PeerService.instance = new PeerService();
    }
    return PeerService.instance;
  }

  initializePeer(stream: MediaStream, initiator: boolean = true): void {
    if (this.peer) {
      this.destroy();
    }

    try {
      // Set up required globals for simple-peer
      if (typeof window !== 'undefined') {
        window.Buffer = window.Buffer || require('buffer').Buffer;
      }

      const peerOptions: Peer.Options = {
        initiator,
        trickle: false,
        stream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        },
        objectMode: true
      };

      this.peer = new Peer(peerOptions);

      // Add error handler with more detailed logging
      this.peer.on('error', (err) => {
        console.error('Peer connection error:', err.message || err);
        this.destroy();
      });

      // Add connection handler
      this.peer.on('connect', () => {
        console.log('Peer connection established');
      });

    } catch (error: any) {
      console.error('Error initializing peer:', error.message || error);
      this.destroy();
      throw error;
    }
  }

  onSignal(callback: (data: any) => void): void {
    if (!this.peer) {
      console.warn('Peer not initialized when trying to set signal handler');
      return;
    }
    this.peer.on('signal', callback);
  }

  onStream(callback: (stream: MediaStream) => void): void {
    if (!this.peer) {
      console.warn('Peer not initialized when trying to set stream handler');
      return;
    }
    this.peer.on('stream', callback);
  }

  signal(data: any): void {
    if (!this.peer) {
      console.warn('Peer not initialized when trying to signal');
      return;
    }
    try {
      this.peer.signal(data);
    } catch (error: any) {
      console.error('Error signaling peer:', error.message || error);
      this.destroy();
    }
  }

  destroy(): void {
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch (error: any) {
        console.error('Error destroying peer:', error.message || error);
      } finally {
        this.peer = null;
      }
    }
  }

  isInitialized(): boolean {
    return this.peer !== null;
  }
}

export const peerService = PeerService.getInstance();