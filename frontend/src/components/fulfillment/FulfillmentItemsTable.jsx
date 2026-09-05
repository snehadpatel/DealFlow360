import React from 'react';
import { StatusBadge } from './FulfillmentTable';

export default function FulfillmentItemsTable({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
      <div className="p-5 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-bold text-textPrimary">Ordered Products</h3>
        <p className="text-sm text-textSecondary">Summary of items requested in this fulfillment.</p>
      </div>
      
      <div className="overflow-x-auto w-full pb-2">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-gray-200 text-[11px] uppercase tracking-wider text-textSecondary font-bold">
              <th className="p-4 whitespace-nowrap">Product</th>
              <th className="p-4 whitespace-nowrap text-center">Ordered</th>
              <th className="p-4 whitespace-nowrap text-center">Available</th>
              <th className="p-4 whitespace-nowrap text-center">Allocated</th>
              <th className="p-4 whitespace-nowrap text-center">Backordered</th>
              <th className="p-4 whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 whitespace-nowrap">
                  <div className="font-bold text-textPrimary text-sm">{item.productName}</div>
                  <div className="text-xs text-textSecondary">SKU: {item.sku}</div>
                </td>
                <td className="p-4 text-center font-bold text-textPrimary whitespace-nowrap">
                  {item.orderedQuantity}
                </td>
                <td className="p-4 text-center font-bold text-brand-600 whitespace-nowrap">
                  {item.availableQuantity}
                </td>
                <td className="p-4 text-center font-bold text-success-600 whitespace-nowrap">
                  {item.allocatedQuantity}
                </td>
                <td className="p-4 text-center font-bold text-danger-600 whitespace-nowrap">
                  {item.backorderedQuantity > 0 ? item.backorderedQuantity : '-'}
                </td>
                <td className="p-4 whitespace-nowrap">
                  <StatusBadge status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
