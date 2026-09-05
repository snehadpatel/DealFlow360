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
    <div className="min-h-screen bg-surface-app text-text-primary flex flex-col font-sans">
      {/* Top Customer Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-surface-border px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-card">
        {/* Left: Brand Logo & Mobile Toggle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-btn text-text-secondary hover:text-text-primary hover:bg-gray-100 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavClick('dashboard')}>
            <div className="h-9 w-9 rounded-card bg-primary-50 border border-primary-200 flex items-center justify-center font-extrabold text-primary-500">
              DF
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-text-primary leading-tight">
                DealFlow<span className="text-primary-500">360</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-primary-500">
                Customer Portal
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
              className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded-btn transition-colors focus:outline-none"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full ring-2 ring-white" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-surface-border rounded-card shadow-card-hover z-50 py-2">
                <div className="px-4 py-2 border-b border-surface-border flex justify-between items-center">
                  <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Notifications</span>
                  <span className="text-[10px] bg-primary-50 text-primary-600 px-2 py-0.5 rounded-pill font-semibold">
                    1 New
                  </span>
                </div>
                <div className="divide-y divide-surface-border max-h-64 overflow-y-auto">
                  {sampleNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (n.quoteId) handleNavClick('quotations');
                        setNotificationsOpen(false);
                      }}
                      className={`p-3 text-xs hover:bg-gray-50 cursor-pointer transition-colors ${
                        n.unread ? 'bg-primary-50/40' : ''
                      }`}
                    >
                      <div className="font-semibold text-text-primary">{n.title}</div>
                      <div className="text-text-secondary text-[11px] mt-0.5">{n.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Customer Company & Profile */}
          <div className="hidden sm:flex items-center space-x-3 px-3 py-1.5 bg-gray-50 border border-surface-border rounded-card">
            <div className="p-1.5 rounded-btn bg-primary-50 text-primary-500">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="text-left text-xs">
              <div className="font-bold text-text-primary leading-snug">{user?.name || 'Acme Corp'}</div>
              <div className="text-[10px] text-text-secondary">Customer Portal</div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center space-x-1.5 text-xs text-danger-500 hover:text-danger-600 px-3 py-2 rounded-btn border border-danger-100 hover:bg-danger-50 transition-colors font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-surface-border p-4 space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold text-text-secondary uppercase tracking-wider">
            Customer Menu
          </div>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-btn text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-btn font-semibold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-text-secondary'}`} />
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
            <div className="relative flex-1 max-w-xs w-full bg-white border-r border-surface-border p-4 flex flex-col space-y-2 z-10">
              <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-2">
                <div className="text-xs font-bold text-text-primary uppercase tracking-wider">Customer Portal Menu</div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-btn text-text-secondary hover:text-text-primary"
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
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-btn text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary-500 text-white shadow-btn font-semibold'
                        : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-text-secondary'}`} />
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
