import React from 'react';
import StatusBadge from './StatusBadge';
import { CheckCircle2, MessageSquare, RefreshCcw } from 'lucide-react';

export default function CounterOfferCard({ counterOffer, onAccept, onContinue, loading }) {
  if (!counterOffer) return null;
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  const { requestedDiscount, approvedDiscount, updatedTotal, salesMessage } = counterOffer;

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-card p-6 shadow-card space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-100 text-purple-600 rounded-btn"><MessageSquare className="w-6 h-6" /></div>
          <div>
            <h3 className="text-base font-bold text-text-primary">Sales Team Counter Offer</h3>
            <p className="text-xs text-purple-600 mt-0.5">The sales team has reviewed your request and proposed a revised discount.</p>
          </div>
        </div>
        <StatusBadge status="COUNTER_OFFER" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-btn border border-surface-border">
        <div><span className="text-xs text-text-secondary font-semibold">Your Requested Discount</span><div className="text-lg font-bold text-text-secondary line-through mt-0.5">{requestedDiscount}%</div></div>
        <div><span className="text-xs text-primary-500 font-bold uppercase tracking-wider">Approved Discount</span><div className="text-xl font-extrabold text-success-500 mt-0.5">{approvedDiscount}%</div></div>
        <div><span className="text-xs text-text-secondary font-semibold">Updated Total</span><div className="text-lg font-bold text-text-primary mt-0.5">{formatCurrency(updatedTotal)}</div></div>
      </div>
      {salesMessage && <div className="bg-white p-4 rounded-btn border border-surface-border text-xs text-text-primary"><span className="font-bold text-text-secondary">Message from Sales Team: </span><span>"{salesMessage}"</span></div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button onClick={onAccept} disabled={loading} className="py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-200 text-white font-semibold rounded-pill shadow-btn transition flex items-center justify-center space-x-2 text-sm">
          <CheckCircle2 className="w-4 h-4" /><span>Accept Counter Offer</span>
        </button>
        <button onClick={onContinue} disabled={loading} className="py-3 bg-white hover:bg-gray-50 disabled:bg-gray-100 text-text-primary font-medium rounded-pill border border-surface-border transition flex items-center justify-center space-x-2 text-sm">
          <RefreshCcw className="w-4 h-4" /><span>Continue Negotiation</span>
        </button>
      </div>
    </div>
  );
}
