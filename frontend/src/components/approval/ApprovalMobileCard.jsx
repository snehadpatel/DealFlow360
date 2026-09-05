import React from 'react';
import StatusBadge from './StatusBadge';
import RiskBadge from './RiskBadge';
import { ArrowRight, User, Building2 } from 'lucide-react';

export default function ApprovalMobileCard({ item, onReview }) {
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  const formattedDate = new Date(item.submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="bg-white border border-surface-border rounded-card p-5 shadow-card space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-text-secondary uppercase">Approval Request</span>
          <h3 className="text-base font-extrabold text-text-primary leading-tight mt-0.5">{item.id}</h3>
          <span className="text-xs font-semibold text-primary-500">Quote {item.quotation_id}</span>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-btn border border-surface-border text-xs">
        <div><div className="text-text-secondary flex items-center space-x-1"><Building2 className="w-3.5 h-3.5" /><span>Customer</span></div><div className="font-bold text-text-primary mt-1 truncate">{item.customer_name}</div></div>
        <div><div className="text-text-secondary flex items-center space-x-1"><User className="w-3.5 h-3.5" /><span>Sales Rep</span></div><div className="font-semibold text-text-primary mt-1 truncate">{item.sales_rep_name}</div></div>
        <div><div className="text-text-secondary">Total Value</div><div className="font-extrabold text-primary-500 mt-0.5">{formatCurrency(item.total_value)}</div></div>
        <div><div className="text-text-secondary">Requested Discount</div><div className="font-bold text-warning-600 mt-0.5">{item.discount}%</div></div>
      </div>
      <div className="flex items-center justify-between pt-1">
        <RiskBadge riskScore={item.risk_score} riskLevel={item.risk_level} />
        <span className="text-[11px] text-text-secondary font-medium">{formattedDate}</span>
      </div>
      <button onClick={() => onReview(item.id)} className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-pill text-xs font-bold shadow-btn transition flex items-center justify-center space-x-1.5">
        <span>Review Approval</span><ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
