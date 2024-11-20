import React from 'react';
import { Toaster } from 'react-hot-toast';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';
import { ConversationProvider } from './context/ConversationContext';

function App() {
  return (
    <ConversationProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <main className="flex-1 relative">
          <ChatInterface />
        </main>
        <Toaster position="top-right" />
      </div>
    </ConversationProvider>
  );
}

export default App;