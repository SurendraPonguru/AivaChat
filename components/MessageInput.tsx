
import React, { useState, useRef, useEffect } from 'react';
import SendIcon from './icons/SendIcon';
import Spinner from './Spinner';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto'; // Reset height after sending
      }
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'; // Reset height
      const scrollHeight = inputRef.current.scrollHeight;
      const maxHeight = 120; // Max height for 5-6 lines approx.
      inputRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [inputValue]);

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-slate-800 p-3 md:p-4 border-t border-slate-700 flex items-end space-x-2 md:space-x-3 shadow-top-lg"
    >
      <textarea
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        placeholder={isLoading ? "Aiva is thinking..." : "Message Aiva..."}
        aria-label="Chat message input"
        className="flex-grow p-3 border border-slate-600 rounded-lg bg-slate-700 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-shadow text-sm md:text-base resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700"
        disabled={isLoading}
        rows={1}
        style={{minHeight: '48px'}} // min height for one line + padding
      />
      <button
        type="submit"
        aria-label={isLoading ? "Sending message..." : "Send message"}
        className="bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-600 hover:to-sky-700 text-white font-semibold py-3 px-3.5 md:px-4 rounded-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center self-stretch shadow-md hover:shadow-lg"
        disabled={isLoading || !inputValue.trim()}
      >
        {isLoading ? <Spinner size="w-5 h-5" color="border-white" /> : <SendIcon className="w-5 h-5 text-white" />}
      </button>
    </form>
  );
};

export default MessageInput;