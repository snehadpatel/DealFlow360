import React, { useState } from "react";
import { Headphones, Clock, Users, Shield, Plus, Edit2 } from "lucide-react";
import Modal from "../ui/Modal";

const initialPackages = [
  {
    id: 1,
    name: "Standard Support",
    sla: "24 Hours Response",
    hours: "9 AM — 6 PM (Business Days)",
    dedicatedManager: "No",
    assignedCustomers: 621,
    escalationLevel: "Level 1 Helpdesk",
  },
  {
    id: 2,
    name: "Priority Support",
    sla: "4 Hours Response",
    hours: "8 AM — 8 PM (Mon–Sat)",
    dedicatedManager: "Shared Technical Lead",
    assignedCustomers: 418,
    escalationLevel: "Level 2 Tech Team",
  },
  {
    id: 3,
    name: "Premium Support",
    sla: "1 Hour Response",
    hours: "24/7 365 Days",
    dedicatedManager: "Yes (Named Account Executive)",
    assignedCustomers: 180,
    escalationLevel: "Level 3 Engineering Direct",
  },
  {
    id: 4,
    name: "Enterprise SLA Guarantee",
    sla: "15 Minutes Critical SLA",
    hours: "24/7 Dedicated Ops Center",
    dedicatedManager: "Yes (Dedicated Account Team)",
    assignedCustomers: 65,
    escalationLevel: "Direct VP Engineering Escalation",
  },
];

export default function PremiumSupport() {
  const [packages, setPackages] = useState(initialPackages);
  const [editingPkg, setEditingPkg] = useState<any | null>(null);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function handleSavePkg() {
    if (!editingPkg) return;
    setPackages(packages.map((p) => (p.id === editingPkg.id ? editingPkg : p)));
    setEditingPkg(null);
    showToast("Support package configuration saved");
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
          <h2 className="text-[20px] font-bold text-[#1F2937] tracking-tight">Premium Support Packages</h2>
          <p className="text-[#6B7280] text-xs mt-0.5">Configure SLA thresholds, support hours, and customer package assignments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-extrabold text-base text-[#1F2937]">{pkg.name}</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                  {pkg.assignedCustomers} Assigned Customers
                </span>
              </div>

              <div className="space-y-2 text-xs text-[#374151] border-t border-[#E5E7EB] pt-3">
                <p><strong className="text-[#1F2937]">Response SLA:</strong> <span className="font-bold text-[#F26C4F]">{pkg.sla}</span></p>
                <p><strong className="text-[#1F2937]">Support Hours:</strong> {pkg.hours}</p>
                <p><strong className="text-[#1F2937]">Dedicated Manager:</strong> {pkg.dedicatedManager}</p>
                <p><strong className="text-[#1F2937]">Escalation Level:</strong> {pkg.escalationLevel}</p>
              </div>
            </div>

            <button
              onClick={() => setEditingPkg(pkg)}
              className="mt-4 w-full py-2 border border-[#E5E7EB] bg-white hover:bg-[#F4F5F7] text-xs font-bold text-[#374151] rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Edit2 size={14} /> Configure Package SLA
            </button>
          </div>
        ))}
      </div>

      {editingPkg && (
        <Modal title={`Configure SLA — ${editingPkg.name}`} onClose={() => setEditingPkg(null)}>
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#374151] mb-1">Response SLA</label>
                <input
                  value={editingPkg.sla}
                  onChange={(e) => setEditingPkg({ ...editingPkg, sla: e.target.value })}
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#374151] mb-1">Support Hours</label>
                <input
                  value={editingPkg.hours}
                  onChange={(e) => setEditingPkg({ ...editingPkg, hours: e.target.value })}
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#374151] mb-1">Escalation Path</label>
              <input
                value={editingPkg.escalationLevel}
                onChange={(e) => setEditingPkg({ ...editingPkg, escalationLevel: e.target.value })}
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingPkg(null)} className="px-4 py-2 border border-[#E5E7EB] rounded-xl text-xs font-semibold hover:bg-[#F4F5F7]">
                Cancel
              </button>
              <button onClick={handleSavePkg} className="px-4 py-2 bg-[#F26C4F] text-white rounded-xl text-xs font-bold hover:bg-[#e05535]">
                Save Package
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
