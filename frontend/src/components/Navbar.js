import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building2, Menu, X, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/services', label: 'Services' },
    { path: '/properties', label: 'Properties' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <nav
      data-testid="main-navbar"
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0A0F1D]/90 backdrop-blur-xl border-b border-white/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2" data-testid="nav-logo">
            <Building2 className="w-8 h-8 text-[#D4AF37]" />
            <span className="text-xl font-semibold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              RT Groups
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`nav-${link.label.toLowerCase()}`}
                className={`text-sm font-medium transition-colors duration-200 ${
                  location.pathname === link.path
                    ? 'text-[#D4AF37]'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link
                    to="/dashboard"
                    data-testid="nav-dashboard"
                    className="text-sm font-medium text-[#94A3B8] hover:text-white transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  data-testid="nav-logout"
                  className="flex items-center space-x-2 text-sm font-medium text-[#94A3B8] hover:text-white transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                data-testid="nav-login"
                className="bg-[#D4AF37] text-[#0A0F1D] px-6 py-2 rounded-full font-medium hover:bg-[#F3C94D] transition-colors duration-300"
              >
                Login
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white"
            data-testid="mobile-menu-button"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#121B2F] border-t border-white/10"
            data-testid="mobile-menu"
          >
            <div className="px-6 py-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block text-sm font-medium text-[#94A3B8] hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block text-sm font-medium text-[#94A3B8] hover:text-white transition-colors"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="block text-sm font-medium text-[#94A3B8] hover:text-white transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block bg-[#D4AF37] text-[#0A0F1D] px-6 py-2 rounded-full font-medium hover:bg-[#F3C94D] transition-colors text-center"
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};