import React, { useState } from "react";
import { User, Mail, ShieldCheck, KeyRound, Check, Edit2, Lock } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import Modal from "../ui/Modal";

export default function AdminProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [changePassOpen, setChangePassOpen] = useState(false);
  const [name, setName] = useState(user?.name || "Super Admin");
  const [email, setEmail] = useState(user?.email || "admin@revalo.com");
  const [department, setDepartment] = useState("Executive & System Administration");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function handleSaveProfile() {
    setIsEditing(false);
    showToast("Profile details updated successfully");
  }

  function handleChangePassword() {
    if (!newPassword) return;
    setChangePassOpen(false);
    setOldPassword("");
    setNewPassword("");
    showToast("Super Admin password updated successfully");
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1F2937] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2 animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {toast}
        </div>
      )}

      <div>
        <h2 className="text-[20px] font-bold text-[#1F2937] tracking-tight">Super Admin Profile</h2>
        <p className="text-[#6B7280] text-xs mt-0.5">Manage your administrator identity, credentials, and security settings.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-4 border-b border-[#E5E7EB] pb-5">
          <div className="w-16 h-16 rounded-full bg-[#F26C4F] text-white font-extrabold text-xl flex items-center justify-center shadow-md">
            SA
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1F2937]">{name}</h3>
            <p className="text-xs text-[#6B7280]">{email}</p>
            <span className="inline-block px-2.5 py-0.5 mt-1 text-[10px] font-extrabold bg-[#FEECE8] text-[#F26C4F] rounded-full">
              SUPER ADMIN
            </span>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#374151] mb-1">Full Name</label>
              <input
                disabled={!isEditing}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F] disabled:bg-[#FAFBFD]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#374151] mb-1">Email Address</label>
              <input
                disabled={!isEditing}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F] disabled:bg-[#FAFBFD]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#374151] mb-1">Department</label>
            <input
              disabled={!isEditing}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F] disabled:bg-[#FAFBFD]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-4">
          <button
            onClick={() => setChangePassOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-[#E5E7EB] rounded-xl text-xs font-bold text-[#374151] hover:bg-[#F4F5F7]"
          >
            <Lock size={14} /> Change Password
          </button>

          {isEditing ? (
            <button
              onClick={handleSaveProfile}
              className="px-4 py-2 bg-[#F26C4F] text-white text-xs font-bold rounded-xl hover:bg-[#e05535]"
            >
              Save Profile
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-[#1F2937] text-white text-xs font-bold rounded-xl hover:bg-black"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {changePassOpen && (
        <Modal title="Change Administrator Password" onClose={() => setChangePassOpen(false)}>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-[#374151] mb-1">Current Password *</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#374151] mb-1">New Secure Password *</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 outline-none focus:border-[#F26C4F]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setChangePassOpen(false)} className="px-4 py-2 border border-[#E5E7EB] rounded-xl text-xs font-semibold hover:bg-[#F4F5F7]">
                Cancel
              </button>
              <button onClick={handleChangePassword} className="px-4 py-2 bg-[#F26C4F] text-white rounded-xl text-xs font-bold hover:bg-[#e05535]">
                Update Password
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
