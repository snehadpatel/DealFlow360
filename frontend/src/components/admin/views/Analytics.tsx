import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line,
  PieChart, Pie, Cell,
  AreaChart, Area,
} from "recharts";

const revenueData = [
  { month: "Jan", revenue: 42, target: 50 },
  { month: "Feb", revenue: 51, target: 50 },
  { month: "Mar", revenue: 47, target: 55 },
  { month: "Apr", revenue: 63, target: 55 },
  { month: "May", revenue: 58, target: 60 },
  { month: "Jun", revenue: 71, target: 60 },
  { month: "Jul", revenue: 68, target: 65 },
  { month: "Aug", revenue: 79, target: 70 },
];

const customerGrowth = [
  { month: "Jan", new: 18, churned: 4 },
  { month: "Feb", new: 22, churned: 6 },
  { month: "Mar", new: 19, churned: 5 },
  { month: "Apr", new: 31, churned: 7 },
  { month: "May", new: 27, churned: 5 },
  { month: "Jun", new: 36, churned: 8 },
  { month: "Jul", new: 34, churned: 6 },
  { month: "Aug", new: 41, churned: 7 },
];

const subscriptionRevenue = [
  { month: "Jan", basic: 68, pro: 88, enterprise: 123 },
  { month: "Feb", basic: 70, pro: 94, enterprise: 136 },
  { month: "Mar", basic: 71, pro: 96, enterprise: 128 },
  { month: "Apr", basic: 74, pro: 103, enterprise: 150 },
  { month: "May", basic: 73, pro: 107, enterprise: 144 },
  { month: "Jun", basic: 76, pro: 115, enterprise: 168 },
  { month: "Jul", basic: 75, pro: 112, enterprise: 164 },
  { month: "Aug", basic: 78, pro: 121, enterprise: 178 },
];

const tierDist = [
  { name: "Bronze", value: 617, color: "#CD7F32" },
  { name: "Silver", value: 398, color: "#9CA3AF" },
  { name: "Gold", value: 269, color: "#F59E0B" },
];

const topProducts = [
  { name: "Revalo Pro Server", revenue: 48, units: 12 },
  { name: "Cloud Suite", revenue: 36, units: 84 },
  { name: "SmartSwitch 48P", revenue: 22, units: 31 },
  { name: "Support Pack", revenue: 18, units: 52 },
  { name: "Backup Agent", revenue: 9, units: 118 },
];

const discountData = [
  { range: "0–5%", count: 234 },
  { range: "5–10%", count: 156 },
  { range: "10–15%", count: 87 },
  { range: "15–20%", count: 43 },
  { range: ">20%", count: 18 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 shadow-sm text-[12px]">
      <p className="text-[#6B7280] mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
      <div className="mb-4">
        <h3 className="text-[15px] font-semibold text-[#1F2937]">{title}</h3>
        {subtitle && <p className="text-[12px] text-[#6B7280] mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export default function Analytics() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[18px] font-bold text-[#1F2937]">Reports & Analytics</h2>
        <p className="text-[#6B7280] text-sm">Platform-wide performance and business intelligence.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue (Aug)", value: "₹79L", change: "+18%", up: true },
          { label: "Active Subscribers", value: "1,284", change: "+12%", up: true },
          { label: "Avg Deal Value", value: "₹3.2L", change: "+7%", up: true },
          { label: "Discount Approvals", value: "112", change: "-4%", up: false },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-[#E5E7EB] p-4">
            <p className="text-[12px] text-[#6B7280]">{kpi.label}</p>
            <p className="text-[24px] font-bold text-[#1F2937] mt-1">{kpi.value}</p>
            <p className={`text-[12px] font-medium mt-1 ${kpi.up ? "text-emerald-600" : "text-red-500"}`}>{kpi.change} vs last month</p>
          </div>
        ))}
      </div>

      {/* Revenue Trend + Customer Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Revenue Trend" subtitle="Monthly revenue vs target (₹L)">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F26C4F" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#F26C4F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#F26C4F" strokeWidth={2} fill="url(#revGrad)" dot={false} />
              <Line type="monotone" dataKey="target" name="Target" stroke="#F8B179" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Customer Growth" subtitle="New vs churned customers">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={customerGrowth} barGap={3}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="new" name="New" fill="#F26C4F" radius={[3, 3, 0, 0]} maxBarSize={18} />
              <Bar dataKey="churned" name="Churned" fill="#FCA5A5" radius={[3, 3, 0, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Subscription Revenue + Tier Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SectionCard title="Subscription Revenue by Plan" subtitle="Monthly revenue breakdown (₹L)">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={subscriptionRevenue} barGap={3}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="basic" name="Basic" fill="#9CA3AF" radius={[3, 3, 0, 0]} maxBarSize={14} />
                <Bar dataKey="pro" name="Pro" fill="#F8B179" radius={[3, 3, 0, 0]} maxBarSize={14} />
                <Bar dataKey="enterprise" name="Enterprise" fill="#F26C4F" radius={[3, 3, 0, 0]} maxBarSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        </div>
        <SectionCard title="Tier Distribution" subtitle="Customers by tier">
          <div className="flex flex-col items-center">
            <PieChart width={160} height={160}>
              <Pie data={tierDist} cx={75} cy={75} innerRadius={40} outerRadius={75} dataKey="value" strokeWidth={0}>
                {tierDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
            <div className="w-full space-y-2 mt-2">
              {tierDist.map((t) => (
                <div key={t.name} className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
                    <span className="text-[#6B7280]">{t.name}</span>
                  </div>
                  <span className="text-[#1F2937] font-medium">{t.value}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Top Products + Discount Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Product Performance" subtitle="Revenue by product (₹L)">
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.name}>
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="text-[#1F2937] font-medium">{p.name}</span>
                  <span className="text-[#6B7280]">₹{p.revenue}L · {p.units} units</span>
                </div>
                <div className="h-2 bg-[#F4F5F7] rounded-full">
                  <div className="h-2 rounded-full" style={{ width: `${(p.revenue / 48) * 100}%`, background: i === 0 ? "#F26C4F" : i === 1 ? "#F8B179" : "#D1D5DB" }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Discount Usage" subtitle="Number of requests per discount range">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={discountData}>
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Requests" fill="#F26C4F" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>
    </div>
  );
}
