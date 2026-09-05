import React, { useState } from "react";
import Sidebar from "../components/admin/layout/Sidebar";
import Header from "../components/admin/layout/Header";
import Dashboard from "../components/admin/views/Dashboard";
import Customers from "../components/admin/views/Customers";
import Products from "../components/admin/views/Products";
import Pricing from "../components/admin/views/Pricing";
import Discounts from "../components/admin/views/Discounts";
import Warehouses from "../components/admin/views/Warehouses";
import SubscriptionPlans from "../components/admin/views/SubscriptionPlans";
import CustomerTiers from "../components/admin/views/CustomerTiers";
import PremiumSupport from "../components/admin/views/PremiumSupport";
import MaintenancePlans from "../components/admin/views/MaintenancePlans";
import Users from "../components/admin/views/Users";
import RolesPermissions from "../components/admin/views/RolesPermissions";
import AuditLogs from "../components/admin/views/AuditLogs";
import DealHealth from "../components/admin/views/DealHealth";
import AIInsights from "../components/admin/views/AIInsights";
import Analytics from "../components/admin/views/Analytics";
import AdminProfile from "../components/admin/views/AdminProfile";
import AdminSettings from "../components/admin/views/AdminSettings";

type Props = {
  onExitAdmin?: () => void;
};

function ViewRouter({ view, onNavigate }: { view: string; onNavigate: (v: string) => void }) {
  switch (view) {
    case "dashboard": return <Dashboard onNavigate={onNavigate} />;
    case "customers": return <Customers />;
    case "products": return <Products />;
    case "pricing": return <Pricing />;
    case "discounts": return <Discounts />;
    case "warehouses": return <Warehouses />;
    case "subscriptions": return <SubscriptionPlans />;
    case "tiers": return <CustomerTiers />;
    case "support": return <PremiumSupport />;
    case "maintenance": return <MaintenancePlans />;
    case "users": return <Users />;
    case "roles": return <RolesPermissions />;
    case "audit": return <AuditLogs />;
    case "dealhealth": return <DealHealth />;
    case "aiinsights": return <AIInsights />;
    case "analytics": return <Analytics />;
    case "profile": return <AdminProfile />;
    case "settings": return <AdminSettings />;
    default: return <Dashboard onNavigate={onNavigate} />;
  }
}

export default function AdminDashboard({ onExitAdmin }: Props) {
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function handleNavigate(view: string) {
    setActiveView(view);
    window.scrollTo(0, 0);
  }

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] font-[Inter,sans-serif] text-[#1F2937]">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#1F2937] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2 animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Admin Sidebar — No Sign Out or Back To App at bottom */}
      <Sidebar
        activeView={activeView}
        onNavigate={handleNavigate}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:ml-[240px] flex flex-col min-h-screen">
        {/* Top Header — Clean breadcrumb, Notifications & Working Sign Out */}
        <Header
          activeView={activeView}
          onNavigate={handleNavigate}
          onMenuToggle={() => setSidebarOpen(true)}
          onShowToast={showToast}
        />

        {/* View Router Main Area */}
        <main className="flex-1 pt-[64px]">
          <div className="p-6 max-w-[1200px] mx-auto">
            <ViewRouter view={activeView} onNavigate={handleNavigate} />
          </div>
        </main>
      </div>
    </div>
  );
}
