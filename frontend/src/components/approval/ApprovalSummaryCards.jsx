import React from 'react';
import { Clock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export default function ApprovalSummaryCards({ summary = {}, loading = false }) {
  if (loading) return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">{[1, 2, 3, 4].map((i) => (<div key={i} className="h-24 bg-white border border-gray-200 rounded-2xl p-4" />))}</div>;

  const cards = [
    { title: 'Pending Approvals', count: summary.pending ?? 0, icon: Clock, color: 'text-warning-500', bgColor: 'bg-warning-50 border-warning-100' },
    { title: 'High Risk', count: summary.high_risk ?? 0, icon: AlertTriangle, color: 'text-danger-500', bgColor: 'bg-danger-50 border-danger-100' },
    { title: 'Approved Today', count: summary.approved_today ?? 0, icon: CheckCircle2, color: 'text-success-500', bgColor: 'bg-success-50 border-success-100' },
    { title: 'Rejected Today', count: summary.rejected_today ?? 0, icon: XCircle, color: 'text-gray-500', bgColor: 'bg-gray-100 border-gray-200' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => { const Icon = card.icon; return (
        <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-md flex items-center justify-between transition hover:shadow-md-hover">
          <div><div className="text-xs font-medium text-textSecondary">{card.title}</div><div className="text-3xl font-extrabold text-textPrimary mt-1.5">{card.count}</div></div>
          <div className={`p-3 rounded-2xl border ${card.bgColor} ${card.color}`}><Icon className="w-6 h-6" /></div>
        </div>
      ); })}
    </div>
  );
}
