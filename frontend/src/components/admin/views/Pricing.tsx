import React, { useState, useEffect } from "react";
import { Tag, Plus, CheckCircle2, DollarSign, Calendar, Layers, ShieldCheck, ChevronLeft, ChevronRight, Search } from "lucide-react";
import Modal from "../ui/Modal";
import { fetchPriceListsList, createPriceListApi, fetchProductsList } from "../../../api/adminApi";

export default function Pricing() {
  const [priceLists, setPriceLists] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [newRule, setNewRule] = useState({
    name: "",
    tier: "GOLD",
    currency: "INR",
    basePrice: 50000,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [pls, prods] = await Promise.all([
        fetchPriceListsList(),
        fetchProductsList().catch(() => []),
      ]);
      setPriceLists(Array.isArray(pls) ? pls : []);
      setProducts(Array.isArray(prods) ? prods : []);
    } catch (err) {
      console.error("Failed to load price lists:", err);
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  async function handleCreateRule() {
    if (!newRule.name) {
      showToast("Please enter a price list / rule name");
      return;
    }
    setSubmitting(true);
    try {
      await createPriceListApi({
        name: newRule.name,
        tier: newRule.tier,
        currency: newRule.currency,
        effective_from: new Date().toISOString().split("T")[0],
      });
      await loadData();
      setAddOpen(false);
      setNewRule({ name: "", tier: "GOLD", currency: "INR", basePrice: 50000 });
      showToast("New price list saved successfully in database");
    } catch (e) {
      showToast("Error saving price list to database");
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = priceLists.filter((pl) => {
    const name = pl.name || "";
    const tier = pl.tier || "General";
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === "all" || tier.toLowerCase() === tierFilter.toLowerCase();
    return matchesSearch && matchesTier;
  });

  const total = filtered.length;
  const pages = Math.ceil(total / perPage) || 1;
  const rows = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-5 font-sans">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1F2937] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2 animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-[#1F2937] tracking-tight">Centralized Pricing Engine</h2>
          <p className="text-[#6B7280] text-xs mt-0.5">
            Define base, customer-tier, and category pricing rules connected directly to the database.
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 bg-[#F26C4F] text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-[#e05535] transition shadow-xs"
        >
          <Plus size={16} /> Define Pricing Rule
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280] text-xs font-semibold">Active Price Lists</span>
            <div className="p-2 rounded-xl bg-orange-50 text-[#F26C4F]"><Tag size={16} /></div>
          </div>
          <p className="text-2xl font-extrabold text-[#1F2937] mt-2">{priceLists.length} in Database</p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Tier-specific tariff cards</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280] text-xs font-semibold">Catalog Products</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><Layers size={16} /></div>
          </div>
          <p className="text-2xl font-extrabold text-[#1F2937] mt-2">{products.length} Products</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Priced across tiers</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280] text-xs font-semibold">Effective Tax Rate</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><ShieldCheck size={16} /></div>
          </div>
          <p className="text-2xl font-extrabold text-[#1F2937] mt-2">18% GST</p>
          <p className="text-[10px] text-blue-600 font-bold mt-0.5">India Commercial Standard</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-2.5 text-[#6B7280]" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search price list name..."
            className="w-full pl-9 pr-3 py-1.5 border border-[#E5E7EB] rounded-xl text-xs outline-none focus:border-[#F26C4F]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#6B7280]">Tier:</span>
          <select
            value={tierFilter}
            onChange={(e) => { setTierFilter(e.target.value); setPage(1); }}
            className="border border-[#E5E7EB] rounded-xl px-2.5 py-1.5 text-xs text-[#374151] outline-none"
          >
            <option value="all">All Tiers</option>
            <option value="GOLD">Gold Tier</option>
            <option value="SILVER">Silver Tier</option>
            <option value="BRONZE">Bronze Tier</option>
          </select>
        </div>
      </div>

      {/* Pricing Rules Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <h3 className="text-[#1F2937] font-bold text-sm">Database Price Lists & Tariff Cards</h3>
          <span className="text-xs text-[#6B7280]">Synced directly with dealflow360.db</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#FAFBFD] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                <th className="py-3 px-4">Price List Name</th>
                <th className="py-3 px-4">Target Tier</th>
                <th className="py-3 px-4">Currency</th>
                <th className="py-3 px-4">Effective Date</th>
                <th className="py-3 px-4">Expiration Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F5F7] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#6B7280]">Loading price lists from database...</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#6B7280]">No price lists found in database.</td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-[#FFF8F6]/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#1F2937]">{r.name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        r.tier === 'GOLD' ? 'bg-amber-100 text-amber-800' :
                        r.tier === 'SILVER' ? 'bg-slate-200 text-slate-800' :
                        r.tier === 'BRONZE' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {r.tier || "Standard"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#374151]">{r.currency || "INR"}</td>
                    <td className="py-3 px-4 text-[#6B7280]">{r.effective_from || "2026-01-01"}</td>
                    <td className="py-3 px-4 text-[#6B7280]">{r.expires_at || "Open / Unlimited"}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                        {r.is_active ? "Active" : "Active"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-[#E5E7EB] text-xs text-[#6B7280] gap-2">
          <span>Showing {total === 0 ? 0 : (page - 1) * perPage + 1}-{Math.min(page * perPage, total)} of <strong>{total}</strong> records</span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-1.5 rounded-lg border border-[#E5E7EB] disabled:opacity-40 hover:bg-[#F4F5F7]"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2 font-bold text-[#1F2937]">{page} / {pages}</span>
            <button
              disabled={page >= pages}
              onClick={() => setPage(p => p + 1)}
              className="p-1.5 rounded-lg border border-[#E5E7EB] disabled:opacity-40 hover:bg-[#F4F5F7]"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Define Rule Modal */}
      {addOpen && (
        <Modal title="Define New Price List Rule" onClose={() => setAddOpen(false)}>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-[#374151] mb-1">Price List / Rule Name *</label>
              <input
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                placeholder="e.g. Enterprise Special Tariff Q4"
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#374151] mb-1">Target Customer Tier</label>
                <select
                  value={newRule.tier}
                  onChange={(e) => setNewRule({ ...newRule, tier: e.target.value })}
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                >
                  <option value="GOLD">Gold Tier</option>
                  <option value="SILVER">Silver Tier</option>
                  <option value="BRONZE">Bronze Tier</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-[#374151] mb-1">Currency</label>
                <select
                  value={newRule.currency}
                  onChange={(e) => setNewRule({ ...newRule, currency: e.target.value })}
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="px-4 py-2 border border-[#E5E7EB] text-[#6B7280] font-bold rounded-xl hover:bg-[#F4F5F7]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleCreateRule}
                className="px-4 py-2 bg-[#F26C4F] text-white font-bold rounded-xl hover:bg-[#e05535] disabled:opacity-50"
              >
                {submitting ? "Saving to DB..." : "Save Rule to Database"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
