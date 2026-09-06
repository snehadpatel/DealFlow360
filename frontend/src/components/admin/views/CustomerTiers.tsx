import React, { useState, useEffect } from "react";
import { Award, Edit2, ShieldCheck, Check } from "lucide-react";
import Modal from "../ui/Modal";
import { fetchCustomersList, fetchDiscountRulesList, updateDiscountRuleApi, createDiscountRuleApi } from "../../../api/adminApi";

type Tier = {
  id: number;
  tierKey: "BRONZE" | "SILVER" | "GOLD";
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

const defaultTiers: Tier[] = [
  {
    id: 1, tierKey: "BRONZE", name: "Bronze", maxDiscount: 8, customers: 48,
    benefits: ["Up to 8% discount on orders", "Email support (48h SLA)", "Access to Basic plan", "Quarterly product updates"],
    eligibility: "New customers or annual spend < ₹5L",
    supportLevel: "Standard",
    subscriptionEligibility: ["Basic"],
    status: true,
    color: "#CD7F32", bg: "bg-orange-50", border: "border-orange-200",
  },
  {
    id: 2, tierKey: "SILVER", name: "Silver", maxDiscount: 12, customers: 87,
    benefits: ["Up to 12% discount on orders", "Priority email + chat (24h SLA)", "Access to Pro plan", "Monthly product updates", "Dedicated account manager"],
    eligibility: "Annual spend ₹5L – ₹20L",
    supportLevel: "Priority",
    subscriptionEligibility: ["Basic", "Pro"],
    status: true,
    color: "#9CA3AF", bg: "bg-gray-50", border: "border-gray-200",
  },
  {
    id: 3, tierKey: "GOLD", name: "Gold", maxDiscount: 15, customers: 65,
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
  const [tiers, setTiers] = useState<Tier[]>(defaultTiers);
  const [editTier, setEditTier] = useState<Tier | null>(null);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [dbRules, setDbRules] = useState<any[]>([]);

  useEffect(() => {
    loadTierData();
  }, []);

  async function loadTierData() {
    setLoading(true);
    try {
      const [custs, rules] = await Promise.all([
        fetchCustomersList(),
        fetchDiscountRulesList().catch(() => []),
      ]);

      setDbRules(rules);

      const custList = Array.isArray(custs) ? custs : [];
      const bronzeCount = custList.filter((c: any) => (c.tier || '').toUpperCase() === 'BRONZE').length;
      const silverCount = custList.filter((c: any) => (c.tier || '').toUpperCase() === 'SILVER').length;
      const goldCount = custList.filter((c: any) => (c.tier || '').toUpperCase() === 'GOLD').length;

      const bronzeRule = rules.find((r: any) => r.tier === 'BRONZE');
      const silverRule = rules.find((r: any) => r.tier === 'SILVER');
      const goldRule = rules.find((r: any) => r.tier === 'GOLD');

      setTiers([
        {
          ...defaultTiers[0],
          customers: bronzeCount || defaultTiers[0].customers,
          maxDiscount: bronzeRule?.max_discount ?? defaultTiers[0].maxDiscount,
        },
        {
          ...defaultTiers[1],
          customers: silverCount || defaultTiers[1].customers,
          maxDiscount: silverRule?.max_discount ?? defaultTiers[1].maxDiscount,
        },
        {
          ...defaultTiers[2],
          customers: goldCount || defaultTiers[2].customers,
          maxDiscount: goldRule?.max_discount ?? defaultTiers[2].maxDiscount,
        },
      ]);
    } catch (e) {
      console.warn("Could not load real tier stats:", e);
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 2500); }

  function toggle(id: number) {
    setTiers(tiers.map((t) => t.id === id ? { ...t, status: !t.status } : t));
    showToast("Tier status updated");
  }

  async function handleSaveTier() {
    if (!editTier) return;
    try {
      const existing = dbRules.find((r) => r.tier === editTier.tierKey);
      if (existing && existing.id) {
        await updateDiscountRuleApi(existing.id, {
          tier: editTier.tierKey,
          max_discount: Number(editTier.maxDiscount),
        });
      } else {
        await createDiscountRuleApi({
          tier: editTier.tierKey,
          max_discount: Number(editTier.maxDiscount),
          min_margin: 12.0,
          manager_approval_threshold: 10.0,
          finance_approval_threshold: 15.0,
        });
      }
      await loadTierData();
      setEditTier(null);
      showToast(`${editTier.name} tier updated and saved to database`);
    } catch (e) {
      showToast("Error updating tier rule");
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1F2937] text-white text-sm px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />{toast}
        </div>
      )}
      <div>
        <h2 className="text-[18px] font-bold text-[#1F2937]">Customer Tiers & Benefits</h2>
        <p className="text-[#6B7280] text-sm">Configure tier eligibility, discounts, and benefits linked directly to database accounts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {tiers.map((tier) => (
          <div key={tier.id} className={`bg-white rounded-2xl border-2 ${tier.border} p-6 flex flex-col justify-between shadow-xs`}>
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${tier.color}20` }}>
                    <span className="text-lg font-bold" style={{ color: tier.color }}>
                      {tier.name === "Bronze" ? "🥉" : tier.name === "Silver" ? "🥈" : "🥇"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#1F2937]">{tier.name}</h3>
                    <p className="text-[12px] text-[#6B7280] font-bold">{tier.customers} database customers</p>
                  </div>
                </div>
                <button
                  onClick={() => toggle(tier.id)}
                  className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${tier.status ? "bg-[#F26C4F]" : "bg-[#E5E7EB]"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${tier.status ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>

              <div className="p-3 bg-[#FAFBFD] rounded-xl border border-[#E5E7EB] mb-4">
                <p className="text-xs text-[#6B7280]">Configured Maximum Discount:</p>
                <p className="text-2xl font-extrabold text-[#F26C4F]">{tier.maxDiscount}%</p>
              </div>

              <div className="space-y-2 text-xs text-[#374151]">
                <p className="font-bold text-[#1F2937]">Tier Benefits:</p>
                {tier.benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check size={14} className="text-[#F26C4F] flex-shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setEditTier(tier)}
              className="mt-6 w-full py-2 border border-[#E5E7EB] hover:bg-[#F4F5F7] text-xs font-bold text-[#374151] rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Edit2 size={13} /> Edit Tier Discount Limits
            </button>
          </div>
        ))}
      </div>

      {editTier && (
        <Modal title={`Edit ${editTier.name} Tier Discount`} onClose={() => setEditTier(null)}>
          <div className="space-y-4 text-xs">
            <FL label="Maximum Discount % Limit in Database">
              <input
                type="number"
                value={editTier.maxDiscount}
                onChange={(e) => setEditTier({ ...editTier, maxDiscount: Number(e.target.value) })}
                className={inputCls}
              />
            </FL>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => setEditTier(null)}
                className="px-4 py-2 border border-[#E5E7EB] rounded-xl text-xs font-bold hover:bg-[#F4F5F7]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTier}
                className="px-4 py-2 bg-[#F26C4F] text-white rounded-xl text-xs font-bold hover:bg-[#e05535]"
              >
                Save to Database
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}