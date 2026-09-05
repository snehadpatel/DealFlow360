import React from 'react';
import { PackageSearch, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const mapping = {
    'PENDING': { color: 'bg-warning-50 text-warning-700 border-warning-200', icon: Clock },
    'ALLOCATED': { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: PackageSearch },
    'PARTIALLY_FULFILLED': { color: 'bg-success-50 text-success-700 border-success-200', icon: PackageSearch },
    'FULFILLED': { color: 'bg-success-100 text-success-800 border-success-300', icon: CheckCircle2 },
    'BACKORDERED': { color: 'bg-danger-50 text-danger-700 border-danger-200', icon: AlertCircle },
    'CANCELLED': { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: AlertCircle }
  };
  
  const safeStatus = status?.toUpperCase() || 'PENDING';
  const config = mapping[safeStatus] || mapping['PENDING'];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {safeStatus.replace('_', ' ')}
    </span>
  );
};

export default function FulfillmentTable({ orders, loading, onView }) {
  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="p-16 text-center text-textSecondary flex flex-col items-center">
        <PackageSearch className="h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-textPrimary mb-1">No fulfillment orders found</h3>
        <p className="text-sm">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full pb-4">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-[11px] uppercase tracking-wider text-textSecondary font-bold">
            <th className="p-4 whitespace-nowrap">Fulfillment ID</th>
            <th className="p-4 whitespace-nowrap">Quotation</th>
            <th className="p-4 whitespace-nowrap">Customer</th>
            <th className="p-4 whitespace-nowrap">Rep</th>
            <th className="p-4 whitespace-nowrap text-right">Value</th>
            <th className="p-4 whitespace-nowrap text-center">Items</th>
            <th className="p-4 whitespace-nowrap">Warehouse</th>
            <th className="p-4 whitespace-nowrap">Status</th>
            <th className="p-4 whitespace-nowrap">Created</th>
            <th className="p-4 whitespace-nowrap text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-brand-50/50 transition-colors group">
              <td className="p-4 font-bold text-textPrimary text-sm whitespace-nowrap">
                {order.id}
              </td>
              <td className="p-4 text-xs font-semibold text-brand-600 whitespace-nowrap">
                {order.quotationId || order.orderId || '-'}
              </td>
              <td className="p-4 text-sm text-textPrimary font-medium whitespace-nowrap">
                {order.customer || 'Unknown Customer'}
              </td>
              <td className="p-4 text-xs text-textSecondary whitespace-nowrap">
                {order.salesRep || 'Unassigned'}
              </td>
              <td className="p-4 text-sm font-bold text-textPrimary text-right whitespace-nowrap">
                ₹{(order.orderValue || 0).toLocaleString()}
              </td>
              <td className="p-4 text-center whitespace-nowrap">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-xs font-bold text-textSecondary">
                  {order.itemsCount || 0}
                </span>
              </td>
              <td className="p-4 text-xs font-medium text-textSecondary whitespace-nowrap">
                {order.warehouse || 'Unassigned'}
              </td>
              <td className="p-4 whitespace-nowrap">
                <StatusBadge status={order.status} />
                {order.backorderCount > 0 && (
                  <div className="text-[10px] text-danger-500 font-bold mt-1">
                    {order.backorderCount} Backordered
                  </div>
                )}
              </td>
              <td className="p-4 text-xs text-textSecondary whitespace-nowrap">
                {new Date(order.createdAt || order.date || new Date()).toLocaleDateString()}
              </td>
              <td className="p-4 text-right whitespace-nowrap">
                <button 
                  onClick={() => onView(order.id)}
                  className="px-3 py-1.5 bg-white border border-gray-200 hover:border-brand-300 hover:text-brand-600 rounded-lg text-xs font-bold text-textSecondary transition shadow-sm"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
