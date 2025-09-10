import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  Package, 
  ShoppingCart,
  Truck,
  FileText,
  Settings,
  LogOut,
  User,
  Bell,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const SupplierLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/supplier/dashboard',
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: 'Reorder Requests',
      path: '/supplier/requests',
      icon: <ShoppingCart className="h-5 w-5" />,
    },
    {
      title: 'My Products',
      path: '/supplier/products',
      icon: <Package className="h-5 w-5" />,
    },
    {
      title: 'Deliveries',
      path: '/supplier/deliveries',
      icon: <Truck className="h-5 w-5" />,
    },
    {
      title: 'Reports',
      path: '/supplier/reports',
      icon: <FileText className="h-5 w-5" />,
    },
  ];

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 fixed w-full top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and Menu Button */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none lg:hidden"
              >
                {sidebarOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              <Link to="/supplier/dashboard" className="flex items-center ml-4 lg:ml-0">
                <Package className="h-8 w-8 text-green-600" />
                <span className="ml-2 text-xl font-semibold text-gray-900">
                  Supplier Portal
                </span>
              </Link>
            </div>

            {/* Right side - Notifications and Profile */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative text-gray-500 hover:text-gray-700">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium">{user?.name || 'Supplier'}</p>
                      <p className="text-xs text-gray-500">Supplier</p>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                {/* Dropdown Menu */}
                {profileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/supplier/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileDropdown(false)}
                    >
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </div>
                    </Link>
                    <Link
                      to="/supplier/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileDropdown(false)}
                    >
                      <div className="flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </div>
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block fixed left-0 top-16 h-full w-64 bg-white border-r border-gray-200 z-30">
        <nav className="mt-5 px-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center px-3 py-2 mt-1 text-sm font-medium rounded-md transition-colors ${
                isActivePath(item.path)
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span
                className={`mr-3 ${
                  isActivePath(item.path) ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {item.icon}
              </span>
              {item.title}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setSidebarOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 px-2 space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActivePath(item.path)
                        ? 'bg-green-50 text-green-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span
                      className={`mr-3 ${
                        isActivePath(item.path) ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {item.icon}
                    </span>
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default SupplierLayout;