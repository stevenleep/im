import { useState, useCallback } from 'react';
import { CallState, Room, User } from '../types';
import { peerService } from '../services/peer';
import { socketService } from '../services/socket';

export const useCall = (room: Room | null, currentUser: User) => {
  const [callState, setCallState] = useState<CallState>({
    isActive: false,
    type: 'video',
    participants: [],
  });
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [availableScreens, setAvailableScreens] = useState<MediaDeviceInfo[]>([]);

  const cleanupCall = useCallback(() => {
    if (callState.stream) {
      callState.stream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (error) {
          console.error('Error stopping track:', error);
        }
      });
    }
    peerService.destroy();
    setCallState({
      isActive: false,
      type: 'video',
      participants: [],
    });
    setPermissionError(null);
    setAvailableScreens([]);
  }, [callState.stream]);

  const startCall = useCallback(async (type: 'audio' | 'video' | 'screen', sourceId?: string) => {
    if (!room) {
      setPermissionError('Please select a room first');
      return false;
    }

    try {
      setPermissionError(null);
      let stream: MediaStream;

      if (type === 'screen') {
        try {
          const displayMediaOptions: any = {
            cursor: 'always',
            displaySurface: 'monitor',
            video: true,
            audio: false
          };
          
          // 如果提供了特定的sourceId，则使用它
          if (sourceId) {
            displayMediaOptions.video = {
              ...displayMediaOptions.video,
              // mandatory: {
              //   chromeMediaSourceId: sourceId
              // }
            };
          }
          
          stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);

          stream.getVideoTracks()[0].onended = () => {
            cleanupCall();
          };

          console.log('Screen sharing stream:', stream);

        } catch (error: any) {
          console.error('Screen sharing error:', error);
          if (error.name === 'NotAllowedError') {
            setPermissionError('Screen sharing permission was denied. Please allow access to share your screen.');
          } else {
            setPermissionError('Failed to start screen sharing. Please try again.');
          }
          return false;
        }
      } else {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: type === 'video'
          });
        } catch (error: any) {
          console.error('Media access error:', error);
          if (error.name === 'NotAllowedError') {
            setPermissionError(
              type === 'video'
                ? 'Camera and microphone access was denied. Please allow access to use video call.'
                : 'Microphone access was denied. Please allow access to use audio call.'
            );
          } else if (error.name === 'NotFoundError') {
            setPermissionError(
              type === 'video'
                ? 'No camera or microphone found. Please check your devices.'
                : 'No microphone found. Please check your audio devices.'
            );
          } else {
            setPermissionError('Failed to access media devices. Please try again.');
          }
          return false;
        }
      }

      try {
        // peerService.initializePeer(stream);
        
        // if (!peerService.isInitialized()) {
        //   throw new Error('Failed to initialize peer connection');
        // }

        // peerService.onSignal((data) => {
        //   socketService.emit('callOffer', room.id, data);
        // });

        // socketService.emit('callStarted', room.id, currentUser);

        setCallState({
          isActive: true,
          type,
          roomId: room.id,
          stream,
          participants: [currentUser],
        });

        return true;

      } catch (error: any) {
        console.error('Error initializing peer connection:', error);
        stream.getTracks().forEach(track => track.stop());
        setPermissionError('Failed to initialize call. Please try again.');
        return false;
      }

    } catch (error: any) {
      console.error('Error starting call:', error);
      return false;
    }
  }, [room, currentUser, cleanupCall]);

  const endCall = useCallback(() => {
    if (callState.roomId) {
      socketService.emit('callEnded', callState.roomId);
    }
    cleanupCall();
  }, [callState.roomId, cleanupCall]);

  const getAvailableScreens = useCallback(async () => {
    try {
      // 获取所有可用的屏幕和窗口
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      setAvailableScreens(mediaDevices.filter(device => device.kind === 'videoinput'));
      return true;
    } catch (error) {
      console.error('Error getting available screens:', error);
      setPermissionError('Failed to get available screens. Please try again.');
      return false;
    }
  }, []);

  return {
    callState,
    startCall,
    endCall,
    permissionError,
    availableScreens,
    getAvailableScreens,
  };
};