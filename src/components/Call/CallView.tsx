import React, { useRef, useEffect } from 'react';
import { CallState } from '../../types';
import { PhoneIcon } from '@heroicons/react/24/outline';

interface CallViewProps {
  callState: CallState;
  remoteStream?: MediaStream;
}

export const CallView: React.FC<CallViewProps> = ({ callState, remoteStream }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && callState.stream) {
      localVideoRef.current.srcObject = callState.stream;
    }
  }, [callState.stream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!callState.isActive) {
    return null;
  }

  return (
    <div className="h-full bg-surface-100 relative">
      {(callState.type === 'video' || callState.type === 'screen') ? (
        <>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover bg-surface-200"
          />
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute bottom-4 right-4 w-40 rounded-lg border border-surface-300 bg-surface-200 shadow-sm"
          />
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-surface-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <PhoneIcon className="w-8 h-8 text-surface-600" />
            </div>
            <div className="text-surface-600 text-lg">Audio Call in Progress</div>
          </div>
        </div>
      )}
    </div>
  );
};