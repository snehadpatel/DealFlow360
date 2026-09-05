import React from 'react';
import { AlertTriangle, AlertCircle, ShieldCheck } from 'lucide-react';

const riskStyles = {
  HIGH: { badge: 'bg-danger-50 text-danger-500 border-danger-100', icon: AlertTriangle },
  MEDIUM: { badge: 'bg-warning-50 text-warning-700 border-warning-100', icon: AlertCircle },
  LOW: { badge: 'bg-success-50 text-success-700 border-success-100', icon: ShieldCheck },
};

export default function RiskBadge({ riskScore, riskLevel, className = '' }) {
  const level = (riskLevel || 'LOW').toUpperCase();
  const config = riskStyles[level] || riskStyles.LOW;
  const Icon = config.icon;
  return (
    <div className={`inline-flex items-center space-x-2 px-2.5 py-1 rounded-pill border text-xs font-semibold ${config.badge} ${className}`}>
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <div className="flex items-center space-x-1"><span className="font-extrabold font-mono">{riskScore}</span><span className="text-[10px] opacity-70">/100</span></div>
      <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-black/5">{level}</span>
    </div>
  );
}
