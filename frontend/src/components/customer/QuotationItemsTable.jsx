import React from 'react';

const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const formatCurrency = (val) => currencyFormatter.format(val || 0);

export default function QuotationItemsTable({ items = [] }) {


  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-md">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider">Product Line Items</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-textSecondary">
          <thead className="bg-gray-50 text-textSecondary text-xs font-bold uppercase tracking-wider border-b border-gray-200">
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
                <td className="py-3.5 px-4 font-bold text-textPrimary">{item.product}</td>
                <td className="py-3.5 px-4 text-textSecondary text-xs max-w-xs">{item.description}</td>
                <td className="py-3.5 px-4 text-center font-semibold text-textPrimary">{item.quantity}</td>
                <td className="py-3.5 px-4 text-right font-medium">{formatCurrency(item.unitPrice)}</td>
                <td className="py-3.5 px-4 text-center text-warning-600 font-medium">{item.discount}%</td>
                <td className="py-3.5 px-4 text-center text-textSecondary text-xs">{item.tax}% GST</td>
                <td className="py-3.5 px-4 text-right font-bold text-brand-500">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
