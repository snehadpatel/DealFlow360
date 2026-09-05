import React, { useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, PieChart, Pie, Cell, ComposedChart, Line, CartesianGrid, Legend } from "recharts";

const analyticsData = [
  { month: "Jan", revenue: 42, target: 40, orders: 34, quotes: 52, avgDiscount: 8.2, dealCycle: 18 },
  { month: "Feb", revenue: 51, target: 45, orders: 41, quotes: 60, avgDiscount: 9.4, dealCycle: 16 },
  { month: "Mar", revenue: 47, target: 48, orders: 38, quotes: 55, avgDiscount: 9.0, dealCycle: 19 },
  { month: "Apr", revenue: 63, target: 52, orders: 52, quotes: 78, avgDiscount: 11.2, dealCycle: 14 },
  { month: "May", revenue: 58, target: 58, orders: 48, quotes: 70, avgDiscount: 10.8, dealCycle: 15 },
  { month: "Jun", revenue: 71, target: 62, orders: 61, quotes: 88, avgDiscount: 12.5, dealCycle: 12 },
  { month: "Jul", revenue: 68, target: 68, orders: 59, quotes: 84, avgDiscount: 12.1, dealCycle: 13 },
  { month: "Aug", revenue: 79, target: 75, orders: 68, quotes: 96, avgDiscount: 13.8, dealCycle: 10 },
];

const categoryData = [
  { name: "Hardware", value: 45 },
  { name: "Software License", value: 35 },
  { name: "Cloud Services", value: 20 },
];
const COLORS = ['#F26C4F', '#F8B179', '#1F2937'];

export default function Analytics() {
  const [dateRange, setDateRange] = useState("YTD 2026");
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
            className="border border-[#E5E7EB] bg-white rounded-xl px-3 py-2 text-xs font-semibold text-[#374151] outline-none hover:border-[#F26C4F] transition-colors"
          >
            <option value="Aug 2026">Current Month (Aug 2026)</option>
            <option value="Q3 2026">Q3 2026</option>
            <option value="YTD 2026">Year to Date (YTD 2026)</option>
          </select>

          <button
            onClick={() => exportReport("CSV")}
            className="flex items-center gap-1 border border-[#E5E7EB] bg-white text-[#374151] px-3 py-2 rounded-xl text-xs font-bold hover:bg-[#F4F5F7] transition-colors shadow-sm"
          >
            <Download size={14} /> CSV
          </button>
          <button
            onClick={() => exportReport("XLSX")}
            className="flex items-center gap-1 border border-[#E5E7EB] bg-white text-[#374151] px-3 py-2 rounded-xl text-xs font-bold hover:bg-[#F4F5F7] transition-colors shadow-sm"
          >
            <FileSpreadsheet size={14} /> XLSX
          </button>
          <button
            onClick={() => exportReport("PDF")}
            className="flex items-center gap-1 bg-[#F26C4F] text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-[#e05535] shadow-md transition-colors"
          >
            <FileText size={14} /> Export PDF
          </button>
        </div>
      </div>

      {/* Report Categories KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[#6B7280] text-[10px] font-bold uppercase tracking-wide">Total Revenue</p>
          <p className="text-xl font-extrabold text-[#1F2937] mt-1">₹4.79 Cr</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">+18% YTD Growth</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[#6B7280] text-[10px] font-bold uppercase tracking-wide">Quotations Won Rate</p>
          <p className="text-xl font-extrabold text-[#1F2937] mt-1">70.8%</p>
          <p className="text-[10px] text-blue-600 font-bold mt-0.5">421 Won / 595 Total</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[#6B7280] text-[10px] font-bold uppercase tracking-wide">Avg Discount Rate</p>
          <p className="text-xl font-extrabold text-[#F26C4F] mt-1">11.4%</p>
          <p className="text-[10px] text-red-600 font-bold mt-0.5">+2.4% Leakage Alert</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[#6B7280] text-[10px] font-bold uppercase tracking-wide">Subscription ARR</p>
          <p className="text-xl font-extrabold text-[#1F2937] mt-1">₹34.08 Cr</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">+22% Annualized</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[#6B7280] text-[10px] font-bold uppercase tracking-wide">Fulfillment SLA</p>
          <p className="text-xl font-extrabold text-[#1F2937] mt-1">1.8 Days</p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Order to Dispatch</p>
        </div>
      </div>

      {/* Row 1: Revenue vs Target (Composed) and Discount Trend (Area) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="text-[#1F2937] font-bold text-sm mb-1">Revenue Performance vs Target</h3>
          <p className="text-[#6B7280] text-xs mb-4">Actual revenue vs quota baseline (₹ Lakhs)</p>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                cursor={{ fill: '#F4F5F7' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
              <Bar dataKey="revenue" name="Actual Revenue" fill="#F26C4F" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Line type="monotone" dataKey="target" name="Target Quota" stroke="#1F2937" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="text-[#1F2937] font-bold text-sm mb-1">Average Discount Rate Trend (%)</h3>
          <p className="text-[#6B7280] text-xs mb-4">Monthly average discount percentage given across deals</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDiscount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F26C4F" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#F26C4F" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="avgDiscount" name="Discount %" stroke="#F26C4F" fillOpacity={1} fill="url(#colorDiscount)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Revenue By Category (Pie) and Deal Velocity (Line) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pie Chart */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm lg:col-span-1 flex flex-col">
          <h3 className="text-[#1F2937] font-bold text-sm mb-1">Revenue by Category</h3>
          <p className="text-[#6B7280] text-xs mb-2">Distribution of sales volume</p>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom Legend */}
          <div className="flex flex-col gap-2 mt-2">
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="font-semibold text-[#374151]">{item.name}</span>
                </div>
                <span className="font-bold text-[#1F2937]">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm lg:col-span-2">
          <h3 className="text-[#1F2937] font-bold text-sm mb-1">Deal Velocity & Cycle Time</h3>
          <p className="text-[#6B7280] text-xs mb-4">Average days from quotation creation to won deal status</p>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                cursor={{ fill: '#F4F5F7' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
              <Bar dataKey="dealCycle" name="Avg Days to Close" fill="#F8B179" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Line type="monotone" dataKey="dealCycle" name="Trend" stroke="#F26C4F" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
