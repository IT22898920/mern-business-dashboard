import React, { useEffect, useState } from 'react';
import { Users, Package, TrendingUp, Clock } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { leaveService } from '../../services/leaveService';

const StaffDashboard = () => {
  const [form, setForm] = useState({ type: 'casual', reason: '', startDate: '', endDate: '', days: 1 });
  const [myLeaves, setMyLeaves] = useState([]);

  const loadMyLeaves = async () => {
    try {
      const data = await leaveService.getMyLeaves();
      setMyLeaves(Array.isArray(data) ? data : data);
    } catch (e) {
      setMyLeaves([]);
    }
  };

  useEffect(() => { loadMyLeaves(); }, []);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Dashboard</h1>
          <p className="text-gray-600">Manage daily operations and customer service</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Customers</p>
                <p className="text-2xl font-semibold text-gray-900">24</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Orders Processed</p>
                <p className="text-2xl font-semibold text-gray-900">18</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sales Today</p>
                <p className="text-2xl font-semibold text-gray-900">$2,450</p>
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
                <p className="text-2xl font-semibold text-gray-900">7</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Orders</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Order #00{item}4</p>
                    <p className="text-sm text-gray-500">Customer: John Doe</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Completed
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Leave</h2>
            <form onSubmit={submitLeave} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select className="border rounded px-3 py-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="casual">Casual</option>
                  <option value="sick">Sick</option>
                  <option value="annual">Annual</option>
                </select>
                <input type="number" min="1" className="border rounded px-3 py-2" value={form.days} onChange={(e) => setForm({ ...form, days: e.target.value })} placeholder="Days" />
                <input type="date" className="border rounded px-3 py-2" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                <input type="date" className="border rounded px-3 py-2" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
              <textarea className="w-full border rounded px-3 py-2" rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Reason" />
              <div className="flex justify-end">
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Submit</button>
              </div>
            </form>
          </div>
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
                  <tr key={l._id} className="border-t">
                    <td className="py-2 capitalize">{l.type}</td>
                    <td className="py-2">{new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</td>
                    <td className="py-2">{l.days}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${l.status === 'approved' ? 'bg-green-100 text-green-700' : l.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}`}>
                        {l.status}
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