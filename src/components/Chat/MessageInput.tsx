import React, { useState, useRef } from 'react';
import { PaperClipIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onSendFile: (file: File) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onSendFile,
  disabled = false
}) => {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;
    onSendMessage(message);
    setMessage('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !disabled) {
      onSendFile(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface-50 rounded-lg">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          className={`flex-1 h-10 px-4 rounded-lg
            bg-surface-200 border border-surface-300
            text-surface-700 placeholder-surface-500
            focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent
            ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          placeholder={disabled ? 'Connecting...' : 'Type a message...'}
          disabled={disabled}
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`h-10 w-10 flex items-center justify-center rounded-lg
            bg-surface-200 border border-surface-300
            hover:bg-surface-300 transition-colors ${
            disabled
              ? 'text-surface-400 cursor-not-allowed'
              : 'text-surface-600'
          }`}
          disabled={disabled}
        >
          <PaperClipIcon className="w-5 h-5" />
        </button>
        <button
          type="submit"
          className={`h-10 w-10 flex items-center justify-center rounded-lg
            transition-colors ${
            disabled || !message.trim()
              ? 'bg-surface-300 text-surface-500 cursor-not-allowed'
              : 'bg-primary-500 hover:bg-primary-600 text-white'
          }`}
          disabled={disabled || !message.trim()}
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};