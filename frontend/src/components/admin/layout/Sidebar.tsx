import React from "react";
import {
  LayoutDashboard,
  Users,
  Package,
  Tag,
  Percent,
  Warehouse,
  CreditCard,
  Award,
  Headphones,
  Wrench,
  UserCog,
  ShieldCheck,
  FileText,
  Activity,
  Sparkles,
  BarChart3,
  X,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: "OVERVIEW",
    items: [{ id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> }],
  },
  {
    title: "MANAGEMENT",
    items: [
      { id: "customers", label: "Customers", icon: <Users size={18} /> },
      { id: "products", label: "Products", icon: <Package size={18} /> },
      { id: "pricing", label: "Pricing", icon: <Tag size={18} /> },
      { id: "discounts", label: "Discounts & Approvals", icon: <Percent size={18} /> },
      { id: "warehouses", label: "Warehouses", icon: <Warehouse size={18} /> },
    ],
  },
  {
    title: "COMMERCIAL",
    items: [
      { id: "subscriptions", label: "Subscription Plans", icon: <CreditCard size={18} /> },
      { id: "tiers", label: "Customer Tiers", icon: <Award size={18} /> },
      { id: "support", label: "Premium Support", icon: <Headphones size={18} /> },
      { id: "maintenance", label: "Maintenance Plans", icon: <Wrench size={18} /> },
    ],
  },
  {
    title: "ACCESS",
    items: [
      { id: "users", label: "Users & Roles", icon: <UserCog size={18} /> },
      { id: "roles", label: "Permissions", icon: <ShieldCheck size={18} /> },
      { id: "audit", label: "Audit Logs", icon: <FileText size={18} /> },
    ],
  },
  {
    title: "INTELLIGENCE",
    items: [
      { id: "dealhealth", label: "Deal Health", icon: <Activity size={18} /> },
      { id: "aiinsights", label: "AI Insights", icon: <Sparkles size={18} /> },
    ],
  },
  {
    title: "REPORTING",
    items: [
      { id: "analytics", label: "Reports & Analytics", icon: <BarChart3 size={18} /> },
    ],
  },
];

type Props = {
  activeView: string;
  onNavigate: (view: string) => void;
  mobileOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ activeView, onNavigate, mobileOpen, onClose }: Props) {
  const { user } = useAuth();

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "SA";

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-[240px] bg-white border-r border-[#E5E7EB] z-40 flex flex-col transition-transform duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-[#FEECE8] border border-[#F26C4F]/30 flex items-center justify-center font-bold text-[#F26C4F] text-xs shadow-xs">
              DF
            </div>
            <div>
              <span className="text-[#1F2937] font-bold text-base tracking-tight block leading-tight">
                DealFlow<span className="text-[#F26C4F]">360</span>
              </span>
              <span className="text-[10px] text-[#9CA3AF] font-medium tracking-wide uppercase">
                Admin Console
              </span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-[#6B7280] hover:text-[#1F2937]">
            <X size={18} />
          </button>
        </div>

        {/* Super Admin User Card */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#E5E7EB] bg-[#FAFBFD]">
          <div className="w-9 h-9 rounded-full bg-[#F26C4F] flex items-center justify-center flex-shrink-0 shadow-xs">
            <span className="text-white font-semibold text-sm">{userInitials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-[#1F2937] font-semibold text-xs truncate">{user?.name || "Super Admin"}</p>
            <p className="text-[#6B7280] text-[11px] truncate">{user?.email || "admin@revalo.com"}</p>
          </div>
        </div>

        {/* Nav Groups */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 scrollbar-thin">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-4">
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider px-3 mb-1.5">
                {group.title}
              </p>
              {group.items.map((item) => {
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onNavigate(item.id); onClose(); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all mb-0.5
                      ${isActive
                        ? "text-white shadow-xs bg-[#F26C4F]"
                        : "text-[#4B5563] hover:bg-gray-100 hover:text-[#1F2937]"
                      }`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span className="truncate flex-1 text-left">{item.label}</span>
                    {isActive && <ChevronRight size={14} className="ml-auto flex-shrink-0 opacity-80" />}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
