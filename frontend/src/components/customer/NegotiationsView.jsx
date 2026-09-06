import React, { useState, useEffect } from 'react';
import { getNegotiations, getNegotiationMessages, sendNegotiationMessage, acceptNegotiation } from '../../api/customerApi';
import StatusBadge from './StatusBadge';
import { 
  MessageSquare, 
  Search, 
  Send, 
  CheckCircle2, 
  Clock, 
  User, 
  ArrowRight, 
  RefreshCw, 
  X,
import {
  FileText,
  Percent,
  ShieldCheck,
  TrendingDown
} from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const formatCurrency = (val) => currencyFormatter.format(val || 0);

export default function NegotiationsView({ onSelectQuotation }) {
  const [negotiations, setNegotiations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedNegotiation, setSelectedNegotiation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [newDiscount, setNewDiscount] = useState('');
  const [sending, setSending] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchNegotiations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNegotiations();
      setNegotiations(data);
    } catch (err) {
      setError('Unable to load customer negotiations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNegotiations();
  }, []);

  const handleOpenThread = async (neg) => {
    setSelectedNegotiation(neg);
    setLoadingMessages(true);
    setActionSuccess(null);
    try {
      const msgs = await getNegotiationMessages(neg.id);
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to load thread messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedNegotiation) return;
    setSending(true);
    try {
      const disc = newDiscount ? Number(newDiscount) : null;
      await sendNegotiationMessage(selectedNegotiation.id, newMessage.trim(), disc);
      setNewMessage('');
      setNewDiscount('');
      const updatedMsgs = await getNegotiationMessages(selectedNegotiation.id);
      setMessages(updatedMsgs);
      fetchNegotiations();
    } catch (err) {
      alert('Failed to send message: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleAcceptCounter = async (negId, disc) => {
    setSending(true);
    try {
      await acceptNegotiation(negId, disc);
      setActionSuccess('Counter-offer accepted successfully! Quotation terms updated.');
      const updatedMsgs = await getNegotiationMessages(negId);
      setMessages(updatedMsgs);
      fetchNegotiations();
    } catch (err) {
      alert('Failed to accept counter-offer: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const filterTabs = [
    { id: 'ALL', label: 'All Threads' },
    { id: 'OPEN', label: 'Open' },
    { id: 'COUNTER_OFFERED', label: 'Counter Offers' },
    { id: 'ACCEPTED', label: 'Accepted' },
    { id: 'REJECTED', label: 'Rejected' },
  ];

  const filtered = negotiations.filter((n) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (n.quotationId && n.quotationId.toLowerCase().includes(term)) ||
      (n.repName && n.repName.toLowerCase().includes(term)) ||
      (n.lastMessage && n.lastMessage.toLowerCase().includes(term));

    if (activeFilter === 'ALL') return matchesSearch;
    return matchesSearch && n.status === activeFilter;
  });


  const kpis = {
    total: negotiations.length,
    open: negotiations.filter((n) => n.status === 'OPEN').length,
    counter: negotiations.filter((n) => n.status === 'COUNTER_OFFERED').length,
    accepted: negotiations.filter((n) => n.status === 'ACCEPTED').length,
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-textPrimary tracking-tight">Price Negotiations</h1>
          <p className="text-xs text-textSecondary mt-1">
            Track discount negotiation threads, converse directly with sales reps, and accept counter-offers.
          </p>
        </div>
        <button
          onClick={fetchNegotiations}
          className="self-start sm:self-auto inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-textSecondary transition shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-textSecondary">Total Threads</div>
            <div className="text-2xl font-extrabold text-textPrimary mt-1">{kpis.total}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-textSecondary">Open / Pending</div>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">{kpis.open}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-textSecondary">Counter Offers</div>
            <div className="text-2xl font-extrabold text-purple-600 mt-1">{kpis.counter}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
            <Percent className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-textSecondary">Agreed & Finalized</div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">{kpis.accepted}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-gray-200 p-4 rounded-2xl space-y-4 shadow-md">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-textSecondary" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by quote ref, sales rep, message..."
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

      {/* Table of Negotiation Threads */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
        {loading ? (
          <div className="space-y-3 animate-pulse p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-textSecondary">
              <thead className="bg-gray-50 text-textSecondary text-[11px] font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Quotation Ref</th>
                  <th className="py-3.5 px-4">Sales Representative</th>
                  <th className="py-3.5 px-4">Requested Discount</th>
                  <th className="py-3.5 px-4">Counter Discount</th>
                  <th className="py-3.5 px-4">Latest Message</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((neg) => (
                  <tr
                    key={neg.id}
                    onClick={() => handleOpenThread(neg)}
                    className="hover:bg-brand-50/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-bold text-textPrimary">
                      {neg.quotationId ? `Q-${neg.quotationId.slice(0, 8).toUpperCase()}` : 'Quotation'}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-textPrimary flex items-center space-x-1.5 pt-4">
                      <User className="w-3.5 h-3.5 text-textSecondary" />
                      <span>{neg.repName}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {neg.requestedDiscount}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {neg.counterDiscount ? (
                        <span className="font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          {neg.counterDiscount}%
                        </span>
                      ) : (
                        <span className="text-gray-400 font-medium">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-textPrimary">
                      {neg.lastMessage}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={neg.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenThread(neg)}
                          className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold shadow-btn transition inline-flex items-center space-x-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Chat</span>
                        </button>
                        {onSelectQuotation && (
                          <button
                            onClick={() => onSelectQuotation(neg.quotationId)}
                            className="px-3 py-1.5 bg-white border border-gray-200 hover:border-brand-300 hover:text-brand-600 text-textSecondary rounded-lg text-xs font-semibold transition"
                          >
                            Quote
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-textSecondary text-sm">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-bold text-textPrimary">No negotiations found</p>
            <p className="text-xs text-textSecondary mt-1">No negotiation threads match your filter criteria.</p>
          </div>
        )}
      </div>

      {/* Live Negotiation Thread Drawer / Modal */}
      {selectedNegotiation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <div className="flex items-center space-x-2.5">
                  <h3 className="text-base font-bold text-textPrimary">
                    Negotiation on Quote {selectedNegotiation.quotationId?.slice(0, 8).toUpperCase()}
                  </h3>
                  <StatusBadge status={selectedNegotiation.status} />
                </div>
                <p className="text-xs text-textSecondary mt-0.5">
                  Discussion with Representative: <span className="font-semibold text-textPrimary">{selectedNegotiation.repName}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedNegotiation(null)}
                className="p-1.5 rounded-lg text-textSecondary hover:bg-gray-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionSuccess && (
              <div className="p-3 bg-emerald-50 border-b border-emerald-100 text-emerald-700 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* Counter offer proposal banner inside chat */}
            {selectedNegotiation.status === 'COUNTER_OFFERED' && selectedNegotiation.counterDiscount && (
              <div className="p-4 bg-purple-50 border-b border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-purple-900 flex items-center space-x-1.5">
                    <TrendingDown className="w-4 h-4 text-purple-600" />
                    <span>Sales Counter-Offer: {selectedNegotiation.counterDiscount}% Discount</span>
                  </div>
                  <p className="text-purple-700 mt-0.5">
                    The sales team proposed a revised {selectedNegotiation.counterDiscount}% discount to seal the deal.
                  </p>
                </div>
                <button
                  onClick={() => handleAcceptCounter(selectedNegotiation.id, selectedNegotiation.counterDiscount)}
                  disabled={sending}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-sm transition whitespace-nowrap"
                >
                  Accept Counter-Offer
                </button>
              </div>
            )}

            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 max-h-[45vh] bg-[#F8F9FA]">
              {loadingMessages ? (
                <div className="text-center py-8 text-xs text-textSecondary">Loading conversation...</div>
              ) : messages.length > 0 ? (
                messages.map((m) => {
                  const isCust = m.sender_role === 'CUSTOMER';
                  return (
                    <div key={m.id} className={`flex ${isCust ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl p-3.5 text-xs shadow-xs space-y-1.5 ${
                          isCust
                            ? 'bg-brand-500 text-white rounded-br-none'
                            : 'bg-white border border-gray-200 text-textPrimary rounded-bl-none'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 text-[10px] font-semibold opacity-75">
                          <span>{isCust ? 'You (Buyer)' : `${selectedNegotiation.repName} (Sales Rep)`}</span>
                          <span>{m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>
                        {m.discount_proposed && (
                          <div className={`text-[10px] font-bold px-2 py-0.5 rounded inline-block ${isCust ? 'bg-white/20 text-white' : 'bg-brand-50 text-brand-600 border border-brand-200'}`}>
                            Proposed Discount: {m.discount_proposed}%
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-xs text-textSecondary">No messages in this thread yet. Send a note below.</div>
              )}
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message or negotiation note..."
                  disabled={sending}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-textPrimary focus:outline-none focus:border-brand-500 transition"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={newDiscount}
                  onChange={(e) => setNewDiscount(e.target.value)}
                  placeholder="Disc %"
                  disabled={sending}
                  className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 text-xs text-textPrimary focus:outline-none focus:border-brand-500 transition"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-200 text-white font-semibold rounded-lg text-xs shadow-btn transition flex items-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
