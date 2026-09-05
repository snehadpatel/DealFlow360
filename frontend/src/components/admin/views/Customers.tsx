import React, { useState } from "react";
import {
  Search, Filter, Download, Upload, Plus, Eye, Edit2, Ban, CheckCircle2,
  Trash2, ChevronLeft, ChevronRight, X, Building2, User, Mail, Phone,
  CreditCard, DollarSign, Award, Clock, AlertTriangle, ShieldCheck
} from "lucide-react";
import StatusPill from "../ui/StatusPill";
import Modal from "../ui/Modal";
import ConfirmDialog from "../ui/ConfirmDialog";

const tiers = ["Bronze", "Silver", "Gold"];
const plans = ["Basic", "Pro", "Enterprise"];

const initialCustomers = [
  {
    id: 1,
    name: "Priya Sharma",
    company: "ABC Corporation",
    contactPerson: "Priya Sharma",
    email: "procurement@abccorp.com",
    phone: "+91 98000 00001",
    tier: "Gold",
    subscription: "Enterprise",
    activeDeals: 3,
    totalRevenue: "₹48,50,000",
    status: "active",
    joinedDate: "12 Jan 2026",
    industry: "IT & Services",
    billingAddress: "Tower 4, Prime Tech Park, Mumbai 400001",
    shippingAddress: "Warehouse Zone, Navi Mumbai 400703",
    creditLimit: "₹50,00,000",
    totalOrders: 28,
    renewalDate: "12 Jan 2027",
    billingCycle: "Annual",
  },
  {
    id: 2,
    name: "Rahul Mehta",
    company: "TechVision India",
    contactPerson: "Rahul Mehta",
    email: "orders@techvision.in",
    phone: "+91 98000 00002",
    tier: "Silver",
    subscription: "Pro",
    activeDeals: 2,
    totalRevenue: "₹18,20,000",
    status: "active",
    joinedDate: "18 Feb 2026",
    industry: "Consumer Electronics",
    billingAddress: "Cyber Hub, DLF Phase II, Gurugram 122002",
    shippingAddress: "Sector 18, Noida 201301",
    creditLimit: "₹20,00,000",
    totalOrders: 14,
    renewalDate: "18 Feb 2027",
    billingCycle: "Monthly",
  },
  {
    id: 3,
    name: "Deepa Nair",
    company: "Sunrise Retail Ltd",
    contactPerson: "Deepa Nair",
    email: "ops@sunriseretail.com",
    phone: "+91 98000 00003",
    tier: "Bronze",
    subscription: "Basic",
    activeDeals: 1,
    totalRevenue: "₹4,50,000",
    status: "active",
    joinedDate: "03 Mar 2026",
    industry: "Retail & FMCG",
    billingAddress: "MG Road, Bangalore 560001",
    shippingAddress: "Electronic City, Bangalore 560100",
    creditLimit: "₹5,00,000",
    totalOrders: 6,
    renewalDate: "03 Mar 2027",
    billingCycle: "Monthly",
  },
  {
    id: 4,
    name: "Ankit Singh",
    company: "GlobalEdge Systems",
    contactPerson: "Ankit Singh",
    email: "purchase@globaledge.io",
    phone: "+91 98000 00004",
    tier: "Gold",
    subscription: "Enterprise",
    activeDeals: 4,
    totalRevenue: "₹32,00,000",
    status: "active",
    joinedDate: "20 Mar 2026",
    industry: "Cloud Infrastructure",
    billingAddress: "HITEC City, Hyderabad 500081",
    shippingAddress: "Gachibowli, Hyderabad 500032",
    creditLimit: "₹30,00,000",
    totalOrders: 21,
    renewalDate: "20 Mar 2027",
    billingCycle: "Annual",
  },
  {
    id: 5,
    name: "Kavitha Rao",
    company: "Tech Mahindra",
    contactPerson: "Kavitha Rao",
    email: "kavitha@techmah.com",
    phone: "+91 98005 55678",
    tier: "Silver",
    subscription: "Pro",
    activeDeals: 0,
    totalRevenue: "₹12,80,000",
    status: "inactive",
    joinedDate: "05 Apr 2026",
    industry: "Telecom",
    billingAddress: "Pune Tech Park, Pune 411001",
    shippingAddress: "Pune Tech Park, Pune 411001",
    creditLimit: "₹15,00,000",
    totalOrders: 9,
    renewalDate: "05 Apr 2027",
    billingCycle: "Monthly",
  },
  {
    id: 6,
    name: "Suresh Babu",
    company: "Cognizant India",
    contactPerson: "Suresh Babu",
    email: "suresh.b@cognizant.com",
    phone: "+91 98006 66789",
    tier: "Bronze",
    subscription: "Basic",
    activeDeals: 0,
    totalRevenue: "₹2,10,000",
    status: "suspended",
    joinedDate: "11 Apr 2026",
    industry: "Outsourcing",
    billingAddress: "OMR Road, Chennai 600096",
    shippingAddress: "OMR Road, Chennai 600096",
    creditLimit: "₹3,00,000",
    totalOrders: 3,
    renewalDate: "11 Apr 2027",
    billingCycle: "Monthly",
  },
];

const emptyForm = {
  company: "",
  contactPerson: "",
  email: "",
  phone: "",
  tier: "Bronze",
  subscription: "Basic",
  industry: "",
  billingAddress: "",
  shippingAddress: "",
  creditLimit: "₹5,00,000",
};

export default function Customers() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [detailCustomer, setDetailCustomer] = useState<any | null>(null);
  const [editCustomer, setEditCustomer] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const perPage = 5;
  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === "all" || c.tier.toLowerCase() === tierFilter.toLowerCase();
    return matchesSearch && matchesTier;
  });

  const total = filtered.length;
  const pages = Math.ceil(total / perPage);
  const rows = filtered.slice((page - 1) * perPage, page * perPage);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function handleSaveNew() {
    if (!form.company || !form.email) return;
    const newCust = {
      ...form,
      id: Date.now(),
      name: form.contactPerson || form.company,
      activeDeals: 0,
      totalRevenue: "₹0",
      status: "active",
      joinedDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      totalOrders: 0,
      renewalDate: "One year from today",
      billingCycle: "Annual",
    };
    setCustomers([newCust, ...customers]);
    setAddOpen(false);
    setForm(emptyForm);
    showToast("Customer created successfully");
  }

  function handleUpdateAdminControls(tier: string, subscription: string, status: string) {
    if (!detailCustomer) return;
    const updated = customers.map((c) =>
      c.id === detailCustomer.id ? { ...c, tier, subscription, status } : c
    );
    setCustomers(updated);
    setDetailCustomer({ ...detailCustomer, tier, subscription, status });
    showToast("Customer parameters updated successfully");
  }

  function toggleStatus(id: number, currentStatus: string) {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    setCustomers(customers.map((c) => (c.id === id ? { ...c, status: nextStatus } : c)));
    showToast(`Customer status changed to ${nextStatus}`);
  }

  function handleDelete() {
    setCustomers(customers.filter((c) => c.id !== deleteId));
    setDeleteId(null);
    showToast("Customer deleted from database");
  }

  function exportCSV() {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Company,Contact,Email,Tier,Subscription,Status,Revenue"]
        .concat(customers.map((c) => `${c.company},${c.contactPerson},${c.email},${c.tier},${c.subscription},${c.status},${c.totalRevenue}`))
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
          <h2 className="text-[20px] font-bold text-[#1F2937] tracking-tight">Customers</h2>
          <p className="text-[#6B7280] text-xs mt-0.5">Manage customer accounts, commercial tiers, and subscriptions.</p>
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

      {/* Top Summary Cards (Prompt Requirement) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280] text-xs font-semibold">Total Customers</span>
            <div className="p-2 rounded-xl bg-orange-50 text-[#F26C4F]"><Building2 size={16} /></div>
          </div>
          <p className="text-2xl font-extrabold text-[#1F2937] mt-2">{customers.length}</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">+12% vs last month</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280] text-xs font-semibold">Active Customers</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><ShieldCheck size={16} /></div>
          </div>
          <p className="text-2xl font-extrabold text-[#1F2937] mt-2">
            {customers.filter((c) => c.status === "active").length}
          </p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">85% engagement rate</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280] text-xs font-semibold">New This Month</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><Clock size={16} /></div>
          </div>
          <p className="text-2xl font-extrabold text-[#1F2937] mt-2">+4</p>
          <p className="text-[10px] text-blue-600 font-bold mt-0.5">Joined in Aug 2026</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280] text-xs font-semibold">At Risk</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600"><AlertTriangle size={16} /></div>
          </div>
          <p className="text-2xl font-extrabold text-[#1F2937] mt-2">
            {customers.filter((c) => c.status === "suspended" || c.status === "inactive").length}
          </p>
          <p className="text-[10px] text-amber-600 font-bold mt-0.5">Requires outreach</p>
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

        {/* Customers Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#FAFBFD] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                <th className="py-3 px-4">Company & Contact</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4">Subscription</th>
                <th className="py-3 px-4 text-center">Active Deals</th>
                <th className="py-3 px-4">Total Revenue</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F5F7] text-xs">
              {rows.map((c) => (
                <tr key={c.id} className="hover:bg-[#FFF8F6]/50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-[#1F2937]">{c.company}</p>
                    <p className="text-[11px] text-[#6B7280]">{c.contactPerson} · {c.email}</p>
                  </td>
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
                  <td className="py-3 px-4 font-medium text-[#374151]">{c.subscription}</td>
                  <td className="py-3 px-4 text-center font-bold text-[#1F2937]">{c.activeDeals}</td>
                  <td className="py-3 px-4 font-bold text-[#1F2937]">{c.totalRevenue}</td>
                  <td className="py-3 px-4"><StatusPill status={c.status} /></td>
                  <td className="py-3 px-4 text-[#6B7280]">{c.joinedDate}</td>
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
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E7EB] text-xs text-[#6B7280]">
          <span>Showing {rows.length} of {total} customers</span>
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
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="e.g. Acme Corp India"
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#374151] mb-1">Contact Person *</label>
                <input
                  value={form.contactPerson}
                  onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                  placeholder="Full Name"
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#374151] mb-1">Email Address *</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="contact@company.com"
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
                  <option value="Bronze">Bronze (5% max discount)</option>
                  <option value="Silver">Silver (10% max discount)</option>
                  <option value="Gold">Gold (15% max discount)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-[#374151] mb-1">Subscription Plan</label>
                <select
                  value={form.subscription}
                  onChange={(e) => setForm({ ...form, subscription: e.target.value })}
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                >
                  <option value="Basic">Basic (₹999/mo)</option>
                  <option value="Pro">Pro (₹2,999/mo)</option>
                  <option value="Enterprise">Enterprise (Custom)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-bold text-[#374151] mb-1">Billing Address</label>
              <textarea
                value={form.billingAddress}
                onChange={(e) => setForm({ ...form, billingAddress: e.target.value })}
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
                onClick={handleSaveNew}
                className="px-4 py-2 bg-[#F26C4F] text-white rounded-xl text-xs font-bold hover:bg-[#e05535]"
              >
                Create Account
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Customer Detail & Admin Controls Drawer */}
      {detailCustomer && (
        <Modal title={`Customer Profile — ${detailCustomer.company}`} onClose={() => setDetailCustomer(null)}>
          <div className="space-y-4 text-xs">
            {/* Admin Override Bar */}
            <div className="bg-[#FFF8F6] border border-[#F26C4F]/30 rounded-xl p-3">
              <p className="font-bold text-[#F26C4F] text-xs mb-2">Super Admin Parameters Control</p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-[#6B7280] mb-0.5">Tier</label>
                  <select
                    value={detailCustomer.tier}
                    onChange={(e) => handleUpdateAdminControls(e.target.value, detailCustomer.subscription, detailCustomer.status)}
                    className="w-full bg-white border border-[#E5E7EB] rounded-lg px-2 py-1 text-xs font-bold text-[#1F2937]"
                  >
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#6B7280] mb-0.5">Plan</label>
                  <select
                    value={detailCustomer.subscription}
                    onChange={(e) => handleUpdateAdminControls(detailCustomer.tier, e.target.value, detailCustomer.status)}
                    className="w-full bg-white border border-[#E5E7EB] rounded-lg px-2 py-1 text-xs font-bold text-[#1F2937]"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Pro">Pro</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#6B7280] mb-0.5">Account Status</label>
                  <select
                    value={detailCustomer.status}
                    onChange={(e) => handleUpdateAdminControls(detailCustomer.tier, detailCustomer.subscription, e.target.value)}
                    className="w-full bg-white border border-[#E5E7EB] rounded-lg px-2 py-1 text-xs font-bold text-[#1F2937]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 border-r border-[#E5E7EB] pr-3">
                <p className="font-bold text-[#1F2937] border-b pb-1">Company Details</p>
                <p><span className="text-[#6B7280]">Contact:</span> {detailCustomer.contactPerson}</p>
                <p><span className="text-[#6B7280]">Email:</span> {detailCustomer.email}</p>
                <p><span className="text-[#6B7280]">Phone:</span> {detailCustomer.phone}</p>
                <p><span className="text-[#6B7280]">Industry:</span> {detailCustomer.industry || "Information Technology"}</p>
                <p><span className="text-[#6B7280]">Billing:</span> {detailCustomer.billingAddress || "Standard Corporate Address"}</p>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-[#1F2937] border-b pb-1">Commercial Summary</p>
                <p><span className="text-[#6B7280]">Credit Limit:</span> {detailCustomer.creditLimit}</p>
                <p><span className="text-[#6B7280]">Total Revenue:</span> {detailCustomer.totalRevenue}</p>
                <p><span className="text-[#6B7280]">Total Orders:</span> {detailCustomer.totalOrders}</p>
                <p><span className="text-[#6B7280]">Active Deals:</span> {detailCustomer.activeDeals}</p>
                <p><span className="text-[#6B7280]">Renewal Date:</span> {detailCustomer.renewalDate}</p>
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

      {/* Delete Confirmation Dialog */}
      {deleteId && (
        <ConfirmDialog
          title="Delete Customer Account"
          message="Are you sure you want to permanently delete this customer account? This action will remove all historical logs and cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
