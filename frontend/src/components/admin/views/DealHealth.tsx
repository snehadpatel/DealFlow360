import React, { useState } from "react";
import { Activity, AlertTriangle, Clock, ShieldAlert, ArrowRight, UserCheck } from "lucide-react";
import StatusPill from "../ui/StatusPill";

const initialDeals = [
  {
    id: "DEAL-882",
    customer: "Acme Corporation",
    rep: "Alex Kumar",
    risk: "CRITICAL",
    riskScore: 92,
    reason: "18% discount requested, pending Finance approval 3 days, low SKU stock",
    daysStalled: 14,
    recommendedAction: "Escalate to Finance VP",
  },
  {
    id: "DEAL-791",
    customer: "GlobalEdge Systems",
    rep: "Priya Sharma",
    risk: "HIGH",
    riskScore: 78,
    reason: "Stalled 14 days post-quote confirmation without PO submission",
    daysStalled: 14,
    recommendedAction: "Nudge Rep to follow up PO",
  },
  {
    id: "DEAL-654",
    customer: "TechVision India",
    rep: "Alex Kumar",
    risk: "HIGH",
    riskScore: 74,
    reason: "Discount anomaly: 22% requested on Silver account (Limit: 10%)",
    daysStalled: 8,
    recommendedAction: "Review Discount Ceiling",
  },
  {
    id: "DEAL-502",
    customer: "Sunrise Retail Ltd",
    rep: "Priya Sharma",
    risk: "MEDIUM",
    riskScore: 54,
    reason: "Delivery slippage risk: Stock shortage at Mumbai warehouse",
    daysStalled: 5,
    recommendedAction: "Reallocate Stock from Delhi",
  },
];

export default function DealHealth() {
  const [deals] = useState(initialDeals);
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

      <div>
        <h2 className="text-[20px] font-bold text-[#1F2937] tracking-tight">Deal Health & Risk Intelligence</h2>
        <p className="text-[#6B7280] text-xs mt-0.5">Automated detection of stalled deals, discount anomalies, and delivery slippages.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280] text-xs font-bold">Stalled Deals (&gt;7 Days)</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600"><Clock size={16} /></div>
          </div>
          <p className="text-2xl font-extrabold text-[#1F2937] mt-2">12 Deals</p>
          <p className="text-[10px] text-amber-600 font-bold mt-0.5">Requires rep engagement</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280] text-xs font-bold">Discount Anomalies</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600"><AlertTriangle size={16} /></div>
          </div>
          <p className="text-2xl font-extrabold text-[#1F2937] mt-2">5 Deals</p>
          <p className="text-[10px] text-red-600 font-bold mt-0.5">Above tier max threshold</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280] text-xs font-bold">Delivery Slippage Risk</span>
            <div className="p-2 rounded-xl bg-orange-50 text-[#F26C4F]"><ShieldAlert size={16} /></div>
          </div>
          <p className="text-2xl font-extrabold text-[#1F2937] mt-2">3 Orders</p>
          <p className="text-[10px] text-[#F26C4F] font-bold mt-0.5">Fulfillment delay flagged</p>
        </div>
      </div>

      {/* Stalled & Anomaly Deals Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-[#1F2937] font-bold text-sm">Monitored Risk Pipeline</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#FAFBFD] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                <th className="py-3 px-4">Deal ID & Customer</th>
                <th className="py-3 px-4">Assigned Rep</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Flagged Reason</th>
                <th className="py-3 px-4 text-center">Days Stalled</th>
                <th className="py-3 px-4">Recommended Action</th>
                <th className="py-3 px-4 text-right">Execute</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F5F7] text-xs">
              {deals.map((d) => (
                <tr key={d.id} className="hover:bg-[#FFF8F6]/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-[#1F2937]">{d.customer}</p>
                    <p className="text-[11px] font-mono text-[#6B7280]">{d.id}</p>
                  </td>
                  <td className="py-3.5 px-4 text-[#4B5563] font-medium">{d.rep}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <StatusPill status={d.risk} />
                      <span className="text-[10px] font-bold text-[#6B7280]">({d.riskScore}/100)</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#374151] max-w-xs">{d.reason}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-[#1F2937]">{d.daysStalled} days</td>
                  <td className="py-3.5 px-4 font-bold text-[#F26C4F]">{d.recommendedAction}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => showToast(`Action executed: ${d.recommendedAction} for ${d.customer}`)}
                      className="px-3 py-1 bg-[#F26C4F] text-white text-xs font-bold rounded-lg hover:bg-[#e05535] transition shadow-xs"
                    >
                      Trigger Action
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
