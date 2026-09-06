import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Receipt,
  CreditCard,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  Building2,
} from 'lucide-react';

export default function CustomerLayout({ activeTab, onTabChange, children }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'quotations', label: 'My Quotations', icon: FileText },
    { id: 'negotiations', label: 'Negotiations', icon: MessageSquare },
    { id: 'invoices', label: 'Invoices', icon: Receipt },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleNavClick = (tabId) => {
    onTabChange(tabId);
    setMobileMenuOpen(false);
  };

  const sampleNotifications = [
    { id: 1, title: 'Counter Offer Received', time: '10 mins ago', quoteId: 'Q-1045', unread: true },
    { id: 2, title: 'Negotiation Submitted', time: '1 hour ago', quoteId: 'Q-1042', unread: false },
    { id: 3, title: 'Invoice INV-2026-089 Issued', time: '2 days ago', unread: false },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md flex flex-col overflow-hidden min-h-[75vh]">
      {/* Top Customer Header - Removed because App.jsx provides the global header */}

      {/* Desktop Horizontal Navigation */}
      <nav className="hidden lg:flex items-center space-x-2 bg-gray-50 border-b border-gray-200 px-6 py-4 overflow-x-auto">
          <div className="pr-6 border-r border-gray-200 mr-4 text-[11px] font-bold text-textSecondary uppercase tracking-wider whitespace-nowrap">
            Customer Menu
          </div>
          <div className="premium-navbar-container">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`nav-item-wave flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    isActive ? 'active text-[#1F2937]' : 'text-textSecondary'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </span>
                  <i></i>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Mobile Slide-over Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 bg-black/30 w-full cursor-default"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex-1 max-w-xs w-full bg-white border-r border-gray-200 p-4 flex flex-col space-y-2 z-10">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-2">
                <div className="text-xs font-bold text-textPrimary uppercase tracking-wider">Customer Portal Menu</div>
                <button
                  aria-label="Close menu"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-textSecondary hover:text-textPrimary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-500 text-white shadow-btn font-semibold'
                        : 'text-textSecondary hover:text-textPrimary hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-textSecondary'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
    </div>
  );
}
