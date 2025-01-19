// User Types
export interface User {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'busy';
}

// Room Types
export interface Room {
  id: string;
  type: 'direct' | 'group';
  name: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount?: number;
}

// Message Types
export interface Message {
  id: string;
  roomId: string;
  text: string;
  sender: User;
  timestamp: number;
  type: 'text' | 'file' | 'custom';
  metadata?: Record<string, any>;
  status?: 'sending' | 'sent' | 'failed' | 'received' | 'read' | 'delivered' | 'deleted';
  retryCount?: number;
}

// Call Types
export interface CallState {
  isActive: boolean;
  type: 'audio' | 'video' | 'screen';
  roomId?: string;
  peerId?: string;
  stream?: MediaStream;
  participants: User[];
}

// Socket Event Types
export interface SocketEvents {
  message: (message: Message) => void;
  messageAck: (messageId: string) => void;
  userJoined: (user: User) => void;
  userLeft: (userId: string) => void;
  userStatusChanged: (userId: string, status: User['status']) => void;
  roomCreated: (room: Room) => void;
  roomUpdated: (room: Room) => void;
  callOffer: (roomId: string, offer: RTCSessionDescriptionInit) => void;
  callAnswer: (roomId: string, answer: RTCSessionDescriptionInit) => void;
  iceCandidate: (roomId: string, candidate: RTCIceCandidate) => void;
  callStarted: (roomId: string, initiator: User) => void;
  callEnded: (roomId: string) => void;
}