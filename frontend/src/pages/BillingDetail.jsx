import React, { useState, useEffect } from 'react';
import { getBillingById, sendInvoice, downloadInvoicePdf } from '../api/billingApi';
import BillingHeader from '../components/billing/BillingHeader';
import BillingSummary from '../components/billing/BillingSummary';
import BillingBreakdown from '../components/billing/BillingBreakdown';
import CustomerBillingInfo from '../components/billing/CustomerBillingInfo';
import PaymentInformation from '../components/billing/PaymentInformation';
import InvoiceSummary from '../components/billing/InvoiceSummary';
import BillingTimeline from '../components/billing/BillingTimeline';
import SendInvoiceModal from '../components/billing/SendInvoiceModal';
import { AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function BillingDetail({ billingId = 'BIL-2045', onBack }) {
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await getBillingById(billingId);
      setBilling(data);
    } catch (err) {
      setError(err.message || 'Failed to load billing information');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [billingId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleDownloadInvoice = async () => {
    try {
      showToast('Generating and downloading official PDF invoice…');
      await downloadInvoicePdf(billingId);
      setTimeout(() => {
        showToast('PDF invoice downloaded successfully!');
      }, 1000);
    } catch (err) {
      alert('Error downloading invoice: ' + err.message);
    }
  };

  const handleSendInvoice = async (email) => {
    await sendInvoice(billingId, email);
    showToast(`Invoice successfully transmitted to ${email}`);
    loadData(true);
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-pulse">
        <div className="h-6 w-48 bg-slate-200 rounded-md"></div>
        <div className="h-28 bg-white border border-slate-200 rounded-2xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 bg-white border border-slate-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-72 bg-white border border-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  if (error || !billing) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-rose-200 rounded-2xl text-center space-y-4 shadow-sm">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-textPrimary">Failed to Load Billing Record</h2>
        <p className="text-sm text-textSecondary">{error || 'Billing record could not be retrieved from the server.'}</p>
        <div className="flex items-center justify-center space-x-3 pt-2">
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-textSecondary hover:bg-slate-50"
            >
              Back to Overview
            </button>
          )}
          <button
            onClick={() => loadData()}
            className="px-5 py-2 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* Success Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center space-x-2 bg-emerald-900 text-white px-4 py-2.5 rounded-full shadow-lg border border-emerald-700 animate-in fade-in slide-in-from-top-2 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen 6: Page Header */}
      <BillingHeader
        billing={billing}
        onBack={onBack}
        onRefresh={() => loadData(true)}
        onOpenSendModal={() => setIsSendModalOpen(true)}
        onDownload={handleDownloadInvoice}
        refreshing={refreshing}
      />

      {/* Screen 6: 5 KPI Summary Cards */}
      <BillingSummary billing={billing} />

      {/* Screen 6: Billing Breakdown (One-Time Charges vs Recurring Subscriptions) */}
      <BillingBreakdown
        oneTimeItems={billing.oneTimeItems}
        recurringItems={billing.recurringItems}
        currency={billing.currency}
      />

      {/* Customer Information, Payment Information, and Invoice Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CustomerBillingInfo customer={billing.customer} />
        <PaymentInformation payment={billing.payment} currency={billing.currency} />
        <InvoiceSummary
          invoice={billing.invoice}
          currency={billing.currency}
          onDownload={handleDownloadInvoice}
          onOpenSendModal={() => setIsSendModalOpen(true)}
        />
      </div>

      {/* Screen 6: Billing Lifecycle Timeline */}
      <BillingTimeline timeline={billing.timeline} />

      {/* Send Invoice Modal */}
      <SendInvoiceModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        onSend={handleSendInvoice}
        defaultEmail={billing.customer?.email}
        invoiceNumber={billing.invoice?.invoiceNumber}
      />
    </div>
  );
}
