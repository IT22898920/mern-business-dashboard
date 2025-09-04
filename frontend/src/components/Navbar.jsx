import React, { useState } from "react";
import { Menu, X, Home, Sofa, Users, Phone, LogIn, UserPlus, LogOut, Building2, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Sofa className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent">
              Furniture Hub
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <Link
                to="/home"
                className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 transition-colors duration-300"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <Link
                to="/products"
                className="flex items-center space-x-1 text-gray-700 hover:text-pink-500 transition-colors duration-300 font-medium"
              >
                <Sofa className="h-4 w-4" />
                <span>Products</span>
              </Link>
              <a
                href="#about"
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-500 transition-colors duration-300"
              >
                <Users className="h-4 w-4" />
                <span>About</span>
              </a>
              <a
                href="#contact"
                className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 transition-colors duration-300"
              >
                <Phone className="h-4 w-4" />
                <span>Contact</span>
              </a>
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {(user?.role === 'admin' || user?.role === 'employee') && (
                    <Link
                      to="/admin/inventory"
                      className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transform hover:scale-105 transition-all duration-300"
                    >
                      <Package className="h-4 w-4" />
                      <span>Inventory</span>
                    </Link>
                  )}
                  {user?.role !== 'supplier' && user?.role !== 'admin' && (
                    <Link
                      to="/apply-supplier"
                      className="flex items-center space-x-1 bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transform hover:scale-105 transition-all duration-300"
                    >
                      <Building2 className="h-4 w-4" />
                      <span>Apply as Supplier</span>
                    </Link>
                  )}
                  <span className="text-gray-700">Welcome, {user?.name}</span>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transform hover:scale-105 transition-all duration-300"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 font-medium transition-colors duration-300"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center space-x-1 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white px-4 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Register</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-purple-600 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              <Link
                to="/home"
                className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 block px-3 py-2 transition-colors duration-300"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <Link
                to="/products"
                className="flex items-center space-x-2 text-gray-700 hover:text-pink-500 block px-3 py-2 font-medium transition-colors duration-300"
              >
                <Sofa className="h-4 w-4" />
                <span>Products</span>
              </Link>
              <a
                href="#about"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-500 block px-3 py-2 transition-colors duration-300"
              >
                <Users className="h-4 w-4" />
                <span>About</span>
              </a>
              <a
                href="#contact"
                className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 block px-3 py-2 transition-colors duration-300"
              >
                <Phone className="h-4 w-4" />
                <span>Contact</span>
              </a>
              {isAuthenticated ? (
                <div className="px-3 py-2 space-y-2">
                  <div className="text-gray-700 text-sm">Welcome, {user?.name}</div>
                  {(user?.role === 'admin' || user?.role === 'employee') && (
                    <Link
                      to="/admin/inventory"
                      className="flex items-center space-x-2 w-full bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-all duration-300"
                    >
                      <Package className="h-4 w-4" />
                      <span>Inventory Management</span>
                    </Link>
                  )}
                  {user?.role !== 'supplier' && user?.role !== 'admin' && (
                    <Link
                      to="/apply-supplier"
                      className="flex items-center space-x-2 w-full bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-all duration-300"
                    >
                      <Building2 className="h-4 w-4" />
                      <span>Apply as Supplier</span>
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 w-full bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-all duration-300"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="px-3 py-2 space-y-2">
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 w-full text-purple-600 hover:text-purple-700 font-medium px-3 py-2 border border-purple-600 rounded-full text-center transition-colors duration-300"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center space-x-2 w-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all duration-300"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Register</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
