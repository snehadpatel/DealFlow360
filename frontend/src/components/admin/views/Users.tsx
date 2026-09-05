import React, { useState } from "react";
import { UserCog, Plus, Search, Filter, KeyRound, Ban, CheckCircle2, Trash2, Edit2 } from "lucide-react";
import StatusPill from "../ui/StatusPill";
import Modal from "../ui/Modal";

const rolesList = ["ADMIN", "REP", "MANAGER", "FINANCE", "OPERATIONS"];

const initialUsers = [
  { id: 1, name: "Super Admin", email: "admin@dealflow360.com", role: "ADMIN", department: "Executive", status: "active", lastLogin: "10 mins ago", createdDate: "01 Jan 2026" },
  { id: 2, name: "Alex Kumar", email: "alex.rep@dealflow360.com", role: "REP", department: "Sales", status: "active", lastLogin: "1 hour ago", createdDate: "10 Jan 2026" },
  { id: 3, name: "Priya Sharma", email: "priya.rep@dealflow360.com", role: "REP", department: "Sales", status: "active", lastLogin: "35 mins ago", createdDate: "12 Jan 2026" },
  { id: 4, name: "Maria Manager", email: "maria.manager@dealflow360.com", role: "MANAGER", department: "Sales Management", status: "active", lastLogin: "2 hours ago", createdDate: "05 Jan 2026" },
  { id: 5, name: "Felix Finance", email: "felix.finance@dealflow360.com", role: "FINANCE", department: "Finance & Accounting", status: "active", lastLogin: "Yesterday", createdDate: "08 Jan 2026" },
  { id: 6, name: "Ops Team Lead", email: "ops@dealflow360.com", role: "OPERATIONS", department: "Supply Chain & Fulfillment", status: "active", lastLogin: "3 hours ago", createdDate: "15 Jan 2026" },
];

export default function Users() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "REP", department: "Sales" });
  const [toast, setToast] = useState("");

  const filtered = users.filter((u) => {
    const mSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const mRole = roleFilter === "all" || u.role === roleFilter;
    return mSearch && mRole;
  });

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function handleCreateUser() {
    if (!form.name || !form.email) return;
    const newUser = {
      ...form,
      id: Date.now(),
      status: "active",
      lastLogin: "Never",
      createdDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    };
    setUsers([newUser, ...users]);
    setAddOpen(false);
    showToast(`User ${form.name} created as ${form.role}`);
  }

  function toggleStatus(id: number, currentStatus: string) {
    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    setUsers(users.map((u) => (u.id === id ? { ...u, status: nextStatus } : u)));
    showToast(`User status changed to ${nextStatus}`);
  }

  function changeRole(id: number, newRole: string) {
    setUsers(users.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
    showToast(`User role updated to ${newRole}`);
  }

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1F2937] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2 animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-[#1F2937] tracking-tight">Users & Internal Roles</h2>
          <p className="text-[#6B7280] text-xs mt-0.5">Manage user credentials, role assignments, department access, and account status.</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 bg-[#F26C4F] text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-[#e05535] transition shadow-xs"
        >
          <Plus size={16} /> Add Internal User
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-xs">
        <div className="flex items-center justify-between gap-3 p-4 border-b border-[#E5E7EB] flex-wrap">
          <div className="flex items-center gap-2 bg-[#F4F5F7] rounded-xl px-3 py-2 flex-1 min-w-[200px]">
            <Search size={15} className="text-[#9CA3AF] flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user by name or email..."
              className="bg-transparent outline-none text-xs text-[#1F2937] w-full placeholder-[#9CA3AF]"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-[#E5E7EB] bg-white rounded-xl px-3 py-2 text-xs font-medium text-[#374151] outline-none"
          >
            <option value="all">All Roles</option>
            {rolesList.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#FAFBFD] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F5F7] text-xs">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-[#FFF8F6]/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-[#1F2937]">{u.name}</td>
                  <td className="py-3 px-4 font-medium text-[#4B5563]">{u.email}</td>
                  <td className="py-3 px-4">
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                      className="bg-[#FAFBFD] border border-[#E5E7EB] rounded-lg px-2 py-0.5 text-xs font-bold text-[#F26C4F] outline-none"
                    >
                      {rolesList.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-[#6B7280]">{u.department}</td>
                  <td className="py-3 px-4"><StatusPill status={u.status} /></td>
                  <td className="py-3 px-4 text-[#6B7280]">{u.lastLogin}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => showToast(`Password reset link sent to ${u.email}`)}
                        className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#F26C4F] hover:bg-orange-50 transition"
                        title="Reset Password"
                      >
                        <KeyRound size={15} />
                      </button>
                      <button
                        onClick={() => toggleStatus(u.id, u.status)}
                        className="p-1.5 rounded-lg text-[#6B7280] hover:text-amber-600 hover:bg-amber-50 transition"
                        title={u.status === "active" ? "Disable User" : "Enable User"}
                      >
                        {u.status === "active" ? <Ban size={15} /> : <CheckCircle2 size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {addOpen && (
        <Modal title="Add Internal User Account" onClose={() => setAddOpen(false)}>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-[#374151] mb-1">Full Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Maria Manager"
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#374151] mb-1">Email Address *</label>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@dealflow360.com"
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#374151] mb-1">Assigned Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                >
                  <option value="ADMIN">Super Admin</option>
                  <option value="REP">Sales Rep</option>
                  <option value="MANAGER">Sales Manager</option>
                  <option value="FINANCE">Finance</option>
                  <option value="OPERATIONS">Operations</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-[#374151] mb-1">Department</label>
                <input
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  placeholder="Sales / Finance"
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setAddOpen(false)} className="px-4 py-2 border border-[#E5E7EB] rounded-xl text-xs font-semibold hover:bg-[#F4F5F7]">
                Cancel
              </button>
              <button onClick={handleCreateUser} className="px-4 py-2 bg-[#F26C4F] text-white rounded-xl text-xs font-bold hover:bg-[#e05535]">
                Create User
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
