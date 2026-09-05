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
    <div className="min-h-screen bg-appBg text-textPrimary flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-md">
        {/* Left: Brand Logo & Mobile Toggle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-textSecondary hover:text-textPrimary hover:bg-gray-100 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavClick('dashboard')}>
            <div className="h-9 w-9 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center font-extrabold text-brand-500">
              DF
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-textPrimary leading-tight">
                DealFlow<span className="text-brand-500">360</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-brand-500">
                Sales Workspace
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 text-textSecondary hover:text-textPrimary hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-md-hover z-50 py-2">
                <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-textPrimary uppercase tracking-wider">Notifications</span>
                  <span className="text-[10px] bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full font-semibold">
                    2 New
                  </span>
                </div>
                <div className="divide-y divide-surface-border max-h-64 overflow-y-auto">
                  {sampleNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        handleNavClick('quotations');
                        setNotificationsOpen(false);
                      }}
                      className={`p-3 text-xs hover:bg-gray-50 cursor-pointer transition-colors ${
                        n.unread ? 'bg-brand-50/40' : ''
                      }`}
                    >
                      <div className="font-semibold text-textPrimary">{n.title}</div>
                      <div className="text-textSecondary text-[11px] mt-0.5">{n.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="hidden sm:flex items-center space-x-3 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-2xl">
            <div className="p-1.5 rounded-lg bg-brand-50 text-brand-500">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left text-xs">
              <div className="font-bold text-textPrimary leading-snug">{user?.name || 'Sales Rep'}</div>
              <div className="text-[10px] text-textSecondary">Direct Sales</div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center space-x-1.5 text-xs text-danger-500 hover:text-danger-600 px-3 py-2 rounded-lg border border-danger-100 hover:bg-danger-50 transition-colors font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
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

        {/* Main Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
