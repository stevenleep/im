import React, { useState, useEffect, useRef } from "react";
import { User, CallState } from "../../types";
import { CallView } from "./CallView";
import {
  VideoCameraIcon,
  MicrophoneIcon,
  XMarkIcon,
  UserPlusIcon,
  UsersIcon,
  ComputerDesktopIcon,
  PhoneIcon,
  WindowIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

interface CallWindowProps {
  callState: CallState;
  currentUser: User;
  onClose: () => void;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onShareScreen: () => void;
  onInviteUser: () => void;
  pendingCallType: "audio" | "video" | "screen" | null;
  onInitiateCall: (sourceId?: string) => void;
  permissionError: string | null;
  availableScreens: MediaDeviceInfo[];
}

export const CallWindow: React.FC<CallWindowProps> = ({
  callState,
  currentUser,
  onClose,
  onToggleAudio,
  onToggleVideo,
  onShareScreen,
  onInviteUser,
  pendingCallType,
  onInitiateCall,
  permissionError,
  availableScreens,
}) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(
    callState.type === "video"
  );
  const [showMediaSelector, setShowMediaSelector] = useState(false);

  const fullScreenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pendingCallType === "screen" && !callState.stream) {
      setShowMediaSelector(true);
    } else if (pendingCallType === "screen" && callState.stream) {
      setShowMediaSelector(false);
    } else if (pendingCallType && !showMediaSelector) {
      onInitiateCall();
    }
  }, [
    pendingCallType,
    onInitiateCall,
    showMediaSelector,
    callState.isActive,
    callState.stream,
  ]);

  const handleToggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    onToggleAudio();
  };

  const handleToggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    onToggleVideo();
  };

  const handleShareScreen = () => {
    onShareScreen();
  };

  // const handleToggleFullScreen = () => {
  //   if (document.fullscreenElement) {
  //     document.exitFullscreen();
  //   } else {
  //     fullScreenRef.current?.requestFullscreen();
  //   }
  // };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="bg-surface-100 w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-surface-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-surface-700">
              {showMediaSelector
                ? "Select Screen to Share"
                : callState.type === "screen"
                ? "Screen Sharing"
                : `${callState.type === "video" ? "Video" : "Audio"} Call`}
            </h2>
            {!showMediaSelector && callState.isActive && (
              <div className="flex items-center text-surface-500">
                <UsersIcon className="w-4 h-4 mr-1" />
                <span className="text-sm">
                  {callState.participants.length} participants
                </span>
              </div>
            )}
          </div>

          <div>
            {/* <button
              onClick={handleToggleFullScreen}
              className="p-2 hover:bg-surface-200 rounded-lg text-surface-500 hover:text-surface-700 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button> */}

            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-200 rounded-lg text-surface-500 hover:text-surface-700 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative bg-surface-200" style={{ height: "60vh" }}>
          {showMediaSelector ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8 w-full max-w-2xl">
                <h3 className="text-xl font-semibold mb-6">
                  Choose what to share
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => onInitiateCall()}
                    className="p-6 bg-surface-300 rounded-xl hover:bg-surface-400 transition-colors group"
                  >
                    <ComputerDesktopIcon className="w-12 h-12 mx-auto mb-4 text-surface-600 group-hover:text-surface-700" />
                    <span className="block text-surface-700 font-medium">
                      Entire Screen
                    </span>
                  </button>
                  <button
                    onClick={() => onInitiateCall()}
                    className="p-6 bg-surface-300 rounded-xl hover:bg-surface-400 transition-colors group"
                  >
                    <WindowIcon className="w-12 h-12 mx-auto mb-4 text-surface-600 group-hover:text-surface-700" />
                    <span className="block text-surface-700 font-medium">
                      Application Window
                    </span>
                  </button>
                  <button
                    onClick={() => onInitiateCall()}
                    className="p-6 bg-surface-300 rounded-xl hover:bg-surface-400 transition-colors group"
                  >
                    <GlobeAltIcon className="w-12 h-12 mx-auto mb-4 text-surface-600 group-hover:text-surface-700" />
                    <span className="block text-surface-700 font-medium">
                      Browser Tab
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : permissionError ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-6">
                <div className="text-red-500 mb-4">{permissionError}</div>
                <button
                  onClick={() => onInitiateCall()}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : !callState.isActive && pendingCallType ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mb-4"></div>
                <div className="text-surface-600">Initializing call...</div>
              </div>
            </div>
          ) : (
            <CallView callState={callState} remoteStream={callState.stream} />
          )}
        </div>

        {/* Controls */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-surface-200">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleAudio}
              className={`p-3 rounded-lg ${
                isAudioEnabled
                  ? "bg-surface-200 text-surface-700 hover:bg-surface-300"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
              disabled={!callState.isActive || showMediaSelector}
            >
              <MicrophoneIcon className="w-5 h-5" />
            </button>
            {callState.type !== "screen" && (
              <button
                onClick={handleToggleVideo}
                className={`p-3 rounded-lg ${
                  isVideoEnabled
                    ? "bg-surface-200 text-surface-700 hover:bg-surface-300"
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
                disabled={!callState.isActive || showMediaSelector}
              >
                <VideoCameraIcon className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handleShareScreen}
              className={`p-3 rounded-lg ${
                callState.type === "screen"
                  ? "bg-primary-500 text-white hover:bg-primary-600"
                  : "bg-surface-200 text-surface-700 hover:bg-surface-300"
              }`}
              disabled={!callState.isActive && !pendingCallType}
            >
              <ComputerDesktopIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onInviteUser}
              className="flex items-center px-4 py-2 bg-surface-200 text-surface-700 hover:bg-surface-300 rounded-lg"
              disabled={!callState.isActive || showMediaSelector}
            >
              <UserPlusIcon className="w-5 h-5 mr-2" />
              <span>Invite</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg"
            >
              <PhoneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
