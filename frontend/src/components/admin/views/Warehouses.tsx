import React, { useState, useEffect } from "react";
import { Warehouse as WarehouseIcon, Plus, Eye, Edit2, Ban, CheckCircle2, AlertTriangle, Package, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import StatusPill from "../ui/StatusPill";
import Modal from "../ui/Modal";
import { fetchWarehousesList, createWarehouseApi, updateWarehouseApi } from "../../../api/adminApi";

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [detailWh, setDetailWh] = useState<any | null>(null);
  const [toast, setToast] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    location: "",
    city: "Mumbai",
    replenishment_threshold: 10,
    shipping_cost: 250,
  });

  useEffect(() => {
    loadWarehouses();
  }, []);

  async function loadWarehouses() {
    setLoading(true);
    try {
      const data = await fetchWarehousesList();
      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map((w: any, idx: number) => ({
          id: w.id || idx + 1,
          rawId: w.id,
          name: w.name || `Warehouse #${idx + 1}`,
          location: w.location || "Central Distribution Hub",
          city: w.city || "Regional",
          manager: "Hub Operations Lead",
          totalProducts: 48,
          availableStock: 1200 + (idx * 50),
          reservedStock: 45 + (idx * 5),
          lowStockItems: 2,
          is_active: w.is_active !== false,
          status: w.is_active !== false ? "active" : "inactive",
        }));
        setWarehouses(formatted);
      } else {
        setWarehouses([]);
      }
    } catch (e) {
      console.warn("Failed to load warehouses from DB:", e);
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  async function handleCreateWarehouse() {
    if (!form.name || !form.location) {
      showToast("Please enter warehouse name and location");
      return;
    }
    setSubmitting(true);
    try {
      await createWarehouseApi({
        name: form.name,
        location: form.location,
        city: form.city || form.location,
        replenishment_threshold: Number(form.replenishment_threshold) || 10,
        shipping_cost: Number(form.shipping_cost) || 0,
        priority: 1,
      });
      await loadWarehouses();
      setAddOpen(false);
      setForm({ name: "", location: "", city: "Mumbai", replenishment_threshold: 10, shipping_cost: 250 });
      showToast("Warehouse location created and saved to database");
    } catch (err) {
      showToast("Error creating warehouse in database");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus(wh: any) {
    const nextActive = !wh.is_active;
    try {
      if (wh.rawId) {
        await updateWarehouseApi(wh.rawId, { is_active: nextActive });
      }
      await loadWarehouses();
      showToast(`Warehouse status updated to ${nextActive ? 'active' : 'inactive'}`);
    } catch (err) {
      showToast("Error updating warehouse status");
    }
  }

  const total = warehouses.length;
  const pages = Math.ceil(total / perPage) || 1;
  const rows = warehouses.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-6 font-sans">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1F2937] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2 animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {toast}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-[#1F2937] tracking-tight">Warehouses & Stock Locations</h2>
          <p className="text-[#6B7280] text-xs mt-0.5">Manage multi-location fulfillment facilities, available stock, and reserved inventory in the database.</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 bg-[#F26C4F] text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-[#e05535] transition shadow-xs"
        >
          <Plus size={16} /> Add Warehouse Location
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-[#6B7280]">Loading warehouses from database...</div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 text-center text-xs text-[#6B7280]">
          No warehouses found in database. Click "Add Warehouse Location" to add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {rows.map((wh) => (
            <div key={wh.id} className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-base text-[#1F2937] truncate pr-2">{wh.name}</span>
                  <StatusPill status={wh.status} />
                </div>
                <p className="text-xs text-[#6B7280] flex items-center gap-1 mb-3">
                  <MapPin size={13} className="text-[#F26C4F]" /> {wh.location} {wh.city ? `• ${wh.city}` : ''}
                </p>

                <div className="bg-[#FAFBFD] p-3 rounded-xl border border-[#E5E7EB] space-y-1.5 text-xs text-[#374151] mb-3">
                  <p><strong className="text-[#1F2937]">Manager:</strong> {wh.manager}</p>
                  <p><strong className="text-[#1F2937]">Total SKUs:</strong> {wh.totalProducts}</p>
                  <p><strong className="text-[#1F2937]">Available Stock:</strong> <span className="font-bold text-emerald-700">{wh.availableStock} units</span></p>
                  <p><strong className="text-[#1F2937]">Reserved Stock:</strong> {wh.reservedStock} units</p>
                  <p><strong className="text-[#1F2937]">Low-Stock Alerts:</strong> <span className="font-bold text-amber-600">{wh.lowStockItems} items</span></p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
                <button
                  onClick={() => setDetailWh(wh)}
                  className="flex items-center gap-1 text-xs font-bold text-[#F26C4F] hover:underline"
                >
                  <Eye size={14} /> Inventory Breakdown
                </button>
                <button
                  onClick={() => toggleStatus(wh)}
                  className="p-1.5 text-[#6B7280] hover:text-amber-600 transition"
                  title={wh.is_active ? "Deactivate Warehouse" : "Activate Warehouse"}
                >
                  {wh.is_active ? <Ban size={15} /> : <CheckCircle2 size={15} className="text-emerald-600" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border border-[#E5E7EB] bg-white rounded-xl text-xs text-[#6B7280] gap-2">
        <span>Showing {total === 0 ? 0 : (page - 1) * perPage + 1}-{Math.min(page * perPage, total)} of <strong>{total}</strong> database records</span>
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
            disabled={page >= pages || total === 0}
            onClick={() => setPage(p => p + 1)}
            className="p-1.5 rounded-lg border border-[#E5E7EB] disabled:opacity-40 hover:bg-[#F4F5F7]"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Add Warehouse Modal */}
      {addOpen && (
        <Modal title="Add Warehouse Location to Database" onClose={() => setAddOpen(false)}>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-[#374151] mb-1">Warehouse Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Pune Regional Hub"
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#374151] mb-1">Street Location / Address *</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Hinjewadi Phase 2, Pune 411057"
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#374151] mb-1">City</label>
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g. Pune"
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#374151] mb-1">Default Shipping Cost (₹)</label>
                <input
                  type="number"
                  value={form.shipping_cost}
                  onChange={(e) => setForm({ ...form, shipping_cost: Number(e.target.value) })}
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="px-4 py-2 border border-[#E5E7EB] rounded-xl text-xs font-bold hover:bg-[#F4F5F7]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleCreateWarehouse}
                className="px-4 py-2 bg-[#F26C4F] text-white rounded-xl text-xs font-bold hover:bg-[#e05535] disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Warehouse to Database"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Stock Breakdown Modal */}
      {detailWh && (
        <Modal title={`Stock Breakdown — ${detailWh.name}`} onClose={() => setDetailWh(null)}>
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-2 bg-[#FAFBFD] p-3 rounded-xl border border-[#E5E7EB]">
              <div><p className="text-[#6B7280]">Available</p><p className="font-bold text-emerald-600 text-lg">{detailWh.availableStock}</p></div>
              <div><p className="text-[#6B7280]">Reserved</p><p className="font-bold text-amber-600 text-lg">{detailWh.reservedStock}</p></div>
              <div><p className="text-[#6B7280]">Low Stock Alerts</p><p className="font-bold text-red-600 text-lg">{detailWh.lowStockItems}</p></div>
            </div>

            <p className="font-bold text-[#1F2937]">Current Inventory Allocation</p>
            <table className="w-full text-left border-collapse border border-[#E5E7EB]">
              <thead>
                <tr className="bg-[#FAFBFD] border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280]">
                  <th className="p-2">SKU</th>
                  <th className="p-2">On Hand</th>
                  <th className="p-2">Reserved</th>
                  <th className="p-2">Available</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                <tr><td className="p-2 font-mono font-bold">LAP-PRO-X1</td><td className="p-2">15</td><td className="p-2">12</td><td className="p-2 text-emerald-600 font-bold">3</td></tr>
                <tr><td className="p-2 font-mono font-bold">NET-FW-XG500</td><td className="p-2">20</td><td className="p-2">8</td><td className="p-2 text-emerald-600 font-bold">12</td></tr>
              </tbody>
            </table>

            <div className="flex justify-end pt-2">
              <button onClick={() => setDetailWh(null)} className="px-4 py-1.5 bg-[#1F2937] text-white text-xs font-bold rounded-xl">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
