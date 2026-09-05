import React, { useState } from 'react';

export default function QuotationBuilder() {
  const [customer, setCustomer] = useState('Acme Corp (Silver Tier)');
  const [discount, setDiscount] = useState(12);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Quotation Builder</h1>
          <p className="text-sm text-slate-400">Configure pricing, apply category discounts, and test approval governance.</p>
        </div>
        <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600">
          Submit for Approval
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quote Builder Form */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Line Items</h2>
          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-xs uppercase text-slate-400">
                <tr>
                  <th className="p-3">Item</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Unit Price</th>
                  <th className="p-3">Discount %</th>
                  <th className="p-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr>
                  <td className="p-3 font-medium text-white">Enterprise Edge Router</td>
                  <td className="p-3 text-slate-400">Hardware</td>
                  <td className="p-3">10</td>
                  <td className="p-3">$1,200</td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-16 bg-slate-950 border border-slate-700 px-2 py-1 rounded text-center text-sm"
                    />
                  </td>
                  <td className="p-3 text-emerald-400 font-semibold">${(10 * 1200 * (1 - discount / 100)).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Upsell & Risk Score Panel */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-2">Blended Risk Score</h2>
            <div className="p-4 rounded-lg bg-amber-950/30 border border-amber-800/50 text-amber-300 text-sm">
              <div className="font-bold">Risk Level: Moderate</div>
              <p className="text-xs text-amber-400/80 mt-1">
                Category discount exceeds Bronze/Silver auto-approval threshold. Requires Sales Manager sign-off.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">AI Upsell Recommendations</h2>
              <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 rounded font-semibold">Gemini</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700 text-xs space-y-2">
              <div className="font-semibold text-slate-200">24/7 Mission-Critical Support Pack</div>
              <p className="text-slate-400">84% of customers buying Edge Routers add 1-year premium SLA.</p>
              <button className="mt-2 w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium">
                + Add Bundle ($1,500/yr)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
