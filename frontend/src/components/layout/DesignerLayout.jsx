import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Palette, Briefcase, Image, Layers, Users, Calendar, MessageSquare,
  Settings, LogOut, Menu, X, Bell, Search, Sun, Moon, User,
  ChevronDown, Home, PenTool, Eye, Star, FolderOpen, Award,
  TrendingUp, Heart, Grid3x3, Coffee, Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const DesignerLayout = ({ children }) => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isDarkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('projects');

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Designer specific navigation
  const navigationTabs = [
    { id: 'projects', label: 'My Projects', icon: Briefcase, count: 12 },
    { id: 'gallery', label: 'Portfolio', icon: Image, count: 45 },
    { id: 'inspiration', label: 'Inspiration', icon: Sparkles },
    { id: 'clients', label: 'Clients', icon: Users, count: 8 },
    { id: 'resources', label: 'Resources', icon: FolderOpen }
  ];

  // Quick stats for designer
  const stats = [
    { label: 'Active Projects', value: '7', icon: Briefcase, color: 'from-purple-500 to-pink-500' },
    { label: 'Completed', value: '34', icon: Award, color: 'from-green-500 to-teal-500' },
    { label: 'Total Clients', value: '28', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'Rating', value: '4.9', icon: Star, color: 'from-yellow-500 to-orange-500' }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Creative Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-b border-purple-100">
        <div className="px-4 lg:px-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu */}
              <button
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-purple-50 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Logo */}
              <Link to="/designer/dashboard" className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur animate-pulse"></div>
                  <div className="relative w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Palette className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Design Studio
                  </h1>
                  <p className="text-xs text-gray-500">Creative Workspace</p>
                </div>
              </Link>
            </div>

            {/* Center Section - Search */}
            <div className="hidden md:flex flex-1 max-w-xl mx-4">
              <div className="relative w-full group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search projects, clients, inspirations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Quick Actions */}
              <button className="hidden sm:block p-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transition-all duration-300 hover:scale-105">
                <PenTool className="w-4 h-4" />
              </button>

              {/* Dark Mode */}
              <button
                onClick={() => setDarkMode(!isDarkMode)}
                className="p-2.5 rounded-xl hover:bg-purple-50 transition-colors"
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-purple-500" />}
              </button>

              {/* Notifications */}
              <button className="relative p-2.5 rounded-xl hover:bg-purple-50 transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></span>
              </button>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 p-2 rounded-2xl hover:bg-purple-50 transition-all duration-300"
                >
                  <div className="relative">
                    <div className="w-9 h-9 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-900">{user?.name || 'Designer'}</p>
                    <p className="text-xs text-purple-600">Interior Designer</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-purple-100 py-2 animate-fade-in">
                    <div className="px-4 py-3 border-b border-purple-50">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link
                      to="/designer/profile"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-purple-50 transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <User className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-700">My Profile</span>
                    </Link>
                    <Link
                      to="/designer/portfolio"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-purple-50 transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <Image className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-700">Portfolio</span>
                    </Link>
                    <Link
                      to="/designer/settings"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-purple-50 transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <Settings className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-700">Settings</span>
                    </Link>
                    <hr className="my-2 border-purple-50" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 px-2 py-2 overflow-x-auto">
            {navigationTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-200'
                    : 'hover:bg-purple-50 text-gray-600 hover:text-purple-600'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
                {tab.count && (
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id 
                      ? 'bg-white/20 text-white' 
                      : 'bg-purple-100 text-purple-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="fixed top-32 left-0 right-0 z-30 bg-white/80 backdrop-blur-md border-b border-purple-50">
        <div className="px-4 lg:px-6 py-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-gradient-to-r from-white to-purple-50 rounded-xl p-3 border border-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-48 pb-8 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Floating Action Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 group">
        <PenTool className="w-6 h-6" />
        <div className="absolute -top-12 right-0 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          New Design Project
        </div>
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-white shadow-2xl">
            <div className="p-4 border-b border-purple-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl hover:bg-purple-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <nav className="p-4 space-y-2">
              {navigationTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'hover:bg-purple-50 text-gray-700'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                  {tab.count && (
                    <span className={`ml-auto px-2 py-0.5 text-xs rounded-full ${
                      activeTab === tab.id 
                        ? 'bg-white/20 text-white' 
                        : 'bg-purple-100 text-purple-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
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

export default DesignerLayout;