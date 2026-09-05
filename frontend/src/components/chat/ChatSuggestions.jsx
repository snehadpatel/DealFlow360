import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function ChatSuggestions({ suggestions = [], onSelectSuggestion, disabled = false }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 py-1 px-1">
      {suggestions.map((suggestion, idx) => (
        <button
          key={idx}
          type="button"
          disabled={disabled}
          onClick={() => onSelectSuggestion(suggestion)}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-[#F26C4F] bg-white hover:bg-[#FEECE8] border border-[#F26C4F]/25 hover:border-[#F26C4F] px-2.5 py-1 rounded-full transition-all duration-150 shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          <span>{suggestion}</span>
          <ArrowUpRight size={11} className="text-[#F26C4F]/70" />
        </button>
      ))}
    </div>
  );
}
