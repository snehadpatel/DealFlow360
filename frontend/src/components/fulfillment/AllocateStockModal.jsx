import React, { useState, useEffect } from 'react';
import { X, PackageSearch } from 'lucide-react';

export default function AllocateStockModal({ isOpen, onClose, orderId, items, warehouseStock, onConfirm }) {
  const [allocations, setAllocations] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Initialize allocations map based on ordered items
  useEffect(() => {
    if (isOpen && items && warehouseStock) {
      const initial = {};
      items.forEach(item => {
        // Only initialize for items that need allocation (not fully allocated)
        if (item.orderedQuantity > item.allocatedQuantity) {
          initial[item.productId] = {};
          const wStock = warehouseStock.find(w => w.productId === item.productId);
          if (wStock) {
            wStock.warehouses.forEach(wh => {
              if (wh.available > wh.allocated) {
                initial[item.productId][wh.warehouseId] = 0;
              }
            });
          }
        }
      });
      setAllocations(initial);
      setError(null);
    }
  }, [isOpen, items, warehouseStock]);

  if (!isOpen) return null;

  const handleAllocationChange = (productId, warehouseId, val) => {
    const value = parseInt(val) || 0;
    if (value < 0) return; // Basic UI validation: No negative
    
    setAllocations(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [warehouseId]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      // Flatten the map into array of allocations
      const finalAllocations = [];
      Object.entries(allocations).forEach(([productId, whData]) => {
        Object.entries(whData).forEach(([warehouseId, qty]) => {
          if (qty > 0) {
            finalAllocations.push({
              product_id: productId,
              warehouse_id: warehouseId,
              quantity: qty
            });
          }
        });
      });

      if (finalAllocations.length === 0) {
        throw new Error("Please specify at least one allocation amount greater than 0.");
      }

      await onConfirm(finalAllocations);
    } catch (err) {
      setError(err.message || 'Failed to allocate stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  const productsNeedingAllocation = items.filter(i => i.orderedQuantity > i.allocatedQuantity);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-card shadow-card w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-surface-border flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-2">
            <PackageSearch className="w-5 h-5 text-primary-500" />
            <h2 className="text-xl font-bold text-text-primary">Allocate Stock</h2>
          </div>
          <button onClick={onClose} disabled={isSubmitting} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-danger-50 border border-danger-200 text-danger-700 text-sm font-semibold rounded-btn">
              {error}
            </div>
          )}

          {productsNeedingAllocation.length === 0 ? (
            <div className="text-center text-text-secondary py-8">
              All items are fully allocated or no allocation options are available.
            </div>
          ) : (
            <div className="space-y-6">
              {productsNeedingAllocation.map(item => {
                const wStock = warehouseStock.find(w => w.productId === item.productId);
                const remainingToAllocate = item.orderedQuantity - item.allocatedQuantity;
                
                let currentAllocationSum = 0;
                if (allocations[item.productId]) {
                   currentAllocationSum = Object.values(allocations[item.productId]).reduce((a,b) => a+b, 0);
                }

                return (
                  <div key={item.productId} className="border border-surface-border rounded-btn p-4">
                    <div className="flex justify-between items-center border-b border-surface-border pb-2 mb-4">
                      <div>
                        <h4 className="font-bold text-text-primary">{item.productName}</h4>
                        <p className="text-xs text-text-secondary">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-text-primary">Need: {remainingToAllocate}</div>
                        <div className={`text-xs font-semibold mt-0.5 ${currentAllocationSum > remainingToAllocate ? 'text-danger-600' : 'text-primary-600'}`}>
                          Total Selected: {currentAllocationSum}
                        </div>
                      </div>
                    </div>

                    {!wStock || wStock.warehouses.filter(w => w.available > w.allocated).length === 0 ? (
                      <div className="text-sm text-warning-700 bg-warning-50 p-2 rounded">No available stock in any warehouse.</div>
                    ) : (
                      <div className="space-y-3">
                        {wStock.warehouses.map(wh => {
                          const available = wh.available - wh.allocated;
                          if (available <= 0) return null;
                          const currentVal = allocations[item.productId]?.[wh.warehouseId] || '';
                          
                          return (
                            <div key={wh.warehouseId} className="flex items-center justify-between bg-gray-50 p-2 rounded-btn border border-gray-100">
                              <div>
                                <div className="text-sm font-bold text-text-primary">{wh.warehouseName}</div>
                                <div className="text-[10px] text-text-secondary">Available: {available}</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <label className="text-xs font-semibold text-text-secondary">Allocate:</label>
                                <input 
                                  type="number"
                                  min="0"
                                  max={available}
                                  value={currentVal}
                                  onChange={(e) => handleAllocationChange(item.productId, wh.warehouseId, e.target.value)}
                                  className="w-20 px-2 py-1 border border-surface-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-surface-border bg-gray-50 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-surface-border text-text-secondary font-bold hover:bg-gray-100 rounded-pill transition"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || productsNeedingAllocation.length === 0}
            className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-pill shadow-btn transition flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Processing...
              </>
            ) : "Confirm Allocation"}
          </button>
        </div>
      </div>
    </div>
  );
}
