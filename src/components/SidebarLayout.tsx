import React from 'react';
import { 
  LayoutDashboard, 
  Plug, 
  AlertTriangle, 
  CreditCard, 
  Users, 
  Activity,
  Search,
  Bell,
  Settings,
  User
} from 'lucide-react';
import { AppState } from '../types';

interface SidebarLayoutProps {
  currentPage: AppState['currentPage'];
  onPageChange: (page: AppState['currentPage']) => void;
  children: React.ReactNode;
}

export default function SidebarLayout({ currentPage, onPageChange, children }: SidebarLayoutProps) {
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'providers', label: 'Providers', icon: Plug },
    { id: 'budgets', label: 'Budgets & Alerts', icon: AlertTriangle },
    { id: 'billing', label: 'Billing & Usage', icon: CreditCard },
    { id: 'users', label: 'Users & Access', icon: Users },
    { id: 'monitoring', label: 'Monitoring & Health', icon: Activity },
  ] as const;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center mr-3">
              <div className="text-white text-lg font-bold">b</div>
            </div>
            <span className="text-xl font-semibold text-gray-900">bimo</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onPageChange(item.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-teal-600' : 'text-gray-400'}`} />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">John Doe</p>
              <p className="text-xs text-gray-500">john@startup.com</p>
            </div>
            <Settings className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-end">
            {/* Right side */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
