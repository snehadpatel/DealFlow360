import React, { useState, useEffect } from 'react';
import { getQuotationById, acceptQuotation } from '../../api/quotationApi';
import { submitNegotiation, acceptCounterOffer, continueNegotiation } from '../../api/negotiationApi';
import StatusBadge from './StatusBadge';
import QuotationItemsTable from './QuotationItemsTable';
import QuotationSummary from './QuotationSummary';
import NegotiationForm from './NegotiationForm';
import NegotiationStatus from './NegotiationStatus';
import NegotiationTimeline from './NegotiationTimeline';
import CounterOfferCard from './CounterOfferCard';
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function QuotationDetail({ quotationId, onBack }) {
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successBanner, setSuccessBanner] = useState(null);
  const [showNegotiationForm, setShowNegotiationForm] = useState(false);

  const fetchQuoteDetail = async () => {
    setLoading(true); setError(null);
    try {
      const res = await getQuotationById(quotationId);
      setQuotation(res);
      if (res.status === 'SENT' || res.status === 'DRAFT' || res.status === 'REJECTED') setShowNegotiationForm(true);
    } catch (err) { setError(err.message || 'Unable to load quotation details.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (quotationId) fetchQuoteDetail(); }, [quotationId]);

  const handleNegotiationSubmit = async (formData) => {
    setActionLoading(true); setSuccessBanner(null);
    try {
      const response = await submitNegotiation({ quotation_id: quotation.id, ...formData });
      setSuccessBanner(response.message || 'Negotiation request submitted successfully.');
      setShowNegotiationForm(false);
      await fetchQuoteDetail();
    } catch (err) { alert(err.message || 'Failed to submit negotiation request.'); }
    finally { setActionLoading(false); }
  };

  const handleAcceptCounterOffer = async () => {
    setActionLoading(true);
    try { await acceptCounterOffer(quotation.id); setSuccessBanner('Counter offer accepted! Quotation updated.'); await fetchQuoteDetail(); }
    catch (err) { alert(err.message || 'Failed to accept counter offer.'); }
    finally { setActionLoading(false); }
  };

  const handleContinueNegotiation = async () => {
    setActionLoading(true);
    try { await continueNegotiation(quotation.id); setShowNegotiationForm(true); await fetchQuoteDetail(); }
    catch (err) { alert(err.message || 'Failed to continue negotiation.'); }
    finally { setActionLoading(false); }
  };

  const handleAcceptQuotation = async () => {
    setActionLoading(true);
    try { await acceptQuotation(quotation.id); setSuccessBanner('Quotation accepted successfully! Invoice will be generated.'); await fetchQuoteDetail(); }
    catch (err) { alert(err.message || 'Failed to accept quotation.'); }
    finally { setActionLoading(false); }
  };

  if (loading) return <div className="space-y-6 animate-pulse max-w-5xl mx-auto"><div className="h-6 bg-gray-200 rounded w-24" /><div className="h-28 bg-white border border-surface-border rounded-card" /><div className="h-64 bg-white border border-surface-border rounded-card" /></div>;

  if (error || !quotation) return (
    <div className="max-w-4xl mx-auto space-y-4">
      <button onClick={onBack} className="inline-flex items-center space-x-2 text-xs font-semibold text-text-secondary hover:text-text-primary"><ArrowLeft className="w-4 h-4" /><span>Back to Quotations</span></button>
      <div className="bg-danger-50 border border-danger-100 p-6 rounded-card text-center space-y-4"><p className="text-danger-500 font-medium">{error || 'Quotation not found.'}</p><button onClick={fetchQuoteDetail} className="px-4 py-2 bg-danger-500 text-white text-xs font-semibold rounded-btn hover:bg-danger-600">Retry</button></div>
    </div>
  );

  const { negotiation } = quotation;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <button onClick={onBack} className="inline-flex items-center space-x-2 px-3 py-1.5 bg-white hover:bg-gray-50 border border-surface-border text-text-secondary rounded-btn text-xs font-semibold transition"><ArrowLeft className="w-4 h-4" /><span>Back to Quotations List</span></button>

      {successBanner && (
        <div className="bg-success-50 border border-success-100 text-success-700 p-4 rounded-card shadow-card flex items-center justify-between text-sm">
          <div className="flex items-center space-x-3"><CheckCircle2 className="w-5 h-5 text-success-500" /><span className="font-semibold">{successBanner}</span></div>
          <button onClick={() => setSuccessBanner(null)} className="text-xs text-success-600 hover:text-success-700 font-bold">Dismiss</button>
        </div>
      )}

      <div className="bg-white border border-surface-border rounded-card p-6 shadow-card space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-4">
          <div>
            <div className="flex items-center space-x-3"><h1 className="text-2xl font-extrabold text-text-primary">Quotation {quotation.id}</h1><StatusBadge status={quotation.status} /></div>
            <p className="text-sm font-semibold text-text-secondary mt-1">{quotation.customer}</p>
          </div>
          {quotation.status === 'CONFIRMED' && <div className="flex items-center space-x-2 bg-success-50 border border-success-100 text-success-700 px-4 py-2 rounded-btn text-xs font-bold"><ShieldCheck className="w-4 h-4" /><span>Quotation Confirmed & Finalized</span></div>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          {[{ label: 'Quotation ID', val: quotation.id, bold: true }, { label: 'Created Date', val: quotation.createdDate }, { label: 'Valid Until', val: quotation.validUntil }, { label: 'Sales Representative', val: quotation.salesRep }].map((d, i) => (
            <div key={i} className="bg-gray-50 p-3 rounded-btn border border-surface-border"><span className="text-text-secondary font-medium">{d.label}</span><div className={`mt-0.5 ${d.bold ? 'font-bold text-text-primary text-sm' : 'font-semibold text-text-primary'}`}>{d.val}</div></div>
          ))}
        </div>
      </div>

      <QuotationItemsTable items={quotation.items} />
      <QuotationSummary subtotal={quotation.subtotal} totalDiscount={quotation.totalDiscount} taxTotal={quotation.taxTotal} totalAmount={quotation.totalAmount} discountPercent={quotation.discountPercent} />

      {negotiation && negotiation.status === 'COUNTER_OFFER' && <CounterOfferCard counterOffer={negotiation.counterOffer} onAccept={handleAcceptCounterOffer} onContinue={handleContinueNegotiation} loading={actionLoading} />}
      {negotiation && negotiation.status !== 'COUNTER_OFFER' && <NegotiationStatus negotiation={negotiation} status={negotiation.status} onAcceptQuotation={handleAcceptQuotation} onRequestNewNegotiation={() => setShowNegotiationForm(true)} loading={actionLoading} />}
      {(showNegotiationForm || (!negotiation && quotation.status !== 'CONFIRMED')) && <NegotiationForm currentDiscount={quotation.discountPercent} currentTotal={quotation.totalAmount} onSubmit={handleNegotiationSubmit} loading={actionLoading} />}
      <NegotiationTimeline history={negotiation?.history || []} />
    </div>
  );
}
