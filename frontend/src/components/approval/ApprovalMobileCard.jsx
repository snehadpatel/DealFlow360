import React from 'react';
import StatusBadge from './StatusBadge';
import RiskBadge from './RiskBadge';
import { ArrowRight, User, Building2 } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const formatCurrency = (val) => currencyFormatter.format(val || 0);

export default function ApprovalMobileCard({ item, onReview }) {
  const formattedDate = new Date(item.submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-md space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-textSecondary uppercase">Approval Request</span>
          <h3 className="text-base font-extrabold text-textPrimary leading-tight mt-0.5">{item.id}</h3>
          <span className="text-xs font-semibold text-brand-500">Quote {item.quotation_id}</span>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-lg border border-gray-200 text-xs">
        <div><div className="text-textSecondary flex items-center space-x-1"><Building2 className="w-3.5 h-3.5" /><span>Customer</span></div><div className="font-bold text-textPrimary mt-1 truncate">{item.customer_name}</div></div>
        <div><div className="text-textSecondary flex items-center space-x-1"><User className="w-3.5 h-3.5" /><span>Sales Rep</span></div><div className="font-semibold text-textPrimary mt-1 truncate">{item.sales_rep_name}</div></div>
        <div><div className="text-textSecondary">Total Value</div><div className="font-extrabold text-brand-500 mt-0.5">{formatCurrency(item.total_value)}</div></div>
        <div><div className="text-textSecondary">Requested Discount</div><div className="font-bold text-warning-600 mt-0.5">{item.discount}%</div></div>
      </div>
      <div className="flex items-center justify-between pt-1">
        <RiskBadge riskScore={item.risk_score} riskLevel={item.risk_level} />
        <span className="text-[11px] text-textSecondary font-medium">{formattedDate}</span>
      </div>
      <button onClick={() => onReview(item.id)} className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-full text-xs font-bold shadow-btn transition flex items-center justify-center space-x-1.5">
        <span>Review Approval</span><ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
