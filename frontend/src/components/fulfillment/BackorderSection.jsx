import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

export default function BackorderSection({ backorders }) {
  if (!backorders || backorders.length === 0) {
    return (
      <div className="bg-success-50 border border-success-200 rounded-card p-6 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm border border-success-100">
          <svg className="w-6 h-6 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 className="text-sm font-bold text-success-800">All items are currently available</h3>
        <p className="text-xs text-success-700 mt-1">No backorders for this fulfillment.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-danger-200 rounded-card shadow-card overflow-hidden">
      <div className="p-5 border-b border-danger-100 bg-danger-50 flex items-center space-x-2">
        <AlertTriangle className="w-5 h-5 text-danger-500" />
        <h3 className="text-lg font-bold text-danger-800">Backordered Items</h3>
      </div>
      
      <div className="overflow-x-auto w-full pb-2">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-surface-border text-[11px] uppercase tracking-wider text-text-secondary font-bold">
              <th className="p-4 whitespace-nowrap">Product</th>
              <th className="p-4 whitespace-nowrap text-center">Ordered</th>
              <th className="p-4 whitespace-nowrap text-center">Fulfilled</th>
              <th className="p-4 whitespace-nowrap text-center">Backordered</th>
              <th className="p-4 whitespace-nowrap">Expected Availability</th>
              <th className="p-4 whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {backorders.map((item, idx) => (
              <tr key={idx} className="hover:bg-danger-50/30 transition-colors">
                <td className="p-4 whitespace-nowrap">
                  <div className="font-bold text-text-primary text-sm">{item.productName}</div>
                  <div className="text-xs text-text-secondary">SKU: {item.sku}</div>
                </td>
                <td className="p-4 text-center font-bold text-text-primary whitespace-nowrap">
                  {item.orderedQuantity}
                </td>
                <td className="p-4 text-center font-bold text-success-600 whitespace-nowrap">
                  {item.fulfilledQuantity}
                </td>
                <td className="p-4 text-center font-bold text-danger-600 whitespace-nowrap">
                  {item.backorderedQuantity}
                </td>
                <td className="p-4 whitespace-nowrap">
                  {item.expectedAvailability ? (
                    <div className="flex items-center text-sm font-medium text-warning-700">
                      <Clock className="w-4 h-4 mr-1.5" />
                      {new Date(item.expectedAvailability).toLocaleDateString()}
                    </div>
                  ) : (
                    <span className="text-xs text-text-secondary">TBD</span>
                  )}
                </td>
                <td className="p-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-danger-50 text-danger-700 border border-danger-200">
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
