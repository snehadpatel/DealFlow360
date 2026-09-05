import React, { useState, useEffect } from 'react';
import { getQuotationRecommendations, dismissRecommendation } from '../../api/aiRecommendationApi';
import AIRecommendationCard from './AIRecommendationCard';
import { Sparkles, RefreshCw, AlertCircle, Bot, Layers, Info } from 'lucide-react';

export default function AIRecommendationPanel({
  quotationId,
  cart = [],
  onAddToQuote,
  className = '',
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [basis, setBasis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dismissedIds, setDismissedIds] = useState(new Set());

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getQuotationRecommendations(quotationId, cart);
      setRecommendations(data.recommendations || []);
      setBasis(data.basis || null);
    } catch (err) {
      setError('AI recommendations are temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [quotationId, cart?.length]);

  const handleDismiss = async (recId) => {
    setDismissedIds((prev) => new Set([...prev, recId]));
    try {
      await dismissRecommendation(recId);
    } catch {
      // Best-effort
    }
  };

  const handleAdd = (rec) => {
    if (onAddToQuote) {
      onAddToQuote(rec);
    }
  };

  const visibleRecommendations = recommendations.filter((r) => !dismissedIds.has(r.id));

  return (
    <div className={`bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E7EB]/60 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-[#FEECE8] text-[#F26C4F]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-[#1F2937]">AI Sales Recommendations</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#FEECE8] text-[#F26C4F] rounded-full border border-[#F26C4F]/30">
                AI Copilot
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280]">
              Grounded cross-sell & upsell suggestions mined from confirmed deal history.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {basis?.transactionsAnalyzed && (
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-[#6B7280] bg-slate-100 rounded-md">
              {basis.transactionsAnalyzed} past deals analyzed
            </span>
          )}
          <button
            onClick={fetchRecommendations}
            disabled={loading}
            className="p-1.5 rounded-lg border border-[#E5E7EB] hover:bg-slate-50 text-[#6B7280] transition"
            title="Refresh AI Analysis"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#F26C4F]' : ''}`} />
          </button>
        </div>
      </div>

      {/* AI Advisory Note */}
      <div className="flex items-start space-x-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] text-[#6B7280]">
        <Info className="w-3.5 h-3.5 text-[#F26C4F] shrink-0 mt-0.5" />
        <span>
          <strong>AI Advisory:</strong> Recommendations are statistical suggestions to maximize customer value and margin. Sales representatives retain final quotation authority.
        </span>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-2 text-xs text-[#6B7280] py-4">
            <Sparkles className="w-4 h-4 animate-spin text-[#F26C4F]" />
            <span>AI is analyzing this quotation and mining cross-sell patterns...</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-slate-100/70 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {/* Error state with retry */}
      {error && !loading && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center space-y-2">
          <div className="flex items-center justify-center space-x-1.5 text-xs font-semibold text-rose-700">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchRecommendations}
            className="px-3 py-1.5 bg-[#F26C4F] hover:bg-[#E0583B] text-white text-xs font-semibold rounded-xl transition"
          >
            Retry Analysis
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && visibleRecommendations.length === 0 && (
        <div className="p-6 text-center bg-[#F4F5F7]/60 rounded-xl border border-slate-200/60 text-xs text-[#6B7280]">
          <Layers className="w-6 h-6 mx-auto mb-1.5 text-slate-400" />
          <p className="font-semibold text-[#1F2937]">No recommendations available for this quotation yet.</p>
          <p className="text-[11px] mt-0.5">Add line items to generate automated cross-sell options.</p>
        </div>
      )}

      {/* Recommendations Grid */}
      {!loading && !error && visibleRecommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {visibleRecommendations.map((rec) => (
            <AIRecommendationCard
              key={rec.id}
              recommendation={rec}
              onAddToQuote={handleAdd}
              onDismiss={handleDismiss}
            />
          ))}
        </div>
      )}
    </div>
  );
}
