import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

export default function InvoiceFilters({ filters, onFilterChange, onClearFilters }) {
  const handleChange = (key, value) => {
    onFilterChange((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to page 1 on filter change
    }));
  };

  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'SENT', label: 'Sent' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
    { value: 'PAID', label: 'Paid' },
    { value: 'OVERDUE', label: 'Overdue' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  const dateOptions = [
    { value: 'ALL', label: 'All Dates' },
    { value: 'TODAY', label: 'Today' },
    { value: 'THIS_WEEK', label: 'This Week' },
    { value: 'THIS_MONTH', label: 'This Month' },
    { value: 'LAST_30_DAYS', label: 'Last 30 Days' },
    { value: 'Q3_2026', label: 'Q3 2026' },
  ];

  const hasActiveFilters =
    Boolean(filters.search) ||
    filters.status !== 'ALL' ||
    filters.date !== 'ALL' ||
    filters.dueDate !== 'ALL';

  return (
    <div className="bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-xs space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice #, customer, quote..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F4F5F7] border border-transparent focus:border-[#F26C4F] focus:bg-white rounded-xl text-xs text-[#1F2937] placeholder-[#6B7280] transition outline-hidden"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            aria-label="Filter by status"
            value={filters.status || 'ALL'}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 bg-[#F4F5F7] border border-transparent focus:border-[#F26C4F] focus:bg-white rounded-xl text-xs text-[#1F2937] font-medium transition outline-hidden cursor-pointer"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Invoice Date filter */}
        <div className="relative">
          <select
            aria-label="Filter by invoice date"
            value={filters.date || 'ALL'}
            onChange={(e) => handleChange('date', e.target.value)}
            className="w-full px-3 py-2 bg-[#F4F5F7] border border-transparent focus:border-[#F26C4F] focus:bg-white rounded-xl text-xs text-[#1F2937] font-medium transition outline-hidden cursor-pointer"
          >
            {dateOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Date: {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Due Date filter */}
        <div className="relative">
          <select
            aria-label="Filter by due date"
            value={filters.dueDate || 'ALL'}
            onChange={(e) => handleChange('dueDate', e.target.value)}
            className="w-full px-3 py-2 bg-[#F4F5F7] border border-transparent focus:border-[#F26C4F] focus:bg-white rounded-xl text-xs text-[#1F2937] font-medium transition outline-hidden cursor-pointer"
          >
            <option value="ALL">Due Date: Any</option>
            <option value="OVERDUE">Overdue Only</option>
            <option value="DUE_7_DAYS">Due Next 7 Days</option>
            <option value="DUE_30_DAYS">Due Next 30 Days</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]/60 text-xs">
          <div className="flex items-center space-x-2 text-[#6B7280]">
            <Filter className="w-3.5 h-3.5 text-[#F26C4F]" />
            <span>Active filters applied</span>
          </div>
          <button
            onClick={onClearFilters}
            className="inline-flex items-center space-x-1 text-xs font-semibold text-[#F26C4F] hover:text-[#E0583B] transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset filters</span>
          </button>
        </div>
      )}
    </div>
  );
}
