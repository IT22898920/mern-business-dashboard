import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Package, DollarSign, Users, ShoppingCart,
  AlertTriangle, Eye, BarChart3, PieChart, Activity, ArrowUp, ArrowDown,
  Calendar, Filter, Download, RefreshCw, Zap, Target, Star, Clock, UserCheck, Link, X
} from 'lucide-react';
import { productService } from '../../services/productService';
import { createEmployee } from '../../services/employeeService';
import AdminLayout from '../../components/layout/AdminLayout';
import { useApplicationStats } from '../../hooks/useApplicationStats';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);
  
  const navigate = useNavigate();
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [submittingEmployee, setSubmittingEmployee] = useState(false);
  const { stats: applicationStats } = useApplicationStats();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await productService.getProducts();
      
      if (response.success) {
        // The API returns products directly in response.data array
        const products = response.data || [];
        setProducts(products);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      setSubmittingEmployee(true);
      await createEmployee(employeeForm);
      setShowAddEmployee(false);
      setEmployeeForm({ name: '', email: '', phone: '', password: '' });
    } catch (err) {
      console.error('Create employee failed', err);
    } finally {
      setSubmittingEmployee(false);
    }
  };

  // Calculate stock analytics
  const stockAnalytics = products.reduce((acc, product) => {
    // Access the current stock from the stock object
    const stock = product.stock?.current || 0;
    const price = product.price || 0;
    
    if (stock === 0) acc.outOfStock++;
    else if (stock <= 10) acc.lowStock++;
    else if (stock <= 50) acc.mediumStock++;
    else acc.highStock++;

    acc.totalValue += stock * price;
    acc.totalProducts++;
    acc.totalStock += stock;

    return acc;
  }, {
    outOfStock: 0,
    lowStock: 0,
    mediumStock: 0,
    highStock: 0,
    totalValue: 0,
    totalProducts: 0,
    totalStock: 0
  });

  // Generate stock chart data with safe percentage calculations
  const stockChartData = [
    { name: 'Out of Stock', value: stockAnalytics.outOfStock, color: '#ef4444', percentage: stockAnalytics.totalProducts > 0 ? (stockAnalytics.outOfStock / stockAnalytics.totalProducts) * 100 : 0 },
    { name: 'Low Stock (≤10)', value: stockAnalytics.lowStock, color: '#f59e0b', percentage: stockAnalytics.totalProducts > 0 ? (stockAnalytics.lowStock / stockAnalytics.totalProducts) * 100 : 0 },
    { name: 'Medium Stock (11-50)', value: stockAnalytics.mediumStock, color: '#3b82f6', percentage: stockAnalytics.totalProducts > 0 ? (stockAnalytics.mediumStock / stockAnalytics.totalProducts) * 100 : 0 },
    { name: 'High Stock (>50)', value: stockAnalytics.highStock, color: '#10b981', percentage: stockAnalytics.totalProducts > 0 ? (stockAnalytics.highStock / stockAnalytics.totalProducts) * 100 : 0 }
  ];

  // Top products by stock value
  const topProductsByValue = products
    .map(product => ({
      ...product,
      totalValue: (product.stock?.current || 0) * (product.price || 0)
    }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 5);

  // Critical stock alerts
  const criticalStockProducts = products
    .filter(product => (product.stock?.current || 0) <= 5)
    .sort((a, b) => (a.stock?.current || 0) - (b.stock?.current || 0))
    .slice(0, 10);

  // Prepare bar chart data - top 8 products by stock quantity
  const barChartData = products
    .map(product => ({
      name: product.name || 'Unknown Product',
      stock: product.stock?.current || 0,
      id: product._id
    }))
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 8);

  // Calculate max stock for scaling bars
  const maxStock = Math.max(...barChartData.map(item => item.stock), 1);

  const timeRanges = [
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
    { label: '1 Year', value: '1y' }
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-300 to-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      
      <div className="relative z-10 space-y-8 p-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all duration-300 group">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl xl:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 group-hover:animate-pulse">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Monitor your inventory and business performance</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500">Real-time data • Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/30 hover:shadow-3xl hover:scale-105 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stockAnalytics.totalProducts.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500 font-medium">+12% from last week</span>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-lg">
              <Package className="w-10 h-10 text-blue-600 group-hover:animate-bounce" />
            </div>
          </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/30 hover:shadow-3xl hover:scale-105 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Stock Items</p>
              <p className="text-2xl font-bold text-gray-900">{stockAnalytics.totalStock.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-2">
                <ArrowDown className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-500 font-medium">-3% from last week</span>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-lg">
              <BarChart3 className="w-10 h-10 text-green-600 group-hover:animate-bounce" />
            </div>
          </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/30 hover:shadow-3xl hover:scale-105 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Stock Value</p>
              <p className="text-2xl font-bold text-gray-900">${stockAnalytics.totalValue.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500 font-medium">+8% from last week</span>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-lg">
              <DollarSign className="w-10 h-10 text-purple-600 group-hover:animate-bounce" />
            </div>
          </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/30 hover:shadow-3xl hover:scale-105 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Critical Stock Alerts</p>
              <p className="text-2xl font-bold text-red-600">{criticalStockProducts.length}</p>
              <div className="flex items-center gap-1 mt-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-500 font-medium">Needs attention</span>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-lg">
              <AlertTriangle className="w-10 h-10 text-red-600 group-hover:animate-bounce" />
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Supplier Applications Section */}
      <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <UserCheck className="w-8 h-8 text-orange-600" />
              Supplier Applications
            </h2>
            <p className="text-gray-600 mt-1">Manage pending supplier requests</p>
          </div>
          <button
            onClick={() => navigate('/admin/supplier-applications')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Eye className="w-5 h-5" />
            View All
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/80 p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">{applicationStats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate('/admin/supplier-applications?status=pending')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Review</p>
                <p className="text-3xl font-bold text-orange-600">{applicationStats.pending}</p>
                {applicationStats.pending > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-orange-600 font-medium">Needs attention</span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-600">{applicationStats.approved}</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">Active suppliers</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{applicationStats.rejected}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <X className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
        
        {applicationStats.pending > 0 && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-orange-900">
                  You have {applicationStats.pending} pending supplier application{applicationStats.pending > 1 ? 's' : ''} waiting for review
                </p>
                <p className="text-sm text-orange-700 mt-1">
                  Review applications promptly to help grow your supplier network
                </p>
              </div>
              <button
                onClick={() => navigate('/admin/supplier-applications?status=pending')}
                className="ml-auto px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Review Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Team Management */}
      <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              Team Management
            </h2>
            <p className="text-gray-600 mt-1">Manage employees and review leave requests</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddEmployee(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <UserCheck className="w-5 h-5" />
              Add Employee
            </button>
            <button
              onClick={() => navigate('/admin/employees')}
              className="flex items-center gap-2 px-6 py-3 border border-blue-300 text-blue-700 rounded-xl hover:bg-blue-50 transition-colors"
            >
              <Eye className="w-5 h-5" />
              Employees
            </button>
            <button
              onClick={() => navigate('/admin/leaves')}
              className="flex items-center gap-2 px-6 py-3 border border-emerald-300 text-emerald-700 rounded-xl hover:bg-emerald-50 transition-colors"
            >
              <Calendar className="w-5 h-5" />
              Leave Requests
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 p-6 rounded-2xl border border-gray-100">
            <p className="text-sm text-gray-600">Quick Actions</p>
            <div className="mt-4 space-y-3">
              <button onClick={() => setShowAddEmployee(true)} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Employee</button>
              <button onClick={() => navigate('/admin/employees')} className="w-full py-2 border rounded-lg hover:bg-gray-50">Manage Employees</button>
              <button onClick={() => navigate('/admin/leaves')} className="w-full py-2 border rounded-lg hover:bg-gray-50">Review Leaves</button>
            </div>
          </div>
          <div className="md:col-span-2 bg-white/80 p-6 rounded-2xl border border-gray-100">
            <p className="text-sm text-gray-600">Guidelines</p>
            <ul className="mt-3 text-sm text-gray-700 list-disc list-inside space-y-1">
              <li>Use Add Employee to create staff accounts with role "employee"</li>
              <li>Employees can apply leave from Staff area; review under Leave Requests</li>
              <li>Only admins can access these pages</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Stock Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Stock Distribution</h2>
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-500">Live Data</span>
            </div>
          </div>
          
          {/* Custom Pie Chart */}
          <div className="relative">
            <div className="flex items-center justify-center">
              <div className="relative w-64 h-64">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="8"/>
                  {stockChartData.map((item, index) => {
                    const offset = stockChartData.slice(0, index).reduce((acc, curr) => acc + (curr.percentage * 2.51), 0);
                    const safeOffset = isNaN(offset) ? 0 : offset;
                    const safeDasharray = isNaN(item.percentage) ? "0 251.2" : `${item.percentage * 2.51} 251.2`;
                    return (
                      <circle
                        key={item.name}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={item.color}
                        strokeWidth="8"
                        strokeDasharray={safeDasharray}
                        strokeDashoffset={-safeOffset}
                        className="transition-all duration-500 hover:stroke-width-10"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-bold text-gray-900">{stockAnalytics.totalProducts}</span>
                  <span className="text-sm text-gray-500">Total Products</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-6">
              {stockChartData.map((item) => (
                <div key={item.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{item.value}</span>
                      <span className="text-xs text-gray-500">({item.percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products by Value */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Top Products by Stock Value</h2>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-gray-500">High Value</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {topProductsByValue.map((product, index) => (
              <div key={product._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 group">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full text-sm font-bold">
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-gray-600">Stock: {product.stock?.current || 0}</span>
                    <span className="text-sm text-gray-600">Price: ${product.price}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">${product.totalValue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Total Value</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Stock Alerts */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Critical Stock Alerts</h2>
              <p className="text-sm text-gray-600">Products with stock ≤ 5 units</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-red-500" />
            <span className="text-sm text-red-500 font-medium">Urgent Action Required</span>
          </div>
        </div>
        
        {criticalStockProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {criticalStockProducts.map((product) => (
              <div key={product._id} className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 p-4 rounded-xl hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                    (product.stock?.current || 0) === 0 
                      ? 'bg-red-200 text-red-800' 
                      : 'bg-orange-200 text-orange-800'
                  }`}>
                    {product.stock?.current || 0} left
                  </span>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm">
                  {product.name}
                </h3>
                
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">SKU: {product.sku || 'N/A'}</p>
                  <p className="text-xs text-gray-600">Price: ${product.price || 0}</p>
                  <p className="text-xs text-gray-600">Category: {product.category?.name || 'Uncategorized'}</p>
                </div>
                
                <button className="w-full mt-3 py-2 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors">
                  Restock Now
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">All Stock Levels Healthy!</h3>
            <p className="text-gray-600">No critical stock alerts at the moment.</p>
          </div>
        )}
      </div>

      {/* Stock Level Bar Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Product Stock Levels</h2>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-500">Top 8 Products</span>
          </div>
        </div>

        {barChartData.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <span>Product Name</span>
              <span>Stock Quantity</span>
            </div>
            
            {barChartData.map((item, index) => {
              const barWidth = Math.max((item.stock / maxStock) * 100, 2); // Minimum 2% width for visibility
              const stockColor = item.stock === 0 
                ? 'bg-red-500' 
                : item.stock <= 10 
                  ? 'bg-yellow-500' 
                  : item.stock <= 50 
                    ? 'bg-blue-500' 
                    : 'bg-green-500';
              
              return (
                <div key={item.id} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-500 w-6">
                        #{index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900 truncate max-w-xs" title={item.name}>
                        {item.name.length > 20 ? `${item.name.substring(0, 20)}...` : item.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-700">
                      {item.stock.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden group-hover:bg-gray-200 transition-colors">
                    <div 
                      className={`h-full ${stockColor} rounded-full transition-all duration-500 ease-out group-hover:opacity-90 relative`}
                      style={{ width: `${barWidth}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-20"></div>
                    </div>
                    
                    {/* Stock level indicator */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <span className={`text-xs font-medium ${
                        barWidth > 40 ? 'text-white' : 'text-gray-600'
                      }`}>
                        {((item.stock / maxStock) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-6 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Out of Stock</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>Low Stock (≤10)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Medium Stock (11-50)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>High Stock (50)</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No product data available</p>
            <p className="text-sm text-gray-400">Add products to see stock level comparison</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group">
          <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900">Add Product</p>
            <p className="text-sm text-gray-600">Create new inventory item</p>
          </div>
        </button>

        <button className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 group">
          <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900">Bulk Restock</p>
            <p className="text-sm text-gray-600">Update multiple items</p>
          </div>
        </button>

        <button className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group">
          <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
            <Download className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900">Export Report</p>
            <p className="text-sm text-gray-600">Download stock data</p>
          </div>
        </button>

        <button className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-yellow-300 hover:bg-yellow-50 transition-all duration-200 group">
          <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
            <Target className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900">Set Stock Alerts</p>
            <p className="text-sm text-gray-600">Configure notifications</p>
          </div>
        </button>
      </div>

      {showAddEmployee && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Employee</h3>
              <button onClick={() => setShowAddEmployee(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateEmployee} className="space-y-3">
              <input className="w-full border rounded-md px-3 py-2" placeholder="Full name" value={employeeForm.name} onChange={(e)=>setEmployeeForm({...employeeForm, name: e.target.value})} required />
              <input className="w-full border rounded-md px-3 py-2" placeholder="Email" type="email" value={employeeForm.email} onChange={(e)=>setEmployeeForm({...employeeForm, email: e.target.value})} required />
              <input className="w-full border rounded-md px-3 py-2" placeholder="Phone" value={employeeForm.phone} onChange={(e)=>setEmployeeForm({...employeeForm, phone: e.target.value})} />
              <input className="w-full border rounded-md px-3 py-2" placeholder="Password (optional)" type="text" value={employeeForm.password} onChange={(e)=>setEmployeeForm({...employeeForm, password: e.target.value})} />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={()=>setShowAddEmployee(false)} className="px-4 py-2 border rounded-md">Cancel</button>
                <button type="submit" disabled={submittingEmployee} className="px-4 py-2 bg-primary-600 text-white rounded-md disabled:opacity-60">{submittingEmployee ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
    </AdminLayout>
  );
};

export default AdminDashboard;