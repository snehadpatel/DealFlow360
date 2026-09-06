import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getInvoices, getInvoiceSummary, downloadInvoicePdf, sendInvoice } from '../api/invoiceApi';
import InvoiceSummaryCards from '../components/invoice/InvoiceSummaryCards';
import InvoiceFilters from '../components/invoice/InvoiceFilters';
import InvoiceTable from '../components/invoice/InvoiceTable';
import InvoiceMobileCard from '../components/invoice/InvoiceMobileCard';
import InvoiceDetail from './InvoiceDetail';
import SendInvoiceModal from '../components/invoice/SendInvoiceModal';
import {
  RefreshCw,
  Download,
  FileText,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  X,
  Lock,
} from 'lucide-react';

export default function InvoicesScreen({ initialInvoiceId, onNavigateToQuotation, onNavigateToBilling }) {
  const { user } = useAuth();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(initialInvoiceId || null);
  const [summary, setSummary] = useState(null);
  const [invoicesResponse, setInvoicesResponse] = useState({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [sendModalState, setSendModalState] = useState({ isOpen: false, invoice: null });

  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL',
    date: 'ALL',
    dueDate: 'ALL',
    page: 1,
    pageSize: 10,
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [summaryRes, listRes] = await Promise.all([
        getInvoiceSummary(),
        getInvoices({ ...filters, userRole: user?.role }),
      ]);
      setSummary(summaryRes);
      setInvoicesResponse(listRes);
    } catch (err) {
      setError('Unable to load invoice records. Please check connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'ALL',
      date: 'ALL',
      dueDate: 'ALL',
      page: 1,
      pageSize: 10,
    });
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleExport = () => {
    const rows = invoicesResponse.items || [];
    if (!rows.length) {
      showToast('No invoices to export', 'error');
      return;
    }
    const headers = ['Invoice #', 'Customer', 'Status', 'Amount', 'Outstanding', 'Due Date'];
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = rows.map((inv) =>
      [
        inv.invoiceNumber || inv.invoice_number || inv.id,
        inv.customerName || inv.customer_name || inv.customer?.name || '',
        inv.status,
        inv.totals?.grandTotal ?? inv.amount ?? '',
        inv.totals?.outstanding ?? inv.outstanding_amount ?? '',
        inv.dueDate || inv.due_date || '',
      ]
        .map(esc)
        .join(',')
    );
    const csv = [headers.map(esc).join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exported ${rows.length} invoice(s) to CSV`);
  };

  const handleDownload = async (invoiceId) => {
    try {
      await downloadInvoicePdf(invoiceId);
      showToast(`Invoice ${invoiceId} downloaded successfully.`);
    } catch {
      showToast(`Failed to download invoice ${invoiceId}`, 'error');
    }
  };

  const handleSendInvoice = (invoice) => {
    setSendModalState({ isOpen: true, invoice });
  };

  const handleConfirmSend = async (payload) => {
    if (!sendModalState.invoice) return;
    try {
      await sendInvoice(sendModalState.invoice.id, payload);
      showToast(`Invoice ${sendModalState.invoice.id} sent successfully to ${payload.email}`);
      fetchData(true);
    } catch {
      showToast(`Failed to send invoice`, 'error');
    }
  };

  // If viewing single invoice detail
  if (selectedInvoiceId) {
    return (
      <InvoiceDetail
        invoiceId={selectedInvoiceId}
        onBack={() => {
          // Re-fetch the list + KPI summary so a payment/send just recorded in
          // the detail view is reflected on the invoices list without a manual
          // refresh (mirrors ApprovalScreen's back handler).
          setSelectedInvoiceId(null);
          fetchData(true);
        }}
        onViewQuotation={onNavigateToQuotation || ((qId) => alert(`Navigating to Quotation ${qId}`))}
        onViewBilling={onNavigateToBilling || (() => alert('Navigating to Billing Schedule'))}
      />
    );
  }

  const totalPages = Math.ceil(invoicesResponse.total / filters.pageSize) || 1;
  const startCount = (filters.page - 1) * filters.pageSize + 1;
  const endCount = Math.min(filters.page * filters.pageSize, invoicesResponse.total);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Toast notification */}
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

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1F2937] tracking-tight">Invoices</h1>
          <p className="text-xs text-[#6B7280] mt-1">
            Manage customer invoices, payment status and outstanding balances.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-[#E5E7EB] text-[#1F2937] rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50"
            title="Refresh invoices"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#F26C4F]' : 'text-[#6B7280]'}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={handleExport}
            disabled={!invoicesResponse.items?.length}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-[#E5E7EB] text-[#1F2937] rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <InvoiceSummaryCards summary={summary} loading={loading} />

      {/* Filter Bar */}
      <InvoiceFilters
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center space-y-3">
          <div className="flex items-center justify-center space-x-2 text-rose-700 font-semibold text-xs">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchData()}
            className="px-4 py-2 bg-[#F26C4F] hover:bg-[#E0583B] text-white text-xs font-semibold rounded-xl transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !error && (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-white border border-[#E5E7EB] rounded-2xl" />
          ))}
        </div>
      )}

      {/* Main Table and Mobile Cards */}
      {!loading && !error && (
        <>
          {/* Desktop & Tablet Table */}
          <div className="hidden md:block">
            <InvoiceTable
              invoices={invoicesResponse.items}
              onViewInvoice={(id) => setSelectedInvoiceId(id)}
              onDownloadInvoice={handleDownload}
              onSendInvoice={handleSendInvoice}
              onViewCustomer={(cust) => showToast(`Viewing customer ${cust?.name}`)}
              onViewQuotation={onNavigateToQuotation || ((qId) => showToast(`Quotation ${qId}`))}
              userRole={user?.role}
            />
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {invoicesResponse.items.length === 0 ? (
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center text-xs text-[#6B7280]">
                No invoices match the specified criteria.
              </div>
            ) : (
              invoicesResponse.items.map((inv) => (
                <InvoiceMobileCard
                  key={inv.id}
                  invoice={inv}
                  onViewInvoice={(id) => setSelectedInvoiceId(id)}
                  onDownloadInvoice={handleDownload}
                  onSendInvoice={handleSendInvoice}
                  onViewQuotation={onNavigateToQuotation || ((qId) => showToast(`Quotation ${qId}`))}
                  userRole={user?.role}
                />
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {invoicesResponse.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-[#6B7280]">
              <div>
                Showing <span className="font-bold text-[#1F2937]">{startCount}</span> to{' '}
                <span className="font-bold text-[#1F2937]">{endCount}</span> of{' '}
                <span className="font-bold text-[#1F2937]">{invoicesResponse.total}</span> invoices
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page <= 1}
                  className="p-2 bg-white border border-[#E5E7EB] rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <span className="px-3 py-1 bg-white border border-[#E5E7EB] rounded-xl font-semibold text-[#1F2937]">
                  Page {filters.page} of {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page >= totalPages}
                  className="p-2 bg-white border border-[#E5E7EB] rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="Next Page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Send Invoice Modal */}
      <SendInvoiceModal
        isOpen={sendModalState.isOpen}
        invoice={sendModalState.invoice}
        onClose={() => setSendModalState({ isOpen: false, invoice: null })}
        onConfirm={handleConfirmSend}
      />
    </div>
  );
}
