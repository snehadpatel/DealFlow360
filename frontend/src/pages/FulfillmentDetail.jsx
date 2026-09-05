import React, { useState, useEffect } from 'react';
import { getFulfillmentById, allocateStock, createShipment } from '../api/fulfillmentApi';
import FulfillmentOrderSummary from '../components/fulfillment/FulfillmentOrderSummary';
import FulfillmentItemsTable from '../components/fulfillment/FulfillmentItemsTable';
import WarehouseAllocation from '../components/fulfillment/WarehouseAllocation';
import BackorderSection from '../components/fulfillment/BackorderSection';
import FulfillmentTimeline from '../components/fulfillment/FulfillmentTimeline';
import ShippingInformation from '../components/fulfillment/ShippingInformation';
import AllocateStockModal from '../components/fulfillment/AllocateStockModal';
import CreateShipmentModal from '../components/fulfillment/CreateShipmentModal';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function FulfillmentDetail({ fulfillmentId, onBack }) {
  const [fulfillment, setFulfillment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null });

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const data = await getFulfillmentById(fulfillmentId);
      setFulfillment(data);
    } catch (err) {
      setError(err.message || 'Failed to load fulfillment data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (fulfillmentId) loadData();
  }, [fulfillmentId]);

  const handleAllocate = async (allocations) => {
    await allocateStock(fulfillmentId, allocations);
    setModalConfig({ isOpen: false, type: null });
    loadData(true);
  };

  const handleCreateShipment = async (shipmentData) => {
    await createShipment(fulfillmentId, shipmentData);
    setModalConfig({ isOpen: false, type: null });
    loadData(true);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-7xl mx-auto pb-12">
        <div className="h-12 bg-white rounded-card w-1/4"></div>
        <div className="h-48 bg-white rounded-card"></div>
        <div className="h-64 bg-white rounded-card"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto bg-white border border-surface-border p-12 text-center rounded-card shadow-card">
        <h2 className="text-xl font-bold text-text-primary mb-2">Error</h2>
        <p className="text-sm text-text-secondary mb-4">{error}</p>
        <button onClick={onBack} className="px-4 py-2 bg-gray-100 rounded-btn">Go Back</button>
      </div>
    );
  }

  if (!fulfillment) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-2 border border-surface-border rounded-btn bg-white text-text-secondary hover:text-primary-600 hover:border-primary-200 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1 flex items-center space-x-2">
              <span>Fulfillment & Stock</span>
              <span>&rarr;</span>
              <span className="text-primary-600">{fulfillment.id}</span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Fulfillment #{fulfillment.id}</h1>
          </div>
        </div>
        <button 
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="flex items-center px-4 py-2 bg-white border border-surface-border text-text-secondary rounded-btn hover:text-primary-600 hover:border-primary-200 text-sm font-semibold transition shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin text-primary-500' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Main Data) */}
        <div className="lg:col-span-2 space-y-6">
          <FulfillmentOrderSummary fulfillment={fulfillment} />
          <FulfillmentItemsTable items={fulfillment.items} />
          <WarehouseAllocation warehouseStock={fulfillment.warehouseStock} items={fulfillment.items} />
          <BackorderSection backorders={fulfillment.backorders} />
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-6">
          <ShippingInformation shipping={fulfillment.shipping} />
          <FulfillmentTimeline timeline={fulfillment.timeline} />
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-border p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-end space-x-3">
          {fulfillment.permissions?.can_allocate && (
            <button 
              onClick={() => setModalConfig({ isOpen: true, type: 'allocate' })}
              className="px-6 py-2.5 bg-white border border-primary-500 text-primary-600 hover:bg-primary-50 rounded-pill text-sm font-bold transition"
            >
              Allocate Stock
            </button>
          )}
          {fulfillment.permissions?.can_create_shipment && (
            <button 
              onClick={() => setModalConfig({ isOpen: true, type: 'shipment' })}
              className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-pill text-sm font-bold shadow-btn transition"
            >
              Create Shipment
            </button>
          )}
          {!fulfillment.permissions?.can_allocate && !fulfillment.permissions?.can_create_shipment && (
            <span className="text-sm font-medium text-text-secondary italic">
              No further actions available for this fulfillment.
            </span>
          )}
        </div>
      </div>

      {/* Modals */}
      <AllocateStockModal 
        isOpen={modalConfig.isOpen && modalConfig.type === 'allocate'}
        onClose={() => setModalConfig({ isOpen: false, type: null })}
        orderId={fulfillment.id}
        items={fulfillment.items}
        warehouseStock={fulfillment.warehouseStock}
        onConfirm={handleAllocate}
      />

      <CreateShipmentModal 
        isOpen={modalConfig.isOpen && modalConfig.type === 'shipment'}
        onClose={() => setModalConfig({ isOpen: false, type: null })}
        orderId={fulfillment.id}
        onConfirm={handleCreateShipment}
      />
    </div>
  );
}
