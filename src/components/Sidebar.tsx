import React from 'react';
import { MessageSquarePlus, MessageSquare, Trash2, Menu } from 'lucide-react';
import { useConversation } from '../context/ConversationContext';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const { conversations, currentConversation, startNewConversation, setCurrentConversation } = useConversation();
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-gray-800 text-white"
      >
        <Menu className="h-5 w-5" />
      </button>

      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? '300px' : '0px',
          opacity: isOpen ? 1 : 0
        }}
        className={`fixed md:relative z-40 h-full bg-gray-800 text-white overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4">
            <button
              onClick={startNewConversation}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transition-colors"
            >
              <MessageSquarePlus className="h-5 w-5" />
              <span>New Chat</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 space-y-2">
            {conversations.map((conv) => (
              <motion.button
                key={conv._id}
                onClick={() => setCurrentConversation(conv)}
                className={`w-full flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  currentConversation?._id === conv._id
                    ? 'bg-gray-700'
                    : 'hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageSquare className="h-5 w-5 shrink-0" />
                <span className="flex-1 truncate text-left">{conv.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle delete
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;