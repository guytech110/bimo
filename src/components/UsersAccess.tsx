import React, { useState } from 'react';
import { Plus, Edit, Trash2, Shield, User, Mail, Calendar, MoreVertical, Key, Copy, Eye, EyeOff, RefreshCw } from 'lucide-react';

export default function UsersAccess() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'api-keys'>('users');
  const [showCreateApiKey, setShowCreateApiKey] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>([]);

  const users = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@startup.com',
      role: 'Admin',
      department: 'Engineering',
      lastActive: '2024-01-15T10:30:00Z',
      status: 'active',
      avatar: null
    },
    {
      id: '2',
      name: 'Sarah Chen',
      email: 'sarah@startup.com',
      role: 'Editor',
      department: 'Finance',
      lastActive: '2024-01-15T09:15:00Z',
      status: 'active',
      avatar: null
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@startup.com',
      role: 'Viewer',
      department: 'Marketing',
      lastActive: '2024-01-14T16:45:00Z',
      status: 'active',
      avatar: null
    },
    {
      id: '4',
      name: 'Emily Rodriguez',
      email: 'emily@startup.com',
      role: 'Editor',
      department: 'Operations',
      lastActive: '2024-01-13T14:20:00Z',
      status: 'inactive',
      avatar: null
    },
    {
      id: '5',
      name: 'David Kim',
      email: 'david@startup.com',
      role: 'Viewer',
      department: 'Engineering',
      lastActive: '2024-01-15T08:30:00Z',
      status: 'active',
      avatar: null
    }
  ];

  const roles = [
    {
      id: 'admin',
      name: 'Admin',
      description: 'Full access to all features and settings',
      userCount: 1,
      permissions: [
        'View all providers and spending data',
        'Manage budgets and alerts',
        'Add/remove payment methods',
        'Invite and manage users',
        'Configure system settings',
        'Export data and reports'
      ]
    },
    {
      id: 'editor',
      name: 'Editor',
      description: 'Can view and edit most features',
      userCount: 2,
      permissions: [
        'View all providers and spending data',
        'Manage budgets and alerts',
        'View billing information',
        'Export data and reports'
      ]
    },
    {
      id: 'viewer',
      name: 'Viewer',
      description: 'Read-only access to data and reports',
      userCount: 2,
      permissions: [
        'View providers and spending data',
        'View budgets and alerts',
        'View billing information',
        'Export basic reports'
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
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

  const apiKeys = [
    {
      id: '1',
      name: 'Production API Key',
      key: 'bimo_live_sk_1234567890abcdef1234567890abcdef',
      permissions: ['read:providers', 'read:budgets', 'read:billing'],
      createdBy: 'John Doe',
      createdAt: '2024-01-01T10:00:00Z',
      lastUsed: '2024-01-15T14:30:00Z',
      status: 'active'
    },
    {
      id: '2',
      name: 'Development API Key',
      key: 'bimo_test_sk_abcdef1234567890abcdef1234567890',
      permissions: ['read:providers', 'write:budgets'],
      createdBy: 'Sarah Chen',
      createdAt: '2024-01-10T15:30:00Z',
      lastUsed: '2024-01-14T09:15:00Z',
      status: 'active'
    },
    {
      id: '3',
      name: 'Analytics Dashboard',
      key: 'bimo_live_sk_fedcba0987654321fedcba0987654321',
      permissions: ['read:providers', 'read:billing', 'read:users'],
      createdBy: 'Mike Johnson',
      createdAt: '2023-12-15T11:20:00Z',
      lastUsed: '2024-01-12T16:45:00Z',
      status: 'active'
    },
    {
      id: '4',
      name: 'Legacy Integration',
      key: 'bimo_live_sk_0123456789abcdef0123456789abcdef',
      permissions: ['read:providers'],
      createdBy: 'Emily Rodriguez',
      createdAt: '2023-11-20T14:10:00Z',
      lastUsed: '2023-12-20T10:30:00Z',
      status: 'inactive'
    }
  ];

  const availablePermissions = [
    { id: 'read:providers', label: 'Read Providers', description: 'View provider information and metrics' },
    { id: 'write:providers', label: 'Write Providers', description: 'Connect and manage providers' },
    { id: 'read:budgets', label: 'Read Budgets', description: 'View budget information and alerts' },
    { id: 'write:budgets', label: 'Write Budgets', description: 'Create and modify budgets' },
    { id: 'read:billing', label: 'Read Billing', description: 'View billing and invoice data' },
    { id: 'write:billing', label: 'Write Billing', description: 'Manage billing and payment methods' },
    { id: 'read:users', label: 'Read Users', description: 'View user information and permissions' },
    { id: 'write:users', label: 'Write Users', description: 'Manage users and permissions' }
  ];

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatLastUsed = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 30) {
      return `${diffInDays} days ago`;
    } else {
      return formatTimestamp(timestamp);
    }
  };

  const handleCreateApiKey = () => {
    // Create API key logic here
    setShowCreateApiKey(false);
    setNewKeyName('');
    setNewKeyPermissions([]);
  };

  const handlePermissionToggle = (permission: string) => {
    setNewKeyPermissions(prev => 
      prev.includes(permission) 
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.substring(0, 12) + '•'.repeat(20) + key.substring(key.length - 8);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Users & Access</h1>
          <p className="text-gray-600">Manage team members and their permissions</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Invite User
        </button>
      </div>

      {/* Stats Cards - Different for API Keys tab */}
      {activeTab === 'api-keys' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total API Keys</h3>
              <Key className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{apiKeys.length}</p>
            <p className="text-sm text-gray-500">Active and inactive keys</p>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Active Keys</h3>
              <div className="w-5 h-5 bg-green-500 rounded-full"></div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {apiKeys.filter(key => key.status === 'active').length}
            </p>
            <p className="text-sm text-green-600">Currently in use</p>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Last Used</h3>
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">Today</p>
            <p className="text-sm text-gray-500">Most recent activity</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            <p className="text-sm text-gray-500">Active team members</p>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Active Users</h3>
              <div className="w-5 h-5 bg-green-500 rounded-full"></div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {users.filter(u => u.status === 'active').length}
            </p>
            <p className="text-sm text-green-600">Online recently</p>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Departments</h3>
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">4</p>
            <p className="text-sm text-gray-500">Engineering, Finance, Marketing, Operations</p>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Roles</h3>
              <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
            <p className="text-sm text-gray-500">Admin, Editor, Viewer</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'roles'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Roles & Permissions
          </button>
          <button
            onClick={() => setActiveTab('api-keys')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'api-keys'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            API Keys
          </button>
        </nav>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
              <div className="flex items-center space-x-3">
                <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                  <option value="all">All Departments</option>
                  <option value="engineering">Engineering</option>
                  <option value="finance">Finance</option>
                  <option value="marketing">Marketing</option>
                  <option value="operations">Operations</option>
                </select>
                <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                          <span className="text-sm font-medium text-gray-600">
                            {getUserInitials(user.name)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatLastActive(user.lastActive)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-teal-600 hover:text-teal-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div key={role.id} className="bg-white rounded-lg border shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <Shield className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{role.name}</h3>
                      <p className="text-sm text-gray-500">{role.userCount} users</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{role.description}</p>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">Permissions:</h4>
                  <ul className="space-y-1">
                    {role.permissions.map((permission, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                        {permission}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="w-full py-2 px-4 text-sm font-medium text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100">
                    Manage Role
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Role Management Actions */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Plus className="w-4 h-4 mr-2" />
                Create Custom Role
              </button>
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Shield className="w-4 h-4 mr-2" />
                Bulk Permission Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api-keys' && (
        <div className="space-y-6">
          {/* API Keys Table */}
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">API Keys</h3>
                <button 
                  onClick={() => setShowCreateApiKey(true)}
                  className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create API Key
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      API Key
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Permissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Used
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {apiKeys.map((apiKey) => (
                    <tr key={apiKey.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Key className="w-4 h-4 text-gray-400 mr-3" />
                          <div className="font-medium text-gray-900">{apiKey.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                            {visibleKeys.has(apiKey.id) ? apiKey.key : maskApiKey(apiKey.key)}
                          </code>
                          <button
                            onClick={() => toggleKeyVisibility(apiKey.id)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            {visibleKeys.has(apiKey.id) ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => copyToClipboard(apiKey.key)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {apiKey.permissions.slice(0, 2).map((permission) => (
                            <span key={permission} className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {permission.split(':')[1]}
                            </span>
                          ))}
                          {apiKey.permissions.length > 2 && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                              +{apiKey.permissions.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{apiKey.createdBy}</div>
                        <div className="text-sm text-gray-500">{formatTimestamp(apiKey.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatLastUsed(apiKey.lastUsed)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(apiKey.status)}`}>
                          {apiKey.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-teal-600 hover:text-teal-900">
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button className="text-gray-400 hover:text-gray-600">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* API Key Security Guidelines */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Guidelines</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Best Practices</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                    Store API keys securely and never commit them to version control
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                    Use environment variables or secure key management systems
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                    Rotate API keys regularly and revoke unused keys
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                    Grant minimum required permissions for each use case
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Rate Limits</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex justify-between">
                    <span>Standard API calls:</span>
                    <span className="font-medium">1,000/hour</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Bulk operations:</span>
                    <span className="font-medium">100/hour</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Data exports:</span>
                    <span className="font-medium">10/day</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create API Key Modal */}
      {showCreateApiKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Create API Key</h3>
              <button
                onClick={() => setShowCreateApiKey(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key Name
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production Dashboard, Analytics Service"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Choose a descriptive name to identify this API key's purpose
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Permissions
                </label>
                <div className="space-y-3">
                  {availablePermissions.map((permission) => (
                    <label key={permission.id} className="flex items-start">
                      <input
                        type="checkbox"
                        checked={newKeyPermissions.includes(permission.id)}
                        onChange={() => handlePermissionToggle(permission.id)}
                        className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{permission.label}</div>
                        <div className="text-sm text-gray-500">{permission.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Security Notice</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      API keys provide access to your bimo account. Store them securely and never share them publicly. 
                      You'll only be able to view the full key once after creation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={() => setShowCreateApiKey(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateApiKey}
                disabled={!newKeyName.trim() || newKeyPermissions.length === 0}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create API Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
