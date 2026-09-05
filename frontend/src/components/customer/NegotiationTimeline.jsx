import React from 'react';
import { History, CheckCircle2, Clock, XCircle, ArrowDown } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function NegotiationTimeline({ history = [] }) {
  if (!history || history.length === 0) {
    return <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md text-center text-textSecondary text-xs">No negotiation history recorded for this quotation yet.</div>;
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle2 className="w-4 h-4 text-success-500" />;
      case 'REJECTED': return <XCircle className="w-4 h-4 text-danger-500" />;
      case 'COUNTER_OFFER': return <Clock className="w-4 h-4 text-purple-500" />;
      default: return <Clock className="w-4 h-4 text-warning-500" />;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md space-y-6">
      <div className="flex items-center space-x-2 border-b border-gray-200 pb-3">
        <History className="w-4 h-4 text-brand-500" />
        <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider">Negotiation History</h3>
      </div>
      <div className="relative pl-6 space-y-6">
        <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-surface-border" />
        {history.map((step, idx) => (
          <div key={step.id || idx} className="relative flex flex-col space-y-1">
            <div className="absolute -left-6 top-0.5 p-1 bg-white rounded-full border border-gray-200 z-10">{getStatusIcon(step.status)}</div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-textPrimary">{step.author || step.action}</span>
              <div className="flex items-center space-x-2">
                {step.status && <StatusBadge status={step.status} />}
                <span className="text-[11px] text-textSecondary">{step.date}</span>
              </div>
            </div>
            {step.details && <p className="text-xs text-textSecondary bg-gray-50 p-2.5 rounded-lg border border-gray-200 mt-1">{step.details}</p>}
            {idx < history.length - 1 && <div className="pt-2 text-gray-300 flex items-center justify-center"><ArrowDown className="w-3.5 h-3.5" /></div>}
          </div>
        ))}
      </div>
    </div>
  );
}
