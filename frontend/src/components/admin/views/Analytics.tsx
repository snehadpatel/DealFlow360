import React, { useState } from "react";
import { BarChart3, Download, Calendar, Filter, FileSpreadsheet, FileText } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from "recharts";

const analyticsData = [
  { month: "Jan", revenue: 42, orders: 34, quotes: 52, avgDiscount: 8.2 },
  { month: "Feb", revenue: 51, orders: 41, quotes: 60, avgDiscount: 9.4 },
  { month: "Mar", revenue: 47, orders: 38, quotes: 55, avgDiscount: 9.0 },
  { month: "Apr", revenue: 63, orders: 52, quotes: 78, avgDiscount: 11.2 },
  { month: "May", revenue: 58, orders: 48, quotes: 70, avgDiscount: 10.8 },
  { month: "Jun", revenue: 71, orders: 61, quotes: 88, avgDiscount: 12.5 },
  { month: "Jul", revenue: 68, orders: 59, quotes: 84, avgDiscount: 12.1 },
  { month: "Aug", revenue: 79, orders: 68, quotes: 96, avgDiscount: 13.8 },
];

export default function Analytics() {
  const [dateRange, setDateRange] = useState("YTD 2026");
  const [teamFilter, setTeamFilter] = useState("all");
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function exportReport(format: string) {
    showToast(`Exported report in ${format} format successfully`);
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1F2937] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2 animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {toast}
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-[#1F2937] tracking-tight">Reports & Executive Analytics</h2>
          <p className="text-[#6B7280] text-xs mt-0.5">Comprehensive reports across sales revenue, discounts, customer metrics, and subscriptions.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-[#E5E7EB] bg-white rounded-xl px-3 py-2 text-xs font-semibold text-[#374151] outline-none"
          >
            <option value="Aug 2026">Current Month (Aug 2026)</option>
            <option value="Q3 2026">Q3 2026</option>
            <option value="YTD 2026">Year to Date (YTD 2026)</option>
          </select>

          <button
            onClick={() => exportReport("CSV")}
            className="flex items-center gap-1 border border-[#E5E7EB] bg-white text-[#374151] px-3 py-2 rounded-xl text-xs font-bold hover:bg-[#F4F5F7]"
          >
            <Download size={14} /> CSV
          </button>
          <button
            onClick={() => exportReport("XLSX")}
            className="flex items-center gap-1 border border-[#E5E7EB] bg-white text-[#374151] px-3 py-2 rounded-xl text-xs font-bold hover:bg-[#F4F5F7]"
          >
            <FileSpreadsheet size={14} /> XLSX
          </button>
          <button
            onClick={() => exportReport("PDF")}
            className="flex items-center gap-1 bg-[#F26C4F] text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-[#e05535] shadow-xs"
          >
            <FileText size={14} /> Export PDF
          </button>
        </div>
      </div>

      {/* Report Categories KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
          <p className="text-[#6B7280] text-[10px] font-bold uppercase">Total Revenue</p>
          <p className="text-xl font-extrabold text-[#1F2937] mt-1">₹4.79 Cr</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">+18% YTD Growth</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
          <p className="text-[#6B7280] text-[10px] font-bold uppercase">Quotations Won Rate</p>
          <p className="text-xl font-extrabold text-[#1F2937] mt-1">70.8%</p>
          <p className="text-[10px] text-blue-600 font-bold mt-0.5">421 Won / 595 Total</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
          <p className="text-[#6B7280] text-[10px] font-bold uppercase">Avg Discount Rate</p>
          <p className="text-xl font-extrabold text-[#F26C4F] mt-1">11.4%</p>
          <p className="text-[10px] text-red-600 font-bold mt-0.5">+2.4% Leakage Alert</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
          <p className="text-[#6B7280] text-[10px] font-bold uppercase">Subscription ARR</p>
          <p className="text-xl font-extrabold text-[#1F2937] mt-1">₹34.08 Cr</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">+22% Annualized</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
          <p className="text-[#6B7280] text-[10px] font-bold uppercase">Fulfillment SLA</p>
          <p className="text-xl font-extrabold text-[#1F2937] mt-1">1.8 Days</p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Order to Dispatch</p>
        </div>
      </div>

      {/* Revenue & Discount Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs">
          <h3 className="text-[#1F2937] font-bold text-sm mb-1">Revenue & Quotation Conversion</h3>
          <p className="text-[#6B7280] text-xs mb-4">Monthly revenue (₹ Lakhs) vs total quote volume</p>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={analyticsData}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={(v: unknown) => [`₹${v}L`, "Revenue"]} />
              <Bar dataKey="revenue" fill="#F26C4F" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs">
          <h3 className="text-[#1F2937] font-bold text-sm mb-1">Average Discount Rate Trend (%)</h3>
          <p className="text-[#6B7280] text-xs mb-4">Monthly average discount percentage given across deals</p>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={analyticsData}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={(v: unknown) => [`${v}%`, "Avg Discount Rate"]} />
              <Area type="monotone" dataKey="avgDiscount" stroke="#F26C4F" fill="#FEECE8" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
