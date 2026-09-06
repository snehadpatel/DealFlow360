import React from 'react';
import { Package, Repeat, Layers } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const formatCurrency = (val) => currencyFormatter.format(val || 0);

export default function InvoiceItems({ items }) {

  if (!items || items.length === 0) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 text-center text-xs text-[#6B7280]">
        No line items in this invoice.
      </div>
    );
  }

  const oneTimeItems = items.filter((i) => !i.isRecurring);
  const recurringItems = items.filter((i) => i.isRecurring);

  const renderTable = (itemList, title, icon, badge) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-slate-100 text-[#1F2937]">
            {icon}
          </div>
          <span className="text-xs font-bold text-[#1F2937] uppercase tracking-wider">
            {title} ({itemList.length})
          </span>
        </div>
        <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded-full">
          {badge}
        </span>
      </div>

      <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F5F7] text-[#6B7280] font-bold uppercase tracking-wider border-b border-[#E5E7EB]">
              <tr>
                <th className="py-3 px-3.5">Product & SKU</th>
                <th className="py-3 px-3.5">Description</th>
                <th className="py-3 px-3.5 text-center">Qty</th>
                <th className="py-3 px-3.5 text-right">Unit Price</th>
                <th className="py-3 px-3.5 text-right">Discount</th>
                <th className="py-3 px-3.5 text-right">Tax (GST)</th>
                <th className="py-3 px-3.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]/70 bg-white">
              {itemList.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3.5">
                    <div className="font-bold text-[#1F2937]">{item.product}</div>
                    <span className="inline-block text-[10px] font-mono text-[#6B7280]">
                      {item.sku || 'SKU-GEN'}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-[#6B7280] max-w-xs">
                    {item.description || 'Standard product line delivery'}
                  </td>
                  <td className="py-3 px-3.5 text-center font-semibold text-[#1F2937]">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-3.5 text-right font-medium text-[#1F2937] whitespace-nowrap">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="py-3 px-3.5 text-right whitespace-nowrap">
                    <span className="text-[#F26C4F] font-semibold">
                      {item.discountPercent}%
                    </span>
                    {item.discountAmount !== undefined && (
                      <div className="text-[10px] text-[#6B7280]">
                        -{formatCurrency(item.discountAmount)}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3.5 text-right whitespace-nowrap">
                    <span className="text-slate-600">{item.taxPercent}%</span>
                    {item.taxAmount !== undefined && (
                      <div className="text-[10px] text-[#6B7280]">
                        +{formatCurrency(item.taxAmount)}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3.5 text-right font-bold text-[#1F2937] whitespace-nowrap">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-6">
      <div className="flex items-center space-x-2 border-b border-[#E5E7EB]/60 pb-3">
        <div className="p-2 rounded-xl bg-slate-100 text-[#1F2937]">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#1F2937]">Invoice Line Items</h3>
          <p className="text-[11px] text-[#6B7280]">
            Itemized breakdown of products, subscriptions, and services
          </p>
        </div>
      </div>

      {oneTimeItems.length > 0 &&
        renderTable(
          oneTimeItems,
          'One-Time Charges & Hardware',
          <Package className="w-3.5 h-3.5 text-blue-600" />,
          'Upfront Deliverables'
        )}

      {recurringItems.length > 0 &&
        renderTable(
          recurringItems,
          'Recurring SaaS & Subscription Services',
          <Repeat className="w-3.5 h-3.5 text-emerald-600" />,
          'Subscription Schedule'
        )}
    </div>
  );
}
