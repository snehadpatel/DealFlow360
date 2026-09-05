import { useState, useRef, useEffect } from "react";
import { Search, Bell, ChevronDown, Menu, User, Settings, LogOut, X } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const pageTitles: Record<string, { title: string; breadcrumb: string }> = {
  dashboard: { title: "Dashboard", breadcrumb: "Overview" },
  customers: { title: "Customers", breadcrumb: "Management" },
  products: { title: "Products", breadcrumb: "Management" },
  pricing: { title: "Pricing", breadcrumb: "Management" },
  discounts: { title: "Discounts & Approvals", breadcrumb: "Management" },
  warehouses: { title: "Warehouses", breadcrumb: "Management" },
  subscriptions: { title: "Subscription Plans", breadcrumb: "Commercial" },
  tiers: { title: "Customer Tiers", breadcrumb: "Commercial" },
  support: { title: "Premium Support", breadcrumb: "Commercial" },
  maintenance: { title: "Maintenance Plans", breadcrumb: "Commercial" },
  users: { title: "Users & Managers", breadcrumb: "Access" },
  roles: { title: "Roles & Permissions", breadcrumb: "Access" },
  backup: { title: "Cloud Backup", breadcrumb: "System" },
  analytics: { title: "Reports & Analytics", breadcrumb: "System" },
};

const notifications = [
  { id: 1, text: "New discount approval request from Priya Sharma", time: "2m ago", unread: true },
  { id: 2, text: "Cloud backup completed successfully", time: "15m ago", unread: true },
  { id: 3, text: "New customer Acme Corp registered", time: "1h ago", unread: false },
  { id: 4, text: "Subscription plan updated: Enterprise tier", time: "3h ago", unread: false },
];

type Props = {
  activeView: string;
  onMenuToggle: () => void;
  onExitAdmin?: () => void;
};

export default function Header({ activeView, onMenuToggle, onExitAdmin }: Props) {
  const { user, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const page = pageTitles[activeView] || { title: activeView, breadcrumb: "Admin" };
  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleSignOut = () => {
    setProfileOpen(false);
    if (onExitAdmin) {
      onExitAdmin();
    }
    logout();
  };

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "SA";

  return (
    <header className="fixed top-0 left-0 lg:left-[240px] right-0 h-[64px] bg-white border-b border-[#E5E7EB] z-20 flex items-center px-6 gap-4">
      <button onClick={onMenuToggle} className="lg:hidden text-[#6B7280] mr-1">
        <Menu size={20} />
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-[#6B7280]">
          DealFlow360 / <span className="text-[#F26C4F]">{page.breadcrumb}</span>
        </p>
        <h1 className="text-[#1F2937] font-semibold text-[15px] leading-tight truncate">{page.title}</h1>
      </div>

      <div className="flex items-center gap-1">
        {onExitAdmin && (
          <button
            onClick={onExitAdmin}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F5F7] hover:bg-[#E5E7EB] text-[#1F2937] text-xs font-medium rounded-lg transition-colors mr-2"
          >
            <LogOut size={14} className="text-[#6B7280] rotate-180" />
            Back to App
          </button>
        )}

        {searchOpen ? (
          <div className="flex items-center gap-2 bg-[#F4F5F7] rounded-lg px-3 py-1.5">
            <Search size={15} className="text-[#6B7280]" />
            <input
              autoFocus
              placeholder="Search..."
              className="bg-transparent outline-none text-sm text-[#1F2937] w-40"
              onBlur={() => setSearchOpen(false)}
            />
            <button onClick={() => setSearchOpen(false)}>
              <X size={13} className="text-[#6B7280]" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F4F5F7] text-[#6B7280] transition-colors"
          >
            <Search size={18} />
          </button>
        )}

        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F4F5F7] text-[#6B7280] transition-colors relative"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] bg-[#F26C4F] rounded-full" />
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl border border-[#E5E7EB] shadow-lg py-2 z-50">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#E5E7EB]">
                <p className="text-sm font-semibold text-[#1F2937]">Notifications</p>
                <span className="text-xs text-[#F26C4F] cursor-pointer hover:underline">Mark all read</span>
              </div>
              {notifications.map((n) => (
                <div key={n.id} className={`px-4 py-3 hover:bg-[#F4F5F7] cursor-pointer ${n.unread ? "bg-orange-50/50" : ""}`}>
                  <p className="text-[13px] text-[#1F2937] leading-snug">{n.text}</p>
                  <p className="text-[11px] text-[#6B7280] mt-0.5">{n.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div ref={profileRef} className="relative">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 rounded-lg hover:bg-[#F4F5F7] px-2 py-1 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#F26C4F] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-xs">{userInitials}</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[13px] font-medium text-[#1F2937]">{user?.name || "Super Admin"}</p>
            </div>
            <ChevronDown size={14} className="text-[#6B7280]" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-11 w-52 bg-white rounded-2xl border border-[#E5E7EB] shadow-lg py-1.5 z-50">
              <div className="px-4 py-2 border-b border-[#E5E7EB] mb-1">
                <p className="text-xs font-semibold text-[#1F2937] truncate">{user?.name || "Super Admin"}</p>
                <p className="text-[11px] text-[#6B7280] truncate">{user?.email || "admin@dealflow360.com"}</p>
                <span className="inline-block px-2 py-0.5 mt-1 text-[10px] font-semibold bg-[#FEECE8] text-[#F26C4F] rounded-full">
                  {user?.role || "ADMIN"}
                </span>
              </div>
              {[
                { icon: <User size={14} />, label: "Profile" },
                { icon: <Settings size={14} />, label: "Settings" },
              ].map((item) => (
                <button key={item.label} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[#1F2937] hover:bg-[#F4F5F7] text-left">
                  <span className="text-[#6B7280]">{item.icon}</span>
                  {item.label}
                </button>
              ))}
              {onExitAdmin && (
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    onExitAdmin();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[#1F2937] hover:bg-[#F4F5F7] text-left transition-colors"
                >
                  <LogOut size={14} className="text-[#6B7280] rotate-180" />
                  Back to App
                </button>
              )}
              <div className="border-t border-[#E5E7EB] mt-1.5 pt-1.5">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[#EF4444] hover:bg-red-50 transition-colors text-left font-medium"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
