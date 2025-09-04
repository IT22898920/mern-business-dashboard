import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';

// Route Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import { Home } from 'lucide-react';
import InteriorDesignHomePage from './pages/Home';
import ProductsManagement from './pages/admin/ProductsManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import InventoryManagement from './pages/admin/InventoryManagement';
import StaffDashboard from './pages/dashboards/StaffDashboard';
import SupplierDashboard from './pages/dashboards/SupplierDashboard';
import DesignerDashboard from './pages/dashboards/DesignerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductsCatalog from './pages/ProductsCatalog';
import ProductDetail from './pages/ProductDetail';
import SupplierApplication from './pages/SupplierApplication';
import SupplierApplicationsManagement from './pages/admin/SupplierApplicationsManagement';

// 404 Page Component
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-secondary-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-secondary-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-secondary-700 mb-2">Page Not Found</h2>
      <p className="text-secondary-600 mb-8">
        The page you're looking for doesn't exist.
      </p>
      <a
        href="/home"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        Go to Home
      </a>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />
            <Route 
              path="/forgot-password" 
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              } 
            />
            <Route 
              path="/reset-password" 
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              } 
            />

        {/* Home route - Public route */}
        <Route
          path="/home"
          element={<InteriorDesignHomePage />}
        />
        
        {/* Products route - Public route for all users */}
        <Route
          path="/products"
          element={<ProductsCatalog />}
        />
        
        {/* Product Detail route - Public route */}
        <Route
          path="/product/:id"
          element={<ProductDetail />}
        />
        
        {/* Supplier Application route - Protected route */}
        <Route
          path="/apply-supplier"
          element={
            <ProtectedRoute>
              <SupplierApplication />
            </ProtectedRoute>
          }
        />



            {/* Admin Only Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/products" 
              element={
                <ProtectedRoute roles={['admin']}>
                  <ProductsManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/categories" 
              element={
                <ProtectedRoute roles={['admin']}>
                  <CategoryManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/inventory" 
              element={
                <ProtectedRoute roles={['admin', 'employee']}>
                  <InventoryManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/supplier-applications" 
              element={
                <ProtectedRoute roles={['admin']}>
                  <SupplierApplicationsManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute roles={['admin']}>
                  <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-secondary-900 mb-4">Admin Panel</h2>
                      <p className="text-secondary-600">Admin panel coming soon...</p>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />

            {/* Staff Routes (Admin + Employee) */}
            <Route 
              path="/staff/dashboard" 
              element={
                <ProtectedRoute roles={['admin', 'employee']}>
                  <StaffDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/staff/*" 
              element={
                <ProtectedRoute roles={['admin', 'employee']}>
                  <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-secondary-900 mb-4">Staff Panel</h2>
                      <p className="text-secondary-600">Staff panel coming soon...</p>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />

            {/* Supplier Routes */}
            <Route 
              path="/supplier/dashboard" 
              element={
                <ProtectedRoute roles={['admin', 'supplier']}>
                  <SupplierDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/supplier/*" 
              element={
                <ProtectedRoute roles={['admin', 'supplier']}>
                  <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-secondary-900 mb-4">Supplier Panel</h2>
                      <p className="text-secondary-600">Supplier panel coming soon...</p>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />

            {/* Designer Routes */}
            <Route 
              path="/designer/dashboard" 
              element={
                <ProtectedRoute roles={['admin', 'interior_designer']}>
                  <DesignerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/designer/*" 
              element={
                <ProtectedRoute roles={['admin', 'interior_designer']}>
                  <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-secondary-900 mb-4">Designer Panel</h2>
                      <p className="text-secondary-600">Designer panel coming soon...</p>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{}}
            toastOptions={{
              // Define default options
              className: '',
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },

              // Default options for specific types
              success: {
                duration: 3000,
                style: {
                  background: '#10B981',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#10B981',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#EF4444',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#EF4444',
                },
              },
              loading: {
                duration: Infinity,
                style: {
                  background: '#3B82F6',
                },
              },
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;