import React, { useState, useEffect } from "react";
import { Plus, Check, Users, ChevronLeft, ChevronRight } from "lucide-react";
import Modal from "../ui/Modal";
import {
  fetchSubscriptionPlansList,
  createSubscriptionPlanApi,
  updateSubscriptionPlanApi,
  deleteSubscriptionPlanApi,
} from "../../../api/adminApi";

type Plan = {
  id: number | string;
  name: string;
  price: number;
  billing: string;
  description: string;
  features: string[];
  subscribers: number;
  limit: number | null;
  status: "active" | "inactive";
  highlight?: boolean;
  persisted?: boolean;
};

const initialPlans: Plan[] = [
  {
    id: 1, name: "BASIC", price: 999, billing: "Monthly", description: "Essential tools for small businesses.",
    features: ["Up to 5 users", "Basic quotation builder", "Basic reporting & analytics", "Standard email support", "Single warehouse stock tracking"],
    subscribers: 621, limit: null, status: "active",
  },
  {
    id: 2, name: "PRO", price: 2999, billing: "Monthly", description: "Advanced features for growing teams.",
    features: ["Up to 20 users", "Advanced quotations & discount rules", "AI deal risk & leakage insights", "Advanced analytics & PDF export", "External Customer Portal access", "Priority support with 4h SLA", "Multi-warehouse inventory management"],
    subscribers: 418, limit: null, status: "active", highlight: true,
  },
  {
    id: 3, name: "ENTERPRISE", price: 9999, billing: "Monthly", description: "Unlimited scale with dedicated support.",
    features: ["Unlimited user licenses", "Advanced AI Deal Explanations", "Full API access & webhook integrations", "Custom approval workflow routing", "Dedicated account manager", "24/7 premium support (1h SLA)", "Explainable audit trail & SLA guarantees"],
    subscribers: 245, limit: null, status: "active",
  },
];

const inputCls = "w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-[13px] text-[#1F2937] outline-none focus:border-[#F26C4F] focus:ring-1 focus:ring-[#F26C4F]/20 placeholder-[#9CA3AF]";
function FL({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-[12px] font-medium text-[#6B7280] mb-1">{label}{children}</label></div>;
}

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    loadPlans();
  }, []);

  const [addForm, setAddForm] = useState({ name: "", price: 0, description: "" });
  const [saving, setSaving] = useState(false);

  async function loadPlans() {
    try {
      const data = await fetchSubscriptionPlansList();
      if (Array.isArray(data) && data.length > 0) {
        const formatted: Plan[] = data.map((p: any, idx: number) => ({
          id: p.id || idx + 1,
          name: (p.name || `Plan #${idx + 1}`).toUpperCase(),
          price: p.price || 199,
          billing: p.billing_cycle ? titleCase(p.billing_cycle) : "Monthly",
          description: p.description || "Includes standard subscription support",
          features: [
            "Multi-warehouse stock tracking",
            "Quotations & approval workflows",
            "AI deal risk insights",
          ],
          // Backend has no subscriber count on the plan; show the real count if
          // present, otherwise 0 rather than a fabricated number.
          subscribers: p.subscribers ?? p.subscriber_count ?? 0,
          limit: null,
          status: p.is_active === false ? "inactive" : "active",
          highlight: p.name?.toUpperCase() === "PRO" || idx === 1,
          persisted: true,
        }));
        setPlans(formatted);
      }
    } catch (e) {
      console.warn("Using initial plans fallback", e);
    }
  }

  function titleCase(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 2500); }

  async function handleSavePlan() {
    if (!editingPlan) return;
    setSaving(true);
    try {
      const payload = {
        name: editingPlan.name,
        price: Number(editingPlan.price),
        description: editingPlan.description,
        is_active: editingPlan.status === "active",
      };
      if (typeof editingPlan.id === "string") {
        await updateSubscriptionPlanApi(editingPlan.id, payload);
        await loadPlans();
      } else {
        // Demo-only row without a DB id: persist it as a new plan.
        await createSubscriptionPlanApi({ ...payload, billing_cycle: "MONTHLY" });
        await loadPlans();
      }
      setEditingPlan(null);
      showToast("Plan updated successfully");
    } catch (e) {
      showToast("Error saving plan");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreatePlan() {
    if (!addForm.name || !addForm.price) {
      showToast("Name and price are required");
      return;
    }
    setSaving(true);
    try {
      await createSubscriptionPlanApi({
        name: addForm.name,
        price: Number(addForm.price),
        description: addForm.description || undefined,
        billing_cycle: "MONTHLY",
      });
      await loadPlans();
      setAddOpen(false);
      setAddForm({ name: "", price: 0, description: "" });
      showToast("Plan created successfully");
    } catch (e) {
      showToast("Error creating plan");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePlan() {
    if (!editingPlan) return;
    if (typeof editingPlan.id !== "string") {
      // Demo-only row; just drop it locally.
      setPlans(plans.filter((p) => p.id !== editingPlan.id));
      setEditingPlan(null);
      return;
    }
    if (!window.confirm(`Archive the ${editingPlan.name} plan?`)) return;
    setSaving(true);
    try {
      await deleteSubscriptionPlanApi(editingPlan.id);
      await loadPlans();
      setEditingPlan(null);
      showToast("Plan archived");
    } catch (e) {
      showToast("Error archiving plan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1F2937] text-white text-sm px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />{toast}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[#1F2937]">Subscription Plans</h2>
          <p className="text-[#6B7280] text-sm">Manage plan tiers, pricing, and feature access.</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 bg-[#F26C4F] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#E05A3E]">
          <Plus size={16} /> Create Plan
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Subscribers", value: "1,284" },
          { label: "Monthly Recurring Revenue", value: "₹2.84 Cr" },
          { label: "Average Revenue Per User", value: "₹22,120" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#E5E7EB] p-4">
            <p className="text-[12px] text-[#6B7280]">{s.label}</p>
            <p className="text-[22px] font-bold text-[#1F2937] mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {plans.slice((page - 1) * perPage, page * perPage).map((plan) => (
          <div key={plan.id} className={`relative bg-white rounded-2xl border-2 p-6 flex flex-col ${plan.highlight ? "border-[#F26C4F] shadow-md" : "border-[#E5E7EB]"}`}>
            {plan.highlight && (
              <div className="absolute -top-3 left-6">
                <span className="bg-[#F26C4F] text-white text-[11px] font-semibold px-3 py-1 rounded-full">Most Popular</span>
              </div>
            )}
            <div className="mb-4">
              <h3 className="text-[16px] font-bold text-[#1F2937]">{plan.name}</h3>
              <p className="text-[#6B7280] text-[12px] mt-0.5">{plan.description}</p>
            </div>
            <div className="mb-5">
              <span className="text-[32px] font-bold text-[#1F2937]">₹{plan.price.toLocaleString("en-IN")}</span>
              <span className="text-[#6B7280] text-[13px] ml-1">/ {plan.billing.toLowerCase()}</span>
            </div>
            <div className="space-y-2 flex-1 mb-5">
              {plan.features.map((f, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Check size={14} className="text-[#F26C4F] flex-shrink-0 mt-0.5" />
                  <span className="text-[13px] text-[#6B7280]">{f}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#E5E7EB] pt-4 space-y-3">
              <div className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-1.5 text-[#6B7280]">
                  <Users size={13} />
                  <span>{plan.subscribers.toLocaleString()} subscribers</span>
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${plan.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{plan.status}</span>
              </div>
              <button onClick={() => setEditingPlan(plan)} className={`w-full py-2 rounded-lg text-[13px] font-medium transition-colors ${plan.highlight ? "bg-[#F26C4F] text-white hover:bg-[#E05A3E]" : "border border-[#E5E7EB] text-[#1F2937] hover:bg-[#F4F5F7]"}`}>
                Edit Plan
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border border-[#E5E7EB] bg-white rounded-xl text-xs text-[#6B7280] gap-2">
        <div className="flex items-center gap-2">
          <span>Showing {plans.length === 0 ? 0 : (page - 1) * perPage + 1}-{Math.min(page * perPage, plans.length)} of <strong>{plans.length}</strong> loaded database records</span>
          <select
            aria-label="Items per page"
            value={perPage}
            onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
            className="ml-2 border border-gray-300 rounded px-2 py-1 bg-white text-gray-700 font-medium"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
            <option value={200}>All 200 per page</option>
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button
            aria-label="Previous page"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="p-1.5 rounded-lg border border-[#E5E7EB] disabled:opacity-40 hover:bg-[#F4F5F7]"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="px-2 font-bold text-[#1F2937]">{page} / {Math.ceil(plans.length / perPage) || 1}</span>
          <button
            aria-label="Next page"
            disabled={page === Math.ceil(plans.length / perPage) || plans.length === 0}
            onClick={() => setPage(p => p + 1)}
            className="p-1.5 rounded-lg border border-[#E5E7EB] disabled:opacity-40 hover:bg-[#F4F5F7]"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Edit Plan Modal */}
      <Modal open={editingPlan !== null} onClose={() => setEditingPlan(null)} title={`Edit ${editingPlan?.name} Plan`} onSave={handleSavePlan} saveLabel={saving ? "Saving..." : "Save Changes"}>
        <div className="space-y-4">
          <FL label="Plan Name">
            <input className={inputCls} value={editingPlan?.name || ""} onChange={(e) => setEditingPlan(prev => prev ? { ...prev, name: e.target.value } : null)} />
          </FL>
          <FL label="Monthly Price (₹)">
            <input type="number" className={inputCls} value={editingPlan?.price || 0} onChange={(e) => setEditingPlan(prev => prev ? { ...prev, price: Number(e.target.value) } : null)} />
          </FL>
          <FL label="Description">
            <textarea className={`${inputCls} resize-none`} rows={2} value={editingPlan?.description || ""} onChange={(e) => setEditingPlan(prev => prev ? { ...prev, description: e.target.value } : null)} />
          </FL>
          <FL label="Features (one per line)">
            <textarea className={`${inputCls} resize-none`} rows={4} value={editingPlan?.features.join("\n") || ""} onChange={(e) => setEditingPlan(prev => prev ? { ...prev, features: e.target.value.split("\n") } : null)} />
          </FL>
          <div className="grid grid-cols-2 gap-4">
            <FL label="Subscriber Limit">
              <input type="number" className={inputCls} placeholder="Leave blank for unlimited" value={editingPlan?.limit || ""} onChange={(e) => setEditingPlan(prev => prev ? { ...prev, limit: e.target.value ? Number(e.target.value) : null } : null)} />
            </FL>
            <FL label="Status">
              <select className={inputCls} value={editingPlan?.status || "active"} onChange={(e) => setEditingPlan(prev => prev ? { ...prev, status: e.target.value as "active" | "inactive" } : null)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </FL>
          </div>
          <div className="pt-2">
            <button
              onClick={handleDeletePlan}
              disabled={saving}
              className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline disabled:opacity-50"
            >
              Archive this plan
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Create Subscription Plan" onSave={handleCreatePlan} saveLabel={saving ? "Creating..." : "Create Plan"}>
        <div className="space-y-4">
          <FL label="Plan Name">
            <input className={inputCls} placeholder="e.g. Starter" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
          </FL>
          <FL label="Monthly Price (₹)">
            <input type="number" className={inputCls} placeholder="0" value={addForm.price || ""} onChange={(e) => setAddForm({ ...addForm, price: Number(e.target.value) })} />
          </FL>
          <FL label="Description">
            <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Brief description of the plan" value={addForm.description} onChange={(e) => setAddForm({ ...addForm, description: e.target.value })} />
          </FL>
        </div>
      </Modal>
    </div>
  );
}
