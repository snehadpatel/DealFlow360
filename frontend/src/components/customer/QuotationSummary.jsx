import React from 'react';

export default function QuotationSummary({ subtotal, totalDiscount, taxTotal, totalAmount, discountPercent }) {
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md max-w-sm ml-auto space-y-3">
      <h4 className="text-xs font-bold text-textSecondary uppercase tracking-wider border-b border-gray-200 pb-2">Financial Summary</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-textSecondary">
          <span>Subtotal</span>
          <span className="font-semibold text-textPrimary">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-warning-600">
          <span>Total Discount ({discountPercent}%)</span>
          <span className="font-semibold">- {formatCurrency(totalDiscount)}</span>
        </div>
        <div className="flex justify-between text-textSecondary">
          <span>Estimated Tax (18% GST)</span>
          <span className="font-semibold text-textPrimary">{formatCurrency(taxTotal)}</span>
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between items-baseline">
          <span className="text-base font-bold text-textPrimary">Final Total</span>
          <span className="text-2xl font-extrabold text-brand-500 tracking-tight">{formatCurrency(totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}
