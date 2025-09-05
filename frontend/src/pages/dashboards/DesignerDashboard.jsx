import React, { useState, useEffect } from 'react';
import { Users, Home, PlusSquare, LogOut, Eye, Edit2, Trash2, Save, X, TrendingUp, Clock, CheckCircle, Loader } from 'lucide-react';

const DesignerDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [formData, setFormData] = useState({
    projectName: '',
    clientName: '',
    contact: '',
    status: 'In Progress',
    imageURL: ''
  });
  const [designs, setDesigns] = useState([]);
  const [imagePreview, setImagePreview] = useState('');
  const [imageError, setImageError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For editing
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editImagePreview, setEditImagePreview] = useState('');

  // Fetch all designs
  const fetchDesigns = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/designs/all');
      const data = await res.json();
      setDesigns(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'view' || activeTab === 'dashboard') fetchDesigns();
  }, [activeTab]);

  // Add Project Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'imageURL') {
      setImageError('');
      if (!value.trim()) {
        setImagePreview('');
      } else {
        const img = new Image();
        img.onload = () => setImagePreview(value);
        img.onerror = () => {
          setImagePreview('');
          setImageError('Invalid image URL or failed to load');
        };
        img.src = value;
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.imageURL && !imagePreview) {
      alert('Please provide a valid image URL');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/designs/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      alert(result.message || 'Project added successfully!');
      setFormData({
        projectName: '',
        clientName: '',
        contact: '',
        status: 'In Progress',
        imageURL: ''
      });
      setImagePreview('');
      fetchDesigns();
      setActiveTab('view');
    } catch (err) {
      console.error(err);
      alert('Error adding project');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Handlers
  const handleEdit = (project) => {
    setEditingId(project._id);
    setEditFormData({ ...project });
    setEditImagePreview(project.imageURL || '');
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });

    if (name === 'imageURL') {
      if (!value.trim()) {
        setEditImagePreview('');
      } else {
        const img = new Image();
        img.onload = () => setEditImagePreview(value);
        img.onerror = () => setEditImagePreview('');
        img.src = value;
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
    setEditImagePreview('');
  };

  const handleUpdate = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/designs/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      const result = await res.json();
      alert(result.message || 'Project updated successfully!');
      cancelEdit();
      fetchDesigns();
    } catch (err) {
      console.error(err);
      alert('Error updating project');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await fetch(`http://localhost:5000/api/designs/delete/${id}`, { method: 'DELETE' });
      fetchDesigns();
    } catch (err) {
      console.error(err);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      try {
        // Call logout API to clear server-side session/cookie
        const response = await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include' // Include cookies for server-side session management
        });

        if (response.ok) {
          // Clear client-side storage
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userName');
          
          // Clear session storage
          sessionStorage.clear();
          
          // Show success message
          alert('Logged out successfully!');
          
          // Redirect to login page
          window.location.href = '/login'; // Change this to your login page route
        } else {
          // Handle logout error
          console.error('Logout failed:', response.statusText);
          alert('Logout failed. Please try again.');
        }
      } catch (error) {
        console.error('Logout error:', error);
        
        // Even if API call fails, clear local storage as fallback
        localStorage.clear();
        sessionStorage.clear();
        alert('Logged out successfully!');
        window.location.href = '/login';
      }
    }
  };

  // Calculate stats
  const stats = {
    total: designs.length,
    completed: designs.filter(d => d.status === 'Completed').length,
    inProgress: designs.filter(d => d.status === 'In Progress').length,
    review: designs.filter(d => d.status === 'Review').length
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-2xl fixed h-full flex flex-col overflow-hidden">
        <div className="p-6 flex flex-col h-full">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
              Designer Hub
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto mt-2 rounded-full"></div>
          </div>
          
          <nav className="flex-1 space-y-2">
            {[
              { tab: 'dashboard', icon: <Home className="w-5 h-5 mr-3" />, label: 'Dashboard' },
              { tab: 'add', icon: <PlusSquare className="w-5 h-5 mr-3" />, label: 'Add Project' },
              { tab: 'view', icon: <Eye className="w-5 h-5 mr-3" />, label: 'View Designs' },
            ].map(({ tab, icon, label }) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`group flex items-center p-4 w-full rounded-xl transition-all duration-500 ease-in-out transform hover:scale-105 hover:shadow-lg relative overflow-hidden ${
                  activeTab === tab 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center">
                  <div className={`transition-transform duration-300 ${activeTab === tab ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {icon}
                  </div>
                  <span className="font-medium">{label}</span>
                </div>
                {activeTab === tab && (
                  <div className="absolute right-2 w-1 h-8 bg-white rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
            
            <div className="pt-4 border-t border-gray-200 mt-4">
              <button 
                className="group flex items-center p-4 w-full rounded-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 text-gray-700"
              >
                <Users className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300" /> 
                <span className="font-medium">Clients</span>
              </button>
              <button 
                onClick={handleLogout}
                className="group flex items-center p-4 w-full rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-300 transform hover:scale-105 text-gray-700"
              >
                <LogOut className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform duration-300" /> 
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 transition-all duration-300">
        <div className="p-8 max-w-7xl mx-auto">

          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="text-center py-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-blue-800 bg-clip-text text-transparent mb-4">
                  Interior Designer Dashboard
                </h1>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Transform spaces, create dreams, and manage your design projects with elegance and precision
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  { label: 'Total Projects', value: stats.total, icon: <TrendingUp className="w-6 h-6" />, color: 'from-blue-500 to-cyan-500', delay: '0ms' },
                  { label: 'In Progress', value: stats.inProgress, icon: <Clock className="w-6 h-6" />, color: 'from-yellow-500 to-orange-500', delay: '100ms' },
                  { label: 'Under Review', value: stats.review, icon: <Eye className="w-6 h-6" />, color: 'from-purple-500 to-pink-500', delay: '200ms' },
                  { label: 'Completed', value: stats.completed, icon: <CheckCircle className="w-6 h-6" />, color: 'from-green-500 to-emerald-500', delay: '300ms' }
                ].map((stat, index) => (
                  <div 
                    key={stat.label}
                    className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-in slide-in-from-bottom"
                    style={{ animationDelay: stat.delay }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white group-hover:scale-110 transition-transform duration-300`}>
                        {stat.icon}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900 group-hover:scale-110 transition-transform duration-300">
                          {stat.value}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-600 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent Projects Preview */}
              {designs.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-8 animate-in fade-in duration-700" style={{ animationDelay: '400ms' }}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full mr-4"></div>
                    Recent Projects
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {designs.slice(0, 3).map((project, index) => (
                      <div 
                        key={project._id}
                        className="group bg-gray-50 rounded-xl p-4 hover:bg-white hover:shadow-lg transition-all duration-500 animate-in slide-in-from-bottom"
                        style={{ animationDelay: `${500 + index * 100}ms` }}
                      >
                        {project.imageURL && (
                          <div className="relative overflow-hidden rounded-lg mb-3 aspect-video">
                            <img 
                              src={project.imageURL} 
                              alt={project.projectName}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                        )}
                        <h3 className="font-semibold text-gray-900 mb-1">{project.projectName}</h3>
                        <p className="text-sm text-gray-600 mb-2">{project.clientName}</p>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    ))}
                  </div>
                  {designs.length > 3 && (
                    <div className="text-center mt-6">
                      <button
                        onClick={() => setActiveTab('view')}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                      >
                        View All Projects
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Add Project */}
          {activeTab === 'add' && (
            <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom duration-700">
              <div className="bg-white p-8 rounded-2xl shadow-xl">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                    Create New Project
                  </h2>
                  <p className="text-gray-600">Bring your creative vision to life</p>
                  <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto mt-4 rounded-full"></div>
                </div>
                
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                    <input 
                      type="text" 
                      name="projectName" 
                      value={formData.projectName} 
                      onChange={handleChange} 
                      placeholder="Enter project name" 
                      required 
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 group-hover:border-gray-300" 
                    />
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client Name</label>
                    <input 
                      type="text" 
                      name="clientName" 
                      value={formData.clientName} 
                      onChange={handleChange} 
                      placeholder="Enter client name" 
                      required 
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 group-hover:border-gray-300" 
                    />
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Info</label>
                    <input 
                      type="text" 
                      name="contact" 
                      value={formData.contact} 
                      onChange={handleChange} 
                      placeholder="Enter contact information" 
                      required 
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 group-hover:border-gray-300" 
                    />
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Status</label>
                    <select 
                      name="status" 
                      value={formData.status} 
                      onChange={handleChange} 
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 group-hover:border-gray-300"
                    >
                      <option>In Progress</option>
                      <option>Review</option>
                      <option>Completed</option>
                    </select>
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Image URL</label>
                    <input 
                      type="url" 
                      name="imageURL" 
                      value={formData.imageURL} 
                      onChange={handleChange} 
                      placeholder="Enter image URL" 
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 group-hover:border-gray-300" 
                    />
                    {imagePreview && (
                      <div className="mt-4 animate-in fade-in duration-500">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-48 object-cover rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300" 
                        />
                      </div>
                    )}
                    {imageError && (
                      <p className="text-red-500 text-sm mt-2 animate-in fade-in duration-300">{imageError}</p>
                    )}
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Adding Project...</span>
                      </>
                    ) : (
                      <>
                        <PlusSquare className="w-5 h-5" />
                        <span>Add Project</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* View Designs */}
          {activeTab === 'view' && (
            <div className="animate-in fade-in duration-700">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  Design Portfolio
                </h2>
                <p className="text-gray-600">Your creative masterpieces</p>
                <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto mt-4 rounded-full"></div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-600" />
                    <p className="text-gray-600">Loading your amazing projects...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {designs.length === 0 ? (
                    <div className="col-span-full text-center py-20">
                      <div className="bg-white rounded-2xl p-12 shadow-xl">
                        <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                          <Eye className="w-12 h-12 text-purple-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">No Projects Yet</h3>
                        <p className="text-gray-600 mb-6">Start creating amazing designs by adding your first project</p>
                        <button
                          onClick={() => setActiveTab('add')}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                        >
                          Add Your First Project
                        </button>
                      </div>
                    </div>
                  ) : (
                    designs.map((project, index) => (
                      <div
                        key={project._id}
                        className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden animate-in slide-in-from-bottom"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {editingId === project._id ? (
                          <div className="p-6 space-y-4 animate-in fade-in duration-300">
                            <input 
                              type="text" 
                              name="projectName" 
                              value={editFormData.projectName} 
                              onChange={handleEditChange} 
                              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-300" 
                            />
                            <input 
                              type="text" 
                              name="clientName" 
                              value={editFormData.clientName} 
                              onChange={handleEditChange} 
                              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-300" 
                            />
                            <input 
                              type="text" 
                              name="contact" 
                              value={editFormData.contact} 
                              onChange={handleEditChange} 
                              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-300" 
                            />
                            <select 
                              name="status" 
                              value={editFormData.status} 
                              onChange={handleEditChange} 
                              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-300"
                            >
                              <option>In Progress</option>
                              <option>Review</option>
                              <option>Completed</option>
                            </select>
                            <input 
                              type="url" 
                              name="imageURL" 
                              value={editFormData.imageURL} 
                              onChange={handleEditChange} 
                              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-300" 
                              placeholder="Image URL" 
                            />
                            {editImagePreview && (
                              <img 
                                src={editImagePreview} 
                                alt="Preview" 
                                className="w-full h-32 object-cover rounded-lg animate-in fade-in duration-300" 
                              />
                            )}
                            <div className="flex gap-3 justify-end pt-4">
                              <button 
                                onClick={() => handleUpdate(project._id)} 
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg"
                              >
                                <Save className="w-4 h-4"/> Save
                              </button>
                              <button 
                                onClick={cancelEdit} 
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg"
                              >
                                <X className="w-4 h-4"/> Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="animate-in fade-in duration-300">
                            {project.imageURL && (
                              <div className="relative overflow-hidden aspect-video">
                                <img 
                                  src={project.imageURL} 
                                  alt={project.projectName}
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                    project.status === 'Completed' ? 'bg-green-500 text-white' :
                                    project.status === 'In Progress' ? 'bg-blue-500 text-white' :
                                    'bg-yellow-500 text-white'
                                  }`}>
                                    {project.status}
                                  </span>
                                </div>
                              </div>
                            )}
                            <div className="p-6">
                              <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                                {project.projectName}
                              </h3>
                              <p className="text-gray-700 mb-1 flex items-center">
                                <Users className="w-4 h-4 mr-2 text-purple-500" />
                                {project.clientName}
                              </p>
                              <p className="text-sm text-gray-500 mb-4">{project.contact}</p>
                              
                              {!project.imageURL && (
                                <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full mb-4 ${
                                  project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                  project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {project.status}
                                </span>
                              )}
                              
                              <div className="flex gap-3">
                                <button 
                                  onClick={() => handleEdit(project)} 
                                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                                >
                                  <Edit2 className="w-4 h-4"/> Edit
                                </button>
                                <button 
                                  onClick={() => handleDelete(project._id)} 
                                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                                >
                                  <Trash2 className="w-4 h-4"/> Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes animate-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-from-bottom {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(147, 51, 234, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(147, 51, 234, 0.6);
          }
        }

        .animate-in {
          animation: animate-in 0.6s ease-out;
        }

        .slide-in-from-bottom {
          animation: slide-in-from-bottom 0.8s ease-out;
        }

        .fade-in {
          animation: fade-in 0.5s ease-out;
        }

        /* Custom scrollbar for sidebar */
        aside::-webkit-scrollbar {
          width: 4px;
        }

        aside::-webkit-scrollbar-track {
          background: transparent;
        }

        aside::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #9333ea, #3b82f6);
          border-radius: 2px;
        }

        aside::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7c3aed, #2563eb);
        }

        /* Floating animation for dashboard stats */
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .group:hover .floating-icon {
          animation: float 2s ease-in-out infinite;
        }

        /* Glass effect for cards */
        .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* Gradient border animation */
        @keyframes gradient-border {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .gradient-border {
          background: linear-gradient(45deg, #9333ea, #3b82f6, #06b6d4, #9333ea);
          background-size: 300% 300%;
          animation: gradient-border 3s ease infinite;
        }

        /* Enhanced hover effects */
        .card-hover {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-hover:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        }

        /* Ripple effect for buttons */
        .ripple-effect {
          position: relative;
          overflow: hidden;
        }

        .ripple-effect::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .ripple-effect:hover::before {
          width: 300px;
          height: 300px;
        }

        /* Loading spinner enhancement */
        @keyframes spin-glow {
          from {
            transform: rotate(0deg);
            filter: drop-shadow(0 0 10px rgba(147, 51, 234, 0.5));
          }
          to {
            transform: rotate(360deg);
            filter: drop-shadow(0 0 20px rgba(147, 51, 234, 0.8));
          }
        }

        .spin-glow {
          animation: spin-glow 1s linear infinite;
        }

        /* Staggered animation for grid items */
        .stagger-animation > * {
          animation-delay: calc(var(--stagger) * 100ms);
        }

        /* Smooth transitions for all interactive elements */
        * {
          transition-property: transform, box-shadow, background-color, border-color, color, fill, stroke, opacity;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Enhanced focus states */
        input:focus, select:focus, button:focus {
          outline: none;
          ring: 4px;
          ring-color: rgba(147, 51, 234, 0.3);
        }

        /* Micro-animations for icons */
        .icon-bounce:hover {
          animation: bounce 0.6s ease-in-out;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        /* Text gradient animation */
        @keyframes gradient-text {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animated-gradient-text {
          background: linear-gradient(45deg, #9333ea, #3b82f6, #06b6d4, #9333ea);
          background-size: 300% 300%;
          animation: gradient-text 3s ease infinite;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        /* Shadow variations */
        .shadow-glow {
          box-shadow: 0 0 30px rgba(147, 51, 234, 0.2);
        }

        .shadow-glow-blue {
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.2);
        }

        .shadow-glow-green {
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.2);
        }

        .shadow-glow-yellow {
          box-shadow: 0 0 30px rgba(245, 158, 11, 0.2);
        }

        /* Enhanced form animations */
        .form-group {
          position: relative;
        }

        .form-group input:focus + label,
        .form-group input:not(:placeholder-shown) + label {
          transform: translateY(-25px) scale(0.8);
          color: #9333ea;
        }

        .form-group label {
          position: absolute;
          left: 12px;
          top: 12px;
          transition: all 0.3s ease;
          pointer-events: none;
          background: white;
          padding: 0 4px;
        }

        /* Progress indicator */
        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }

        .progress-bar {
          animation: progress 2s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default DesignerDashboard;