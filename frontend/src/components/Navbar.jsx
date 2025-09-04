import React, { useState } from "react";
import { Menu, X, Home, Sofa, Users, Phone } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
              <a
                href="#home"
                className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 transition-colors duration-300"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </a>
              <a
                href="#interior-design"
                className="flex items-center space-x-1 text-gray-700 hover:text-pink-500 transition-colors duration-300 font-medium"
              >
                <Sofa className="h-4 w-4" />
                <span>Products</span>
              </a>
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
              <button className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white px-6 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                Shop Now
              </button>
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
              <a
                href="#home"
                className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 block px-3 py-2 transition-colors duration-300"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </a>
              <a
                href="#interior-design"
                className="flex items-center space-x-2 text-gray-700 hover:text-pink-500 block px-3 py-2 font-medium transition-colors duration-300"
              >
                <Sofa className="h-4 w-4" />
                <span>Products</span>
              </a>
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
              <button className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white px-6 py-2 rounded-full mx-3 mt-2 hover:shadow-lg transition-all duration-300">
                Shop Now
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
