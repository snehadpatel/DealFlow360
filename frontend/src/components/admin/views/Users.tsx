import { useState } from "react";
import { Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Mail } from "lucide-react";
import StatusPill from "../ui/StatusPill";
import Modal from "../ui/Modal";
import ConfirmDialog from "../ui/ConfirmDialog";

const roles = ["Admin", "Sales Representative", "Sales Manager", "Finance", "Operations"];

const initialUsers = [
  { id: 1, name: "Super Admin", email: "admin@revalo.com", role: "Admin", department: "Platform", status: "active", lastLogin: "5 Sep 2026, 09:14", created: "1 Jan 2026" },
  { id: 2, name: "Priya Sharma", email: "priya.s@revalo.com", role: "Sales Representative", department: "Sales", status: "active", lastLogin: "5 Sep 2026, 08:41", created: "15 Jan 2026" },
  { id: 3, name: "Rahul Mehta", email: "rahul.m@revalo.com", role: "Sales Manager", department: "Sales", status: "active", lastLogin: "4 Sep 2026, 17:22", created: "20 Jan 2026" },
  { id: 4, name: "Deepa Nair", email: "deepa.n@revalo.com", role: "Finance", department: "Finance", status: "active", lastLogin: "4 Sep 2026, 14:08", created: "1 Feb 2026" },
  { id: 5, name: "Ankit Singh", email: "ankit.s@revalo.com", role: "Operations", department: "Operations", status: "inactive", lastLogin: "20 Aug 2026, 11:30", created: "10 Feb 2026" },
  { id: 6, name: "Kavitha Rao", email: "kavitha.r@revalo.com", role: "Sales Representative", department: "Sales", status: "active", lastLogin: "5 Sep 2026, 07:55", created: "1 Mar 2026" },
];

const inputCls = "w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-[13px] text-[#1F2937] outline-none focus:border-[#F26C4F] focus:ring-1 focus:ring-[#F26C4F]/20 placeholder-[#9CA3AF]";
function FL({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return <div><label className="block text-[12px] font-medium text-[#6B7280] mb-1">{label}{required && <span className="text-[#EF4444] ml-0.5">*</span>}</label>{children}</div>;
}

const roleColors: Record<string, string> = {
  Admin: "bg-purple-50 text-purple-700",
  "Sales Representative": "bg-blue-50 text-blue-700",
  "Sales Manager": "bg-indigo-50 text-indigo-700",
  Finance: "bg-amber-50 text-amber-700",
  Operations: "bg-teal-50 text-teal-700",
};

export default function Users() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const perPage = 5;
  const filtered = users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 2500); }

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1F2937] text-white text-sm px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />{toast}
        </div>
      )}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-[#1F2937]">Users & Managers</h2>
          <p className="text-[#6B7280] text-sm">Manage platform users, roles, and access.</p>
        </div>
        <button onClick={() => setInviteOpen(true)} className="flex items-center gap-2 bg-[#F26C4F] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#E05A3E] flex-shrink-0">
          <Mail size={16} /> Invite Manager
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2 bg-[#F4F5F7] rounded-lg px-3 py-2 flex-1 min-w-[180px]">
            <Search size={15} className="text-[#9CA3AF]" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search users..." className="bg-transparent outline-none text-[13px] text-[#1F2937] w-full placeholder-[#9CA3AF]" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[#E5E7EB]">
              <tr>
                {["User", "Email", "Role", "Department", "Status", "Last Login", "Created", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-[#6B7280] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-b border-[#F4F5F7] last:border-0 hover:bg-[#FAFAFA]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#F26C4F]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#F26C4F] font-semibold text-xs">{u.name.charAt(0)}</span>
                      </div>
                      <span className="text-[13px] font-medium text-[#1F2937] whitespace-nowrap">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${roleColors[u.role] ?? "bg-gray-100 text-gray-600"}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">{u.department}</td>
                  <td className="px-4 py-3"><StatusPill status={u.status} /></td>
                  <td className="px-4 py-3 text-[12px] text-[#6B7280] whitespace-nowrap">{u.lastLogin}</td>
                  <td className="px-4 py-3 text-[12px] text-[#6B7280] whitespace-nowrap">{u.created}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F4F5F7] text-[#6B7280]"><Edit2 size={14} /></button>
                      <button onClick={() => setDeleteId(u.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#6B7280] hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E7EB]">
          <p className="text-[12px] text-[#6B7280]">Showing {Math.min((page-1)*perPage+1,total)}–{Math.min(page*perPage,total)} of {total}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(Math.max(1,page-1))} disabled={page===1} className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280] disabled:opacity-40"><ChevronLeft size={14} /></button>
            {Array.from({length:pages},(_,i)=>i+1).map((p)=>(<button key={p} onClick={()=>setPage(p)} className={`w-7 h-7 flex items-center justify-center rounded-lg text-[12px] font-medium ${page===p?"bg-[#F26C4F] text-white":"border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F4F5F7]"}`}>{p}</button>))}
            <button onClick={() => setPage(Math.min(pages,page+1))} disabled={page===pages} className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280] disabled:opacity-40"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite Manager" description="Send an invitation to a new team member." onSave={() => { setInviteOpen(false); showToast("Invitation sent"); }} saveLabel="Send Invitation">
        <div className="space-y-4">
          <FL label="Full Name" required><input className={inputCls} placeholder="Name" /></FL>
          <FL label="Email Address" required><input type="email" className={inputCls} placeholder="email@company.com" /></FL>
          <FL label="Role" required>
            <select className={inputCls}>{roles.map((r) => <option key={r}>{r}</option>)}</select>
          </FL>
          <div>
            <label className="block text-[12px] font-medium text-[#6B7280] mb-2">Permissions</label>
            <div className="grid grid-cols-2 gap-2">
              {["View", "Create", "Edit", "Delete", "Approve"].map((p) => (
                <label key={p} className="flex items-center gap-2 cursor-pointer text-[13px] text-[#1F2937]">
                  <input type="checkbox" className="accent-[#F26C4F] w-4 h-4" defaultChecked={["View", "Create"].includes(p)} />
                  {p}
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={deleteId !== null} title="Remove User" message="This user will be removed from the platform and lose all access immediately." confirmLabel="Remove User" onConfirm={() => { setUsers(users.filter((u) => u.id !== deleteId)); setDeleteId(null); showToast("User removed"); }} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
