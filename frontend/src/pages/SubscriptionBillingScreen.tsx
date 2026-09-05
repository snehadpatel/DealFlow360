import React, { useState, useEffect } from 'react';
import { getSubscriptions, getSubscriptionSummary } from '../api/subscriptionApi';
import { Subscription, SubscriptionSummary } from '../types/subscription';
import SubscriptionsSummaryCards from '../components/subscriptions/SubscriptionsSummaryCards';
import SubscriptionsFilters from '../components/subscriptions/SubscriptionsFilters';
import SubscriptionsTable from '../components/subscriptions/SubscriptionsTable';
import SubscriptionDetail from '../components/subscriptions/SubscriptionDetail';

export default function SubscriptionBillingScreen() {
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null);
  
  const [summary, setSummary] = useState<SubscriptionSummary | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'All', billingCycle: 'All', search: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumData, subData] = await Promise.all([
        getSubscriptionSummary(),
        getSubscriptions(filters)
      ]);
      setSummary(sumData);
      setSubscriptions(subData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedSubscriptionId) {
      loadData();
    }
  }, [filters, selectedSubscriptionId]);

  if (selectedSubscriptionId) {
    return (
      <SubscriptionDetail 
        subscriptionId={selectedSubscriptionId} 
        onBack={() => setSelectedSubscriptionId(null)} 
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center space-x-2">
            <span>Dashboard</span>
            <span>&rarr;</span>
            <span className="text-primary-600">Subscriptions</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Subscriptions</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor and manage recurring customer subscriptions.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <SubscriptionsSummaryCards summary={summary} loading={loading} />

      {/* Main Content Area */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Filters */}
        <SubscriptionsFilters 
          filters={filters} 
          onFilterChange={setFilters} 
          onRefresh={loadData}
          loading={loading}
        />

        {/* Table */}
        <SubscriptionsTable 
          subscriptions={subscriptions} 
          loading={loading} 
          onView={(id) => setSelectedSubscriptionId(id)}
        />
      </div>
    </div>
  );
}
