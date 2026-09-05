import React from 'react';

export default function QuotationSummary({ quotation }) {
  if (!quotation) return null;

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="bg-white border border-surface-border rounded-card shadow-card p-5 h-full">
      <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary border-b border-surface-border pb-3 mb-4">
        Quotation Summary
      </h3>
      
      <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm mb-6">
        <div>
          <span className="block text-xs font-medium text-text-secondary uppercase">Customer</span>
          <span className="font-bold text-text-primary">{quotation.customer_name}</span>
        </div>
        <div>
          <span className="block text-xs font-medium text-text-secondary uppercase">Sales Rep</span>
          <span className="font-bold text-text-primary">{quotation.sales_rep_name}</span>
        </div>
        <div>
          <span className="block text-xs font-medium text-text-secondary uppercase">Created Date</span>
          <span className="font-bold text-text-primary">{quotation.created_date}</span>
        </div>
        <div>
          <span className="block text-xs font-medium text-text-secondary uppercase">Valid Until</span>
          <span className="font-bold text-text-primary">{quotation.valid_until}</span>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-surface-border bg-gray-50 -mx-5 px-5 -mb-5 pb-5 rounded-b-card">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary font-medium">Subtotal</span>
          <span className="font-bold text-text-primary">{formatCurrency(quotation.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary font-medium">Discount</span>
          <span className="font-bold text-danger-500">- {formatCurrency(quotation.discount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary font-medium">Tax (18%)</span>
          <span className="font-bold text-text-primary">{formatCurrency(quotation.tax)}</span>
        </div>
        <div className="flex justify-between pt-3 border-t border-surface-border mt-3">
          <span className="text-base font-extrabold text-text-primary uppercase">Final Total</span>
          <span className="text-xl font-extrabold text-primary-500">{formatCurrency(quotation.total)}</span>
        </div>
      </div>
    </div>
  );
}
