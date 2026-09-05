import { useState } from "react";
import { Plus, Edit2, Trash2, ChevronRight, Check } from "lucide-react";
import Modal from "../ui/Modal";
import ConfirmDialog from "../ui/ConfirmDialog";

type Rule = {
  id: number;
  min: number;
  max: number | null;
  label: string;
  approvers: string[];
  status: boolean;
};

const initialRules: Rule[] = [
  { id: 1, min: 0, max: 10, label: "0–10%", approvers: ["Sales Representative"], status: true },
  { id: 2, min: 10, max: 20, label: "10–20%", approvers: ["Sales Manager"], status: true },
  { id: 3, min: 20, max: null, label: ">20%", approvers: ["Sales Manager", "Finance"], status: true },
];

const stages = ["Discount Entered", "Sales Representative", "Sales Manager", "Finance"];

function getActiveStages(pct: number): number[] {
  if (pct <= 0) return [0];
  if (pct <= 10) return [0, 1];
  if (pct <= 20) return [0, 1, 2];
  return [0, 1, 2, 3];
}

const inputCls = "w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-[13px] text-[#1F2937] outline-none focus:border-[#F26C4F] focus:ring-1 focus:ring-[#F26C4F]/20";

export default function Discounts() {
  const [rules, setRules] = useState(initialRules);
  const [discountPct, setDiscountPct] = useState(15);
  const [editRule, setEditRule] = useState<Rule | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState("");
  const activeStages = getActiveStages(discountPct);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 2500); }

  function toggleRule(id: number) {
    setRules(rules.map((r) => r.id === id ? { ...r, status: !r.status } : r));
    showToast("Rule updated");
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
          <h2 className="text-[18px] font-bold text-[#1F2937]">Discounts & Approvals</h2>
          <p className="text-[#6B7280] text-sm">Configure discount tiers and approval workflows.</p>
        </div>
        <button onClick={() => setEditRule({ id: 0, min: 0, max: 10, label: "", approvers: [], status: true })} className="flex items-center gap-2 bg-[#F26C4F] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#E05A3E]">
          <Plus size={16} /> Add Rule
        </button>
      </div>

      {/* Approval Workflow Visualizer */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px] font-semibold text-[#1F2937]">Approval Workflow Simulator</h3>
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-[#6B7280]">Discount: <span className="font-semibold text-[#1F2937]">{discountPct}%</span></span>
            <input
              type="range"
              min={0}
              max={35}
              value={discountPct}
              onChange={(e) => setDiscountPct(Number(e.target.value))}
              className="w-32 accent-[#F26C4F]"
            />
          </div>
        </div>

        <div className="flex items-center gap-0">
          {stages.map((stage, i) => {
            const isActive = activeStages.includes(i);
            const isLast = i === stages.length - 1;
            return (
              <div key={stage} className="flex items-center flex-1">
                <div className={`flex-1 flex flex-col items-center`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive ? "bg-[#F26C4F] border-[#F26C4F] shadow-sm" : "bg-white border-[#E5E7EB]"}`}>
                    {isActive ? <Check size={16} className="text-white" /> : <span className="text-[13px] font-bold text-[#9CA3AF]">{i + 1}</span>}
                  </div>
                  <p className={`text-[11px] font-medium mt-2 text-center max-w-[80px] ${isActive ? "text-[#F26C4F]" : "text-[#9CA3AF]"}`}>{stage}</p>
                </div>
                {!isLast && (
                  <div className={`h-0.5 w-8 mx-1 transition-all duration-300 rounded-full ${activeStages.includes(i) && activeStages.includes(i + 1) ? "bg-[#F26C4F]" : "bg-[#E5E7EB]"}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 bg-[#FFF4F1] border border-[#F26C4F]/20 rounded-xl px-4 py-3">
          <p className="text-[13px] text-[#1F2937]">
            A <span className="font-semibold text-[#F26C4F]">{discountPct}%</span> discount requires approval from:{" "}
            <span className="font-semibold">
              {discountPct === 0 ? "No approval needed" :
               discountPct <= 10 ? "Sales Representative" :
               discountPct <= 20 ? "Sales Representative → Sales Manager" :
               "Sales Representative → Sales Manager → Finance"}
            </span>
          </p>
        </div>
      </div>

      {/* Rule Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {rules.map((rule) => (
          <div key={rule.id} className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-[#F26C4F]/10 text-[#F26C4F] text-sm font-bold px-3 py-1 rounded-full mb-2">
                  {rule.label} discount
                </div>
                <p className="text-[13px] text-[#6B7280]">Requires approval from</p>
              </div>
              <button
                onClick={() => toggleRule(rule.id)}
                className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 mt-1 ${rule.status ? "bg-[#F26C4F]" : "bg-[#E5E7EB]"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${rule.status ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
            <div className="space-y-2 mb-4">
              {rule.approvers.map((a, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#F4F5F7] flex items-center justify-center flex-shrink-0">
                    <Check size={11} className="text-emerald-600" />
                  </div>
                  <span className="text-[13px] text-[#1F2937] font-medium">{a}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${rule.status ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                {rule.status ? "Active" : "Disabled"}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setEditRule(rule)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F4F5F7] text-[#6B7280]"><Edit2 size={13} /></button>
                <button onClick={() => setDeleteId(rule.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#6B7280] hover:text-red-500"><Trash2 size={13} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Rule Modal */}
      <Modal open={editRule !== null} onClose={() => setEditRule(null)} title={editRule?.id === 0 ? "Add Discount Rule" : "Edit Discount Rule"} onSave={() => { setEditRule(null); showToast("Rule saved"); }} saveLabel="Save Rule">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[#6B7280] mb-1">Min Discount (%)</label>
              <input type="number" className={inputCls} defaultValue={editRule?.min ?? 0} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#6B7280] mb-1">Max Discount (%)</label>
              <input type="number" className={inputCls} defaultValue={editRule?.max ?? ""} placeholder="Leave blank for no limit" />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#6B7280] mb-1">Required Approvers</label>
            <div className="space-y-2">
              {["Sales Representative", "Sales Manager", "Finance"].map((role) => (
                <label key={role} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked={editRule?.approvers.includes(role)} className="accent-[#F26C4F] w-4 h-4" />
                  <span className="text-[13px] text-[#1F2937]">{role}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#6B7280] mb-1">Status</label>
            <select className={inputCls}><option>Active</option><option>Disabled</option></select>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={deleteId !== null} title="Delete Discount Rule" message="This rule will be permanently deleted. Discount requests in this range will no longer have an approval path." confirmLabel="Delete Rule" onConfirm={() => { setRules(rules.filter((r) => r.id !== deleteId)); setDeleteId(null); showToast("Rule deleted"); }} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
