import { useState } from 'react';
import { RoomList } from './components/Room/RoomList';
import { MessageList } from './components/Chat/MessageList';
import { MessageInput } from './components/Chat/MessageInput';
import { CallControls } from './components/Call/CallControls';
import { CallWindow } from './components/Call/CallWindow';
import { useRooms } from './hooks/useRooms';
import { useChat } from './hooks/useChat';
import { useCall } from './hooks/useCall';
import { mockUsers } from './services/mockData';

const currentUser = mockUsers[0];

function App() {
  const { rooms, activeRoom, selectRoom } = useRooms(currentUser);
  const { messages, sendMessage, sendFile, retryMessage, isLoading, deleteMessage } = useChat(activeRoom, currentUser);
  const { callState, startCall, endCall, permissionError, availableScreens, getAvailableScreens } = useCall(activeRoom, currentUser);
  const [showCallWindow, setShowCallWindow] = useState(false);
  const [pendingCallType, setPendingCallType] = useState<'audio' | 'video' | 'screen' | null>(null);

  const handleStartCall = async (type: 'audio' | 'video' | 'screen') => {
    // if(type === 'screen') {
    //   await getAvailableScreens();
    // }

    setShowCallWindow(true);
    setPendingCallType(type);
  };

  const handleEndCall = () => {
    endCall();
    setShowCallWindow(false);
    setPendingCallType(null);
  };

  const handleInitiateCall = async (sourceId?:string) => {
    if (pendingCallType) {
      await startCall(pendingCallType);
    }
  };

  const handleToggleAudio = () => {
    if (callState.stream) {
      const audioTrack = callState.stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  };

  const handleToggleVideo = () => {
    if (callState.stream) {
      const videoTrack = callState.stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  };

  const handleInviteUser = () => {
    console.log('Invite user to call');
  };

  const activeParticipant = activeRoom?.participants.find(p => p.id !== currentUser.id);

  return (
    <div className="flex h-screen bg-surface-100">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 border-r border-surface-200">
        <RoomList
          rooms={rooms}
          activeRoomId={activeRoom?.id}
          onSelectRoom={selectRoom}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface-50">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Message Header with Call Controls */}
          <div className="flex-shrink-0 p-4 flex justify-between items-center border-b border-surface-200 bg-surface-100">
            <div>
              <h2 className="text-lg font-semibold text-surface-700">
                {activeRoom?.name || 'Select a chat'}
              </h2>
              {activeParticipant && (
                <div className="flex items-center mt-0.5">
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    activeParticipant.status === 'online' 
                      ? 'bg-green-500' 
                      : activeParticipant.status === 'busy'
                        ? 'bg-red-500'
                        : 'bg-surface-400'
                  }`} />
                  <span className="text-sm text-surface-500">
                    {activeParticipant.status === 'online' 
                      ? 'Online'
                      : activeParticipant.status === 'busy'
                        ? 'Busy'
                        : 'Offline'}
                  </span>
                </div>
              )}
            </div>
            <CallControls
              onStartVideoCall={() => handleStartCall('video')}
              onStartAudioCall={() => handleStartCall('audio')}
              onStartScreenShare={() => handleStartCall('screen')}
              onEndCall={handleEndCall}
              isCallActive={callState.isActive}
              disabled={!activeRoom}
              permissionError={permissionError}
            />
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-hidden">
            <MessageList 
              messages={messages} 
              onRetry={retryMessage}
              onDelete={deleteMessage}
            />
          </div>
          
          {/* Message Input */}
          <div className="flex-shrink-0 p-3 bg-surface-100 border-t border-surface-200">
            <MessageInput
              onSendMessage={sendMessage}
              onSendFile={sendFile}
              disabled={!activeRoom || isLoading}
            />
          </div>
        </div>
      </div>

      {/* Call Window */}
      {showCallWindow && (
        <CallWindow
          callState={callState}
          currentUser={currentUser}
          onClose={handleEndCall}
          onToggleAudio={handleToggleAudio}
          onToggleVideo={handleToggleVideo}
          onShareScreen={() => handleStartCall('screen')}
          onInviteUser={handleInviteUser}
          pendingCallType={pendingCallType}
          onInitiateCall={handleInitiateCall}
          permissionError={permissionError}
          availableScreens={availableScreens}
        />
      )}
    </div>
  );
}

export default App;