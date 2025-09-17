import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, User, Palette, FileText, Image, MessageSquare, 
  Settings, LogOut, Menu, X, Bell, Search, BarChart3, Award,
  Users, Calendar, DollarSign, TrendingUp, Eye, Upload
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const DesignerLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Menu items configuration for designers
  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/designer/dashboard'
    },
    {
      title: 'Projects',
      icon: FileText,
      path: '/designer/projects',
      subMenu: [
        { title: 'All Projects', path: '/designer/projects' },
        { title: 'Active Projects', path: '/designer/projects/active' },
        { title: 'Completed Projects', path: '/designer/projects/completed' },
        { title: 'New Project', path: '/designer/projects/new' }
      ]
    },
    {
      title: 'My Designs',
      icon: Image,
      path: '/designer/designs',
      subMenu: [
        { title: 'All Designs', path: '/designer/designs' },
        { title: 'Add New Design', path: '/designer/designs/new' },
        { title: 'Published Designs', path: '/designer/designs?filter=published' },
        { title: 'Draft Designs', path: '/designer/designs?filter=draft' }
      ]
    },
    {
      title: 'Clients',
      icon: Users,
      path: '/designer/clients'
    },
    {
      title: 'Messages',
      icon: MessageSquare,
      path: '/designer/messages',
      badge: '3'
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      path: '/designer/analytics'
    },
    {
      title: 'Calendar',
      icon: Calendar,
      path: '/designer/calendar'
    },
    {
      title: 'Earnings',
      icon: DollarSign,
      path: '/designer/earnings'
    },
    {
      title: 'Profile',
      icon: User,
      path: '/designer/profile'
    },
    {
      title: 'Settings',
      icon: Settings,
      path: '/designer/settings'
    }
  ];

  const toggleMenu = (title) => {
    setExpandedMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => {
    if (path === '/designer/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#9c7c38] rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Designer Hub</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col h-full">
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <div key={item.title}>
                <Link
                  to={item.path}
                  onClick={() => {
                    if (item.subMenu) {
                      toggleMenu(item.title);
                    }
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-[#9c7c38] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {item.subMenu && (
                      <div className="w-4 h-4">
                        {expandedMenus[item.title] ? (
                          <Menu className="w-4 h-4" />
                        ) : (
                          <Menu className="w-4 h-4" />
                        )}
                      </div>
                    )}
                  </div>
                </Link>

                {/* Submenu */}
                {item.subMenu && expandedMenus[item.title] && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.subMenu.map((subItem) => (
                      <Link
                        key={subItem.title}
                        to={subItem.path}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                          isActive(subItem.path)
                            ? 'bg-[#9c7c38]/10 text-[#9c7c38] font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* User profile section */}
          <div className="border-t border-gray-200 p-4">
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center w-full p-3 text-left rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-[#9c7c38] rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'D'}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || 'Designer'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    Interior Designer
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <Menu className="w-4 h-4 text-gray-400" />
                </div>
              </button>

              {/* Profile dropdown */}
              {isProfileDropdownOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                  <Link
                    to="/designer/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <User className="w-4 h-4 mr-3" />
                    Profile
                  </Link>
                  <Link
                    to="/designer/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Search bar */}
              <div className="flex-1 max-w-lg mx-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search projects, clients..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c7c38] focus:border-[#9c7c38] text-sm"
                  />
                </div>
              </div>

              {/* Right side actions */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Quick actions */}
                <div className="hidden md:flex items-center space-x-2">
                  <button className="flex items-center space-x-2 px-3 py-2 bg-[#9c7c38] text-white rounded-lg hover:bg-[#8a6d32] transition-colors text-sm">
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                  </button>
                  <button className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    <Eye className="w-4 h-4" />
                    <span>Preview</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DesignerLayout;