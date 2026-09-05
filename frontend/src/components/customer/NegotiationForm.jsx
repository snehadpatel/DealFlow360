import React, { useState } from 'react';
import { Send, AlertCircle, Loader2 } from 'lucide-react';

export default function NegotiationForm({ currentDiscount, currentTotal, onSubmit, loading }) {
  const [requestedDiscount, setRequestedDiscount] = useState(currentDiscount + 5);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const validate = () => {
    const errs = {};
    const discountNum = Number(requestedDiscount);
    if (isNaN(discountNum)) errs.requestedDiscount = 'Please enter a valid numeric discount percentage.';
    else if (discountNum < 0) errs.requestedDiscount = 'Requested discount cannot be negative.';
    else if (discountNum > 100) errs.requestedDiscount = 'Requested discount cannot exceed 100%.';
    if (!message.trim()) errs.message = 'Please provide a reason or message for your negotiation request.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ requested_discount: Number(requestedDiscount), message: message.trim() });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-lg font-bold text-textPrimary">Negotiate this quotation</h2>
        <p className="text-xs text-textSecondary mt-1">Submit a custom discount counter-request to the sales operations team for review.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div>
          <span className="text-xs text-textSecondary font-medium">Current Discount</span>
          <div className="text-xl font-bold text-warning-600 mt-0.5">{currentDiscount}%</div>
        </div>
        <div>
          <span className="text-xs text-textSecondary font-medium">Current Total</span>
          <div className="text-xl font-bold text-textPrimary mt-0.5">{formatCurrency(currentTotal)}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-textSecondary">Requested Discount (%)</label>
          <div className="relative">
            <input type="number" min="0" max="100" step="0.5" value={requestedDiscount} onChange={(e) => setRequestedDiscount(e.target.value)} disabled={loading} className={`w-full bg-gray-50 border px-4 py-2.5 rounded-lg text-sm text-textPrimary focus:outline-none transition ${errors.requestedDiscount ? 'border-danger-500 focus:border-danger-500' : 'border-gray-200 focus:border-primary-500'}`} />
            <span className="absolute right-4 top-2.5 text-sm font-bold text-textSecondary">%</span>
          </div>
          {errors.requestedDiscount && <p className="text-xs text-danger-500 flex items-center space-x-1 mt-1"><AlertCircle className="w-3.5 h-3.5" /><span>{errors.requestedDiscount}</span></p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-textSecondary">Negotiation Message / Reason</label>
          <textarea rows="4" value={message} onChange={(e) => setMessage(e.target.value)} disabled={loading} placeholder="Explain why you are requesting this change..." className={`w-full bg-gray-50 border px-4 py-2.5 rounded-lg text-sm text-textPrimary placeholder-text-secondary focus:outline-none transition ${errors.message ? 'border-danger-500 focus:border-danger-500' : 'border-gray-200 focus:border-primary-500'}`} />
          {errors.message && <p className="text-xs text-danger-500 flex items-center space-x-1 mt-1"><AlertCircle className="w-3.5 h-3.5" /><span>{errors.message}</span></p>}
        </div>

        <button type="submit" disabled={loading} className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-full shadow-btn transition flex items-center justify-center space-x-2">
          {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /><span>Submitting Request...</span></>) : (<><Send className="w-4 h-4" /><span>Submit Negotiation Request</span></>)}
        </button>
      </form>
    </div>
  );
}
