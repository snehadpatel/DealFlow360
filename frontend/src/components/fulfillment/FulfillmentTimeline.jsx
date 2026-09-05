import React from 'react';
import { Check, Clock } from 'lucide-react';

export default function FulfillmentTimeline({ timeline }) {
  if (!timeline || timeline.length === 0) return null;

  // Sort by date (assuming they are returned in order, but just to be sure)
  const sortedTimeline = [...timeline].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
      <h3 className="text-lg font-bold text-textPrimary mb-6">Fulfillment Timeline</h3>
      
      <div className="relative border-l-2 border-gray-100 ml-3">
        {sortedTimeline.map((event, idx) => {
          const isLast = idx === sortedTimeline.length - 1;
          return (
            <div key={event.id} className={`mb-8 ml-6 ${isLast ? 'mb-0' : ''}`}>
              <span className="absolute flex items-center justify-center w-6 h-6 bg-success-50 rounded-full -left-3.5 ring-4 ring-white border border-success-200">
                <Check className="w-3 h-3 text-success-600" />
              </span>
              
              <div className="flex flex-col sm:flex-row sm:items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-textPrimary">{event.status}</h4>
                  <p className="text-sm text-textSecondary mt-0.5">{event.description}</p>
                </div>
                <div className="mt-2 sm:mt-0 sm:text-right">
                  <div className="text-xs font-medium text-textSecondary flex items-center sm:justify-end">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(event.date).toLocaleString()}
                  </div>
                  {event.actor && (
                    <div className="text-[10px] font-bold text-brand-600 uppercase tracking-wider mt-1">
                      {event.actor}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
