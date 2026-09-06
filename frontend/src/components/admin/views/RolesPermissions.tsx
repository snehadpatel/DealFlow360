import React, { useState } from "react";
import { ShieldCheck, Check, X } from "lucide-react";

const rolesList = [
  { id: "REP", name: "Sales Rep" },
  { id: "MANAGER", name: "Sales Manager" },
  { id: "FINANCE", name: "Finance" },
  { id: "OPERATIONS", name: "Operations" },
  { id: "ADMIN", name: "Super Admin" },
];

const initialMatrix: Record<string, Record<string, boolean>> = {
  create_quotation: { REP: true, MANAGER: true, FINANCE: false, OPERATIONS: false, ADMIN: true },
  edit_own_quotation: { REP: true, MANAGER: true, FINANCE: false, OPERATIONS: false, ADMIN: true },
  view_team_quotations: { REP: false, MANAGER: true, FINANCE: true, OPERATIONS: false, ADMIN: true },
  approve_discounts: { REP: false, MANAGER: true, FINANCE: true, OPERATIONS: false, ADMIN: true },
  manage_inventory: { REP: false, MANAGER: false, FINANCE: false, OPERATIONS: true, ADMIN: true },
  view_invoices: { REP: true, MANAGER: true, FINANCE: true, OPERATIONS: true, ADMIN: true },
  view_payment_info: { REP: false, MANAGER: false, FINANCE: true, OPERATIONS: false, ADMIN: true },
  full_admin_access: { REP: false, MANAGER: false, FINANCE: false, OPERATIONS: false, ADMIN: true },
};

const permissionLabels: Record<string, string> = {
  create_quotation: "Create Quotation",
  edit_own_quotation: "Edit Own Quotation",
  view_team_quotations: "View Team Quotations",
  approve_discounts: "Approve Discounts",
  manage_inventory: "Manage Inventory & Stock",
  view_invoices: "View Invoices",
  view_payment_info: "View Payment Information",
  full_admin_access: "Full Admin Access & System Config",
};

export default function RolesPermissions() {
  const [matrix, setMatrix] = useState(initialMatrix);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function togglePermission(permKey: string, roleId: string) {
    if (roleId === "ADMIN" && permKey === "full_admin_access") {
      showToast("Cannot revoke Full Admin Access from Super Admin role");
      return;
    }
    const updated = {
      ...matrix,
      [permKey]: {
        ...matrix[permKey],
        [roleId]: !matrix[permKey][roleId],
      },
    };
    setMatrix(updated);
    showToast("Role permission matrix saved");
  }

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1F2937] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2 animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {toast}
        </div>
      )}

      <div>
        <h2 className="text-[20px] font-bold text-[#1F2937] tracking-tight">Role-Based Access Control (RBAC)</h2>
        <p className="text-[#6B7280] text-xs mt-0.5">Toggle feature permissions and capabilities for each platform role.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <h3 className="text-[#1F2937] font-bold text-sm">Permissions Matrix</h3>
          <span className="text-xs text-[#6B7280]">Click checkbox to enable/disable capability</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#FAFBFD] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                <th className="py-3 px-5">Permission Capability</th>
                {rolesList.map((r) => (
                  <th key={r.id} className="py-3 px-4 text-center">{r.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F5F7] text-xs">
              {Object.keys(matrix).map((permKey) => (
                <tr key={permKey} className="hover:bg-[#FFF8F6]/50 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-[#1F2937]">
                    {permissionLabels[permKey] || permKey}
                  </td>
                  {rolesList.map((r) => {
                    const isAllowed = matrix[permKey][r.id];
                    return (
                      <td key={r.id} className="py-3.5 px-4 text-center">
                        <button
                          aria-label="Toggle permission"
                          onClick={() => togglePermission(permKey, r.id)}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-colors ${
                            isAllowed
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-[#F4F5F7] text-[#9CA3AF] hover:bg-gray-200"
                          }`}
                        >
                          {isAllowed ? <Check size={16} className="stroke-[3]" /> : <X size={14} />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
