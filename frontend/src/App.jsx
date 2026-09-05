import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Defined at module scope so they are created once, not on every render.
// If these were inside the component, React would create a new array object
// each render, breaking memoization for any child that receives them as props.
const BASE_TABS = [
  { id: "sales_workspace", label: "Sales Dashboard", roles: ["REP", "ADMIN"] },
  { id: "quotation", label: "Quotation Builder", roles: ["REP", "MANAGER", "FINANCE", "ADMIN"] },
  { id: "approval", label: "Approvals", roles: ["MANAGER", "FINANCE", "ADMIN"] },
  { id: "fulfillment", label: "Fulfillment & Stock", roles: ["FINANCE", "ADMIN", "OPERATIONS"] },
  { id: "subscription", label: "Subscriptions", roles: ["REP", "FINANCE", "ADMIN"] },
  { id: "billing", label: "Billing Detail", roles: ["REP", "FINANCE", "ADMIN"] },
  { id: "invoices", label: "Invoices", roles: ["REP", "MANAGER", "FINANCE", "ADMIN"] },
  { id: "dashboard", label: "Deal Health Dashboard", roles: ["REP", "MANAGER", "FINANCE", "ADMIN"] },
  { id: "admin", label: "Admin Console", roles: ["ADMIN"] },
];

const CUSTOMER_TABS = [
  { id: "cust_dashboard", label: "Dashboard", roles: ["CUSTOMER", "ADMIN"] },
  { id: "cust_quotations", label: "My Quotations", roles: ["CUSTOMER", "ADMIN"] },
  { id: "cust_negotiations", label: "Negotiations", roles: ["CUSTOMER", "ADMIN"] },
  { id: "cust_invoices", label: "Invoices", roles: ["CUSTOMER", "ADMIN"] },
  { id: "cust_subscriptions", label: "Subscriptions", roles: ["CUSTOMER", "ADMIN"] },
  { id: "cust_profile", label: "Profile", roles: ["CUSTOMER", "ADMIN"] },
];

/** Returns the default tab id for a given user role. */
function getDefaultTabForRole(role) {
  if (role === 'CUSTOMER') return 'cust_dashboard';
  if (role === 'MANAGER' || role === 'FINANCE') return 'approval';
  if (role === 'ADMIN') return 'admin';
  if (role === 'REP') return 'sales_workspace';
  return 'quotation';
}

/**
 * AppRouter — renders the correct screen for the current activeTab.
 * Extracted from App() to reduce its cyclomatic complexity. Each case here
 * is an independent branch; keeping them in App() made it score 20+.
 */
function AppRouter({ activeTab, setActiveTab, selectedBillingId }) {
  if (activeTab === "sales_workspace") return <SalesWorkspace />;
  if (activeTab === "quotation") return <QuotationBuilder />;
  if (activeTab === "approval") return <ApprovalScreen />;
  if (activeTab === "fulfillment") return <FulfillmentScreen />;
  if (activeTab === "subscription") return <SubscriptionBillingScreen />;
  if (activeTab === "billing") {
    return (
      <BillingDetail
        billingId={selectedBillingId || "BIL-2045"}
        onBack={() => setActiveTab("subscription")}
      />
    );
  }
  if (activeTab === "invoices") {
    return (
      <InvoicesScreen
        onNavigateToQuotation={() => setActiveTab("quotation")}
        onNavigateToBilling={() => setActiveTab("billing")}
      />
    );
  }
  if (activeTab.startsWith("cust_")) {
    return (
      <CustomerPortal
        activeTab={activeTab.replace('cust_', '')}
        onTabChange={(tab) => setActiveTab(`cust_${tab}`)}
      />
    );
  }
  if (activeTab === "dashboard") return <DealHealthDashboard />;
  return null;
}

export default function App() {
  const { user, logout, isAuthenticated } = useAuth();
  const [authView, setAuthView] = useState("login"); // "login" | "signup"
  const [activeTab, setActiveTab] = useState("quotation");
  const [selectedBillingId, setSelectedBillingId] = useState("BIL-2045");

  React.useEffect(() => {
    setActiveTab(getDefaultTabForRole(user?.role));
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

  if (activeTab === "admin") {
    return (
      <>
        <AdminDashboard />
        <ChatWidget activeTab="admin" />
      </>
    );
  }

  const isCustomerView = user?.role === 'CUSTOMER' || activeTab.startsWith('cust_');
  const allowedTabs = isCustomerView
    ? CUSTOMER_TABS
    : BASE_TABS.filter((tab) => !user?.role || tab.roles.includes(user.role));

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
        <nav className="premium-navbar-container overflow-x-auto custom-scrollbar max-w-full mx-4 bg-[#F4F5F7] border border-slate-200/80 p-1">
          {allowedTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-item-wave flex-shrink-0 px-4 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap ${
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
            aria-label="Log out of DealFlow360"
            className="text-xs text-[#EF4444] hover:text-[#DC2626] px-3 py-1 rounded-full border border-[#EF4444]/30 hover:bg-[#FEE2E2]/50 transition font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        <QueryClientProvider client={queryClient}>
          {/* AppRouter is a separate component to keep App()'s complexity low */}
          <AppRouter
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedBillingId={selectedBillingId}
          />
        </QueryClientProvider>
      </main>

      {/* Floating AI Sales Assistant Chatbot */}
      <ChatWidget activeTab={activeTab} />
    </div>
  );
}
