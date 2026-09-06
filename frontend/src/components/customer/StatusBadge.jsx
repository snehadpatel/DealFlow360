import React from 'react';

const statusStyles = {
  DRAFT: 'bg-gray-100 text-gray-600 border-gray-200',
  SENT: 'bg-blue-50 text-blue-600 border-blue-200',
  NEGOTIATION: 'bg-warning-50 text-warning-700 border-warning-100',
  PENDING: 'bg-warning-50 text-warning-700 border-warning-100',
  PENDING_APPROVAL: 'bg-amber-50 text-amber-700 border-amber-200',
  APPROVED: 'bg-success-50 text-success-700 border-success-100',
  REJECTED: 'bg-danger-50 text-danger-500 border-danger-100',
  COUNTER_OFFER: 'bg-purple-50 text-purple-600 border-purple-200',
  CONFIRMED: 'bg-success-50 text-success-700 border-success-100',
  COMPLETED: 'bg-blue-50 text-blue-600 border-blue-200',
  EXPIRED: 'bg-gray-100 text-gray-500 border-gray-200',
  UNPAID: 'bg-danger-50 text-danger-500 border-danger-100',
  PAID: 'bg-success-50 text-success-700 border-success-100',
  ACTIVE: 'bg-success-50 text-success-700 border-success-100',
};

const statusLabels = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  NEGOTIATION: 'Negotiation',
  PENDING: 'Pending',
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  COUNTER_OFFER: 'Counter Offer',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  EXPIRED: 'Expired',
  UNPAID: 'Unpaid',
  PAID: 'Paid',
  ACTIVE: 'Active',
};

export default function StatusBadge({ status, customLabel, className = '' }) {
  const normalizedStatus = (status || '').toUpperCase();
  const style = statusStyles[normalizedStatus] || 'bg-gray-100 text-gray-600 border-gray-200';
  const label = customLabel || statusLabels[normalizedStatus] || status;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {label}
    </span>
  );
}
