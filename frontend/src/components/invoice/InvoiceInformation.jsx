import React from 'react';
import { FileText, Calendar, CreditCard, ShieldCheck } from 'lucide-react';

export default function InvoiceInformation({ invoice }) {
  if (!invoice) return null;

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center space-x-2 border-b border-[#E5E7EB]/60 pb-3">
        <div className="p-2 rounded-xl bg-slate-100 text-[#1F2937]">
          <FileText className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#1F2937]">Invoice Details</h3>
          <p className="text-[11px] text-[#6B7280]">Key billing & metadata records</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-[#F4F5F7] p-2.5 rounded-xl">
          <span className="text-[10px] text-[#6B7280] uppercase tracking-wider block font-semibold">
            Invoice Number
          </span>
          <span className="font-bold text-[#1F2937] text-sm block mt-0.5">
            {invoice.invoiceNumber || invoice.id}
          </span>
        </div>

        <div className="bg-[#F4F5F7] p-2.5 rounded-xl">
          <span className="text-[10px] text-[#6B7280] uppercase tracking-wider block font-semibold">
            Invoice Date
          </span>
          <span className="font-semibold text-[#1F2937] block mt-0.5">
            {invoice.invoiceDate}
          </span>
        </div>

        <div className="bg-[#F4F5F7] p-2.5 rounded-xl">
          <span className="text-[10px] text-[#6B7280] uppercase tracking-wider block font-semibold">
            Due Date
          </span>
          <span
            className={`font-semibold block mt-0.5 ${
              invoice.status === 'OVERDUE' ? 'text-rose-600 font-bold' : 'text-[#1F2937]'
            }`}
          >
            {invoice.dueDate}
          </span>
        </div>

        <div className="bg-[#F4F5F7] p-2.5 rounded-xl">
          <span className="text-[10px] text-[#6B7280] uppercase tracking-wider block font-semibold">
            Quotation Ref
          </span>
          <span className="font-bold text-[#F26C4F] block mt-0.5">
            {invoice.quotationId || 'Direct Invoice'}
          </span>
        </div>

        <div className="bg-[#F4F5F7] p-2.5 rounded-xl">
          <span className="text-[10px] text-[#6B7280] uppercase tracking-wider block font-semibold">
            Billing Schedule ID
          </span>
          <span className="font-mono font-semibold text-[#1F2937] block mt-0.5">
            {invoice.billingId || 'BIL-STANDARD'}
          </span>
        </div>

        <div className="bg-[#F4F5F7] p-2.5 rounded-xl">
          <span className="text-[10px] text-[#6B7280] uppercase tracking-wider block font-semibold">
            Payment Terms & Currency
          </span>
          <span className="font-semibold text-[#1F2937] block mt-0.5">
            {invoice.paymentTerms} ({invoice.currency || 'INR'})
          </span>
        </div>
      </div>
    </div>
  );
}
