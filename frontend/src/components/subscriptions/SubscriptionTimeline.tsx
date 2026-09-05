import React from 'react';
import { SubscriptionTimelineEvent } from '../../types/subscription';
import { History, CheckCircle, Circle } from 'lucide-react';

interface Props {
  timeline: SubscriptionTimelineEvent[];
  loading: boolean;
}

export default function SubscriptionTimeline({ timeline, loading }: Props) {
  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500">
        <p>No timeline events found.</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center">
        <History className="w-5 h-5 text-slate-500 mr-2" />
        <h3 className="font-semibold text-slate-800">Subscription Timeline</h3>
      </div>
      
      <div className="p-6">
        <div className="relative border-l-2 border-slate-200 ml-3">
          {timeline.map((event, index) => {
            const isLast = index === timeline.length - 1;
            return (
              <div key={event.id} className="mb-8 last:mb-0 relative pl-6">
                <div className="absolute -left-[11px] top-1 bg-white">
                  {isLast ? (
                    <Circle className="w-5 h-5 text-primary-500 fill-white" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{event.status}</h4>
                  <p className="text-xs text-slate-500 mt-1">{formatDate(event.date)}</p>
                  <p className="text-sm text-slate-700 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {event.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
