import React, { useState, useEffect } from 'react';
import { getApprovals, getApprovalSummary } from '../api/approvalApi';
import ApprovalSummaryCards from '../components/approval/ApprovalSummaryCards';
import ApprovalFilters from '../components/approval/ApprovalFilters';
import ApprovalTable from '../components/approval/ApprovalTable';
import ApprovalMobileCard from '../components/approval/ApprovalMobileCard';
import ApprovalDetail from './ApprovalDetail';
import { RefreshCw, Download, FileText, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

export default function ApprovalScreen() {
  const [selectedApprovalId, setSelectedApprovalId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [approvalsResponse, setApprovalsResponse] = useState({ items: [], total: 0, page: 1, page_size: 10 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: 'ALL', riskLevel: 'ALL', approvalType: 'ALL', dateRange: 'ALL', sortBy: 'HIGHEST_RISK', page: 1, pageSize: 10 });

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const [summaryRes, listRes] = await Promise.all([getApprovalSummary(), getApprovals(filters)]);
      setSummary(summaryRes); setApprovalsResponse(listRes);
    } catch { setError('Unable to load approval requests. Please check connection and try again.'); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, [filters]);

  const handleClearFilters = () => setFilters({ search: '', status: 'ALL', riskLevel: 'ALL', approvalType: 'ALL', dateRange: 'ALL', sortBy: 'HIGHEST_RISK', page: 1, pageSize: 10 });
  const handlePageChange = (newPage) => setFilters((prev) => ({ ...prev, page: newPage }));

  if (selectedApprovalId) return (
    <ApprovalDetail
      approvalId={selectedApprovalId}
      onBack={() => {
        // Re-fetch the pending list so a just-decided item drops off without a
        // manual refresh when returning from the detail view.
        setSelectedApprovalId(null);
        fetchData(true);
      }}
    />
  );

  const totalPages = Math.ceil(approvalsResponse.total / filters.pageSize) || 1;
  const startCount = (filters.page - 1) * filters.pageSize + 1;
  const endCount = Math.min(filters.page * filters.pageSize, approvalsResponse.total);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-textPrimary tracking-tight">Approval Requests</h1>
          <p className="text-xs text-textSecondary mt-1">Review quotations and negotiation requests requiring internal manager or finance approval.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => fetchData(true)} disabled={refreshing || loading} className="inline-flex items-center space-x-2 px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-textSecondary rounded-lg text-xs font-semibold shadow-md transition disabled:opacity-50" title="Fetch fresh approval records">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-brand-500' : ''}`} /><span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button disabled className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-gray-200 text-gray-400 rounded-lg text-xs font-medium cursor-not-allowed opacity-60" title="Export functionality available in future release">
            <Download className="w-3.5 h-3.5" /><span>Export</span>
          </button>
        </div>
      </div>

      <ApprovalSummaryCards summary={summary} loading={loading} />
      <ApprovalFilters filters={filters} onFilterChange={setFilters} onClearFilters={handleClearFilters} />

      {error && (
        <div className="bg-danger-50 border border-danger-100 p-6 rounded-2xl text-center space-y-3">
          <div className="flex items-center justify-center space-x-2 text-danger-500 font-semibold text-sm"><AlertCircle className="w-5 h-5" /><span>{error}</span></div>
          <button onClick={() => fetchData()} className="px-4 py-2 bg-danger-500 hover:bg-danger-600 text-white text-xs font-semibold rounded-lg transition">Retry</button>
        </div>
      )}

      {loading && !error && <div className="space-y-4 animate-pulse">{[1, 2, 3, 4].map((i) => (<div key={i} className="h-16 bg-white border border-gray-200 rounded-2xl" />))}</div>}

      {!loading && !error && (
        <>
          {approvalsResponse.items.length > 0 ? (
            <div className="space-y-6">
              <div className="hidden lg:block"><ApprovalTable items={approvalsResponse.items} onReview={(id) => setSelectedApprovalId(id)} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4">{approvalsResponse.items.map((item) => (<ApprovalMobileCard key={item.id} item={item} onReview={(id) => setSelectedApprovalId(id)} />))}</div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs shadow-md">
                <div className="text-textSecondary font-medium">Showing <span className="font-bold text-textPrimary">{startCount}</span>–<span className="font-bold text-textPrimary">{endCount}</span> of <span className="font-bold text-textPrimary">{approvalsResponse.total}</span> approvals</div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => handlePageChange(filters.page - 1)} disabled={filters.page <= 1} className="p-2 bg-gray-50 border border-gray-200 text-textSecondary hover:text-textPrimary disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition"><ChevronLeft className="w-4 h-4" /></button>
                  <span className="px-3 py-1 bg-brand-50 border border-brand-200 text-brand-600 font-bold rounded-lg">Page {filters.page} of {totalPages}</span>
                  <button onClick={() => handlePageChange(filters.page + 1)} disabled={filters.page >= totalPages} className="p-2 bg-gray-50 border border-gray-200 text-textSecondary hover:text-textPrimary disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-4 shadow-md">
              <FileText className="w-12 h-12 text-gray-300 mx-auto" /><div><h3 className="text-base font-bold text-textPrimary">No approval requests found</h3><p className="text-xs text-textSecondary mt-1">Try changing your filters or search criteria to find matching approval requests.</p></div>
              <button onClick={handleClearFilters} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-textPrimary text-xs font-semibold rounded-lg transition">Clear Filters</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
