import React, { useEffect, useState } from 'react';
import { fetchAllLeaves, reviewLeave } from '../../services/leaveService';
import { Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAllLeaves({ status: status || undefined });
      setLeaves(data);
    } catch (e) {
      toast.error('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status]);

  const onReview = async (id, action) => {
    try {
      await reviewLeave(id, action);
      toast.success(`Leave ${action}d`);
      await load();
    } catch (e) {
      toast.error('Action failed');
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Leave Management</h1>
          <select value={status} onChange={(e)=>setStatus(e.target.value)} className="border rounded-md px-3 py-2">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="grid grid-cols-6 font-semibold px-4 py-2 border-b">
            <div>Employee</div><div>Type</div><div>Dates</div><div>Reason</div><div>Status</div><div>Actions</div>
          </div>
          {loading ? (
            <div className="p-6">Loading...</div>
          ) : leaves.length === 0 ? (
            <div className="p-6 text-secondary-600">No leave requests</div>
          ) : (
            leaves.map(leave => (
              <div key={leave._id} className="grid grid-cols-6 px-4 py-2 border-b last:border-b-0 items-center">
                <div>
                  <div className="font-medium">{leave.employee?.name}</div>
                  <div className="text-sm text-secondary-600">{leave.employee?.email}</div>
                </div>
                <div className="capitalize">{leave.type}</div>
                <div>{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</div>
                <div className="truncate">{leave.reason || '-'}</div>
                <div className="capitalize">{leave.status}</div>
                <div className="flex gap-2">
                  {leave.status === 'pending' && (
                    <>
                      <button onClick={() => onReview(leave._id, 'approve')} className="px-3 py-1 bg-green-600 text-white rounded-md inline-flex items-center gap-1"><Check size={14}/>Approve</button>
                      <button onClick={() => onReview(leave._id, 'reject')} className="px-3 py-1 bg-red-600 text-white rounded-md inline-flex items-center gap-1"><X size={14}/>Reject</button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveManagement;


