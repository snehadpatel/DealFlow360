import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import StatusPill from "../ui/StatusPill";
import Modal from "../ui/Modal";
import ConfirmDialog from "../ui/ConfirmDialog";

type SupportPlan = {
  id: number;
  name: string;
  tiers: string[];
  responseSLA: string;
  channels: string[];
  team: string;
  status: "active" | "inactive";
};

const initialPlans: SupportPlan[] = [
  { id: 1, name: "Standard Support", tiers: ["Bronze"], responseSLA: "48 hours", channels: ["Email"], team: "General Support", status: "active" },
  { id: 2, name: "Priority Support", tiers: ["Silver"], responseSLA: "24 hours", channels: ["Email", "Chat"], team: "Priority Team", status: "active" },
  { id: 3, name: "Premium 24/7", tiers: ["Gold"], responseSLA: "4 hours", channels: ["Email", "Chat", "Phone", "Video"], team: "Dedicated Success Team", status: "active" },
];

const inputCls = "w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-[13px] text-[#1F2937] outline-none focus:border-[#F26C4F] focus:ring-1 focus:ring-[#F26C4F]/20 placeholder-[#9CA3AF]";
function FL({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-[12px] font-medium text-[#6B7280] mb-1">{label}</label>{children}</div>;
}

export default function PremiumSupport() {
  const [plans, setPlans] = useState(initialPlans);
  const [addOpen, setAddOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<SupportPlan | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 2500); }

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1F2937] text-white text-sm px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />{toast}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[#1F2937]">Premium Support</h2>
          <p className="text-[#6B7280] text-sm">Configure support plans, SLAs, and channels per customer tier.</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 bg-[#F26C4F] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#E05A3E]">
          <Plus size={16} /> Create Plan
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-[15px] font-semibold text-[#1F2937]">{plan.name}</h3>
                  <StatusPill status={plan.status} />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[11px] text-[#6B7280] mb-1">Eligible Tiers</p>
                    <div className="flex flex-wrap gap-1">
                      {plan.tiers.map((t) => (
                        <span key={t} className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${t === "Gold" ? "bg-amber-50 text-amber-700" : t === "Silver" ? "bg-gray-100 text-gray-600" : "bg-orange-50 text-orange-700"}`}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#6B7280] mb-1">Response SLA</p>
                    <p className="text-[13px] font-semibold text-[#1F2937]">{plan.responseSLA}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#6B7280] mb-1">Support Channels</p>
                    <div className="flex flex-wrap gap-1">
                      {plan.channels.map((c) => (
                        <span key={c} className="text-[11px] bg-[#F4F5F7] text-[#6B7280] px-2 py-0.5 rounded-full">{c}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#6B7280] mb-1">Assigned Team</p>
                    <p className="text-[13px] font-medium text-[#1F2937]">{plan.team}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <button onClick={() => setEditPlan(plan)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F4F5F7] text-[#6B7280]"><Edit2 size={14} /></button>
                <button onClick={() => setDeleteId(plan.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#6B7280] hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={addOpen || editPlan !== null} onClose={() => { setAddOpen(false); setEditPlan(null); }} title={editPlan ? "Edit Support Plan" : "Create Support Plan"} onSave={() => { setAddOpen(false); setEditPlan(null); showToast(editPlan ? "Plan updated" : "Plan created"); }} saveLabel={editPlan ? "Save Changes" : "Create Plan"}>
        <div className="space-y-4">
          <FL label="Plan Name"><input className={inputCls} defaultValue={editPlan?.name} placeholder="e.g. Enterprise Support" /></FL>
          <div>
            <label className="block text-[12px] font-medium text-[#6B7280] mb-2">Eligible Tiers</label>
            <div className="flex gap-4">
              {["Bronze", "Silver", "Gold"].map((t) => (
                <label key={t} className="flex items-center gap-2 text-[13px] text-[#1F2937] cursor-pointer">
                  <input type="checkbox" className="accent-[#F26C4F] w-4 h-4" defaultChecked={editPlan?.tiers.includes(t)} />
                  {t}
                </label>
              ))}
            </div>
          </div>
          <FL label="Response SLA">
            <select className={inputCls} defaultValue={editPlan?.responseSLA}>
              <option>4 hours</option>
              <option>8 hours</option>
              <option>24 hours</option>
              <option>48 hours</option>
            </select>
          </FL>
          <div>
            <label className="block text-[12px] font-medium text-[#6B7280] mb-2">Support Channels</label>
            <div className="grid grid-cols-2 gap-2">
              {["Email", "Chat", "Phone", "Video"].map((c) => (
                <label key={c} className="flex items-center gap-2 text-[13px] text-[#1F2937] cursor-pointer">
                  <input type="checkbox" className="accent-[#F26C4F] w-4 h-4" defaultChecked={editPlan?.channels.includes(c)} />
                  {c}
                </label>
              ))}
            </div>
          </div>
          <FL label="Assigned Support Team"><input className={inputCls} defaultValue={editPlan?.team} placeholder="Team name" /></FL>
          <FL label="Status"><select className={inputCls}><option>Active</option><option>Inactive</option></select></FL>
        </div>
      </Modal>

      <ConfirmDialog open={deleteId !== null} title="Delete Support Plan" message="This support plan will be removed. Customers on this plan will revert to standard support." confirmLabel="Delete Plan" onConfirm={() => { setPlans(plans.filter((p) => p.id !== deleteId)); setDeleteId(null); showToast("Plan deleted"); }} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
