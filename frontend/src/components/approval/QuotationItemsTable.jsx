import React from 'react';

const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const formatCurrency = (val) => currencyFormatter.format(val || 0);

export default function QuotationItemsTable({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase tracking-wider text-textSecondary">Quotation Items</h3>
        <span className="text-xs font-bold bg-white border border-gray-200 px-2 py-0.5 rounded-full text-textSecondary">
          {items.length} items
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-white text-textSecondary text-xs font-bold uppercase tracking-wider border-b border-gray-200">
            <tr>
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-center">Qty</th>
              <th className="py-3 px-4 text-right">Unit Price</th>
              <th className="py-3 px-4 text-center text-gray-400">Orig. Disc</th>
              <th className="py-3 px-4 text-center text-brand-600">Req. Disc</th>
              <th className="py-3 px-4 text-right">Final Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-bold text-textPrimary">{item.name}</td>
                <td className="py-3 px-4 text-textSecondary font-medium">{item.category}</td>
                <td className="py-3 px-4 text-center font-bold text-textPrimary">{item.qty}</td>
                <td className="py-3 px-4 text-right font-medium text-textSecondary">{formatCurrency(item.unit_price)}</td>
                <td className="py-3 px-4 text-center font-medium text-gray-400">{item.original_discount}%</td>
                <td className="py-3 px-4 text-center font-bold text-brand-500 bg-brand-50/30">{item.requested_discount}%</td>
                <td className="py-3 px-4 text-right font-extrabold text-textPrimary">{formatCurrency(item.final_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
