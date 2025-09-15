import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Package, ShoppingCart, FileText, Settings,
  LogOut, Menu, X, ChevronDown, ChevronRight, Bell, Search,
  BarChart3, Truck, Palette, UserCog, Store, CreditCard,
  MessageSquare, Calendar, HelpCircle, Moon, Sun, User, UserCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApplicationStats } from '../../hooks/useApplicationStats';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isDarkMode, setDarkMode] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { stats: applicationStats } = useApplicationStats();

  // Menu items configuration
  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
      badge: null
    },
    {
      title: 'Employees',
      icon: Users,
      path: '/admin/employees'
    },
    {
      title: 'Products',
      icon: Package,
      path: '/admin/products',
      badge: '234',
      subMenu: [
        { title: 'All Products', path: '/admin/products' },
        { title: 'Categories', path: '/admin/categories' },
        { title: 'Inventory Management', path: '/admin/inventory' }
      ]
    },
    {
      title: 'Inventory',
      icon: Package,
      path: '/admin/inventory',
      badge: null
    },
    {
      title: 'Suppliers',
      icon: Truck,
      path: '/admin/suppliers',
      subMenu: [
        { title: 'All Suppliers', path: '/admin/suppliers' },
        { title: 'Supplier Applications', path: '/admin/supplier-applications' },
        { title: 'Supplier Responses', path: '/admin/reorder-responses' }
      ]
    },
    {
      title: 'Applications',
      icon: UserCheck,
      path: '/admin/supplier-applications',
      badge: applicationStats.pending > 0 ? applicationStats.pending.toString() : null,
      badgeColor: applicationStats.pending > 0 ? 'bg-orange-500' : null
    },
    {
      title: 'Interior Designers',
      icon: Palette,
      path: '/admin/designers'
    },
    {
      title: 'Settings',
      icon: Settings,
      path: '/admin/settings',
      subMenu: [
        { title: 'General Settings', path: '/admin/settings/general' },
        { title: 'Store Settings', path: '/admin/settings/store' },
        { title: 'Email Templates', path: '/admin/settings/emails' },
        { title: 'API Keys', path: '/admin/settings/api' }
      ]
    }
  ];

  const toggleMenu = (menuTitle) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuTitle]: !prev[menuTitle]
    }));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;
  const isParentActive = (item) => {
    if (item.subMenu) {
      return item.subMenu.some(sub => location.pathname === sub.path);
    }
    return location.pathname === item.path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Desktop Menu Toggle */}
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl hidden sm:block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AdminPanel
              </span>
            </Link>
          </div>

          {/* Center Section - Search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!isDarkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Help */}
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors hidden sm:block">
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role || 'Administrator'}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200/50 py-2 animate-fade-in">
                  <Link
                    to="/admin/profile"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">My Profile</span>
                  </Link>
                  <Link
                    to="/admin/settings"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <Settings className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Settings</span>
                  </Link>
                  <hr className="my-2 border-gray-200" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white backdrop-blur-xl border-r border-gray-100 transition-all duration-500 ease-out z-30 shadow-xl ${
        isSidebarOpen ? 'w-72' : 'w-20'
      } ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Decorative gradient border */}
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>
        
        {/* Decorative top gradient - very subtle */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-50/30 to-transparent pointer-events-none"></div>
        
        <div className="h-full overflow-y-auto py-6 custom-scrollbar">
          <nav className="space-y-2 px-4">
            {menuItems.map((item, index) => (
              <div key={item.title} className="relative">
                {/* Add separator for specific sections */}
                {item.title === 'Settings' && isSidebarOpen && (
                  <div className="flex items-center gap-3 px-3 pt-4 pb-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      System
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (item.subMenu) {
                      toggleMenu(item.title);
                    } else {
                      navigate(item.path);
                      setMobileSidebarOpen(false);
                    }
                  }}
                  className={`w-full relative flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group overflow-hidden ${
                    isParentActive(item)
                      ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20 scale-[1.02]'
                      : 'hover:bg-gray-50 text-gray-700 hover:shadow-md border border-transparent hover:border-gray-100'
                  }`}
                >
                  {/* Animated background effect */}
                  {isParentActive(item) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
                  )}
                  
                  {/* Hover effect gradient - removed for cleaner look */}

                  <div className="relative flex items-center gap-3">
                    <div className={`relative p-2 rounded-xl transition-all duration-300 ${
                      isParentActive(item) 
                        ? 'bg-white/20 shadow-md' 
                        : 'bg-white group-hover:bg-gray-50 border border-gray-100'
                    }`}>
                      <item.icon className={`w-5 h-5 transition-all duration-300 ${
                        isParentActive(item) 
                          ? 'text-white' 
                          : 'text-gray-600 group-hover:text-blue-600 group-hover:scale-110'
                      }`} />
                    </div>
                    {isSidebarOpen && (
                      <div>
                        <span className={`text-sm font-semibold transition-all duration-300 ${
                          isParentActive(item) ? '' : 'group-hover:text-gray-900'
                        }`}>
                          {item.title}
                        </span>
                        {!item.subMenu && !isParentActive(item) && (
                          <p className="text-xs text-gray-500 mt-0.5 group-hover:text-gray-600 transition-colors">
                            Quick access
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="relative flex items-center gap-2">
                    {item.badge && isSidebarOpen && (
                      <span className={`relative px-2.5 py-1 text-xs font-bold rounded-full transition-all duration-300 ${
                        item.badgeColor 
                          ? item.badgeColor + ' text-white shadow-md animate-pulse' 
                          : isParentActive(item) 
                            ? 'bg-white/30 text-white' 
                            : 'bg-gray-100 text-gray-700 group-hover:bg-gray-200'
                      }`}>
                        {item.badge}
                        {item.badgeColor && (
                          <span className="absolute inset-0 rounded-full animate-ping opacity-30 bg-current"></span>
                        )}
                      </span>
                    )}
                    {item.subMenu && isSidebarOpen && (
                      <div className={`p-1 rounded-lg transition-all duration-300 ${
                        isParentActive(item) ? 'bg-white/20' : 'group-hover:bg-gray-200'
                      }`}>
                        <ChevronRight className={`w-4 h-4 transition-all duration-300 ${
                          expandedMenus[item.title] ? 'rotate-90 scale-110' : ''
                        }`} />
                      </div>
                    )}
                  </div>

                  {/* Tooltip for collapsed sidebar */}
                  {!isSidebarOpen && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                      {item.title}
                      {item.badge && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>

                {/* Submenu with enhanced styling */}
                {item.subMenu && expandedMenus[item.title] && isSidebarOpen && (
                  <div className="mt-2 ml-12 space-y-1 animate-slide-down">
                    {item.subMenu.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={`relative block px-4 py-2.5 text-sm rounded-xl transition-all duration-200 overflow-hidden group/sub ${
                          isActive(subItem.path)
                            ? 'bg-gray-100 text-blue-700 font-semibold'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:pl-5'
                        }`}
                      >
                        {/* Active indicator */}
                        {isActive(subItem.path) && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full"></div>
                        )}
                        
                        {/* Hover effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover/sub:from-blue-500/5 group-hover/sub:to-purple-500/5 transition-all duration-300"></div>
                        
                        <span className="relative flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                            isActive(subItem.path) 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                              : 'bg-gray-400 group-hover/sub:bg-blue-500 group-hover/sub:scale-125'
                          }`}></div>
                          {subItem.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Footer section with user info - only in expanded mode */}
          {isSidebarOpen && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-500 ${
        isSidebarOpen ? 'lg:ml-72' : 'lg:ml-20'
      } mt-16 p-4 lg:p-6`}>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;