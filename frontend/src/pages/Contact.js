import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export const Contact = () => {
  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    email: '',
    service: 'Property Buying & Selling',
    date: '',
    time: '',
    message: ''
  });
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      await axios.post(`${BACKEND_URL}/api/bookings`, bookingForm, config);
      toast.success('Booking request submitted successfully! We will contact you soon.');
      setBookingForm({
        name: '',
        phone: '',
        email: '',
        service: 'Property Buying & Selling',
        date: '',
        time: '',
        message: ''
      });
    } catch (error) {
      toast.error('Failed to submit booking. Please try again.');
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/inquiries`, inquiryForm);
      toast.success('Inquiry submitted successfully! We will get back to you soon.');
      setInquiryForm({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
    } catch (error) {
      toast.error('Failed to submit inquiry. Please try again.');
      console.error('Inquiry error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20">
      <section className="py-20 md:py-32 bg-[#0A0F1D]" data-testid="contact-hero">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h1
              className="text-5xl sm:text-6xl font-bold text-white mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Get in <span className="text-[#D4AF37]">Touch</span>
            </h1>
            <p className="text-[#94A3B8] text-lg max-w-3xl mx-auto leading-relaxed">
              Ready to start your project? Contact us for a free consultation
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <motion.div
              {...fadeInUp}
              data-testid="contact-phone"
              className="bg-[#121B2F] border border-white/5 rounded-2xl p-8 text-center hover:-translate-y-2 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex justify-center mb-4">
                <Phone className="w-12 h-12 text-[#D4AF37]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Phone</h3>
              <a href="tel:+918105854999" className="text-[#94A3B8] hover:text-[#D4AF37] transition-colors">
                +91 810 585 4999
              </a>
            </motion.div>

            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.1 }}
              data-testid="contact-email"
              className="bg-[#121B2F] border border-white/5 rounded-2xl p-8 text-center hover:-translate-y-2 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex justify-center mb-4">
                <Mail className="w-12 h-12 text-[#D4AF37]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Email</h3>
              <a href="mailto:contact@rtgroups.info" className="text-[#94A3B8] hover:text-[#D4AF37] transition-colors">
                contact@rtgroups.info
              </a>
            </motion.div>

            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              data-testid="contact-location"
              className="bg-[#121B2F] border border-white/5 rounded-2xl p-8 text-center hover:-translate-y-2 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex justify-center mb-4">
                <MapPin className="w-12 h-12 text-[#D4AF37]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Location</h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed">
                NO.22 5th Cross Road, Vaikuntam Layout<br />
                Lakshmi Narayanapura, ACES Layout<br />
                Bangalore 560037
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div {...fadeInUp}>
              <div className="bg-[#121B2F] border border-white/5 rounded-2xl p-8">
                <h2
                  className="text-2xl font-bold text-white mb-6"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  Book a Demo
                </h2>
                <form onSubmit={handleBookingSubmit} data-testid="booking-form" className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={bookingForm.name}
                      onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                      required
                      data-testid="booking-name-input"
                      className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      required
                      data-testid="booking-phone-input"
                      className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={bookingForm.email}
                      onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                      required
                      data-testid="booking-email-input"
                      className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <select
                      value={bookingForm.service}
                      onChange={(e) => setBookingForm({ ...bookingForm, service: e.target.value })}
                      required
                      data-testid="booking-service-select"
                      className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    >
                      <option value="Property Buying & Selling">Property Buying & Selling</option>
                      <option value="Construction Services">Construction Services</option>
                      <option value="Manpower Supply">Manpower Supply</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="date"
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                      required
                      data-testid="booking-date-input"
                      className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    />
                    <input
                      type="time"
                      value={bookingForm.time}
                      onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                      required
                      data-testid="booking-time-input"
                      className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <textarea
                      placeholder="Additional Message (Optional)"
                      value={bookingForm.message}
                      onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                      rows={4}
                      data-testid="booking-message-input"
                      className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    data-testid="booking-submit-button"
                    className="w-full bg-[#D4AF37] text-[#0A0F1D] py-3 rounded-full font-semibold hover:bg-[#F3C94D] transition-colors duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <span>{loading ? 'Submitting...' : 'Book Demo'}</span>
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <div className="bg-[#121B2F] border border-white/5 rounded-2xl p-8">
                <h2
                  className="text-2xl font-bold text-white mb-6"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  General Inquiry
                </h2>
                <form onSubmit={handleInquirySubmit} data-testid="inquiry-form" className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={inquiryForm.name}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                      required
                      data-testid="inquiry-name-input"
                      className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={inquiryForm.email}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                      required
                      data-testid="inquiry-email-input"
                      className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={inquiryForm.phone}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                      required
                      data-testid="inquiry-phone-input"
                      className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <textarea
                      placeholder="Your Message"
                      value={inquiryForm.message}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                      required
                      rows={8}
                      data-testid="inquiry-message-input"
                      className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    data-testid="inquiry-submit-button"
                    className="w-full bg-[#D4AF37] text-[#0A0F1D] py-3 rounded-full font-semibold hover:bg-[#F3C94D] transition-colors duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <span>{loading ? 'Submitting...' : 'Send Message'}</span>
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};