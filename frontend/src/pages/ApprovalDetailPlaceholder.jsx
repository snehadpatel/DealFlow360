import React, { useEffect, useState } from 'react';
import { getApprovalById } from '../api/approvalApi';
import StatusBadge from '../components/approval/StatusBadge';
import RiskBadge from '../components/approval/RiskBadge';
import { ArrowLeft } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const formatCurrency = (val) => currencyFormatter.format(val || 0);

export default function ApprovalDetailPlaceholder({ approvalId, onBack }) {
  const [approval, setApproval] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (approvalId) getApprovalById(approvalId).then(setApproval).catch(() => setApproval(null)).finally(() => setLoading(false)); }, [approvalId]);


  if (loading) return <div className="space-y-6 animate-pulse max-w-4xl mx-auto"><div className="h-8 bg-gray-200 rounded w-32" /><div className="h-48 bg-white border border-gray-200 rounded-2xl" /></div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <button onClick={onBack} className="inline-flex items-center space-x-2 px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-textSecondary rounded-lg text-xs font-semibold transition"><ArrowLeft className="w-4 h-4" /><span>Back to Approval List</span></button>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <div className="flex items-center space-x-3"><h1 className="text-2xl font-extrabold text-textPrimary">Approval Request {approvalId}</h1>{approval && <StatusBadge status={approval.status} />}</div>
            <p className="text-xs text-brand-500 font-semibold mt-1">Screen 3 — Approval Detail Route Placeholder</p>
          </div>
          {approval && <RiskBadge riskScore={approval.risk_score} riskLevel={approval.risk_level} />}
        </div>
        {approval ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              {[{ label: 'Quotation Ref', val: approval.quotation_id, primary: true }, { label: 'Customer', val: approval.customer_name, bold: true }, { label: 'Sales Representative', val: approval.sales_rep_name }, { label: 'Total Deal Value', val: formatCurrency(approval.total_value), bold: true }].map((d, i) => (
                <div key={i} className="bg-gray-50 p-3.5 rounded-lg border border-gray-200"><span className="text-textSecondary font-medium">{d.label}</span><div className={`text-sm mt-0.5 ${d.primary ? 'font-bold text-brand-500' : d.bold ? 'font-bold text-textPrimary' : 'font-semibold text-textPrimary'}`}>{d.val}</div></div>
              ))}
            </div>
            <div className="bg-warning-50 p-4 rounded-lg border border-warning-100 space-y-2"><span className="text-xs font-bold text-warning-700 uppercase tracking-wider">Approval Reason / Message</span><p className="text-sm text-textPrimary">"{approval.reason || 'Requested discount exceeds standard rep threshold.'}"</p></div>
            <div className="border-t border-gray-200 pt-4 flex items-center justify-between"><span className="text-xs text-textSecondary">Full Approval Detail evaluation screen will be built in Screen 3 task.</span><button onClick={onBack} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-textPrimary rounded-lg text-xs font-semibold">Return to Queue</button></div>
          </div>
        ) : <div className="text-textSecondary text-sm py-4">Approval details for {approvalId} placeholder.</div>}
      </div>
    </div>
  );
}
