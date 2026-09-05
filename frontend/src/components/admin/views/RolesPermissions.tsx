import { useState } from "react";
import { Check, X } from "lucide-react";

const roles = ["Admin", "Sales Rep", "Sales Manager", "Finance", "Operations"];
const modules = [
  "Dashboard",
  "Customers",
  "Products",
  "Pricing",
  "Discounts & Approvals",
  "Warehouses",
  "Subscription Plans",
  "Customer Tiers",
  "Premium Support",
  "Maintenance Plans",
  "Users & Managers",
  "Roles & Permissions",
  "Cloud Backup",
  "Reports & Analytics",
];
const permissions = ["View", "Create", "Edit", "Delete", "Approve"];

type PermMatrix = Record<string, Record<string, Record<string, boolean>>>;

function initMatrix(): PermMatrix {
  const m: PermMatrix = {};
  for (const mod of modules) {
    m[mod] = {};
    for (const role of roles) {
      m[mod][role] = {};
      for (const perm of permissions) {
        if (role === "Admin") {
          m[mod][role][perm] = true;
        } else if (perm === "View") {
          m[mod][role][perm] = true;
        } else if (role === "Sales Rep") {
          m[mod][role][perm] = ["Customers", "Products", "Pricing"].includes(mod) && ["Create", "Edit"].includes(perm);
        } else if (role === "Sales Manager") {
          m[mod][role][perm] = perm !== "Delete" && !["Users & Managers", "Roles & Permissions", "Cloud Backup"].includes(mod);
        } else if (role === "Finance") {
          m[mod][role][perm] = ["Approve"].includes(perm) || (["Edit"].includes(perm) && ["Pricing", "Discounts & Approvals"].includes(mod));
        } else if (role === "Operations") {
          m[mod][role][perm] = ["Create", "Edit"].includes(perm) && ["Warehouses", "Products"].includes(mod);
        } else {
          m[mod][role][perm] = false;
        }
      }
    }
  }
  return m;
}

export default function RolesPermissions() {
  const [matrix, setMatrix] = useState<PermMatrix>(initMatrix());
  const [toast, setToast] = useState("");

  function toggle(mod: string, role: string, perm: string) {
    if (role === "Admin") return;
    setMatrix((prev) => ({
      ...prev,
      [mod]: { ...prev[mod], [role]: { ...prev[mod][role], [perm]: !prev[mod][role][perm] } },
    }));
    setToast("Permission updated");
    setTimeout(() => setToast(""), 2000);
  }

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1F2937] text-white text-sm px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />{toast}
        </div>
      )}
      <div>
        <h2 className="text-[18px] font-bold text-[#1F2937]">Roles & Permissions</h2>
        <p className="text-[#6B7280] text-sm">Configure module-level access for each role. Click a cell to toggle.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#6B7280] min-w-[160px] sticky left-0 bg-white z-10">Module</th>
                {roles.map((role) => (
                  <th key={role} colSpan={5} className="px-2 py-3 text-center text-[11px] font-medium text-[#1F2937] border-l border-[#E5E7EB]">
                    {role}
                  </th>
                ))}
              </tr>
              <tr className="border-b border-[#E5E7EB] bg-[#FAFAFA]">
                <th className="px-4 py-2 sticky left-0 bg-[#FAFAFA] z-10" />
                {roles.map((role) =>
                  permissions.map((perm) => (
                    <th key={`${role}-${perm}`} className="px-1 py-2 text-center text-[10px] text-[#9CA3AF] font-medium border-l border-[#F4F5F7] first-of-type:border-l-[#E5E7EB] w-10">
                      {perm.slice(0, 3)}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {modules.map((mod, mi) => (
                <tr key={mod} className={`border-b border-[#F4F5F7] last:border-0 ${mi % 2 === 0 ? "" : "bg-[#FAFAFA]/50"}`}>
                  <td className="px-4 py-2.5 text-[13px] text-[#1F2937] font-medium sticky left-0 bg-inherit z-10 whitespace-nowrap">{mod}</td>
                  {roles.map((role) =>
                    permissions.map((perm) => {
                      const granted = matrix[mod]?.[role]?.[perm];
                      const isAdmin = role === "Admin";
                      return (
                        <td key={`${role}-${perm}`} className="px-1 py-2.5 text-center border-l border-[#F4F5F7] first-of-type:border-l-[#E5E7EB]">
                          <button
                            onClick={() => toggle(mod, role, perm)}
                            disabled={isAdmin}
                            className={`w-6 h-6 rounded-md flex items-center justify-center mx-auto transition-colors ${
                              granted
                                ? isAdmin
                                  ? "bg-[#F26C4F]/20 text-[#F26C4F]"
                                  : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                : "bg-[#F4F5F7] text-[#D1D5DB] hover:bg-gray-200 hover:text-gray-400"
                            } ${isAdmin ? "cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            {granted ? <Check size={11} strokeWidth={2.5} /> : <X size={11} strokeWidth={2} />}
                          </button>
                        </td>
                      );
                    })
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-[#E5E7EB] flex items-center gap-4 text-[12px] text-[#6B7280]">
          <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-emerald-50 flex items-center justify-center"><Check size={9} className="text-emerald-600" /></span> Granted</div>
          <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-[#F4F5F7] flex items-center justify-center"><X size={9} className="text-gray-300" /></span> Denied</div>
          <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-[#F26C4F]/20 flex items-center justify-center"><Check size={9} className="text-[#F26C4F]" /></span> Admin (locked)</div>
        </div>
      </div>
    </div>
  );
}
