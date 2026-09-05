import { useState } from "react";
import { Search, Plus, Edit2, Eye, History, ChevronLeft, ChevronRight } from "lucide-react";
import StatusPill from "../ui/StatusPill";
import Modal from "../ui/Modal";

const initialPricing = [
  { id: 1, product: "Revalo Pro Server", basePrice: 1250000, currentPrice: 1187500, currency: "INR", effectiveFrom: "1 Apr 2026", effectiveUntil: "31 Mar 2027", status: "active", updated: "1 Apr 2026" },
  { id: 2, product: "Revalo Cloud Suite", basePrice: 48000, currentPrice: 45600, currency: "INR", effectiveFrom: "1 Jan 2026", effectiveUntil: "31 Dec 2026", status: "active", updated: "1 Jan 2026" },
  { id: 3, product: "SmartSwitch 48P", basePrice: 185000, currentPrice: 185000, currency: "INR", effectiveFrom: "1 Jun 2026", effectiveUntil: "—", status: "active", updated: "1 Jun 2026" },
  { id: 4, product: "Premium Support Pack", basePrice: 35000, currentPrice: 31500, currency: "INR", effectiveFrom: "1 Mar 2026", effectiveUntil: "28 Feb 2027", status: "active", updated: "1 Mar 2026" },
  { id: 5, product: "Revalo Backup Agent", basePrice: 12000, currentPrice: 10800, currency: "INR", effectiveFrom: "1 Jul 2026", effectiveUntil: "30 Jun 2027", status: "draft", updated: "1 Jul 2026" },
];

const inputCls = "w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-[13px] text-[#1F2937] outline-none focus:border-[#F26C4F] focus:ring-1 focus:ring-[#F26C4F]/20 placeholder-[#9CA3AF]";
function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-[#6B7280] mb-1">{label}{required && <span className="text-[#EF4444] ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}

export default function Pricing() {
  const [pricing] = useState(initialPricing);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);

  const perPage = 5;
  const filtered = pricing.filter((p) => p.product.toLowerCase().includes(search.toLowerCase()));
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-[#1F2937]">Pricing</h2>
          <p className="text-[#6B7280] text-sm">Manage product pricing and effective date ranges.</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 bg-[#F26C4F] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#E05A3E] flex-shrink-0">
          <Plus size={16} /> Add Price
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2 bg-[#F4F5F7] rounded-lg px-3 py-2 flex-1 min-w-[180px]">
            <Search size={15} className="text-[#9CA3AF]" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search products..." className="bg-transparent outline-none text-[13px] text-[#1F2937] w-full placeholder-[#9CA3AF]" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[#E5E7EB]">
              <tr>
                {["Product", "Base Price", "Current Price", "Currency", "Effective From", "Effective Until", "Status", "Last Updated", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-[#6B7280] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const disc = Math.round((1 - p.currentPrice / p.basePrice) * 100);
                return (
                  <tr key={p.id} className="border-b border-[#F4F5F7] last:border-0 hover:bg-[#FAFAFA]">
                    <td className="px-4 py-3 text-[13px] font-medium text-[#1F2937] whitespace-nowrap">{p.product}</td>
                    <td className="px-4 py-3 text-[13px] text-[#6B7280]">₹{p.basePrice.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-[13px] font-medium text-[#1F2937]">₹{p.currentPrice.toLocaleString("en-IN")}</span>
                        {disc > 0 && <span className="ml-2 text-[11px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">-{disc}%</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#6B7280]">{p.currency}</td>
                    <td className="px-4 py-3 text-[12px] text-[#6B7280] whitespace-nowrap">{p.effectiveFrom}</td>
                    <td className="px-4 py-3 text-[12px] text-[#6B7280] whitespace-nowrap">{p.effectiveUntil}</td>
                    <td className="px-4 py-3"><StatusPill status={p.status} /></td>
                    <td className="px-4 py-3 text-[12px] text-[#6B7280] whitespace-nowrap">{p.updated}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F4F5F7] text-[#6B7280]"><Eye size={14} /></button>
                        <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F4F5F7] text-[#6B7280]"><Edit2 size={14} /></button>
                        <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F4F5F7] text-[#6B7280]"><History size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E7EB]">
          <p className="text-[12px] text-[#6B7280]">Showing {Math.min((page-1)*perPage+1,total)}–{Math.min(page*perPage,total)} of {total}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(Math.max(1,page-1))} disabled={page===1} className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280] disabled:opacity-40"><ChevronLeft size={14} /></button>
            {Array.from({length:pages},(_,i)=>i+1).map((p)=>(
              <button key={p} onClick={()=>setPage(p)} className={`w-7 h-7 flex items-center justify-center rounded-lg text-[12px] font-medium ${page===p?"bg-[#F26C4F] text-white":"border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F4F5F7]"}`}>{p}</button>
            ))}
            <button onClick={() => setPage(Math.min(pages,page+1))} disabled={page===pages} className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280] disabled:opacity-40"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Price" description="Set pricing for a product with effective date range." onSave={() => setAddOpen(false)} saveLabel="Save Price">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <FormField label="Product" required>
              <select className={inputCls}>
                <option>Revalo Pro Server</option>
                <option>Revalo Cloud Suite</option>
                <option>SmartSwitch 48P</option>
                <option>Premium Support Pack</option>
              </select>
            </FormField>
          </div>
          <FormField label="Price (₹)" required>
            <input type="number" className={inputCls} placeholder="0" />
          </FormField>
          <FormField label="Currency">
            <select className={inputCls}><option>INR</option><option>USD</option><option>EUR</option></select>
          </FormField>
          <FormField label="Effective From" required>
            <input type="date" className={inputCls} />
          </FormField>
          <FormField label="Expiry Date">
            <input type="date" className={inputCls} />
          </FormField>
          <FormField label="Status">
            <select className={inputCls}><option>Active</option><option>Draft</option></select>
          </FormField>
        </div>
      </Modal>
    </div>
  );
}
