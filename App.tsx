
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleGenAI, Chat, Content } from "@google/genai";
import { ChatMessage, StoredChatSession, StoredChatMessage, ToastMessage } from './types';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import PageLoader from './components/PageLoader';
import { loadChatsFromStorage, saveChatsToStorage, generateChatId, convertMessagesToApiHistory, getChatTitle } from './utils/chatHistory';

const App: React.FC = () => {
  const [allChats, setAllChats] = useState<StoredChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isAppLoading, setIsAppLoading] = useState(true);

  const ai = useMemo(() => {
    if (process.env.API_KEY) {
      try {
        return new GoogleGenAI({ apiKey: process.env.API_KEY });
      } catch (e) {
        console.error("Failed to initialize GoogleGenAI:", e);
        const errorMessage = e instanceof Error ? e.message : String(e);
        setApiKeyError(`Failed to initialize AI service: ${errorMessage}. Please check your API key.`);
        setError(`Initialization Error: ${errorMessage}`);
        return null;
      }
    }
    return null;
  }, []);

  const addToast = useCallback((message: string, type: ToastMessage['type']) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const initializeChatSession = useCallback((history?: Content[]) => {
    if (!ai) {
      if (!process.env.API_KEY) {
        // This specific error is handled by apiKeyError already
      }
      return null;
    }
    try {
      const session = ai.chats.create({
        model: 'gemini-2.5-flash-preview-04-17',
        config: {
          systemInstruction: 'You are Aiva, a friendly, insightful, and slightly witty AI assistant for AivaChat. You provide concise yet informative answers.',
        },
        history: history || [],
      });
      return session;
    } catch (e) {
      console.error("Failed to create chat session:", e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      addToast(`Chat Session Error: ${errorMessage}`, 'error');
      return null;
    }
  }, [ai, addToast]);

  const createInitialNewChat = useCallback(() => {
    const newChatId = generateChatId();
    const now = new Date();
    const initialBotMessage: StoredChatMessage = {
      id: `bot-initial-${Date.now()}`,
      text: "Hello! I'm Aiva ✨. Your AI Virtual Assistant for AivaChat. How can I assist you today?",
      sender: 'bot',
      timestamp: now.toISOString(),
    };
    const newChatSessionData: StoredChatSession = {
      id: newChatId,
      title: 'New Chat',
      messages: [initialBotMessage],
      createdAt: now.toISOString(),
    };

    setAllChats(prevAllChats => {
      const updatedChats = [newChatSessionData, ...prevAllChats.filter(c => c.id !== newChatId)];
      saveChatsToStorage(updatedChats);
      return updatedChats;
    });
    setActiveChatId(newChatId);
    setError(null);
  }, [setAllChats, setActiveChatId, setError]);


  const handleNewChat = useCallback((saveOldChat = true) => {
    const newChatId = generateChatId();
    const now = new Date();
    const initialBotMessage: ChatMessage = {
      id: `bot-initial-${Date.now()}`,
      text: "Hello! I'm Aiva ✨. Your AI Virtual Assistant for AivaChat. How can I assist you today?",
      sender: 'bot',
      timestamp: now,
    };

    const newChatSessionData: StoredChatSession = {
      id: newChatId,
      title: 'New Chat',
      messages: [{ ...initialBotMessage, timestamp: now.toISOString() }],
      createdAt: now.toISOString(),
    };

    setAllChats(prevAllChats => {
      let chatsToProcess = [...prevAllChats];

      if (saveOldChat && activeChatId) {
        const activeChatIndex = chatsToProcess.findIndex(chat => chat.id === activeChatId);
        if (activeChatIndex !== -1) {
            const chatToSave = chatsToProcess[activeChatIndex];
            const nonInitialOrUserMessages = currentMessages.filter(msg => !msg.id.startsWith('bot-initial-') || msg.sender === 'user');
            const hasMeaningfulContentToSave = nonInitialOrUserMessages.length > 0;

            if (hasMeaningfulContentToSave) {
                const storedMessages: StoredChatMessage[] = currentMessages.map(msg => ({
                    id: msg.id, text: msg.text, sender: msg.sender, timestamp: msg.timestamp.toISOString(),
                }));
                const updatedChatToSave: StoredChatSession = {
                    ...chatToSave,
                    messages: storedMessages,
                    title: getChatTitle(storedMessages, chatToSave.title),
                };
                chatsToProcess = chatsToProcess.map(chat =>
                    chat.id === activeChatId ? updatedChatToSave : chat
                );
            }
        }
      }
      const finalChats = [newChatSessionData, ...chatsToProcess.filter(c => c.id !== newChatId)];
      saveChatsToStorage(finalChats);
      return finalChats;
    });

    setActiveChatId(newChatId);
    setError(null);
  }, [activeChatId, currentMessages, setAllChats, setActiveChatId, setError]);


  useEffect(() => {
    setIsAppLoading(true);

    if (!process.env.API_KEY) {
      console.error("API_KEY environment variable not set.");
      setApiKeyError("API Key is missing. Please ensure the API_KEY environment variable is set in your environment.");
      setIsAppLoading(false);
      return;
    }

    if (!ai && apiKeyError) {
        setIsAppLoading(false);
        return;
    }
    
    const loadedChats = loadChatsFromStorage();
    setAllChats(loadedChats); // Set all chats first

    if (loadedChats.length > 0) {
      // setActiveChatId will be handled by the dedicated useEffect for activeChatId management
    } else {
      // createInitialNewChat will be handled by the dedicated useEffect as well
    }
    setIsAppLoading(false);
  }, [ai, apiKeyError]); // Removed createInitialNewChat, setAllChats, setActiveChatId

  // Effect to manage activeChatId validity and ensure one is always selected or created
  useEffect(() => {
    if (isAppLoading) return; // Don't run this effect until initial loading is done

    if (!activeChatId && allChats.length === 0) {
        createInitialNewChat();
    } else if (activeChatId && !allChats.find(chat => chat.id === activeChatId) && allChats.length > 0) {
        console.warn(`Stale activeChatId ${activeChatId} detected. Resetting to most recent chat.`);
        const sortedChats = [...allChats].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setActiveChatId(sortedChats[0].id);
    } else if (!activeChatId && allChats.length > 0) {
        const sortedChats = [...allChats].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setActiveChatId(sortedChats[0].id);
    }
  }, [activeChatId, allChats, createInitialNewChat, setActiveChatId, isAppLoading]);


  // Effect to load messages for the active chat and initialize the AI chat session
  useEffect(() => {
    if (!activeChatId) {
        setCurrentMessages([]);
        setChatSession(null);
        return;
    }

    const activeChatData = allChats.find(chat => chat.id === activeChatId);

    if (activeChatData) {
      const liveMessages = activeChatData.messages.map(msg => ({ ...msg, timestamp: new Date(msg.timestamp) }));
      setCurrentMessages(liveMessages);

      const messagesForApiHistory = liveMessages.length === 1 && liveMessages[0].id.startsWith('bot-initial-')
        ? []
        : activeChatData.messages;

      const apiHistory = convertMessagesToApiHistory(messagesForApiHistory);
      const session = initializeChatSession(apiHistory);
      setChatSession(session);
    } else {
      // This case should ideally be handled by the effect above,
      // which ensures activeChatId is valid or creates a new chat.
      // If it still occurs, it means there's a brief inconsistency.
      setCurrentMessages([]);
      setChatSession(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChatId, initializeChatSession]); // allChats is intentionally omitted to stabilize chatSession


  const handleSelectChat = useCallback((chatId: string) => {
    if (chatId === activeChatId) return;

    if (activeChatId) {
       setAllChats(prevAllChats => {
            const currentActiveChatIndex = prevAllChats.findIndex(c => c.id === activeChatId);
            if (currentActiveChatIndex !== -1) {
                const chatToSave = prevAllChats[currentActiveChatIndex];
                // Only save if there are actual user messages or more than just the initial bot message
                const nonInitialOrUserMessages = currentMessages.filter(msg => !msg.id.startsWith('bot-initial-') || msg.sender === 'user');
                const hasMeaningfulContentToSave = nonInitialOrUserMessages.length > 0;

                if (hasMeaningfulContentToSave) {
                    const storedMessages: StoredChatMessage[] = currentMessages.map(msg => ({
                        id: msg.id, text: msg.text, sender: msg.sender, timestamp: msg.timestamp.toISOString(),
                    }));
                    const updatedSavedChat: StoredChatSession = {
                        ...chatToSave,
                        messages: storedMessages,
                        title: getChatTitle(storedMessages, chatToSave.title),
                    };
                    const newAllChatsState = prevAllChats.map(c =>
                        c.id === activeChatId ? updatedSavedChat : c
                    );
                    saveChatsToStorage(newAllChatsState);
                    return newAllChatsState;
                }
            }
            return prevAllChats;
       });
    }
    setActiveChatId(chatId);
    setError(null);
  }, [activeChatId, currentMessages, setAllChats, setActiveChatId, setError]);

  const handleDeleteChat = useCallback((chatIdToDelete: string) => {
    if (!window.confirm("Are you sure you want to delete this chat? This action cannot be undone.")) {
      return;
    }

    setAllChats(prevChats => {
      const updatedChats = prevChats.filter(chat => chat.id !== chatIdToDelete);
      saveChatsToStorage(updatedChats);

      if (activeChatId === chatIdToDelete) {
        if (updatedChats.length > 0) {
          const nextActiveChat = [...updatedChats].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
          setActiveChatId(nextActiveChat.id);
        } else {
          setActiveChatId(null); 
        }
      }
      return updatedChats;
    });
  }, [activeChatId, setAllChats, setActiveChatId]);


  const handleSendMessage = useCallback(async (inputText: string) => {
    if (!inputText.trim() || !activeChatId) {
      addToast("Cannot send empty message or no active chat selected.", 'error');
      return;
    }
     if (isLoading) {
        addToast("Please wait for the current response to complete.", 'info');
        return;
    }

    let currentChatSession = chatSession;
    if (!currentChatSession) {
        if (!ai) {
            addToast(apiKeyError || "AI service is not available. Check API Key.", 'error');
            return;
        }
        addToast("Chat session not ready. Attempting to re-initialize...", 'info');
        const activeChatDataForReinit = allChats.find(chat => chat.id === activeChatId);
        const historyForReinit = activeChatDataForReinit ? convertMessagesToApiHistory(activeChatDataForReinit.messages) : [];
        const newSession = initializeChatSession(historyForReinit);
        if (!newSession) {
            addToast("Failed to reinitialize session. Please try starting a new chat or refreshing.", 'error');
            setIsLoading(false);
            return;
        }
        setChatSession(newSession); // Set the new session for this send
        currentChatSession = newSession;
    }

    setIsLoading(true);
    setError(null);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    const botMessageId = `bot-${Date.now()}`;
    const botPlaceholderMessage: ChatMessage = {
      id: botMessageId,
      text: '',
      sender: 'bot',
      timestamp: new Date(),
      isStreaming: true,
    };

    setCurrentMessages(prevMessages => {
        // Replace initial bot message if it's the only one
        if (prevMessages.length === 1 && prevMessages[0].id.startsWith('bot-initial-')) {
            return [userMessage, botPlaceholderMessage];
        }
        return [...prevMessages, userMessage, botPlaceholderMessage];
    });

    try {
      const stream = await currentChatSession.sendMessageStream({ message: inputText });
      let accumulatedBotText = '';
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (chunkText) {
          accumulatedBotText += chunkText;
          setCurrentMessages(prevMsgs =>
            prevMsgs.map(msg =>
              msg.id === botMessageId ? { ...msg, text: accumulatedBotText, isStreaming: true } : msg
            )
          );
        }
      }

      const finalTimestamp = new Date();
      setCurrentMessages(prevMsgs => {
        const finalizedMessages = prevMsgs.map(msg =>
          msg.id === botMessageId ? { ...msg, text: accumulatedBotText, isStreaming: false, timestamp: finalTimestamp } : msg
        );

        if (activeChatId) {
            setAllChats(prevAll => {
                const finalStoredMessages: StoredChatMessage[] = finalizedMessages.map(m => ({
                    id: m.id, text: m.text, sender: m.sender, timestamp: m.timestamp.toISOString()
                }));
                const activeChatFromAll = prevAll.find(c => c.id === activeChatId);
                const currentTitle = activeChatFromAll ? activeChatFromAll.title : 'Chat';

                const updatedAll = prevAll.map(chat =>
                    chat.id === activeChatId
                    ? { ...chat, messages: finalStoredMessages, title: getChatTitle(finalStoredMessages, currentTitle) }
                    : chat
                );
                saveChatsToStorage(updatedAll);
                return updatedAll;
            });
        }
        return finalizedMessages;
      });

    } catch (err) {
      console.error("Error sending message to Gemini API:", err);
      const friendlyError = err instanceof Error ? err.message : "An unknown error occurred with the AI service.";
      const errorMessageToDisplay = `Aiva encountered an error: ${friendlyError}`;

      const errorTimestamp = new Date();
      setCurrentMessages(prevMsgs => {
        const failureMessages = prevMsgs.map(msg =>
          msg.id === botMessageId
            ? { ...msg, text: "Aiva encountered an issue. Please try again.", isStreaming: false, timestamp: errorTimestamp }
            : msg
        );

        if (activeChatId) {
            setAllChats(prevAll => {
                const failureStoredMessages: StoredChatMessage[] = failureMessages.map(m => ({
                     id: m.id, text: m.text, sender: m.sender, timestamp: m.timestamp.toISOString()
                }));
                 const activeChatFromAll = prevAll.find(c => c.id === activeChatId);
                const currentTitle = activeChatFromAll ? activeChatFromAll.title : 'Chat';

                 const updatedAll = prevAll.map(chat =>
                    chat.id === activeChatId
                    ? { ...chat, messages: failureStoredMessages, title: getChatTitle(failureStoredMessages, currentTitle) }
                    : chat
                );
                saveChatsToStorage(updatedAll);
                return updatedAll;
            });
        }
        return failureMessages;
      });
      addToast(errorMessageToDisplay, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, chatSession, activeChatId, apiKeyError, allChats, ai, initializeChatSession, addToast, setAllChats, setError, setCurrentMessages, setChatSession]);


  useEffect(() => {
    const handleBeforeUnloadLogic = () => {
      if (activeChatId && currentMessages.length > 0) {
        const nonInitialOrUserMessages = currentMessages.filter(msg => !msg.id.startsWith('bot-initial-') || msg.sender === 'user');
        if (nonInitialOrUserMessages.length > 0) { // Only save if meaningful content
           setAllChats(prevChats => {
                const activeChatData = prevChats.find(chat => chat.id === activeChatId);
                if (!activeChatData) return prevChats;

                const storedMessages: StoredChatMessage[] = currentMessages.map(msg => ({
                    id: msg.id, text: msg.text, sender: msg.sender, timestamp: msg.timestamp.toISOString(),
                }));
                const updatedChats = prevChats.map(chat =>
                    chat.id === activeChatId ? { ...chat, title: getChatTitle(storedMessages, chat.title), messages: storedMessages } : chat
                );
                saveChatsToStorage(updatedChats);
                return updatedChats; // This return is for setAllChats, doesn't affect beforeunload itself
            });
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnloadLogic);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnloadLogic);
      // Attempt to save one last time when component unmounts or dependencies change,
      // which might be too late for browser close but good for SPA navigations or HMR.
      handleBeforeUnloadLogic(); 
    };
  }, [activeChatId, currentMessages, setAllChats]);

  if (isAppLoading) {
    return <PageLoader />;
  }

  if (apiKeyError && !ai) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-800 p-4">
        <div className="bg-slate-700 p-8 rounded-lg shadow-xl text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Configuration Error</h1>
          <p className="text-slate-200">{apiKeyError}</p>
          <p className="mt-4 text-sm text-slate-400">Please check your API_KEY environment variable or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-5 right-5 z-[100] w-full max-w-sm space-y-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onDismiss={removeToast}
          />
        ))}
      </div>

      <div className="flex h-screen max-h-screen bg-slate-900 text-white w-full">
        <Sidebar
          chatSessions={allChats}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onNewChat={() => handleNewChat(true)}
          onDeleteChat={handleDeleteChat}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="flex flex-col flex-grow h-full max-h-screen bg-slate-700 text-slate-100 min-w-0 md:w-[70%]">
          <header className="bg-gradient-to-r from-sky-600 to-teal-500 text-white p-3 shadow-md flex items-center justify-between shrink-0">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 text-white hover:bg-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Toggle sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
            </button>
            <h1 className="text-lg md:text-xl font-semibold text-center flex-grow">AivaChat ✨</h1>
            <div className="w-10 md:w-0"></div> {/* Spacer for mobile button */}
          </header>

          <ChatWindow messages={currentMessages} />

          {error && !apiKeyError && ( // Only show general errors if not API key error
            <div className="bg-red-700 border-l-4 border-red-500 text-white p-3 mx-2 md:mx-4 my-2 rounded-md text-sm shadow-lg shrink-0">
              <p className="font-bold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          <MessageInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading || (!chatSession && !!ai && !apiKeyError)} // Also loading if chatSession is not ready
          />
        </div>
      </div>
    </>
  );
};

export default App;
