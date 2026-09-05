import React from 'react';
import StatusBadge from './StatusBadge';
import { CheckCircle2, Clock, XCircle, ArrowRight, RefreshCcw } from 'lucide-react';

export default function NegotiationStatus({ negotiation, status, onAcceptQuotation, onRequestNewNegotiation, loading }) {
  if (!negotiation) return null;

  if (status === 'PENDING' || negotiation.status === 'PENDING') {
    return (
      <div className="bg-warning-50 border border-warning-100 rounded-card p-6 shadow-card space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-warning-100 text-warning-600 rounded-btn"><Clock className="w-6 h-6 animate-pulse" /></div>
            <div>
              <h3 className="text-base font-bold text-text-primary">Negotiation Request Submitted ✓</h3>
              <p className="text-xs text-warning-700 mt-0.5">Your negotiation request has been sent to the sales team for review.</p>
            </div>
          </div>
          <StatusBadge status="PENDING" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-btn border border-surface-border">
          <div><span className="text-xs text-text-secondary font-semibold">Requested Discount</span><div className="text-lg font-bold text-warning-600">{negotiation.requestedDiscount}%</div></div>
          <div><span className="text-xs text-text-secondary font-semibold">Review Status</span><div className="text-sm font-semibold text-text-primary mt-1">Pending Sales & Finance Review</div></div>
        </div>
        {negotiation.message && <div className="text-xs text-text-primary bg-white p-3 rounded-btn border border-surface-border"><span className="font-bold text-text-secondary">Your Message: </span><span>"{negotiation.message}"</span></div>}
      </div>
    );
  }

  if (status === 'APPROVED' || negotiation.status === 'APPROVED') {
    return (
      <div className="bg-success-50 border border-success-100 rounded-card p-6 shadow-card space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-success-100 text-success-500 rounded-btn"><CheckCircle2 className="w-6 h-6" /></div>
            <div>
              <h3 className="text-base font-bold text-text-primary">✓ Negotiation Approved</h3>
              <p className="text-xs text-success-700 mt-0.5">The requested discount terms have been approved by sales management.</p>
            </div>
          </div>
          <StatusBadge status="APPROVED" />
        </div>
        <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-btn border border-surface-border">
          <div><span className="text-xs text-text-secondary font-semibold">Approved Discount</span><div className="text-xl font-bold text-success-500">{negotiation.approvedDiscount}%</div></div>
          <div><span className="text-xs text-text-secondary font-semibold">Final Status</span><div className="text-sm font-bold text-success-600 mt-1">Ready for Acceptance</div></div>
        </div>
        <button onClick={onAcceptQuotation} disabled={loading} className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-pill shadow-btn transition flex items-center justify-center space-x-2">
          <span>Accept Quotation</span><ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (status === 'REJECTED' || negotiation.status === 'REJECTED') {
    return (
      <div className="bg-danger-50 border border-danger-100 rounded-card p-6 shadow-card space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-danger-100 text-danger-500 rounded-btn"><XCircle className="w-6 h-6" /></div>
            <div>
              <h3 className="text-base font-bold text-text-primary">Negotiation Rejected</h3>
              <p className="text-xs text-danger-600 mt-0.5">The requested discount could not be approved by sales operations.</p>
            </div>
          </div>
          <StatusBadge status="REJECTED" />
        </div>
        <div className="bg-white p-4 rounded-btn border border-surface-border space-y-1">
          <span className="text-xs font-bold text-danger-500 uppercase tracking-wider">Rejection Reason</span>
          <p className="text-xs text-text-primary">"{negotiation.rejectionReason || 'Requested discount exceeds the allowed margin thresholds.'}"</p>
        </div>
        <button onClick={onRequestNewNegotiation} className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-text-primary font-medium rounded-pill border border-surface-border transition flex items-center justify-center space-x-2 text-xs">
          <RefreshCcw className="w-4 h-4" /><span>Request New Negotiation</span>
        </button>
      </div>
    );
  }

  return null;
}
