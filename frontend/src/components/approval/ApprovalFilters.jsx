import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

export default function ApprovalFilters({ filters, onFilterChange, onClearFilters }) {
  const handleChange = (key, value) => onFilterChange({ ...filters, [key]: value, page: 1 });
  const hasActiveFilters = filters.search || filters.status !== 'ALL' || filters.riskLevel !== 'ALL' || filters.approvalType !== 'ALL' || filters.sortBy !== 'HIGHEST_RISK';

  const selectClass = "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-textPrimary focus:outline-none focus:border-primary-500 transition";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-md space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-textSecondary" />
          <input aria-label="Search approvals" type="text" value={filters.search || ''} onChange={(e) => handleChange('search', e.target.value)} placeholder="Search quote, customer or sales rep..." className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-xs text-textPrimary placeholder-text-secondary focus:outline-none focus:border-primary-500 transition" />
        </div>
        <div><select aria-label="Filter by status" value={filters.status || 'ALL'} onChange={(e) => handleChange('status', e.target.value)} className={selectClass}><option value="ALL">Status: All</option><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option><option value="CHANGES_REQUESTED">Changes Requested</option></select></div>
        <div><select aria-label="Filter by risk level" value={filters.riskLevel || 'ALL'} onChange={(e) => handleChange('riskLevel', e.target.value)} className={selectClass}><option value="ALL">Risk: All</option><option value="HIGH">High Risk</option><option value="MEDIUM">Medium Risk</option><option value="LOW">Low Risk</option></select></div>
        <div><select aria-label="Filter by approval type" value={filters.approvalType || 'ALL'} onChange={(e) => handleChange('approvalType', e.target.value)} className={selectClass}><option value="ALL">Type: All</option><option value="DISCOUNT">Discount Override</option><option value="CUSTOMER_NEGOTIATION">Customer Negotiation</option><option value="FINANCE">Finance</option><option value="OTHER">Other</option></select></div>
        <div><select aria-label="Sort approvals" value={filters.sortBy || 'HIGHEST_RISK'} onChange={(e) => handleChange('sortBy', e.target.value)} className={selectClass}><option value="HIGHEST_RISK">Sort: Highest Risk</option><option value="NEWEST">Sort: Newest First</option><option value="OLDEST">Sort: Oldest First</option><option value="HIGHEST_DISCOUNT">Sort: Highest Discount</option><option value="HIGHEST_VALUE">Sort: Highest Value</option></select></div>
      </div>
      {hasActiveFilters && <div className="flex justify-end pt-1"><button onClick={onClearFilters} className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-textSecondary rounded-lg text-xs font-medium transition"><RotateCcw className="w-3.5 h-3.5" /><span>Clear Filters</span></button></div>}
    </div>
  );
}
