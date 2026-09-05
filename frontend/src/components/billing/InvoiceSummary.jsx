import React from 'react';
import { FileCheck, Download, Send, ExternalLink, Calendar, AlertCircle } from 'lucide-react';

export default function InvoiceSummary({ invoice, currency = 'USD', onDownload, onOpenSendModal }) {
  if (!invoice) return null;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PARTIALLY_PAID':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'PENDING':
      case 'SENT':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'OVERDUE':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <FileCheck className="w-4 h-4 text-primary" />
          <h2 className="text-base font-bold text-textPrimary tracking-tight">Invoice Status</h2>
        </div>
        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(invoice.status || 'PENDING')}`}>
          {(invoice.status || 'PENDING').replace('_', ' ')}
        </span>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] text-textSecondary font-semibold uppercase tracking-wider block">
            Tax Invoice Number
          </span>
          <div className="text-xl font-bold font-mono text-textPrimary mt-0.5">
            {invoice.invoiceNumber}
          </div>
          <div className="flex items-center space-x-3 text-xs text-textSecondary mt-1">
            <span>Issued: <strong className="text-textPrimary">{formatDate(invoice.invoiceDate)}</strong></span>
            <span>•</span>
            <span>Due: <strong className="text-rose-600 font-semibold">{formatDate(invoice.dueDate)}</strong></span>
          </div>
        </div>

        <div className="sm:text-right">
          <span className="text-[11px] text-textSecondary font-semibold uppercase tracking-wider block">
            Billed Total
          </span>
          <div className="text-2xl font-bold text-primary mt-0.5">
            {formatCurrency(invoice.invoiceAmount)}
          </div>
        </div>
      </div>

      {/* Invoice Actions per Screen 6 specs */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          onClick={onDownload}
          className="flex-1 py-2 px-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-textPrimary text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-textSecondary" />
          <span>Download Invoice</span>
        </button>

        <button
          onClick={onOpenSendModal}
          className="flex-1 py-2 px-3 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send to Customer</span>
        </button>
      </div>
    </div>
  );
}
