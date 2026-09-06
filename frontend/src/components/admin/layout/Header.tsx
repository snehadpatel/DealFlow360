import React, { useState, useRef, useEffect } from "react";
import { Search, Bell, ChevronDown, Menu, User, Settings, LogOut, X, CheckCircle } from "lucide-react";
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
  users: { title: "Users & Roles", breadcrumb: "Access" },
  roles: { title: "Permissions", breadcrumb: "Access" },
  audit: { title: "Audit Logs", breadcrumb: "Access" },
  dealhealth: { title: "Deal Health", breadcrumb: "Intelligence" },
  aiinsights: { title: "AI Insights", breadcrumb: "Intelligence" },
  analytics: { title: "Reports & Analytics", breadcrumb: "Reporting" },
  profile: { title: "Admin Profile", breadcrumb: "Account" },
  settings: { title: "System Settings", breadcrumb: "Account" },
};

const initialNotifications = [
  { id: 1, text: "High-value quotation request (₹4.8L) pending approval", time: "2m ago", unread: true },
  { id: 2, text: "Discount threshold (25%) exceeded by Priya Sharma", time: "12m ago", unread: true },
  { id: 3, text: "Product SKU LAP-PRO-X1 low stock alert (3 units left)", time: "45m ago", unread: true },
  { id: 4, text: "Customer ABC Corp upgraded to Enterprise Tier", time: "2h ago", unread: false },
  { id: 5, text: "AI detected revenue slip risk on 3 active deals", time: "4h ago", unread: false },
];

type Props = {
  activeView: string;
  onNavigate: (view: string) => void;
  onMenuToggle: () => void;
  onShowToast: (message: string) => void;
};

export default function Header({ activeView, onNavigate, onMenuToggle, onShowToast }: Props) {
  const { user, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(initialNotifications);

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

  const page = pageTitles[activeView] || { title: activeView, breadcrumb: "Overview" };
  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleSignOut = () => {
    setProfileOpen(false);
    // Clear token & auth state
    logout();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    onShowToast("Signed out successfully.");
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
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
    <header className="fixed top-0 left-0 lg:left-[240px] right-0 h-[64px] bg-white border-b border-[#E5E7EB] z-20 flex items-center px-6 gap-4 shadow-xs">
      <button
        onClick={onMenuToggle}
        aria-label="Open navigation menu"
        className="lg:hidden text-[#6B7280] hover:text-[#1F2937] mr-1"
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumb Header */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-[#6B7280] flex items-center gap-1">
          <span>DealFlow360</span>
          <span className="text-[#D1D5DB]">/</span>
          <span className="text-[#F26C4F] font-semibold">{page.breadcrumb}</span>
        </p>
        <h1 className="text-[#1F2937] font-bold text-[16px] leading-tight truncate">{page.title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Search Field */}
        {searchOpen ? (
          <div className="flex items-center gap-2 bg-[#F4F5F7] rounded-xl px-3 py-1.5 border border-[#E5E7EB] transition-colors">
            <Search size={15} className="text-[#6B7280]" />
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers, deals, products..."
              className="bg-transparent outline-none text-xs text-[#1F2937] w-48 sm:w-64"
              aria-label="Search customers, deals, and products"
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  onNavigate("customers");
                  setSearchOpen(false);
                }
              }}
            />
            <button onClick={() => setSearchOpen(false)} aria-label="Close search">
              <X size={13} className="text-[#6B7280] hover:text-[#1F2937]" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F4F5F7] text-[#6B7280] hover:text-[#1F2937] transition-colors border border-transparent hover:border-[#E5E7EB]"
            aria-label="Open search"
          >
            <Search size={18} />
          </button>
        )}

        {/* Notifications Dropdown */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F4F5F7] text-[#6B7280] hover:text-[#1F2937] transition-colors relative border border-transparent hover:border-[#E5E7EB]"
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#F26C4F] rounded-full ring-2 ring-white" />
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl border border-[#E5E7EB] shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-[#1F2937]">Notifications</p>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#FEECE8] text-[#F26C4F] rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[11px] text-[#F26C4F] font-semibold hover:underline flex items-center gap-1">
                    <CheckCircle size={12} />
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-[#F4F5F7]">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 hover:bg-[#F4F5F7] cursor-pointer transition-colors ${
                      n.unread ? "bg-[#FFF8F6]" : ""
                    }`}
                  >
                    <p className="text-xs text-[#1F2937] leading-snug font-medium">{n.text}</p>
                    <p className="text-[10px] text-[#9CA3AF] mt-1">{n.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Super Admin Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 rounded-xl hover:bg-[#F4F5F7] p-1.5 border border-transparent hover:border-[#E5E7EB] transition-colors"
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
          >
            <div className="w-8 h-8 rounded-full bg-[#F26C4F] flex items-center justify-center flex-shrink-0 shadow-xs">
              <span className="text-white font-bold text-xs">{userInitials}</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-[#1F2937] leading-tight">{user?.name || "Super Admin"}</p>
              <p className="text-[10px] text-[#6B7280]">Admin</p>
            </div>
            <ChevronDown size={14} className="text-[#6B7280]" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl border border-[#E5E7EB] shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2.5 border-b border-[#E5E7EB] mb-1">
                <p className="text-xs font-bold text-[#1F2937] truncate">{user?.name || "Super Admin"}</p>
                <p className="text-[11px] text-[#6B7280] truncate">{user?.email || "admin@revalo.com"}</p>
                <span className="inline-block px-2 py-0.5 mt-1.5 text-[10px] font-bold bg-[#FEECE8] text-[#F26C4F] rounded-full">
                  SUPER ADMIN
                </span>
              </div>

              <button
                onClick={() => { onNavigate("profile"); setProfileOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#374151] hover:bg-[#F4F5F7] text-left transition-colors"
              >
                <User size={15} className="text-[#6B7280]" />
                Profile
              </button>

              <button
                onClick={() => { onNavigate("settings"); setProfileOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#374151] hover:bg-[#F4F5F7] text-left transition-colors"
              >
                <Settings size={15} className="text-[#6B7280]" />
                Settings
              </button>

              <div className="border-t border-[#E5E7EB] mt-1 pt-1">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-[#EF4444] hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut size={15} />
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
