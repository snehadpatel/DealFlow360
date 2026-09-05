import React from 'react';
import { FileText, CheckCircle2, Clock, AlertTriangle, DollarSign } from 'lucide-react';

export default function InvoiceSummaryCards({ summary, loading }) {
  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-xs animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
            <div className="h-7 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Invoices',
      value: summary?.totalInvoices ?? 0,
      icon: FileText,
      color: 'text-[#1F2937]',
      bg: 'bg-slate-100',
      border: 'border-slate-200',
      badge: 'All Active',
      badgeBg: 'bg-slate-100 text-slate-700',
    },
    {
      title: 'Paid',
      value: summary?.paid ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      badge: `${summary?.totalInvoices ? Math.round(((summary?.paid || 0) / summary.totalInvoices) * 100) : 0}% settled`,
      badgeBg: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Pending',
      value: summary?.pending ?? 0,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      badge: 'Awaiting payment',
      badgeBg: 'bg-amber-50 text-amber-700',
    },
    {
      title: 'Overdue',
      value: summary?.overdue ?? 0,
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      badge: 'Action required',
      badgeBg: 'bg-rose-50 text-rose-700',
    },
    {
      title: 'Total Outstanding',
      value: formatCurrency(summary?.totalOutstanding),
      icon: DollarSign,
      color: 'text-[#F26C4F]',
      bg: 'bg-[#FEECE8]',
      border: 'border-[#F26C4F]/30',
      badge: 'Receivables',
      badgeBg: 'bg-[#FEECE8] text-[#F26C4F]',
      isAmount: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            className={`bg-white border ${c.border} p-4 rounded-2xl shadow-xs transition-all duration-150 hover:shadow-sm flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                {c.title}
              </span>
              <div className={`p-2 rounded-xl ${c.bg} ${c.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-1">
              <div className={`text-2xl font-bold tracking-tight ${c.color}`}>
                {c.value}
              </div>
              <span className={`inline-block mt-2 px-2 py-0.5 text-[10px] font-semibold rounded-full ${c.badgeBg}`}>
                {c.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
