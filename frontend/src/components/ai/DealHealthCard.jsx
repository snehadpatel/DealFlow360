import React from 'react';
import { Activity, TrendingUp, CheckCircle2, AlertCircle, AlertTriangle, Shield } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});
const formatCurrency = (val) => currencyFormatter.format(val || 0);

export default function DealHealthCard({ health }) {

  if (!health) return null;

  const score = Math.round(health.overallScore ?? health.score ?? 70);
  const band = health.band || (score >= 75 ? 'GREEN' : score >= 50 ? 'AMBER' : 'RED');

  const bandStyles = {
    GREEN: {
      color: 'text-emerald-600',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      bar: 'bg-emerald-500',
      label: 'Healthy Deal',
      icon: CheckCircle2,
    },
    AMBER: {
      color: 'text-amber-600',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      bar: 'bg-amber-500',
      label: 'Needs Attention',
      icon: AlertTriangle,
    },
    RED: {
      color: 'text-rose-600',
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      bar: 'bg-rose-500',
      label: 'Critical Risk',
      icon: AlertCircle,
    },
  };

  const currentBand = bandStyles[band] || bandStyles.AMBER;
  const BandIcon = currentBand.icon;

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB]/60 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-slate-100 text-[#1F2937]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1F2937]">Deal Health Index</h3>
            <p className="text-[11px] text-[#6B7280]">
              Multi-factor statistical score (0–100)
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${currentBand.badge}`}
        >
          <BandIcon className="w-3 h-3" />
          <span>{currentBand.label}</span>
        </span>
      </div>

      {/* Main Score & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#F4F5F7] p-3.5 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider">
            Overall Health
          </span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className={`text-3xl font-extrabold tracking-tight ${currentBand.color}`}>
              {score}
            </span>
            <span className="text-xs text-[#6B7280]">/ 100</span>
          </div>
        </div>

        {health.winProbability !== undefined && (
          <div className="bg-[#F4F5F7] p-3.5 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider">
              Win Probability
            </span>
            <div className="mt-2 flex items-baseline space-x-1.5">
              <span className="text-2xl font-extrabold text-[#1F2937]">
                {health.winProbability}%
              </span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>
        )}

        {health.expectedValue !== undefined && (
          <div className="bg-[#F4F5F7] p-3.5 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider">
              Expected Pipeline Value
            </span>
            <div className="mt-2">
              <span className="text-lg font-bold text-[#1F2937]">
                {formatCurrency(health.expectedValue)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Feature contribution breakdown */}
      {health.features && health.features.length > 0 && (
        <div className="space-y-2.5 pt-2 border-t border-[#E5E7EB]/60">
          <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block">
            Transparent Feature Contributions
          </span>

          <div className="space-y-2">
            {health.features.map((f, idx) => (
              <div key={f.name || idx} className="text-xs space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-[#1F2937] capitalize">
                    {f.name.replace(/_/g, ' ')}
                  </span>
                  <span className="font-mono text-[#6B7280]">
                    Score: {f.score}/100 • Weight: {Math.round(f.weight * 100)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#F26C4F] rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, f.score))}%` }}
                  />
                </div>
                {f.detail && (
                  <span className="text-[10px] text-[#6B7280] block">
                    {f.detail}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
