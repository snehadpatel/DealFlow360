import React from 'react';

export default function DealHealthDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Deal Health Dashboard</h1>
        <p className="text-sm text-slate-400">Real-time anomaly detection and AI-narrated stalled deal intelligence.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Stalled Deals Flagged</h2>
          <div className="p-4 rounded-lg bg-rose-950/30 border border-rose-900/50 text-rose-300 text-sm">
            <div className="font-bold">BioTech Lab Systems (Quote #Q-9012)</div>
            <p className="text-xs text-rose-400/80 mt-1">
              Stalled in Pending Manager state for 72+ hours without approval action.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">AI Anomaly Narrative</h2>
            <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 rounded font-semibold">Gemini</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-4 rounded-lg border border-slate-700">
            "Deal Q-9012 is stalling because the requested 22% discount on Optical Sensors is 4% above the Silver tier ceiling. 
            Recommendation: Propose a 15% discount bundled with a 2-year maintenance SLA to preserve target margin."
          </p>
        </div>
      </div>
    </div>
  );
}
