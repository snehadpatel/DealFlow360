import React from 'react';

export default function QuotationItemsTable({ items }) {
  if (!items || items.length === 0) return null;

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="bg-white border border-surface-border rounded-card shadow-card overflow-hidden">
      <div className="p-4 border-b border-surface-border bg-gray-50 flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">Quotation Items</h3>
        <span className="text-xs font-bold bg-white border border-surface-border px-2 py-0.5 rounded-pill text-text-secondary">
          {items.length} items
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-white text-text-secondary text-xs font-bold uppercase tracking-wider border-b border-surface-border">
            <tr>
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-center">Qty</th>
              <th className="py-3 px-4 text-right">Unit Price</th>
              <th className="py-3 px-4 text-center text-gray-400">Orig. Disc</th>
              <th className="py-3 px-4 text-center text-primary-600">Req. Disc</th>
              <th className="py-3 px-4 text-right">Final Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-bold text-text-primary">{item.name}</td>
                <td className="py-3 px-4 text-text-secondary font-medium">{item.category}</td>
                <td className="py-3 px-4 text-center font-bold text-text-primary">{item.qty}</td>
                <td className="py-3 px-4 text-right font-medium text-text-secondary">{formatCurrency(item.unit_price)}</td>
                <td className="py-3 px-4 text-center font-medium text-gray-400">{item.original_discount}%</td>
                <td className="py-3 px-4 text-center font-bold text-primary-500 bg-primary-50/30">{item.requested_discount}%</td>
                <td className="py-3 px-4 text-right font-extrabold text-text-primary">{formatCurrency(item.final_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
