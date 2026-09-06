import React, { useState, useEffect } from 'react';
import { getCustomerQuotations } from '../../api/customerApi';
import StatusBadge from './StatusBadge';
import { Search, FileText, ArrowRight } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const formatCurrency = (val) => currencyFormatter.format(val || 0);

export default function QuotationList({ onSelectQuotation }) {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  const fetchQuotations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCustomerQuotations();
      setQuotations(res);
    } catch (err) {
      setError('Unable to load quotations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuotations(); }, []);

  const filterTabs = [
    { id: 'ALL', label: 'All' },
    { id: 'DRAFT', label: 'Draft' },
    { id: 'SENT', label: 'Sent' },
    { id: 'NEGOTIATION', label: 'Negotiation' },
    { id: 'APPROVED', label: 'Approved' },
    { id: 'CONFIRMED', label: 'Confirmed' },
    { id: 'COMPLETED', label: 'Completed' },
  ];



  const filteredQuotations = quotations.filter((q) => {
    const matchesSearch = q.id.toLowerCase().includes(searchTerm.toLowerCase()) || q.salesRep.toLowerCase().includes(searchTerm.toLowerCase()) || q.customer.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeFilter === 'ALL') return matchesSearch;
    if (activeFilter === 'NEGOTIATION') return matchesSearch && (q.status === 'NEGOTIATION' || q.status === 'COUNTER_OFFER' || q.status === 'PENDING');
    return matchesSearch && q.status === activeFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-textPrimary">My Quotations</h1>
        <p className="text-xs text-textSecondary mt-1">View all sales quotations issued to Acme Corp and request price negotiations.</p>
      </div>

      <div className="bg-white border border-gray-200 p-4 rounded-2xl space-y-4 shadow-md">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-textSecondary" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search quotation ID or Sales Rep..." className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-textPrimary placeholder-text-secondary focus:outline-none focus:border-primary-500 transition" />
          </div>
          <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 bg-gray-100 p-1 rounded-full">
            {filterTabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveFilter(tab.id)} className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${activeFilter === tab.id ? 'bg-brand-500 text-white shadow-btn' : 'text-textSecondary hover:text-textPrimary'}`}>{tab.label}</button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (<div key={i} className="h-20 bg-white border border-gray-200 rounded-2xl" />))}
        </div>
      )}

      {error && (
        <div className="bg-danger-50 border border-danger-100 p-6 rounded-2xl text-center space-y-3">
          <p className="text-danger-500 text-sm">{error}</p>
          <button onClick={fetchQuotations} className="px-4 py-2 bg-danger-500 text-white text-xs font-semibold rounded-lg hover:bg-danger-600">Retry</button>
        </div>
      )}

      {!loading && !error && (
        <>
          {filteredQuotations.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-textSecondary">
                  <thead className="bg-gray-50 text-textSecondary text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="py-3.5 px-4">Quote ID</th>
                      <th className="py-3.5 px-4">Customer</th>
                      <th className="py-3.5 px-4">Created Date</th>
                      <th className="py-3.5 px-4">Valid Until</th>
                      <th className="py-3.5 px-4">Total Amount</th>
                      <th className="py-3.5 px-4">Discount</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {filteredQuotations.map((quote) => (
                      <tr key={quote.id} onClick={() => onSelectQuotation(quote.id)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                        <td className="py-4 px-4 font-bold text-textPrimary">{quote.id}</td>
                        <td className="py-4 px-4">{quote.customer}</td>
                        <td className="py-4 px-4 text-xs">{quote.createdDate}</td>
                        <td className="py-4 px-4 text-xs">{quote.validUntil}</td>
                        <td className="py-4 px-4 font-bold text-brand-500">{formatCurrency(quote.totalAmount)}</td>
                        <td className="py-4 px-4 font-medium">{quote.discountPercent}%</td>
                        <td className="py-4 px-4"><StatusBadge status={quote.status} /></td>
                        <td className="py-4 px-4 text-right">
                          <button onClick={(e) => { e.stopPropagation(); onSelectQuotation(quote.id); }} className="inline-flex items-center space-x-1 px-3.5 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-full text-xs font-semibold shadow-btn transition">
                            <span>View Details</span><ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-3">
              <FileText className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-base font-bold text-textPrimary">No quotations found</h3>
              <p className="text-xs text-textSecondary">No quotations match the search query or selected filter criteria.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
