import React from 'react';
import { DollarSign, Clock, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';

export default function BillingSummary({ billing }) {
  if (!billing) return null;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: billing.currency || 'USD',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const cards = [
    {
      id: 'total',
      label: 'Total Amount',
      amount: formatCurrency(billing.totalAmount),
      subtext: 'Combined order billing balance',
      icon: DollarSign,
      iconColor: 'text-primary',
      bgColor: 'bg-primary-light/50',
      badge: 'Contract Total',
      badgeColor: 'bg-slate-100 text-slate-700'
    },
    {
      id: 'onetime',
      label: 'One-Time Charges',
      amount: formatCurrency(billing.oneTimeCharges),
      subtext: 'Hardware & installation lines',
      icon: CreditCard,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      badge: 'Upfront',
      badgeColor: 'bg-blue-50 text-blue-700 border border-blue-200'
    },
    {
      id: 'recurring',
      label: 'Recurring Charges',
      amount: formatCurrency(billing.recurringCharges),
      subtext: 'Annual / monthly subscription plans',
      icon: Clock,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      badge: 'Recurring',
      badgeColor: 'bg-purple-50 text-purple-700 border border-purple-200'
    },
    {
      id: 'paid',
      label: 'Amount Paid',
      amount: formatCurrency(billing.amountPaid),
      subtext: 'Settled funds received',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      badge: billing.amountPaid > 0 ? 'Verified' : 'Unpaid',
      badgeColor: billing.amountPaid > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
    },
    {
      id: 'outstanding',
      label: 'Outstanding Amount',
      amount: formatCurrency(billing.outstandingAmount),
      subtext: 'Remaining balance due',
      icon: AlertCircle,
      iconColor: billing.outstandingAmount > 0 ? 'text-amber-600' : 'text-emerald-600',
      bgColor: billing.outstandingAmount > 0 ? 'bg-amber-50' : 'bg-emerald-50',
      badge: billing.outstandingAmount > 0 ? 'Pending Settlement' : 'Fully Settled',
      badgeColor: billing.outstandingAmount > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`p-2.5 rounded-xl ${card.bgColor}`}>
                <IconComponent className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>

            <div className="mt-2">
              <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">
                {card.label}
              </span>
              <div className="text-2xl font-bold text-textPrimary tracking-tight mt-0.5">
                {card.amount}
              </div>
              <p className="text-[11px] text-textSecondary mt-1 leading-snug">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
