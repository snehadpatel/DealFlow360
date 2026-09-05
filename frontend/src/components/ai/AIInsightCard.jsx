import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDealInsight } from '../../api/aiInsightApi';
import RiskScoreCard from './RiskScoreCard';
import RiskFactors from './RiskFactors';
import AnomalyAlerts from './AnomalyAlerts';
import AIRecommendationAction from './AIRecommendationAction';
import DealHealthCard from './DealHealthCard';
import {
  Sparkles,
  Bot,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Info,
} from 'lucide-react';

export default function AIInsightCard({
  dealId,
  quotationId,
  onActionClick,
  className = '',
  hideHealth = false,
}) {
  const { user } = useAuth();
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(true);

  const fetchInsight = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDealInsight(dealId, quotationId);
      setInsight(data);
    } catch (err) {
      setError('AI insights are temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight();
  }, [dealId, quotationId]);

  // Security Check: Customer users must NOT see internal risk score & deal anomalies
  if (user?.role === 'CUSTOMER') {
    return null;
  }

  if (loading) {
    return (
      <div className={`bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs animate-pulse space-y-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-200 rounded-xl" />
          <div className="h-4 bg-slate-200 rounded w-1/3" />
        </div>
        <div className="h-24 bg-slate-100 rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 bg-slate-100 rounded-xl" />
          <div className="h-20 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error && !insight) {
    return (
      <div className={`bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs text-center space-y-3 ${className}`}>
        <div className="flex items-center justify-center space-x-2 text-rose-700 text-xs font-semibold">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
        <button
          onClick={fetchInsight}
          className="px-3 py-1.5 bg-[#F26C4F] hover:bg-[#E0583B] text-white text-xs font-semibold rounded-xl transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main AI Deal Insight Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB]/60 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#FEECE8] text-[#F26C4F]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-[#1F2937]">AI Deal Insight</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#FEECE8] text-[#F26C4F] rounded-full border border-[#F26C4F]/30">
                  Governance Engine
                </span>
              </div>
              <p className="text-xs text-[#6B7280]">
                Autonomous risk assessment and pricing policy analysis
              </p>
            </div>
          </div>

          <button
            onClick={fetchInsight}
            className="p-1.5 rounded-lg border border-[#E5E7EB] hover:bg-slate-50 text-[#6B7280] transition"
            title="Refresh Insight"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* AI Analysis Narrative Section */}
        <div className="bg-[#F4F5F7] border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
          <button
            onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center space-x-2">
              <Bot className="w-4 h-4 text-[#F26C4F]" />
              <span className="text-xs font-bold text-[#1F2937] uppercase tracking-wider">
                AI Narrative Analysis
              </span>
            </div>
            {isAnalysisExpanded ? (
              <ChevronUp className="w-4 h-4 text-[#6B7280]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#6B7280]" />
            )}
          </button>

          {isAnalysisExpanded && (
            <p className="text-xs text-[#1F2937] leading-relaxed pt-2 border-t border-slate-200/80">
              {insight.aiSummary || insight.narrative}
            </p>
          )}
        </div>

        {/* Risk Score & Factors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RiskScoreCard
            riskScore={insight.riskScore}
            riskLevel={insight.riskLevel}
          />
          <RiskFactors factors={insight.riskFactors} />
        </div>

        {/* Recommended Action */}
        <AIRecommendationAction
          action={insight.recommendedAction}
          onActionClick={onActionClick}
        />

        {/* Anomalies List */}
        <AnomalyAlerts anomalies={insight.anomalies} />
      </div>

      {/* Deal Health Card (Optional / Modular) */}
      {!hideHealth && insight.health && (
        <DealHealthCard health={insight.health} />
      )}
    </div>
  );
}
