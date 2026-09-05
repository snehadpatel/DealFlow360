import { useState } from "react";
import { Plus, Edit2, Check, Users } from "lucide-react";
import Modal from "../ui/Modal";

type Plan = {
  id: number;
  name: string;
  price: number;
  billing: string;
  description: string;
  features: string[];
  subscribers: number;
  limit: number | null;
  status: "active" | "inactive";
  highlight?: boolean;
};

const initialPlans: Plan[] = [
  {
    id: 1, name: "Basic", price: 11000, billing: "Monthly", description: "Essential tools for small businesses.",
    features: ["Up to 5 users", "Core CRM features", "Email support", "1 warehouse", "Basic analytics", "5GB cloud storage"],
    subscribers: 621, limit: null, status: "active",
  },
  {
    id: 2, name: "Pro", price: 21000, billing: "Monthly", description: "Advanced features for growing teams.",
    features: ["Up to 25 users", "Full CRM + Quotation", "Priority email + chat", "5 warehouses", "Advanced analytics", "50GB cloud storage", "Discount approvals"],
    subscribers: 418, limit: null, status: "active", highlight: true,
  },
  {
    id: 3, name: "Enterprise", price: 50000, billing: "Monthly", description: "Unlimited scale with dedicated support.",
    features: ["Unlimited users", "Full platform access", "24/7 dedicated support", "Unlimited warehouses", "Custom analytics", "Unlimited cloud storage", "SLA guarantee", "Custom integrations"],
    subscribers: 245, limit: null, status: "active",
  },
];

const inputCls = "w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-[13px] text-[#1F2937] outline-none focus:border-[#F26C4F] focus:ring-1 focus:ring-[#F26C4F]/20 placeholder-[#9CA3AF]";
function FL({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-[12px] font-medium text-[#6B7280] mb-1">{label}</label>{children}</div>;
}

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState(initialPlans);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 2500); }

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
        {plans.map((plan) => (
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
              <button onClick={() => setEditPlan(plan)} className={`w-full py-2 rounded-lg text-[13px] font-medium transition-colors ${plan.highlight ? "bg-[#F26C4F] text-white hover:bg-[#E05A3E]" : "border border-[#E5E7EB] text-[#1F2937] hover:bg-[#F4F5F7]"}`}>
                Edit Plan
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Plan Modal */}
      <Modal open={editPlan !== null} onClose={() => setEditPlan(null)} title={`Edit ${editPlan?.name} Plan`} onSave={() => { setEditPlan(null); showToast("Plan updated"); }} saveLabel="Save Changes">
        <div className="space-y-4">
          <FL label="Plan Name"><input className={inputCls} defaultValue={editPlan?.name} /></FL>
          <FL label="Monthly Price (₹)"><input type="number" className={inputCls} defaultValue={editPlan?.price} /></FL>
          <FL label="Description"><textarea className={`${inputCls} resize-none`} rows={2} defaultValue={editPlan?.description} /></FL>
          <FL label="Features (one per line)">
            <textarea className={`${inputCls} resize-none`} rows={4} defaultValue={editPlan?.features.join("\n")} />
          </FL>
          <div className="grid grid-cols-2 gap-4">
            <FL label="Subscriber Limit"><input type="number" className={inputCls} placeholder="Leave blank for unlimited" /></FL>
            <FL label="Status"><select className={inputCls}><option>Active</option><option>Inactive</option></select></FL>
          </div>
        </div>
      </Modal>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Create Subscription Plan" onSave={() => { setAddOpen(false); showToast("Plan created"); }} saveLabel="Create Plan">
        <div className="space-y-4">
          <FL label="Plan Name"><input className={inputCls} placeholder="e.g. Starter" /></FL>
          <FL label="Monthly Price (₹)"><input type="number" className={inputCls} placeholder="0" /></FL>
          <FL label="Description"><textarea className={`${inputCls} resize-none`} rows={2} placeholder="Brief description of the plan" /></FL>
          <FL label="Features (one per line)"><textarea className={`${inputCls} resize-none`} rows={4} placeholder="Feature 1&#10;Feature 2&#10;Feature 3" /></FL>
          <div className="grid grid-cols-2 gap-4">
            <FL label="Subscriber Limit"><input type="number" className={inputCls} placeholder="Unlimited" /></FL>
            <FL label="Status"><select className={inputCls}><option>Active</option><option>Draft</option></select></FL>
          </div>
        </div>
      </Modal>
    </div>
  );
}
