import { useState } from "react";
import { Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import StatusPill from "../ui/StatusPill";
import Modal from "../ui/Modal";
import ConfirmDialog from "../ui/ConfirmDialog";

const initialWarehouses = [
  { id: 1, name: "Mumbai Central Hub", location: "Mumbai, MH", manager: "Ramesh Gupta", capacity: 5000, zone: "West India", shippingCost: 1200, status: "active" },
  { id: 2, name: "Delhi North Depot", location: "Delhi, DL", manager: "Sanjay Verma", capacity: 3500, zone: "North India", shippingCost: 950, status: "active" },
  { id: 3, name: "Bangalore Tech Park", location: "Bengaluru, KA", manager: "Kavitha Rao", capacity: 4200, zone: "South India", shippingCost: 1100, status: "active" },
  { id: 4, name: "Hyderabad Logistics", location: "Hyderabad, TS", manager: "Suresh Naidu", capacity: 2800, zone: "South India", shippingCost: 1050, status: "inactive" },
  { id: 5, name: "Chennai Port Zone", location: "Chennai, TN", manager: "Meena Krishnan", capacity: 3200, zone: "South India", shippingCost: 1300, status: "active" },
];

const shippingZones = [
  { zone: "North India", base: 950, express: 1400 },
  { zone: "South India", base: 1100, express: 1600 },
  { zone: "West India", base: 1200, express: 1750 },
  { zone: "East India", base: 1350, express: 1900 },
  { zone: "Pan India", base: 1500, express: 2200 },
];

const inputCls = "w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-[13px] text-[#1F2937] outline-none focus:border-[#F26C4F] focus:ring-1 focus:ring-[#F26C4F]/20 placeholder-[#9CA3AF]";
function FL({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-[12px] font-medium text-[#6B7280] mb-1">{label}</label>{children}</div>;
}

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState(initialWarehouses);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const perPage = 4;
  const filtered = warehouses.filter((w) => w.name.toLowerCase().includes(search.toLowerCase()) || w.location.toLowerCase().includes(search.toLowerCase()));
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 2500); }

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1F2937] text-white text-sm px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />{toast}
        </div>
      )}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-[#1F2937]">Warehouses</h2>
          <p className="text-[#6B7280] text-sm">Manage warehouse locations, managers, and shipping zones.</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 bg-[#F26C4F] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#E05A3E] flex-shrink-0">
          <Plus size={16} /> Add Warehouse
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2 bg-[#F4F5F7] rounded-lg px-3 py-2 flex-1 min-w-[180px]">
            <Search size={15} className="text-[#9CA3AF]" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search warehouses..." className="bg-transparent outline-none text-[13px] text-[#1F2937] w-full placeholder-[#9CA3AF]" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[#E5E7EB]">
              <tr>
                {["Warehouse Name", "Location", "Manager", "Capacity", "Shipping Zone", "Shipping Cost", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-[#6B7280] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((w) => (
                <tr key={w.id} className="border-b border-[#F4F5F7] last:border-0 hover:bg-[#FAFAFA]">
                  <td className="px-4 py-3 text-[13px] font-medium text-[#1F2937]">{w.name}</td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">{w.location}</td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">{w.manager}</td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">{w.capacity.toLocaleString()} units</td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">{w.zone}</td>
                  <td className="px-4 py-3 text-[13px] font-medium text-[#1F2937]">₹{w.shippingCost.toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusPill status={w.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F4F5F7] text-[#6B7280]"><Edit2 size={14} /></button>
                      <button onClick={() => setDeleteId(w.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#6B7280] hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E7EB]">
          <p className="text-[12px] text-[#6B7280]">Showing {Math.min((page-1)*perPage+1,total)}–{Math.min(page*perPage,total)} of {total}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(Math.max(1,page-1))} disabled={page===1} className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280] disabled:opacity-40"><ChevronLeft size={14} /></button>
            {Array.from({length:pages},(_,i)=>i+1).map((p)=>(<button key={p} onClick={()=>setPage(p)} className={`w-7 h-7 flex items-center justify-center rounded-lg text-[12px] font-medium ${page===p?"bg-[#F26C4F] text-white":"border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F4F5F7]"}`}>{p}</button>))}
            <button onClick={() => setPage(Math.min(pages,page+1))} disabled={page===pages} className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280] disabled:opacity-40"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* Shipping Costs */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
        <h3 className="text-[15px] font-semibold text-[#1F2937] mb-4">Shipping Cost Configuration</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                {["Shipping Zone", "Base Rate (₹)", "Express Rate (₹)", "Actions"].map((h) => (
                  <th key={h} className="pb-3 text-left text-[11px] font-medium text-[#6B7280]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shippingZones.map((z) => (
                <tr key={z.zone} className="border-b border-[#F4F5F7] last:border-0">
                  <td className="py-3 text-[13px] font-medium text-[#1F2937]">{z.zone}</td>
                  <td className="py-3 text-[13px] text-[#6B7280]">₹{z.base}</td>
                  <td className="py-3 text-[13px] text-[#6B7280]">₹{z.express}</td>
                  <td className="py-3"><button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F4F5F7] text-[#6B7280]"><Edit2 size={13} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Warehouse" onSave={() => { setAddOpen(false); showToast("Warehouse added"); }} saveLabel="Save Warehouse" size="md">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><FL label="Warehouse Name"><input className={inputCls} placeholder="e.g. Pune East Depot" /></FL></div>
          <div className="col-span-2"><FL label="Address"><input className={inputCls} placeholder="Street address" /></FL></div>
          <FL label="City"><input className={inputCls} placeholder="City" /></FL>
          <FL label="State"><input className={inputCls} placeholder="State" /></FL>
          <FL label="Manager"><input className={inputCls} placeholder="Manager name" /></FL>
          <FL label="Capacity (units)"><input type="number" className={inputCls} placeholder="0" /></FL>
          <FL label="Shipping Zone">
            <select className={inputCls}>{shippingZones.map((z) => <option key={z.zone}>{z.zone}</option>)}</select>
          </FL>
          <FL label="Shipping Cost (₹)"><input type="number" className={inputCls} placeholder="0" /></FL>
          <FL label="Status"><select className={inputCls}><option>Active</option><option>Inactive</option></select></FL>
        </div>
      </Modal>

      <ConfirmDialog open={deleteId !== null} title="Delete Warehouse" message="This warehouse will be permanently removed. All associated inventory records will be affected." confirmLabel="Delete" onConfirm={() => { setWarehouses(warehouses.filter((w) => w.id !== deleteId)); setDeleteId(null); showToast("Warehouse deleted"); }} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
