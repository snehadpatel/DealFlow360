import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";
import StatCard from "../ui/StatCard";
import StatusPill from "../ui/StatusPill";
import {
  Users, Package, Handshake, Clock, DollarSign, AlertTriangle,
  Sparkles, ShieldAlert, ArrowUpRight, TrendingUp, ChevronRight
} from "lucide-react";

const revenueData = [
  { month: "Jan", revenue: 42000, orders: 34 },
  { month: "Feb", revenue: 51000, orders: 41 },
  { month: "Mar", revenue: 47000, orders: 38 },
  { month: "Apr", revenue: 63000, orders: 52 },
  { month: "May", revenue: 58000, orders: 48 },
  { month: "Jun", revenue: 71000, orders: 61 },
  { month: "Jul", revenue: 68000, orders: 59 },
  { month: "Aug", revenue: 79000, orders: 68 },
];

const tierData = [
  { name: "Bronze", value: 48, color: "#CD7F32" },
  { name: "Silver", value: 31, color: "#9CA3AF" },
  { name: "Gold", value: 21, color: "#F26C4F" },
];

const cashflowData = [
  { month: "Jan", value: 38000 },
  { month: "Feb", value: 45000 },
  { month: "Mar", value: 41000 },
  { month: "Apr", value: 57000 },
  { month: "May", value: 52000 },
  { month: "Jun", value: 64000 },
  { month: "Jul", value: 61000 },
  { month: "Aug", value: 72000 },
];

const highValueApprovals = [
  { id: "Q-1042", customer: "Infosys Technologies", value: "₹48,00,000", discount: "28%", dept: "Finance", risk: "CRITICAL" },
  { id: "Q-1038", customer: "TCS Enterprise", value: "₹32,50,000", discount: "22%", dept: "Finance", risk: "HIGH" },
  { id: "Q-1035", customer: "Wipro Digital", value: "₹19,00,000", discount: "18%", dept: "Sales Mgr", risk: "MEDIUM" },
  { id: "Q-1029", customer: "Reliance Retail", value: "₹14,20,000", discount: "15%", dept: "Sales Mgr", risk: "LOW" },
];

const atRiskDeals = [
  {
    id: "DEAL-882",
    customer: "Acme Corp",
    value: "₹6,80,000",
    risk: "CRITICAL",
    reason: "18% discount requested, pending approval 3 days, stock low",
    action: "Escalate to Finance",
  },
  {
    id: "DEAL-791",
    customer: "GlobalEdge Systems",
    value: "₹4,20,000",
    risk: "HIGH",
    reason: "Stalled for 14 days post-quote confirmation",
    action: "Nudge Rep",
  },
  {
    id: "DEAL-654",
    customer: "TechVision India",
    value: "₹3,20,000",
    risk: "HIGH",
    reason: "Customer requested pricing revision twice",
    action: "Review Discount",
  },
];

type Props = {
  onNavigate?: (view: string) => void;
};

import { fetchDashboardStats, fetchCustomersList, fetchProductsList, fetchUsersList } from "../../../api/adminApi";

export default function Dashboard({ onNavigate }: Props) {
  const [selectedAiDeal, setSelectedAiDeal] = useState<string | null>("DEAL-882");
  const [escalated, setEscalated] = useState(false);
  const [stats, setStats] = useState<any>({
    total_customers: 200,
    total_quotes: 200,
    pending_approvals: 12,
    high_risk_deals: 8,
    total_revenue: 7900000,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [dashData, customers, products, users] = await Promise.all([
          fetchDashboardStats(),
          fetchCustomersList(),
          fetchProductsList(),
          fetchUsersList(),
        ]);
        setStats({
          total_customers: customers.length || dashData?.total_customers || 200,
          total_quotes: dashData?.total_quotes || 200,
          pending_approvals: dashData?.pending_approvals || 12,
          high_risk_deals: dashData?.high_risk_deals || 8,
          total_revenue: dashData?.total_revenue || 7900000,
        });
      } catch (err) {
        console.warn("Failed to load dashboard stats", err);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-[22px] font-bold text-[#1F2937] tracking-tight">Dashboard</h2>
          <p className="text-[#6B7280] text-xs mt-0.5">Real-time overview of revenue, approvals, customers, and AI health metrics.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FEECE8] text-[#F26C4F] font-bold text-xs rounded-full border border-[#F26C4F]/20">
            <Sparkles size={13} />
            AI Protection Active
          </span>
        </div>
      </div>

      {/* Top KPI Cards (Exact match to prompt specs) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <StatCard
          label="Total Customers"
          value={stats.total_customers.toLocaleString()}
          trend={{ value: "Live DB record count", up: true }}
          icon={<Users size={18} />}
        />
        <StatCard
          label="Active Deals"
          value={stats.total_quotes.toLocaleString()}
          trend={{ value: "Live DB record count", up: true }}
          icon={<Handshake size={18} />}
        />
        <StatCard
          label="Pending Approvals"
          value={stats.pending_approvals.toString()}
          trend={{ value: "Awaiting signoff", up: false }}
          accent
          icon={<Clock size={18} />}
        />
        <StatCard
          label="At-Risk Deals"
          value={stats.high_risk_deals.toString()}
          trend={{ value: "High risk flagged", up: false }}
          icon={<AlertTriangle size={18} className="text-amber-500" />}
        />
        <StatCard
          label="Monthly Revenue"
          value={`₹${(stats.total_revenue / 100000).toFixed(1)}L`}
          trend={{ value: "+18% vs last month", up: true }}
          icon={<DollarSign size={18} />}
        />
      </div>

      {/* Standout Feature: Revenue At Risk & Discount Leakage Bar */}
      <div className="bg-gradient-to-r from-[#1F2937] to-[#111827] rounded-2xl p-5 text-white shadow-md border border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Revenue at Risk */}
          <div className="flex items-start gap-3.5 pr-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0 text-red-400">
              <ShieldAlert size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Revenue at Risk</p>
              <p className="text-2xl font-extrabold text-white mt-0.5">₹14.2L</p>
              <p className="text-[11px] text-red-400 mt-1 font-medium flex items-center gap-1">
                <span>14 deals flagged by AI</span>
                {onNavigate && (
                  <button onClick={() => onNavigate("dealhealth")} className="underline hover:text-white ml-1">
                    View Deals →
                  </button>
                )}
              </p>
            </div>
          </div>

          {/* Discount Leakage Detector */}
          <div className="flex items-start gap-3.5 pt-4 md:pt-0 px-0 md:px-4">
            <div className="w-10 h-10 rounded-xl bg-[#F26C4F]/20 border border-[#F26C4F]/30 flex items-center justify-center flex-shrink-0 text-[#F26C4F]">
              <TrendingUp size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Discount Leakage Detector</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-extrabold text-white">₹1.7L</span>
                <span className="text-xs text-slate-400">(Potential ₹12.5L vs Actual ₹10.8L)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-[#F26C4F] h-full rounded-full" style={{ width: "13.6%" }} />
              </div>
            </div>
          </div>

          {/* Customer Value Score Summary */}
          <div className="flex items-start gap-3.5 pt-4 md:pt-0 pl-0 md:pl-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-400">
              <ArrowUpRight size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg Customer Value Score</p>
              <p className="text-2xl font-extrabold text-white mt-0.5">84.6 <span className="text-xs font-normal text-emerald-400">/ 100</span></p>
              <p className="text-[11px] text-slate-400 mt-1">Based on frequency, ARR & renewal probability</p>
            </div>
          </div>
        </div>
      </div>

      {/* Business Overview Chart + Cashflow Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Business Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[#1F2937] font-bold text-[15px]">Business Overview</h3>
              <p className="text-[#6B7280] text-[11px]">Monthly revenue vs order volume (Jan — Aug 2026)</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-medium text-[#6B7280]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#F26C4F] inline-block" />Revenue (₹)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#F8B179] inline-block" />Orders</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={revenueData} barGap={4}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 12 }}
                formatter={(v: unknown, name: unknown) => {
                  const n = Number(v);
                  const k = String(name);
                  return [k === "revenue" ? `₹${(n / 1000).toFixed(0)}K` : n, k === "revenue" ? "Revenue" : "Orders"];
                }}
              />
              <Bar dataKey="revenue" fill="#F26C4F" radius={[4, 4, 0, 0]} maxBarSize={26} />
              <Bar dataKey="orders" fill="#F8B179" radius={[4, 4, 0, 0]} maxBarSize={26} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cashflow Card (Exact dark theme from prompt) */}
        <div className="bg-[#161616] rounded-2xl p-5 flex flex-col justify-between shadow-xs border border-neutral-800">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-white font-bold text-[15px]">Cashflow</h3>
                <p className="text-[#9CA3AF] text-[11px]">Monthly net revenue</p>
              </div>
              <span className="text-[#F26C4F] bg-[#F26C4F]/15 border border-[#F26C4F]/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                +18%
              </span>
            </div>
            <p className="text-white text-3xl font-extrabold tracking-tight mt-2">₹72L</p>
            <p className="text-[#9CA3AF] text-xs mt-0.5 font-medium">August 2026</p>
          </div>

          <div className="mt-4">
            <ResponsiveContainer width="100%" height={110}>
              <AreaChart data={cashflowData}>
                <defs>
                  <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F26C4F" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F26C4F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{ background: "#1F1F1F", border: "none", borderRadius: 8, fontSize: 11, color: "#fff" }}
                  formatter={(v: unknown) => [`₹${(Number(v) / 1000).toFixed(0)}K`, "Net Cashflow"]}
                />
                <Area type="monotone" dataKey="value" stroke="#F26C4F" strokeWidth={2.5} fill="url(#cashGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Customer + Approval + Subscription Overviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Customer Overview */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#1F2937] font-bold text-[15px]">Customer Overview</h3>
            {onNavigate && (
              <button onClick={() => onNavigate("customers")} className="text-[11px] font-bold text-[#F26C4F] hover:underline">
                View All →
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            {[
              { label: "Total", value: "1,284" },
              { label: "New (Aug)", value: "+41" },
              { label: "Active", value: "1,102" },
              { label: "Inactive", value: "182" },
            ].map((item) => (
              <div key={item.label} className="bg-[#F4F5F7] rounded-xl p-3">
                <p className="text-[#6B7280] text-[10px] font-bold uppercase tracking-wider">{item.label}</p>
                <p className="text-[#1F2937] font-extrabold text-lg mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
          <p className="text-[#6B7280] text-[11px] font-semibold mb-2">Customer Tiers Breakdown</p>
          <div className="flex items-center gap-4">
            <PieChart width={80} height={80}>
              <Pie data={tierData} cx={35} cy={35} innerRadius={22} outerRadius={38} dataKey="value" strokeWidth={0}>
                {tierData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
            <div className="space-y-1.5 flex-1">
              {tierData.map((t) => (
                <div key={t.name} className="flex items-center gap-2 text-[12px]">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: t.color }} />
                  <span className="text-[#6B7280] font-medium">{t.name}</span>
                  <span className="text-[#1F2937] font-bold ml-auto">{t.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Approval Overview */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#1F2937] font-bold text-[15px]">Approval Overview</h3>
            {onNavigate && (
              <button onClick={() => onNavigate("discounts")} className="text-[11px] font-bold text-[#F26C4F] hover:underline">
                Manage Chain →
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "Pending", value: "87", color: "text-[#F59E0B]", bg: "bg-amber-50" },
              { label: "Approved", value: "312", color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Rejected", value: "24", color: "text-red-500", bg: "bg-red-50" },
            ].map((item) => (
              <div key={item.label} className={`${item.bg} rounded-xl p-2.5 text-center`}>
                <p className={`${item.color} font-extrabold text-lg`}>{item.value}</p>
                <p className="text-[#6B7280] text-[10px] font-semibold">{item.label}</p>
              </div>
            ))}
          </div>
          <p className="text-[#6B7280] text-[11px] font-semibold mb-2">High-Value Requests</p>
          <div className="space-y-2">
            {highValueApprovals.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-1.5 border-b border-[#F4F5F7] last:border-0">
                <div className="min-w-0 pr-2">
                  <p className="text-xs text-[#1F2937] font-bold truncate">{a.customer}</p>
                  <p className="text-[10px] text-[#6B7280]">{a.value} · <span className="font-semibold text-[#F26C4F]">{a.discount} off</span></p>
                </div>
                <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                  {a.dept}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Overview */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#1F2937] font-bold text-[15px]">Subscription Overview</h3>
            {onNavigate && (
              <button onClick={() => onNavigate("subscriptions")} className="text-[11px] font-bold text-[#F26C4F] hover:underline">
                Plans →
              </button>
            )}
          </div>
          <div className="space-y-3.5 mb-4">
            {[
              { label: "Basic Plan", count: 621, color: "#9CA3AF", pct: 48, price: "₹999/mo" },
              { label: "Pro Plan", count: 418, color: "#F8B179", pct: 33, price: "₹2,999/mo" },
              { label: "Enterprise Plan", count: 245, color: "#F26C4F", pct: 19, price: "Custom" },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#6B7280] font-medium">{s.label} <span className="text-[10px] text-[#9CA3AF]">({s.price})</span></span>
                  <span className="text-[#1F2937] font-bold">{s.count.toLocaleString()} customers</span>
                </div>
                <div className="h-2 bg-[#F4F5F7] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-[width]" style={{ width: `${s.pct}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-[#F4F5F7] rounded-xl p-3.5 flex items-center justify-between border border-[#E5E7EB]">
            <div>
              <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Monthly Recurring Revenue</p>
              <p className="text-[#1F2937] font-extrabold text-xl mt-0.5">₹2.84 Cr</p>
            </div>
            <div className="text-emerald-700 text-xs font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              +22% ARR
            </div>
          </div>
        </div>
      </div>

      {/* AI Deal Risk & Explanation Drawer Component */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-50 text-[#F26C4F]">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-[#1F2937] font-bold text-[15px]">AI Deal Risk & Smart Explanations</h3>
              <p className="text-[#6B7280] text-xs">Automated deal scoring and actionable insights</p>
            </div>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate("aiinsights")}
              className="text-xs text-[#F26C4F] font-bold hover:underline flex items-center gap-1"
            >
              All AI Insights <ChevronRight size={14} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            {atRiskDeals.map((deal) => {
              const isSelected = selectedAiDeal === deal.id;
              return (
                <button
                  key={deal.id}
                  type="button"
                  onClick={() => setSelectedAiDeal(deal.id)}
                  className={`w-full text-left p-3.5 rounded-xl border cursor-pointer transition-colors ${
                    isSelected
                      ? "border-[#F26C4F] bg-[#FFF8F6] shadow-xs"
                      : "border-[#E5E7EB] hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#1F2937]">{deal.customer}</span>
                      <span className="text-[11px] text-[#6B7280]">({deal.value})</span>
                    </div>
                    <StatusPill status={deal.risk} />
                  </div>
                  <p className="text-xs text-[#4B5563] line-clamp-1">{deal.reason}</p>
                </button>
              );
            })}
          </div>

          {/* AI Explanation Box */}
          <div className="bg-[#FAFBFD] rounded-xl p-4 border border-[#E5E7EB] flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold text-[#F26C4F] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Sparkles size={14} />
                AI Risk Explanation for {selectedAiDeal || "DEAL-882"}
              </p>
              <div className="space-y-2 text-xs text-[#374151]">
                <p className="font-bold text-[#1F2937]">High risk identified due to:</p>
                <ul className="list-disc pl-4 space-y-1 text-[#4B5563]">
                  <li><strong className="text-[#1F2937]">18% requested discount</strong> exceeds Sales Rep threshold (ceiling 15%)</li>
                  <li>Approval pending with Finance for over <strong className="text-[#1F2937]">3 business days</strong></li>
                  <li>Customer requested quotation revisions <strong className="text-[#1F2937]">twice</strong> in 7 days</li>
                  <li>Inventory stock for requested SKU LAP-PRO-X1 is down to <strong className="text-red-600">3 units</strong></li>
                </ul>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between">
              <span className="text-[11px] text-[#6B7280]">Recommended Action: <strong>Escalate to Finance VP</strong></span>
              <button
                onClick={() => setEscalated(true)}
                disabled={escalated}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  escalated
                    ? "bg-emerald-100 text-emerald-700 cursor-default"
                    : "bg-[#F26C4F] text-white hover:bg-[#e05535]"
                }`}
              >
                {escalated ? "✓ Escalated to Finance VP" : "Execute Escalation"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
