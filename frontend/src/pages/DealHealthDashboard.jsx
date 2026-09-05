import React, { useState, useEffect } from 'react';
import AIInsightCard from '../components/ai/AIInsightCard';
import apiClient from '../api/client';
import { Activity, ShieldAlert, Sparkles, Filter, RefreshCw, TrendingUp } from 'lucide-react';

export default function DealHealthDashboard() {
  const [selectedDealId, setSelectedDealId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeDeals, setActiveDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      try {
        const quotes = await apiClient.get('/quotes');
        const list = Array.isArray(quotes) ? quotes : [];

        // Pick top deals with risk data
        const deals = list
          .filter(q => q.blended_risk > 0 || q.risk_level)
          .slice(0, 10)
          .map(q => ({
            id: q.id,
            customer: q.customer_name || 'Enterprise Client',
            value: `₹${(q.total || 0).toLocaleString('en-IN')}`,
            risk: q.risk_level || 'LOW',
            health: Math.max(0, Math.min(100, Math.round(100 - (q.blended_risk || 0)))),
            status: q.status || 'DRAFT',
          }));

        setActiveDeals(deals);
        if (deals.length > 0 && !selectedDealId) {
          setSelectedDealId(deals[0].id);
        }
      } catch (err) {
        console.error('Failed to load deals for health dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, [refreshKey]);

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
              AI Analytics
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
        {loading ? (
          <p className="text-xs text-[#6B7280]">Loading deals from database...</p>
        ) : activeDeals.length === 0 ? (
          <p className="text-xs text-[#6B7280]">No deals found in the database.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {activeDeals.slice(0, 6).map((deal) => {
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
                      {String(deal.id).slice(0, 8)} • {deal.value}
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
        )}
      </div>

      {/* Unified AI Insight Card */}
      {selectedDealId && (
        <AIInsightCard
          key={`${selectedDealId}-${refreshKey}`}
          dealId={selectedDealId}
          quotationId={selectedDealId}
          onActionClick={(action) => alert(`Executed AI recommended action: ${action}`)}
        />
      )}
    </div>
  );
}
