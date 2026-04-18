import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, loginForm);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Login successful!');
      if (response.data.user.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/register`, registerForm);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Registration successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-6" data-testid="auth-page">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-0 bg-[#121B2F] rounded-2xl overflow-hidden border border-white/5">
        <div
          className="hidden lg:block relative"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1762811054947-605b20298615)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-[#0A0F1D]/70 backdrop-blur-sm" />
          <div className="relative z-10 h-full flex flex-col justify-center p-12">
            <h2
              className="text-4xl font-bold text-white mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Welcome to <span className="text-[#D4AF37]">RT Groups</span>
            </h2>
            <p className="text-[#D4AF37] text-sm mb-4 uppercase tracking-wider">Your Space, Our Promise</p>
            <p className="text-[#94A3B8] leading-relaxed">
              Your trusted partner in real estate and construction excellence. Join us to explore premium
              properties and services.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div className="mb-8">
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setIsLogin(true)}
                data-testid="login-tab-button"
                className={`flex-1 py-3 rounded-xl font-semibold transition-colors duration-300 ${
                  isLogin
                    ? 'bg-[#D4AF37] text-[#0A0F1D]'
                    : 'bg-[#0A0F1D] text-[#94A3B8] hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                data-testid="register-tab-button"
                className={`flex-1 py-3 rounded-xl font-semibold transition-colors duration-300 ${
                  !isLogin
                    ? 'bg-[#D4AF37] text-[#0A0F1D]'
                    : 'bg-[#0A0F1D] text-[#94A3B8] hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            {isLogin ? (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleLogin}
                data-testid="login-form"
                className="space-y-6"
              >
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                      data-testid="login-email-input"
                      className="w-full pl-12 bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                      data-testid="login-password-input"
                      className="w-full pl-12 pr-12 bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  data-testid="login-submit-button"
                  className="w-full bg-[#D4AF37] text-[#0A0F1D] py-3 rounded-xl font-semibold hover:bg-[#F3C94D] transition-colors duration-300 disabled:opacity-50"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </motion.form>
            ) : (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleRegister}
                data-testid="register-form"
                className="space-y-6"
              >
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                    <input
                      type="text"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      required
                      data-testid="register-name-input"
                      className="w-full pl-12 bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                    <input
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      required
                      data-testid="register-email-input"
                      className="w-full pl-12 bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                    <input
                      type="tel"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                      required
                      data-testid="register-phone-input"
                      className="w-full pl-12 bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required
                      data-testid="register-password-input"
                      className="w-full pl-12 pr-12 bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  data-testid="register-submit-button"
                  className="w-full bg-[#D4AF37] text-[#0A0F1D] py-3 rounded-xl font-semibold hover:bg-[#F3C94D] transition-colors duration-300 disabled:opacity-50"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </motion.form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};