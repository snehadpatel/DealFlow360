import React, { useState, useEffect } from 'react';
import { getInvoices } from '../../api/customerApi';
import StatusBadge from './StatusBadge';
import { Download } from 'lucide-react';

export default function InvoicesView() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getInvoices().then(setInvoices).finally(() => setLoading(false)); }, []);
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-extrabold text-text-primary">Invoices</h1><p className="text-xs text-text-secondary mt-1">View billing records, invoice status, and download PDF receipts.</p></div>
      <div className="bg-white border border-surface-border rounded-card p-6 shadow-card">
        {loading ? (<div className="space-y-3 animate-pulse">{[1, 2].map((i) => (<div key={i} className="h-16 bg-gray-50 rounded-btn" />))}</div>) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-secondary">
              <thead className="bg-gray-50 text-text-secondary text-xs font-bold uppercase tracking-wider border-b border-surface-border">
                <tr><th className="py-3 px-4">Invoice ID</th><th className="py-3 px-4">Quotation Ref</th><th className="py-3 px-4">Invoice Date</th><th className="py-3 px-4">Due Date</th><th className="py-3 px-4">Amount</th><th className="py-3 px-4">Status</th><th className="py-3 px-4 text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-text-primary">{inv.id}</td>
                    <td className="py-3.5 px-4 text-primary-500 font-semibold">{inv.quoteId}</td>
                    <td className="py-3.5 px-4 text-xs">{inv.date}</td>
                    <td className="py-3.5 px-4 text-xs">{inv.dueDate}</td>
                    <td className="py-3.5 px-4 font-bold text-text-primary">{formatCurrency(inv.amount)}</td>
                    <td className="py-3.5 px-4"><StatusBadge status={inv.status} /></td>
                    <td className="py-3.5 px-4 text-right"><button onClick={() => alert(`Downloading PDF for invoice ${inv.id}`)} className="p-2 bg-gray-100 hover:bg-gray-200 text-text-secondary rounded-btn text-xs font-medium transition inline-flex items-center space-x-1" title="Download Invoice PDF"><Download className="w-3.5 h-3.5" /><span className="hidden sm:inline">PDF</span></button></td>
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
