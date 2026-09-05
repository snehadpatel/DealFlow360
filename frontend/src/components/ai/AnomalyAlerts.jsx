import React from 'react';
import { AlertTriangle, AlertCircle, Info, ShieldAlert, Clock } from 'lucide-react';

export default function AnomalyAlerts({ anomalies = [] }) {
  if (!anomalies || anomalies.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center space-x-3 text-xs text-emerald-800">
        <Info className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>No pricing or deal velocity anomalies detected on this quote.</span>
      </div>
    );
  }

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-50 border-red-200 text-red-900',
          badge: 'bg-red-600 text-white',
          icon: ShieldAlert,
          iconColor: 'text-red-600',
        };
      case 'HIGH':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-900',
          badge: 'bg-rose-600 text-white',
          icon: AlertTriangle,
          iconColor: 'text-rose-600',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-900',
          badge: 'bg-amber-600 text-white',
          icon: AlertCircle,
          iconColor: 'text-amber-600',
        };
      default:
        return {
          bg: 'bg-blue-50 border-blue-200 text-blue-900',
          badge: 'bg-blue-600 text-white',
          icon: Info,
          iconColor: 'text-blue-600',
        };
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
          Deal Anomalies & Risk Triggers ({anomalies.length})
        </span>
        <span className="text-[10px] text-[#6B7280]">Statistical ML Model</span>
      </div>

      <div className="space-y-2.5">
        {anomalies.map((a, idx) => {
          const config = getSeverityStyle(a.severity);
          const Icon = config.icon;

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border ${config.bg} space-y-2 transition-all shadow-2xs`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon className={`w-4 h-4 ${config.iconColor}`} />
                  <span className="font-bold text-xs">{a.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {a.detectedAt && (
                    <span className="text-[10px] opacity-75 font-mono">
                      {a.detectedAt}
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${config.badge}`}
                  >
                    {a.severity}
                  </span>
                </div>
              </div>

              <p className="text-xs leading-relaxed opacity-95">
                {a.description}
              </p>

              {/* Statistical detail footer */}
              {(a.anomalousLine || a.stats) && (
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-current/10 text-[10px] opacity-80">
                  {a.anomalousLine && (
                    <span>
                      Line item: <strong>{a.anomalousLine}</strong>
                    </span>
                  )}
                  {a.stats?.z_score !== undefined && (
                    <span className="font-mono">
                      z-score: {Number(a.stats.z_score).toFixed(2)}
                    </span>
                  )}
                  {a.stats?.mean !== undefined && (
                    <span>
                      rep mean: {Number(a.stats.mean).toFixed(1)}%
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
