import { useState } from "react";
import { Search, Filter, Download, Plus, Eye, Edit2, Ban, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";
import StatusPill from "../ui/StatusPill";
import Modal from "../ui/Modal";
import ConfirmDialog from "../ui/ConfirmDialog";

const tiers = ["Bronze", "Silver", "Gold"];
const plans = ["Basic", "Pro", "Enterprise"];

const initialCustomers = [
  { id: 1, name: "Priya Sharma", company: "Infosys Ltd.", email: "priya@infosys.com", phone: "+91 98001 11234", tier: "Gold", subscription: "Enterprise", status: "active", created: "12 Jan 2026" },
  { id: 2, name: "Rahul Mehta", company: "TCS Group", email: "rahul.m@tcs.com", phone: "+91 98002 22345", tier: "Silver", subscription: "Pro", status: "active", created: "18 Feb 2026" },
  { id: 3, name: "Deepa Nair", company: "Wipro Solutions", email: "deepa@wipro.com", phone: "+91 98003 33456", tier: "Gold", subscription: "Enterprise", status: "active", created: "3 Mar 2026" },
  { id: 4, name: "Ankit Singh", company: "HCL Technologies", email: "ankit.s@hcl.com", phone: "+91 98004 44567", tier: "Bronze", subscription: "Basic", status: "inactive", created: "20 Mar 2026" },
  { id: 5, name: "Kavitha Rao", company: "Tech Mahindra", email: "kavitha@techmah.com", phone: "+91 98005 55678", tier: "Silver", subscription: "Pro", status: "active", created: "5 Apr 2026" },
  { id: 6, name: "Suresh Babu", company: "Cognizant", email: "suresh.b@cognizant.com", phone: "+91 98006 66789", tier: "Bronze", subscription: "Basic", status: "suspended", created: "11 Apr 2026" },
  { id: 7, name: "Nisha Patel", company: "Accenture India", email: "nisha.p@accenture.com", phone: "+91 98007 77890", tier: "Gold", subscription: "Enterprise", status: "active", created: "22 May 2026" },
  { id: 8, name: "Vikram Joshi", company: "Capgemini", email: "vikram@capgemini.com", phone: "+91 98008 88901", tier: "Silver", subscription: "Pro", status: "active", created: "3 Jun 2026" },
];

const emptyForm = { name: "", company: "", email: "", phone: "", address: "", tier: "Bronze", subscription: "Basic", status: "active", notes: "" };

function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-[#6B7280] mb-1">
        {label}{required && <span className="text-[#EF4444] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-[13px] text-[#1F2937] outline-none focus:border-[#F26C4F] focus:ring-1 focus:ring-[#F26C4F]/20 placeholder-[#9CA3AF]";

export default function Customers() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const perPage = 5;
  const filtered = customers.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase())
  );
  const total = filtered.length;
  const pages = Math.ceil(total / perPage);
  const rows = filtered.slice((page - 1) * perPage, page * perPage);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function handleSave() {
    if (!form.name || !form.email) return;
    setCustomers([...customers, { ...form, id: Date.now(), created: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) }]);
    setAddOpen(false);
    setForm(emptyForm);
    showToast("Customer added successfully");
  }

  function handleDelete() {
    setCustomers(customers.filter((c) => c.id !== deleteId));
    setDeleteId(null);
    showToast("Customer deleted");
  }

  const detail = customers.find((c) => c.id === detailId);

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1F2937] text-white text-sm px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />{toast}
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-[#1F2937]">Customers</h2>
          <p className="text-[#6B7280] text-sm">Manage customer accounts and profiles.</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 bg-[#F26C4F] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#E05A3E] transition-colors flex-shrink-0">
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-[#E5E7EB] flex-wrap">
          <div className="flex items-center gap-2 bg-[#F4F5F7] rounded-lg px-3 py-2 flex-1 min-w-[180px]">
            <Search size={15} className="text-[#9CA3AF] flex-shrink-0" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search customers..." className="bg-transparent outline-none text-[13px] text-[#1F2937] w-full placeholder-[#9CA3AF]" />
          </div>
          <button className="flex items-center gap-2 border border-[#E5E7EB] rounded-lg px-3 py-2 text-[13px] text-[#6B7280] hover:bg-[#F4F5F7]"><Filter size={14} />Filter</button>
          <button className="flex items-center gap-2 border border-[#E5E7EB] rounded-lg px-3 py-2 text-[13px] text-[#6B7280] hover:bg-[#F4F5F7]"><Download size={14} />Export</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[#E5E7EB]">
              <tr>
                {["Customer", "Company", "Email", "Phone", "Tier", "Subscription", "Status", "Created", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-[#6B7280] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b border-[#F4F5F7] last:border-0 hover:bg-[#FAFAFA]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#F26C4F]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#F26C4F] font-semibold text-xs">{c.name.charAt(0)}</span>
                      </div>
                      <span className="text-[13px] font-medium text-[#1F2937] whitespace-nowrap">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280] whitespace-nowrap">{c.company}</td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">{c.email}</td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280] whitespace-nowrap">{c.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${c.tier === "Gold" ? "bg-amber-50 text-amber-700" : c.tier === "Silver" ? "bg-gray-100 text-gray-600" : "bg-orange-50 text-orange-700"}`}>{c.tier}</span>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">{c.subscription}</td>
                  <td className="px-4 py-3"><StatusPill status={c.status} /></td>
                  <td className="px-4 py-3 text-[12px] text-[#6B7280] whitespace-nowrap">{c.created}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setDetailId(c.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F4F5F7] text-[#6B7280]" title="View"><Eye size={14} /></button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F4F5F7] text-[#6B7280]" title="Edit"><Edit2 size={14} /></button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-amber-50 text-[#6B7280] hover:text-amber-600" title="Disable"><Ban size={14} /></button>
                      <button onClick={() => setDeleteId(c.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#6B7280] hover:text-red-500" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-[#6B7280] text-sm">No customers found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E7EB]">
          <p className="text-[12px] text-[#6B7280]">Showing {Math.min((page-1)*perPage+1, total)}–{Math.min(page*perPage, total)} of {total}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(Math.max(1, page-1))} disabled={page === 1} className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280] disabled:opacity-40 hover:bg-[#F4F5F7]"><ChevronLeft size={14} /></button>
            {Array.from({ length: pages }, (_, i) => i+1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 flex items-center justify-center rounded-lg text-[12px] font-medium ${page === p ? "bg-[#F26C4F] text-white" : "border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F4F5F7]"}`}>{p}</button>
            ))}
            <button onClick={() => setPage(Math.min(pages, page+1))} disabled={page === pages} className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280] disabled:opacity-40 hover:bg-[#F4F5F7]"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* Add Customer Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Customer" description="Fill in the details to create a new customer account." onSave={handleSave} saveLabel="Save Customer" size="md">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Customer Name" required>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="Full name" />
          </FormField>
          <FormField label="Company Name" required>
            <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={inputCls} placeholder="Company" />
          </FormField>
          <FormField label="Email" required>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} placeholder="email@company.com" />
          </FormField>
          <FormField label="Phone">
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} placeholder="+91 98000 00000" />
          </FormField>
          <div className="col-span-2">
            <FormField label="Address">
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputCls} placeholder="Street address, city, state" />
            </FormField>
          </div>
          <FormField label="Customer Tier">
            <select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })} className={inputCls}>
              {tiers.map((t) => <option key={t}>{t}</option>)}
            </select>
          </FormField>
          <FormField label="Subscription Plan">
            <select value={form.subscription} onChange={(e) => setForm({ ...form, subscription: e.target.value })} className={inputCls}>
              {plans.map((p) => <option key={p}>{p}</option>)}
            </select>
          </FormField>
          <FormField label="Status">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </FormField>
          <div className="col-span-2">
            <FormField label="Notes">
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`${inputCls} resize-none`} rows={2} placeholder="Optional notes..." />
            </FormField>
          </div>
        </div>
      </Modal>

      {/* Customer Detail Modal */}
      {detail && (
        <Modal open={true} onClose={() => setDetailId(null)} title="Customer Details" size="lg">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-[#F4F5F7] rounded-xl">
              <div className="w-12 h-12 rounded-full bg-[#F26C4F] flex items-center justify-center">
                <span className="text-white font-bold text-lg">{detail.name.charAt(0)}</span>
              </div>
              <div>
                <p className="text-[#1F2937] font-semibold text-base">{detail.name}</p>
                <p className="text-[#6B7280] text-sm">{detail.company}</p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusPill status={detail.status} />
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${detail.tier === "Gold" ? "bg-amber-50 text-amber-700" : detail.tier === "Silver" ? "bg-gray-100 text-gray-600" : "bg-orange-50 text-orange-700"}`}>{detail.tier}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Email", value: detail.email },
                { label: "Phone", value: detail.phone },
                { label: "Subscription", value: detail.subscription },
                { label: "Member Since", value: detail.created },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-[11px] text-[#6B7280] mb-0.5">{f.label}</p>
                  <p className="text-[13px] text-[#1F2937] font-medium">{f.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-[#F4F5F7] rounded-xl p-4 grid grid-cols-3 gap-3">
              {[{ label: "Total Orders", value: "24" }, { label: "Total Spend", value: "₹14.2L" }, { label: "Open Deals", value: "3" }].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-[#1F2937] font-bold text-lg">{s.value}</p>
                  <p className="text-[#6B7280] text-[11px]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog open={deleteId !== null} title="Delete Customer" message="This will permanently remove the customer and all associated data. This action cannot be undone." confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
