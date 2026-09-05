import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, Area, AreaChart,
  PieChart, Pie, Cell,
} from "recharts";
import StatCard from "../ui/StatCard";
import StatusPill from "../ui/StatusPill";
import { Users, Package, Handshake, Clock, DollarSign, CheckCircle, Server, CloudLightning } from "lucide-react";

const revenueData = [
  { month: "Jan", revenue: 42000, customers: 18, orders: 34 },
  { month: "Feb", revenue: 51000, customers: 22, orders: 41 },
  { month: "Mar", revenue: 47000, customers: 19, orders: 38 },
  { month: "Apr", revenue: 63000, customers: 31, orders: 52 },
  { month: "May", revenue: 58000, customers: 27, orders: 48 },
  { month: "Jun", revenue: 71000, customers: 36, orders: 61 },
  { month: "Jul", revenue: 68000, customers: 34, orders: 59 },
  { month: "Aug", revenue: 79000, customers: 41, orders: 68 },
];

const tierData = [
  { name: "Bronze", value: 48, color: "#CD7F32" },
  { name: "Silver", value: 31, color: "#9CA3AF" },
  { name: "Gold", value: 21, color: "#F59E0B" },
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

const recentActivity = [
  { user: "Priya Sharma", action: "Submitted discount request (25%)", module: "Discounts", time: "2m ago", status: "pending" },
  { user: "Rahul Mehta", action: "New customer account created", module: "Customers", time: "18m ago", status: "active" },
  { user: "Admin", action: "Updated Enterprise plan pricing", module: "Subscriptions", time: "1h ago", status: "approved" },
  { user: "Ankit Singh", action: "Warehouse capacity updated", module: "Warehouses", time: "2h ago", status: "active" },
  { user: "Deepa Nair", action: "Product SKU RV-2048 edited", module: "Products", time: "3h ago", status: "approved" },
];

const highValueApprovals = [
  { customer: "Infosys Ltd.", amount: "₹4,80,000", discount: "28%", approver: "Finance" },
  { customer: "TCS Group", amount: "₹3,20,000", discount: "22%", approver: "Finance" },
  { customer: "Wipro Solutions", amount: "₹1,90,000", discount: "18%", approver: "Mgr" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[22px] font-bold text-[#1F2937]">Good morning, Admin</h2>
        <p className="text-[#6B7280] text-sm mt-0.5">Here&apos;s what&apos;s happening across your platform today.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Customers" value="1,284" trend={{ value: "+12%", up: true }} icon={<Users size={18} />} />
        <StatCard label="Active Products" value="342" trend={{ value: "+5%", up: true }} icon={<Package size={18} />} />
        <StatCard label="Active Deals" value="87" trend={{ value: "-3%", up: false }} icon={<Handshake size={18} />} />
        <StatCard label="Pending Approvals" value="14" accent icon={<Clock size={18} />} />
        <StatCard label="Monthly Revenue" value="₹79L" trend={{ value: "+18%", up: true }} icon={<DollarSign size={18} />} />
      </div>

      {/* Business Overview + Cashflow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[#1F2937] font-semibold text-[15px]">Business Overview</h3>
              <p className="text-[#6B7280] text-[12px] mt-0.5">Revenue, customers & orders</p>
            </div>
            <div className="flex items-center gap-4 text-[12px] text-[#6B7280]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#F26C4F] inline-block" />Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#F8B179] inline-block" />Orders</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData} barGap={4}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 12 }}
                formatter={(v: unknown, name: unknown) => { const n = Number(v); const k = String(name); return [k === "revenue" ? `₹${(n/1000).toFixed(0)}K` : n, k === "revenue" ? "Revenue" : "Orders"]; }}
              />
              <Bar dataKey="revenue" fill="#F26C4F" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="orders" fill="#F8B179" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#161616] rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-[15px]">Cashflow</h3>
              <p className="text-[#9CA3AF] text-[12px]">Monthly net revenue</p>
            </div>
            <span className="text-[#F26C4F] bg-[#F26C4F]/10 text-[11px] font-medium px-2 py-0.5 rounded-full">+18%</span>
          </div>
          <p className="text-white text-3xl font-bold mb-1">₹72L</p>
          <p className="text-[#9CA3AF] text-xs mb-4">Aug 2026</p>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={cashflowData}>
              <defs>
                <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F26C4F" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F26C4F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{ background: "#1F1F1F", border: "none", borderRadius: 8, fontSize: 11, color: "#fff" }}
                formatter={(v: unknown) => { const n = Number(v); return [`₹${(n/1000).toFixed(0)}K`, "Revenue"]; }}
              />
              <Area type="monotone" dataKey="value" stroke="#F26C4F" strokeWidth={2} fill="url(#cashGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Customer + Approval + Subscription overviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Customer Overview */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
          <h3 className="text-[#1F2937] font-semibold text-[15px] mb-4">Customer Overview</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Total", value: "1,284" },
              { label: "New (Aug)", value: "+41" },
              { label: "Active", value: "1,102" },
              { label: "Inactive", value: "182" },
            ].map((item) => (
              <div key={item.label} className="bg-[#F4F5F7] rounded-xl p-3">
                <p className="text-[#6B7280] text-[11px]">{item.label}</p>
                <p className="text-[#1F2937] font-bold text-lg">{item.value}</p>
              </div>
            ))}
          </div>
          <p className="text-[#6B7280] text-[12px] mb-2">Tier Distribution</p>
          <div className="flex items-center gap-4">
            <PieChart width={80} height={80}>
              <Pie data={tierData} cx={35} cy={35} innerRadius={22} outerRadius={38} dataKey="value" strokeWidth={0}>
                {tierData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
            <div className="space-y-1.5">
              {tierData.map((t) => (
                <div key={t.name} className="flex items-center gap-2 text-[12px]">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: t.color }} />
                  <span className="text-[#6B7280]">{t.name}</span>
                  <span className="text-[#1F2937] font-medium ml-auto">{t.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Approval Overview */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
          <h3 className="text-[#1F2937] font-semibold text-[15px] mb-4">Approval Overview</h3>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "Pending", value: "14", color: "text-[#F59E0B]", bg: "bg-amber-50" },
              { label: "Approved", value: "87", color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Rejected", value: "11", color: "text-red-500", bg: "bg-red-50" },
            ].map((item) => (
              <div key={item.label} className={`${item.bg} rounded-xl p-3 text-center`}>
                <p className={`${item.color} font-bold text-xl`}>{item.value}</p>
                <p className="text-[#6B7280] text-[11px]">{item.label}</p>
              </div>
            ))}
          </div>
          <p className="text-[#6B7280] text-[12px] mb-2">High-Value Requests</p>
          <div className="space-y-2">
            {highValueApprovals.map((a, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-[#F4F5F7] last:border-0">
                <div>
                  <p className="text-[13px] text-[#1F2937] font-medium">{a.customer}</p>
                  <p className="text-[11px] text-[#6B7280]">{a.amount} · {a.discount} off</p>
                </div>
                <span className="text-[11px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-medium">{a.approver}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Overview */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
          <h3 className="text-[#1F2937] font-semibold text-[15px] mb-4">Subscription Overview</h3>
          <div className="space-y-3 mb-4">
            {[
              { label: "Basic", count: 621, color: "#9CA3AF", pct: 48 },
              { label: "Pro", count: 418, color: "#F8B179", pct: 33 },
              { label: "Enterprise", count: 245, color: "#F26C4F", pct: 19 },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="text-[#6B7280]">{s.label}</span>
                  <span className="text-[#1F2937] font-medium">{s.count.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-[#F4F5F7] rounded-full">
                  <div className="h-1.5 rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-[#F4F5F7] rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[#6B7280]">Monthly Recurring Revenue</p>
              <p className="text-[#1F2937] font-bold text-lg">₹2.84 Cr</p>
            </div>
            <div className="text-emerald-600 text-[12px] font-medium bg-emerald-50 px-2 py-0.5 rounded-full">+22%</div>
          </div>
        </div>
      </div>

      {/* Recent Activity + System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#1F2937] font-semibold text-[15px]">Recent Activity</h3>
            <button className="text-[#F26C4F] text-[12px] font-medium hover:underline">View all</button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                {["User", "Action", "Module", "Time", "Status"].map((h) => (
                  <th key={h} className="pb-2 text-left text-[11px] text-[#6B7280] font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((row, i) => (
                <tr key={i} className="border-b border-[#F4F5F7] last:border-0">
                  <td className="py-3 text-[13px] text-[#1F2937] font-medium pr-3 whitespace-nowrap">{row.user}</td>
                  <td className="py-3 text-[12px] text-[#6B7280] pr-3 max-w-[180px] truncate">{row.action}</td>
                  <td className="py-3 text-[12px] text-[#6B7280] pr-3 whitespace-nowrap">{row.module}</td>
                  <td className="py-3 text-[12px] text-[#6B7280] pr-3 whitespace-nowrap">{row.time}</td>
                  <td className="py-3"><StatusPill status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
            <h3 className="text-[#1F2937] font-semibold text-[15px] mb-4">System Health</h3>
            <div className="space-y-3">
              {[
                { label: "Platform Status", value: "Operational", icon: <Server size={14} />, ok: true },
                { label: "Cloud Backup", value: "Healthy", icon: <CloudLightning size={14} />, ok: true },
                { label: "Last Backup", value: "2h ago", icon: <CheckCircle size={14} />, ok: true },
                { label: "Maintenance", value: "None scheduled", icon: <Clock size={14} />, ok: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#6B7280] text-[12px]">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  <span className={`text-[12px] font-medium ${item.ok ? "text-emerald-600" : "text-red-500"}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#161616] rounded-2xl p-5">
            <p className="text-[#9CA3AF] text-[12px] mb-1">Total Platform MRR</p>
            <p className="text-white text-2xl font-bold">₹2.84 Cr</p>
            <p className="text-[#F8B179] text-[12px] mt-1">+22% growth this quarter</p>
          </div>
        </div>
      </div>
    </div>
  );
}
