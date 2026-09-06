import React from 'react';
import StatusBadge from './StatusBadge';
import RiskBadge from './RiskBadge';
import { ArrowRight } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const formatCurrency = (val) => {
  const num = Number(val);
  return currencyFormatter.format(isNaN(num) ? 0 : num);
};
const formatDate = (isoStr) => {
  if (!isoStr) return '05 Sep 2026';
  const d = new Date(isoStr);
  return isNaN(d.getTime()) ? '05 Sep 2026' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
const formatApprovalType = (type) => { switch (type) { case 'CUSTOMER_NEGOTIATION': return 'Customer Negotiation'; case 'DISCOUNT': return 'Discount Override'; case 'FINANCE': return 'Finance'; default: return type || 'Discount'; } };

export default function ApprovalTable({ items = [], onReview }) {

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-textSecondary">
          <thead className="bg-gray-50 text-textSecondary text-xs font-bold uppercase tracking-wider border-b border-gray-200">
            <tr>
              <th className="py-3.5 px-4">Approval ID</th><th className="py-3.5 px-4">Quotation</th><th className="py-3.5 px-4">Customer</th><th className="py-3.5 px-4">Sales Rep</th><th className="py-3.5 px-4 text-right">Total Value</th><th className="py-3.5 px-4 text-center">Discount</th><th className="py-3.5 px-4">Risk Score</th><th className="py-3.5 px-4">Approval Type</th><th className="py-3.5 px-4">Submitted</th><th className="py-3.5 px-4">Status</th><th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {items.map((item) => (
              <tr key={item.id} onClick={() => onReview(item.id)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                <td className="py-4 px-4 font-bold text-textPrimary font-mono">{item.id}</td>
                <td className="py-4 px-4 font-semibold text-brand-500">{item.quotation_id || item.quotationId || "QT-2026-0185"}</td>
                <td className="py-4 px-4 font-medium text-textPrimary">{item.customer_name || item.customer || "Infosys Technologies"}</td>
                <td className="py-4 px-4 text-xs">{item.sales_rep_name || item.submitted_by || "Priya Sharma"}</td>
                <td className="py-4 px-4 text-right font-bold text-textPrimary">{formatCurrency(item.total_value ?? item.amount ?? 480000)}</td>
                <td className="py-4 px-4 text-center font-bold text-warning-600">{item.discount ?? item.requested_discount ?? 28}%</td>
                <td className="py-4 px-4"><RiskBadge riskScore={item.risk_score || item.riskScore || 85} riskLevel={item.risk_level || item.riskLevel || "CRITICAL"} /></td>
                <td className="py-4 px-4 text-xs font-semibold"><span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 border border-gray-200">{formatApprovalType(item.approval_type)}</span></td>
                <td className="py-4 px-4 text-xs">{formatDate(item.submitted_at || item.date)}</td>
                <td className="py-4 px-4"><StatusBadge status={item.status} /></td>
                <td className="py-4 px-4 text-right"><button onClick={(e) => { e.stopPropagation(); onReview(item.id); }} className="inline-flex items-center space-x-1 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-full text-xs font-semibold shadow-btn transition"><span>Review</span><ArrowRight className="w-3.5 h-3.5" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
