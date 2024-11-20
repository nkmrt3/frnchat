import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Conversation {
  _id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface ConversationContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  startNewConversation: () => Promise<void>;
  setCurrentConversation: (conversation: Conversation) => void;
  sendMessage: (message: string) => Promise<void>;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const ConversationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch('http://localhost:1234/api/conversations');
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const data = await response.json();
      setConversations(data || []);
    } catch (error) {
      console.error('Fetch conversations error:', error);
      toast.error('Failed to fetch conversations');
      setConversations([]);
    }
  };

  const startNewConversation = async () => {
    try {
      const response = await fetch('http://localhost:1234/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Conversation' }),
      });
      if (!response.ok) throw new Error('Failed to create conversation');
      const newConversation = await response.json();
      if (!newConversation?._id) throw new Error('Invalid conversation data');
      
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversation(newConversation);
    } catch (error) {
      console.error('Create conversation error:', error);
      toast.error('Failed to create new conversation');
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      const response = await fetch('http://localhost:1234/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationId: currentConversation?._id,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      const data = await response.json();
      
      if (!data?.conversation?._id) {
        throw new Error('Invalid response data');
      }

      const updatedConversation = data.conversation;
      
      setConversations(prev => 
        prev.map(conv => 
          conv._id === updatedConversation._id ? updatedConversation : conv
        )
      );
      
      setCurrentConversation(updatedConversation);
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
      throw error;
    }
  };

  return (
    <ConversationContext.Provider
      value={{
        conversations,
        currentConversation,
        startNewConversation,
        setCurrentConversation,
        sendMessage,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
};