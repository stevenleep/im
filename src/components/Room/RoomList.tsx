import React from 'react';
import { Room } from '../../types';
import { ChatBubbleLeftIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface RoomListProps {
  rooms: Room[];
  activeRoomId?: string;
  onSelectRoom: (roomId: string) => void;
}

export const RoomList: React.FC<RoomListProps> = ({
  rooms,
  activeRoomId,
  onSelectRoom,
}) => {
  return (
    <div className="h-full flex flex-col bg-surface-100">
      <div className="p-4 border-b border-surface-200">
        <h1 className="text-lg font-semibold text-surface-700">Messages</h1>
      </div>
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {rooms.map(room => (
          <button
            key={room.id}
            onClick={() => onSelectRoom(room.id)}
            className={`w-full flex items-center gap-3 p-3 mb-1 rounded-xl
              transition-all duration-200 ${
                activeRoomId === room.id
                  ? 'bg-surface-200'
                  : 'hover:bg-surface-200'
              }`}
          >
            <div className={`w-10 h-10 flex items-center justify-center rounded-lg
              transition-colors duration-200 ${
                activeRoomId === room.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-surface-300 text-surface-600'
              }`}>
              {room.type === 'direct' ? (
                <ChatBubbleLeftIcon className="w-5 h-5" />
              ) : (
                <UserGroupIcon className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className={`font-medium truncate ${
                activeRoomId === room.id
                  ? 'text-surface-800'
                  : 'text-surface-600'
              }`}>{room.name}</div>
              {room.lastMessage && (
                <div className="text-sm text-surface-500 truncate">
                  {room.lastMessage.text}
                </div>
              )}
            </div>
            {room.unreadCount ? (
              <span className="flex items-center justify-center h-5 min-w-[1.25rem] px-1.5
                bg-primary-500 text-white text-xs font-medium rounded-full">
                {room.unreadCount}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}