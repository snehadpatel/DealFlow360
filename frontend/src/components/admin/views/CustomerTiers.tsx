import React, { useState } from "react";
import { Award, Edit2, ShieldCheck, Check } from "lucide-react";
import Modal from "../ui/Modal";

const initialTiers = [
  {
    id: 1,
    name: "BRONZE",
    discountLimit: "5%",
    priorityLevel: "Standard",
    paymentTerms: "Net 15",
    supportLevel: "Standard Email Support",
    approvalPrivileges: "Manager approval required above 5%",
    negotiationPrivileges: "Single round counter-offers",
    pricingBenefits: "Standard catalog pricing",
  },
  {
    id: 2,
    name: "SILVER",
    discountLimit: "10%",
    priorityLevel: "Priority",
    paymentTerms: "Net 30",
    supportLevel: "Priority Ticket Support (4h SLA)",
    approvalPrivileges: "Auto-approve up to 10%",
    negotiationPrivileges: "Up to 3 counter-offer rounds",
    pricingBenefits: "5% baseline discount across hardware",
  },
  {
    id: 3,
    name: "GOLD",
    discountLimit: "15%",
    priorityLevel: "VIP Premium",
    paymentTerms: "Net 45",
    supportLevel: "24/7 Dedicated Account Manager (1h SLA)",
    approvalPrivileges: "Priority executive approval queue",
    negotiationPrivileges: "Direct rep thread with instant approval routing",
    pricingBenefits: "10% baseline discount on all hardware & software",
  },
];

export default function CustomerTiers() {
  const [tiers, setTiers] = useState(initialTiers);
  const [editingTier, setEditingTier] = useState<any | null>(null);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function handleSaveTier() {
    if (!editingTier) return;
    setTiers(tiers.map((t) => (t.id === editingTier.id ? editingTier : t)));
    setEditingTier(null);
    showToast("Customer Tier parameters saved");
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
        <h2 className="text-[20px] font-bold text-[#1F2937] tracking-tight">Customer Commercial Tiers</h2>
        <p className="text-[#6B7280] text-xs mt-0.5">Configure commercial parameters, payment terms, and privileges for Bronze, Silver, and Gold accounts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {tiers.map((tier) => (
          <div key={tier.id} className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-base text-[#1F2937]">{tier.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-50 text-[#F26C4F] rounded-full border border-orange-200">
                  Max {tier.discountLimit} Discount
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-[#374151] mt-4 border-t border-[#E5E7EB] pt-3">
                <p><strong className="text-[#1F2937]">Payment Terms:</strong> {tier.paymentTerms}</p>
                <p><strong className="text-[#1F2937]">Priority Level:</strong> {tier.priorityLevel}</p>
                <p><strong className="text-[#1F2937]">Support SLA:</strong> {tier.supportLevel}</p>
                <p><strong className="text-[#1F2937]">Approval Routing:</strong> {tier.approvalPrivileges}</p>
                <p><strong className="text-[#1F2937]">Negotiations:</strong> {tier.negotiationPrivileges}</p>
                <p><strong className="text-[#1F2937]">Pricing Benefit:</strong> {tier.pricingBenefits}</p>
              </div>
            </div>

            <button
              onClick={() => setEditingTier(tier)}
              className="mt-5 w-full py-2 border border-[#E5E7EB] bg-white hover:bg-[#F4F5F7] text-xs font-bold text-[#374151] rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Edit2 size={14} /> Edit Tier Rules
            </button>
          </div>
        ))}
      </div>

      {editingTier && (
        <Modal title={`Edit Commercial Rules — ${editingTier.name}`} onClose={() => setEditingTier(null)}>
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#374151] mb-1">Max Discount % Limit</label>
                <input
                  value={editingTier.discountLimit}
                  onChange={(e) => setEditingTier({ ...editingTier, discountLimit: e.target.value })}
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#374151] mb-1">Payment Terms</label>
                <select
                  value={editingTier.paymentTerms}
                  onChange={(e) => setEditingTier({ ...editingTier, paymentTerms: e.target.value })}
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                >
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 45">Net 45</option>
                  <option value="Net 60">Net 60</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#374151] mb-1">Support Level SLA</label>
              <input
                value={editingTier.supportLevel}
                onChange={(e) => setEditingTier({ ...editingTier, supportLevel: e.target.value })}
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#374151] mb-1">Pricing Benefits</label>
              <input
                value={editingTier.pricingBenefits}
                onChange={(e) => setEditingTier({ ...editingTier, pricingBenefits: e.target.value })}
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingTier(null)} className="px-4 py-2 border border-[#E5E7EB] rounded-xl text-xs font-semibold hover:bg-[#F4F5F7]">
                Cancel
              </button>
              <button onClick={handleSaveTier} className="px-4 py-2 bg-[#F26C4F] text-white rounded-xl text-xs font-bold hover:bg-[#e05535]">
                Save Tier Parameters
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
