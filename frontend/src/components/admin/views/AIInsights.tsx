import React, { useState } from "react";
import { Sparkles, TrendingDown, TrendingUp, AlertOctagon, UserX, ArrowUpRight, CheckCircle2 } from "lucide-react";

const initialInsights = [
  {
    id: 1,
    title: "1. Revenue Risk Alert",
    impact: "HIGH RISK",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: <AlertOctagon className="text-red-600" size={20} />,
    headline: "12 active deals have a high probability of slipping past quarter close.",
    details: "Stalled negotiation threads with procurement departments (Infosys, TCS) combined with pending multi-tier manager approvals indicate potential ₹14.2L revenue delay.",
    recommendation: "Automate executive override approvals for quotes pending >48h.",
    actionText: "Apply Auto-Escalation Rule",
  },
  {
    id: 2,
    title: "2. Discount Leakage Detector",
    impact: "MARGIN LOSS",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <TrendingDown className="text-amber-600" size={20} />,
    headline: "Average approved discount increased by +8% this month across Sales Reps.",
    details: "Sales reps are offering maximum ceiling discounts (15%) prematurely in Round 1 of quote creation rather than leveraging tiered pricing benefits.",
    recommendation: "Enforce mandatory manager approval for Round 1 discounts >10%.",
    actionText: "Update Discount Policy",
  },
  {
    id: 3,
    title: "3. Customer Churn Risk",
    impact: "CHURN RISK",
    color: "bg-orange-50 text-[#F26C4F] border-orange-200",
    icon: <UserX className="text-[#F26C4F]" size={20} />,
    headline: "5 Silver & Gold customers show reduced purchasing activity in Q3.",
    details: "Sunrise Retail and Cognizant order frequency decreased by 40% over the last 45 days. SLA tickets indicate unresolved support queries.",
    recommendation: "Assign dedicated Account Executive to initiate proactive outreach.",
    actionText: "Trigger Customer Outreach",
  },
  {
    id: 4,
    title: "4. Upsell Opportunities Engine",
    impact: "REVENUE GROWTH",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <ArrowUpRight className="text-emerald-600" size={20} />,
    headline: "8 Pro Plan customers are eligible for Pro → Enterprise tier upgrade.",
    details: "TechVision India and 7 others have exceeded 18 active user seats and requested custom API integrations.",
    recommendation: "Send tailored Enterprise proposal with dedicated SLA package.",
    actionText: "Send Upgrade Proposals",
  },
  {
    id: 5,
    title: "5. Inventory Availability Risk",
    impact: "STOCK OUT",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    icon: <TrendingUp className="text-purple-600" size={20} />,
    headline: "3 hardware SKUs may become unavailable within 7 days.",
    details: "Stock of LAP-PRO-X1 is down to 3 units with 12 unfulfilled orders queued across Mumbai and Bangalore hubs.",
    recommendation: "Trigger emergency purchase order to primary hardware supplier.",
    actionText: "Initiate Restock PO",
  },
];

export default function AIInsights() {
  const [insights] = useState(initialInsights);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1F2937] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2 animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-[#1F2937] tracking-tight">AI Insights & Predictive Intelligence</h2>
          <p className="text-[#6B7280] text-xs mt-0.5">Real-time AI analysis of deals, discount leakage, churn risk, and upsell opportunities.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FEECE8] text-[#F26C4F] font-bold text-xs rounded-full border border-[#F26C4F]/20">
          <Sparkles size={14} /> AI Agent Model v2.4 Active
        </span>
      </div>

      {/* Insights Cards */}
      <div className="space-y-4">
        {insights.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-[#FAFBFD] border border-[#E5E7EB] flex-shrink-0">
                {item.icon}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-[#1F2937]">{item.title}</span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${item.color}`}>
                    {item.impact}
                  </span>
                </div>
                <p className="text-xs font-bold text-[#1F2937]">{item.headline}</p>
                <p className="text-xs text-[#4B5563] leading-relaxed max-w-3xl">{item.details}</p>
                <p className="text-xs font-bold text-[#F26C4F] pt-1">
                  AI Recommendation: <span className="font-normal text-[#374151]">{item.recommendation}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => showToast(`Executed: ${item.actionText}`)}
              className="px-4 py-2 bg-[#F26C4F] text-white text-xs font-bold rounded-xl hover:bg-[#e05535] transition shadow-xs flex-shrink-0 self-start md:self-center"
            >
              {item.actionText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
