import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function RiskScoreCard({ riskScore = 64, riskLevel = 'MEDIUM' }) {
  const normalizedScore = Math.min(100, Math.max(0, riskScore));

  const levelConfigs = {
    LOW: {
      label: 'Low Risk',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      barColor: 'bg-emerald-500',
      icon: ShieldCheck,
      desc: 'Deal parameters comply fully with standard pricing guidelines.',
    },
    MEDIUM: {
      label: 'Medium Risk',
      color: 'text-amber-600',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      barColor: 'bg-amber-500',
      icon: AlertTriangle,
      desc: 'Elevated discount or margin variance. Manager sign-off required.',
    },
    MODERATE: {
      label: 'Moderate Risk',
      color: 'text-amber-600',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      barColor: 'bg-amber-500',
      icon: AlertTriangle,
      desc: 'Elevated discount or margin variance. Manager sign-off required.',
    },
    HIGH: {
      label: 'High Risk',
      color: 'text-rose-600',
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      barColor: 'bg-rose-500',
      icon: ShieldAlert,
      desc: 'Significant discount overage. Requires Finance VP sign-off.',
    },
    CRITICAL: {
      label: 'Critical Risk',
      color: 'text-red-700',
      bg: 'bg-red-100 text-red-800 border-red-300',
      barColor: 'bg-red-600',
      icon: ShieldAlert,
      desc: 'Margin floor violation. Executive approval mandatory.',
    },
  };

  const current = levelConfigs[riskLevel] || levelConfigs.MEDIUM;
  const Icon = current.icon;

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
          Blended Risk Score
        </span>
        <span
          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${current.bg}`}
        >
          <Icon className="w-3 h-3" />
          <span>{current.label}</span>
        </span>
      </div>

      <div className="flex items-baseline space-x-3">
        <span className={`text-4xl font-extrabold tracking-tight ${current.color}`}>
          {normalizedScore}
        </span>
        <span className="text-xs text-[#6B7280] font-medium">/ 100 Risk Index</span>
      </div>

      {/* Progress Gauge Bar */}
      <div className="space-y-1.5">
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${current.barColor}`}
            style={{ width: `${normalizedScore}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-[#6B7280] font-mono">
          <span>0 (Low)</span>
          <span>50 (Moderate)</span>
          <span>100 (Critical)</span>
        </div>
      </div>

      <p className="text-xs text-[#6B7280] leading-relaxed pt-1 border-t border-[#E5E7EB]/60">
        {current.desc}
      </p>
    </div>
  );
}
