import React from 'react';
import { Bot, User, Sparkles } from 'lucide-react';

const formatMessageText = (text) => {
  if (!text) return null;
  // Simple markdown parser for **bold** and bullet points
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    // Process bold text
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const renderedLine = parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={pIdx} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
      return (
        <li key={idx} className="ml-3 my-0.5 list-disc text-xs sm:text-sm">
          {renderedLine}
        </li>
      );
    }
    if (line.match(/^\d+\.\s/)) {
      return (
        <div key={idx} className="ml-1 my-0.5 text-xs sm:text-sm">
          {renderedLine}
        </div>
      );
    }
    return (
      <p key={idx} className={idx > 0 ? "mt-1.5 text-xs sm:text-sm leading-relaxed" : "text-xs sm:text-sm leading-relaxed"}>
        {renderedLine}
      </p>
    );
  });
};

export default function ChatMessage({ message }) {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex w-full gap-2.5 my-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-tr from-[#F26C4F] to-[#F8B179] flex items-center justify-center text-white shadow-sm mt-0.5">
          <Bot size={15} />
        </div>
      )}

      <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-sm transition-all ${
        isUser
          ? 'bg-[#F26C4F] text-white rounded-br-xs'
          : 'bg-white border border-[#E5E7EB] text-[#1F2937] rounded-bl-xs'
      }`}>
        {!isUser && message.intent && message.intent !== 'general' && (
          <div className="flex items-center gap-1 mb-1 text-[10px] font-medium tracking-wide uppercase text-[#F26C4F] bg-[#FEECE8] px-1.5 py-0.5 rounded-full w-fit">
            <Sparkles size={10} />
            <span>{message.intent.replace('_', ' ')}</span>
            {message.confidence && (
              <span className="text-gray-400 text-[9px]">({Math.round(message.confidence * 100)}%)</span>
            )}
          </div>
        )}

        <div className={`text-xs sm:text-sm ${isUser ? 'text-white font-normal' : 'text-[#1F2937]'}`}>
          {isUser ? message.text : formatMessageText(message.text)}
        </div>

        <div className={`text-[10px] mt-1 text-right select-none ${
          isUser ? 'text-white/70' : 'text-gray-400'
        }`}>
          {message.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 shadow-sm mt-0.5">
          <User size={15} />
        </div>
      )}
    </div>
  );
}
