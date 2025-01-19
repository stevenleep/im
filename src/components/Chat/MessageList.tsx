import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../../types';
import { ArrowPathIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

interface MessageListProps {
  messages: Message[];
  onRetry?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, onRetry, onDelete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="h-full relative">
      <div 
        ref={containerRef}
        className="h-full overflow-y-scroll scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="py-6 px-4 space-y-6">
          {messages.map(message => {
            const isSentByMe = message.sender.id === '1';

            if(message.status === 'deleted') {
              return null;
            }

            return (
              <div
                key={message.id}
                className={`flex flex-col ${isSentByMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[70%] ${
                    isSentByMe
                      ? 'bg-surface-300 text-surface-800 rounded-2xl rounded-tr-md'
                      : 'bg-surface-200 text-surface-800 rounded-2xl rounded-tl-md'
                  } px-4 py-2.5`}
                >
                  {message.type === 'file' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm break-all">{message.text}</span>
                      <button
                        onClick={() => {
                          if (message.metadata?.data) {
                            window.open(message.metadata.data, '_blank');
                          }
                        }}
                        className={`text-xs underline opacity-80 hover:opacity-100 transition-opacity
                          text-primary-600 hover:text-primary-700`}
                      >
                        Download
                      </button>
                    </div>
                  ) : (
                    <p className="break-words text-[15px] leading-relaxed">{message.text}</p>
                  )}
                </div>
                <div className={`flex items-center gap-2 px-1 mt-1 ${isSentByMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span className="text-xs text-surface-500">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {message.status && (
                    <span className="flex items-center gap-1 text-xs text-surface-500">
                      {message.status === 'sending' && '•••'}
                      {message.status === 'sent' && '✓'}
                      {message.status === 'failed' && (
                        <button
                          onClick={() => onRetry?.(message.id)}
                          className="flex items-center gap-1 text-primary-600 hover:text-primary-700 hover:underline"
                        >
                          Failed
                          <ArrowPathIcon className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  )}
                </div>
                {/* delete */}
                {isSentByMe && (
                  <button
                    onClick={() => onDelete?.(message.id)}
                    className={`text-xs text-surface-500 mt-1 ${
                      message.status === 'sending' ? 'opacity-50 pointer-events-none' : 'hover:underline'
                    }`}
                  >
                    Delete
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 p-2 bg-surface-300 hover:bg-surface-400 
            text-surface-700 rounded-full shadow-lg transition-all duration-200 
            flex items-center justify-center"
        >
          <ArrowDownIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};