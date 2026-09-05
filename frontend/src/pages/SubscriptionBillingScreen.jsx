import React from 'react';

export default function SubscriptionBillingScreen() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Subscription & Mixed Billing Schedule</h1>
        <p className="text-sm text-slate-400">Unified invoicing for bundled hardware, SaaS licenses, and mid-cycle proration.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Billing Cadence Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700">
            <div className="text-xs text-slate-400">Upfront Hardware</div>
            <div className="text-xl font-bold text-white mt-1">$12,000.00</div>
            <div className="text-xs text-slate-400 mt-2">Due on contract sign</div>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700">
            <div className="text-xs text-slate-400">Monthly Platform Fee</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">$850.00 / mo</div>
            <div className="text-xs text-slate-400 mt-2">Billed 1st of month</div>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700">
            <div className="text-xs text-slate-400">Proration Status</div>
            <div className="text-xl font-bold text-cyan-400 mt-1">Mid-Cycle Active</div>
            <div className="text-xs text-slate-400 mt-2">Calculated dynamically</div>
          </div>
        </div>
      </div>
    </div>
  );
}
