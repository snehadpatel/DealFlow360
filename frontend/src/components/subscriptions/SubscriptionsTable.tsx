import React from 'react';
import { Subscription } from '../../types/subscription';
import { Eye, Clock, CreditCard } from 'lucide-react';

interface Props {
  subscriptions: Subscription[];
  loading: boolean;
  onView: (id: string) => void;
}

export default function SubscriptionsTable({ subscriptions, loading, onView }: Props) {
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      TRIAL: 'bg-blue-100 text-blue-800 border-blue-200',
      PAUSED: 'bg-amber-100 text-amber-800 border-amber-200',
      SUSPENDED: 'bg-rose-100 text-rose-800 border-rose-200',
      CANCELLED: 'bg-slate-100 text-slate-800 border-slate-200',
      EXPIRED: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    const style = styles[status] || 'bg-slate-100 text-slate-800';
    return (
      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${style}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-64 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500">
        <CreditCard className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <h3 className="text-lg font-medium text-slate-900">No Subscriptions Found</h3>
        <p className="mt-1">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto min-h-[400px]">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Subscription</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Plan / Product</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cycle</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Next Billing</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {subscriptions.map((sub) => (
            <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <span className="font-semibold font-mono text-primary-700">
                    {sub.id.startsWith('SUB-') ? sub.id : `SUB-${sub.id.replace(/-/g, '').slice(0, 6).toUpperCase()}`}
                  </span>
                  <span className="text-sm font-medium text-slate-800">{sub.customerName}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-semibold text-slate-900">{sub.planName}</div>
                <div className="text-xs text-slate-500">Qty: {sub.quantity} | {sub.quotationId ? (sub.quotationId.startsWith('Q-') ? sub.quotationId : `Q-${sub.quotationId.replace(/-/g, '').slice(0, 6).toUpperCase()}`) : 'Enterprise SLA'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                ₹{sub.recurringAmount.toLocaleString('en-IN')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                {sub.billingCycle}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm text-slate-600">
                  <Clock className="w-4 h-4 mr-1.5 text-slate-400" />
                  {formatDate(sub.nextBillingDate)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(sub.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onView(sub.id)}
                  className="inline-flex items-center space-x-1 text-primary-600 hover:text-primary-800 transition-colors bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
