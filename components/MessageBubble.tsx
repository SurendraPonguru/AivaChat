
import React, { useMemo } from 'react';
import { ChatMessage } from '../types';
import BotIcon from './icons/BotIcon';
import UserIcon from './icons/UserIcon';
import Spinner from './Spinner';

interface MessageBubbleProps {
  message: ChatMessage;
}

const TypingIndicator: React.FC = () => (
  <div className="flex items-center space-x-1">
    <span className="text-xs text-slate-400 italic">Aiva is typing</span>
    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse delay-75"></div>
    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse delay-150"></div>
    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse delay-225"></div>
  </div>
);


const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const bubbleAlignment = isUser ? 'justify-end' : 'justify-start';
  
  const bubbleColor = isUser 
    ? 'bg-sky-600 text-white' 
    : 'bg-slate-600 text-slate-100';
  
  const avatar = isUser 
    ? <UserIcon className="w-8 h-8 text-sky-400" /> 
    : <BotIcon className="w-8 h-8 text-teal-400" />;
  
  const name = isUser ? 'You' : 'Aiva ✨';

  const formattedText = useMemo(() => {
    // Basic link detection (http, https, www)
    const linkRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(\bwww\.[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    let lastIndex = 0;
    const parts: (string | JSX.Element)[] = [];

    message.text.split('\n').forEach((line, lineIndex, linesArr) => {
      if (lineIndex > 0) {
        parts.push(<br key={`br-${lineIndex}`} />);
      }
      
      let match;
      lastIndex = 0; // Reset for each line
      while ((match = linkRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        const url = match[0].startsWith('www.') ? `http://${match[0]}` : match[0];
        parts.push(
          <a 
            key={url + match.index} 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sky-300 hover:text-sky-200 underline"
          >
            {match[0]}
          </a>
        );
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }
    });
    
    return parts.map((part, index) => <React.Fragment key={index}>{part}</React.Fragment>);

  }, [message.text]);


  return (
    <div className={`flex items-end space-x-2 md:space-x-3 ${bubbleAlignment} w-full`}>
      {!isUser && <div className="flex-shrink-0 self-start">{avatar}</div>}
      
      <div className={`flex flex-col max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-3 py-2 rounded-xl shadow-md ${bubbleColor} ${isUser ? 'rounded-br-none' : 'rounded-bl-none'}`}>
          <p className="text-sm font-semibold mb-1">{name}</p>
          <div 
            className="text-sm break-words whitespace-pre-wrap" 
            style={{ minHeight: (message.isStreaming && message.text === '') ? '1.5em' : 'auto' }} 
          >
            {message.text === '' && message.isStreaming 
              ? <div className="flex items-center justify-center h-full"><Spinner size="w-4 h-4" color={isUser ? "border-sky-300" : "border-teal-400"} /></div>
              : formattedText
            }
          </div>
        </div>
        <div 
          className={`text-xs text-slate-400 mt-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}
          style={{ minHeight: '1.2em' }} // Stabilize footer height
        >
          {message.isStreaming && message.text !== '' && <TypingIndicator />}
          {!message.isStreaming && message.timestamp && 
            new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {isUser && <div className="flex-shrink-0 self-start">{avatar}</div>}
    </div>
  );
};

export default MessageBubble;