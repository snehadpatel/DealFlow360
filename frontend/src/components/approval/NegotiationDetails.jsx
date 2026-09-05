import React from 'react';
import { MessageSquare, Clock } from 'lucide-react';

export default function NegotiationDetails({ negotiation, requestedDiscount }) {
  if (!negotiation) return null;

  return (
    <div className="bg-white border border-surface-border rounded-card shadow-card p-5">
      <div className="flex items-center justify-between border-b border-surface-border pb-3 mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
          Customer Negotiation
        </h3>
        <div className="flex items-center space-x-1.5 text-xs font-bold text-text-secondary bg-gray-100 px-2 py-1 rounded-btn">
          <Clock className="w-3.5 h-3.5" />
          <span>{negotiation.submitted_at ? new Date(negotiation.submitted_at).toLocaleString() : 'N/A'}</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-primary-50 border border-primary-100 rounded-btn p-3">
          <span className="text-sm font-bold text-primary-900">Requested Discount</span>
          <span className="text-lg font-extrabold text-primary-600">{requestedDiscount}%</span>
        </div>
        
        <div className="bg-gray-50 border border-surface-border rounded-btn p-4 relative">
          <MessageSquare className="w-5 h-5 text-gray-300 absolute top-4 left-4" />
          <p className="pl-8 text-sm text-text-primary italic font-medium leading-relaxed">
            "{negotiation.message}"
          </p>
        </div>
      </div>
    </div>
  );
}
