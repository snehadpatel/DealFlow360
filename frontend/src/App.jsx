import React, { useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import QuotationBuilder from "./pages/QuotationBuilder";
import ApprovalScreen from "./pages/ApprovalScreen";
import WarehouseSplitScreen from "./pages/WarehouseSplitScreen";
import SubscriptionBillingScreen from "./pages/SubscriptionBillingScreen";
import CustomerPortal from "./pages/CustomerPortal";
import DealHealthDashboard from "./pages/DealHealthDashboard";

export default function App() {
  const { user, logout, isAuthenticated } = useAuth();
  const [authView, setAuthView] = useState("login"); // "login" | "signup"
  const [activeTab, setActiveTab] = useState("quotation");

  // Google OAuth client ID (fallback mock client id if not configured)
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
    { id: "warehouse", label: "Warehouse Split", roles: ["FINANCE", "ADMIN"] },
    { id: "subscription", label: "Billing & Subscriptions", roles: ["REP", "FINANCE", "ADMIN"] },
    { id: "portal", label: "Customer Portal", roles: ["CUSTOMER", "ADMIN"] },
    { id: "dashboard", label: "Deal Health Dashboard", roles: ["REP", "MANAGER", "FINANCE", "ADMIN"] },
  ];

  const allowedTabs = tabs.filter((tab) => !user?.role || tab.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400">
            DF
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            DealFlow<span className="text-emerald-400">360</span>
          </span>
        </div>

        <nav className="flex items-center space-x-2">
          {allowedTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === tab.id
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-xs text-slate-300 font-semibold">{user?.name || "Demo User"}</div>
            <span className="inline-block px-2 py-0.5 text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
              {user?.role || "REP"}
            </span>
          </div>
          <button
            onClick={logout}
            className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded border border-rose-900/50 hover:bg-rose-950/40 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {activeTab === "quotation" && <QuotationBuilder />}
        {activeTab === "approval" && <ApprovalScreen />}
        {activeTab === "warehouse" && <WarehouseSplitScreen />}
        {activeTab === "subscription" && <SubscriptionBillingScreen />}
        {activeTab === "portal" && <CustomerPortal />}
        {activeTab === "dashboard" && <DealHealthDashboard />}
      </main>
    </div>
  );
}
