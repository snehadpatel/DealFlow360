import React from 'react';
import { Bot, Sparkles, ArrowRight } from 'lucide-react';

export default function AIRiskInsight({ riskLevel }) {
  if (riskLevel !== 'HIGH' && riskLevel !== 'MEDIUM') return null;

  return (
    <div className="border border-purple-200 bg-purple-50 rounded-card p-5 shadow-sm relative overflow-hidden group">
      <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
        <Sparkles className="w-32 h-32 text-purple-600" />
      </div>
      
      <div className="relative z-10 flex flex-col space-y-3">
        <div className="flex items-center space-x-2 text-purple-700">
          <Bot className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-widest">DealFlow AI Insight</span>
        </div>
        
        <div>
          <h4 className="text-sm font-bold text-text-primary mb-1">Risk Assessment</h4>
          <p className="text-sm text-text-secondary leading-relaxed">
            "This deal has elevated approval risk because the requested service discount exceeds the configured limit while overall margin falls below the recommended threshold."
          </p>
        </div>
        
        <div className="pt-2">
          <h4 className="text-sm font-bold text-text-primary mb-1">Recommendation</h4>
          <div className="flex items-start space-x-2 bg-white/60 p-3 rounded-btn border border-purple-100">
            <ArrowRight className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-purple-900 leading-snug">
              "Consider reducing the service discount back to 10% or request explicit finance review before proceeding."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
