import React, { useEffect, useState } from 'react';
import { getCustomerDashboard } from '../../api/customerApi';
import StatusBadge from './StatusBadge';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  Receipt, 
  CreditCard, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

export default function CustomerDashboard({ 
  onSelectQuotation, 
  onViewAllQuotations, 
  onNavigateTab 
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCustomerDashboard();
      setData(res);
    } catch (err) {
      setError('Unable to load customer dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse font-sans">
        <div className="h-8 bg-gray-200 rounded-lg w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white border border-gray-200 rounded-2xl p-5" />
          ))}
        </div>
        <div className="h-64 bg-white border border-gray-200 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl text-center space-y-4 font-sans">
        <div className="text-rose-600 font-medium">{error}</div>
        <button
          onClick={fetchDashboard}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-semibold transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const { summary, recentQuotations, recentInvoices, recentNegotiations } = data || {};

  const cardItems = [
    {
      title: 'Active Quotations',
      count: summary?.activeQuotations ?? 0,
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 border-blue-100',
      action: () => onNavigateTab ? onNavigateTab('quotations') : onViewAllQuotations(),
    },
    {
      title: 'Pending Negotiations',
      count: summary?.pendingNegotiations ?? 0,
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 border-amber-100',
      action: () => onNavigateTab && onNavigateTab('negotiations'),
    },
    {
      title: 'Approved Quotations',
      count: summary?.approvedQuotations ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 border-emerald-100',
      action: () => onNavigateTab ? onNavigateTab('quotations') : onViewAllQuotations(),
    },
    {
      title: 'Outstanding Invoices',
      count: summary?.outstandingInvoices ?? 0,
      icon: AlertCircle,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50 border-rose-100',
      action: () => onNavigateTab && onNavigateTab('invoices'),
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 text-white p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 blur-xl pointer-events-none" />
        <div className="relative z-10">
          <span className="inline-flex items-center space-x-1 text-[11px] uppercase font-bold tracking-widest text-brand-100 bg-white/15 px-3 py-1 rounded-full mb-3">
            <Sparkles className="w-3 h-3" />
            <span>Enterprise Customer Portal</span>
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-1 tracking-tight">Acme Corporation Buyer Hub</h1>
          <p className="text-sm text-brand-100 mt-2 max-w-md leading-relaxed">
            Review active sales quotes, converse in live negotiation threads, download official tax invoices, and manage subscriptions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 relative z-10 self-start md:self-auto">
          <button
            onClick={onViewAllQuotations}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-brand-600 rounded-full text-xs font-bold shadow-md transition"
          >
            <FileText className="w-4 h-4" />
            <span>My Quotations</span>
          </button>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('negotiations')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-700/80 hover:bg-brand-700 text-white border border-white/20 rounded-full text-xs font-bold transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Negotiations</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardItems.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={card.action}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-md flex items-center justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group"
            >
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-textSecondary">{card.title}</div>
                <div className="text-3xl font-extrabold text-textPrimary mt-2 group-hover:scale-105 transition-transform origin-left">{card.count}</div>
              </div>
              <div className={`p-3 rounded-2xl border ${card.bgColor} ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Recent Quotations & Quick Workspace Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Quotations (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
          <div className="p-5 flex items-center justify-between border-b border-gray-200">
            <div>
              <h2 className="text-base font-bold text-textPrimary">Recent Quotations</h2>
              <p className="text-xs text-textSecondary mt-0.5">Quotations pending your review or approval</p>
            </div>
            <button
              onClick={onViewAllQuotations}
              className="text-xs font-bold text-brand-500 hover:text-brand-600 transition flex items-center space-x-1 bg-brand-50 px-3 py-1.5 rounded-full border border-brand-100"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentQuotations && recentQuotations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-textSecondary">
                <thead className="bg-gray-50 text-textSecondary text-[11px] font-bold uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Quote Ref</th>
                    <th className="py-3 px-4">Sales Rep</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentQuotations.map((quote) => (
                    <tr
                      key={quote.id}
                      className="hover:bg-brand-50/40 transition-colors cursor-pointer"
                      onClick={() => onSelectQuotation(quote.id)}
                    >
                      <td className="py-3.5 px-4 font-bold text-textPrimary">
                        {quote.id ? `Q-${quote.id.slice(0, 8).toUpperCase()}` : 'Quote'}
                      </td>
                      <td className="py-3.5 px-4 text-textSecondary">{quote.salesRep}</td>
                      <td className="py-3.5 px-4 font-bold text-brand-600">
                        {formatCurrency(quote.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={quote.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectQuotation(quote.id);
                          }}
                          className="px-2.5 py-1 bg-white border border-gray-200 hover:border-brand-300 hover:text-brand-600 text-textSecondary rounded-lg text-xs font-semibold transition"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-textSecondary text-xs">No recent quotations found.</div>
          )}
        </div>

        {/* Quick Portal Navigation Cards (1 col) */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-md space-y-3">
            <h3 className="text-sm font-bold text-textPrimary">Customer Operations</h3>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => onNavigateTab && onNavigateTab('negotiations')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-brand-50 border border-gray-200 hover:border-brand-200 transition group"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-textPrimary group-hover:text-brand-600">Price Negotiations</div>
                    <div className="text-[10px] text-textSecondary">Chat with rep & counter-offers</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-textSecondary group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigateTab && onNavigateTab('invoices')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-brand-50 border border-gray-200 hover:border-brand-200 transition group"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-textPrimary group-hover:text-brand-600">My Invoices</div>
                    <div className="text-[10px] text-textSecondary">Download PDF tax receipts</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-textSecondary group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigateTab && onNavigateTab('subscriptions')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-brand-50 border border-gray-200 hover:border-brand-200 transition group"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-textPrimary group-hover:text-brand-600">Active Subscriptions</div>
                    <div className="text-[10px] text-textSecondary">Manage recurring licenses</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-textSecondary group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
