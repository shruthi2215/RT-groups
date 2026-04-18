import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#121B2F] border-t border-white/5" data-testid="main-footer">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Building2 className="w-8 h-8 text-[#D4AF37]" />
              <span className="text-xl font-semibold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                RT Groups
              </span>
            </div>
            <p className="text-[#94A3B8] text-sm leading-relaxed">
              Your Space, Our Promise. Building your dreams into reality with excellence in construction, property deals, and workforce solutions.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/" className="block text-[#94A3B8] hover:text-[#D4AF37] text-sm transition-colors">
                Home
              </Link>
              <Link to="/services" className="block text-[#94A3B8] hover:text-[#D4AF37] text-sm transition-colors">
                Services
              </Link>
              <Link to="/properties" className="block text-[#94A3B8] hover:text-[#D4AF37] text-sm transition-colors">
                Properties
              </Link>
              <Link to="/about" className="block text-[#94A3B8] hover:text-[#D4AF37] text-sm transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="block text-[#94A3B8] hover:text-[#D4AF37] text-sm transition-colors">
                Contact
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <div className="space-y-2">
              <p className="text-[#94A3B8] text-sm">Property Buying & Selling</p>
              <p className="text-[#94A3B8] text-sm">Construction Services</p>
              <p className="text-[#94A3B8] text-sm">Manpower Supply</p>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-[#D4AF37] mt-1" />
                <a href="tel:+918105854999" className="text-[#94A3B8] hover:text-[#D4AF37] text-sm transition-colors">
                  +91 810 585 4999
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="w-4 h-4 text-[#D4AF37] mt-1" />
                <a href="mailto:contact@rtgroups.info" className="text-[#94A3B8] hover:text-[#D4AF37] text-sm transition-colors">
                  contact@rtgroups.info
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-[#D4AF37] mt-1" />
                <p className="text-[#94A3B8] text-sm">
                  NO.22 5th Cross Road, Vaikuntam Layout Lakshmi Narayanapura, ACES Layout, Bangalore 560037
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-[#94A3B8] text-sm">
            © {new Date().getFullYear()} RT Groups. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-[#94A3B8] hover:text-[#D4AF37] transition-colors" aria-label="Facebook">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-[#94A3B8] hover:text-[#D4AF37] transition-colors" aria-label="Twitter">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-[#94A3B8] hover:text-[#D4AF37] transition-colors" aria-label="Instagram">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-[#94A3B8] hover:text-[#D4AF37] transition-colors" aria-label="LinkedIn">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};