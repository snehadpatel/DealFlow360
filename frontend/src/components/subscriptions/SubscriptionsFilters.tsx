import React from 'react';
import { Search, Filter, RefreshCcw } from 'lucide-react';

interface FiltersState {
  status: string;
  billingCycle: string;
  search: string;
}

interface Props {
  filters: FiltersState;
  onFilterChange: (filters: FiltersState) => void;
  onRefresh: () => void;
  loading: boolean;
}

export default function SubscriptionsFilters({ filters, onFilterChange, onRefresh, loading }: Props) {
  const statuses = ['All', 'ACTIVE', 'TRIAL', 'PAUSED', 'SUSPENDED', 'CANCELLED', 'EXPIRED'];
  const cycles = ['All', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM'];

  return (
    <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="pl-10 pr-4 py-2 w-full sm:w-64 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
            placeholder="Search Subscriptions..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-40">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <select
              className="pl-9 pr-8 py-2 w-full border border-slate-300 rounded-lg text-sm appearance-none bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              value={filters.status}
              onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All Status' : s}</option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 sm:w-40">
            <select
              className="px-3 pr-8 py-2 w-full border border-slate-300 rounded-lg text-sm appearance-none bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              value={filters.billingCycle}
              onChange={(e) => onFilterChange({ ...filters, billingCycle: e.target.value })}
            >
              {cycles.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Cycles' : c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={onRefresh}
        disabled={loading}
        className="flex items-center space-x-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
      >
        <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        <span>Refresh</span>
      </button>
    </div>
  );
}
