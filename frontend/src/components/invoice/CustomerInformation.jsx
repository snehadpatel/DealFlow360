import React from 'react';
import { User, Mail, MapPin, Phone, FileText } from 'lucide-react';

export default function CustomerInformation({ customer }) {
  if (!customer) return null;

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center space-x-2 border-b border-[#E5E7EB]/60 pb-3">
        <div className="p-2 rounded-xl bg-slate-100 text-[#1F2937]">
          <User className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#1F2937]">Customer Information</h3>
          <p className="text-[11px] text-[#6B7280]">Account details and billing contacts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Customer Primary Details */}
        <div className="space-y-2">
          <div>
            <span className="text-[10px] text-[#6B7280] uppercase tracking-wider block font-semibold">
              Customer Name
            </span>
            <div className="font-bold text-[#1F2937] text-sm mt-0.5">
              {customer.name}
            </div>
            {customer.id && (
              <span className="inline-block px-2 py-0.5 mt-1 text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 rounded-md">
                ID: {customer.id}
              </span>
            )}
          </div>

          <div>
            <span className="text-[10px] text-[#6B7280] uppercase tracking-wider block font-semibold">
              Email Address
            </span>
            <div className="flex items-center space-x-1.5 text-[#1F2937] mt-0.5 font-medium">
              <Mail className="w-3.5 h-3.5 text-[#6B7280]" />
              <a href={`mailto:${customer.email}`} className="text-[#F26C4F] hover:underline">
                {customer.email}
              </a>
            </div>
          </div>

          {customer.phone && (
            <div>
              <span className="text-[10px] text-[#6B7280] uppercase tracking-wider block font-semibold">
                Phone
              </span>
              <div className="flex items-center space-x-1.5 text-[#1F2937] mt-0.5">
                <Phone className="w-3.5 h-3.5 text-[#6B7280]" />
                <span>{customer.phone}</span>
              </div>
            </div>
          )}

          {customer.taxId && (
            <div>
              <span className="text-[10px] text-[#6B7280] uppercase tracking-wider block font-semibold">
                GST / Tax Registration ID
              </span>
              <div className="font-mono font-semibold text-[#1F2937] mt-0.5">
                {customer.taxId}
              </div>
            </div>
          )}
        </div>

        {/* Addresses */}
        <div className="space-y-3 bg-[#F4F5F7]/60 p-3 rounded-xl border border-slate-200/60">
          <div>
            <span className="text-[10px] text-[#6B7280] uppercase tracking-wider block font-semibold flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-[#F26C4F]" />
              <span>Billing Address</span>
            </span>
            <p className="text-xs text-[#1F2937] mt-1 leading-relaxed">
              {customer.billingAddress || 'No billing address recorded.'}
            </p>
          </div>

          {customer.shippingAddress && (
            <div className="pt-2 border-t border-[#E5E7EB]">
              <span className="text-[10px] text-[#6B7280] uppercase tracking-wider block font-semibold flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-[#6B7280]" />
                <span>Shipping Address</span>
              </span>
              <p className="text-xs text-[#1F2937] mt-1 leading-relaxed">
                {customer.shippingAddress}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
