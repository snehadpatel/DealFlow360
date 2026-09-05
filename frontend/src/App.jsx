import React, { useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import QuotationBuilder from "./pages/QuotationBuilder";
import ApprovalScreen from "./pages/ApprovalScreen";
import FulfillmentScreen from "./pages/FulfillmentScreen";
import SubscriptionBillingScreen from "./pages/SubscriptionBillingScreen";
import BillingDetail from "./pages/BillingDetail";
import InvoicesScreen from "./pages/InvoicesScreen";
import CustomerPortal from "./pages/CustomerPortal";
import DealHealthDashboard from "./pages/DealHealthDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SalesWorkspace from "./pages/SalesWorkspace";
import ChatWidget from "./components/chat/ChatWidget";

export default function App() {
  const { user, logout, isAuthenticated } = useAuth();
  const [authView, setAuthView] = useState("login"); // "login" | "signup"
  const [activeTab, setActiveTab] = useState("quotation");
  const [selectedBillingId, setSelectedBillingId] = useState("BIL-2045");

  React.useEffect(() => {
    if (user?.role === 'CUSTOMER') {
      setActiveTab('cust_dashboard');
    } else if (user?.role === 'MANAGER' || user?.role === 'FINANCE') {
      setActiveTab('approval');
    } else if (user?.role === 'ADMIN') {
      setActiveTab('admin');
    } else {
      setActiveTab('quotation');
    }
  }, [user]);

  // Google OAuth client ID (fallback mock client id if not configured in env)
  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    "1083921839128-mockclientid.apps.googleusercontent.com";

  if (!isAuthenticated) {
    return (
      <GoogleOAuthProvider clientId={googleClientId}>
        {authView === "login" ? (
          <Login onNavigateToSignup={() => setAuthView("signup")} />
        ) : (
          <Signup onNavigateToLogin={() => setAuthView("login")} />
        )}
      </GoogleOAuthProvider>
    );
  }

  const baseTabs = [
    { id: "quotation", label: "Quotation Builder", roles: ["REP", "MANAGER", "FINANCE", "ADMIN"] },
    { id: "approval", label: "Approvals", roles: ["MANAGER", "FINANCE", "ADMIN"] },
    { id: "fulfillment", label: "Fulfillment & Stock", roles: ["FINANCE", "ADMIN"] },
    { id: "subscription", label: "Subscriptions", roles: ["REP", "FINANCE", "ADMIN"] },
    { id: "billing", label: "Billing Detail", roles: ["REP", "FINANCE", "ADMIN"] },
    { id: "invoices", label: "Invoices", roles: ["REP", "MANAGER", "FINANCE", "ADMIN"] },
    { id: "dashboard", label: "Deal Health Dashboard", roles: ["REP", "MANAGER", "FINANCE", "ADMIN"] },
    { id: "admin", label: "Admin Console", roles: ["ADMIN"] },
  ];

  const customerTabs = [
    { id: "cust_dashboard", label: "Dashboard", roles: ["CUSTOMER", "ADMIN"] },
    { id: "cust_quotations", label: "My Quotations", roles: ["CUSTOMER", "ADMIN"] },
    { id: "cust_negotiations", label: "Negotiations", roles: ["CUSTOMER", "ADMIN"] },
    { id: "cust_invoices", label: "Invoices", roles: ["CUSTOMER", "ADMIN"] },
    { id: "cust_subscriptions", label: "Subscriptions", roles: ["CUSTOMER", "ADMIN"] },
    { id: "cust_profile", label: "Profile", roles: ["CUSTOMER", "ADMIN"] },
  ];

  const isCustomerView = user?.role === 'CUSTOMER' || activeTab.startsWith('cust_');

  const allowedTabs = isCustomerView 
    ? customerTabs 
    : baseTabs.filter((tab) => !user?.role || tab.roles.includes(user.role));

  if (activeTab === "admin" || user?.role === "ADMIN") {
    return (
      <>
        <AdminDashboard />
        <ChatWidget activeTab="admin" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#1F2937] flex flex-col font-sans relative">
      {/* Top Navbar styled according to Revalo Design System */}
      <header className="border-b border-[#E5E7EB] bg-white px-6 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-[#FEECE8] border border-[#F26C4F]/30 flex items-center justify-center font-bold text-[#F26C4F]">
            DF
          </div>
          <span className="text-xl font-bold tracking-tight text-[#1F2937]">
            DealFlow<span className="text-[#F26C4F]">360</span>
          </span>
        </div>

        {/* Revalo Premium Nav Pills */}
        <nav className="premium-navbar-container overflow-x-auto max-w-2xl bg-[#F4F5F7] border border-slate-200/80 p-1">
          {allowedTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-item-wave px-4 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap ${
                  isActive ? "active" : "text-[#6B7280]"
                }`}
              >
                <span>{tab.label}</span>
                <i></i>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-xs text-[#1F2937] font-semibold">{user?.name || "Demo User"}</div>
            <span className="inline-block px-2.5 py-0.5 text-[10px] font-semibold bg-[#FEECE8] text-[#F26C4F] rounded-full">
              {user?.role || "REP"}
            </span>
          </div>
          {user?.role === "ADMIN" && (
            <button
              onClick={() => setActiveTab("admin")}
              className="text-xs text-white bg-[#F26C4F] hover:bg-[#E05535] px-3.5 py-1.5 rounded-full font-bold transition shadow-xs flex items-center gap-1"
            >
              ⚡ Admin Console
            </button>
          )}
          <button
            onClick={logout}
            className="text-xs text-[#EF4444] hover:text-[#DC2626] px-3 py-1 rounded-full border border-[#EF4444]/30 hover:bg-[#FEE2E2]/50 transition font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {activeTab === "quotation" && <QuotationBuilder />}
        {activeTab === "approval" && <ApprovalScreen />}
        {activeTab === "fulfillment" && <FulfillmentScreen />}
        {activeTab === "subscription" && <SubscriptionBillingScreen />}
        {activeTab === "billing" && (
          <BillingDetail
            billingId={selectedBillingId || "BIL-2045"}
            onBack={() => setActiveTab("subscription")}
          />
        )}
        {activeTab === "invoices" && (
          <InvoicesScreen
            onNavigateToQuotation={(qId) => setActiveTab("quotation")}
            onNavigateToBilling={() => setActiveTab("billing")}
          />
        )}
        {activeTab.startsWith("cust_") && (
          <CustomerPortal 
            activeTab={activeTab.replace('cust_', '')} 
            onTabChange={(tab) => setActiveTab(`cust_${tab}`)} 
          />
        )}
        {activeTab === "dashboard" && <DealHealthDashboard />}
      </main>

      {/* Floating AI Sales Assistant Chatbot */}
      <ChatWidget activeTab={activeTab} />
    </div>
  );
}
