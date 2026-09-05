import React, { useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import QuotationBuilder from "./pages/QuotationBuilder";
import ApprovalScreen from "./pages/ApprovalScreen";
import FulfillmentScreen from "./pages/FulfillmentScreen";
import SubscriptionBillingScreen from "./pages/SubscriptionBillingScreen";
import CustomerPortal from "./pages/CustomerPortal";
import DealHealthDashboard from "./pages/DealHealthDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SalesWorkspace from "./pages/SalesWorkspace";

export default function App() {
  const { user, logout, isAuthenticated } = useAuth();
  const [authView, setAuthView] = useState("login"); // "login" | "signup"
  const [activeTab, setActiveTab] = useState("quotation");

  React.useEffect(() => {
    if (user?.role === 'CUSTOMER') {
      setActiveTab('portal');
    } else if (user?.role === 'MANAGER' || user?.role === 'FINANCE') {
      setActiveTab('approval');
    } else if (user?.role === 'ADMIN') {
      setActiveTab('admin');
    } else {
      setActiveTab('quotation');
    }
  }, [user]);

  // Google OAuth client ID (fallback mock client id if not configured in env)
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "1083921839128-mockclientid.apps.googleusercontent.com";

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

  const tabs = [
    { id: "quotation", label: "Quotation Builder", roles: ["REP", "MANAGER", "ADMIN"] },
    { id: "approval", label: "Approvals", roles: ["MANAGER", "FINANCE", "ADMIN"] },
    { id: "fulfillment", label: "Fulfillment & Stock", roles: ["FINANCE", "ADMIN"] },
    { id: "subscription", label: "Billing & Subscriptions", roles: ["REP", "FINANCE", "ADMIN"] },
    { id: "portal", label: "Customer Portal", roles: ["CUSTOMER", "ADMIN"] },
    { id: "dashboard", label: "Deal Health Dashboard", roles: ["REP", "MANAGER", "FINANCE", "ADMIN"] },
  ];

  const allowedTabs = tabs.filter((tab) => !user?.role || tab.roles.includes(user.role));

  if (activeTab === "admin") {
    return <AdminDashboard onExitAdmin={() => setActiveTab("quotation")} />;
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#1F2937] flex flex-col font-sans">
      {/* Top Navbar styled according to Revalo Design System (Design.md) */}
      <header className="border-b border-[#E5E7EB] bg-white px-6 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-[#FEECE8] border border-[#F26C4F]/30 flex items-center justify-center font-bold text-[#F26C4F]">
            DF
          </div>
          <span className="text-xl font-bold tracking-tight text-[#1F2937]">
            DealFlow<span className="text-[#F26C4F]">360</span>
          </span>
        </div>

        {/* Revalo Nav Pills (Design.md Section 4.1: Active Nav Pill Primary Orange #F26C4F, Pill Shape) */}
        <nav className="flex items-center space-x-1.5 bg-[#F4F5F7] p-1 rounded-full border border-slate-200/80">
          {allowedTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 ${
                  isActive
                    ? "bg-[#F26C4F] text-white shadow-xs"
                    : "text-[#6B7280] hover:text-[#1F2937] hover:bg-white/60"
                }`}
              >
                {tab.label}
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
              className="text-xs text-white bg-[#F26C4F] hover:bg-[#E05535] px-3 py-1 rounded-full font-medium transition"
            >
              Admin Dashboard
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
        {activeTab === "portal" && <CustomerPortal />}
        {activeTab === "dashboard" && <DealHealthDashboard />}
      </main>
    </div>
  );
}
