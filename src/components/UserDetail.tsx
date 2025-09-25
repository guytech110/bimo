import React, { useState } from 'react';
import { ArrowLeft, Edit, Trash2, Shield, Mail, Calendar, Activity, Settings } from 'lucide-react';

interface UserDetailProps {
  userId: string;
  onBack: () => void;
}

export default function UserDetail({ userId, onBack }: UserDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [userRole, setUserRole] = useState('Editor');
  const [userDepartment, setUserDepartment] = useState('Finance');
  const [userStatus, setUserStatus] = useState('active');

  const userData = {
    id: '2',
    name: 'Sarah Chen',
    email: 'sarah@startup.com',
    role: 'Editor',
    department: 'Finance',
    status: 'active',
    joinDate: '2023-08-15',
    lastActive: '2024-01-15T09:15:00Z',
    avatar: null,
    phone: '+1 (555) 123-4567',
    timezone: 'PST (UTC-8)'
  };

  const activityLog = [
    {
      id: '1',
      action: 'Updated budget for Claude API',
      timestamp: '2024-01-15T09:15:00Z',
      type: 'budget_update'
    },
    {
      id: '2',
      action: 'Viewed AWS spending report',
      timestamp: '2024-01-15T08:30:00Z',
      type: 'report_view'
    },
    {
      id: '3',
      action: 'Created alert for OpenAI usage',
      timestamp: '2024-01-14T16:45:00Z',
      type: 'alert_create'
    },
    {
      id: '4',
      action: 'Exported billing data',
      timestamp: '2024-01-14T14:20:00Z',
      type: 'data_export'
    },
    {
      id: '5',
      action: 'Logged in to dashboard',
      timestamp: '2024-01-14T09:00:00Z',
      type: 'login'
    }
  ];

  const permissions = [
    { id: 'view_providers', label: 'View Providers', granted: true },
    { id: 'manage_budgets', label: 'Manage Budgets', granted: true },
    { id: 'view_billing', label: 'View Billing', granted: true },
    { id: 'export_data', label: 'Export Data', granted: true },
    { id: 'manage_users', label: 'Manage Users', granted: false },
    { id: 'system_settings', label: 'System Settings', granted: false }
  ];

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatLastActive = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'budget_update':
        return '💰';
      case 'report_view':
        return '📊';
      case 'alert_create':
        return '🔔';
      case 'data_export':
        return '📤';
      case 'login':
        return '🔐';
      default:
        return '📝';
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    // Save logic here
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
              <span className="text-xl font-medium text-gray-600">
                {getUserInitials(userData.name)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{userData.name}</h1>
              <p className="text-gray-600">{userData.email}</p>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit User
              </button>
              <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Deactivate
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* User Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  defaultValue={userData.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{userData.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  defaultValue={userData.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{userData.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  defaultValue={userData.phone}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{userData.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              {isEditing ? (
                <select
                  defaultValue={userData.timezone}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="PST (UTC-8)">PST (UTC-8)</option>
                  <option value="EST (UTC-5)">EST (UTC-5)</option>
                  <option value="UTC">UTC</option>
                </select>
              ) : (
                <p className="text-gray-900">{userData.timezone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Role & Access */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Role & Access</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              {isEditing ? (
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="Admin">Admin</option>
                  <option value="Editor">Editor</option>
                  <option value="Viewer">Viewer</option>
                </select>
              ) : (
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getRoleColor(userData.role)}`}>
                  {userData.role}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              {isEditing ? (
                <select
                  value={userDepartment}
                  onChange={(e) => setUserDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                </select>
              ) : (
                <p className="text-gray-900">{userData.department}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              {isEditing ? (
                <select
                  value={userStatus}
                  onChange={(e) => setUserStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              ) : (
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(userData.status)}`}>
                  {userData.status.charAt(0).toUpperCase() + userData.status.slice(1)}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
              <p className="text-gray-900">{userData.joinDate}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Active</label>
              <p className="text-gray-900">{formatLastActive(userData.lastActive)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {permissions.map((permission) => (
            <div key={permission.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <Shield className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-700">{permission.label}</span>
              </div>
              <div className={`w-3 h-3 rounded-full ${permission.granted ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        
        <div className="space-y-4">
          {activityLog.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 border border-gray-100 rounded-lg">
              <div className="text-xl">{getActionIcon(activity.type)}</div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
