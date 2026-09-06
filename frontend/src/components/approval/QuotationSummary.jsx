import React from 'react';

const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const formatCurrency = (val) => currencyFormatter.format(val || 0);

export default function QuotationSummary({ quotation }) {
  if (!quotation) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-5 h-full">
      <h3 className="text-sm font-bold uppercase tracking-wider text-textSecondary border-b border-gray-200 pb-3 mb-4">
        Quotation Summary
      </h3>
      
      <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm mb-6">
        <div>
          <span className="block text-xs font-medium text-textSecondary uppercase">Customer</span>
          <span className="font-bold text-textPrimary">{quotation.customer_name}</span>
        </div>
        <div>
          <span className="block text-xs font-medium text-textSecondary uppercase">Sales Rep</span>
          <span className="font-bold text-textPrimary">{quotation.sales_rep_name}</span>
        </div>
        <div>
          <span className="block text-xs font-medium text-textSecondary uppercase">Created Date</span>
          <span className="font-bold text-textPrimary">{quotation.created_date}</span>
        </div>
        <div>
          <span className="block text-xs font-medium text-textSecondary uppercase">Valid Until</span>
          <span className="font-bold text-textPrimary">{quotation.valid_until}</span>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-200 bg-gray-50 -mx-5 px-5 -mb-5 pb-5 rounded-b-card">
        <div className="flex justify-between text-sm">
          <span className="text-textSecondary font-medium">Subtotal</span>
          <span className="font-bold text-textPrimary">{formatCurrency(quotation.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-textSecondary font-medium">Discount</span>
          <span className="font-bold text-danger-500">- {formatCurrency(quotation.discount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-textSecondary font-medium">Tax (18%)</span>
          <span className="font-bold text-textPrimary">{formatCurrency(quotation.tax)}</span>
        </div>
        <div className="flex justify-between pt-3 border-t border-gray-200 mt-3">
          <span className="text-base font-extrabold text-textPrimary uppercase">Final Total</span>
          <span className="text-xl font-extrabold text-brand-500">{formatCurrency(quotation.total)}</span>
        </div>
      </div>
    </div>
  );
}
