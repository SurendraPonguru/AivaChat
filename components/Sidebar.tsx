
import React, { useEffect, useRef } from 'react';
import { StoredChatSession } from '../types';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon'; 
import AivaLogo from './icons/AivaLogo';

interface SidebarProps {
  chatSessions: StoredChatSession[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void; 
}

const Sidebar: React.FC<SidebarProps> = ({
  chatSessions,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isOpen,
  onToggle
}) => {
  const activeItemRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    activeItemRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, [activeChatId, chatSessions, isOpen]);

  // Close sidebar on click outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        const toggleButton = document.querySelector('header button[aria-label="Toggle sidebar"]');
        if (toggleButton && toggleButton.contains(event.target as Node)) {
          return;
        }
        if (window.innerWidth < 768) { // Only for mobile
            onToggle();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);


  const sortedChats = [...chatSessions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div 
      ref={sidebarRef}
      className={`
        flex flex-col bg-slate-800 text-slate-200 h-full shadow-xl transition-transform duration-300 ease-in-out
        fixed inset-y-0 left-0 z-30 w-64 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:static md:w-[30%] md:flex-shrink-0 md:translate-x-0 md:transition-none
      `}
      aria-hidden={!isOpen && window.innerWidth < 768}
    >
      <div className="p-3 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AivaLogo className="w-7 h-7 text-teal-400" />
          <h2 className="text-lg font-semibold text-white">AivaChat</h2>
        </div>
         <button 
            onClick={onToggle} 
            className="md:hidden p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
            aria-label="Close sidebar"
          >
            {/* Close Icon (X) */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
      </div>

       <div className="p-3">
        <button
          onClick={onNewChat}
          aria-label="Start new chat"
          className="w-full flex items-center justify-center bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-600 hover:to-sky-700 text-white font-medium py-2.5 px-3 rounded-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 shadow-md hover:shadow-lg"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Chat
        </button>
      </div>

      <nav className="flex-grow overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
        {sortedChats.map((session) => (
          <button
            key={session.id}
            ref={session.id === activeChatId ? activeItemRef : null}
            onClick={() => {
              onSelectChat(session.id);
              if (window.innerWidth < 768 && isOpen) onToggle(); // Close sidebar on mobile after selection
            }}
            aria-current={session.id === activeChatId ? 'page' : undefined}
            className={`group flex items-center justify-between w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 ease-in-out truncate
                        ${session.id === activeChatId
                          ? 'bg-sky-700 text-white shadow-lg ring-1 ring-sky-500'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white focus:outline-none'
                        }`}
          >
            <span className="truncate flex-grow pr-2">{session.title || 'Chat'}</span>
            <span
              onClick={(e) => {
                e.stopPropagation(); 
                onDeleteChat(session.id);
              }}
              onKeyDown={(e) => {
                 if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    onDeleteChat(session.id);
                 }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Delete chat: ${session.title || 'Chat'}`}
              className="p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-600 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-150 ease-in-out"
            >
              <TrashIcon className="w-4 h-4" />
            </span>
          </button>
        ))}
        {chatSessions.length === 0 && (
          <div className="px-3 py-4 text-center text-sm text-slate-400 italic">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            No chats yet. <br/>Click "New Chat" to begin!
          </div>
        )}
      </nav>
      <div className="p-3 mt-auto border-t border-slate-700 text-xs text-slate-500 text-center">
        <p>&copy; {new Date().getFullYear()} AivaChat ✨</p>
      </div>
    </div>
  );
};

export default Sidebar;
