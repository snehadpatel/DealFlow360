import React, { useState, useEffect } from 'react';
import { getSubscriptions, pauseSubscription, resumeSubscription, cancelSubscription } from '../../api/customerApi';
import StatusBadge from './StatusBadge';
import { 
  CreditCard, 
  Search, 
  PauseCircle, 
  PlayCircle, 
  XCircle, 
  Calendar, 
  RefreshCw, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function SubscriptionsView() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(false);
  const [successBanner, setSuccessBanner] = useState(null);

  const fetchSubscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSubscriptions();
      setSubscriptions(data);
    } catch (err) {
      setError('Unable to load subscriptions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handlePause = async (id) => {
    setActionLoading(true);
    try {
      await pauseSubscription(id);
      setSuccessBanner('Subscription paused successfully.');
      await fetchSubscriptions();
    } catch (err) {
      alert('Failed to pause subscription: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async (id) => {
    setActionLoading(true);
    try {
      await resumeSubscription(id);
      setSuccessBanner('Subscription resumed successfully.');
      await fetchSubscriptions();
    } catch (err) {
      alert('Failed to resume subscription: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this recurring subscription plan?')) return;
    setActionLoading(true);
    try {
      await cancelSubscription(id);
      setSuccessBanner('Subscription cancelled.');
      await fetchSubscriptions();
    } catch (err) {
      alert('Failed to cancel subscription: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);

  const filterTabs = [
    { id: 'ALL', label: 'All Plans' },
    { id: 'ACTIVE', label: 'Active' },
    { id: 'PAUSED', label: 'Paused' },
    { id: 'CANCELLED', label: 'Cancelled' },
  ];

  const filtered = subscriptions.filter((sub) => {
    const matchesSearch =
      (sub.planName && sub.planName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sub.id && sub.id.toLowerCase().includes(searchTerm.toLowerCase()));

    if (activeFilter === 'ALL') return matchesSearch;
    return matchesSearch && sub.status === activeFilter;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-textPrimary tracking-tight">Active Subscriptions</h1>
          <p className="text-xs text-textSecondary mt-1">
            Manage recurring SaaS licenses, usage seats, and renewal schedules.
          </p>
        </div>
        <button
          onClick={fetchSubscriptions}
          className="self-start sm:self-auto inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-textSecondary transition shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {successBanner && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-2xl shadow-sm flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-700 hover:text-emerald-900">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white border border-gray-200 p-4 rounded-2xl space-y-4 shadow-md">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-textSecondary" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search plan or subscription ID..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-textPrimary placeholder-text-secondary focus:outline-none focus:border-brand-500 transition"
            />
          </div>
          <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 bg-gray-100 p-1 rounded-full">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
                  activeFilter === tab.id
                    ? 'bg-brand-500 text-white shadow-btn'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-white border border-gray-200 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((sub) => (
            <div
              key={sub.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md space-y-4 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-[#FEECE8] text-[#F26C4F] rounded-xl border border-[#F26C4F]/20">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-textPrimary">{sub.planName}</h3>
                    <span className="text-[11px] font-semibold text-textSecondary">
                      {sub.id ? `SUB-${sub.id.slice(0, 8).toUpperCase()}` : 'SUB-AUTO'}
                    </span>
                  </div>
                </div>
                <StatusBadge status={sub.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs">
                <div>
                  <span className="text-textSecondary font-medium">Billing Cycle</span>
                  <div className="font-bold text-textPrimary mt-0.5">{sub.billingCycle}</div>
                </div>
                <div>
                  <span className="text-textSecondary font-medium">Next Renewal</span>
                  <div className="font-bold text-textPrimary mt-0.5">{sub.nextRenewal || 'Auto-renewal active'}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <div>
                  <span className="text-[11px] text-textSecondary font-semibold uppercase tracking-wider">Recurring Amount</span>
                  <div className="text-xl font-extrabold text-brand-500">{formatCurrency(sub.amount)}</div>
                </div>

                <div className="flex items-center space-x-1.5">
                  {sub.status === 'ACTIVE' && (
                    <button
                      onClick={() => handlePause(sub.id)}
                      disabled={actionLoading}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold transition"
                      title="Pause recurring billing"
                    >
                      <PauseCircle className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </button>
                  )}

                  {sub.status === 'PAUSED' && (
                    <button
                      onClick={() => handleResume(sub.id)}
                      disabled={actionLoading}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition"
                      title="Resume subscription"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Resume</span>
                    </button>
                  )}

                  {sub.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleCancel(sub.id)}
                      disabled={actionLoading}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-gray-50 hover:bg-rose-50 text-textSecondary hover:text-rose-600 border border-gray-200 hover:border-rose-200 rounded-lg text-xs font-semibold transition"
                      title="Cancel plan"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-3 shadow-md">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-textPrimary">No subscriptions found</h3>
          <p className="text-xs text-textSecondary">No subscription plans match your search or filter.</p>
        </div>
      )}
    </div>
  );
}
