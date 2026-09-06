import React, { useState, useEffect } from 'react';
import { getInvoices, downloadInvoicePdf } from '../../api/invoiceApi';
import InvoiceStatusBadge from '../invoice/InvoiceStatusBadge';
import InvoiceDetail from '../../pages/InvoiceDetail';
import { Download, Eye, FileText, ArrowLeft } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const formatCurrency = (val) => currencyFormatter.format(val || 0);

export default function InvoicesView() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  const fetchInvoices = () => {
    setLoading(true);
    getInvoices()
      .then((res) => {
        setInvoices(res?.items || (Array.isArray(res) ? res : []));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  if (selectedInvoiceId) {
    return (
      <InvoiceDetail
        invoiceId={selectedInvoiceId}
        onBack={() => {
          setSelectedInvoiceId(null);
          fetchInvoices();
        }}
        // Customers view quotations from the Quotations tab; from an invoice we
        // don't deep-link, so this is a no-op rather than a jarring alert popup.
        onViewQuotation={() => {}}
      />
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-textPrimary tracking-tight">My Invoices</h1>
        <p className="text-xs text-textSecondary mt-1">
          View billing records, payment status, and download official PDF receipts.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
        {loading ? (
          <div className="space-y-3 animate-pulse p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-textSecondary font-bold uppercase tracking-wider text-[11px] border-b border-gray-200">
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
              <tbody className="divide-y divide-surface-border">
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoiceId(inv.id)}
                    className="hover:bg-brand-50/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-bold text-textPrimary">
                      {inv.invoiceNumber || inv.id}
                    </td>
                    <td className="py-3.5 px-4 text-brand-600 font-semibold">
                      {inv.quotationId || inv.quoteId}
                    </td>
                    <td className="py-3.5 px-4 text-textSecondary">{inv.invoiceDate || inv.date}</td>
                    <td className="py-3.5 px-4 text-textSecondary">{inv.dueDate}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-textPrimary">
                      {formatCurrency(inv.totals?.grandTotal || inv.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <InvoiceStatusBadge status={inv.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setSelectedInvoiceId(inv.id)}
                          className="p-1.5 rounded-lg bg-gray-50 border border-gray-200 hover:bg-brand-50 hover:text-brand-500 hover:border-brand-200 text-textSecondary transition"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => downloadInvoicePdf(inv.id)}
                          className="p-1.5 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 text-textSecondary transition"
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
