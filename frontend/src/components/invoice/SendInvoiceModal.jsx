import React, { useState } from 'react';
import { X, Send, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SendInvoiceModal({ isOpen, onClose, onConfirm, invoice }) {
  const [recipientEmail, setRecipientEmail] = useState(invoice?.customer?.email || '');
  const [message, setMessage] = useState(
    `Dear ${invoice?.customer?.name || 'Customer'},\n\nPlease find attached Invoice #${invoice?.invoiceNumber || invoice?.id} for quotation ${invoice?.quotationId || ''}.\n\nTotal Due: ₹${(invoice?.totals?.grandTotal || 0).toLocaleString('en-IN')}\nPayment Due Date: ${invoice?.dueDate || ''}\n\nThank you for choosing DealFlow360.`
  );
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipientEmail || !recipientEmail.includes('@')) {
      setError('Please provide a valid recipient email address.');
      return;
    }

    setSending(true);
    setError(null);
    try {
      await onConfirm({ email: recipientEmail, message });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to dispatch invoice.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E5E7EB] space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-[#FEECE8] text-[#F26C4F]">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1F2937]">Send Invoice</h3>
              <p className="text-xs text-[#6B7280]">
                Dispatch Invoice #{invoice?.invoiceNumber || invoice?.id} electronically
              </p>
            </div>
          </div>
          <button
            aria-label="Close modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6B7280] hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label htmlFor="invoice-recipient-email" className="block font-semibold text-[#1F2937] mb-1">
              Recipient Email Address <span className="text-[#F26C4F]">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="invoice-recipient-email"
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#F4F5F7] border border-transparent focus:border-[#F26C4F] focus:bg-white rounded-xl text-xs text-[#1F2937] font-medium outline-hidden"
                placeholder="customer.billing@company.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="invoice-cover-note" className="block font-semibold text-[#1F2937] mb-1">
              Email Cover Note
            </label>
            <textarea
              id="invoice-cover-note"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 bg-[#F4F5F7] border border-transparent focus:border-[#F26C4F] focus:bg-white rounded-xl text-xs text-[#1F2937] leading-relaxed outline-hidden resize-none"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-[11px] text-[#6B7280] space-y-1">
            <div className="flex justify-between">
              <span>Attached PDF:</span>
              <span className="font-semibold text-[#1F2937]">
                {invoice?.invoiceNumber || invoice?.id}.pdf
              </span>
            </div>
            <div className="flex justify-between">
              <span>Payment Due Date:</span>
              <span className="font-semibold text-[#1F2937]">{invoice?.dueDate}</span>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#1F2937] rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#F26C4F] hover:bg-[#E0583B] text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'Sending...' : 'Send Invoice'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
