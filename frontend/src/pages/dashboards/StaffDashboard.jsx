import React, { useEffect, useState } from 'react';
import { Clock, User, Mail, Phone, Calendar, Edit3, Activity, Package } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { leaveService } from '../../services/leaveService';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profileService';

const StaffDashboard = () => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ type: 'casual', reason: '', startDate: '', endDate: '', days: 1 });
  const [myLeaves, setMyLeaves] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [recentActivity, setRecentActivity] = useState([]);

  const loadMyLeaves = async () => {
    try {
      const data = await leaveService.getMyLeaves();
      setMyLeaves(Array.isArray(data) ? data : []);
    } catch (e) {
      setMyLeaves([]);
    }
  };

  const loadRecentActivity = () => {
    // Mock recent activity data - in real app, this would come from API
    const activities = [
      { id: 1, action: 'Submitted leave request', time: '2 hours ago', type: 'leave' },
      { id: 2, action: 'Updated profile information', time: '1 day ago', type: 'profile' },
      { id: 3, action: 'Processed customer order #001234', time: '2 days ago', type: 'order' },
      { id: 4, action: 'Completed daily report', time: '3 days ago', type: 'report' },
    ];
    setRecentActivity(activities);
  };

  const initializeProfileForm = () => {
    if (user) {
      setProfileForm({
        name: String(user.name || ''),
        email: String(user.email || ''),
        phone: String(user.phone || ''),
        address: String(user.address || '')
      });
    }
  };

  useEffect(() => { 
    loadMyLeaves(); 
    loadRecentActivity();
    initializeProfileForm();
  }, [user]);

  const submitLeave = async (e) => {
    e.preventDefault();
    await leaveService.createLeave({
      type: form.type,
      reason: form.reason,
      startDate: form.startDate,
      endDate: form.endDate,
      days: Number(form.days) || 1
    });
    setForm({ type: 'casual', reason: '', startDate: '', endDate: '', days: 1 });
    await loadMyLeaves();
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileForm);
      setIsEditingProfile(false);
      loadRecentActivity(); // Refresh activity
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'leave': return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'profile': return <User className="h-4 w-4 text-green-500" />;
      case 'order': return <Package className="h-4 w-4 text-purple-500" />;
      case 'report': return <Activity className="h-4 w-4 text-orange-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Dashboard</h1>
              <p className="text-gray-600">Manage daily operations and customer service</p>
            </div>
            {user && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Welcome back,</p>
                <p className="text-lg font-semibold text-gray-900">{user.name || 'User'}</p>
                <p className="text-sm text-gray-600 capitalize">{user.role?.replace('_', ' ') || 'Staff'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">My Leave Requests</p>
                <p className="text-2xl font-semibold text-gray-900">{myLeaves.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recent Activities</p>
                <p className="text-2xl font-semibold text-gray-900">{recentActivity.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                <p className="text-2xl font-semibold text-gray-900">3</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* User Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
              
              {isEditingProfile ? (
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProfile(false);
                        initializeProfileForm();
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium text-gray-900">{String(user?.name || 'Not provided')}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{String(user?.email || 'Not provided')}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{String(user?.phone || 'Not provided')}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="font-medium text-gray-900 capitalize">{String(user?.role?.replace('_', ' ') || 'Not assigned')}</p>
                    </div>
                  </div>
                  {user?.address && (
                    <div className="flex items-start">
                      <div className="h-5 w-5 text-gray-400 mr-3 mt-0.5">📍</div>
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium text-gray-900">{String(user.address)}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-shrink-0 mr-3">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Leave Request Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Leave</h2>
          <form onSubmit={submitLeave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                <select 
                  className="w-full border rounded px-3 py-2" 
                  value={form.type} 
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="casual">Casual</option>
                  <option value="sick">Sick</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Days</label>
                <input 
                  type="number" 
                  min="1" 
                  className="w-full border rounded px-3 py-2" 
                  value={form.days} 
                  onChange={(e) => setForm({ ...form, days: e.target.value })} 
                  placeholder="Number of days" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input 
                  type="date" 
                  className="w-full border rounded px-3 py-2" 
                  value={form.startDate} 
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input 
                  type="date" 
                  className="w-full border rounded px-3 py-2" 
                  value={form.endDate} 
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })} 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea 
                className="w-full border rounded px-3 py-2" 
                rows={3} 
                value={form.reason} 
                onChange={(e) => setForm({ ...form, reason: e.target.value })} 
                placeholder="Please provide a reason for your leave request..." 
              />
            </div>
            <div className="flex justify-end">
              <button 
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Submit Leave Request
              </button>
            </div>
          </form>
        </div>

        {/* My Leave Requests */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Leave Requests</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2">Type</th>
                  <th className="py-2">Dates</th>
                  <th className="py-2">Days</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(myLeaves) && myLeaves.map(l => (
                  <tr key={l._id || l.id} className="border-t">
                    <td className="py-2 capitalize">{l.type || 'N/A'}</td>
                    <td className="py-2">
                      {l.startDate && l.endDate 
                        ? `${new Date(l.startDate).toLocaleDateString()} - ${new Date(l.endDate).toLocaleDateString()}`
                        : 'N/A'
                      }
                    </td>
                    <td className="py-2">{l.days || 0}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${l.status === 'approved' ? 'bg-green-100 text-green-700' : l.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}`}>
                        {l.status || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!Array.isArray(myLeaves) || myLeaves.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-500">No leave requests yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;