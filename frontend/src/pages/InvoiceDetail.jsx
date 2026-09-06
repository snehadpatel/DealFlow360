import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('BANK_TRANSFER');
  const [paySaving, setPaySaving] = useState(false);

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
      queryClient.invalidateQueries();
      fetchInvoice(true);
    } catch (err) {
      showToast(err.message || 'Failed to record payment', 'error');
    }
  };

  const handleConfirmSend = async (payload) => {
    try {
      await sendInvoice(invoiceId, payload);
      showToast(`Invoice dispatched successfully to ${payload.email}`);
      queryClient.invalidateQueries();
      fetchInvoice(true);
    } catch {
      showToast(`Failed to send invoice`, 'error');
    }
  };

  const openPayModal = () => {
    // Default the amount to the outstanding balance for a one-click full payment.
    setPayAmount(invoice?.totals?.outstanding ? String(invoice.totals.outstanding) : '');
    setPayMethod('BANK_TRANSFER');
    setIsPayModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    const amount = Number(payAmount);
    if (!amount || amount <= 0) {
      showToast('Enter a valid payment amount', 'error');
      return;
    }
    setPaySaving(true);
    try {
      await recordInvoicePayment(invoiceId, { amount, method: payMethod });
      setIsPayModalOpen(false);
      showToast(`Payment of ₹${amount.toLocaleString('en-IN')} recorded`);
      queryClient.invalidateQueries();
      fetchInvoice(true);
    } catch {
      showToast('Failed to record payment', 'error');
    } finally {
      setPaySaving(false);
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
          <button aria-label="Close toast" onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
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
        onViewBilling={onViewBilling}
        onViewQuotation={onViewQuotation}
        onRefresh={() => fetchInvoice(true)}
        onRecordPayment={openPayModal}
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

      {/* Record Payment Modal */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setIsPayModalOpen(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-[#1F2937] font-semibold text-base">Record Payment</h2>
                <p className="text-[#6B7280] text-xs mt-0.5">
                  Invoice #{invoice.invoiceNumber || invoice.id} • Outstanding {invoice.currency || 'INR'} {Number(invoice.totals?.outstanding || 0).toLocaleString()}
                </p>
              </div>
              <button onClick={() => setIsPayModalOpen(false)} aria-label="Close dialog" className="text-[#6B7280] hover:text-[#1F2937] ml-4 flex-shrink-0 mt-0.5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#374151] mb-1">Amount *</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#374151] mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                >
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="UPI">UPI</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setIsPayModalOpen(false)} className="px-4 py-2 border border-[#E5E7EB] rounded-xl text-xs font-semibold hover:bg-[#F4F5F7]">
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={paySaving}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"
                >
                  {paySaving ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
