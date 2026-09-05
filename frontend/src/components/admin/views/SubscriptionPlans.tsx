import React, { useState } from "react";
import { CreditCard, Check, Plus, Edit2, Archive, ShieldCheck, Zap } from "lucide-react";
import Modal from "../ui/Modal";

const initialPlans = [
  {
    id: 1,
    name: "BASIC",
    monthlyPrice: "₹999",
    annualPrice: "₹9,990",
    maxUsers: "5 users",
    activeSubscribers: 621,
    status: "active",
    features: [
      "Up to 5 users",
      "Basic quotation builder",
      "Basic reporting & analytics",
      "Standard email support",
      "Single warehouse stock tracking",
    ],
  },
  {
    id: 2,
    name: "PRO",
    monthlyPrice: "₹2,999",
    annualPrice: "₹29,990",
    maxUsers: "20 users",
    activeSubscribers: 418,
    status: "active",
    features: [
      "Up to 20 users",
      "Advanced quotations & discount rules",
      "AI deal risk & leakage insights",
      "Advanced analytics & PDF export",
      "External Customer Portal access",
      "Priority support with 4h SLA",
      "Multi-warehouse inventory management",
    ],
  },
  {
    id: 3,
    name: "ENTERPRISE",
    monthlyPrice: "Custom Pricing",
    annualPrice: "Bespoke Contract",
    maxUsers: "Unlimited",
    activeSubscribers: 245,
    status: "active",
    features: [
      "Unlimited user licenses",
      "Advanced AI Deal Explanations",
      "Full API access & webhook integrations",
      "Custom approval workflow routing",
      "Dedicated account manager",
      "24/7 premium support (1h SLA)",
      "Explainable audit trail & SLA guarantees",
    ],
  },
];

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState(initialPlans);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function handleSavePlan() {
    if (!editingPlan) return;
    setPlans(plans.map((p) => (p.id === editingPlan.id ? editingPlan : p)));
    setEditingPlan(null);
    showToast("Subscription plan updated successfully");
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-[#1F2937] tracking-tight">Subscription Plans</h2>
          <p className="text-[#6B7280] text-xs mt-0.5">Manage subscription tiers, feature entitlements, pricing, and subscriber limits.</p>
        </div>
        <button
          onClick={() => showToast("Create Plan modal opened")}
          className="flex items-center gap-1.5 bg-[#F26C4F] text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-[#e05535] transition shadow-xs"
        >
          <Plus size={16} /> Create New Plan
        </button>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-2xl border ${
              plan.name === "PRO" ? "border-[#F26C4F] shadow-md ring-1 ring-[#F26C4F]/20" : "border-[#E5E7EB] shadow-xs"
            } p-5 flex flex-col justify-between relative`}
          >
            {plan.name === "PRO" && (
              <span className="absolute -top-3 right-6 bg-[#F26C4F] text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                Most Popular
              </span>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-base text-[#1F2937] tracking-wide">{plan.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  {plan.activeSubscribers} Subscribers
                </span>
              </div>

              <div className="my-3">
                <p className="text-3xl font-extrabold text-[#1F2937]">{plan.monthlyPrice}</p>
                <p className="text-xs text-[#6B7280] font-medium mt-0.5">{plan.annualPrice} billed annually</p>
              </div>

              <div className="border-t border-[#E5E7EB] pt-3 mt-3 space-y-2 text-xs text-[#374151]">
                <p className="font-bold text-[#1F2937] mb-1">Plan Entitlements:</p>
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check size={14} className="text-[#F26C4F] flex-shrink-0 mt-0.5" />
                    <span className="text-[#4B5563]">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
              <button
                onClick={() => setEditingPlan(plan)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E7EB] bg-white hover:bg-[#F4F5F7] text-xs font-bold text-[#374151] rounded-xl transition"
              >
                <Edit2 size={14} /> Edit Plan
              </button>
              <button
                onClick={() => showToast(`Archived ${plan.name} plan`)}
                className="text-xs text-[#6B7280] hover:text-red-600 font-medium"
              >
                Archive
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <Modal title={`Edit Plan — ${editingPlan.name}`} onClose={() => setEditingPlan(null)}>
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#374151] mb-1">Monthly Price</label>
                <input
                  value={editingPlan.monthlyPrice}
                  onChange={(e) => setEditingPlan({ ...editingPlan, monthlyPrice: e.target.value })}
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#374151] mb-1">User Limit</label>
                <input
                  value={editingPlan.maxUsers}
                  onChange={(e) => setEditingPlan({ ...editingPlan, maxUsers: e.target.value })}
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingPlan(null)} className="px-4 py-2 border border-[#E5E7EB] rounded-xl text-xs font-semibold hover:bg-[#F4F5F7]">
                Cancel
              </button>
              <button onClick={handleSavePlan} className="px-4 py-2 bg-[#F26C4F] text-white rounded-xl text-xs font-bold hover:bg-[#e05535]">
                Save Plan Changes
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
