import { useState, useCallback, useEffect } from 'react';
import { Message, Room, User } from '../types';
import { socketService } from '../services/socket';
import { dbService } from '../services/db';

const MAX_RETRY_COUNT = 3;
const RETRY_DELAY = 2000; // 2 seconds

export const useChat = (room: Room | null, currentUser: User) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load messages from IndexedDB when room changes
  useEffect(() => {
    if (room) {
      setIsLoading(true);
      dbService.getMessagesByRoomId(room.id)
        .then(loadedMessages => {
          setMessages(loadedMessages);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error loading messages:', error);
          setIsLoading(false);
        });
    } else {
      setMessages([]);
    }
  }, [room]);

  // Handle message acknowledgments
  useEffect(() => {
    const handleMessageAck = async (messageId: string) => {
      setMessages(prev => {
        const newMessages = prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: 'sent' as const }
            : msg
        );
        
        // Update message in IndexedDB
        const updatedMessage = newMessages.find(msg => msg.id === messageId);
        if (updatedMessage) {
          dbService.updateMessage(updatedMessage).catch(console.error);
        }
        
        return newMessages;
      });
    };

    socketService.on('messageAck', handleMessageAck);
    return () => {
      socketService.off('messageAck', handleMessageAck);
    };
  }, []);

  // Handle incoming messages
  useEffect(() => {
    const handleMessage = async (message: Message) => {
      if (room && message.roomId === room.id) {
        setMessages(prev => {
          // Check if message already exists
          if (prev.some(m => m.id === message.id)) {
            return prev;
          }
          
          const newMessage = { ...message, status: 'sent' as const };
          
          // Store new message in IndexedDB
          dbService.addMessage(newMessage).catch(console.error);
          
          return [...prev, newMessage];
        });
      }
    };

    socketService.on('message', handleMessage);
    return () => {
      socketService.off('message', handleMessage);
    };
  }, [room]);

  // Retry failed messages
  const retryMessage = useCallback(async (messageId: string) => {
    setMessages(prev => {
      const message = prev.find(m => m.id === messageId);
      if (!message || message.retryCount && message.retryCount >= MAX_RETRY_COUNT) {
        return prev;
      }

      const updatedMessage = {
        ...message,
        status: 'sending' as const,
        retryCount: (message.retryCount || 0) + 1
      };

      // Update message in IndexedDB
      dbService.updateMessage(updatedMessage).catch(console.error);

      // Attempt to resend the message
      setTimeout(() => {
        socketService.emit('message', updatedMessage);
      }, RETRY_DELAY);

      return prev.map(msg => msg.id === messageId ? updatedMessage : msg);
    });
  }, []);

  const sendMessage = useCallback(async (text: string, type: Message['type'] = 'text', metadata?: Record<string, any>) => {
    if (!room) return;

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      roomId: room.id,
      text,
      sender: currentUser,
      timestamp: Date.now(),
      type,
      metadata,
      status: 'sending',
      retryCount: 0
    };

    // Add message to local state and IndexedDB
    setMessages(prev => [...prev, message]);
    await dbService.addMessage(message);

    // Send message
    try {
      socketService.emit('message', message);

      // Set up retry timeout
      const retryTimeout = setTimeout(async () => {
        setMessages(prev => {
          const updatedMessages = prev.map(msg => 
            msg.id === message.id && msg.status === 'sending'
              ? { ...msg, status: 'failed' as const }
              : msg
          );

          // Update failed message in IndexedDB
          const failedMessage = updatedMessages.find(msg => msg.id === message.id);
          if (failedMessage) {
            dbService.updateMessage(failedMessage).catch(console.error);
          }

          return updatedMessages;
        });
      }, 5000); // 5 seconds timeout

      // Clean up timeout if message is acknowledged
      const handleAck = (messageId: string) => {
        if (messageId === message.id) {
          clearTimeout(retryTimeout);
          socketService.off('messageAck', handleAck);
        }
      };

      socketService.on('messageAck', handleAck);
    } catch (error) {
      console.error('Error sending message:', error);
      const failedMessage = { ...message, status: 'failed' as const };
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? failedMessage : msg
      ));
      await dbService.updateMessage(failedMessage);
    }
  }, [room, currentUser]);

  const sendFile = useCallback(async (file: File) => {
    if (!room) return;

    const reader = new FileReader();
    reader.onload = () => {
      sendMessage(file.name, 'file', {
        type: file.type,
        size: file.size,
        data: reader.result,
      });
    };
    reader.readAsDataURL(file);
  }, [room, sendMessage]);

  // 删除消息
  const deleteMessage = useCallback(async (messageId: string) => {
    setMessages(prev => {
      const message = prev.find(m => m.id === messageId);
      if (!message) {
        return prev;
      }

      const updatedMessage = {
        ...message,
        status: 'deleted' as const,
      };

      // Update message in IndexedDB
      dbService.updateMessage(updatedMessage).catch(console.error);

      return prev.map(msg => msg.id === messageId ? updatedMessage : msg);
    });
  }, []);

  return {
    messages,
    sendMessage,
    sendFile,
    retryMessage,
    isLoading,
    deleteMessage,
  };
};