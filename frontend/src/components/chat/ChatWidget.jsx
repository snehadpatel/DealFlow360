import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, X, Send, Bot, Sparkles, RefreshCw, Minimize2 } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatSuggestions from './ChatSuggestions';
import { sendChatMessage, getChatSuggestions } from '../../api/chatApi';

const DEFAULT_WELCOME = {
  id: 'welcome',
  sender: 'assistant',
  text: "Hello! 👋 I'm your **DealFlow360 AI Sales Assistant**, powered by our self-trained models.\n\nI can help you analyze quotes, check billing, identify discount anomalies, suggest upsell bundles, and monitor deal health. What would you like to explore?",
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  intent: 'general',
};

export default function ChatWidget() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([DEFAULT_WELCOME]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeScreen, setActiveScreen] = useState('general');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Determine active screen based on URL
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    let screen = 'general';
    if (path.includes('billing')) screen = 'billing';
    else if (path.includes('subscription')) screen = 'subscriptions';
    else if (path.includes('quote')) screen = 'quotes';
    else if (path.includes('approval')) screen = 'approvals';
    else if (path.includes('fulfillment')) screen = 'fulfillment';
    setActiveScreen(screen);

    // Fetch screen-relevant suggestions
    getChatSuggestions(screen)
      .then((res) => {
        if (res?.suggestions) setSuggestions(res.suggestions);
      })
      .catch(() => {
        setSuggestions([
          'What is BIL-2045 status?',
          'Suggest upsells for router',
          'Any pricing anomalies?',
        ]);
      });
  }, [location.pathname]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage({
        message: text,
        session_id: 'user_session',
        active_screen: activeScreen,
      });

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: response.reply || "I've processed your request.",
        intent: response.intent,
        confidence: response.confidence,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (response.suggestions && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
      }
    } catch (err) {
      console.error('Chat API Error:', err);
      const fallbackMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: "I encountered an issue connecting to the AI model service. Please try again in a moment.",
        intent: 'general',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([DEFAULT_WELCOME]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-[#F26C4F] to-[#E05338] text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
          aria-label="Open AI Assistant"
        >
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F8B179] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white border-2 border-[#F26C4F]"></span>
          </span>
          <MessageSquare size={24} className="group-hover:rotate-6 transition-transform" />
        </button>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="flex flex-col w-[380px] sm:w-[420px] h-[560px] max-h-[85vh] bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-[#F26C4F] to-[#E05338] text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
                <Bot size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-sm leading-none">DealFlow360 AI</h3>
                  <span className="inline-flex items-center gap-0.5 text-[9px] bg-white/25 backdrop-blur-xs px-1.5 py-0.5 rounded-full font-medium">
                    <Sparkles size={8} /> Custom ML
                  </span>
                </div>
                <p className="text-[11px] text-white/80 mt-0.5 leading-none">Sales Operations Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                title="Reset conversation"
                className="p-1.5 hover:bg-white/20 rounded-lg text-white/90 hover:text-white transition-colors"
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 hover:bg-white/20 rounded-lg text-white/90 hover:text-white transition-colors"
              >
                <Minimize2 size={16} />
              </button>
            </div>
          </div>

          {/* Active Context Bar */}
          <div className="px-3.5 py-1.5 bg-[#F4F5F7] border-b border-[#E5E7EB] flex items-center justify-between text-[11px] text-[#6B7280]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
              Active Screen: <strong className="text-gray-700 capitalize">{activeScreen}</strong>
            </span>
            <span className="text-[10px] text-gray-400">DistilBERT + DistilGPT2</span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-2 bg-[#FAFBFD] space-y-1">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {isLoading && (
              <div className="flex items-center gap-2.5 my-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#F26C4F] to-[#F8B179] flex items-center justify-center text-white shadow-sm">
                  <Bot size={15} />
                </div>
                <div className="bg-white border border-[#E5E7EB] px-4 py-3 rounded-2xl rounded-bl-xs shadow-xs flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F26C4F] animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F26C4F] animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F26C4F] animate-bounce"></div>
                  <span className="text-[11px] text-gray-400 ml-1.5">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="px-3 py-1.5 bg-white border-t border-[#E5E7EB]/70">
            <div className="text-[10px] font-medium text-gray-400 px-1 mb-1">Suggested questions:</div>
            <ChatSuggestions
              suggestions={suggestions}
              onSelectSuggestion={(sug) => handleSend(sug)}
              disabled={isLoading}
            />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-[#E5E7EB]">
            <div className="flex items-center gap-2 bg-[#F4F5F7] border border-[#E5E7EB] focus-within:border-[#F26C4F] focus-within:bg-white rounded-xl px-3 py-1.5 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about deals, billing, upsells..."
                disabled={isLoading}
                className="flex-1 bg-transparent text-xs sm:text-sm text-[#1F2937] placeholder-gray-400 focus:outline-none disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!inputText.trim() || isLoading}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#F26C4F] hover:bg-[#E05338] text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-2xs active:scale-95"
              >
                <Send size={14} />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-1.5">
              DealFlow360 Self-Governing AI Operations
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
