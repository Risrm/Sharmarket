
import React, { useState, useEffect, useRef } from 'react';
import { AIChatMessage } from '../types';
import { GoogleGenAI, Chat } from '@google/genai';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { ChatBubbleOvalLeftEllipsisIcon } from './icons/ChatBubbleOvalLeftEllipsisIcon';

interface AIChatbotProps {
  ai: GoogleGenAI | null;
  chatSession: Chat | null; // Pass the initialized chat session
  messages: AIChatMessage[];
  onSendQuery: (query: string) => void;
  isLoading: boolean;
  error: string | null;
  isAiReady: boolean;
}

const AIChatbot: React.FC<AIChatbotProps> = ({ ai, chatSession, messages, onSendQuery, isLoading, error, isAiReady }) => {
  const [currentQuery, setCurrentQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuery.trim() || !isAiReady || isLoading) return;
    onSendQuery(currentQuery);
    setCurrentQuery('');
  };

  return (
    <div className="bg-white shadow-xl rounded-lg p-6 h-full flex flex-col">
      <div className="flex items-center mb-4">
        <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8 text-primary mr-3" />
        <h3 className="text-xl font-semibold text-neutral">AI Portfolio Chatbot</h3>
      </div>
      <p className="text-sm text-gray-600 mb-3">
        Ask questions about your portfolio, watchlist, uploaded PDF, or general market topics.
      </p>

      <div className="flex-grow overflow-y-auto mb-4 p-3 bg-gray-50 rounded-md border border-gray-200 min-h-[300px] max-h-[400px]">
        {messages.length === 0 && !isLoading && (
          <p className="text-center text-gray-400 italic mt-4">No messages yet. Start a conversation!</p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-3 p-3 rounded-lg max-w-[80%] break-words ${
              msg.role === 'user'
                ? 'bg-primary text-white ml-auto'
                : `bg-gray-200 text-neutral ${msg.isError ? 'border-l-4 border-error' : ''}`
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
          </div>
        ))}
        {isLoading && messages.length > 0 && messages[messages.length-1].role === 'user' && (
             <div className="mb-3 p-3 rounded-lg max-w-[80%] bg-gray-200 text-neutral animate-pulse">
                <p className="text-sm italic">AI is thinking...</p>
             </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="my-2 p-2 bg-red-100 text-red-700 rounded-md text-sm">
          <p><strong className="font-semibold">Chat Error:</strong> {error}</p>
        </div>
      )}

      <form onSubmit={handleSend} className="flex items-center space-x-2 mt-auto">
        <input
          type="text"
          value={currentQuery}
          onChange={(e) => setCurrentQuery(e.target.value)}
          placeholder={isAiReady ? "Ask something..." : "AI is not available..."}
          className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm disabled:bg-gray-100"
          disabled={!isAiReady || isLoading}
          aria-label="Chat input"
        />
        <button
          type="submit"
          disabled={!isAiReady || isLoading || !currentQuery.trim()}
          className="bg-primary hover:bg-blue-600 text-white font-semibold p-2 rounded-lg shadow-md flex items-center justify-center transition duration-150 ease-in-out disabled:opacity-50"
          aria-label="Send chat message"
        >
          {isLoading && messages.length > 0 && messages[messages.length-1].role === 'user' ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
          ) : (
            <PaperAirplaneIcon className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
};

export default AIChatbot;
