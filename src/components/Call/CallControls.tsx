import React from 'react';
import {
  VideoCameraIcon,
  PhoneIcon,
  ComputerDesktopIcon,
  PhoneXMarkIcon,
} from '@heroicons/react/24/outline';

interface CallControlsProps {
  onStartVideoCall: () => void;
  onStartAudioCall: () => void;
  onStartScreenShare: () => void;
  onEndCall: () => void;
  isCallActive: boolean;
  disabled?: boolean;
  permissionError?: string | null;
}

export const CallControls: React.FC<CallControlsProps> = ({
  onStartVideoCall,
  onStartAudioCall,
  onStartScreenShare,
  onEndCall,
  isCallActive,
  disabled = false,
}) => {
  const buttonBaseClasses = "h-9 w-9 flex items-center justify-center rounded-lg transition-colors";
  
  return (
    <div className="flex gap-2">
      {!isCallActive ? (
        <>
          <button
            onClick={onStartVideoCall}
            className={`${buttonBaseClasses} ${
              disabled
                ? 'bg-surface-200 text-surface-400 cursor-not-allowed'
                : 'bg-surface-200 hover:bg-surface-300 text-surface-600'
            }`}
            disabled={disabled}
            title="Start video call"
          >
            <VideoCameraIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onStartAudioCall}
            className={`${buttonBaseClasses} ${
              disabled
                ? 'bg-surface-200 text-surface-400 cursor-not-allowed'
                : 'bg-surface-200 hover:bg-surface-300 text-surface-600'
            }`}
            disabled={disabled}
            title="Start audio call"
          >
            <PhoneIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onStartScreenShare}
            className={`${buttonBaseClasses} ${
              disabled
                ? 'bg-surface-200 text-surface-400 cursor-not-allowed'
                : 'bg-surface-200 hover:bg-surface-300 text-surface-600'
            }`}
            disabled={disabled}
            title="Share screen"
          >
            <ComputerDesktopIcon className="w-4 h-4" />
          </button>
        </>
      ) : (
        <button
          onClick={onEndCall}
          className={`${buttonBaseClasses} bg-primary-500 hover:bg-primary-600 text-white`}
          title="End call"
        >
          <PhoneXMarkIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};