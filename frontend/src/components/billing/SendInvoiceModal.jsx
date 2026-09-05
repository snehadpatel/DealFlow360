import React, { useState } from 'react';
import { X, Send, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SendInvoiceModal({ isOpen, onClose, onSend, defaultEmail, invoiceNumber }) {
  const [email, setEmail] = useState(defaultEmail || '');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid recipient email address');
      return;
    }

    setSending(true);
    setError(null);
    try {
      await onSend(email);
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to dispatch invoice');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-card w-full max-w-md p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-primary-light text-primary">
              <Mail className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-textPrimary">Send Tax Invoice</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {sentSuccess ? (
          <div className="text-center py-6 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
            <div className="font-bold text-textPrimary">Invoice Dispatched!</div>
            <p className="text-xs text-textSecondary">
              Tax invoice {invoiceNumber} was successfully transmitted to {email}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <p className="text-textSecondary leading-relaxed">
              Dispatch an official PDF copy of invoice <strong>{invoiceNumber}</strong> with Net payment instructions to the customer accounts team.
            </p>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="font-semibold text-textPrimary block mb-1.5">Recipient Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="accounts@customer.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs"
                required
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={sending}
                className="px-4 py-2 rounded-full border border-slate-200 text-textSecondary hover:bg-slate-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="px-5 py-2 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sending ? 'Sending…' : 'Send Invoice'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
