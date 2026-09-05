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
  Cloud,
  BarChart3,
  X,
  ChevronRight,
} from "lucide-react";

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
      { id: "users", label: "Users & Managers", icon: <UserCog size={18} /> },
      { id: "roles", label: "Roles & Permissions", icon: <ShieldCheck size={18} /> },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { id: "backup", label: "Cloud Backup", icon: <Cloud size={18} /> },
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
        <div className="flex items-center justify-between px-5 py-5 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F26C4F] flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-[#1F2937] font-semibold text-base tracking-tight">Revalo</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-[#6B7280] hover:text-[#1F2937]">
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E5E7EB]">
          <div className="w-9 h-9 rounded-full bg-[#F26C4F] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">SA</span>
          </div>
          <div className="min-w-0">
            <p className="text-[#1F2937] font-medium text-sm truncate">Super Admin</p>
            <p className="text-[#6B7280] text-xs truncate">admin@revalo.com</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-4">
              <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider px-3 mb-1">
                {group.title}
              </p>
              {group.items.map((item) => {
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onNavigate(item.id); onClose(); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-full text-sm font-medium transition-all mb-0.5
                      ${isActive
                        ? "bg-[#F26C4F] text-white"
                        : "text-[#6B7280] hover:bg-[#F4F5F7] hover:text-[#1F2937]"
                      }`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                    {isActive && <ChevronRight size={14} className="ml-auto flex-shrink-0 opacity-70" />}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-[#E5E7EB]">
          <p className="text-[11px] text-[#9CA3AF]">Revalo Admin v2.4.1</p>
        </div>
      </aside>
    </>
  );
}
