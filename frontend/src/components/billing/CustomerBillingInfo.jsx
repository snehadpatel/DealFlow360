import React from 'react';
import { User, Mail, Phone, MapPin, Building, ShieldCheck } from 'lucide-react';

export default function CustomerBillingInfo({ customer }) {
  if (!customer) return null;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <Building className="w-4 h-4 text-primary" />
          <h2 className="text-base font-bold text-textPrimary tracking-tight">Customer Billing Information</h2>
        </div>
        <span className="text-xs bg-slate-100 text-slate-700 font-mono font-bold px-2 py-0.5 rounded">
          {customer.customerId}
        </span>
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <span className="text-textSecondary block text-[11px]">Company Name</span>
          <div className="font-bold text-sm text-textPrimary mt-0.5">{customer.name}</div>
        </div>

        <div className="flex items-start space-x-2 pt-1">
          <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-textSecondary block text-[11px]">Billing Address</span>
            <span className="text-slate-800 font-medium leading-relaxed">{customer.address}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <Mail className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="truncate">
              <span className="text-textSecondary block text-[10px]">Email</span>
              <a href={`mailto:${customer.email}`} className="text-slate-800 font-semibold hover:text-primary transition-colors truncate block">
                {customer.email}
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <Phone className="w-4 h-4 text-primary flex-shrink-0" />
            <div>
              <span className="text-textSecondary block text-[10px]">Phone</span>
              <span className="text-slate-800 font-semibold">{customer.phone}</span>
            </div>
          </div>
        </div>

        {customer.taxId && (
          <div className="flex items-center space-x-1.5 text-textSecondary text-[11px] pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tax / GST / EIN: <strong className="text-slate-700 font-mono">{customer.taxId}</strong></span>
          </div>
        )}
      </div>
    </div>
  );
}
