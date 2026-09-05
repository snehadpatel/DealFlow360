import React from 'react';
import { CreditCard, AlertCircle, CheckCircle2, Clock, Hash, Calendar } from 'lucide-react';

export default function PaymentInformation({ payment, currency = 'USD' }) {
  if (!payment) return null;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const isPending = payment.status === 'PENDING' || payment.paidAmount === 0;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PARTIALLY_PAID':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'PENDING':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <CreditCard className="w-4 h-4 text-primary" />
          <h2 className="text-base font-bold text-textPrimary tracking-tight">Payment Information</h2>
        </div>
        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(payment.status || 'PENDING')}`}>
          {(payment.status || 'PENDING').replace('_', ' ')}
        </span>
      </div>

      {/* Prominent Payment Pending Banner if not settled */}
      {isPending && (
        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start space-x-3 text-xs text-amber-900">
          <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-bold text-amber-950">Payment pending</div>
            <p className="text-amber-800/90 text-[11px] mt-0.5">
              Awaiting customer wire settlement or online clearance before contract activation.
            </p>
          </div>
        </div>
      )}

      {/* Payment Details Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <span className="text-textSecondary block text-[11px]">Payment Method</span>
          <span className="font-bold text-textPrimary text-xs mt-0.5 block">{payment.method || 'Not specified'}</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <span className="text-textSecondary block text-[11px]">Transaction ID</span>
          <span className="font-mono font-bold text-slate-700 text-xs mt-0.5 block truncate">
            {payment.transactionId || 'Pending processing'}
          </span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <span className="text-textSecondary block text-[11px]">Paid Amount</span>
          <span className="font-bold text-emerald-600 text-sm mt-0.5 block">
            {formatCurrency(payment.paidAmount)}
          </span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <span className="text-textSecondary block text-[11px]">Outstanding Amount</span>
          <span className="font-bold text-amber-600 text-sm mt-0.5 block">
            {formatCurrency(payment.outstandingAmount)}
          </span>
        </div>
      </div>

      {payment.paymentDate && (
        <div className="flex items-center space-x-2 text-xs text-textSecondary pt-1 border-t border-slate-100">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Last payment confirmed on: <strong className="text-textPrimary">{formatDate(payment.paymentDate)}</strong></span>
        </div>
      )}
    </div>
  );
}
