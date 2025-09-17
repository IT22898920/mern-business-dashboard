import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Settings, 
  BarChart3, 
  Package, 
  Users, 
  PaintBucket,
  LogOut,
  Bell,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Eye
} from 'lucide-react';
import Button from '../components/ui/Button';
import RoleBasedAccess from '../components/auth/RoleBasedAccess';
import AdminLayout from '../components/layout/AdminLayout';
import DesignerLayout from '../components/layout/DesignerLayout';

const Dashboard = () => {
  const { user, logout, isAdmin, isStaff } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const roleConfig = {
    user: {
      title: 'Customer Dashboard',
      color: 'bg-black',
      icon: User,
      features: ['Browse Products', 'Order History', 'Profile Settings']
    },
    admin: {
      title: 'Admin Dashboard',
      color: 'bg-black',
      icon: Settings,
      features: ['User Management', 'Analytics', 'System Settings', 'All Features']
    },
    employee: {
      title: 'Employee Dashboard',
      color: 'bg-black',
      icon: BarChart3,
      features: ['Product Management', 'Order Processing', 'Customer Support']
    },
    supplier: {
      title: 'Supplier Dashboard',
      color: 'bg-black',
      icon: Package,
      features: ['Inventory Management', 'Order Fulfillment', 'Product Uploads']
    },
    interior_designer: {
      title: 'Designer Dashboard',
      color: 'bg-black',
      icon: PaintBucket,
      features: ['Design Tools', 'Client Management', 'Project Gallery']
    }
  };

  const currentRole = roleConfig[user?.role] || roleConfig.user;
  const IconComponent = currentRole.icon;

  // Admin Dashboard Content
  const adminDashboardContent = (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">+12%</span>
          </div>
          <h3 className="text-2xl font-bold text-black">$45,231</h3>
          <p className="text-sm text-gray-500 mt-1">Total Revenue</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">+23%</span>
          </div>
          <h3 className="text-2xl font-bold text-black">1,234</h3>
          <p className="text-sm text-gray-500 mt-1">Total Orders</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">+18%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">5,678</h3>
          <p className="text-sm text-gray-500 mt-1">Total Customers</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">-5%</span>
          </div>
          <h3 className="text-2xl font-bold text-black">89.2k</h3>
          <p className="text-sm text-gray-500 mt-1">Page Views</p>
        </div>
      </div>

      {/* Charts and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-black">Sales Overview</h3>
            <div className="flex items-center gap-2">
              <button className="text-sm px-3 py-1 rounded-lg bg-amber-50 text-amber-600 font-medium">Week</button>
              <button className="text-sm px-3 py-1 rounded-lg text-gray-600 hover:bg-gray-50">Month</button>
              <button className="text-sm px-3 py-1 rounded-lg text-gray-600 hover:bg-gray-50">Year</button>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
            <TrendingUp className="w-16 h-16 text-amber-500" />
            <p className="ml-4 text-gray-600">Sales chart will be displayed here</p>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200/50">
          <h3 className="text-lg font-semibold text-black mb-6">Recent Activities</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-black">New order #1234</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-black">User registered</p>
                <p className="text-xs text-gray-500">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-black">Payment received</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-black">Product updated</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Regular Dashboard Content (non-admin)
  const regularDashboardContent = (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8 border border-amber-200">
          <h2 className="text-2xl font-bold text-black mb-2">
            Welcome back, {user?.name}! 👋
          </h2>
          <p className="text-gray-600">
            You're logged in as a <span className="capitalize font-medium">{user?.role}</span>.
            {!user?.isEmailVerified && (
              <span className="ml-2 text-orange-600 font-medium">
                Please verify your email address to access all features.
              </span>
            )}
          </p>
        </div>

        {/* Role-based Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentRole.features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow border border-amber-200">
              <h3 className="font-medium text-black mb-2">{feature}</h3>
              <p className="text-sm text-gray-600">
                Access {feature.toLowerCase()} functionality
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
              >
                Open
              </Button>
            </div>
          ))}
        </div>

        {/* Admin Only Section */}
        <RoleBasedAccess roles={['admin']}>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <Settings className="w-6 h-6 text-black mr-3" />
              <h3 className="text-lg font-semibold text-black">
                Admin Controls
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="danger" size="sm">
                <Users className="w-4 h-4 mr-2" />
                User Management
              </Button>
              <Button variant="danger" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button variant="danger" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                System Settings
              </Button>
            </div>
          </div>
        </RoleBasedAccess>

        {/* Staff Only Section */}
        <RoleBasedAccess roles={['admin', 'employee']}>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <BarChart3 className="w-6 h-6 text-black mr-3" />
              <h3 className="text-lg font-semibold text-black">
                Staff Tools
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="success" size="sm">
                <Package className="w-4 h-4 mr-2" />
                Product Management
              </Button>
              <Button variant="success" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Customer Support
              </Button>
            </div>
          </div>
        </RoleBasedAccess>

        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-secondary-900">
              Profile Information
            </h3>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-secondary-700">Name</label>
              <p className="text-secondary-900 mt-1">{user?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-700">Email</label>
              <div className="flex items-center mt-1">
                <p className="text-secondary-900">{user?.email}</p>
                {user?.isEmailVerified ? (
                  <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Verified
                  </span>
                ) : (
                  <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                    Unverified
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-700">Role</label>
              <p className="text-secondary-900 mt-1 capitalize">{user?.role}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-700">Member Since</label>
              <p className="text-secondary-900 mt-1">
                {new Date(user?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  // Return appropriate layout based on user role
  if (user?.role === 'admin') {
    return (
      <AdminLayout>
        {adminDashboardContent}
      </AdminLayout>
    );
  }

  if (user?.role === 'interior_designer') {
    return (
      <DesignerLayout>
        <div className="space-y-6">
          {/* Designer Welcome */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to your Creative Studio, {user?.name}! 🎨
            </h2>
            <p className="text-gray-600">
              Manage your design projects, portfolio, and client relationships all in one place.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-2">Start New Project</h3>
              <p className="text-purple-100 text-sm mb-4">Create a new design project</p>
              <button className="bg-white/20 text-white px-4 py-2 rounded-xl hover:bg-white/30 transition-colors">
                Get Started
              </button>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-purple-100">
              <h3 className="font-semibold mb-2 text-gray-900">Portfolio</h3>
              <p className="text-gray-600 text-sm mb-4">Showcase your best work</p>
              <button className="bg-purple-50 text-purple-600 px-4 py-2 rounded-xl hover:bg-purple-100 transition-colors">
                View Portfolio
              </button>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-purple-100">
              <h3 className="font-semibold mb-2 text-gray-900">Client Messages</h3>
              <p className="text-gray-600 text-sm mb-4">3 new messages</p>
              <button className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl hover:bg-orange-100 transition-colors">
                Read Messages
              </button>
            </div>
          </div>
        </div>
      </DesignerLayout>
    );
  }

  return regularDashboardContent;
};

export default Dashboard;