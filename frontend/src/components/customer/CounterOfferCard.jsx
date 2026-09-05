import React from 'react';
import StatusBadge from './StatusBadge';
import { CheckCircle2, MessageSquare, RefreshCcw } from 'lucide-react';

export default function CounterOfferCard({ counterOffer, onAccept, onContinue, loading }) {
  if (!counterOffer) return null;
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  const { requestedDiscount, approvedDiscount, updatedTotal, salesMessage } = counterOffer;

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 shadow-md space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-100 text-purple-600 rounded-lg"><MessageSquare className="w-6 h-6" /></div>
          <div>
            <h3 className="text-base font-bold text-textPrimary">Sales Team Counter Offer</h3>
            <p className="text-xs text-purple-600 mt-0.5">The sales team has reviewed your request and proposed a revised discount.</p>
          </div>
        </div>
        <StatusBadge status="COUNTER_OFFER" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-lg border border-gray-200">
        <div><span className="text-xs text-textSecondary font-semibold">Your Requested Discount</span><div className="text-lg font-bold text-textSecondary line-through mt-0.5">{requestedDiscount}%</div></div>
        <div><span className="text-xs text-brand-500 font-bold uppercase tracking-wider">Approved Discount</span><div className="text-xl font-extrabold text-success-500 mt-0.5">{approvedDiscount}%</div></div>
        <div><span className="text-xs text-textSecondary font-semibold">Updated Total</span><div className="text-lg font-bold text-textPrimary mt-0.5">{formatCurrency(updatedTotal)}</div></div>
      </div>
      {salesMessage && <div className="bg-white p-4 rounded-lg border border-gray-200 text-xs text-textPrimary"><span className="font-bold text-textSecondary">Message from Sales Team: </span><span>"{salesMessage}"</span></div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button onClick={onAccept} disabled={loading} className="py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-200 text-white font-semibold rounded-full shadow-btn transition flex items-center justify-center space-x-2 text-sm">
          <CheckCircle2 className="w-4 h-4" /><span>Accept Counter Offer</span>
        </button>
        <button onClick={onContinue} disabled={loading} className="py-3 bg-white hover:bg-gray-50 disabled:bg-gray-100 text-textPrimary font-medium rounded-full border border-gray-200 transition flex items-center justify-center space-x-2 text-sm">
          <RefreshCcw className="w-4 h-4" /><span>Continue Negotiation</span>
        </button>
      </div>
    </div>
  );
}
