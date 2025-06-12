
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleGenAI, Chat, Content } from "@google/genai";
import { ChatMessage, StoredChatSession, StoredChatMessage, ToastMessage, User } from './types';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import PageLoader from './components/PageLoader';
import AuthPage from './components/auth/AuthPage';
import { loadChatsFromStorage, saveChatsToStorage, generateChatId, convertMessagesToApiHistory, getChatTitle } from './utils/chatHistory';

const initialGuestMessageContent = "Hello! I'm Aiva ✨. You're currently chatting as a guest. This conversation won't be saved. Log in or sign up to save your chats, create new ones, and access your history!";
const initialGuestMessageIdPrefix = 'bot-guest-initial-';
const initialBotMessageIdPrefix = 'bot-initial-'; // For authenticated users' new chats

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

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authFlowTriggered, setAuthFlowTriggered] = useState<boolean>(false);

  const getInitialGuestMessage = useCallback((): ChatMessage => ({
    id: `${initialGuestMessageIdPrefix}${Date.now()}`,
    text: initialGuestMessageContent,
    sender: 'bot',
    timestamp: new Date(),
  }), []);


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
      if (!process.env.API_KEY && !apiKeyError) {
         setApiKeyError("API Key is missing. AI Service cannot be initialized.");
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
  }, [ai, addToast, apiKeyError]);

  const setupGuestSession = useCallback(() => {
    setActiveChatId("guest-active-chat");
    setCurrentMessages([getInitialGuestMessage()]);
    setChatSession(initializeChatSession()); // Initialize with no history for guest
    setAllChats([]); // Guests don't have stored chats
    setError(null);
  }, [getInitialGuestMessage, initializeChatSession]);
  

  const createInitialNewChatForUser = useCallback((userIdForStorage: string) => {
    const newChatId = generateChatId();
    const now = new Date();
    const initialBotMessage: StoredChatMessage = {
      id: `${initialBotMessageIdPrefix}${Date.now()}`,
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
      saveChatsToStorage(updatedChats, userIdForStorage);
      return updatedChats;
    });
    setActiveChatId(newChatId);
    setError(null);
  }, [setAllChats, setActiveChatId, setError]);


  const handleNewChat = useCallback(() => {
    if (!isAuthenticated || !currentUser) {
      addToast("Please login or sign up to create new chats and save your history.", 'info');
      setAuthFlowTriggered(true);
      return;
    }

    if (activeChatId) {
       setAllChats(prevAllChats => {
            const activeChatIndex = prevAllChats.findIndex(chat => chat.id === activeChatId);
            if (activeChatIndex !== -1) {
                const chatToSave = prevAllChats[activeChatIndex];
                const nonInitialOrUserMessages = currentMessages.filter(msg => 
                    !(msg.id.startsWith(initialBotMessageIdPrefix) || msg.id.startsWith(initialGuestMessageIdPrefix)) || msg.sender === 'user'
                );
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
                    const updatedChats = prevAllChats.map(chat =>
                        chat.id === activeChatId ? updatedChatToSave : chat
                    );
                    if (currentUser) saveChatsToStorage(updatedChats, currentUser.id);
                    return updatedChats;
                }
            }
            return prevAllChats;
       });
    }
    
    createInitialNewChatForUser(currentUser.id);

  }, [isAuthenticated, currentUser, activeChatId, currentMessages, createInitialNewChatForUser, addToast, setAllChats]);

  useEffect(() => {
    setIsAppLoading(true);
    if (!process.env.API_KEY) {
      console.error("API_KEY environment variable not set.");
      setApiKeyError("API Key is missing. Please ensure the API_KEY environment variable is set in your environment.");
    } else if (!ai && !apiKeyError) {
        setApiKeyError("AI Service failed to initialize. Please check your API key and network.");
    }
    // Initial setup for guest or authenticated user will be handled in the next effect
    setIsAppLoading(false);
  }, [ai, apiKeyError]);

  useEffect(() => {
    if (authFlowTriggered) { // If auth flow is active, don't change chat states
        return;
    }

    if (!isAuthenticated || !currentUser) {
      // Setup for guest or after logout
      setupGuestSession();
    } else {
      // Authenticated user: load their chats
      const loadedChats = loadChatsFromStorage(currentUser.id);
      setAllChats(loadedChats);

      if (loadedChats.length === 0) {
        createInitialNewChatForUser(currentUser.id);
      } else {
        const activeChatExists = activeChatId && loadedChats.find(chat => chat.id === activeChatId);
        if (!activeChatExists || activeChatId === "guest-active-chat") { // Ensure guest chat ID isn't reused
          const sortedChats = [...loadedChats].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setActiveChatId(sortedChats.length > 0 ? sortedChats[0].id : null);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps  
  }, [isAuthenticated, currentUser, authFlowTriggered, setupGuestSession, createInitialNewChatForUser]); // activeChatId removed to prevent loops from its own update

  useEffect(() => {
    if (!activeChatId) {
        setCurrentMessages([]);
        setChatSession(null);
        return;
    }

    if (!isAuthenticated || !currentUser) { // Guest session
        if (activeChatId === "guest-active-chat") {
            if (currentMessages.length === 0 || currentMessages[0].id !== getInitialGuestMessage().id ) { // Re-initialize guest message if cleared
                setCurrentMessages([getInitialGuestMessage()]);
            }
            if (!chatSession) { // Ensure guest chat session is active
                 setChatSession(initializeChatSession());
            }
        }
        return;
    }
    
    // Authenticated user: Load messages for their active chat
    const activeChatData = allChats.find(chat => chat.id === activeChatId);

    if (activeChatData) {
      const liveMessages = activeChatData.messages.map(msg => ({ ...msg, timestamp: new Date(msg.timestamp) }));
      setCurrentMessages(liveMessages);

      const messagesForApiHistory = liveMessages.length === 1 && liveMessages[0].id.startsWith(initialBotMessageIdPrefix)
        ? [] 
        : activeChatData.messages;

      const apiHistory = convertMessagesToApiHistory(messagesForApiHistory);
      const session = initializeChatSession(apiHistory);
      setChatSession(session);
    } else {
      setCurrentMessages([]);
      setChatSession(null);
      if (allChats.length > 0) {
         const sortedChats = [...allChats].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
         setActiveChatId(sortedChats[0].id);
      } else if (isAuthenticated && currentUser) {
         createInitialNewChatForUser(currentUser.id);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChatId, initializeChatSession, isAuthenticated, currentUser, getInitialGuestMessage]); // allChats and createInitialNewChatForUser omitted to prevent potential loops on initial load/creation


  const handleSelectChat = useCallback((chatId: string) => {
    if (!isAuthenticated || !currentUser) {
      addToast("Please login or sign up to manage chats.", 'info');
      setAuthFlowTriggered(true);
      return;
    }
    if (chatId === activeChatId) return;

    if (activeChatId) {
       setAllChats(prevAllChats => {
            const currentActiveChatIndex = prevAllChats.findIndex(c => c.id === activeChatId);
            if (currentActiveChatIndex !== -1) {
                const chatToSave = prevAllChats[currentActiveChatIndex];
                 const nonInitialOrUserMessages = currentMessages.filter(msg => 
                    !(msg.id.startsWith(initialBotMessageIdPrefix) || msg.id.startsWith(initialGuestMessageIdPrefix)) || msg.sender === 'user'
                );
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
                    if (currentUser) saveChatsToStorage(newAllChatsState, currentUser.id);
                    return newAllChatsState;
                }
            }
            return prevAllChats;
       });
    }
    setActiveChatId(chatId);
    setError(null);
  }, [activeChatId, currentMessages, currentUser, isAuthenticated, setAllChats, setActiveChatId, setError, addToast]);

  const handleDeleteChat = useCallback((chatIdToDelete: string) => {
    if (!isAuthenticated || !currentUser) {
      addToast("Please login or sign up to manage chats.", 'info');
      setAuthFlowTriggered(true);
      return;
    }
    // if (!window.confirm("Are you sure you want to delete this chat? This action cannot be undone.")) {
    //   return;
    // }

    setAllChats(prevChats => {
      const updatedChats = prevChats.filter(chat => chat.id !== chatIdToDelete);
      saveChatsToStorage(updatedChats, currentUser.id);

      if (activeChatId === chatIdToDelete) {
        if (updatedChats.length > 0) {
          const nextActiveChat = [...updatedChats].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
          setActiveChatId(nextActiveChat.id);
        } else {
          setActiveChatId(null); 
          createInitialNewChatForUser(currentUser.id);
        }
      }
      return updatedChats;
    });
  }, [activeChatId, currentUser, isAuthenticated, setAllChats, setActiveChatId, createInitialNewChatForUser, addToast]);


  const handleSendMessage = useCallback(async (inputText: string) => {
    if ((!isAuthenticated || !currentUser) && activeChatId !== "guest-active-chat") { // Guest not in guest session, or user not authenticated
      addToast("Please login or sign up to send messages and save history.", 'info');
      setAuthFlowTriggered(true);
      return;
    }

    if (!inputText.trim()) {
      addToast("Cannot send empty message.", 'error');
      return;
    }
     if (!activeChatId && (isAuthenticated && currentUser)) { // Authenticated user with no active chat selected (should not happen with auto-select/create)
        addToast("No active chat selected. Please select or create a new chat.", 'error');
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
        // For authenticated users, re-init with history. For guests, re-init empty.
        const historyForReinit = (isAuthenticated && currentUser && activeChatId && activeChatId !== "guest-active-chat")
            ? convertMessagesToApiHistory(allChats.find(chat => chat.id === activeChatId)?.messages.filter(m => !m.id.startsWith(initialBotMessageIdPrefix)) || [])
            : [];
        const newSession = initializeChatSession(historyForReinit);
        if (!newSession) {
            addToast("Failed to reinitialize session. Please try again or refresh.", 'error');
            setIsLoading(false);
            return;
        }
        setChatSession(newSession);
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
        if (prevMessages.length === 1 && 
            (prevMessages[0].id.startsWith(initialBotMessageIdPrefix) || prevMessages[0].id.startsWith(initialGuestMessageIdPrefix))
        ) {
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

        if (isAuthenticated && currentUser && activeChatId && activeChatId !== "guest-active-chat") {
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
                saveChatsToStorage(updatedAll, currentUser.id);
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

        if (isAuthenticated && currentUser && activeChatId && activeChatId !== "guest-active-chat") {
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
                saveChatsToStorage(updatedAll, currentUser.id);
                return updatedAll;
            });
        }
        return failureMessages;
      });
      addToast(errorMessageToDisplay, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, chatSession, activeChatId, apiKeyError, allChats, ai, initializeChatSession, addToast, setAllChats, setError, setCurrentMessages, setChatSession, currentUser, isAuthenticated]);


  useEffect(() => {
    const handleBeforeUnloadLogic = () => {
      // Only save if authenticated and there are messages in an active chat
      if (isAuthenticated && currentUser && activeChatId && activeChatId !== "guest-active-chat" && currentMessages.length > 0) {
        const nonInitialOrUserMessages = currentMessages.filter(msg => 
            !(msg.id.startsWith(initialBotMessageIdPrefix) || msg.id.startsWith(initialGuestMessageIdPrefix)) || msg.sender === 'user'
        );
        if (nonInitialOrUserMessages.length > 0) {
           setAllChats(prevChats => { 
                const activeChatData = prevChats.find(chat => chat.id === activeChatId);
                if (!activeChatData) return prevChats;

                const storedMessages: StoredChatMessage[] = currentMessages.map(msg => ({
                    id: msg.id, text: msg.text, sender: msg.sender, timestamp: msg.timestamp.toISOString(),
                }));
                const updatedChats = prevChats.map(chat =>
                    chat.id === activeChatId ? { ...chat, title: getChatTitle(storedMessages, chat.title), messages: storedMessages } : chat
                );
                saveChatsToStorage(updatedChats, currentUser.id);
                return updatedChats;
            });
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnloadLogic);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnloadLogic);
      handleBeforeUnloadLogic(); 
    };
  }, [activeChatId, currentMessages, setAllChats, currentUser, isAuthenticated]);


  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setAuthFlowTriggered(false); 
    addToast(`Welcome back, ${user.email}!`, 'success');
    // Chat loading for authenticated user is handled by useEffect [isAuthenticated, currentUser]
  };

  const handleSignupSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setAuthFlowTriggered(false); 
    addToast(`Account created for ${user.email}! Welcome!`, 'success');
     // Chat loading for authenticated user is handled by useEffect [isAuthenticated, currentUser]
  };
  
  const handleLogout = () => {
    addToast("You have been logged out.", 'info');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAuthFlowTriggered(false); 
    // setupGuestSession will be called by the useEffect watching isAuthenticated
  };
  
  const handleLoginClick = () => {
    setAuthFlowTriggered(true);
  };


  if (isAppLoading) {
    return <PageLoader />;
  }

  if (apiKeyError && !ai) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-800 p-4">
        <div className="bg-slate-700 p-8 rounded-lg shadow-xl text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Configuration Error</h1>
          <p className="text-slate-200">{apiKeyError}</p>
          <p className="mt-4 text-sm text-slate-400">Please ensure your API_KEY environment variable is correctly set and the AI service is accessible.</p>
        </div>
      </div>
    );
  }
  
  if (authFlowTriggered && !isAuthenticated) {
    return <AuthPage 
        onLoginSuccess={handleLoginSuccess} 
        onSignupSuccess={handleSignupSuccess} 
        onCancel={() => {
            setAuthFlowTriggered(false);
            // If cancelling auth, ensure guest session is active if it was interrupted
            if (!isAuthenticated) {
                setupGuestSession();
            }
        }}
    />;
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

      <div className="flex w-full h-screen max-h-screen bg-slate-900 text-white">
        <Sidebar
          isAuthenticated={isAuthenticated} 
          chatSessions={allChats} // Will be empty for guests
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat} // Will trigger auth for guests via its internal check
          onNewChat={handleNewChat} // Will trigger auth for guests
          onDeleteChat={handleDeleteChat} // Will trigger auth for guests
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onLogout={handleLogout}
          onLoginClick={handleLoginClick} 
          currentUserEmail={currentUser?.email}
        />
        <div className="flex flex-col flex-grow h-full max-h-screen bg-slate-700 text-slate-100 min-w-0 md:w-[calc(100%-30%)]">
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
            <div className="w-10 md:hidden"></div> {/* Spacer for mobile button */}
          </header>

          <ChatWindow messages={currentMessages} />

          {error && !apiKeyError && ( 
            <div className="bg-red-700 border-l-4 border-red-500 text-white p-3 mx-2 md:mx-4 my-2 rounded-md text-sm shadow-lg shrink-0">
              <p className="font-bold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          <MessageInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading || (!chatSession && !!ai && !apiKeyError)} // Spinner if loading, or if AI ready but session not (e.g. init error/API key error)
          />
        </div>
      </div>
    </>
  );
};

export default App;
