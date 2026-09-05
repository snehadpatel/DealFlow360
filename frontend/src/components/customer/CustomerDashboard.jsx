import React, { useEffect, useState } from 'react';
import { getCustomerDashboard } from '../../api/customerApi';
import StatusBadge from './StatusBadge';
import { FileText, Clock, CheckCircle2, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';

export default function CustomerDashboard({ onSelectQuotation, onViewAllQuotations }) {
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
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
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
      <div className="bg-danger-50 border border-danger-100 p-6 rounded-2xl text-center space-y-4">
        <div className="text-danger-500 font-medium">{error}</div>
        <button
          onClick={fetchDashboard}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-danger-500 hover:bg-danger-600 text-white rounded-lg text-sm font-semibold transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const { summary, recentQuotations } = data;

  const cardItems = [
    {
      title: 'Active Quotations',
      count: summary?.activeQuotations ?? 4,
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 border-blue-100',
    },
    {
      title: 'Pending Negotiations',
      count: summary?.pendingNegotiations ?? 2,
      icon: Clock,
      color: 'text-warning-500',
      bgColor: 'bg-warning-50 border-warning-100',
    },
    {
      title: 'Approved Quotations',
      count: summary?.approvedQuotations ?? 7,
      icon: CheckCircle2,
      color: 'text-success-500',
      bgColor: 'bg-success-50 border-success-100',
    },
    {
      title: 'Outstanding Invoices',
      count: summary?.outstandingInvoices ?? 3,
      icon: AlertCircle,
      color: 'text-danger-500',
      bgColor: 'bg-danger-50 border-danger-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner — warm gradient matching the Revalo design system */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 text-white p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 blur-xl" />
        <div className="relative z-10">
          <span className="inline-block text-[11px] uppercase font-bold tracking-widest text-brand-100 bg-white/15 px-3 py-1 rounded-full mb-3">
            Customer Dashboard
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-1 tracking-tight">Acme Corporation Portal</h1>
          <p className="text-sm text-brand-100 mt-2 max-w-md leading-relaxed">
            Review assigned quotations, track discount negotiation statuses, and view invoice records.
          </p>
        </div>
        <button
          onClick={onViewAllQuotations}
          className="relative z-10 inline-flex items-center space-x-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-brand-600 rounded-full text-sm font-bold shadow-lg transition duration-150 self-start md:self-auto"
        >
          <span>View All Quotations</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardItems.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-md flex items-center justify-between transition-all duration-200 hover:shadow-md-hover hover:-translate-y-0.5 group"
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

      {/* Recent Quotations Section */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
        <div className="p-6 flex items-center justify-between border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-textPrimary">Recent Quotations</h2>
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
            <table className="w-full text-left text-sm text-textSecondary">
              <thead className="bg-gray-50 text-textSecondary text-[11px] font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Quote ID</th>
                  <th className="py-3 px-4">Sales Representative</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {recentQuotations.map((quote) => (
                  <tr
                    key={quote.id}
                    className="hover:bg-brand-50/40 transition-colors cursor-pointer"
                    onClick={() => onSelectQuotation(quote.id)}
                  >
                    <td className="py-3.5 px-4 font-bold text-textPrimary leading-none">{quote.id}</td>
                    <td className="py-3.5 px-4 text-textSecondary">{quote.salesRep}</td>
                    <td className="py-3.5 px-4 text-textSecondary text-xs">{quote.createdDate}</td>
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
                        className="px-3 py-1.5 bg-white border border-gray-200 hover:border-brand-300 hover:text-brand-600 text-textSecondary rounded-lg text-xs font-bold transition shadow-sm"
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
          <div className="text-center py-12 text-textSecondary text-sm">No recent quotations found.</div>
        )}
      </div>
    </div>
  );
}
