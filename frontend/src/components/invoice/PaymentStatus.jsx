import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, CreditCard, ShieldCheck } from 'lucide-react';

export default function PaymentStatus({ status, statusMessage, dueDate, outstanding }) {
  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);

  const statusConfigs = {
    PAID: {
      title: 'PAID',
      subtitle: 'Payment completed successfully.',
      desc: 'All invoice amounts have been settled in full. A verified zero-balance receipt is on file.',
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      badgeBg: 'bg-emerald-600 text-white',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
    },
    PENDING: {
      title: 'PENDING',
      subtitle: 'Payment is awaiting completion.',
      desc: `Invoice has been dispatched to the customer. Settlement is expected by ${dueDate || 'due date'}.`,
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      badgeBg: 'bg-amber-500 text-white',
      icon: Clock,
      iconColor: 'text-amber-600',
    },
    PARTIALLY_PAID: {
      title: 'PARTIALLY PAID',
      subtitle: 'Partial payment received.',
      desc: `A milestone or deposit payment was recorded. Remaining balance of ${formatCurrency(outstanding)} is outstanding.`,
      bg: 'bg-purple-50 border-purple-200 text-purple-900',
      badgeBg: 'bg-purple-600 text-white',
      icon: CreditCard,
      iconColor: 'text-purple-600',
    },
    OVERDUE: {
      title: 'OVERDUE',
      subtitle: 'Payment deadline has passed.',
      desc: `The payment due date of ${dueDate} has elapsed with an outstanding balance of ${formatCurrency(outstanding)}. Escalation notice recommended.`,
      bg: 'bg-rose-50 border-rose-200 text-rose-900',
      badgeBg: 'bg-rose-600 text-white',
      icon: AlertTriangle,
      iconColor: 'text-rose-600',
    },
    DRAFT: {
      title: 'DRAFT',
      subtitle: 'Draft invoice in preparation.',
      desc: 'This invoice is currently in draft status and has not yet been issued to the client.',
      bg: 'bg-slate-50 border-slate-200 text-slate-800',
      badgeBg: 'bg-slate-700 text-white',
      icon: Clock,
      iconColor: 'text-slate-600',
    },
    SENT: {
      title: 'SENT',
      subtitle: 'Dispatched to customer billing contact.',
      desc: `Electronic invoice transmitted via email. Awaiting customer confirmation and payment schedule.`,
      bg: 'bg-blue-50 border-blue-200 text-blue-900',
      badgeBg: 'bg-blue-600 text-white',
      icon: Clock,
      iconColor: 'text-blue-600',
    },
    CANCELLED: {
      title: 'CANCELLED',
      subtitle: 'Invoice cancelled or voided.',
      desc: 'This invoice has been voided per sales operations protocol.',
      bg: 'bg-gray-100 border-gray-200 text-gray-800',
      badgeBg: 'bg-gray-600 text-white',
      icon: XCircle,
      iconColor: 'text-gray-500',
    },
  };

  const current = statusConfigs[status] || statusConfigs.PENDING;
  const Icon = current.icon;

  return (
    <div className={`border rounded-2xl p-5 shadow-xs ${current.bg} space-y-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className={`p-2 bg-white/80 rounded-xl ${current.iconColor} shadow-2xs`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm tracking-wide">
                {current.title}
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${current.badgeBg}`}>
                Status
              </span>
            </div>
            <p className="text-xs font-medium opacity-90">
              {statusMessage || current.subtitle}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-1 text-[11px] font-semibold opacity-80">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Payment Gateway Verified</span>
        </div>
      </div>

      <p className="text-xs leading-relaxed opacity-95 pt-1 border-t border-current/10">
        {current.desc}
      </p>
    </div>
  );
}
