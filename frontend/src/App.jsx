import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from "./pages/Signup";
import QuotationBuilder from './pages/QuotationBuilder';
import ApprovalScreen from './pages/ApprovalScreen';
import WarehouseSplitScreen from './pages/WarehouseSplitScreen';
import SubscriptionBillingScreen from './pages/SubscriptionBillingScreen';
import CustomerPortal from './pages/CustomerPortal';
import DealHealthDashboard from './pages/DealHealthDashboard';
import SalesWorkspace from './pages/SalesWorkspace';

export default function App() {
  const { user, logout, isAuthenticated } = useAuth();
  const [authView, setAuthView] = useState("login"); // "login" | "signup"
  const [activeTab, setActiveTab] = useState("quotation");

  // Google OAuth client ID (fallback mock client id if not configured)
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "1083921839128-mockclientid.apps.googleusercontent.com";

  useEffect(() => {
    if (user?.role === 'CUSTOMER') {
      setActiveTab('portal');
    } else if (user?.role === 'MANAGER' || user?.role === 'FINANCE') {
      setActiveTab('approval');
    } else {
      setActiveTab('quotation');
    }
  }, [user]);

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

  // Pure customer role gets restricted customer portal layout
  if (user?.role === 'CUSTOMER') {
    return <CustomerPortal />;
  }

  // Pure rep role gets the dedicated Sales Workspace
  if (user?.role === 'REP') {
    return <SalesWorkspace />;
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
    <div className="min-h-screen bg-surface-app text-text-primary flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-surface-border bg-white px-6 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-card">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-btn bg-primary-50 border border-primary-200 flex items-center justify-center font-bold text-primary-500">
            DF
          </div>
          <span className="text-xl font-bold tracking-tight text-text-primary">
            DealFlow<span className="text-primary-500">360</span>
          </span>
        </div>

        <nav className="flex items-center space-x-1 bg-gray-100 p-1 rounded-pill">
          {allowedTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 text-sm font-medium rounded-pill transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white shadow-btn'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-xs font-medium text-text-primary">{user?.name || 'Demo User'}</div>
            <span className="inline-block px-2 py-0.5 text-[10px] font-semibold bg-primary-50 text-primary-600 border border-primary-200 rounded-pill">
              {user?.role || 'REP'}
            </span>
          </div>
          <button
            onClick={logout}
            className="text-xs text-danger-500 hover:text-danger-600 px-3 py-1.5 rounded-btn border border-danger-100 hover:bg-danger-50 font-medium transition"
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
