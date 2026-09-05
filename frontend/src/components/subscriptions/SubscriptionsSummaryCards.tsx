import React from 'react';
import { SubscriptionSummary } from '../../types/subscription';
import { Activity, AlertCircle, PauseCircle, DollarSign } from 'lucide-react';

interface Props {
  summary: SubscriptionSummary | null;
  loading: boolean;
}

export default function SubscriptionsSummaryCards({ summary, loading }: Props) {
  const cards = [
    {
      title: 'Active Subscriptions',
      value: summary?.activeSubscriptions || 0,
      icon: Activity,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      borderColor: 'border-emerald-200'
    },
    {
      title: 'Expiring Soon',
      value: summary?.expiringSoon || 0,
      icon: AlertCircle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      borderColor: 'border-amber-200'
    },
    {
      title: 'Suspended',
      value: summary?.suspendedSubscriptions || 0,
      icon: PauseCircle,
      color: 'text-rose-600',
      bgColor: 'bg-rose-100',
      borderColor: 'border-rose-200'
    },
    {
      title: 'Monthly Recurring Revenue',
      value: summary ? `₹${summary.monthlyRecurringRevenue.toLocaleString('en-IN')}` : '₹0',
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${card.bgColor} ${card.borderColor} border`}>
              <Icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{card.title}</p>
              {loading ? (
                <div className="h-7 w-24 bg-slate-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-slate-800 mt-0.5">{card.value}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
