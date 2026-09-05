import React, { useState } from 'react';
import AIInsightCard from '../components/ai/AIInsightCard';
import DealHealthCard from '../components/ai/DealHealthCard';
import AnomalyAlerts from '../components/ai/AnomalyAlerts';
import { Activity, ShieldAlert, Sparkles, Filter, RefreshCw, TrendingUp } from 'lucide-react';

export default function DealHealthDashboard() {
  const [selectedDealId, setSelectedDealId] = useState('Q-1042');
  const [refreshKey, setRefreshKey] = useState(0);

  const activeDeals = [
    { id: 'Q-1042', customer: 'Acme Corporation', value: '₹5,59,320', risk: 'HIGH', health: 41, status: 'PENDING_APPROVAL' },
    { id: 'Q-1045', customer: 'Starlight Tech', value: '₹8,49,600', risk: 'MEDIUM', health: 68, status: 'COUNTER_OFFER' },
    { id: 'Q-1048', customer: 'Quantum BioLabs', value: '₹3,81,140', risk: 'LOW', health: 88, status: 'APPROVED' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-[#1F2937] tracking-tight">
              Deal Health & Risk Intelligence
            </h1>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-[#FEECE8] text-[#F26C4F] rounded-full border border-[#F26C4F]/30">
              Screen 10
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-1">
            Real-time statistical anomaly detection, blended discount risk scoring, and AI deal health analytics.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-[#E5E7EB] text-[#1F2937] rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* Deal Selector Strip */}
      <div className="bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-xs space-y-3">
        <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block">
          Select Deal for Deep AI Inspection:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {activeDeals.map((deal) => {
            const isSelected = selectedDealId === deal.id;
            return (
              <button
                key={deal.id}
                onClick={() => setSelectedDealId(deal.id)}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-[#F26C4F] bg-[#FEECE8]/30 ring-2 ring-[#F26C4F]/20'
                    : 'border-[#E5E7EB] hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-bold text-xs text-[#1F2937]">{deal.customer}</div>
                  <div className="text-[10px] text-[#6B7280] font-mono mt-0.5">
                    {deal.id} • {deal.value}
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      deal.risk === 'HIGH'
                        ? 'bg-rose-50 text-rose-700'
                        : deal.risk === 'MEDIUM'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {deal.risk} Risk
                  </span>
                  <div className="text-[10px] text-[#6B7280] mt-0.5">
                    Health: <strong>{deal.health}/100</strong>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Unified AI Insight Card (Screen 10) */}
      <AIInsightCard
        key={`${selectedDealId}-${refreshKey}`}
        dealId={selectedDealId}
        quotationId={selectedDealId}
        onActionClick={(action) => alert(`Executed AI recommended action: ${action}`)}
      />
    </div>
  );
}
