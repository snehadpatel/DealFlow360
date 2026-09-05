import React, { useState } from "react";
import { Percent, Shield, Plus, Edit2, CheckCircle2, ShieldCheck, Layers, GitMerge } from "lucide-react";
import Modal from "../ui/Modal";

const initialTiers = [
  { id: 1, name: "Bronze Tier", maxDiscount: 5, status: "active", priority: "Standard" },
  { id: 2, name: "Silver Tier", maxDiscount: 10, status: "active", priority: "Priority" },
  { id: 3, name: "Gold Tier", maxDiscount: 15, status: "active", priority: "VIP" },
];

const initialCategories = [
  { category: "Hardware", maxDiscount: 15, rule: "Requires stock check above 10%" },
  { category: "Software", maxDiscount: 10, rule: "Ceiling enforced at checkout" },
  { category: "Services", maxDiscount: 10, rule: "Consulting rate protection" },
];

const initialChain = [
  { range: "0% – 5%", requiredRole: "Auto Approved", color: "bg-emerald-100 text-emerald-800" },
  { range: "5% – 10%", requiredRole: "Sales Manager", color: "bg-blue-100 text-blue-800" },
  { range: "10% – 15%", requiredRole: "Finance Department", color: "bg-purple-100 text-purple-800" },
  { range: "15%+", requiredRole: "Senior Management / Admin", color: "bg-red-100 text-red-800" },
];

export default function Discounts() {
  const [tiersList, setTiersList] = useState(initialTiers);
  const [categoryRules, setCategoryRules] = useState(initialCategories);
  const [approvalChain, setApprovalChain] = useState(initialChain);
  const [editingTier, setEditingTier] = useState<any | null>(null);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function handleSaveTierUpdate() {
    if (!editingTier) return;
    setTiersList(tiersList.map((t) => (t.id === editingTier.id ? editingTier : t)));
    setEditingTier(null);
    showToast("Tier discount threshold updated successfully");
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
      <div>
        <h2 className="text-[20px] font-bold text-[#1F2937] tracking-tight">Discounts & Approval Workflows</h2>
        <p className="text-[#6B7280] text-xs mt-0.5">Configure tier discount limits, category ceilings, and automated approval chains.</p>
      </div>

      {/* 1. Customer Tier Discount Configuration (Prompt Specs) */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-50 text-[#F26C4F]"><Percent size={18} /></div>
            <div>
              <h3 className="text-[#1F2937] font-bold text-[15px]">Customer Tier Discount Ceilings</h3>
              <p className="text-[#6B7280] text-xs">Maximum allowed discount per quotation by tier</p>
            </div>
          </div>
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

      {/* 3. Configurable Approval Chain (Prompt Specs) */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600"><GitMerge size={18} /></div>
            <div>
              <h3 className="text-[#1F2937] font-bold text-[15px]">Multi-Tier Approval Chain Routing</h3>
              <p className="text-[#6B7280] text-xs">Automatic routing of quotation discount requests based on threshold</p>
            </div>
          </div>
          <button
            onClick={() => showToast("Approval chain rules saved")}
            className="text-xs font-bold text-[#F26C4F] hover:underline"
          >
            Save Chain Routing
          </button>
        </div>

        <div className="space-y-3">
          {approvalChain.map((step, i) => (
            <div key={i} className="flex items-center justify-between p-3.5 bg-[#FAFBFD] border border-[#E5E7EB] rounded-xl text-xs">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#1F2937] text-white flex items-center justify-center font-bold text-[11px]">
                  {i + 1}
                </span>
                <div>
                  <p className="font-bold text-[#1F2937]">Discount Request Range: <span className="text-[#F26C4F]">{step.range}</span></p>
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

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingTier(null)} className="px-4 py-2 border border-[#E5E7EB] rounded-xl text-xs font-semibold hover:bg-[#F4F5F7]">
                Cancel
              </button>
              <button onClick={handleSaveTierUpdate} className="px-4 py-2 bg-[#F26C4F] text-white rounded-xl text-xs font-bold hover:bg-[#e05535]">
                Save Threshold
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
