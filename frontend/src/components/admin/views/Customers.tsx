import React, { useState, useEffect } from "react";
import {
  Search, Filter, Download, Upload, Plus, Eye, Edit2, Ban, CheckCircle2,
  Trash2, ChevronLeft, ChevronRight, X, Building2, User, Mail, Phone,
  CreditCard, DollarSign, Award, Clock, AlertTriangle, ShieldCheck
} from "lucide-react";
import StatusPill from "../ui/StatusPill";
import Modal from "../ui/Modal";
import ConfirmDialog from "../ui/ConfirmDialog";
import { fetchCustomersList, createCustomerApi, updateCustomerApi, deleteCustomerApi, ApiCustomer } from "../../../api/adminApi";

const tiers = ["Bronze", "Silver", "Gold"];

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  tier: "Bronze",
  address_billing: "",
  credit_limit: 500000,
  status: "active",
};

export default function Customers() {
  const [customers, setCustomers] = useState<ApiCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [detailCustomer, setDetailCustomer] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  const [editCustomer, setEditCustomer] = useState<any | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    setLoading(true);
    const data = await fetchCustomersList();
    setCustomers(data);
    setLoading(false);
  }

  const [perPage, setPerPage] = useState(10);
  const filtered = customers.filter((c) => {
    const cName = c.name || "";
    const cEmail = c.email || "";
    const cTier = c.tier || "";
    const matchesSearch =
      cName.toLowerCase().includes(search.toLowerCase()) ||
      cEmail.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === "all" || cTier.toLowerCase() === tierFilter.toLowerCase();
    return matchesSearch && matchesTier;
  });

  const total = filtered.length;
  const pages = Math.ceil(total / perPage);
  const rows = filtered.slice((page - 1) * perPage, page * perPage);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  async function handleCreateCustomer() {
    if (!form.name || !form.email) return;
    try {
      await createCustomerApi({ ...form });
      await loadCustomers();
      setAddOpen(false);
      setForm(emptyForm);
      showToast("Customer created successfully");
    } catch (e) {
      showToast("Error creating customer");
    }
  }

  function openEditModal(c: any) {
    setEditCustomer(c);
    setEditForm({
      name: c.name || "",
      email: c.email || "",
      phone: c.phone || "",
      tier: c.tier || "Bronze",
      address_billing: c.address_billing || "",
      credit_limit: c.credit_limit || 500000,
      status: c.status || "active",
    });
  }

  async function handleSaveEditCustomer() {
    if (!editCustomer || !editForm.name || !editForm.email) return;
    try {
      await updateCustomerApi(editCustomer.id, editForm);
      await loadCustomers();
      setEditCustomer(null);
      showToast("Customer updated successfully");
    } catch (e) {
      showToast("Error updating customer");
    }
  }

  async function toggleStatus(id: string, currentStatus: string) {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      await updateCustomerApi(id, { status: nextStatus });
      await loadCustomers();
      showToast(`Customer status changed to ${nextStatus}`);
    } catch (e) {
      showToast("Error updating status");
    }
  }

  async function handleDeleteCustomer() {
    if (!deleteId) return;
    try {
      await deleteCustomerApi(deleteId);
      await loadCustomers();
      setDeleteId(null);
      showToast("Customer deleted successfully");
    } catch (e) {
      showToast("Error deleting customer");
    }
  }

  async function handleUpdateAdminControls(tier: string, status: string) {
    if (!detailCustomer) return;
    try {
      await updateCustomerApi(detailCustomer.id, { tier, status });
      await loadCustomers();
      setDetailCustomer({ ...detailCustomer, tier, status });
      showToast("Customer parameters updated");
    } catch (err) {
      showToast("Error updating customer");
    }
  }

  function exportCSV() {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Company,Email,Phone,Tier,Status"]
        .concat(customers.map((c) => `${c.name},${c.email},${c.phone},${c.tier},${c.status}`))
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "dealflow360_customers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported customers CSV successfully");
  }

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1F2937] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2 animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {toast}
        </div>
      )}

      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-[#1F2937] tracking-tight">Customers DB</h2>
          <p className="text-[#6B7280] text-xs mt-0.5">Manage customer accounts and global tier settings.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast("Bulk import template ready for download")}
            className="flex items-center gap-1.5 border border-[#E5E7EB] bg-white text-[#374151] px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#F4F5F7] transition"
          >
            <Upload size={14} /> Import
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 border border-[#E5E7EB] bg-white text-[#374151] px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#F4F5F7] transition"
          >
            <Download size={14} /> Export
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 bg-[#F26C4F] text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-[#e05535] transition shadow-xs"
          >
            <Plus size={16} /> Add Customer
          </button>
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280] text-xs font-semibold">Total Customers</span>
            <div className="p-2 rounded-xl bg-orange-50 text-[#F26C4F]"><Building2 size={16} /></div>
          </div>
          <p className="text-2xl font-extrabold text-[#1F2937] mt-2">{customers.length}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280] text-xs font-semibold">Active Customers</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><ShieldCheck size={16} /></div>
          </div>
          <p className="text-2xl font-extrabold text-[#1F2937] mt-2">
            {customers.filter((c) => c.status === "active").length}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280] text-xs font-semibold">New This Month</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><Clock size={16} /></div>
          </div>
          <p className="text-2xl font-extrabold text-[#1F2937] mt-2">+{customers.length}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280] text-xs font-semibold">At Risk</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600"><AlertTriangle size={16} /></div>
          </div>
          <p className="text-2xl font-extrabold text-[#1F2937] mt-2">
            {customers.filter((c) => c.status === "suspended" || c.status === "inactive").length}
          </p>
        </div>
      </div>

      {/* Customer Table Container */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-xs">
        {/* Filters Bar */}
        <div className="flex items-center justify-between gap-3 p-4 border-b border-[#E5E7EB] flex-wrap">
          <div className="flex items-center gap-2 bg-[#F4F5F7] rounded-xl px-3 py-2 flex-1 min-w-[200px]">
            <Search size={15} className="text-[#9CA3AF] flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search customer, company, email..."
              className="bg-transparent outline-none text-xs text-[#1F2937] w-full placeholder-[#9CA3AF]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="border border-[#E5E7EB] bg-white rounded-xl px-3 py-2 text-xs font-medium text-[#374151] outline-none"
            >
              <option value="all">All Tiers</option>
              <option value="gold">Gold Tier</option>
              <option value="silver">Silver Tier</option>
              <option value="bronze">Bronze Tier</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-8 text-center text-xs text-gray-400">Loading customers...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#FAFBFD] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">Credit Limit</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F5F7] text-xs">
                {rows.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FFF8F6]/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-[#1F2937]">{c.name}</p>
                    </td>
                    <td className="py-3 px-4 font-medium text-[#374151]">{c.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.tier === "Gold"
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : c.tier === "Silver"
                            ? "bg-slate-100 text-slate-700 border border-slate-300"
                            : "bg-orange-100 text-orange-800 border border-orange-200"
                        }`}
                      >
                        {c.tier}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#1F2937]">₹{c.credit_limit?.toLocaleString("en-IN")}</td>
                    <td className="py-3 px-4"><StatusPill status={c.status} /></td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDetailCustomer(c)}
                          className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#F26C4F] hover:bg-orange-50 transition"
                          title="View Detail"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 rounded-lg text-[#6B7280] hover:text-blue-600 hover:bg-blue-50 transition"
                          title="Edit Customer"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => toggleStatus(c.id, c.status)}
                          className={`p-1.5 rounded-lg transition ${
                            c.status === "active"
                              ? "text-[#6B7280] hover:text-amber-600 hover:bg-amber-50"
                              : "text-emerald-600 hover:bg-emerald-50"
                          }`}
                          title={c.status === "active" ? "Suspend Customer" : "Activate Customer"}
                        >
                          {c.status === "active" ? <Ban size={15} /> : <CheckCircle2 size={15} />}
                        </button>
                        <button
                          onClick={() => setDeleteId(c.id)}
                          className="p-1.5 rounded-lg text-[#6B7280] hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">No customers found.</td>
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

      {/* Add Customer Modal */}
      {addOpen && (
        <Modal title="Add New Customer Account" onClose={() => setAddOpen(false)}>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-[#374151] mb-1">Company Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Acme Corp India"
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#374151] mb-1">Email Address *</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="contact@company.com"
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#374151] mb-1">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91..."
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#374151] mb-1">Customer Tier</label>
                <select
                  value={form.tier}
                  onChange={(e) => setForm({ ...form, tier: e.target.value })}
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                >
                  <option value="Bronze">Bronze</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-[#374151] mb-1">Credit Limit</label>
                <input
                  type="number"
                  value={form.credit_limit}
                  onChange={(e) => setForm({ ...form, credit_limit: Number(e.target.value) })}
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold text-[#374151] mb-1">Billing Address</label>
              <textarea
                value={form.address_billing}
                onChange={(e) => setForm({ ...form, address_billing: e.target.value })}
                rows={2}
                placeholder="Full street address, city, pin code"
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAddOpen(false)}
                className="px-4 py-2 border border-[#E5E7EB] rounded-xl text-xs font-semibold hover:bg-[#F4F5F7]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomer}
                className="px-4 py-2 bg-[#F26C4F] text-white rounded-xl text-xs font-bold hover:bg-[#e05535]"
              >
                Create Account
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Customer Detail Drawer */}
      {detailCustomer && (
        <Modal title={`Customer Profile — ${detailCustomer.name}`} onClose={() => setDetailCustomer(null)}>
          <div className="space-y-4 text-xs">
            <div className="bg-[#FFF8F6] border border-[#F26C4F]/30 rounded-xl p-3">
              <p className="font-bold text-[#F26C4F] text-xs mb-2">Admin Control</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-[#6B7280] mb-0.5">Tier</label>
                  <select
                    value={detailCustomer.tier}
                    onChange={(e) => handleUpdateAdminControls(e.target.value, detailCustomer.status)}
                    className="w-full bg-white border border-[#E5E7EB] rounded-lg px-2 py-1 text-xs font-bold text-[#1F2937]"
                  >
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#6B7280] mb-0.5">Account Status</label>
                  <select
                    value={detailCustomer.status}
                    onChange={(e) => handleUpdateAdminControls(detailCustomer.tier, e.target.value)}
                    className="w-full bg-white border border-[#E5E7EB] rounded-lg px-2 py-1 text-xs font-bold text-[#1F2937]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 border-r border-[#E5E7EB] pr-3">
                <p className="font-bold text-[#1F2937] border-b pb-1">Company Details</p>
                <p><span className="text-[#6B7280]">Email:</span> {detailCustomer.email}</p>
                <p><span className="text-[#6B7280]">Phone:</span> {detailCustomer.phone || "N/A"}</p>
                <p><span className="text-[#6B7280]">Billing:</span> {detailCustomer.address_billing || "N/A"}</p>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-[#1F2937] border-b pb-1">Commercial Summary</p>
                <p><span className="text-[#6B7280]">Credit Limit:</span> ₹{detailCustomer.credit_limit?.toLocaleString("en-IN") || "0"}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDetailCustomer(null)}
                className="px-4 py-1.5 bg-[#1F2937] text-white text-xs font-bold rounded-xl hover:bg-black"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Customer Modal */}
      {editCustomer && (
        <Modal title="Edit Customer Account" onClose={() => setEditCustomer(null)}>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-[#374151] mb-1">Company Name *</label>
              <input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#374151] mb-1">Email Address *</label>
                <input
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#374151] mb-1">Phone</label>
                <input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#374151] mb-1">Customer Tier</label>
                <select
                  value={editForm.tier}
                  onChange={(e) => setEditForm({ ...editForm, tier: e.target.value })}
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                >
                  <option value="Bronze">Bronze</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-[#374151] mb-1">Credit Limit</label>
                <input
                  type="number"
                  value={editForm.credit_limit}
                  onChange={(e) => setEditForm({ ...editForm, credit_limit: Number(e.target.value) })}
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold text-[#374151] mb-1">Billing Address</label>
              <textarea
                value={editForm.address_billing}
                onChange={(e) => setEditForm({ ...editForm, address_billing: e.target.value })}
                rows={2}
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditCustomer(null)}
                className="px-4 py-2 border border-[#E5E7EB] rounded-xl text-xs font-semibold hover:bg-[#F4F5F7]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditCustomer}
                className="px-4 py-2 bg-[#1F2937] text-white rounded-xl text-xs font-bold hover:bg-black"
              >
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete Customer Account"
          message="Are you sure you want to delete this customer?"
          onConfirm={handleDeleteCustomer}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
