import React, { useState, useEffect } from 'react';
import { getCustomerProfile, updateCustomerProfile } from '../../api/customerApi';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  User, 
  Edit3, 
  CheckCircle2, 
  Save, 
  X, 
  ShieldCheck, 
  CreditCard,
  Award
} from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const formatCurrency = (val) => currencyFormatter.format(val || 0);

export default function ProfileView() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);

  const fetchProfile = async () => {
    const data = await getCustomerProfile();
    setProfile(data);
    setFormData(data);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (!profile) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(null);
    try {
      await updateCustomerProfile(formData);
      setProfile({ ...profile, ...formData });
      setIsEditing(false);
      setSaveSuccess('Company profile successfully updated and synchronized with ERP backend.');
    } catch (err) {
      alert('Failed to update profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="space-y-6 max-w-4xl font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-textPrimary tracking-tight">Company Profile</h1>
          <p className="text-xs text-textSecondary mt-1">
            Manage verified enterprise account details, contact personnel, and billing tax IDs.
          </p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="self-start sm:self-auto inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-full text-xs font-semibold shadow-btn transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(false)}
            className="self-start sm:self-auto inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-textSecondary rounded-full transition"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        )}
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-2xl shadow-sm flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccess}</span>
          </div>
          <button onClick={() => setSaveSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
            Dismiss
          </button>
        </div>
      )}

      {/* Account Overview Hero */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-2xl bg-[#FEECE8] border border-[#F26C4F]/30 flex items-center justify-center text-[#F26C4F] font-extrabold text-2xl shadow-xs">
              {profile.companyName ? profile.companyName.slice(0, 2).toUpperCase() : 'DF'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-textPrimary tracking-tight">{profile.companyName}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified B2B Enterprise</span>
                </span>
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                  <Award className="w-3 h-3" />
                  <span>{profile.tier} Tier Account</span>
                </span>
              </div>
            </div>
          </div>
          <div className="text-left sm:text-right bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none">
            <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">Approved Credit Limit</span>
            <div className="text-lg font-extrabold text-brand-500 mt-0.5">{formatCurrency(profile.creditLimit)}</div>
          </div>
        </div>

        {/* View / Edit Mode */}
        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <User className="w-4 h-4 text-textSecondary mt-0.5" />
                <div>
                  <span className="text-textSecondary font-medium">Primary Contact Person</span>
                  <div className="font-bold text-textPrimary text-sm mt-0.5">{profile.contactName}</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <Mail className="w-4 h-4 text-textSecondary mt-0.5" />
                <div>
                  <span className="text-textSecondary font-medium">Registered Business Email</span>
                  <div className="font-bold text-textPrimary text-sm mt-0.5">{profile.email}</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <Phone className="w-4 h-4 text-textSecondary mt-0.5" />
                <div>
                  <span className="text-textSecondary font-medium">Contact Phone</span>
                  <div className="font-bold text-textPrimary text-sm mt-0.5">{profile.phone}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <MapPin className="w-4 h-4 text-textSecondary mt-0.5" />
                <div>
                  <span className="text-textSecondary font-medium">Registered Billing Address</span>
                  <div className="font-semibold text-textPrimary text-sm mt-0.5 leading-relaxed">{profile.address}</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <FileText className="w-4 h-4 text-textSecondary mt-0.5" />
                <div>
                  <span className="text-textSecondary font-medium">Tax Registration / GSTIN</span>
                  <div className="font-bold text-textPrimary text-sm mt-0.5">{profile.taxId}</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <CreditCard className="w-4 h-4 text-textSecondary mt-0.5" />
                <div>
                  <span className="text-textSecondary font-medium">Default Payment Terms</span>
                  <div className="font-bold text-textPrimary text-sm mt-0.5">Net 30 Days (Corporate Invoicing)</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label htmlFor="profile-company-name" className="font-bold uppercase tracking-wider text-textSecondary">Company Legal Name</label>
                <input
                  id="profile-company-name"
                  type="text"
                  value={formData.companyName || ''}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs text-textPrimary focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="profile-phone" className="font-bold uppercase tracking-wider text-textSecondary">Contact Phone</label>
                <input
                  id="profile-phone"
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs text-textPrimary focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="profile-tax-id" className="font-bold uppercase tracking-wider text-textSecondary">Tax Registration / GSTIN</label>
                <input
                  id="profile-tax-id"
                  type="text"
                  value={formData.taxId || ''}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs text-textPrimary focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="profile-email" className="font-bold uppercase tracking-wider text-textSecondary">Business Email</label>
                <input
                  id="profile-email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs text-textPrimary focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label htmlFor="profile-address" className="font-bold uppercase tracking-wider text-textSecondary">Billing Address</label>
                <textarea
                  id="profile-address"
                  rows="3"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs text-textPrimary focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-200 rounded-full text-xs font-semibold text-textSecondary hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-200 text-white rounded-full text-xs font-semibold shadow-btn transition flex items-center space-x-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
