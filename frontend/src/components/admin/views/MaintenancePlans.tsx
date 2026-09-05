import { useState } from "react";
import { Plus, Edit2, Trash2, Eye } from "lucide-react";
import StatusPill from "../ui/StatusPill";
import Modal from "../ui/Modal";
import ConfirmDialog from "../ui/ConfirmDialog";

const initialPlans = [
  { id: 1, name: "Basic Maintenance", price: 5000, coverage: "Hardware inspection", sla: "72 hours", eligible: "Bronze", status: "active" },
  { id: 2, name: "Standard Maintenance", price: 12000, coverage: "Hardware + Software", sla: "24 hours", eligible: "Silver", status: "active" },
  { id: 3, name: "Premium Maintenance", price: 25000, coverage: "Full stack + On-site", sla: "4 hours", eligible: "Gold", status: "active" },
  { id: 4, name: "On-Demand Repairs", price: 8000, coverage: "Pay-per-service", sla: "48 hours", eligible: "All tiers", status: "active" },
];

const inputCls = "w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-[13px] text-[#1F2937] outline-none focus:border-[#F26C4F] focus:ring-1 focus:ring-[#F26C4F]/20 placeholder-[#9CA3AF]";
function FL({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-[12px] font-medium text-[#6B7280] mb-1">{label}</label>{children}</div>;
}

export default function MaintenancePlans() {
  const [plans, setPlans] = useState(initialPlans);
  const [addOpen, setAddOpen] = useState(false);
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
          <h2 className="text-[18px] font-bold text-[#1F2937]">Maintenance Plans</h2>
          <p className="text-[#6B7280] text-sm">Configure maintenance tiers, coverage, and SLAs.</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 bg-[#F26C4F] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#E05A3E]">
          <Plus size={16} /> Create Plan
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[#E5E7EB]">
              <tr>
                {["Plan Name", "Price / Month", "Coverage", "SLA", "Eligible Customers", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-[#6B7280] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id} className="border-b border-[#F4F5F7] last:border-0 hover:bg-[#FAFAFA]">
                  <td className="px-4 py-4 text-[13px] font-medium text-[#1F2937]">{p.name}</td>
                  <td className="px-4 py-4 text-[13px] text-[#1F2937] font-medium">₹{p.price.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-4 text-[13px] text-[#6B7280]">{p.coverage}</td>
                  <td className="px-4 py-4 text-[13px] text-[#6B7280]">{p.sla}</td>
                  <td className="px-4 py-4">
                    <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${p.eligible === "Gold" ? "bg-amber-50 text-amber-700" : p.eligible === "Silver" ? "bg-gray-100 text-gray-600" : p.eligible === "Bronze" ? "bg-orange-50 text-orange-700" : "bg-[#F4F5F7] text-[#6B7280]"}`}>{p.eligible}</span>
                  </td>
                  <td className="px-4 py-4"><StatusPill status={p.status} /></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F4F5F7] text-[#6B7280]"><Eye size={14} /></button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F4F5F7] text-[#6B7280]"><Edit2 size={14} /></button>
                      <button onClick={() => setDeleteId(p.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#6B7280] hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Create Maintenance Plan" onSave={() => { setAddOpen(false); showToast("Plan created"); }} saveLabel="Create Plan">
        <div className="space-y-4">
          <FL label="Plan Name"><input className={inputCls} placeholder="e.g. Enterprise Maintenance" /></FL>
          <FL label="Monthly Price (₹)"><input type="number" className={inputCls} placeholder="0" /></FL>
          <FL label="Coverage Description"><textarea className={`${inputCls} resize-none`} rows={2} placeholder="Describe what's covered" /></FL>
          <FL label="SLA Response Time">
            <select className={inputCls}><option>4 hours</option><option>8 hours</option><option>24 hours</option><option>48 hours</option><option>72 hours</option></select>
          </FL>
          <FL label="Eligible Customers">
            <select className={inputCls}><option>All tiers</option><option>Bronze</option><option>Silver</option><option>Gold</option></select>
          </FL>
          <FL label="Status"><select className={inputCls}><option>Active</option><option>Draft</option></select></FL>
        </div>
      </Modal>

      <ConfirmDialog open={deleteId !== null} title="Delete Maintenance Plan" message="This plan will be permanently deleted. Customers enrolled in this plan will be affected." confirmLabel="Delete Plan" onConfirm={() => { setPlans(plans.filter((p) => p.id !== deleteId)); setDeleteId(null); showToast("Plan deleted"); }} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
