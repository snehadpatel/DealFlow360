import React, { useState, useEffect } from 'react';
import { getInvoices, downloadInvoicePdf } from '../../api/invoiceApi';
import InvoiceStatusBadge from '../invoice/InvoiceStatusBadge';
import InvoiceDetail from '../../pages/InvoiceDetail';
import { Download, Eye, FileText, ArrowLeft } from 'lucide-react';

export default function InvoicesView() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  useEffect(() => {
    getInvoices()
      .then((res) => {
        setInvoices(res?.items || (Array.isArray(res) ? res : []));
      })
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);

  if (selectedInvoiceId) {
    return (
      <InvoiceDetail
        invoiceId={selectedInvoiceId}
        onBack={() => setSelectedInvoiceId(null)}
        onViewQuotation={(qId) => alert(`Quotation Ref: ${qId}`)}
      />
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1F2937] tracking-tight">My Invoices</h1>
        <p className="text-xs text-[#6B7280] mt-1">
          View billing records, payment status, and download official PDF receipts.
        </p>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F5F7] text-[#6B7280] font-bold uppercase tracking-wider border-b border-[#E5E7EB]">
                <tr>
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Quotation Ref</th>
                  <th className="py-3.5 px-4">Invoice Date</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]/70">
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoiceId(inv.id)}
                    className="hover:bg-[#FEECE8]/20 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-bold text-[#1F2937]">
                      {inv.invoiceNumber || inv.id}
                    </td>
                    <td className="py-3.5 px-4 text-[#F26C4F] font-semibold">
                      {inv.quotationId || inv.quoteId}
                    </td>
                    <td className="py-3.5 px-4 text-[#6B7280]">{inv.invoiceDate || inv.date}</td>
                    <td className="py-3.5 px-4 text-[#6B7280]">{inv.dueDate}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#1F2937]">
                      {formatCurrency(inv.totals?.grandTotal || inv.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <InvoiceStatusBadge status={inv.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setSelectedInvoiceId(inv.id)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#FEECE8] hover:text-[#F26C4F] text-[#6B7280] transition"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => downloadInvoicePdf(inv.id)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#6B7280] transition"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
