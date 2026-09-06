import React, { useState, useEffect } from "react";
import { Percent, Shield, Plus, Edit2, CheckCircle2, ShieldCheck, Layers, GitMerge } from "lucide-react";
import Modal from "../ui/Modal";
import { fetchDiscountRulesList, createDiscountRuleApi, updateDiscountRuleApi } from "../../../api/adminApi";

export default function Discounts() {
  const [dbRules, setDbRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTier, setEditingTier] = useState<any | null>(null);
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);

  // Default tiers state
  const [tiersList, setTiersList] = useState([
    { id: 'GOLD', tier: 'GOLD', name: "Gold Tier", maxDiscount: 15, status: "active", priority: "VIP" },
    { id: 'SILVER', tier: 'SILVER', name: "Silver Tier", maxDiscount: 12, status: "active", priority: "Priority" },
    { id: 'BRONZE', tier: 'BRONZE', name: "Bronze Tier", maxDiscount: 8, status: "active", priority: "Standard" },
  ]);

  const [categoryRules, setCategoryRules] = useState([
    { category: "Hardware", maxDiscount: 15, rule: "Requires stock check above 10%" },
    { category: "Software", maxDiscount: 10, rule: "Ceiling enforced at checkout" },
    { category: "Services", maxDiscount: 10, rule: "Consulting rate protection" },
  ]);

  const approvalChain = [
    { range: "0% – 5%", requiredRole: "Auto Approved", color: "bg-emerald-100 text-emerald-800" },
    { range: "5% – 15%", requiredRole: "Sales Manager", color: "bg-blue-100 text-blue-800" },
    { range: "15%+", requiredRole: "Finance Department & Manager", color: "bg-purple-100 text-purple-800" },
    { range: "Margin < 15%", requiredRole: "Finance Floor Override", color: "bg-rose-100 text-rose-800" },
  ];

  useEffect(() => {
    loadDiscountRules();
  }, []);

  async function loadDiscountRules() {
    setLoading(true);
    try {
      const rules = await fetchDiscountRulesList();
      if (Array.isArray(rules) && rules.length > 0) {
        setDbRules(rules);

        // Find tier-specific rules
        const goldRule = rules.find((r) => r.tier === "GOLD");
        const silverRule = rules.find((r) => r.tier === "SILVER");
        const bronzeRule = rules.find((r) => r.tier === "BRONZE");

        setTiersList([
          {
            id: goldRule?.id || "GOLD",
            tier: "GOLD",
            name: "Gold Tier",
            maxDiscount: goldRule?.max_discount ?? 15,
            status: "active",
            priority: "VIP",
          },
          {
            id: silverRule?.id || "SILVER",
            tier: "SILVER",
            name: "Silver Tier",
            maxDiscount: silverRule?.max_discount ?? 12,
            status: "active",
            priority: "Priority",
          },
          {
            id: bronzeRule?.id || "BRONZE",
            tier: "BRONZE",
            name: "Bronze Tier",
            maxDiscount: bronzeRule?.max_discount ?? 8,
            status: "active",
            priority: "Standard",
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to load discount rules from DB:", err);
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  async function handleSaveTierUpdate() {
    if (!editingTier) return;
    setSaving(true);
    try {
      const existing = dbRules.find((r) => r.tier === editingTier.tier);
      if (existing && existing.id) {
        await updateDiscountRuleApi(existing.id, {
          tier: editingTier.tier,
          max_discount: Number(editingTier.maxDiscount),
          min_margin: 12.0,
          manager_approval_threshold: 10.0,
          finance_approval_threshold: 15.0,
        });
      } else {
        await createDiscountRuleApi({
          tier: editingTier.tier,
          max_discount: Number(editingTier.maxDiscount),
          min_margin: 12.0,
          manager_approval_threshold: 10.0,
          finance_approval_threshold: 15.0,
        });
      }
      await loadDiscountRules();
      setEditingTier(null);
      showToast(`${editingTier.name} threshold updated and saved to database`);
    } catch (e) {
      showToast("Error updating discount rule in database");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1F2937] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2 animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-[20px] font-bold text-[#1F2937] tracking-tight">Discounts & Approval Workflows</h2>
        <p className="text-[#6B7280] text-xs mt-0.5">Configure tier discount limits, category ceilings, and automated approval chains in the database.</p>
      </div>

      {/* 1. Customer Tier Discount Configuration */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-50 text-[#F26C4F]"><Percent size={18} /></div>
            <div>
              <h3 className="text-[#1F2937] font-bold text-[15px]">Customer Tier Discount Ceilings</h3>
              <p className="text-[#6B7280] text-xs">Maximum allowed discount per quotation saved in database</p>
            </div>
          </div>
          <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Active in dealflow360.db
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiersList.map((tier) => (
            <div key={tier.id} className="bg-[#FAFBFD] border border-[#E5E7EB] rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-[#1F2937]">{tier.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                    {tier.status}
                  </span>
                </div>
                <p className="text-3xl font-extrabold text-[#F26C4F] my-1">{tier.maxDiscount}% <span className="text-xs font-normal text-[#6B7280]">max</span></p>
                <p className="text-[11px] text-[#6B7280]">Priority Level: {tier.priority}</p>
              </div>

              <button
                onClick={() => setEditingTier(tier)}
                className="mt-3 w-full py-1.5 border border-[#E5E7EB] bg-white hover:bg-[#F4F5F7] text-xs font-bold text-[#374151] rounded-lg transition"
              >
                Edit Threshold
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Category-Specific Discount Limits */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><Layers size={18} /></div>
            <div>
              <h3 className="text-[#1F2937] font-bold text-[15px]">Category Discount Limits</h3>
              <p className="text-[#6B7280] text-xs">Enforce margin protections per product line</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categoryRules.map((c) => (
            <div key={c.category} className="bg-white border border-[#E5E7EB] rounded-xl p-4">
              <p className="font-bold text-sm text-[#1F2937]">{c.category}</p>
              <p className="text-2xl font-extrabold text-[#1F2937] my-1">{c.maxDiscount}% Limit</p>
              <p className="text-[11px] text-[#6B7280]">{c.rule}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Configurable Approval Chain */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600"><GitMerge size={18} /></div>
            <div>
              <h3 className="text-[#1F2937] font-bold text-[15px]">Multi-Tier Approval Chain Routing</h3>
              <p className="text-[#6B7280] text-xs">Automatic routing of quotation discount requests based on threshold</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {approvalChain.map((step, i) => (
            <div key={i} className="flex items-center justify-between p-3.5 bg-[#FAFBFD] border border-[#E5E7EB] rounded-xl text-xs">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#1F2937] text-white flex items-center justify-center font-bold text-[11px]">
                  {i + 1}
                </span>
                <div>
                  <p className="font-bold text-[#1F2937]">Discount Request Trigger: <span className="text-[#F26C4F]">{step.range}</span></p>
                  <p className="text-[11px] text-[#6B7280]">Target Approver Role</p>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold ${step.color}`}>
                {step.requiredRole}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Tier Modal */}
      {editingTier && (
        <Modal title={`Edit ${editingTier.name} Discount Limit`} onClose={() => setEditingTier(null)}>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-[#374151] mb-1">Maximum Discount % Ceiling *</label>
              <input
                type="number"
                value={editingTier.maxDiscount}
                onChange={(e) => setEditingTier({ ...editingTier, maxDiscount: Number(e.target.value) })}
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#374151] mb-1">Priority Classification</label>
              <input
                value={editingTier.priority}
                onChange={(e) => setEditingTier({ ...editingTier, priority: e.target.value })}
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E7EB]">
              <button onClick={() => setEditingTier(null)} className="px-4 py-2 border border-[#E5E7EB] rounded-xl text-xs font-semibold hover:bg-[#F4F5F7]">
                Cancel
              </button>
              <button
                disabled={saving}
                onClick={handleSaveTierUpdate}
                className="px-4 py-2 bg-[#F26C4F] text-white rounded-xl text-xs font-bold hover:bg-[#e05535] disabled:opacity-50"
              >
                {saving ? "Saving to DB..." : "Save Threshold to Database"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
