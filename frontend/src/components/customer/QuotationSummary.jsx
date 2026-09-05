import React from 'react';

export default function QuotationSummary({ subtotal, totalDiscount, taxTotal, totalAmount, discountPercent }) {
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="bg-white border border-surface-border rounded-card p-6 shadow-card max-w-sm ml-auto space-y-3">
      <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider border-b border-surface-border pb-2">Financial Summary</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-text-secondary">
          <span>Subtotal</span>
          <span className="font-semibold text-text-primary">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-warning-600">
          <span>Total Discount ({discountPercent}%)</span>
          <span className="font-semibold">- {formatCurrency(totalDiscount)}</span>
        </div>
        <div className="flex justify-between text-text-secondary">
          <span>Estimated Tax (18% GST)</span>
          <span className="font-semibold text-text-primary">{formatCurrency(taxTotal)}</span>
        </div>
        <div className="border-t border-surface-border pt-3 flex justify-between items-baseline">
          <span className="text-base font-bold text-text-primary">Final Total</span>
          <span className="text-2xl font-extrabold text-primary-500 tracking-tight">{formatCurrency(totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}
