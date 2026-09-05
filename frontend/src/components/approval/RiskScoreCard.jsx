import React from 'react';
import { ShieldAlert, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export default function RiskScoreCard({ risk }) {
  if (!risk) return null;

  const getRiskConfig = () => {
    switch (risk.level) {
      case 'HIGH':
        return { color: 'text-danger-600', bg: 'bg-danger-50', border: 'border-danger-200', icon: ShieldAlert, bar: 'bg-danger-500' };
      case 'MEDIUM':
        return { color: 'text-warning-600', bg: 'bg-warning-50', border: 'border-warning-200', icon: AlertTriangle, bar: 'bg-warning-500' };
      default:
        return { color: 'text-success-600', bg: 'bg-success-50', border: 'border-success-200', icon: AlertCircle, bar: 'bg-success-500' };
    }
  };

  const config = getRiskConfig();
  const Icon = config.icon;

  return (
    <div className={`border ${config.border} rounded-2xl p-6 shadow-sm relative overflow-hidden bg-white`}>
      {/* Background Graphic */}
      <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full ${config.bg} opacity-50 flex items-center justify-center`}>
        <Icon className={`w-12 h-12 ${config.color} opacity-20`} />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <h3 className="text-xs font-bold uppercase tracking-widest text-textSecondary mb-2">
          Blended Discount Risk Score
        </h3>
        
        <div className="flex flex-col items-center my-4">
          <div className="flex items-end space-x-1">
            <span className={`text-5xl font-extrabold ${config.color} tracking-tighter`}>{risk.score}</span>
            <span className="text-xl font-bold text-gray-400 mb-1">/ 100</span>
          </div>
          <div className={`mt-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest ${config.bg} ${config.color} shadow-sm border ${config.border}`}>
            {risk.level} RISK
          </div>
        </div>

        {/* Risk Bar */}
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden my-4">
          <div className={`h-full ${config.bar}`} style={{ width: `${risk.score}%` }} />
        </div>

        {/* Risk Factors */}
        {risk.factors && risk.factors.length > 0 && (
          <div className="w-full mt-4 text-left border-t border-gray-200 pt-4">
            <div className="flex items-center space-x-1.5 mb-3 text-textPrimary">
              <Info className="w-4 h-4 text-textSecondary" />
              <span className="text-xs font-bold uppercase tracking-wider">Risk Factors:</span>
            </div>
            <ul className="space-y-2">
              {risk.factors.map((factor, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-sm text-textSecondary">
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${config.bar}`} />
                  <span className="leading-snug">{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
