import React from 'react';
import { Tag, TrendingDown, Users, Shield } from 'lucide-react';

export default function RiskFactors({ factors = [] }) {
  const defaultFactors = [
    { name: 'discount_risk', label: 'Discount Risk', level: 'HIGH', description: 'Discount exceeds category ceiling' },
    { name: 'margin_risk', label: 'Margin Risk', level: 'MEDIUM', description: 'Margin within secondary band' },
    { name: 'customer_risk', label: 'Customer Risk', level: 'LOW', description: 'Verified customer account tier' },
    { name: 'approval_risk', label: 'Approval Risk', level: 'HIGH', description: 'Manager & Finance escalation' },
  ];

  const items = factors.length > 0 ? factors : defaultFactors;

  const getIcon = (name) => {
    switch (name) {
      case 'discount_risk':
        return Tag;
      case 'margin_risk':
        return TrendingDown;
      case 'customer_risk':
        return Users;
      default:
        return Shield;
    }
  };

  const getBadgeStyle = (level) => {
    switch (level) {
      case 'LOW':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'MEDIUM':
      case 'MODERATE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'HIGH':
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
          Risk Factors Breakdown
        </span>
        <span className="text-[10px] text-[#6B7280]">Backend Policy Engine</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {items.map((factor, idx) => {
          const Icon = getIcon(factor.name);
          return (
            <div
              key={factor.name || idx}
              className="bg-[#F4F5F7]/80 border border-slate-200/70 p-3 rounded-xl flex flex-col justify-between space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Icon className="w-3.5 h-3.5 text-[#6B7280]" />
                  <span className="font-bold text-xs text-[#1F2937]">
                    {factor.label || factor.name}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getBadgeStyle(
                    factor.level
                  )}`}
                >
                  {factor.level}
                </span>
              </div>

              {factor.description && (
                <p className="text-[11px] text-[#6B7280] leading-snug line-clamp-2">
                  {factor.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
