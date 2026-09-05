import React, { useState } from "react";
import { Wrench, Plus, Edit2, Ban, CheckCircle2, ShieldCheck } from "lucide-react";
import Modal from "../ui/Modal";
import StatusPill from "../ui/StatusPill";

const initialPlans = [
  {
    id: 1,
    name: "Hardware Preventive Maintenance",
    description: "Quarterly hardware health check, firmware updates, and component replacement",
    monthlyPrice: "₹4,500",
    annualPrice: "₹45,000",
    coverage: "Hardware components & firewalls",
    sla: "4h Onsite Response",
    supportLevel: "L2 Hardware Specialist",
    renewalPeriod: "Annual",
    status: "active",
  },
  {
    id: 2,
    name: "Cloud Server Health & Patching",
    description: "Monthly security patches, backup audits, database optimization",
    monthlyPrice: "₹8,000",
    annualPrice: "₹85,000",
    coverage: "SaaS infra & database clusters",
    sla: "1h Critical Remote SLA",
    supportLevel: "Cloud Architect Team",
    renewalPeriod: "Annual",
    status: "active",
  },
  {
    id: 3,
    name: "Legacy Equipment AMC",
    description: "Extended warranty coverage for end-of-life legacy servers",
    monthlyPrice: "₹12,000",
    annualPrice: "₹1,20,000",
    coverage: "Legacy server racks",
    sla: "8h Next Business Day",
    supportLevel: "Field Engineer",
    renewalPeriod: "Annual",
    status: "inactive",
  },
];

export default function MaintenancePlans() {
  const [plans, setPlans] = useState(initialPlans);
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function toggleStatus(id: number, currentStatus: string) {
    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    setPlans(plans.map((p) => (p.id === id ? { ...p, status: nextStatus } : p)));
    showToast(`Maintenance plan status changed to ${nextStatus}`);
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1F2937] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2 animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-[#1F2937] tracking-tight">Maintenance & Service Plans</h2>
          <p className="text-[#6B7280] text-xs mt-0.5">Manage annual maintenance contracts (AMC), SLAs, and recurring coverage plans.</p>
        </div>
        <button
          onClick={() => showToast("Create plan modal opened")}
          className="flex items-center gap-1.5 bg-[#F26C4F] text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-[#e05535] transition shadow-xs"
        >
          <Plus size={16} /> Create Maintenance Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-base text-[#1F2937]">{plan.name}</span>
                <StatusPill status={plan.status} />
              </div>
              <p className="text-xs text-[#6B7280] mb-3">{plan.description}</p>

              <div className="bg-[#FAFBFD] p-3 rounded-xl border border-[#E5E7EB] space-y-1.5 text-xs text-[#374151] mb-4">
                <p><strong className="text-[#1F2937]">Monthly Price:</strong> {plan.monthlyPrice}</p>
                <p><strong className="text-[#1F2937]">Annual Price:</strong> {plan.annualPrice}</p>
                <p><strong className="text-[#1F2937]">Coverage:</strong> {plan.coverage}</p>
                <p><strong className="text-[#1F2937]">SLA Guarantee:</strong> {plan.sla}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#E5E7EB]">
              <button
                onClick={() => showToast(`Edit plan for ${plan.name}`)}
                className="flex items-center gap-1 text-xs font-bold text-[#374151] hover:text-[#F26C4F]"
              >
                <Edit2 size={14} /> Edit Plan
              </button>

              <button
                onClick={() => toggleStatus(plan.id, plan.status)}
                className="flex items-center gap-1 text-xs font-bold text-[#6B7280] hover:text-amber-600"
              >
                {plan.status === "active" ? <Ban size={14} /> : <CheckCircle2 size={14} />}
                {plan.status === "active" ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
