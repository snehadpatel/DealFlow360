import React, { useState, useEffect } from 'react';
import { getApprovalById, approveApproval, rejectApproval, requestApprovalChanges } from '../api/approvalApi';
import { ApprovalHeader, ApprovalStatusBanner } from '../components/approval/ApprovalHeader';
import QuotationSummary from '../components/approval/QuotationSummary';
import QuotationItemsTable from '../components/approval/QuotationItemsTable';
import DiscountAnalysis from '../components/approval/DiscountAnalysis';
import RiskScoreCard from '../components/approval/RiskScoreCard';
import AIRiskInsight from '../components/approval/AIRiskInsight';
import NegotiationDetails from '../components/approval/NegotiationDetails';
import ApprovalChain from '../components/approval/ApprovalChain';
import ApprovalConfirmationModal from '../components/approval/ApprovalConfirmationModal';

export default function ApprovalDetail({ approvalId, onBack }) {
  const [approval, setApproval] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null });

  const fetchApproval = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const data = await getApprovalById(approvalId);
      setApproval(data);
    } catch (err) {
      setError(err.message || 'Unable to load approval request.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (approvalId) fetchApproval();
  }, [approvalId]);

  const handleActionConfirm = async (comment) => {
    try {
      if (modalConfig.type === 'approve') {
        await approveApproval(approvalId, { comment });
      } else if (modalConfig.type === 'reject') {
        await rejectApproval(approvalId, { reason: comment });
      } else if (modalConfig.type === 'changes') {
        await requestApprovalChanges(approvalId, { comment });
      }
      setModalConfig({ isOpen: false, type: null });
      fetchApproval(true); // Refresh after action
    } catch (err) {
      alert(err.message || 'Action failed');
      throw err; // Let modal catch it
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-16 bg-white border border-gray-200 rounded-2xl" />
        <div className="h-32 bg-gray-100 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-white border border-gray-200 rounded-2xl" />
            <div className="h-64 bg-white border border-gray-200 rounded-2xl" />
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-white border border-gray-200 rounded-2xl" />
            <div className="h-48 bg-white border border-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto bg-white border border-gray-200 p-12 text-center rounded-2xl shadow-md space-y-4">
        <div className="w-16 h-16 mx-auto bg-danger-50 text-danger-500 rounded-full flex items-center justify-center text-2xl font-bold">!</div>
        <h2 className="text-xl font-bold text-textPrimary">Unable to load approval request</h2>
        <p className="text-sm text-textSecondary max-w-md mx-auto">{error}</p>
        <div className="flex items-center justify-center space-x-3 pt-4">
          <button onClick={onBack} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-textPrimary rounded-lg font-semibold text-sm transition">Go Back</button>
          <button onClick={() => fetchApproval(true)} className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-semibold text-sm shadow-btn transition">Retry</button>
        </div>
      </div>
    );
  }

  if (!approval) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <ApprovalHeader approval={approval} onBack={onBack} onRefresh={() => fetchApproval(true)} isRefreshing={refreshing} />
      
      {/* Banner */}
      <ApprovalStatusBanner approval={approval} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Quotation Details) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuotationSummary quotation={approval.quotation} />
            {approval.negotiation && (
              <NegotiationDetails negotiation={approval.negotiation} requestedDiscount={approval.requested_discount} />
            )}
          </div>
          
          <QuotationItemsTable items={approval.items} />
          <DiscountAnalysis analysis={approval.discount_analysis} />
        </div>

        {/* Right Column (Risk & Approvals) */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto pr-1 pb-4 custom-scrollbar">
          <RiskScoreCard risk={approval.risk} />
          <AIRiskInsight riskLevel={approval.risk?.level} />
          <ApprovalChain chain={approval.approval_chain} />
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      {approval.status === 'PENDING' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="hidden sm:block text-sm text-textSecondary font-medium">
              Reviewer: <span className="font-bold text-textPrimary">{approval.current_reviewer?.person || approval.current_reviewer?.role}</span>
            </div>
            <div className="flex space-x-3 w-full sm:w-auto">
              <button 
                onClick={() => setModalConfig({ isOpen: true, type: 'reject' })}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-danger-200 text-danger-600 hover:bg-danger-50 hover:border-danger-300 rounded-full text-sm font-bold transition"
              >
                Reject
              </button>
              <button 
                onClick={() => setModalConfig({ isOpen: true, type: 'changes' })}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-warning-300 text-warning-700 hover:bg-warning-50 hover:border-warning-400 rounded-full text-sm font-bold transition"
              >
                Request Changes
              </button>
              <button 
                onClick={() => setModalConfig({ isOpen: true, type: 'approve' })}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-full text-sm font-bold shadow-btn transition"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <ApprovalConfirmationModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ isOpen: false, type: null })}
        actionType={modalConfig.type}
        quotationId={approval.quotation?.id}
        discount={approval.requested_discount}
        riskLevel={approval.risk?.level}
        onConfirm={handleActionConfirm}
      />
    </div>
  );
}
