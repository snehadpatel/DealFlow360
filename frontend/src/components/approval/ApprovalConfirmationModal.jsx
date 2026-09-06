import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, MessageSquare } from 'lucide-react';

export default function ApprovalConfirmationModal({ isOpen, onClose, onConfirm, actionType, quotationId, discount, riskLevel }) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const config = {
    approve: {
      title: 'Approve this quotation?',
      icon: CheckCircle2,
      color: 'text-success-500',
      bg: 'bg-success-50',
      button: 'bg-success-500 hover:bg-success-600',
      buttonText: 'Confirm Approval',
      requireComment: false,
    },
    reject: {
      title: 'Reject Approval Request',
      icon: X,
      color: 'text-danger-500',
      bg: 'bg-danger-50',
      button: 'bg-danger-500 hover:bg-danger-600',
      buttonText: 'Confirm Rejection',
      requireComment: true,
    },
    changes: {
      title: 'Request Changes',
      icon: MessageSquare,
      color: 'text-warning-500',
      bg: 'bg-warning-50',
      button: 'bg-warning-500 hover:bg-warning-600 text-white',
      buttonText: 'Submit Request',
      requireComment: true,
    }
  }[actionType];

  const Icon = config.icon;
  const isSubmitDisabled = isSubmitting || (config.requireComment && comment.trim().length === 0);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(comment);
      // Wait for parent to close modal
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <button type="button" aria-label="Close modal" className="absolute inset-0 bg-black/40 backdrop-blur-sm w-full cursor-default" onClick={!isSubmitting ? onClose : undefined} />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-md w-full max-w-md mx-4 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${config.bg} ${config.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <h2 className="text-base font-extrabold text-textPrimary">{config.title}</h2>
          </div>
          <button 
            aria-label="Close modal"
            onClick={onClose} 
            disabled={isSubmitting}
            className="text-textSecondary hover:text-textPrimary p-1 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {actionType === 'approve' && (
            <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-textSecondary">You are approving:</span>
                <span className="font-bold text-textPrimary">{quotationId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textSecondary">Requested Discount:</span>
                <span className="font-bold text-textPrimary">{discount}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textSecondary">Risk:</span>
                <span className={`font-bold ${riskLevel === 'HIGH' ? 'text-danger-500' : riskLevel === 'MEDIUM' ? 'text-warning-500' : 'text-success-500'}`}>
                  {riskLevel}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="approval-comment" className="text-xs font-bold text-textPrimary uppercase tracking-wider flex justify-between">
              <span>{actionType === 'approve' ? 'Comment (Optional)' : 'Reason / Comment'}</span>
              {config.requireComment && <span className="text-danger-500">*Required</span>}
            </label>
            <textarea
              id="approval-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isSubmitting}
              placeholder={actionType === 'approve' ? "Add any notes for the sales rep..." : "Please explain the reason..."}
              className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm text-textPrimary placeholder-text-secondary focus:outline-none focus:border-primary-500 transition resize-none h-24 disabled:bg-gray-50"
            />
          </div>

          {actionType === 'approve' && riskLevel === 'HIGH' && (
            <div className="flex items-start space-x-2 text-danger-600 bg-danger-50 border border-danger-100 rounded-lg p-3 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>You are about to approve a HIGH RISK deal. Please ensure all factors have been reviewed.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-textPrimary rounded-full text-sm font-semibold transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={`px-5 py-2 text-white rounded-full text-sm font-semibold shadow-btn transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${config.button}`}
          >
            {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            <span>{isSubmitting ? 'Processing...' : config.buttonText}</span>
          </button>
        </div>
        
      </div>
    </div>
  );
}
