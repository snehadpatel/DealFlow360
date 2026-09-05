import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Send, FileEdit } from 'lucide-react';

export default function InvoiceStatusBadge({ status, size = 'normal' }) {
  const config = {
    DRAFT: {
      label: 'Draft',
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: FileEdit,
    },
    SENT: {
      label: 'Sent',
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Send,
    },
    PENDING: {
      label: 'Pending',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Clock,
    },
    PARTIALLY_PAID: {
      label: 'Partially Paid',
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: Clock,
    },
    PAID: {
      label: 'Paid',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
    },
    OVERDUE: {
      label: 'Overdue',
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: AlertTriangle,
    },
    CANCELLED: {
      label: 'Cancelled',
      bg: 'bg-gray-100 text-gray-500 border-gray-200',
      icon: XCircle,
    },
  };

  const item = config[status] || {
    label: status || 'Unknown',
    bg: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: Clock,
  };

  const Icon = item.icon;
  const sizeClasses = size === 'small' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center space-x-1 font-semibold rounded-full border ${item.bg} ${sizeClasses}`}
    >
      <Icon className="w-3 h-3" />
      <span>{item.label}</span>
    </span>
  );
}
