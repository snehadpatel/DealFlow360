import React from 'react';
import InvoiceStatusBadge from './InvoiceStatusBadge';
import { Eye, Download, Send, ExternalLink, ArrowRight } from 'lucide-react';

export default function InvoiceMobileCard({
  invoice,
  onViewInvoice,
  onDownloadInvoice,
  onSendInvoice,
  onViewQuotation,
  userRole,
}) {
  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);

  const amount = invoice.totals?.grandTotal ?? 0;
  const paid = invoice.totals?.amountPaid ?? 0;
  const outstanding = invoice.totals?.outstanding ?? 0;

  return (
    <div
      onClick={() => onViewInvoice(invoice.id)}
      className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs hover:border-[#F26C4F]/50 transition-all space-y-3 cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="font-bold text-[#1F2937] text-sm">
            {invoice.invoiceNumber || invoice.id}
          </span>
          <div className="text-[10px] text-[#6B7280]">
            Due: <span className={invoice.status === 'OVERDUE' ? 'text-rose-600 font-bold' : ''}>{invoice.dueDate}</span>
          </div>
        </div>
        <InvoiceStatusBadge status={invoice.status} size="small" />
      </div>

      <div className="pt-2 border-t border-[#E5E7EB]/60 grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-[10px] text-[#6B7280] uppercase tracking-wider block">Customer</span>
          <span className="font-semibold text-[#1F2937] truncate block">
            {invoice.customer?.name}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-[#6B7280] uppercase tracking-wider block">Total Amount</span>
          <span className="font-bold text-[#1F2937] block">
            {formatCurrency(amount)}
          </span>
        </div>
      </div>

      <div className="bg-[#F4F5F7] p-2.5 rounded-xl flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] text-[#6B7280] block">Paid / Outstanding</span>
          <div className="flex items-center space-x-2 font-medium">
            <span className="text-emerald-600">{formatCurrency(paid)}</span>
            <span className="text-slate-300">/</span>
            <span className={outstanding > 0 ? 'text-[#F26C4F] font-bold' : 'text-slate-500'}>
              {formatCurrency(outstanding)}
            </span>
          </div>
        </div>
        {invoice.quotationId && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewQuotation(invoice.quotationId);
            }}
            className="text-[11px] font-semibold text-[#F26C4F] inline-flex items-center space-x-1"
          >
            <span>Quote {invoice.quotationId}</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]/60" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onDownloadInvoice(invoice.id)}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#6B7280] transition"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          {userRole !== 'CUSTOMER' && (
            <button
              onClick={() => onSendInvoice(invoice)}
              className="p-2 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-[#6B7280] transition"
              title="Send to Customer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => onViewInvoice(invoice.id)}
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-[#FEECE8] hover:bg-[#F26C4F] text-[#F26C4F] hover:text-white rounded-xl text-xs font-semibold transition"
        >
          <span>View Details</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
