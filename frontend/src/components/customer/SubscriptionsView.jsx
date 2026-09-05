import React, { useState, useEffect } from 'react';
import { getSubscriptions } from '../../api/customerApi';
import StatusBadge from './StatusBadge';
import { CreditCard } from 'lucide-react';

export default function SubscriptionsView() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getSubscriptions().then(setSubscriptions).finally(() => setLoading(false)); }, []);
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-extrabold text-text-primary">Active Subscriptions</h1><p className="text-xs text-text-secondary mt-1">Manage software licenses and active recurring service plans.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subscriptions.map((sub) => (
          <div key={sub.id} className="bg-white border border-surface-border rounded-card p-6 shadow-card space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-primary-50 text-primary-500 rounded-btn border border-primary-200"><CreditCard className="w-6 h-6" /></div>
                <div><h3 className="text-base font-bold text-text-primary">{sub.planName}</h3><span className="text-xs text-text-secondary">{sub.id}</span></div>
              </div>
              <StatusBadge status={sub.status} />
            </div>
            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-btn border border-surface-border text-xs">
              <div><span className="text-text-secondary">Billing Cycle</span><div className="font-bold text-text-primary mt-0.5">{sub.billingCycle}</div></div>
              <div><span className="text-text-secondary">Next Renewal</span><div className="font-bold text-text-primary mt-0.5">{sub.nextRenewal}</div></div>
            </div>
            <div className="flex items-baseline justify-between pt-2 border-t border-surface-border">
              <span className="text-xs text-text-secondary">Recurring Price</span>
              <span className="text-xl font-extrabold text-primary-500">{formatCurrency(sub.amount)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
