import React, { useState, useEffect } from 'react';
import { Shield, UserPlus, Trash2, ChevronsUp, ChevronsDown, X, Plus } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const emptyForm = { name: '', email: '', phone: '', password: '' };

export const SuperAdminPanel = ({ users, onRefresh, currentUserId }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [actionUserId, setActionUserId] = useState(null);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BACKEND_URL}/api/admin/create-admin`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Admin account created');
      setForm(emptyForm);
      setShowCreateForm(false);
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create admin');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId, email) => {
    if (!window.confirm(`Delete user ${email}? This cannot be undone.`)) return;
    setActionUserId(userId);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BACKEND_URL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('User deleted');
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete user');
    } finally {
      setActionUserId(null);
    }
  };

  const handleRoleChange = async (userId, newRole, email) => {
    if (!window.confirm(`Change role of ${email} to ${newRole}?`)) return;
    setActionUserId(userId);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${BACKEND_URL}/api/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Role updated to ${newRole}`);
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update role');
    } finally {
      setActionUserId(null);
    }
  };

  const roleBadge = (role) => {
    const styles = {
      super_admin: 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30',
      admin: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      user: 'bg-[#94A3B8]/20 text-[#94A3B8] border border-[#94A3B8]/30'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[role] || styles.user}`}>
        {role === 'super_admin' ? 'Super Admin' : role === 'admin' ? 'Admin' : 'User'}
      </span>
    );
  };

  return (
    <div className="bg-[#121B2F] border border-white/5 rounded-2xl p-6" data-testid="super-admin-panel">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Shield className="w-5 h-5 mr-2 text-[#D4AF37]" />
          User Management <span className="ml-2 text-xs text-[#D4AF37]">(Super Admin)</span>
        </h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          data-testid="toggle-create-admin-button"
          className="bg-[#D4AF37] text-[#0A0F1D] px-4 py-2 rounded-full font-medium hover:bg-[#F3C94D] transition-colors flex items-center space-x-2"
        >
          {showCreateForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          <span>{showCreateForm ? 'Cancel' : 'Create Admin'}</span>
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateAdmin} data-testid="create-admin-form" className="mb-6 bg-[#0A0F1D] border border-white/5 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Admin Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              data-testid="admin-name-input"
              className="bg-[#121B2F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            />
            <input
              type="email"
              placeholder="Admin Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              data-testid="admin-email-input"
              className="bg-[#121B2F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
              data-testid="admin-phone-input"
              className="bg-[#121B2F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            />
            <input
              type="password"
              placeholder="Temporary Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
              data-testid="admin-password-input"
              className="bg-[#121B2F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            data-testid="submit-create-admin-button"
            className="w-full bg-[#D4AF37] text-[#0A0F1D] py-3 rounded-full font-semibold hover:bg-[#F3C94D] transition-colors disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Admin Account'}
          </button>
        </form>
      )}

      <div className="overflow-x-auto" data-testid="users-management-table">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-[#94A3B8] text-sm font-medium py-3 px-2">Name</th>
              <th className="text-left text-[#94A3B8] text-sm font-medium py-3 px-2">Email</th>
              <th className="text-left text-[#94A3B8] text-sm font-medium py-3 px-2">Phone</th>
              <th className="text-left text-[#94A3B8] text-sm font-medium py-3 px-2">Role</th>
              <th className="text-right text-[#94A3B8] text-sm font-medium py-3 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u.id === currentUserId;
              const isSuperAdmin = u.role === 'super_admin';
              return (
                <tr key={u.id} className="border-b border-white/5" data-testid={`user-row-${u.id}`}>
                  <td className="text-white py-3 px-2">{u.name}{isSelf && <span className="text-[#D4AF37] text-xs ml-2">(You)</span>}</td>
                  <td className="text-[#94A3B8] py-3 px-2">{u.email}</td>
                  <td className="text-[#94A3B8] py-3 px-2">{u.phone}</td>
                  <td className="py-3 px-2">{roleBadge(u.role)}</td>
                  <td className="py-3 px-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!isSelf && !isSuperAdmin && u.role === 'user' && (
                        <button
                          onClick={() => handleRoleChange(u.id, 'admin', u.email)}
                          disabled={actionUserId === u.id}
                          data-testid={`promote-${u.id}`}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                          title="Promote to Admin"
                        >
                          <ChevronsUp className="w-4 h-4" />
                        </button>
                      )}
                      {!isSelf && u.role === 'admin' && (
                        <button
                          onClick={() => handleRoleChange(u.id, 'user', u.email)}
                          disabled={actionUserId === u.id}
                          data-testid={`demote-${u.id}`}
                          className="p-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors disabled:opacity-50"
                          title="Demote to User"
                        >
                          <ChevronsDown className="w-4 h-4" />
                        </button>
                      )}
                      {!isSelf && !isSuperAdmin && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          disabled={actionUserId === u.id}
                          data-testid={`delete-user-${u.id}`}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
