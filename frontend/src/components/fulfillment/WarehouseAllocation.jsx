import React from 'react';
import { PackageSearch, MapPin } from 'lucide-react';

export default function WarehouseAllocation({ warehouseStock, items }) {
  if (!warehouseStock || warehouseStock.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6">
      <div className="flex items-center space-x-2 mb-6">
        <PackageSearch className="w-5 h-5 text-brand-500" />
        <h2 className="text-lg font-bold text-textPrimary">Warehouse Allocation</h2>
      </div>

      <div className="space-y-8">
        {warehouseStock.map((prodStock, idx) => {
          // Find original order details to show summary
          const orderItem = items?.find(i => i.productId === prodStock.productId);

          return (
            <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h3 className="text-sm font-bold text-textPrimary">{prodStock.productName}</h3>
                  <p className="text-xs text-textSecondary mt-0.5">Product ID: {prodStock.productId}</p>
                </div>
                {orderItem && (
                  <div className="flex items-center space-x-4 text-sm bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">
                    <span className="font-medium text-textSecondary">Ordered: <span className="font-bold text-textPrimary">{orderItem.orderedQuantity}</span></span>
                    <span className="text-gray-300">|</span>
                    <span className="font-medium text-textSecondary">Allocated: <span className="font-bold text-success-600">{orderItem.allocatedQuantity}</span></span>
                    <span className="text-gray-300">|</span>
                    <span className="font-medium text-textSecondary">Backorder: <span className="font-bold text-danger-600">{orderItem.backorderedQuantity}</span></span>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-200 text-[11px] uppercase tracking-wider text-textSecondary font-bold">
                      <th className="p-3 pl-4 whitespace-nowrap">Warehouse</th>
                      <th className="p-3 whitespace-nowrap text-center">Available Stock</th>
                      <th className="p-3 whitespace-nowrap text-center">Allocated Stock</th>
                      <th className="p-3 whitespace-nowrap text-center">Remaining Stock</th>
                      <th className="p-3 pr-4 whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {prodStock.warehouses.map((wh, wIdx) => {
                      const remaining = wh.available - wh.allocated;
                      return (
                        <tr key={wIdx} className="hover:bg-brand-50/30 transition-colors">
                          <td className="p-3 pl-4 whitespace-nowrap">
                            <div className="font-bold text-textPrimary text-sm">{wh.warehouseName}</div>
                            <div className="text-[11px] text-textSecondary flex items-center mt-0.5">
                              <MapPin className="w-3 h-3 mr-1" />
                              {wh.location}
                            </div>
                          </td>
                          <td className="p-3 text-center font-bold text-textPrimary whitespace-nowrap">
                            {wh.available}
                          </td>
                          <td className="p-3 text-center font-bold text-success-600 whitespace-nowrap">
                            {wh.allocated}
                          </td>
                          <td className="p-3 text-center font-bold text-textSecondary whitespace-nowrap">
                            {remaining}
                          </td>
                          <td className="p-3 pr-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border
                              ${wh.status === 'AVAILABLE' ? 'bg-success-50 text-success-700 border-success-200' : 
                                wh.status === 'ALLOCATED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                wh.status === 'LOW_STOCK' ? 'bg-warning-50 text-warning-700 border-warning-200' :
                                'bg-danger-50 text-danger-700 border-danger-200'
                              }
                            `}>
                              {wh.status.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
