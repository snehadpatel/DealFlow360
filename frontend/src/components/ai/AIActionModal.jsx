import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Edit3,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import apiClient from '../../api/client';

/* ───────────────────────── REQUEST APPROVAL ───────────────────────── */
function RequestApprovalContent({ dealId, onSuccess, onError }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      await apiClient.post(`/quotes/${dealId}/submit`, { reason: reason.trim() });
      setDone(true);
      onSuccess?.('Quote submitted for manager approval.');
    } catch (err) {
      console.error(err);
      onError?.('Failed to submit for approval. This quote may already be submitted or approved.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-3 text-center">
        <div className="p-3 bg-emerald-50 rounded-full">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h4 className="text-sm font-bold text-[#1F2937]">Approval Requested!</h4>
        <p className="text-xs text-[#6B7280] max-w-xs">
          This quotation has been submitted for manager approval. You'll be notified once it's reviewed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-[#6B7280] leading-relaxed">
        Submit this deal's quotation for manager approval. The manager will review the pricing,
        discount levels, and risk factors before approving or returning it.
      </p>

      <div>
        <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">
          Reason / Notes for Approver
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="e.g. Customer requested 15% volume discount on a 3-year contract..."
          className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-xl bg-[#F4F5F7] focus:ring-2 focus:ring-[#F26C4F]/30 focus:border-[#F26C4F] outline-none transition resize-none"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!reason.trim() || submitting}
        className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#F26C4F] hover:bg-[#E0583B] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition shadow-sm"
      >
        {submitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ShieldCheck className="w-4 h-4" />
        )}
        <span>{submitting ? 'Submitting...' : 'Submit for Approval'}</span>
      </button>
    </div>
  );
}

/* ──────────────────────── REVIEW DISCOUNT ─────────────────────────── */
function ReviewDiscountContent({ dealId, onSuccess, onError }) {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newDiscount, setNewDiscount] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiClient.get(`/quotes/${dealId}`);
        setQuote(data);
        setNewDiscount(String(data.discount_percent ?? data.discount ?? 0));
      } catch {
        onError?.('Failed to load deal details.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dealId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put(`/quotes/${dealId}`, {
        discount_percent: parseFloat(newDiscount) || 0,
      });
      setDone(true);
      onSuccess?.('Discount updated successfully.');
    } catch (err) {
      console.error(err);
      onError?.('Failed to update discount.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 text-[#F26C4F] animate-spin" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-3 text-center">
        <div className="p-3 bg-emerald-50 rounded-full">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h4 className="text-sm font-bold text-[#1F2937]">Discount Updated!</h4>
        <p className="text-xs text-[#6B7280] max-w-xs">
          The discount has been adjusted to <strong>{newDiscount}%</strong>. The risk score will recalculate on refresh.
        </p>
      </div>
    );
  }

  const currentDiscount = quote?.discount_percent ?? quote?.discount ?? 0;

  return (
    <div className="space-y-4">
      <p className="text-xs text-[#6B7280] leading-relaxed">
        Review and adjust the discount level for this deal. High discounts increase the blended risk score
        and may trigger automatic escalation to management.
      </p>

      {/* Current Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-[#F4F5F7] rounded-xl">
          <div className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">Current Discount</div>
          <div className="text-lg font-bold text-[#1F2937] mt-0.5">{currentDiscount}%</div>
        </div>
        <div className="p-3 bg-[#F4F5F7] rounded-xl">
          <div className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">Deal Total</div>
          <div className="text-lg font-bold text-[#1F2937] mt-0.5">
            ₹{(quote?.total ?? 0).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">
          New Discount (%)
        </label>
        <input
          type="number"
          min="0"
          max="100"
          step="0.5"
          value={newDiscount}
          onChange={(e) => setNewDiscount(e.target.value)}
          className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-xl bg-[#F4F5F7] focus:ring-2 focus:ring-[#F26C4F]/30 focus:border-[#F26C4F] outline-none transition"
        />
        {parseFloat(newDiscount) > 20 && (
          <p className="text-[10px] text-amber-600 font-semibold mt-1 flex items-center space-x-1">
            <AlertCircle className="w-3 h-3" />
            <span>Discounts above 20% require manager approval.</span>
          </p>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#F26C4F] hover:bg-[#E0583B] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition shadow-sm"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Edit3 className="w-4 h-4" />
        )}
        <span>{saving ? 'Saving...' : 'Update Discount'}</span>
      </button>
    </div>
  );
}

/* ─────────────────────── CONTACT CUSTOMER ─────────────────────────── */
function ContactCustomerContent({ dealId, onSuccess, onError }) {
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('Regarding Your Quotation');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      // Try posting as a negotiation message tied to the deal
      await apiClient.post(`/negotiations`, {
        quotation_id: dealId,
        message: `[${subject}] ${message.trim()}`,
        proposed_discount: null,
      });
      setDone(true);
      onSuccess?.('Message sent to customer through the negotiation channel.');
    } catch (err) {
      console.error(err);
      onError?.('Failed to send message. The deal may not have an active negotiation channel.');
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-3 text-center">
        <div className="p-3 bg-emerald-50 rounded-full">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h4 className="text-sm font-bold text-[#1F2937]">Message Sent!</h4>
        <p className="text-xs text-[#6B7280] max-w-xs">
          Your message has been sent to the customer through the deal's negotiation channel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-[#6B7280] leading-relaxed">
        Send a message to the customer regarding this deal. The message will appear in the
        deal's negotiation thread and the customer will be notified.
      </p>

      <div>
        <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-xl bg-[#F4F5F7] focus:ring-2 focus:ring-[#F26C4F]/30 focus:border-[#F26C4F] outline-none transition"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="e.g. We'd like to discuss the pricing structure for your upcoming renewal..."
          className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-xl bg-[#F4F5F7] focus:ring-2 focus:ring-[#F26C4F]/30 focus:border-[#F26C4F] outline-none transition resize-none"
        />
      </div>

      <button
        onClick={handleSend}
        disabled={!message.trim() || sending}
        className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#F26C4F] hover:bg-[#E0583B] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition shadow-sm"
      >
        {sending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        <span>{sending ? 'Sending...' : 'Send Message'}</span>
      </button>
    </div>
  );
}

/* ────────────────────── MAIN MODAL WRAPPER ─────────────────────────── */
const ACTION_CONFIG = {
  REQUEST_APPROVAL: {
    title: 'Request Approval',
    icon: ShieldCheck,
    color: 'text-[#F26C4F]',
    bg: 'bg-[#FEECE8]',
    Component: RequestApprovalContent,
  },
  REVIEW_DISCOUNT: {
    title: 'Review Discount',
    icon: Edit3,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    Component: ReviewDiscountContent,
  },
  CONTACT_CUSTOMER: {
    title: 'Contact Customer',
    icon: MessageSquare,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    Component: ContactCustomerContent,
  },
};

export default function AIActionModal({ isOpen, onClose, actionType, dealId }) {
  const [toast, setToast] = useState(null);

  if (!isOpen || !actionType || !ACTION_CONFIG[actionType]) return null;

  const config = ACTION_CONFIG[actionType];
  const Icon = config.icon;
  const ContentComponent = config.Component;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    if (type === 'success') {
      setTimeout(() => {
        setToast(null);
        onClose();
      }, 2000);
    } else {
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB]">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl ${config.bg}`}>
              <Icon className={`w-4 h-4 ${config.color}`} />
            </div>
            <h3 className="text-sm font-bold text-[#1F2937]">{config.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-[#6B7280] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <ContentComponent
            dealId={dealId}
            onSuccess={(msg) => showToast(msg, 'success')}
            onError={(msg) => showToast(msg, 'error')}
          />
        </div>

        {/* Toast */}
        {toast && (
          <div
            className={`mx-5 mb-4 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            )}
            <span>{toast.msg}</span>
          </div>
        )}
      </div>
    </div>
  );
}
