import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, FileText, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import useContactStore from '../../stores/contactStore';

const Dashboard = () => {
  const { user, currentFirm } = useAuthStore();
  const { stats, fetchStats, contacts } = useContactStore();

  useEffect(() => {
    fetchStats();
  }, []);

  const recentActivities = [
    { id: 1, type: 'contact', action: 'Added new contact', name: 'John Doe', time: '2 hours ago', icon: Users },
    { id: 2, type: 'matter', action: 'Updated matter', name: 'Smith vs Johnson', time: '5 hours ago', icon: FileText },
    { id: 3, type: 'task', action: 'Completed task', name: 'Review documents', time: '1 day ago', icon: CheckCircle },
  ];

  const upcomingEvents = [
    { id: 1, title: 'Court Hearing', matter: 'Smith vs Johnson', date: 'Today, 2:00 PM', status: 'upcoming' },
    { id: 2, title: 'Client Meeting', matter: 'Doe Construction', date: 'Tomorrow, 10:00 AM', status: 'upcoming' },
    { id: 3, title: 'Deadline: File Appeal', matter: 'State vs Brown', date: 'Dec 15, 2025', status: 'warning' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Hello, {user?.firstName || user?.username}!</h1>
        <p className="mt-1 opacity-90">Welcome back to Praava - Your Legal Practice Management Platform</p>
        {currentFirm?.subscriptionStatus === 'TRIAL' && (
          <div className="mt-3 inline-flex items-center px-3 py-1 bg-yellow-500 rounded-full text-sm">
            <AlertCircle size={14} className="mr-1" />
            Trial ends in 14 days - Upgrade to unlock advanced features
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Contacts</p>
              <p className="text-2xl font-bold">{stats?.total || 0}</p>
            </div>
            <Users size={32} className="text-primary-500 opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Matters</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <FileText size={32} className="text-green-500 opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Tasks</p>
              <p className="text-2xl font-bold">8</p>
            </div>
            <Clock size={32} className="text-blue-500 opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Outstanding Bills</p>
              <p className="text-2xl font-bold">$12,450</p>
            </div>
            <DollarSign size={32} className="text-yellow-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
            </div>
            <div className="divide-y">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="p-4 flex items-center space-x-3 hover:bg-gray-50">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <activity.icon size={16} className="text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.action}</span> {activity.name}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Today - Events</h2>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3 border rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{event.matter}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      event.status === 'warning' 
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {event.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mb-2">
              <Users size={20} className="text-primary-600" />
            </div>
            <p className="font-medium text-sm">Add Contact</p>
            <p className="text-xs text-gray-500">New client or witness</p>
          </button>
          <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-2">
              <FileText size={20} className="text-green-600" />
            </div>
            <p className="font-medium text-sm">New Matter</p>
            <p className="text-xs text-gray-500">Create a case</p>
          </button>
          <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
              <Calendar size={20} className="text-blue-600" />
            </div>
            <p className="font-medium text-sm">Schedule Event</p>
            <p className="text-xs text-gray-500">Court date or meeting</p>
          </button>
          <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
              <DollarSign size={20} className="text-purple-600" />
            </div>
            <p className="font-medium text-sm">Create Bill</p>
            <p className="text-xs text-gray-500">Invoice client</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;