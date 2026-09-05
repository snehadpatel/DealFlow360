import React from 'react';
import InvoiceStatusBadge from './InvoiceStatusBadge';
import { ArrowLeft, Download, Send, ExternalLink, RefreshCw, CreditCard } from 'lucide-react';

export default function InvoiceHeader({
  invoice,
  onBack,
  onDownload,
  onSend,
  onViewBilling,
  onViewQuotation,
  onRefresh,
  refreshing,
  userRole,
}) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Back and Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-[#F4F5F7] hover:bg-slate-200 text-[#1F2937] transition"
            title="Back to Invoices list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl font-extrabold text-[#1F2937] tracking-tight">
                Invoice #{invoice.invoiceNumber || invoice.id}
              </h1>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Issued on {invoice.invoiceDate} • Due on {invoice.dueDate} • Terms: {invoice.paymentTerms}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl border border-[#E5E7EB] hover:bg-slate-50 text-[#6B7280] transition"
            title="Refresh record"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#F26C4F]' : ''}`} />
          </button>

          <button
            onClick={onDownload}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-[#E5E7EB] hover:bg-slate-50 text-[#1F2937] rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>Download Invoice</span>
          </button>

          {userRole !== 'CUSTOMER' && (
            <button
              onClick={onSend}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#F26C4F] hover:bg-[#E0583B] text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Invoice</span>
            </button>
          )}

          {invoice.quotationId && (
            <button
              onClick={() => onViewQuotation(invoice.quotationId)}
              className="inline-flex items-center space-x-1 px-3 py-2 bg-[#FEECE8] hover:bg-[#F26C4F] text-[#F26C4F] hover:text-white rounded-xl text-xs font-semibold transition"
            >
              <span>View Quotation</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}

          {invoice.billingId && (
            <button
              onClick={onViewBilling}
              className="inline-flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-[#1F2937] rounded-xl text-xs font-semibold transition"
            >
              <CreditCard className="w-3 h-3 text-[#6B7280]" />
              <span>View Billing</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
