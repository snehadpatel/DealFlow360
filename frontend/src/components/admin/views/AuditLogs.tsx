import React, { useState } from "react";
import { FileText, Search, Filter, Calendar, User, ShieldCheck } from "lucide-react";

const initialLogs = [
  {
    id: 1,
    user: "Super Admin",
    role: "ADMIN",
    action: "Updated Tier Threshold",
    entity: "CustomerTier",
    entityId: "TIER-GOLD",
    prevValue: "10% max discount",
    newValue: "15% max discount",
    reason: "Strategic competitive adjustment for Q3",
    ip: "192.168.1.104 (macOS)",
    timestamp: "05 Sep 2026, 14:32 IST",
  },
  {
    id: 2,
    user: "Felix Finance",
    role: "FINANCE",
    action: "Approved High-Value Quotation",
    entity: "Quotation",
    entityId: "Q-1042",
    prevValue: "PENDING_APPROVAL",
    newValue: "APPROVED",
    reason: "Approved 28% discount for Infosys strategic deal",
    ip: "192.168.1.112 (Windows)",
    timestamp: "05 Sep 2026, 12:15 IST",
  },
  {
    id: 3,
    user: "Maria Manager",
    role: "MANAGER",
    action: "Upgraded Customer Tier",
    entity: "Customer",
    entityId: "CUST-ABC-01",
    prevValue: "Silver Tier",
    newValue: "Gold Tier",
    reason: "Customer reached ₹50L annual spending milestone",
    ip: "192.168.1.120 (macOS)",
    timestamp: "04 Sep 2026, 17:40 IST",
  },
  {
    id: 4,
    user: "Ops Team Lead",
    role: "OPERATIONS",
    action: "Created Shipment Track",
    entity: "Shipment",
    entityId: "SHP-9082",
    prevValue: "PROCESSING",
    newValue: "SHIPPED",
    reason: "Dispatched via BlueDart (Tracking: BD-987123)",
    ip: "192.168.1.108 (Ubuntu)",
    timestamp: "04 Sep 2026, 11:20 IST",
  },
  {
    id: 5,
    user: "Alex Kumar",
    role: "REP",
    action: "Submitted Discount Request",
    entity: "Quotation",
    entityId: "Q-1038",
    prevValue: "DRAFT",
    newValue: "PENDING_APPROVAL",
    reason: "22% discount requested for TCS volume order",
    ip: "192.168.1.130 (macOS)",
    timestamp: "03 Sep 2026, 16:05 IST",
  },
];

export default function AuditLogs() {
  const [logs] = useState(initialLogs);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = logs.filter((l) => {
    const mSearch =
      l.user.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.entityId.toLowerCase().includes(search.toLowerCase());
    const mRole = roleFilter === "all" || l.role === roleFilter;
    return mSearch && mRole;
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[20px] font-bold text-[#1F2937] tracking-tight">Audit Logs & Explainable Trail</h2>
        <p className="text-[#6B7280] text-xs mt-0.5">Immutable record of all administrative, financial, and operational modifications across DealFlow360.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-xs">
        <div className="flex items-center justify-between gap-3 p-4 border-b border-[#E5E7EB] flex-wrap">
          <div className="flex items-center gap-2 bg-[#F4F5F7] rounded-xl px-3 py-2 flex-1 min-w-[200px]">
            <Search size={15} className="text-[#9CA3AF] flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user, action, quotation ID..."
              className="bg-transparent outline-none text-xs text-[#1F2937] w-full placeholder-[#9CA3AF]"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-[#E5E7EB] bg-white rounded-xl px-3 py-2 text-xs font-medium text-[#374151] outline-none"
          >
            <option value="all">All Roles</option>
            <option value="ADMIN">Super Admin</option>
            <option value="FINANCE">Finance</option>
            <option value="MANAGER">Sales Manager</option>
            <option value="REP">Sales Rep</option>
            <option value="OPERATIONS">Operations</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#FAFBFD] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                <th className="py-3 px-4">User & Role</th>
                <th className="py-3 px-4">Action & Entity</th>
                <th className="py-3 px-4">State Change (Prev → New)</th>
                <th className="py-3 px-4">Audit Reason (WHY)</th>
                <th className="py-3 px-4">IP & Device</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F5F7] text-xs">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-[#FFF8F6]/50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-[#1F2937]">{log.user}</p>
                    <span className="text-[10px] font-bold text-[#F26C4F]">{log.role}</span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-[#1F2937]">{log.action}</p>
                    <p className="text-[11px] font-mono text-[#6B7280]">{log.entity}: {log.entityId}</p>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px]">
                    <span className="text-[#6B7280]">{log.prevValue}</span>
                    <span className="text-[#F26C4F] font-bold mx-1">→</span>
                    <span className="text-[#1F2937] font-bold">{log.newValue}</span>
                  </td>
                  <td className="py-3 px-4 text-[#4B5563] max-w-xs">{log.reason}</td>
                  <td className="py-3 px-4 text-[#6B7280] font-mono text-[10px]">{log.ip}</td>
                  <td className="py-3 px-4 text-[#6B7280] whitespace-nowrap">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
