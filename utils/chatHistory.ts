
import { StoredChatSession, StoredChatMessage, ChatMessage } from '../types';
import { Content } from '@google/genai';

const getChatHistoryKey = (userId: string): string => `geminiChatHistory_${userId}`;

export const generateChatId = (): string => {
  return `chat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const loadChatsFromStorage = (userId: string): StoredChatSession[] => {
  if (!userId) {
    console.warn('Attempted to load chats without a userId.');
    return [];
  }
  try {
    const storedChats = localStorage.getItem(getChatHistoryKey(userId));
    if (storedChats) {
      const parsedChats = JSON.parse(storedChats) as StoredChatSession[];
      return parsedChats.map(chat => ({
        ...chat,
        messages: chat.messages || [],
        createdAt: chat.createdAt || new Date().toISOString(),
        title: chat.title || 'Chat',
      }));
    }
  } catch (error) {
    console.error('Failed to load chats from localStorage:', error);
  }
  return [];
};

export const saveChatsToStorage = (chats: StoredChatSession[], userId: string): void => {
  if (!userId) {
    console.warn('Attempted to save chats without a userId.');
    return;
  }
  try {
    const sortedChats = [...chats].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    localStorage.setItem(getChatHistoryKey(userId), JSON.stringify(sortedChats));
  } catch (error) {
    console.error('Failed to save chats to localStorage:', error);
  }
};

export const convertMessagesToApiHistory = (messages: StoredChatMessage[] | ChatMessage[]): Content[] => {
  if (!messages || messages.length === 0) return [];
  
  const validMessages = messages.filter(msg => {
    if ('isStreaming' in msg && msg.isStreaming && !msg.text) return false;
    if (!msg.text && !msg.id?.startsWith('bot-initial-')) return false; // Allow initial bot message even if text is empty during setup
    if (!msg.text && msg.sender !== 'bot') return false; // User messages must have text
    return true;
  });

  return validMessages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }],
  }));
};

export const getChatTitle = (messages: StoredChatMessage[], currentTitle: string): string => {
  const isDefaultOrGenericTitle = (title: string): boolean => {
    if (!title) return true;
    const lowerTitle = title.toLowerCase();
    return lowerTitle === 'new chat' || 
           lowerTitle === 'chat' || 
           lowerTitle.startsWith('chat - ');
  };

  if (currentTitle && !isDefaultOrGenericTitle(currentTitle)) {
    return currentTitle;
  }

  const firstUserMessage = messages.find(msg => msg.sender === 'user' && msg.text.trim() !== '');
  if (firstUserMessage) {
    const newTitle = firstUserMessage.text.substring(0, 35);
    return newTitle.length === 35 ? newTitle + '...' : newTitle;
  }

  if (currentTitle && currentTitle.toLowerCase() === 'new chat' && 
      messages.length === 1 && messages[0].sender === 'bot' && messages[0].id.startsWith('bot-initial-')) {
    return 'New Chat';
  }
  
  if (messages.length > 0) {
    const firstMessageTimestamp = messages[0].timestamp;
    try {
      const date = new Date(firstMessageTimestamp);
      if (!isNaN(date.getTime())) {
        const formattedDate = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `Chat - ${formattedDate}, ${formattedTime}`;
      }
    } catch (e) {
      console.warn('Error formatting date for chat title:', e);
    }
  }
  
  return 'New Chat'; 
};
