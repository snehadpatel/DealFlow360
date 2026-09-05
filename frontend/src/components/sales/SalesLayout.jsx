import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Kanban,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  Target
} from 'lucide-react';

export default function SalesLayout({ activeTab, onTabChange, children }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'builder', label: 'Quotation Builder', icon: Target },
    { id: 'quotations', label: 'My Quotations', icon: FileText },
    { id: 'pipeline', label: 'Pipeline', icon: Kanban },
  ];

  const handleNavClick = (tabId) => {
    onTabChange(tabId);
    setMobileMenuOpen(false);
  };

  const sampleNotifications = [
    { id: 1, title: 'Approval Granted', time: '10 mins ago', quoteId: 'Q-1024', unread: true },
    { id: 2, title: 'Customer Negotiation', time: '1 hour ago', quoteId: 'Q-1042', unread: true },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md flex overflow-hidden min-h-[75vh]">
      {/* Top Header - Removed because App.jsx provides the global header */}

      {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 p-4 space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold text-textSecondary uppercase tracking-wider">
            Workspace
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
        </aside>

        {/* Mobile Slide-over Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/30"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex-1 max-w-xs w-full bg-white border-r border-gray-200 p-4 flex flex-col space-y-2 z-10">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-2">
                <div className="text-xs font-bold text-textPrimary uppercase tracking-wider">Sales Menu</div>
                <button
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

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto bg-gray-50/30">
          {children}
        </main>
    </div>
  );
}
