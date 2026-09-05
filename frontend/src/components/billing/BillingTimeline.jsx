import React from 'react';
import { History, CheckCircle, Clock, Send, FileText, ArrowRight } from 'lucide-react';

export default function BillingTimeline({ timeline = [] }) {
  const getTimelineIcon = (status) => {
    switch (status) {
      case 'CREATED':
        return <FileText className="w-3.5 h-3.5 text-blue-600" />;
      case 'GENERATED':
        return <CheckCircle className="w-3.5 h-3.5 text-purple-600" />;
      case 'SENT':
        return <Send className="w-3.5 h-3.5 text-amber-600" />;
      case 'PROCESSING':
        return <Clock className="w-3.5 h-3.5 text-cyan-600" />;
      case 'COMPLETED':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <History className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
        <History className="w-4 h-4 text-primary" />
        <h2 className="text-base font-bold text-textPrimary tracking-tight">Billing Lifecycle Timeline</h2>
      </div>

      <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {timeline.map((event, idx) => (
          <div key={event.id || idx} className="relative group">
            {/* Timeline node icon */}
            <div className="absolute -left-6 top-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-white border border-slate-300 shadow-xs group-hover:scale-110 transition-transform">
              {getTimelineIcon(event.status)}
            </div>

            <div className="bg-slate-50/80 hover:bg-slate-50 p-3 rounded-xl border border-slate-200/60 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-textPrimary">{event.title}</span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full font-semibold bg-slate-200/70 text-slate-700">
                    {event.status}
                  </span>
                </div>
                <span className="text-[11px] text-textSecondary font-mono">{formatDate(event.date)}</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{event.description}</p>
              {event.actor && (
                <div className="text-[10px] text-slate-400 mt-1 font-medium">
                  Logged by: {event.actor}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
