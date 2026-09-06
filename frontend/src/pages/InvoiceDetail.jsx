import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getInvoiceById,
  downloadInvoicePdf,
  sendInvoice,
  recordInvoicePayment,
} from '../api/invoiceApi';
import InvoiceHeader from '../components/invoice/InvoiceHeader';
import CustomerInformation from '../components/invoice/CustomerInformation';
import InvoiceInformation from '../components/invoice/InvoiceInformation';
import InvoiceItems from '../components/invoice/InvoiceItems';
import InvoiceTotals from '../components/invoice/InvoiceTotals';
import PaymentStatus from '../components/invoice/PaymentStatus';
import PaymentHistory from '../components/invoice/PaymentHistory';
import InvoiceTimeline from '../components/invoice/InvoiceTimeline';
import SendInvoiceModal from '../components/invoice/SendInvoiceModal';
import { AlertCircle, CheckCircle2, X, ArrowLeft } from 'lucide-react';

export default function InvoiceDetail({
  invoiceId,
  onBack,
  onViewQuotation,
  onViewBilling,
}) {
  const { user } = useAuth();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchInvoice = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await getInvoiceById(invoiceId);
      setInvoice(data);
    } catch (err) {
      setError(err.message || `Unable to load details for invoice ${invoiceId}.`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const handleDownload = async () => {
    try {
      await downloadInvoicePdf(invoiceId);
      showToast(`Invoice ${invoiceId} downloaded successfully.`);
    } catch {
      showToast(`Failed to download invoice ${invoiceId}`, 'error');
    }
  };

  const handleRecordPayment = async () => {
    const amountToPay = invoice.totals?.outstanding > 0 ? invoice.totals.outstanding : invoice.totals?.grandTotal || 1000;
    try {
      await recordInvoicePayment(invoiceId, {
        amount: amountToPay,
        method: 'ONLINE',
        notes: 'Full settlement recorded via operations platform',
      });
      showToast(`Payment of ₹${amountToPay.toLocaleString('en-IN')} recorded successfully.`);
      fetchInvoice(true);
    } catch (err) {
      showToast(err.message || 'Failed to record payment', 'error');
    }
  };

  const handleConfirmSend = async (payload) => {
    try {
      await sendInvoice(invoiceId, payload);
      showToast(`Invoice dispatched successfully to ${payload.email}`);
      fetchInvoice(true);
    } catch {
      showToast(`Failed to send invoice`, 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-pulse font-sans">
        <div className="h-20 bg-white border border-[#E5E7EB] rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-white border border-[#E5E7EB] rounded-2xl" />
          <div className="h-48 bg-white border border-[#E5E7EB] rounded-2xl" />
        </div>
        <div className="h-64 bg-white border border-[#E5E7EB] rounded-2xl" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4 font-sans">
        <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 inline-flex items-center space-x-2 text-xs font-semibold">
          <AlertCircle className="w-4 h-4" />
          <span>{error || 'Invoice not found'}</span>
        </div>
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#1F2937] rounded-xl text-xs font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Invoices List</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold animate-slide-up ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Screen 8 Header */}
      <InvoiceHeader
        invoice={invoice}
        onBack={onBack}
        onDownload={handleDownload}
        onSend={() => setIsSendModalOpen(true)}
        onRecordPayment={handleRecordPayment}
        onViewBilling={onViewBilling}
        onViewQuotation={onViewQuotation}
        onRefresh={() => fetchInvoice(true)}
        refreshing={refreshing}
        userRole={user?.role}
      />

      {/* Payment Status Banner */}
      <PaymentStatus
        status={invoice.status}
        statusMessage={invoice.statusMessage}
        dueDate={invoice.dueDate}
        outstanding={invoice.totals?.outstanding}
      />

      {/* Customer & Invoice Meta Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomerInformation customer={invoice.customer} />
        <InvoiceInformation invoice={invoice} />
      </div>

      {/* Line Items Table */}
      <InvoiceItems items={invoice.items} />

      {/* Totals & Timeline Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InvoiceTotals totals={invoice.totals} currency={invoice.currency} />
        <InvoiceTimeline timeline={invoice.timeline} />
      </div>

      {/* Payment History */}
      <PaymentHistory payments={invoice.payments} />

      {/* Send Invoice Modal */}
      <SendInvoiceModal
        isOpen={isSendModalOpen}
        invoice={invoice}
        onClose={() => setIsSendModalOpen(false)}
        onConfirm={handleConfirmSend}
      />
    </div>
  );
}
