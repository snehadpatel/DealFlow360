import React from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import StatusBadge from '../customer/StatusBadge';

export function ApprovalHeader({ approval, onBack, onRefresh, isRefreshing }) {
  if (!approval) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
      <div className="flex items-center space-x-4">
        <button 
          onClick={onBack}
          className="p-2 border border-surface-border rounded-btn text-text-secondary hover:text-text-primary hover:bg-gray-50 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-extrabold text-text-primary">Approval Detail</h1>
            <span className="text-sm font-bold text-text-secondary bg-gray-100 px-2 py-0.5 rounded">
              {approval.id}
            </span>
            <StatusBadge status={approval.status} />
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Quotation <span className="font-bold text-primary-600">{approval.quotation?.id}</span>
          </p>
        </div>
      </div>
      
      <button 
        onClick={onRefresh}
        disabled={isRefreshing}
        className="inline-flex items-center space-x-2 px-3 py-1.5 bg-white border border-surface-border hover:bg-gray-50 text-text-secondary rounded-btn text-xs font-semibold transition disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        <span>Refresh</span>
      </button>
    </div>
  );
}

export function ApprovalStatusBanner({ approval }) {
  if (!approval) return null;
  
  if (approval.status === 'APPROVED') {
    return (
      <div className="bg-success-50 border-l-4 border-success-500 p-4 rounded-r-card flex items-start space-x-3 shadow-sm">
        <div className="flex-1">
          <h3 className="text-success-700 font-bold text-sm">Approval Completed</h3>
          <p className="text-success-600 text-xs mt-1">This quotation has been approved successfully.</p>
        </div>
      </div>
    );
  }

  if (approval.status === 'REJECTED') {
    return (
      <div className="bg-danger-50 border-l-4 border-danger-500 p-4 rounded-r-card flex items-start space-x-3 shadow-sm">
        <div className="flex-1">
          <h3 className="text-danger-700 font-bold text-sm">Approval Rejected</h3>
          <p className="text-danger-600 text-xs mt-1">This quotation was rejected by the reviewer.</p>
        </div>
      </div>
    );
  }

  if (approval.status === 'CHANGES_REQUESTED') {
    return (
      <div className="bg-warning-50 border-l-4 border-warning-500 p-4 rounded-r-card flex items-start space-x-3 shadow-sm">
        <div className="flex-1">
          <h3 className="text-warning-700 font-bold text-sm">Changes Requested</h3>
          <p className="text-warning-600 text-xs mt-1">The reviewer has requested changes before approval can be granted.</p>
        </div>
      </div>
    );
  }

  // Pending State Banner
  return (
    <div className="bg-warning-50 border border-warning-200 p-5 rounded-card shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <span className="text-warning-600">⚠</span>
          <h3 className="text-warning-700 font-bold text-sm uppercase tracking-wider">Approval Required</h3>
        </div>
        <p className="text-warning-600 text-xs font-medium">
          This quotation requires approval because the requested discount exceeds the configured threshold.
        </p>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <div className="bg-white border border-warning-100 rounded-btn px-3 py-1.5 shadow-sm">
          <span className="block text-[10px] font-bold text-text-secondary uppercase">Type</span>
          <span className="block text-xs font-bold text-text-primary mt-0.5">{approval.approval_type.replace('_', ' ')}</span>
        </div>
        <div className="bg-white border border-warning-100 rounded-btn px-3 py-1.5 shadow-sm">
          <span className="block text-[10px] font-bold text-text-secondary uppercase">Current Disc</span>
          <span className="block text-xs font-bold text-text-primary mt-0.5">{approval.current_discount}%</span>
        </div>
        <div className="bg-white border border-warning-100 rounded-btn px-3 py-1.5 shadow-sm">
          <span className="block text-[10px] font-bold text-text-secondary uppercase">Req Disc</span>
          <span className="block text-xs font-bold text-danger-500 mt-0.5">{approval.requested_discount}%</span>
        </div>
      </div>
    </div>
  );
}
