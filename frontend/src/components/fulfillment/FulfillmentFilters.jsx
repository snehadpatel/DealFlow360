import React from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';

export default function FulfillmentFilters({ filters, onFilterChange, onRefresh, loading }) {
  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="p-5 border-b border-gray-200 bg-white flex flex-col sm:flex-row gap-4 justify-between items-center">
      
      {/* Search */}
      <div className="relative w-full sm:max-w-xs">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by ID, Customer..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 hover:bg-white transition"
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
        />
      </div>

      {/* Selects & Actions */}
      <div className="flex w-full sm:w-auto items-center space-x-3 overflow-x-auto pb-1 sm:pb-0">
        
        <div className="relative flex-shrink-0">
          <select 
            className="appearance-none block w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white font-medium text-textSecondary cursor-pointer hover:border-gray-300"
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option>All</option>
            <option>Pending</option>
            <option>Allocated</option>
            <option>Partially Fulfilled</option>
            <option>Fulfilled</option>
            <option>Backordered</option>
            <option>Cancelled</option>
          </select>
          <Filter className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative flex-shrink-0">
          <select 
            className="appearance-none block w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white font-medium text-textSecondary cursor-pointer hover:border-gray-300"
            value={filters.warehouse}
            onChange={(e) => handleChange('warehouse', e.target.value)}
          >
            <option>All Warehouses</option>
            <option>Ahmedabad WH</option>
            <option>Mumbai WH</option>
            <option>Delhi WH</option>
          </select>
          <Filter className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>

        <button 
          onClick={onRefresh}
          disabled={loading}
          className="flex-shrink-0 p-2 border border-gray-200 rounded-lg bg-white text-textSecondary hover:text-brand-600 hover:border-brand-200 transition focus:outline-none"
          title="Refresh Data"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-brand-500' : ''}`} />
        </button>
      </div>
    </div>
  );
}
