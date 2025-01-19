import { Room, User, Message } from '../types';

export const mockUsers: User[] = [
  { id: '1', name: 'Current User', status: 'online' },
  { id: '2', name: 'Alice', status: 'online' },
  { id: '3', name: 'Bob', status: 'offline' },
  { id: '4', name: 'Charlie', status: 'busy' },
];

export const mockRooms: Room[] = [
  {
    id: 'room1',
    type: 'direct',
    name: 'Alice',
    participants: [mockUsers[0], mockUsers[1]],
    lastMessage: {
      id: 'msg_init_1',
      roomId: 'room1',
      text: 'Hey there!',
      sender: mockUsers[1],
      timestamp: Date.now() - 1000 * 60 * 5,
      type: 'text'
    },
    unreadCount: 2
  },
  {
    id: 'room2',
    type: 'group',
    name: 'Team Chat',
    participants: [mockUsers[0], mockUsers[1], mockUsers[2], mockUsers[3]],
    lastMessage: {
      id: 'msg_init_2',
      roomId: 'room2',
      text: 'Meeting at 2 PM',
      sender: mockUsers[2],
      timestamp: Date.now() - 1000 * 60 * 30,
      type: 'text'
    }
  }
];