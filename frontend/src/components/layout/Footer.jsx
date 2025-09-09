import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-primary-600 text-white rounded-lg p-2">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold">ShopEasy</span>
            </div>
            <p className="text-gray-300 text-sm leading-6">
              Your one-stop destination for quality products at unbeatable prices. 
              Shop with confidence and enjoy fast, secure delivery to your doorstep.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/products"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  to="/categories"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  to="/deals"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Special Deals
                </Link>
              </li>
              <li>
                <Link
                  to="/new-arrivals"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  to="/best-sellers"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Best Sellers
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/contact"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/help"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link
                  to="/size-guide"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Size Guide
                </Link>
              </li>
              <li>
                <Link
                  to="/track-order"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Track Your Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Get in Touch</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary-400" />
                <span className="text-gray-300 text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary-400" />
                <span className="text-gray-300 text-sm">support@shopeasy.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-primary-400 mt-0.5" />
                <span className="text-gray-300 text-sm">
                  123 Commerce Street<br />
                  New York, NY 10001<br />
                  United States
                </span>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">Newsletter</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
                <button className="px-4 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 transition-colors text-sm font-medium">
                  Subscribe
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Get updates on new products and exclusive deals.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-sm text-gray-400">
              © 2024 ShopEasy. All rights reserved.
            </div>

            {/* Legal Links */}
            <div className="flex items-center space-x-6">
              <Link
                to="/privacy"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/cookies"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cookie Policy
              </Link>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-400">We Accept:</span>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-5 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">VISA</span>
                </div>
                <div className="w-8 h-5 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-xs font-bold text-red-600">MC</span>
                </div>
                <div className="w-8 h-5 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-800">AMEX</span>
                </div>
                <div className="w-8 h-5 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">PP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
