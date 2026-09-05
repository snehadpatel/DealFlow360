import React from 'react';
import { History, CheckCircle2, Clock, XCircle, CreditCard } from 'lucide-react';

export default function PaymentHistory({ payments = [] }) {
  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-[#E5E7EB]/60 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-slate-100 text-[#1F2937]">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1F2937]">Payment History</h3>
            <p className="text-[11px] text-[#6B7280]">
              Recorded transactions and settlement receipts ({payments.length})
            </p>
          </div>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="p-6 text-center bg-[#F4F5F7]/50 rounded-xl border border-slate-200/60">
          <CreditCard className="w-6 h-6 text-[#6B7280] mx-auto mb-2 opacity-50" />
          <p className="text-xs font-semibold text-[#1F2937]">No Payments Recorded Yet</p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">
            Settlement transactions will appear here once gateway or manual wire receipts are processed.
          </p>
        </div>
      ) : (
        <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F5F7] text-[#6B7280] font-bold uppercase tracking-wider border-b border-[#E5E7EB]">
                <tr>
                  <th className="py-3 px-3.5">Transaction ID</th>
                  <th className="py-3 px-3.5">Date & Time</th>
                  <th className="py-3 px-3.5">Payment Method</th>
                  <th className="py-3 px-3.5 text-right">Amount</th>
                  <th className="py-3 px-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]/70 bg-white">
                {payments.map((p, idx) => {
                  const isSuccess = p.status === 'SUCCESS';
                  return (
                    <tr key={p.transactionId || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3.5">
                        <span className="font-mono font-bold text-[#1F2937]">{p.transactionId}</span>
                        {p.referenceNote && (
                          <div className="text-[10px] text-[#6B7280]">{p.referenceNote}</div>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-[#6B7280] whitespace-nowrap">
                        {p.date}
                      </td>
                      <td className="py-3 px-3.5 font-medium text-[#1F2937]">
                        {p.paymentMethod}
                      </td>
                      <td className="py-3 px-3.5 text-right font-bold text-emerald-600 whitespace-nowrap">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            isSuccess
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {isSuccess ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          <span>{p.status}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
