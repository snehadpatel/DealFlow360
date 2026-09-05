import { useState } from "react";
import { Search, Plus, Edit2, Eye, Trash2, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import StatusPill from "../ui/StatusPill";
import Modal from "../ui/Modal";
import ConfirmDialog from "../ui/ConfirmDialog";

const categories = ["Hardware", "Software", "Services", "Accessories", "Cloud"];

const initialProducts = [
  { id: 1, name: "Revalo Pro Server", sku: "RV-SRV-001", category: "Hardware", basePrice: 1250000, tax: 18, stock: "In Stock", status: "active", updated: "1 Sep 2026" },
  { id: 2, name: "Revalo Cloud Suite", sku: "RV-CLD-002", category: "Software", basePrice: 48000, tax: 18, stock: "In Stock", status: "active", updated: "28 Aug 2026" },
  { id: 3, name: "SmartSwitch 48P", sku: "RV-NET-003", category: "Hardware", basePrice: 185000, tax: 18, stock: "Low Stock", status: "active", updated: "20 Aug 2026" },
  { id: 4, name: "Premium Support Pack", sku: "RV-SVC-004", category: "Services", basePrice: 35000, tax: 18, stock: "In Stock", status: "active", updated: "15 Aug 2026" },
  { id: 5, name: "Revalo Backup Agent", sku: "RV-BCK-005", category: "Software", basePrice: 12000, tax: 18, stock: "In Stock", status: "draft", updated: "10 Aug 2026" },
  { id: 6, name: "UPS 2KVA", sku: "RV-ACC-006", category: "Accessories", basePrice: 22000, tax: 18, stock: "Out of Stock", status: "inactive", updated: "5 Aug 2026" },
];

const emptyForm = { name: "", sku: "", description: "", category: "Hardware", basePrice: "", taxRate: "18", status: "active" };
const inputCls = "w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-[13px] text-[#1F2937] outline-none focus:border-[#F26C4F] focus:ring-1 focus:ring-[#F26C4F]/20 placeholder-[#9CA3AF]";

function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-[#6B7280] mb-1">{label}{required && <span className="text-[#EF4444] ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}

function stockColor(s: string) {
  if (s === "In Stock") return "bg-emerald-50 text-emerald-700";
  if (s === "Low Stock") return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-600";
}

export default function Products() {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const perPage = 5;
  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 2500); }

  function handleSave() {
    if (!form.name || !form.sku) return;
    setProducts([...products, { ...form, id: Date.now(), basePrice: Number(form.basePrice), tax: Number(form.taxRate), stock: "In Stock", updated: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) }]);
    setAddOpen(false);
    setForm(emptyForm);
    showToast("Product added successfully");
  }

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1F2937] text-white text-sm px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />{toast}
        </div>
      )}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-[#1F2937]">Products</h2>
          <p className="text-[#6B7280] text-sm">Manage your product catalog and pricing.</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 bg-[#F26C4F] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#E05A3E] flex-shrink-0">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-[#E5E7EB] flex-wrap">
          <div className="flex items-center gap-2 bg-[#F4F5F7] rounded-lg px-3 py-2 flex-1 min-w-[180px]">
            <Search size={15} className="text-[#9CA3AF]" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search products or SKU..." className="bg-transparent outline-none text-[13px] text-[#1F2937] w-full placeholder-[#9CA3AF]" />
          </div>
          <button className="flex items-center gap-2 border border-[#E5E7EB] rounded-lg px-3 py-2 text-[13px] text-[#6B7280] hover:bg-[#F4F5F7]"><Filter size={14} />Filter</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[#E5E7EB]">
              <tr>
                {["Product", "SKU", "Category", "Base Price", "Tax", "Stock Status", "Status", "Last Updated", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-[#6B7280] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-[#F4F5F7] last:border-0 hover:bg-[#FAFAFA]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#F4F5F7] flex items-center justify-center text-[#F26C4F] flex-shrink-0 text-[10px] font-bold">{p.category.slice(0,2)}</div>
                      <span className="text-[13px] font-medium text-[#1F2937]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px] font-mono text-[#6B7280]">{p.sku}</td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">{p.category}</td>
                  <td className="px-4 py-3 text-[13px] font-medium text-[#1F2937]">₹{p.basePrice.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">{p.tax}%</td>
                  <td className="px-4 py-3"><span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${stockColor(p.stock)}`}>{p.stock}</span></td>
                  <td className="px-4 py-3"><StatusPill status={p.status} /></td>
                  <td className="px-4 py-3 text-[12px] text-[#6B7280]">{p.updated}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F4F5F7] text-[#6B7280]"><Eye size={14} /></button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F4F5F7] text-[#6B7280]"><Edit2 size={14} /></button>
                      <button onClick={() => setDeleteId(p.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#6B7280] hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={9} className="px-4 py-12 text-center text-[#6B7280] text-sm">No products found</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E7EB]">
          <p className="text-[12px] text-[#6B7280]">Showing {Math.min((page-1)*perPage+1, total)}–{Math.min(page*perPage, total)} of {total}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(Math.max(1, page-1))} disabled={page === 1} className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280] disabled:opacity-40"><ChevronLeft size={14} /></button>
            {Array.from({ length: pages }, (_, i) => i+1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 flex items-center justify-center rounded-lg text-[12px] font-medium ${page === p ? "bg-[#F26C4F] text-white" : "border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F4F5F7]"}`}>{p}</button>
            ))}
            <button onClick={() => setPage(Math.min(pages, page+1))} disabled={page === pages} className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280] disabled:opacity-40"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Product" description="Fill in product details to add to your catalog." onSave={handleSave} saveLabel="Save Product" size="md">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Product Name" required>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="Product name" />
          </FormField>
          <FormField label="SKU" required>
            <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className={inputCls} placeholder="RV-XXXX-000" />
          </FormField>
          <div className="col-span-2">
            <FormField label="Description">
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputCls} resize-none`} rows={2} placeholder="Short product description" />
            </FormField>
          </div>
          <FormField label="Category">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Base Price (₹)" required>
            <input type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} className={inputCls} placeholder="0" />
          </FormField>
          <FormField label="Tax Rate (%)">
            <select value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: e.target.value })} className={inputCls}>
              {["0","5","12","18","28"].map((r) => <option key={r}>{r}</option>)}
            </select>
          </FormField>
          <FormField label="Status">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="inactive">Inactive</option>
            </select>
          </FormField>
          <div className="col-span-2 border border-[#E5E7EB] rounded-xl p-4 bg-[#F4F5F7]">
            <p className="text-[12px] font-medium text-[#1F2937] mb-2">Tax Configuration</p>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Tax Type">
                <select className={inputCls}><option>GST</option><option>IGST</option><option>VAT</option></select>
              </FormField>
              <FormField label="Effective Date">
                <input type="date" className={inputCls} defaultValue="2026-01-01" />
              </FormField>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={deleteId !== null} title="Delete Product" message="This will permanently delete this product from your catalog. This cannot be undone." confirmLabel="Delete" onConfirm={() => { setProducts(products.filter((p) => p.id !== deleteId)); setDeleteId(null); showToast("Product deleted"); }} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
