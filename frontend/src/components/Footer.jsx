import React from 'react';
import { Palette, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Palette className="h-8 w-8 text-pink-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Ekata Interiors
              </span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Transform your space with our expert interior design services. 
              We create beautiful, functional spaces that reflect your unique style and personality.
            </p>
            
            {/* Social Media Links */}
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors duration-300">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors duration-300">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-300 transition-colors duration-300">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {["Home","Interior Design","About Us","Portfolio","Services","Contact"].map((link, i) => (
                <li key={i}>
                  <a
                    href={`#${link.toLowerCase().replace(" ", "-")}`}
                    className="text-gray-300 hover:text-pink-400 transition-colors duration-300"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-purple-400 mt-1 flex-shrink-0" />
                <p className="text-gray-300">
                  123 Design Street,<br />
                  Colombo 07,<br />
                  Sri Lanka
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-pink-400" />
                <p className="text-gray-300">+94 77 123 4567</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-400" />
                <p className="text-gray-300">hello@ekatainteriors.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Services List */}
        <div className="border-t border-purple-800 mt-8 pt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Our Services</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Residential Design",
              "Commercial Design",
              "Custom Furniture",
              "Space Planning",
              "Color Consultation",
              "Lighting Design",
              "3D Visualization",
              "Project Management"
            ].map((service, i) => (
              <div key={i} className="text-gray-300 hover:text-pink-400 transition-colors duration-300">
                <p>{service}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-purple-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Ekata Interiors. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-purple-400 text-sm transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-400 text-sm transition-colors duration-300">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors duration-300">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
