import React from 'react';
import { Sparkles } from 'lucide-react';

export default function RecommendationConfidence({ confidence = 85 }) {
  const normalized = typeof confidence === 'number'
    ? (confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence))
    : 85;

  const getColor = (val) => {
    if (val >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (val >= 60) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-slate-700 bg-slate-50 border-slate-200';
  };

  return (
    <div
      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getColor(
        normalized
      )}`}
      title={`Statistical association rule confidence: ${normalized}%`}
    >
      <Sparkles className="w-2.5 h-2.5" />
      <span>{normalized}% Confidence</span>
    </div>
  );
}
