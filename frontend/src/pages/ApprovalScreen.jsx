import React from 'react';

export default function ApprovalScreen() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Approval Queue</h1>
        <p className="text-sm text-slate-400">Review quotes exceeding tier or category discount thresholds.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800/60 text-xs uppercase text-slate-400">
            <tr>
              <th className="p-3">Quote ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Rep</th>
              <th className="p-3">Total</th>
              <th className="p-3">Blended Discount</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            <tr>
              <td className="p-3 font-mono text-xs text-slate-400">Q-8821</td>
              <td className="p-3 font-medium text-white">MegaCorp Global</td>
              <td className="p-3">Alex Rep</td>
              <td className="p-3 font-semibold text-emerald-400">$48,500</td>
              <td className="p-3 text-amber-400 font-medium">18.5%</td>
              <td className="p-3">
                <span className="px-2 py-0.5 rounded text-xs bg-amber-950 text-amber-300 border border-amber-800">
                  Pending Manager
                </span>
              </td>
              <td className="p-3 text-right space-x-2">
                <button className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium">
                  Approve
                </button>
                <button className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-medium">
                  Reject
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
