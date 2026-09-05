import React, { useState, useEffect } from 'react';
import { getCustomerProfile } from '../../api/customerApi';
import { Building2, Mail, Phone, MapPin, FileText, User } from 'lucide-react';

export default function ProfileView() {
  const [profile, setProfile] = useState(null);
  useEffect(() => { getCustomerProfile().then(setProfile); }, []);
  if (!profile) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div><h1 className="text-2xl font-extrabold text-textPrimary">Company Profile</h1><p className="text-xs text-textSecondary mt-1">Verified account and contact information for Acme Corporation.</p></div>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md space-y-6">
        <div className="flex items-center space-x-4 border-b border-gray-200 pb-4">
          <div className="h-14 w-14 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-500 font-extrabold text-2xl">AC</div>
          <div>
            <h2 className="text-xl font-bold text-textPrimary">{profile.companyName}</h2>
            <span className="inline-block px-2.5 py-0.5 text-xs font-semibold bg-success-50 text-success-700 border border-success-100 rounded-full mt-1">Verified Enterprise Buyer</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-4">
            {[{ icon: User, label: 'Primary Contact', value: profile.contactName }, { icon: Mail, label: 'Email Address', value: profile.email }, { icon: Phone, label: 'Phone', value: profile.phone }].map((item, i) => (
              <div key={i} className="flex items-start space-x-3"><item.icon className="w-5 h-5 text-textSecondary mt-0.5" /><div><span className="text-xs text-textSecondary font-medium">{item.label}</span><div className="font-semibold text-textPrimary">{item.value}</div></div></div>
            ))}
          </div>
          <div className="space-y-4">
            {[{ icon: MapPin, label: 'Billing Address', value: profile.address }, { icon: FileText, label: 'Tax Registration / GSTIN', value: profile.taxId }].map((item, i) => (
              <div key={i} className="flex items-start space-x-3"><item.icon className="w-5 h-5 text-textSecondary mt-0.5" /><div><span className="text-xs text-textSecondary font-medium">{item.label}</span><div className="font-semibold text-textPrimary leading-relaxed">{item.value}</div></div></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
