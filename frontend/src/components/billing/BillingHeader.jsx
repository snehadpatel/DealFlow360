import React from 'react';
import { ArrowLeft, Download, Send, RefreshCw, Calendar, FileText, User } from 'lucide-react';

export default function BillingHeader({
  billing,
  onBack,
  onRefresh,
  onOpenSendModal,
  onDownload,
  refreshing = false
}) {
  if (!billing) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PARTIALLY_PAID':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'PENDING':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PROCESSING':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'OVERDUE':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'FAILED':
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Back Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-semibold text-textSecondary uppercase tracking-wider">
          <button
            onClick={onBack}
            className="flex items-center text-primary hover:text-primary-hover transition-colors font-medium normal-case tracking-normal"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Billing
          </button>
          <span className="text-slate-300">/</span>
          <span>Dashboard</span>
          <span className="text-slate-300">/</span>
          <span>Billing</span>
          <span className="text-slate-300">/</span>
          <span className="text-textPrimary font-bold">{billing.id}</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-textSecondary hover:text-textPrimary transition-colors shadow-xs"
            title="Refresh billing data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
          </button>
          <button
            onClick={onDownload}
            className="px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-textPrimary text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-textSecondary" />
            <span>Download PDF</span>
          </button>
          <button
            onClick={onOpenSendModal}
            className="px-4 py-1.5 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Invoice</span>
          </button>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1.5">
            <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Billing Detail</h1>
            <span className="text-sm font-mono font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
              {billing.id}
            </span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusBadge(billing.status)}`}>
              {billing.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-sm text-textSecondary">
            Comprehensive hybrid billing account for combined one-time products & recurring subscriptions.
          </p>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-textSecondary">
          <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            <FileText className="w-4 h-4 text-primary" />
            <span>Quote:</span>
            <span className="font-semibold text-textPrimary font-mono">{billing.quotationId}</span>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            <User className="w-4 h-4 text-primary" />
            <span>Customer:</span>
            <span className="font-semibold text-textPrimary">{billing.customerName}</span>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            <Calendar className="w-4 h-4 text-primary" />
            <span>Created:</span>
            <span className="font-semibold text-textPrimary">{formatDate(billing.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
