import { useState } from "react";
import { Edit2, Check } from "lucide-react";
import Modal from "../ui/Modal";

type Tier = {
  id: number;
  name: "Bronze" | "Silver" | "Gold";
  maxDiscount: number;
  benefits: string[];
  eligibility: string;
  supportLevel: string;
  subscriptionEligibility: string[];
  status: boolean;
  customers: number;
  color: string;
  bg: string;
  border: string;
};

const initialTiers: Tier[] = [
  {
    id: 1, name: "Bronze", maxDiscount: 5, customers: 617,
    benefits: ["Up to 5% discount on orders", "Email support (48h SLA)", "Access to Basic plan", "Quarterly product updates"],
    eligibility: "New customers or annual spend < ₹5L",
    supportLevel: "Standard",
    subscriptionEligibility: ["Basic"],
    status: true,
    color: "#CD7F32", bg: "bg-orange-50", border: "border-orange-200",
  },
  {
    id: 2, name: "Silver", maxDiscount: 10, customers: 398,
    benefits: ["Up to 10% discount on orders", "Priority email + chat (24h SLA)", "Access to Pro plan", "Monthly product updates", "Dedicated account manager"],
    eligibility: "Annual spend ₹5L – ₹20L",
    supportLevel: "Priority",
    subscriptionEligibility: ["Basic", "Pro"],
    status: true,
    color: "#9CA3AF", bg: "bg-gray-50", border: "border-gray-200",
  },
  {
    id: 3, name: "Gold", maxDiscount: 15, customers: 269,
    benefits: ["Up to 15% discount on orders", "24/7 dedicated support (4h SLA)", "Access to all plans", "Real-time product updates", "Dedicated success manager", "Custom integrations"],
    eligibility: "Annual spend > ₹20L",
    supportLevel: "Dedicated 24/7",
    subscriptionEligibility: ["Basic", "Pro", "Enterprise"],
    status: true,
    color: "#F59E0B", bg: "bg-amber-50", border: "border-amber-200",
  },
];

const inputCls = "w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-[13px] text-[#1F2937] outline-none focus:border-[#F26C4F] focus:ring-1 focus:ring-[#F26C4F]/20 placeholder-[#9CA3AF]";
function FL({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-[12px] font-medium text-[#6B7280] mb-1">{label}</label>{children}</div>;
}

export default function CustomerTiers() {
  const [tiers, setTiers] = useState(initialTiers);
  const [editTier, setEditTier] = useState<Tier | null>(null);
  const [toast, setToast] = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 2500); }
  function toggle(id: number) {
    setTiers(tiers.map((t) => t.id === id ? { ...t, status: !t.status } : t));
    showToast("Tier status updated");
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1F2937] text-white text-sm px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />{toast}
        </div>
      )}
      <div>
        <h2 className="text-[18px] font-bold text-[#1F2937]">Customer Tiers & Benefits</h2>
        <p className="text-[#6B7280] text-sm">Configure tier eligibility, discounts, and benefits for each customer segment.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {tiers.map((tier) => (
          <div key={tier.id} className={`bg-white rounded-2xl border-2 ${tier.border} p-6 flex flex-col`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${tier.color}20` }}>
                  <span className="text-lg font-bold" style={{ color: tier.color }}>
                    {tier.name === "Bronze" ? "🥉" : tier.name === "Silver" ? "🥈" : "🥇"}
                  </span>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#1F2937]">{tier.name}</h3>
                  <p className="text-[12px] text-[#6B7280]">{tier.customers.toLocaleString()} customers</p>
                </div>
              </div>
              <button
                onClick={() => toggle(tier.id)}
                className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${tier.status ? "bg-[#F26C4F]" : "bg-[#E5E7EB]"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${tier.status ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>

            <div className={`${tier.bg} rounded-xl p-3 mb-4`}>
              <p className="text-[11px] text-[#6B7280] mb-0.5">Maximum Discount</p>
              <p className="text-[28px] font-bold" style={{ color: tier.color }}>{tier.maxDiscount}%</p>
            </div>

            <div className="space-y-1.5 flex-1 mb-4">
              {tier.benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Check size={13} className="flex-shrink-0 mt-0.5" style={{ color: tier.color }} />
                  <span className="text-[13px] text-[#6B7280]">{b}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-[#E5E7EB] pt-4 mb-4">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[#6B7280]">Support Level</span>
                <span className="text-[#1F2937] font-medium">{tier.supportLevel}</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[#6B7280]">Eligibility</span>
                <span className="text-[#1F2937] font-medium text-right max-w-[150px]">{tier.eligibility}</span>
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Plans Available</p>
                <div className="flex flex-wrap gap-1">
                  {tier.subscriptionEligibility.map((p) => (
                    <span key={p} className="text-[11px] bg-[#F4F5F7] text-[#1F2937] px-2 py-0.5 rounded-full">{p}</span>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={() => setEditTier(tier)} className="w-full py-2 border border-[#E5E7EB] rounded-lg text-[13px] font-medium text-[#1F2937] hover:bg-[#F4F5F7] flex items-center justify-center gap-2">
              <Edit2 size={13} /> Edit Tier
            </button>
          </div>
        ))}
      </div>

      <Modal open={editTier !== null} onClose={() => setEditTier(null)} title={`Edit ${editTier?.name} Tier`} onSave={() => { setEditTier(null); showToast("Tier updated"); }} saveLabel="Save Changes">
        <div className="space-y-4">
          <FL label="Maximum Discount (%)">
            <input type="number" className={inputCls} defaultValue={editTier?.maxDiscount} min={0} max={100} />
          </FL>
          <FL label="Benefits (one per line)">
            <textarea className={`${inputCls} resize-none`} rows={4} defaultValue={editTier?.benefits.join("\n")} />
          </FL>
          <FL label="Eligibility Criteria">
            <input className={inputCls} defaultValue={editTier?.eligibility} />
          </FL>
          <FL label="Support Level">
            <select className={inputCls} defaultValue={editTier?.supportLevel}>
              <option>Standard</option>
              <option>Priority</option>
              <option>Dedicated 24/7</option>
            </select>
          </FL>
          <div>
            <label className="block text-[12px] font-medium text-[#6B7280] mb-2">Subscription Plans Eligible</label>
            <div className="flex gap-3">
              {["Basic", "Pro", "Enterprise"].map((p) => (
                <label key={p} className="flex items-center gap-2 text-[13px] text-[#1F2937] cursor-pointer">
                  <input type="checkbox" className="accent-[#F26C4F] w-4 h-4" defaultChecked={editTier?.subscriptionEligibility.includes(p)} />
                  {p}
                </label>
              ))}
            </div>
          </div>
          <FL label="Status">
            <select className={inputCls}><option>Active</option><option>Inactive</option></select>
          </FL>
        </div>
      </Modal>
    </div>
  );
}
