// src/pages/Dashboard/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { dashboardService } from '../../services/dashboard.service';
import { Button } from '../../components/UI/Button';
import {
  FolderIcon,
  UsersIcon,
  CheckCircleIcon,
  DollarSignIcon,
  AlertCircleIcon,
  CalendarIcon,
  TrendingUpIcon,
} from 'lucide-react';
import { DashboardSummary, UpcomingEvent, RecentActivity } from '../../types';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { Card } from '../../components/UI/Card';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, currentFirm } = useAuthStore();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [summaryData, eventsData, activitiesData] = await Promise.all([
          dashboardService.getSummary(),
          dashboardService.getUpcomingEvents(7),
          dashboardService.getRecentActivities(10),
        ]);
        setSummary(summaryData);
        setUpcomingEvents(eventsData.events);
        setRecentActivities(activitiesData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const quickActions = [
    { action: 'Create Matter', icon: FolderIcon, url: '/matters/create', color: 'bg-blue-500' },
    { action: 'Add Contact', icon: UsersIcon, url: '/contacts/create', color: 'bg-green-500' },
    { action: 'Create Task', icon: CheckCircleIcon, url: '/tasks/create', color: 'bg-purple-500' },
    { action: 'Add Event', icon: CalendarIcon, url: '/calendar/create', color: 'bg-orange-500' },
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold">Hello, {user?.firstName}!</h2>
        <p className="text-primary-100 mt-1">
          Welcome to Praava - Your Law Firm Management Solution
        </p>
        {currentFirm?.role === 'VIEWER' && (
          <div className="mt-4 p-3 bg-primary-500/30 rounded-lg">
            <p className="text-sm">Upgrade your plan to unlock advanced features</p>
          </div>
        )}
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Matters</p>
              <p className="text-2xl font-bold mt-1">{summary?.matters.total || 0}</p>
              <p className="text-xs text-gray-400 mt-1">
                {summary?.matters.open} Open · {summary?.matters.pending} Pending
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <FolderIcon className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Contacts</p>
              <p className="text-2xl font-bold mt-1">{summary?.contacts.total || 0}</p>
              <p className="text-xs text-gray-400 mt-1">
                {summary?.contacts.clients} Clients · {summary?.contacts.opponents} Opponents
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <UsersIcon className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tasks</p>
              <p className="text-2xl font-bold mt-1">{summary?.tasks.total || 0}</p>
              <p className="text-xs text-gray-400 mt-1">
                {summary?.tasks.dueToday} Due Today · {summary?.tasks.overdue} Overdue
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Outstanding Bills</p>
              <p className="text-2xl font-bold mt-1">
                ${summary?.billing.totalOutstanding?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {summary?.billing.overdueBills} Overdue
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <DollarSignIcon className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.action}
              onClick={() => navigate(action.url)}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 rounded-full ${action.color} flex items-center justify-center`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">{action.action}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Upcoming Events & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Card className="p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Upcoming Events</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {upcomingEvents.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No events scheduled</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate('/calendar/create')}
                >
                  Create new event
                </Button>
              </div>
            ) : (
              upcomingEvents.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="px-6 py-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/calendar/events/${event.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{event.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(event.startDateTime).toLocaleDateString()} ·{' '}
                        {event.matterTitle && `Matter: ${event.matterTitle}`}
                      </p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
        
        {/* Recent Activity */}
        <Card className="p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivities.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <TrendingUpIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            ) : (
              recentActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="px-6 py-3">
                  <p className="text-sm text-gray-800">{activity.description || activity.activityType}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-400">{activity.userName || 'System'}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};