import React, { useState } from "react";
import {
  Search, Filter, Download, Upload, Plus, Eye, Edit2, Ban, CheckCircle2,
  Trash2, ChevronLeft, ChevronRight, Package, Tag, AlertTriangle, Layers
} from "lucide-react";
import StatusPill from "../ui/StatusPill";
import Modal from "../ui/Modal";
import ConfirmDialog from "../ui/ConfirmDialog";

const categories = ["Hardware", "Subscription", "Services", "Software"];

const initialProducts = [
  {
    id: 1,
    name: "Enterprise Laptop Pro X1",
    sku: "LAP-PRO-X1",
    category: "Hardware",
    price: 85000,
    tax: 18,
    stock: 3,
    status: "active",
    createdDate: "10 Jan 2026",
    description: "High-performance enterprise laptop with 16GB RAM, 512GB SSD",
    unit: "unit",
    variants: "16GB/512GB, 32GB/1TB",
    isSubscriptionEligible: false,
  },
  {
    id: 2,
    name: "Cloud Management Suite",
    sku: "SaaS-CMS-ENT",
    category: "Subscription",
    price: 12000,
    tax: 18,
    stock: 999,
    status: "active",
    createdDate: "15 Jan 2026",
    description: "Comprehensive cloud infrastructure management platform",
    unit: "license",
    variants: "Monthly, Annual",
    isSubscriptionEligible: true,
  },
  {
    id: 3,
    name: "Network Security Firewall XG-500",
    sku: "NET-FW-XG500",
    category: "Hardware",
    price: 150000,
    tax: 18,
    stock: 12,
    status: "active",
    createdDate: "01 Feb 2026",
    description: "Enterprise-grade next-generation firewall with high throughput",
    unit: "unit",
    variants: "Standard, Dual PSU",
    isSubscriptionEligible: false,
  },
  {
    id: 4,
    name: "On-Site Deployment Service",
    sku: "SRV-DEPLOY-01",
    category: "Services",
    price: 50000,
    tax: 18,
    stock: 50,
    status: "active",
    createdDate: "10 Feb 2026",
    description: "Professional on-site installation and configuration service",
    unit: "project",
    variants: "1-day, 3-day SLA",
    isSubscriptionEligible: false,
  },
  {
    id: 5,
    name: "24/7 Premium Support Plan",
    sku: "SUP-PREMIUM-YR",
    category: "Subscription",
    price: 36000,
    tax: 18,
    stock: 999,
    status: "active",
    createdDate: "01 Mar 2026",
    description: "24/7 dedicated support with 1-hour SLA response guarantee",
    unit: "year",
    variants: "Standard, Priority",
    isSubscriptionEligible: true,
  },
  {
    id: 6,
    name: "Legacy Workstation Tower",
    sku: "WS-TOWER-OLD",
    category: "Hardware",
    price: 45000,
    tax: 18,
    stock: 0,
    status: "inactive",
    createdDate: "12 Nov 2025",
    description: "Discontinued workstation tower model",
    unit: "unit",
    variants: "Base",
    isSubscriptionEligible: false,
  },
];

const emptyForm = {
  name: "",
  sku: "",
  category: "Hardware",
  price: 0,
  tax: 18,
  stock: 10,
  unit: "unit",
  description: "",
  variants: "Standard",
  isSubscriptionEligible: false,
};

export default function Products() {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [detailProduct, setDetailProduct] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const perPage = 5;
  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "all" || p.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const total = filtered.length;
  const pages = Math.ceil(total / perPage);
  const rows = filtered.slice((page - 1) * perPage, page * perPage);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function handleCreateProduct() {
    if (!form.name || !form.sku) return;
    const newProd = {
      ...form,
      id: Date.now(),
      status: "active",
      createdDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    };
    setProducts([newProd, ...products]);
    setAddOpen(false);
    setForm(emptyForm);
    showToast("Product created successfully");
  }

  function toggleProductStatus(id: number, currentStatus: string) {
    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    setProducts(products.map((p) => (p.id === id ? { ...p, status: nextStatus } : p)));
    showToast(`Product set to ${nextStatus}`);
  }

  function handleDeleteProduct() {
    setProducts(products.filter((p) => p.id !== deleteId));
    setDeleteId(null);
    showToast("Product deleted from catalog");
  }

  function exportCSV() {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Product Name,SKU,Category,Price,Tax,Stock,Status"]
        .concat(products.map((p) => `${p.name},${p.sku},${p.category},${p.price},${p.tax}%,${p.stock},${p.status}`))
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "dealflow360_products.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported product catalog CSV");
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
          <h2 className="text-[20px] font-bold text-[#1F2937] tracking-tight">Product Catalog</h2>
          <p className="text-[#6B7280] text-xs mt-0.5">Centralized master record of SKUs, pricing, tax rates, and stock.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast("Bulk SKU import template downloaded")}
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
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Top Cards (Prompt Specs) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280] text-xs font-semibold">Total Products</span>
            <div className="p-2 rounded-xl bg-orange-50 text-[#F26C4F]"><Package size={16} /></div>
          </div>
          <p className="text-2xl font-extrabold text-[#1F2937] mt-2">{products.length}</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">+5 SKUs added this quarter</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280] text-xs font-semibold">Active Products</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><Tag size={16} /></div>
          </div>
          <p className="text-2xl font-extrabold text-[#1F2937] mt-2">
            {products.filter((p) => p.status === "active").length}
          </p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Available for quotes</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280] text-xs font-semibold">Out of Stock / Low</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600"><AlertTriangle size={16} /></div>
          </div>
          <p className="text-2xl font-extrabold text-[#1F2937] mt-2">
            {products.filter((p) => p.stock <= 3).length}
          </p>
          <p className="text-[10px] text-amber-600 font-bold mt-0.5">Stock replenishment alert</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280] text-xs font-semibold">Categories</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><Layers size={16} /></div>
          </div>
          <p className="text-2xl font-extrabold text-[#1F2937] mt-2">{categories.length}</p>
          <p className="text-[10px] text-blue-600 font-bold mt-0.5">Hardware, SaaS, Services</p>
        </div>
      </div>

      {/* Product Table Container */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-xs">
        {/* Filters */}
        <div className="flex items-center justify-between gap-3 p-4 border-b border-[#E5E7EB] flex-wrap">
          <div className="flex items-center gap-2 bg-[#F4F5F7] rounded-xl px-3 py-2 flex-1 min-w-[200px]">
            <Search size={15} className="text-[#9CA3AF] flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search product name, SKU..."
              className="bg-transparent outline-none text-xs text-[#1F2937] w-full placeholder-[#9CA3AF]"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-[#E5E7EB] bg-white rounded-xl px-3 py-2 text-xs font-medium text-[#374151] outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#FAFBFD] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price (₹)</th>
                <th className="py-3 px-4">Tax %</th>
                <th className="py-3 px-4 text-center">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F5F7] text-xs">
              {rows.map((p) => (
                <tr key={p.id} className="hover:bg-[#FFF8F6]/50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-[#1F2937]">{p.name}</p>
                    <p className="text-[11px] text-[#6B7280] line-clamp-1">{p.description}</p>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#374151]">{p.sku}</td>
                  <td className="py-3 px-4 font-medium text-[#4B5563]">{p.category}</td>
                  <td className="py-3 px-4 font-bold text-[#1F2937]">₹{p.price.toLocaleString("en-IN")}</td>
                  <td className="py-3 px-4 font-semibold text-[#6B7280]">{p.tax}%</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                        p.stock <= 3
                          ? "bg-red-100 text-red-700"
                          : p.stock > 100
                          ? "bg-blue-50 text-blue-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {p.stock > 100 ? "Unlimited" : p.stock}
                    </span>
                  </td>
                  <td className="py-3 px-4"><StatusPill status={p.status} /></td>
                  <td className="py-3 px-4 text-[#6B7280]">{p.createdDate}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setDetailProduct(p)}
                        className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#F26C4F] hover:bg-orange-50 transition"
                        title="View Details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => toggleProductStatus(p.id, p.status)}
                        className="p-1.5 rounded-lg text-[#6B7280] hover:text-amber-600 hover:bg-amber-50 transition"
                        title={p.status === "active" ? "Deactivate" : "Activate"}
                      >
                        {p.status === "active" ? <Ban size={15} /> : <CheckCircle2 size={15} />}
                      </button>
                      <button
                        onClick={() => setDeleteId(p.id)}
                        className="p-1.5 rounded-lg text-[#6B7280] hover:text-red-600 hover:bg-red-50 transition"
                        title="Delete SKU"
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

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E7EB] text-xs text-[#6B7280]">
          <span>Showing {rows.length} of {total} SKUs</span>
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

      {/* Add Product Modal */}
      {addOpen && (
        <Modal title="Add Product to Master Catalog" onClose={() => setAddOpen(false)}>
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#374151] mb-1">Product Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Enterprise Router R-50"
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#374151] mb-1">SKU Code *</label>
                <input
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                  placeholder="NET-ROUTER-50"
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F] font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-[#374151] mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                >
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-[#374151] mb-1">Base Price (₹) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#374151] mb-1">GST Tax %</label>
                <input
                  type="number"
                  value={form.tax}
                  onChange={(e) => setForm({ ...form, tax: Number(e.target.value) })}
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#374151] mb-1">Stock Qty</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#374151] mb-1">Unit Type</label>
                <input
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="unit / license / project"
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#374151] mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder="Key technical features & specifications"
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="subEligible"
                checked={form.isSubscriptionEligible}
                onChange={(e) => setForm({ ...form, isSubscriptionEligible: e.target.checked })}
                className="rounded text-[#F26C4F] focus:ring-[#F26C4F]"
              />
              <label htmlFor="subEligible" className="font-semibold text-[#374151]">
                Eligible for Subscription Recurring Billing
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAddOpen(false)}
                className="px-4 py-2 border border-[#E5E7EB] rounded-xl text-xs font-semibold hover:bg-[#F4F5F7]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProduct}
                className="px-4 py-2 bg-[#F26C4F] text-white rounded-xl text-xs font-bold hover:bg-[#e05535]"
              >
                Create Product SKU
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Product Detail Modal */}
      {detailProduct && (
        <Modal title={`Product Detail — ${detailProduct.name}`} onClose={() => setDetailProduct(null)}>
          <div className="space-y-3 text-xs">
            <div className="bg-[#FAFBFD] p-3 rounded-xl border border-[#E5E7EB] grid grid-cols-2 gap-3">
              <div><span className="text-[#6B7280]">SKU:</span> <strong className="font-mono text-[#1F2937]">{detailProduct.sku}</strong></div>
              <div><span className="text-[#6B7280]">Category:</span> <strong className="text-[#1F2937]">{detailProduct.category}</strong></div>
              <div><span className="text-[#6B7280]">Base Price:</span> <strong className="text-[#1F2937]">₹{detailProduct.price.toLocaleString("en-IN")}</strong></div>
              <div><span className="text-[#6B7280]">Tax Rate:</span> <strong className="text-[#1F2937]">{detailProduct.tax}% GST</strong></div>
              <div><span className="text-[#6B7280]">Available Stock:</span> <strong className="text-[#1F2937]">{detailProduct.stock} {detailProduct.unit}s</strong></div>
              <div><span className="text-[#6B7280]">Subscription:</span> <strong className="text-[#1F2937]">{detailProduct.isSubscriptionEligible ? "Eligible" : "One-time"}</strong></div>
            </div>
            <div>
              <p className="font-bold text-[#1F2937] mb-1">Description & Attributes</p>
              <p className="text-[#4B5563] bg-white p-2.5 rounded-xl border border-[#E5E7EB]">{detailProduct.description}</p>
            </div>
            <div>
              <p className="font-bold text-[#1F2937] mb-1">Variants & Configuration Options</p>
              <p className="text-[#4B5563] bg-white p-2 rounded-xl border border-[#E5E7EB] font-mono">{detailProduct.variants}</p>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setDetailProduct(null)} className="px-4 py-1.5 bg-[#1F2937] text-white text-xs font-bold rounded-xl">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete Product SKU"
          message="Are you sure you want to delete this product? Active quotations referencing this product will retain past pricing snapshots."
          onConfirm={handleDeleteProduct}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
