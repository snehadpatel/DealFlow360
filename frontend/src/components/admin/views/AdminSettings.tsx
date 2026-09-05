import React, { useState } from "react";
import { Settings, Shield, Bell, Sliders, CheckCircle2 } from "lucide-react";

export default function AdminSettings() {
  const [companyName, setCompanyName] = useState("DealFlow360 Technologies Pvt Ltd");
  const [currency, setCurrency] = useState("INR (₹)");
  const [timezone, setTimezone] = useState("Asia/Kolkata (IST)");
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [defaultTax, setDefaultTax] = useState("18");
  const [approvalThreshold, setApprovalThreshold] = useState("15");
  const [quoteValidity, setQuoteValidity] = useState("30");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [aiAlerts, setAiAlerts] = useState(true);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function handleSaveSettings() {
    showToast("Platform system settings updated successfully");
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1F2937] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2 animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {toast}
        </div>
      )}

      <div>
        <h2 className="text-[20px] font-bold text-[#1F2937] tracking-tight">System & Business Settings</h2>
        <p className="text-[#6B7280] text-xs mt-0.5">Configure platform defaults, security policies, tax rates, and alert routing.</p>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#1F2937] border-b border-[#E5E7EB] pb-2 flex items-center gap-2">
          <Settings size={16} className="text-[#F26C4F]" /> General Platform Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-[#374151] mb-1">Company Entity Name</label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
            />
          </div>
          <div>
            <label className="block font-bold text-[#374151] mb-1">Base Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
            >
              <option value="INR (₹)">INR (₹) — Indian Rupee</option>
              <option value="USD ($)">USD ($) — US Dollar</option>
              <option value="EUR (€)">EUR (€) — Euro</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-[#374151] mb-1">System Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
            >
              <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</option>
              <option value="UTC">UTC (Coordinated Universal Time)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security Policies */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#1F2937] border-b border-[#E5E7EB] pb-2 flex items-center gap-2">
          <Shield size={16} className="text-[#F26C4F]" /> Security & Authentication Controls
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-[#374151] mb-1">Inactivity Session Timeout (Minutes)</label>
            <input
              type="number"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
            />
          </div>
          <div>
            <label className="block font-bold text-[#374151] mb-1">Enforce Multi-Factor Auth (MFA)</label>
            <select className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]">
              <option value="optional">Optional for Reps</option>
              <option value="mandatory">Mandatory for Admin & Finance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Business Rules */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#1F2937] border-b border-[#E5E7EB] pb-2 flex items-center gap-2">
          <Sliders size={16} className="text-[#F26C4F]" /> Commercial & Tax Business Rules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-[#374151] mb-1">Default GST Tax %</label>
            <input
              type="number"
              value={defaultTax}
              onChange={(e) => setDefaultTax(e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
            />
          </div>
          <div>
            <label className="block font-bold text-[#374151] mb-1">Max Auto-Approval Discount %</label>
            <input
              type="number"
              value={approvalThreshold}
              onChange={(e) => setApprovalThreshold(e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
            />
          </div>
          <div>
            <label className="block font-bold text-[#374151] mb-1">Default Quotation Validity (Days)</label>
            <input
              type="number"
              value={quoteValidity}
              onChange={(e) => setQuoteValidity(e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          className="px-5 py-2.5 bg-[#F26C4F] text-white text-xs font-bold rounded-xl hover:bg-[#e05535] transition shadow-xs"
        >
          Save All System Settings
        </button>
      </div>
    </div>
  );
}
