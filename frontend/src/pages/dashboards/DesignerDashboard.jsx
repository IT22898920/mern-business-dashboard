import React from 'react';
import { Palette, Layout, Users, Calendar } from 'lucide-react';
import Navbar from '../../components/Navbar';

const DesignerDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interior Designer Dashboard</h1>
          <p className="text-gray-600">Manage your design projects and client consultations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Layout className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-semibold text-gray-900">8</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-semibold text-gray-900">32</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Palette className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Designs</p>
                <p className="text-2xl font-semibold text-gray-900">45</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Week's Meetings</p>
                <p className="text-2xl font-semibold text-gray-900">12</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Projects</h2>
            <div className="space-y-4">
              {[
                { name: "Modern Living Room", client: "Smith Family", status: "In Progress" },
                { name: "Office Renovation", client: "ABC Corp", status: "Review" },
                { name: "Bedroom Makeover", client: "Johnson Home", status: "Completed" }
              ].map((project, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{project.name}</p>
                    <p className="text-sm text-gray-500">Client: {project.client}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    project.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                    project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">New Design Project</div>
                <div className="text-sm text-gray-500">Start a new interior design project</div>
              </button>
              <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Schedule Consultation</div>
                <div className="text-sm text-gray-500">Book meeting with client</div>
              </button>
              <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Design Gallery</div>
                <div className="text-sm text-gray-500">View and manage your design portfolio</div>
              </button>
              <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Client Feedback</div>
                <div className="text-sm text-gray-500">Review client reviews and feedback</div>
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { time: "10:00 AM", client: "Sarah Wilson", project: "Kitchen Design" },
              { time: "2:00 PM", client: "Mike Brown", project: "Home Office" },
              { time: "4:30 PM", client: "Emma Davis", project: "Living Room" }
            ].map((appointment, index) => (
              <div key={index} className="p-4 border-l-4 border-purple-500 bg-purple-50 rounded-r-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-700">{appointment.time}</span>
                  <Calendar className="h-4 w-4 text-purple-500" />
                </div>
                <p className="font-medium text-gray-900">{appointment.client}</p>
                <p className="text-sm text-gray-600">{appointment.project}</p>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default DesignerDashboard;