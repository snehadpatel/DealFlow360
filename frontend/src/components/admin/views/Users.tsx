import React, { useState, useEffect } from "react";
import { Plus, Search, KeyRound, Ban, CheckCircle2, Trash2, Edit2, ChevronLeft, ChevronRight } from "lucide-react";
import StatusPill from "../ui/StatusPill";
import Modal from "../ui/Modal";
import { fetchUsersList, createUserApi, updateUserApi, deleteUserApi, ApiUser } from "../../../api/adminApi";

const rolesList = ["ADMIN", "REP", "MANAGER", "FINANCE", "OPERATIONS"];

export default function Users() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "REP", department: "Sales", password: "" });
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "REP", department: "Sales" });

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    const data = await fetchUsersList();
    setUsers(data);
    setLoading(false);
  }

  const filtered = users.filter((u) => {
    const uName = u.name || "";
    const uEmail = u.email || "";
    const mSearch = uName.toLowerCase().includes(search.toLowerCase()) || uEmail.toLowerCase().includes(search.toLowerCase());
    const mRole = roleFilter === "all" || u.role === roleFilter;
    return mSearch && mRole;
  });

  const total = filtered.length;
  const pages = Math.ceil(total / perPage);
  const rows = filtered.slice((page - 1) * perPage, page * perPage);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  async function handleCreateUser() {
    if (!form.name || !form.email) return;
    try {
      // Default the password when the admin leaves it blank so the backend's
      // required-ish field is satisfied and the new user can still sign in.
      const password = form.password?.trim() || "Pass@123";
      await createUserApi({ ...form, password, is_active: true });
      await loadUsers();
      setAddOpen(false);
      showToast(`User ${form.name} created successfully`);
      setForm({ name: "", email: "", role: "REP", department: "Sales", password: "" });
    } catch (e) {
      showToast("Error creating user");
    }
  }

  async function toggleStatus(id: string, currentStatus: boolean) {
    try {
      await updateUserApi(id, { is_active: !currentStatus });
      await loadUsers();
      showToast(`User status updated`);
    } catch (e) {
      showToast("Error updating status");
    }
  }

  function openEditModal(u: any) {
    setEditUser(u);
    setEditForm({
      name: u.name || "",
      email: u.email || "",
      role: u.role || "REP",
      department: u.department || "Sales",
    });
  }

  async function handleSaveEditUser() {
    if (!editUser || !editForm.name || !editForm.email) return;
    try {
      await updateUserApi(editUser.id, editForm);
      await loadUsers();
      setEditUser(null);
      showToast("User updated successfully");
    } catch (e) {
      showToast("Error updating user");
    }
  }

  async function changeRole(id: string, newRole: string) {
    try {
      await updateUserApi(id, { role: newRole });
      await loadUsers();
      showToast(`User role updated to ${newRole}`);
    } catch (e) {
      showToast("Error updating role");
    }
  }

  async function handleDeleteUser(id: string) {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUserApi(id);
      await loadUsers();
      showToast("User deleted successfully");
    } catch (e) {
      showToast("Error deleting user");
    }
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
          {loading ? (
            <div className="p-8 text-center text-xs text-gray-400">Loading users...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#FAFBFD] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F5F7] text-xs">
                {rows.map((u) => (
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
                    <td className="py-3 px-4">
                      <StatusPill status={u.is_active !== false ? "active" : "inactive"} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-lg text-[#6B7280] hover:text-blue-600 hover:bg-blue-50 transition"
                          title="Edit User"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => toggleStatus(u.id, u.is_active !== false)}
                          className="p-1.5 rounded-lg text-[#6B7280] hover:text-amber-600 hover:bg-amber-50 transition"
                          title={u.is_active !== false ? "Disable User" : "Enable User"}
                        >
                          {u.is_active !== false ? <Ban size={15} /> : <CheckCircle2 size={15} />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 rounded-lg text-[#6B7280] hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete User"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-[#E5E7EB] text-xs text-[#6B7280] gap-2">
          <div className="flex items-center gap-2">
            <span>Showing {total === 0 ? 0 : (page - 1) * perPage + 1}-{Math.min(page * perPage, total)} of <strong>{total}</strong> loaded database records</span>
            <select
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
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-1.5 rounded-lg border border-[#E5E7EB] disabled:opacity-40 hover:bg-[#F4F5F7]"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2 font-bold text-[#1F2937]">{page} / {pages || 1}</span>
            <button
              disabled={page === pages || pages === 0}
              onClick={() => setPage(p => p + 1)}
              className="p-1.5 rounded-lg border border-[#E5E7EB] disabled:opacity-40 hover:bg-[#F4F5F7]"
            >
              <ChevronRight size={14} />
            </button>
          </div>
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
            <div>
              <label className="block font-bold text-[#374151] mb-1">Temporary Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Leave blank to use default (Pass@123)"
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
              />
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

      {/* Edit User Modal */}
      {editUser && (
        <Modal title="Edit Internal User Account" onClose={() => setEditUser(null)}>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-[#374151] mb-1">Full Name *</label>
              <input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#374151] mb-1">Email Address *</label>
              <input
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#374151] mb-1">Assigned Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
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
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditUser(null)} className="px-4 py-2 border border-[#E5E7EB] rounded-xl text-xs font-semibold hover:bg-[#F4F5F7]">
                Cancel
              </button>
              <button onClick={handleSaveEditUser} className="px-4 py-2 bg-[#1F2937] text-white rounded-xl text-xs font-bold hover:bg-black">
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
