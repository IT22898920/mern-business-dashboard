import React, { useEffect, useState } from 'react';
import { fetchEmployees, createEmployee } from '../../services/employeeService';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchEmployees(search);
      setEmployees(data);
    } catch (e) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await createEmployee(form);
      toast.success('Employee created');
      setShowAdd(false);
      setForm({ name: '', email: '', phone: '', password: '' });
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to create employee');
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Employee Management</h1>
          <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
            <Plus size={16} /> Add Employee
          </button>
        </div>

        <div className="mb-4 flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-500" size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email" className="w-full pl-8 pr-3 py-2 border rounded-md" />
          </div>
          <button onClick={load} className="px-4 py-2 border rounded-md">Search</button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="grid grid-cols-4 font-semibold px-4 py-2 border-b">
            <div>Name</div><div>Email</div><div>Phone</div><div>Joined</div>
          </div>
          {loading ? (
            <div className="p-6">Loading...</div>
          ) : employees.length === 0 ? (
            <div className="p-6 text-secondary-600">No employees found</div>
          ) : (
            employees.map(emp => (
              <div key={emp._id} className="grid grid-cols-4 px-4 py-2 border-b last:border-b-0">
                <div>{emp.name}</div>
                <div>{emp.email}</div>
                <div>{emp.phone || '-'}</div>
                <div>{new Date(emp.createdAt).toLocaleDateString()}</div>
              </div>
            ))
          )}
        </div>

        {showAdd && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <h2 className="text-lg font-semibold mb-4">Add Employee</h2>
              <form onSubmit={onSubmit} className="space-y-3">
                <input className="w-full border rounded-md px-3 py-2" placeholder="Name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required />
                <input className="w-full border rounded-md px-3 py-2" placeholder="Email" type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} required />
                <input className="w-full border rounded-md px-3 py-2" placeholder="Phone" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} />
                <input className="w-full border rounded-md px-3 py-2" placeholder="Password (optional)" type="text" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} />
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={()=>setShowAdd(false)} className="px-4 py-2 border rounded-md">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md">Create</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default EmployeeManagement;


