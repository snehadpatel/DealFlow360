import React from 'react';
import { Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

const statusConfig = {
  PENDING: { style: 'bg-warning-50 text-warning-700 border-warning-100', label: 'Pending', icon: Clock },
  APPROVED: { style: 'bg-success-50 text-success-700 border-success-100', label: 'Approved', icon: CheckCircle2 },
  REJECTED: { style: 'bg-danger-50 text-danger-500 border-danger-100', label: 'Rejected', icon: XCircle },
  CHANGES_REQUESTED: { style: 'bg-purple-50 text-purple-600 border-purple-200', label: 'Changes Requested', icon: RefreshCw },
};

export default function StatusBadge({ status, className = '' }) {
  const norm = (status || '').toUpperCase();
  const config = statusConfig[norm] || { style: 'bg-gray-100 text-gray-600 border-gray-200', label: status || 'Unknown', icon: Clock };
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-pill text-xs font-semibold border ${config.style} ${className}`}>
      <Icon className="w-3.5 h-3.5 flex-shrink-0" /><span>{config.label}</span>
    </span>
  );
}
