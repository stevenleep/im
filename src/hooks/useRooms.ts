import { useState, useCallback, useEffect } from 'react';
import { Room, User } from '../types';
import { socketService } from '../services/socket';

export const useRooms = (currentUser: User) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);

  useEffect(() => {
    // 确保 socket 连接
    socketService.connect();

    // 监听房间事件
    const handleRoomCreated = (room: Room) => {
      setRooms(prev => {
        // 检查房间是否已存在
        if (prev.some(r => r.id === room.id)) {
          return prev;
        }
        const newRooms = [...prev, room];
        
        // 如果没有活动房间，自动选择第一个房间
        if (!activeRoom && newRooms.length === 1) {
          setActiveRoom(room);
        }
        
        return newRooms;
      });
    };

    const handleRoomUpdated = (updatedRoom: Room) => {
      setRooms(prev => prev.map(room => 
        room.id === updatedRoom.id ? updatedRoom : room
      ));
      if (activeRoom?.id === updatedRoom.id) {
        setActiveRoom(updatedRoom);
      }
    };

    socketService.on('roomCreated', handleRoomCreated);
    socketService.on('roomUpdated', handleRoomUpdated);

    return () => {
      socketService.off('roomCreated', handleRoomCreated);
      socketService.off('roomUpdated', handleRoomUpdated);
    };
  }, [activeRoom]);

  const createDirectRoom = useCallback(async (otherUser: User) => {
    const room: Room = {
      id: `direct_${Date.now()}`,
      type: 'direct',
      name: otherUser.name,
      participants: [currentUser, otherUser],
    };
    socketService.emit('roomCreated', room);
    return room;
  }, [currentUser]);

  const createGroupRoom = useCallback((name: string, participants: User[]) => {
    const room: Room = {
      id: `group_${Date.now()}`,
      type: 'group',
      name,
      participants: [...participants, currentUser],
    };
    socketService.emit('roomCreated', room);
    return room;
  }, [currentUser]);

  const selectRoom = useCallback((roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      setActiveRoom(room);
    }
  }, [rooms]);

  return {
    rooms,
    activeRoom,
    createDirectRoom,
    createGroupRoom,
    selectRoom,
  };
};