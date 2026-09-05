import React from 'react';
import InvoiceStatusBadge from './InvoiceStatusBadge';
import { Eye, Download, Send, ExternalLink, FileText, User } from 'lucide-react';

export default function InvoiceTable({
  invoices,
  onViewInvoice,
  onDownloadInvoice,
  onSendInvoice,
  onViewCustomer,
  onViewQuotation,
  userRole,
}) {
  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);

  if (!invoices || invoices.length === 0) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center shadow-xs">
        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#1F2937]">No Invoices Found</h3>
        <p className="text-xs text-[#6B7280] max-w-sm mx-auto mt-1">
          No invoice records match your current search and filter criteria. Try adjusting filters or refreshing.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F4F5F7] text-[#6B7280] font-bold uppercase tracking-wider border-b border-[#E5E7EB]">
            <tr>
              <th className="py-3.5 px-4">Invoice #</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Quotation</th>
              <th className="py-3.5 px-4">Invoice Date</th>
              <th className="py-3.5 px-4">Due Date</th>
              <th className="py-3.5 px-4 text-right">Amount</th>
              <th className="py-3.5 px-4 text-right">Paid</th>
              <th className="py-3.5 px-4 text-right">Outstanding</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]/70">
            {invoices.map((inv) => {
              const amount = inv.totals?.grandTotal ?? 0;
              const paidAmount = inv.totals?.amountPaid ?? 0;
              const outstanding = inv.totals?.outstanding ?? 0;

              return (
                <tr
                  key={inv.id}
                  className="hover:bg-[#FEECE8]/20 transition-colors group cursor-pointer"
                  onClick={() => onViewInvoice(inv.id)}
                >
                  {/* Invoice Number */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-[#1F2937] group-hover:text-[#F26C4F] transition">
                      {inv.invoiceNumber || inv.id}
                    </span>
                    {inv.billingId && (
                      <div className="text-[10px] text-[#6B7280] font-mono">
                        {inv.billingId}
                      </div>
                    )}
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#1F2937]">
                      {inv.customer?.name || 'Customer Account'}
                    </div>
                    <div className="text-[10px] text-[#6B7280]">
                      {inv.customer?.email}
                    </div>
                  </td>

                  {/* Quotation Ref */}
                  <td className="py-3.5 px-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewQuotation(inv.quotationId);
                      }}
                      className="inline-flex items-center space-x-1 font-semibold text-[#F26C4F] hover:underline"
                    >
                      <span>{inv.quotationId}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </td>

                  {/* Invoice Date */}
                  <td className="py-3.5 px-4 text-[#6B7280] whitespace-nowrap">
                    {inv.invoiceDate}
                  </td>

                  {/* Due Date */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={
                        inv.status === 'OVERDUE'
                          ? 'text-rose-600 font-bold'
                          : 'text-[#6B7280]'
                      }
                    >
                      {inv.dueDate}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 text-right font-bold text-[#1F2937] whitespace-nowrap">
                    {formatCurrency(amount)}
                  </td>

                  {/* Paid Amount */}
                  <td className="py-3.5 px-4 text-right font-semibold text-emerald-600 whitespace-nowrap">
                    {formatCurrency(paidAmount)}
                  </td>

                  {/* Outstanding Amount */}
                  <td className="py-3.5 px-4 text-right font-bold whitespace-nowrap">
                    <span
                      className={
                        outstanding > 0 ? 'text-[#F26C4F]' : 'text-slate-400'
                      }
                    >
                      {formatCurrency(outstanding)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <InvoiceStatusBadge status={inv.status} />
                  </td>

                  {/* Actions */}
                  <td
                    className="py-3.5 px-4 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => onViewInvoice(inv.id)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#FEECE8] hover:text-[#F26C4F] text-[#6B7280] transition"
                        title="View Invoice Detail"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDownloadInvoice(inv.id)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#6B7280] transition"
                        title="Download Invoice PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {userRole !== 'CUSTOMER' && (
                        <button
                          onClick={() => onSendInvoice(inv)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-[#6B7280] transition"
                          title="Send Invoice to Customer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
