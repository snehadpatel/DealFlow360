import React, { useState } from "react";
import { Tag, Plus, Edit2, Trash2, CheckCircle2, DollarSign, Calendar, Layers, ShieldCheck } from "lucide-react";
import Modal from "../ui/Modal";

const initialRules = [
  {
    id: 1,
    product: "Enterprise Laptop Pro X1",
    sku: "LAP-PRO-X1",
    basePrice: 85000,
    goldPrice: 76000,
    silverPrice: 78000,
    bronzePrice: 80000,
    qtyDiscountMin: 10,
    qtyDiscountPct: 8,
    effectiveDate: "01 Jan 2026",
    status: "active",
  },
  {
    id: 2,
    product: "Cloud Management Suite",
    sku: "SaaS-CMS-ENT",
    basePrice: 12000,
    goldPrice: 9600,
    silverPrice: 10800,
    bronzePrice: 11400,
    qtyDiscountMin: 50,
    qtyDiscountPct: 15,
    effectiveDate: "15 Jan 2026",
    status: "active",
  },
  {
    id: 3,
    product: "Network Security Firewall XG-500",
    sku: "NET-FW-XG500",
    basePrice: 150000,
    goldPrice: 135000,
    silverPrice: 142000,
    bronzePrice: 148000,
    qtyDiscountMin: 5,
    qtyDiscountPct: 10,
    effectiveDate: "01 Feb 2026",
    status: "active",
  },
];

export default function Pricing() {
  const [rules, setRules] = useState(initialRules);
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [newRule, setNewRule] = useState({
    product: "",
    sku: "",
    basePrice: 0,
    goldPrice: 0,
    silverPrice: 0,
    bronzePrice: 0,
    qtyDiscountMin: 10,
    qtyDiscountPct: 5,
    effectiveDate: "01 Sep 2026",
  });

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function handleCreateRule() {
    if (!newRule.product || !newRule.basePrice) return;
    setRules([...rules, { ...newRule, id: Date.now(), status: "active" }]);
    setAddOpen(false);
    showToast("New tier pricing rule saved successfully");
  }

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1F2937] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2 animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-[#1F2937] tracking-tight">Centralized Pricing Engine</h2>
          <p className="text-[#6B7280] text-xs mt-0.5">Define base, customer-tier, and quantity-based pricing rules without writing code.</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 bg-[#F26C4F] text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-[#e05535] transition shadow-xs"
        >
          <Plus size={16} /> Define Pricing Rule
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280] text-xs font-semibold">Tier Pricing Matrices</span>
            <div className="p-2 rounded-xl bg-orange-50 text-[#F26C4F]"><Tag size={16} /></div>
          </div>
          <p className="text-2xl font-extrabold text-[#1F2937] mt-2">{rules.length} Configured</p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Gold, Silver, Bronze matrix active</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280] text-xs font-semibold">Volume Discount Triggers</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><Layers size={16} /></div>
          </div>
          <p className="text-2xl font-extrabold text-[#1F2937] mt-2">Active</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Auto-applied at checkout</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280] text-xs font-semibold">Effective Tax Rate</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><ShieldCheck size={16} /></div>
          </div>
          <p className="text-2xl font-extrabold text-[#1F2937] mt-2">18% GST</p>
          <p className="text-[10px] text-blue-600 font-bold mt-0.5">India Commercial Standard</p>
        </div>
      </div>

      {/* Pricing Rules Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <h3 className="text-[#1F2937] font-bold text-sm">Configured Product Pricing Matrix</h3>
          <span className="text-xs text-[#6B7280]">Changes take effect immediately on new quotations</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#FAFBFD] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                <th className="py-3 px-4">Product & SKU</th>
                <th className="py-3 px-4">Base Price</th>
                <th className="py-3 px-4 text-amber-700">Gold Tier</th>
                <th className="py-3 px-4 text-slate-700">Silver Tier</th>
                <th className="py-3 px-4 text-orange-800">Bronze Tier</th>
                <th className="py-3 px-4">Volume Discount</th>
                <th className="py-3 px-4">Effective Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F5F7] text-xs">
              {rules.map((r) => (
                <tr key={r.id} className="hover:bg-[#FFF8F6]/50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-[#1F2937]">{r.product}</p>
                    <p className="text-[11px] font-mono text-[#6B7280]">{r.sku}</p>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#1F2937]">₹{r.basePrice.toLocaleString("en-IN")}</td>
                  <td className="py-3 px-4 font-extrabold text-amber-600 bg-amber-50/50">
                    ₹{r.goldPrice.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-700">
                    ₹{r.silverPrice.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 px-4 font-bold text-orange-800">
                    ₹{r.bronzePrice.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 px-4 font-medium text-[#374151]">
                    {r.qtyDiscountPct}% off (Min {r.qtyDiscountMin} units)
                  </td>
                  <td className="py-3 px-4 text-[#6B7280]">{r.effectiveDate}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => showToast(`Editing rule for ${r.product}`)}
                      className="p-1.5 text-[#6B7280] hover:text-[#F26C4F] transition"
                    >
                      <Edit2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Define Rule Modal */}
      {addOpen && (
        <Modal title="Define Product Pricing Rule" onClose={() => setAddOpen(false)}>
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#374151] mb-1">Product Name *</label>
                <input
                  value={newRule.product}
                  onChange={(e) => setNewRule({ ...newRule, product: e.target.value })}
                  placeholder="e.g. Laptop Pro 14"
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#374151] mb-1">Base Catalog Price (₹) *</label>
                <input
                  type="number"
                  value={newRule.basePrice}
                  onChange={(e) => {
                    const bp = Number(e.target.value);
                    setNewRule({
                      ...newRule,
                      basePrice: bp,
                      goldPrice: Math.round(bp * 0.90),
                      silverPrice: Math.round(bp * 0.95),
                      bronzePrice: bp,
                    });
                  }}
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                />
              </div>
            </div>

            <p className="font-bold text-[#F26C4F] text-xs pt-1">Automated Tier Prices (Configurable)</p>
            <div className="grid grid-cols-3 gap-3 bg-[#FFF8F6] p-3 rounded-xl border border-[#F26C4F]/20">
              <div>
                <label className="block text-[10px] font-bold text-[#374151] mb-0.5">Gold Price (₹)</label>
                <input
                  type="number"
                  value={newRule.goldPrice}
                  onChange={(e) => setNewRule({ ...newRule, goldPrice: Number(e.target.value) })}
                  className="w-full bg-white border border-[#E5E7EB] rounded-lg px-2.5 py-1 text-xs font-bold text-[#1F2937]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#374151] mb-0.5">Silver Price (₹)</label>
                <input
                  type="number"
                  value={newRule.silverPrice}
                  onChange={(e) => setNewRule({ ...newRule, silverPrice: Number(e.target.value) })}
                  className="w-full bg-white border border-[#E5E7EB] rounded-lg px-2.5 py-1 text-xs font-bold text-[#1F2937]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#374151] mb-0.5">Bronze Price (₹)</label>
                <input
                  type="number"
                  value={newRule.bronzePrice}
                  onChange={(e) => setNewRule({ ...newRule, bronzePrice: Number(e.target.value) })}
                  className="w-full bg-white border border-[#E5E7EB] rounded-lg px-2.5 py-1 text-xs font-bold text-[#1F2937]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-bold text-[#374151] mb-1">Volume Min Units</label>
                <input
                  type="number"
                  value={newRule.qtyDiscountMin}
                  onChange={(e) => setNewRule({ ...newRule, qtyDiscountMin: Number(e.target.value) })}
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#374151] mb-1">Volume Discount %</label>
                <input
                  type="number"
                  value={newRule.qtyDiscountPct}
                  onChange={(e) => setNewRule({ ...newRule, qtyDiscountPct: Number(e.target.value) })}
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAddOpen(false)}
                className="px-4 py-2 border border-[#E5E7EB] rounded-xl text-xs font-semibold hover:bg-[#F4F5F7]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRule}
                className="px-4 py-2 bg-[#F26C4F] text-white rounded-xl text-xs font-bold hover:bg-[#e05535]"
              >
                Save Pricing Rule
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
