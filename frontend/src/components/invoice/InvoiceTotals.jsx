import React from 'react';
import { Calculator, CheckCircle, AlertCircle } from 'lucide-react';

const currencyFormatters = new Map();
const getCurrencyFormatter = (currency) => {
  if (!currencyFormatters.has(currency)) {
    currencyFormatters.set(
      currency,
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0,
      })
    );
  }
  return currencyFormatters.get(currency);
};

export default function InvoiceTotals({ totals, currency = 'INR' }) {
  const formatCurrency = (val) => getCurrencyFormatter(currency || 'INR').format(val || 0);

  if (!totals) return null;

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-[#E5E7EB]/60 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-slate-100 text-[#1F2937]">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1F2937]">Invoice Summary & Totals</h3>
            <p className="text-[11px] text-[#6B7280]">Backend verified pricing calculations</p>
          </div>
        </div>
        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          Audited by Engine
        </span>
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="flex justify-between text-[#6B7280]">
          <span>Subtotal (List Price Total)</span>
          <span className="font-semibold text-[#1F2937]">{formatCurrency(totals.subtotal)}</span>
        </div>

        {totals.discount > 0 && (
          <div className="flex justify-between text-[#F26C4F]">
            <span>Total Discount</span>
            <span className="font-semibold">-{formatCurrency(totals.discount)}</span>
          </div>
        )}

        <div className="flex justify-between text-[#6B7280]">
          <span>Tax (GST 18%)</span>
          <span className="font-semibold text-[#1F2937]">+{formatCurrency(totals.tax)}</span>
        </div>

        {totals.oneTimeCharges !== undefined && totals.oneTimeCharges > 0 && (
          <div className="flex justify-between text-[#6B7280]">
            <span>One-Time Charges</span>
            <span className="font-semibold text-[#1F2937]">{formatCurrency(totals.oneTimeCharges)}</span>
          </div>
        )}

        {totals.recurringCharges !== undefined && totals.recurringCharges > 0 && (
          <div className="flex justify-between text-[#6B7280]">
            <span>Recurring Charges</span>
            <span className="font-semibold text-[#1F2937]">{formatCurrency(totals.recurringCharges)}</span>
          </div>
        )}

        <div className="pt-3 border-t border-[#E5E7EB] flex justify-between items-baseline text-sm">
          <span className="font-bold text-[#1F2937]">Grand Total</span>
          <span className="text-xl font-extrabold text-[#1F2937]">
            {formatCurrency(totals.grandTotal)}
          </span>
        </div>

        <div className="pt-2 border-t border-[#E5E7EB]/60 flex justify-between items-center text-xs">
          <span className="text-emerald-700 font-semibold flex items-center space-x-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Amount Paid</span>
          </span>
          <span className="font-bold text-emerald-600">{formatCurrency(totals.amountPaid)}</span>
        </div>

        <div className="p-3 bg-[#FEECE8]/40 border border-[#F26C4F]/20 rounded-xl flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-[#1F2937] block">Outstanding Balance</span>
            <span className="text-[10px] text-[#6B7280]">Due per agreed payment terms</span>
          </div>
          <span className="text-lg font-black text-[#F26C4F]">
            {formatCurrency(totals.outstanding)}
          </span>
        </div>
      </div>
    </div>
  );
}
