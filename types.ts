import { Content } from "@google/genai";

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isStreaming?: boolean;
}

export interface StoredChatMessage {
  id:string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string; // ISO string for localStorage
}

export interface StoredChatSession {
  id: string; // Unique ID for this chat session
  title: string;
  messages: StoredChatMessage[];
  createdAt: string; // ISO string for localStorage
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'error' | 'success' | 'info';
}

export interface User {
  id: string; // For mock purposes, can be the email or a generated ID
  email: string;
  // Add other user-specific fields if needed
}
