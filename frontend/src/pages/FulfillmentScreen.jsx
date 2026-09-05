import React, { useState, useEffect } from 'react';
import { getFulfillmentSummary, getFulfillmentOrders } from '../api/fulfillmentApi';
import FulfillmentSummaryCards from '../components/fulfillment/FulfillmentSummaryCards';
import FulfillmentFilters from '../components/fulfillment/FulfillmentFilters';
import FulfillmentTable from '../components/fulfillment/FulfillmentTable';
import FulfillmentDetail from './FulfillmentDetail';

export default function FulfillmentScreen() {
  const [selectedFulfillmentId, setSelectedFulfillmentId] = useState(null);
  
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'All', warehouse: 'All Warehouses', search: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumData, ordData] = await Promise.all([
        getFulfillmentSummary(),
        getFulfillmentOrders(filters)
      ]);
      setSummary(sumData);
      setOrders(ordData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedFulfillmentId) {
      loadData();
    }
  }, [filters, selectedFulfillmentId]);

  if (selectedFulfillmentId) {
    return (
      <FulfillmentDetail 
        fulfillmentId={selectedFulfillmentId} 
        onBack={() => setSelectedFulfillmentId(null)} 
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1 flex items-center space-x-2">
            <span>Dashboard</span>
            <span>&rarr;</span>
            <span className="text-brand-600">Fulfillment & Stock</span>
          </div>
          <h1 className="text-2xl font-bold text-textPrimary">Fulfillment & Stock</h1>
          <p className="text-sm text-textSecondary mt-1">Manage warehouse allocation, stock availability and order fulfillment.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <FulfillmentSummaryCards summary={summary} loading={loading} />

      {/* Main Content Area */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden flex flex-col">
        
        {/* Filters */}
        <FulfillmentFilters 
          filters={filters} 
          onFilterChange={setFilters} 
          onRefresh={loadData}
          loading={loading}
        />

        {/* Table */}
        <FulfillmentTable 
          orders={orders} 
          loading={loading} 
          onView={(id) => setSelectedFulfillmentId(id)}
        />
        
      </div>
    </div>
  );
}
