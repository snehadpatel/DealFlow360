import React, { useState, useEffect } from 'react';
import { getMyQuotations } from '../../api/salesApi';
import { Search, Plus } from 'lucide-react';
import StatusBadge from '../customer/StatusBadge'; // Reuse customer badge as it has same styles

export default function MyQuotations({ onNewQuote }) {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const res = await getMyQuotations({ search: searchTerm, status: activeFilter });
      setQuotations(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [searchTerm, activeFilter]);

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const filterTabs = [
    { id: 'ALL', label: 'All' },
    { id: 'DRAFT', label: 'Draft' },
    { id: 'PENDING', label: 'Pending Approval' },
    { id: 'APPROVED', label: 'Approved' },
    { id: 'NEGOTIATION', label: 'Negotiation' },
    { id: 'CONFIRMED', label: 'Confirmed' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">My Quotations</h1>
          <p className="text-sm text-text-secondary mt-1">Manage and track the status of your sales quotes.</p>
        </div>
        <button
          onClick={onNewQuote}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-pill text-sm font-semibold shadow-btn transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Quote</span>
        </button>
      </div>

      <div className="bg-white border border-surface-border p-4 rounded-card space-y-4 shadow-card">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-text-secondary" />
            <input 
              type="text" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="Search Quote ID or Customer..." 
              className="w-full bg-gray-50 border border-surface-border rounded-btn pl-9 pr-4 py-2 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary-500 transition" 
            />
          </div>
          <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 bg-gray-100 p-1 rounded-pill">
            {filterTabs.map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => setActiveFilter(tab.id)} 
                className={`px-3 py-1.5 text-xs font-semibold rounded-pill whitespace-nowrap transition-all ${
                  activeFilter === tab.id ? 'bg-primary-500 text-white shadow-btn' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-surface-border rounded-card shadow-card overflow-hidden">
        {loading ? (
          <div className="space-y-4 p-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (<div key={i} className="h-12 bg-gray-50 rounded-btn" />))}
          </div>
        ) : quotations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-secondary">
              <thead className="bg-gray-50 text-text-secondary text-xs font-bold uppercase tracking-wider border-b border-surface-border">
                <tr>
                  <th className="py-3.5 px-4">Quote ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Discount</th>
                  <th className="py-3.5 px-4 text-center">Margin</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {quotations.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-bold text-text-primary">{quote.id}</td>
                    <td className="py-4 px-4 font-semibold text-text-primary">{quote.customer}</td>
                    <td className="py-4 px-4 text-right font-bold text-primary-500">{formatCurrency(quote.amount)}</td>
                    <td className="py-4 px-4 text-center font-bold text-warning-600">{quote.discount}%</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`font-bold ${quote.margin >= 20 ? 'text-success-600' : quote.margin >= 15 ? 'text-warning-600' : 'text-danger-600'}`}>
                        {quote.margin}%
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={quote.status} />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-text-primary rounded-btn text-xs font-medium transition">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-12 text-text-secondary text-sm">
            No quotations found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
