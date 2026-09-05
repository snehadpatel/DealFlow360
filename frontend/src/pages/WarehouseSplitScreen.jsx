import React from 'react';

export default function WarehouseSplitScreen() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Warehouse Stock & Split Routing</h1>
        <p className="text-sm text-slate-400">Automated inventory allocation across multiple regional fulfillment hubs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recommended Distribution</h2>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700 flex justify-between items-center">
              <div>
                <div className="font-medium text-white">Chicago Central Hub</div>
                <div className="text-xs text-slate-400">In stock: 45 units</div>
              </div>
              <span className="text-emerald-400 font-bold text-sm">Allocate 30</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700 flex justify-between items-center">
              <div>
                <div className="font-medium text-white">Austin West Facility</div>
                <div className="text-xs text-slate-400">In stock: 15 units</div>
              </div>
              <span className="text-emerald-400 font-bold text-sm">Allocate 10</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Split Actions</h2>
          <p className="text-xs text-slate-400 mb-4">Accept recommended allocation or define custom warehouse quantities.</p>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-semibold">
              Accept Recommended Split
            </button>
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-semibold">
              Manual Override
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
