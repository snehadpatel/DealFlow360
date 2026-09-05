import React from 'react';

export default function CustomerPortal() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-emerald-950/20 border border-emerald-800/40 p-4 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-xs uppercase font-semibold text-emerald-400">Customer View</span>
          <h1 className="text-xl font-bold text-white">Quote Review & Negotiation: Acme Corp</h1>
        </div>
        <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-semibold">
          Confirm & Accept Quote
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Counter-Offer / Negotiation</h2>
        <p className="text-xs text-slate-400">
          Need custom volume terms? Submit a counter-discount request below. Any counter above threshold automatically triggers approval re-evaluation.
        </p>
        <div className="flex space-x-3">
          <input
            type="text"
            placeholder="Request revised discount % or note..."
            className="flex-1 bg-slate-950 border border-slate-700 px-3 py-2 rounded-lg text-sm text-slate-200"
          />
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium">
            Send Counter
          </button>
        </div>
      </div>
    </div>
  );
}
