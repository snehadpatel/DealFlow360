import React, { useState } from 'react';
import { Package, RefreshCw, Calendar, Tag, Percent } from 'lucide-react';

export default function BillingBreakdown({ oneTimeItems = [], recurringItems = [], currency = 'USD' }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'onetime' | 'recurring'

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const showOneTime = activeTab === 'all' || activeTab === 'onetime';
  const showRecurring = activeTab === 'all' || activeTab === 'recurring';

  return (
    <div className="bg-white border border-slate-200/80 rounded-card p-6 shadow-xs space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-textPrimary tracking-tight">Billing Item Breakdown</h2>
          <p className="text-xs text-textSecondary mt-0.5">
            Transparent split between upfront hardware lines and ongoing subscription licenses
          </p>
        </div>

        {/* Tab Controls styled as Revalo Pills */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-full border border-slate-200/80 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
              activeTab === 'all'
                ? 'bg-primary text-white shadow-xs'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            All Items ({oneTimeItems.length + recurringItems.length})
          </button>
          <button
            onClick={() => setActiveTab('onetime')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
              activeTab === 'onetime'
                ? 'bg-primary text-white shadow-xs'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            One-Time Charges ({oneTimeItems.length})
          </button>
          <button
            onClick={() => setActiveTab('recurring')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
              activeTab === 'recurring'
                ? 'bg-primary text-white shadow-xs'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            Recurring Subscriptions ({recurringItems.length})
          </button>
        </div>
      </div>

      {/* Section 1: One-Time Charges */}
      {showOneTime && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-textPrimary">One-Time Charges</h3>
              <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                {oneTimeItems.length} line items
              </span>
            </div>
          </div>

          {oneTimeItems.length === 0 ? (
            <div className="text-center py-6 text-xs text-textSecondary bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No one-time charges included on this billing order.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
              <table className="w-full text-left text-xs text-textPrimary">
                <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-textSecondary border-b border-slate-200/80">
                  <tr>
                    <th className="p-3 font-semibold">Product</th>
                    <th className="p-3 font-semibold">SKU</th>
                    <th className="p-3 font-semibold text-center">Qty</th>
                    <th className="p-3 font-semibold text-right">Unit Price</th>
                    <th className="p-3 font-semibold text-right">Discount</th>
                    <th className="p-3 font-semibold text-right">Tax</th>
                    <th className="p-3 font-semibold text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {oneTimeItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3 font-medium text-textPrimary">
                        <div>{item.productName}</div>
                      </td>
                      <td className="p-3 font-mono text-slate-500">{item.sku}</td>
                      <td className="p-3 text-center font-bold text-slate-700">{item.quantity}</td>
                      <td className="p-3 text-right font-medium">{formatCurrency(item.unitPrice)}</td>
                      <td className="p-3 text-right text-emerald-600 font-medium">
                        {item.discountPercent > 0 ? (
                          <span>
                            -{item.discountPercent}% ({formatCurrency(item.discountAmount)})
                          </span>
                        ) : (
                          <span className="text-slate-400">0%</span>
                        )}
                      </td>
                      <td className="p-3 text-right text-slate-600">
                        {formatCurrency(item.taxAmount)} <span className="text-[10px] text-slate-400">({item.taxPercent}%)</span>
                      </td>
                      <td className="p-3 text-right font-bold text-textPrimary">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Section 2: Recurring Charges */}
      {showRecurring && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-textPrimary">Recurring Charges & Subscriptions</h3>
              <span className="text-xs bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded-full border border-purple-200">
                {recurringItems.length} subscription plans
              </span>
            </div>
          </div>

          {recurringItems.length === 0 ? (
            <div className="text-center py-6 text-xs text-textSecondary bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No recurring subscription charges included on this billing order.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
              <table className="w-full text-left text-xs text-textPrimary">
                <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-textSecondary border-b border-slate-200/80">
                  <tr>
                    <th className="p-3 font-semibold">Product / Plan</th>
                    <th className="p-3 font-semibold text-center">Licenses / Qty</th>
                    <th className="p-3 font-semibold">Billing Cycle</th>
                    <th className="p-3 font-semibold text-right">Recurring Rate</th>
                    <th className="p-3 font-semibold">Next Billing Date</th>
                    <th className="p-3 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recurringItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3 font-medium text-textPrimary">
                        <div>{item.planName}</div>
                        <div className="font-mono text-[10px] text-slate-400">{item.sku}</div>
                        {item.prorationNotice && (
                          <div className="text-[10px] text-purple-600 font-semibold mt-0.5">
                            ★ {item.prorationNotice}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center font-bold text-slate-700">{item.quantity}</td>
                      <td className="p-3">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-semibold text-[11px]">
                          {item.billingCycle}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-purple-700">
                        {formatCurrency(item.recurringAmount)}
                        <span className="text-[10px] text-slate-400 font-normal"> / {item.billingCycle.toLowerCase()}</span>
                      </td>
                      <td className="p-3 font-medium text-slate-700">
                        {formatDate(item.nextBillingDate)}
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
