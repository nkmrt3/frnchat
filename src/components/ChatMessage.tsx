import React from 'react';
import { User, Bot } from 'lucide-react';
import { format } from 'date-fns';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatMessageProps {
  message: Message;
}

// Define the CodeProps interface explicitly
interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  const components: Components = {
    code: ({ className, children, ...props }: CodeProps) => {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');
      
      if (!props.inline && match) {
        return (
          <SyntaxHighlighter
            style={materialDark as any}
            language={match[1]}
            PreTag="div"
          >
            {codeString}
          </SyntaxHighlighter>
        );
      }
      
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <div className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full ${
        isUser ? 'bg-blue-600' : 'bg-gray-600'
      }`}>
        {isUser ? (
          <User className="h-5 w-5 text-white" />
        ) : (
          <Bot className="h-5 w-5 text-white" />
        )}
      </div>
      <div className={`flex max-w-[80%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-lg px-4 py-2 ${
          isUser ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
        }`}>
          {isUser ? (
            <p className="text-sm">{message.content}</p>
          ) : (
            <div className="markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={components}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {format(new Date(message.timestamp), 'HH:mm')}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;