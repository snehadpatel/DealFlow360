import React, { useState, useEffect } from 'react';
import { getSalesDashboard } from '../../api/salesApi';
import { FileText, Clock, Trophy, Edit3, MessageSquare, Percent, ArrowRight } from 'lucide-react';

export default function SalesDashboard({ onAction }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSalesDashboard().then(setData).finally(() => setLoading(false));
  }, []);

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-surface-dark rounded-card" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-28 bg-white border border-surface-border rounded-card p-5" />)}
        </div>
      </div>
    );
  }

  const kpis = [
    { title: 'My Quotes', count: data.quotes, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50 border-blue-100', tab: 'quotations' },
    { title: 'Pending Approval', count: data.pendingApproval, icon: Clock, color: 'text-warning-500', bg: 'bg-warning-50 border-warning-100', tab: 'quotations' },
    { title: 'Won Deals (YTD)', count: formatCurrency(data.wonDeals), icon: Trophy, color: 'text-success-500', bg: 'bg-success-50 border-success-100', tab: 'pipeline' },
    { title: 'Drafts', count: data.drafts, icon: Edit3, color: 'text-gray-500', bg: 'bg-gray-100 border-gray-200', tab: 'quotations' },
    { title: 'Negotiation', count: data.negotiation, icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-50 border-purple-200', tab: 'quotations' },
    { title: 'Avg Margin', count: `${data.avgMargin}%`, icon: Percent, color: 'text-primary-500', bg: 'bg-primary-50 border-primary-200', tab: 'dashboard' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-surface-dark text-white p-6 rounded-card shadow-card flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary-500 opacity-10 rounded-full blur-3xl"></div>
        <div className="z-10">
          <h1 className="text-2xl font-extrabold">Sales Workspace</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your pipeline, create high-margin quotations, and close deals faster.</p>
        </div>
        <button
          onClick={() => onAction('builder')}
          className="z-10 inline-flex items-center space-x-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-pill text-sm font-semibold shadow-btn transition shrink-0"
        >
          <span>Create New Quotation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={i}
              onClick={() => onAction(kpi.tab)}
              className="bg-white border border-surface-border rounded-card p-5 shadow-card flex items-center justify-between transition hover:shadow-card-hover cursor-pointer"
            >
              <div>
                <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">{kpi.title}</div>
                <div className="text-3xl font-extrabold text-text-primary mt-2 leading-none">{kpi.count}</div>
              </div>
              <div className={`p-3.5 rounded-card border ${kpi.bg} ${kpi.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
