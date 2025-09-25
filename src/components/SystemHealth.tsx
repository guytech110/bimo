import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, Settings, AlertTriangle, CheckCircle, Clock, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface SystemHealthProps {
  onBack: () => void;
}

export default function SystemHealth({ onBack }: SystemHealthProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const performanceData = [
    { time: '00:00', responseTime: 145, uptime: 99.9, errorRate: 0.1 },
    { time: '04:00', responseTime: 132, uptime: 99.8, errorRate: 0.2 },
    { time: '08:00', responseTime: 189, uptime: 99.7, errorRate: 0.3 },
    { time: '12:00', responseTime: 234, uptime: 99.9, errorRate: 0.1 },
    { time: '16:00', responseTime: 198, uptime: 99.8, errorRate: 0.2 },
    { time: '20:00', responseTime: 156, uptime: 99.9, errorRate: 0.1 },
    { time: '24:00', responseTime: 145, uptime: 99.9, errorRate: 0.1 }
  ];

  const systemComponents = [
    {
      id: 'api-gateway',
      name: 'API Gateway',
      status: 'operational',
      uptime: 99.9,
      responseTime: 145,
      lastCheck: '2 minutes ago',
      description: 'Main API endpoint handling all requests'
    },
    {
      id: 'database',
      name: 'Database Cluster',
      status: 'operational',
      uptime: 99.95,
      responseTime: 23,
      lastCheck: '1 minute ago',
      description: 'Primary PostgreSQL cluster'
    },
    {
      id: 'cache',
      name: 'Redis Cache',
      status: 'operational',
      uptime: 99.8,
      responseTime: 5,
      lastCheck: '30 seconds ago',
      description: 'In-memory data structure store'
    },
    {
      id: 'queue',
      name: 'Message Queue',
      status: 'degraded',
      uptime: 98.5,
      responseTime: 890,
      lastCheck: '5 minutes ago',
      description: 'Background job processing system'
    },
    {
      id: 'storage',
      name: 'File Storage',
      status: 'operational',
      uptime: 99.7,
      responseTime: 67,
      lastCheck: '3 minutes ago',
      description: 'S3-compatible object storage'
    },
    {
      id: 'monitoring',
      name: 'Monitoring System',
      status: 'maintenance',
      uptime: 95.2,
      responseTime: 0,
      lastCheck: 'Offline',
      description: 'System health monitoring and alerting'
    }
  ];

  const alerts = [
    {
      id: '1',
      severity: 'high',
      component: 'Message Queue',
      message: 'High response time detected (890ms avg)',
      timestamp: '2024-01-15T14:30:00Z',
      status: 'active'
    },
    {
      id: '2',
      severity: 'medium',
      component: 'API Gateway',
      message: 'Increased error rate in /api/providers endpoint',
      timestamp: '2024-01-15T13:45:00Z',
      status: 'investigating'
    },
    {
      id: '3',
      severity: 'low',
      component: 'Monitoring System',
      message: 'Scheduled maintenance in progress',
      timestamp: '2024-01-15T12:00:00Z',
      status: 'scheduled'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-100';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'outage':
        return 'text-red-600 bg-red-100';
      case 'maintenance':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'outage':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'maintenance':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500  " />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
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
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">System Health Dashboard</h1>
            <p className="text-gray-600">Real-time monitoring and performance metrics</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <label htmlFor="autoRefresh" className="text-sm text-gray-700">Auto-refresh</label>
          </div>
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Response Time</h3>
          <p className="text-3xl font-bold text-gray-900">245ms</p>
          <div className="flex items-center mt-2">
            <span className="text-sm text-red-600">+12ms vs last hour</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-600 mb-2">System Uptime</h3>
          <p className="text-3xl font-bold text-gray-900">99.2%</p>
          <div className="flex items-center mt-2">
            <span className="text-sm text-green-600">+0.1% vs last hour</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Error Rate</h3>
          <p className="text-3xl font-bold text-gray-900">0.12%</p>
          <div className="flex items-center mt-2">
            <span className="text-sm text-green-600">-0.05% vs last hour</span>
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Chart */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Line type="monotone" dataKey="responseTime" stroke="#14b8a6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Uptime Chart */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Uptime</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis domain={[99, 100]} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Area type="monotone" dataKey="uptime" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* System Components */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">System Components</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {systemComponents.map((component) => (
            <div key={component.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(component.status)}
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-900">{component.name}</h4>
                    <p className="text-sm text-gray-600">{component.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{component.uptime}%</p>
                    <p className="text-xs text-gray-500">Uptime</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{component.responseTime}ms</p>
                    <p className="text-xs text-gray-500">Response</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Last check:</p>
                    <p className="text-xs text-gray-600">{component.lastCheck}</p>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(component.status)}`}>
                    {component.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Alerts */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Alerts</h3>
        
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">{alert.component}</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-1">{alert.message}</p>
                    <p className="text-sm text-gray-500">{formatTimestamp(alert.timestamp)}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm bg-teal-100 text-teal-700 rounded hover:bg-teal-200">
                    Acknowledge
                  </button>
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                    Investigate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
