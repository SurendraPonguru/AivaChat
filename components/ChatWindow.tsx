
import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import MessageBubble from './MessageBubble';
import ChatPlaceholderIcon from './icons/ChatPlaceholderIcon'; // Correct relative path

interface ChatWindowProps {
  messages: ChatMessage[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const chatContainerRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    const isLastMessageStreaming = messages.length > 0 && messages[messages.length - 1].isStreaming;
    scrollToBottom(isLastMessageStreaming ? "smooth" : "auto");
  }, [messages, messages.length]);

  // Determine if the placeholder should be shown
  const isInitialSingleBotMessage = messages.length === 1 && 
                                    messages[0].sender === 'bot' &&
                                    (messages[0].id.startsWith('bot-initial-') || messages[0].id.startsWith('bot-guest-initial-'));

  const showPlaceholder = messages.length === 0 || isInitialSingleBotMessage;
  
  const placeholderText = messages.length === 0 
    ? "Start a new conversation or select one from the sidebar." 
    : (isInitialSingleBotMessage ? messages[0]?.text : "Loading chat...");


  return (
    <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-700 shadow-inner relative" aria-live="polite" aria-atomic="false">
      {showPlaceholder ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center pointer-events-none">
          <ChatPlaceholderIcon className="w-32 h-32 md:w-48 md:h-48 text-slate-500 opacity-50 mb-4" />
          <h2 className="text-xl md:text-2xl font-semibold text-slate-400">AivaChat ✨</h2>
          <p className="text-sm text-slate-500">
            {placeholderText}
          </p>
        </div>
      ) : (
        messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))
      )}
      <div ref={messagesEndRef} style={{ height: '1px' }} />
    </div>
  );
};

export default ChatWindow;
