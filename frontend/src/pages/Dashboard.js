import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Calendar, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import axios from 'axios';
import { toast } from 'sonner';
import { PropertyManager } from '../components/PropertyManager';
import { SuperAdminPanel } from '../components/SuperAdminPanel';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [traffic, setTraffic] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      toast.error('Admin access required');
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [statsRes, trafficRes, usersRes, bookingsRes, inquiriesRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/analytics/stats`, config),
        axios.get(`${BACKEND_URL}/api/analytics/traffic`, config),
        axios.get(`${BACKEND_URL}/api/users`, config),
        axios.get(`${BACKEND_URL}/api/bookings`, config),
        axios.get(`${BACKEND_URL}/api/inquiries`, config)
      ]);

      setStats(statsRes.data);
      setTraffic(trafficRes.data);
      setUsers(usersRes.data);
      setBookings(bookingsRes.data);
      setInquiries(inquiriesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${BACKEND_URL}/api/bookings/${bookingId}/status?status=${status}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Booking status updated');
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking status');
    }
  };

  const statCards = stats ? [
    {
      title: 'Total Users',
      value: stats.total_users,
      icon: <Users className="w-8 h-8 text-[#D4AF37]" />,
      change: '+12%'
    },
    {
      title: 'Total Inquiries',
      value: stats.total_inquiries,
      icon: <MessageSquare className="w-8 h-8 text-[#D4AF37]" />,
      change: '+8%'
    },
    {
      title: 'Total Bookings',
      value: stats.total_bookings,
      icon: <Calendar className="w-8 h-8 text-[#D4AF37]" />,
      change: '+15%'
    },
    {
      title: 'Conversions',
      value: stats.successful_conversions,
      icon: <TrendingUp className="w-8 h-8 text-[#D4AF37]" />,
      change: '+20%'
    }
  ] : [];

  const trafficChartData = traffic ? {
    labels: traffic.labels,
    datasets: [
      {
        label: 'Visitors',
        data: traffic.visitors,
        borderColor: '#D4AF37',
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        tension: 0.4
      },
      {
        label: 'Inquiries',
        data: traffic.inquiries,
        borderColor: '#94A3B8',
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
        tension: 0.4
      }
    ]
  } : null;

  const bookingsChartData = traffic ? {
    labels: traffic.labels,
    datasets: [
      {
        label: 'Bookings',
        data: traffic.bookings,
        backgroundColor: '#D4AF37',
        borderRadius: 8
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: '#94A3B8'
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#94A3B8' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      },
      y: {
        ticks: { color: '#94A3B8' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-[#0A0F1D]">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-[#0A0F1D]" data-testid="admin-dashboard">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div {...fadeInUp} className="mb-12">
          <h1
            className="text-4xl sm:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {user.role === 'super_admin' ? 'Super Admin' : 'Admin'} <span className="text-[#D4AF37]">Dashboard</span>
          </h1>
          <p className="text-[#94A3B8]">Welcome back, {user.name}. Monitor and manage your business analytics</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((card, index) => (
            <motion.div
              key={index}
              {...fadeInUp}
              transition={{ delay: index * 0.1 }}
              data-testid={`stat-card-${index}`}
              className="bg-[#121B2F] border border-white/5 rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                {card.icon}
                <span className="text-green-400 text-sm font-medium">{card.change}</span>
              </div>
              <p className="text-[#94A3B8] text-sm mb-1">{card.title}</p>
              <p
                className="text-3xl font-bold text-white"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {card.value}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.2 }}
            className="bg-[#121B2F] border border-white/5 rounded-2xl p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Traffic Analytics</h2>
            {trafficChartData && <Line data={trafficChartData} options={chartOptions} />}
          </motion.div>

          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.3 }}
            className="bg-[#121B2F] border border-white/5 rounded-2xl p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Bookings Overview</h2>
            {bookingsChartData && <Bar data={bookingsChartData} options={chartOptions} />}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.4 }}
            className="bg-[#121B2F] border border-white/5 rounded-2xl p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Recent Bookings</h2>
            <div className="space-y-4" data-testid="bookings-list">
              {bookings.slice(0, 5).map((booking, index) => (
                <div
                  key={booking.id}
                  className="bg-[#0A0F1D] border border-white/5 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white font-medium">{booking.name}</p>
                      <p className="text-[#94A3B8] text-sm">{booking.service}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : booking.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-[#94A3B8] text-sm mb-3">
                    {booking.date} at {booking.time}
                  </p>
                  {booking.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'completed')}
                        className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Complete
                      </button>
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                        className="flex-1 bg-red-500/20 text-red-400 py-2 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
                      >
                        <XCircle className="w-4 h-4 inline mr-1" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.5 }}
            className="bg-[#121B2F] border border-white/5 rounded-2xl p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Recent Inquiries</h2>
            <div className="space-y-4" data-testid="inquiries-list">
              {inquiries.slice(0, 5).map((inquiry, index) => (
                <div
                  key={inquiry.id}
                  className="bg-[#0A0F1D] border border-white/5 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white font-medium">{inquiry.name}</p>
                      <p className="text-[#94A3B8] text-sm">{inquiry.email}</p>
                    </div>
                    <span className="bg-[#D4AF37]/20 text-[#D4AF37] px-3 py-1 rounded-full text-xs font-medium">
                      {inquiry.status}
                    </span>
                  </div>
                  <p className="text-[#94A3B8] text-sm line-clamp-2">{inquiry.message}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          {...fadeInUp}
          transition={{ delay: 0.55 }}
          className="mb-8"
        >
          <PropertyManager />
        </motion.div>

        <motion.div
          {...fadeInUp}
          transition={{ delay: 0.6 }}
        >
          {user.role === 'super_admin' ? (
            <SuperAdminPanel
              users={users}
              onRefresh={fetchDashboardData}
              currentUserId={user.id}
            />
          ) : (
            <div className="bg-[#121B2F] border border-white/5 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Users (View Only)</h2>
              <div className="overflow-x-auto" data-testid="users-table">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left text-[#94A3B8] text-sm font-medium py-3">Name</th>
                      <th className="text-left text-[#94A3B8] text-sm font-medium py-3">Email</th>
                      <th className="text-left text-[#94A3B8] text-sm font-medium py-3">Phone</th>
                      <th className="text-left text-[#94A3B8] text-sm font-medium py-3">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 10).map((u) => (
                      <tr key={u.id} className="border-b border-white/5">
                        <td className="text-white py-3">{u.name}</td>
                        <td className="text-[#94A3B8] py-3">{u.email}</td>
                        <td className="text-[#94A3B8] py-3">{u.phone}</td>
                        <td className="py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              u.role === 'super_admin'
                                ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                                : u.role === 'admin'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-[#94A3B8]/20 text-[#94A3B8]'
                            }`}
                          >
                            {u.role === 'super_admin' ? 'Super Admin' : u.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};