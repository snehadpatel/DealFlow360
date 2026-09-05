import { useState } from "react";
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
import CloudBackup from "../components/admin/views/CloudBackup";
import Analytics from "../components/admin/views/Analytics";

type View = string;

function ViewRouter({ view }: { view: View }) {
  switch (view) {
    case "dashboard": return <Dashboard />;
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
    case "backup": return <CloudBackup />;
    case "analytics": return <Analytics />;
    default: return <Dashboard />;
  }
}

export default function AdminDashboard({ onExitAdmin }: { onExitAdmin: () => void }) {
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleNavigate(view: string) {
    setActiveView(view);
    window.scrollTo(0, 0);
  }

  return (
    <div className="min-h-full bg-[#F4F5F7] font-[Inter,sans-serif]">
      <Sidebar
        activeView={activeView}
        onNavigate={handleNavigate}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="lg:ml-[240px] flex flex-col min-h-full">
        <Header activeView={activeView} onMenuToggle={() => setSidebarOpen(true)} onExitAdmin={onExitAdmin} />
        <main className="flex-1 pt-[64px]">
          <div className="p-6 max-w-[1200px]">
            <ViewRouter view={activeView} />
          </div>
        </main>
      </div>
    </div>
  );
}
