import { useState } from "react";
import { Cloud, RefreshCw, Clock, Database, HardDrive, Calendar, History, RotateCcw, CheckCircle } from "lucide-react";
import Modal from "../ui/Modal";

const backupHistory = [
  { id: 1, label: "Full Backup", time: "5 Sep 2026, 02:00", size: "48.2 GB", status: "success" },
  { id: 2, label: "Incremental", time: "4 Sep 2026, 14:00", size: "1.4 GB", status: "success" },
  { id: 3, label: "Incremental", time: "4 Sep 2026, 02:00", size: "1.1 GB", status: "success" },
  { id: 4, label: "Full Backup", time: "3 Sep 2026, 02:00", size: "47.9 GB", status: "success" },
  { id: 5, label: "Incremental", time: "2 Sep 2026, 14:00", size: "1.3 GB", status: "success" },
];

const inputCls = "w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-[13px] text-[#1F2937] outline-none focus:border-[#F26C4F] focus:ring-1 focus:ring-[#F26C4F]/20";

export default function CloudBackup() {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [backing, setBacking] = useState(false);
  const [toast, setToast] = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 2500); }

  function handleBackupNow() {
    setBacking(true);
    setTimeout(() => {
      setBacking(false);
      showToast("Backup completed successfully");
    }, 2000);
  }

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1F2937] text-white text-sm px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />{toast}
        </div>
      )}
      <div>
        <h2 className="text-[18px] font-bold text-[#1F2937]">Cloud Backup</h2>
        <p className="text-[#6B7280] text-sm">Monitor backup status, schedule, and storage usage.</p>
      </div>

      {/* Status Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 bg-[#161616] rounded-2xl p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Cloud size={24} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-[#9CA3AF] text-[12px]">Backup Status</p>
              <p className="text-emerald-400 text-[20px] font-bold">Healthy</p>
            </div>
          </div>
          <div className="space-y-3 flex-1">
            {[
              { label: "Last Backup", value: "5 Sep 2026, 02:00", icon: <Clock size={13} /> },
              { label: "Next Scheduled", value: "6 Sep 2026, 02:00", icon: <Calendar size={13} /> },
              { label: "Frequency", value: "Every 12 hours", icon: <RefreshCw size={13} /> },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#9CA3AF] text-[12px]">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <span className="text-white text-[12px] font-medium">{item.value}</span>
              </div>
            ))}
          </div>
          <button
            onClick={handleBackupNow}
            disabled={backing}
            className="mt-5 w-full py-2.5 bg-[#F26C4F] text-white rounded-lg text-[13px] font-medium hover:bg-[#E05A3E] disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
          >
            {backing ? <><RefreshCw size={14} className="animate-spin" />Backing up...</> : <><Cloud size={14} />Backup Now</>}
          </button>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {[
            { label: "Data Size", value: "48.2 GB", sub: "Total platform data", icon: <Database size={20} />, color: "text-blue-500", bg: "bg-blue-50" },
            { label: "Storage Used", value: "142.6 GB", sub: "of 500 GB allocated", icon: <HardDrive size={20} />, color: "text-purple-500", bg: "bg-purple-50" },
            { label: "Backup Count", value: "31", sub: "Stored backups", icon: <Cloud size={20} />, color: "text-[#F26C4F]", bg: "bg-orange-50" },
            { label: "Retention", value: "30 days", sub: "Full backup retention", icon: <Calendar size={20} />, color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
              <div className={`w-9 h-9 rounded-lg ${item.bg} ${item.color} flex items-center justify-center mb-3`}>{item.icon}</div>
              <p className="text-[#1F2937] font-bold text-[22px] leading-none">{item.value}</p>
              <p className="text-[#6B7280] text-[12px] mt-1">{item.label}</p>
              <p className="text-[11px] text-[#9CA3AF] mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Storage Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-semibold text-[#1F2937]">Storage Usage</h3>
          <span className="text-[12px] text-[#6B7280]">142.6 GB / 500 GB used (28.5%)</span>
        </div>
        <div className="h-3 bg-[#F4F5F7] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#F26C4F] to-[#F8B179] rounded-full" style={{ width: "28.5%" }} />
        </div>
        <div className="flex items-center gap-4 mt-3 text-[12px] text-[#6B7280]">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F26C4F]" />Full backups: 120 GB</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F8B179]" />Incrementals: 22.6 GB</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#E5E7EB]" />Free: 357.4 GB</span>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Backup Now", icon: <Cloud size={18} />, action: handleBackupNow, primary: true },
          { label: "Configure Schedule", icon: <Calendar size={18} />, action: () => setScheduleOpen(true) },
          { label: "View History", icon: <History size={18} />, action: () => setHistoryOpen(true) },
          { label: "Restore Backup", icon: <RotateCcw size={18} />, action: () => showToast("Select a backup to restore") },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={btn.action}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors ${btn.primary ? "bg-[#F26C4F] border-[#F26C4F] text-white hover:bg-[#E05A3E]" : "bg-white border-[#E5E7EB] text-[#1F2937] hover:bg-[#F4F5F7]"}`}
          >
            {btn.icon}
            <span className="text-[13px] font-medium">{btn.label}</span>
          </button>
        ))}
      </div>

      {/* Schedule Modal */}
      <Modal open={scheduleOpen} onClose={() => setScheduleOpen(false)} title="Configure Backup Schedule" onSave={() => { setScheduleOpen(false); showToast("Schedule updated"); }} saveLabel="Save Schedule">
        <div className="space-y-4">
          <div><label className="block text-[12px] font-medium text-[#6B7280] mb-1">Backup Frequency</label>
            <select className={inputCls}><option>Every 12 hours</option><option>Every 6 hours</option><option>Daily</option><option>Weekly</option></select>
          </div>
          <div><label className="block text-[12px] font-medium text-[#6B7280] mb-1">Full Backup Schedule</label>
            <select className={inputCls}><option>Daily at 02:00 AM</option><option>Weekly on Sunday</option><option>Monthly on 1st</option></select>
          </div>
          <div><label className="block text-[12px] font-medium text-[#6B7280] mb-1">Retention Period</label>
            <select className={inputCls}><option>30 days</option><option>60 days</option><option>90 days</option><option>1 year</option></select>
          </div>
          <div><label className="block text-[12px] font-medium text-[#6B7280] mb-1">Notification Email</label>
            <input className={inputCls} defaultValue="admin@revalo.com" type="email" /></div>
        </div>
      </Modal>

      {/* History Modal */}
      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} title="Backup History" size="md">
        <div className="space-y-2">
          {backupHistory.map((b) => (
            <div key={b.id} className="flex items-center justify-between py-2.5 border-b border-[#F4F5F7] last:border-0">
              <div className="flex items-center gap-3">
                <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-[13px] font-medium text-[#1F2937]">{b.label}</p>
                  <p className="text-[11px] text-[#6B7280]">{b.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[12px] font-medium text-[#1F2937]">{b.size}</p>
                <button className="text-[11px] text-[#F26C4F] hover:underline">Restore</button>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
