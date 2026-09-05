import React from 'react';

export default function QuotationItemsTable({ items = [] }) {
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="bg-white border border-surface-border rounded-card overflow-hidden shadow-card">
      <div className="p-4 bg-gray-50 border-b border-surface-border">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Product Line Items</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-text-secondary">
          <thead className="bg-gray-50 text-text-secondary text-xs font-bold uppercase tracking-wider border-b border-surface-border">
            <tr>
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4 text-center">Quantity</th>
              <th className="py-3 px-4 text-right">Unit Price</th>
              <th className="py-3 px-4 text-center">Discount</th>
              <th className="py-3 px-4 text-center">Tax</th>
              <th className="py-3 px-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3.5 px-4 font-bold text-text-primary">{item.product}</td>
                <td className="py-3.5 px-4 text-text-secondary text-xs max-w-xs">{item.description}</td>
                <td className="py-3.5 px-4 text-center font-semibold text-text-primary">{item.quantity}</td>
                <td className="py-3.5 px-4 text-right font-medium">{formatCurrency(item.unitPrice)}</td>
                <td className="py-3.5 px-4 text-center text-warning-600 font-medium">{item.discount}%</td>
                <td className="py-3.5 px-4 text-center text-text-secondary text-xs">{item.tax}% GST</td>
                <td className="py-3.5 px-4 text-right font-bold text-primary-500">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
