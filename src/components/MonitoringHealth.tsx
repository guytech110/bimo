import React, { useState } from 'react';
import { RefreshCw, Settings, Globe, Activity, Clock, Database, Server, Zap, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function MonitoringHealth() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  const systemPerformanceData = [
    { time: '14:00', cpu: 45, memory: 58 },
    { time: '14:05', cpu: 48, memory: 62 },
    { time: '14:10', cpu: 42, memory: 59 },
    { time: '14:15', cpu: 52, memory: 65 },
    { time: '14:20', cpu: 68, memory: 72 },
    { time: '14:25', cpu: 58, memory: 68 },
    { time: '14:30', cpu: 45, memory: 62 }
  ];

  const responseTimeData = [
    { time: '14:00', p50: 245, p95: 380, p99: 520 },
    { time: '14:05', p50: 260, p95: 420, p99: 580 },
    { time: '14:10', p50: 220, p95: 350, p99: 480 },
    { time: '14:15', p50: 280, p95: 450, p99: 620 },
    { time: '14:20', p50: 320, p95: 520, p99: 720 },
    { time: '14:25', p50: 270, p95: 410, p99: 580 },
    { time: '14:30', p50: 240, p95: 380, p99: 520 }
  ];

  const backgroundJobs = [
    {
      id: '1',
      name: 'AWS Cost Sync',
      lastRun: '2025-01-07 14:30:00',
      nextRun: '2025-01-07 15:30:00',
      duration: '45s',
      status: 'Success',
      description: 'Syncs AWS billing data',
      icon: CheckCircle,
      iconColor: 'text-green-500'
    },
    {
      id: '2',
      name: 'Claude Usage Aggregation',
      lastRun: '2025-01-07 14:25:00',
      nextRun: '2025-01-07 14:55:00',
      duration: '12s',
      status: 'Success',
      description: 'Aggregates Claude API usage metrics',
      icon: CheckCircle,
      iconColor: 'text-green-500'
    },
    {
      id: '3',
      name: 'Budget Alert Check',
      lastRun: '2025-01-07 14:15:00',
      nextRun: '2025-01-07 15:15:00',
      duration: '8s',
      status: 'Warning',
      description: 'Checks budget thresholds and sends alerts',
      icon: AlertTriangle,
      iconColor: 'text-yellow-500'
    },
    {
      id: '4',
      name: 'Cache Optimization',
      lastRun: '2025-01-07 12:00:00',
      nextRun: '2025-01-08 12:00:00',
      duration: '120s',
      status: 'Failed',
      description: 'Optimizes API response caching',
      icon: XCircle,
      iconColor: 'text-red-500'
    },
    {
      id: '5',
      name: 'Data Backup',
      lastRun: '2025-01-07 03:00:00',
      nextRun: '2025-01-08 03:00:00',
      duration: '300s',
      status: 'Success',
      description: 'Daily backup of configuration and usage data',
      icon: CheckCircle,
      iconColor: 'text-green-500'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'Warning':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Failed':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getProgressBarColor = (value: number, type: string) => {
    if (type === 'cpu' || type === 'memory') {
      if (value >= 80) return 'bg-red-500';
      if (value >= 60) return 'bg-yellow-500';
      return 'bg-gray-900';
    }
    return 'bg-gray-900';
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Monitoring & Health</h1>
          <p className="text-gray-600">System health, performance metrics, and job status</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium">
            <Settings className="w-4 h-4 mr-2" />
            Configure Alerts
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Globe className="w-5 h-5 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-600">API Uptime</span>
            </div>
          </div>
          <div className="mb-2">
            <span className="text-3xl font-bold text-gray-900">99.97%</span>
          </div>
          <div className="text-sm text-green-600">healthy</div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-600">Avg Response Time</span>
            </div>
          </div>
          <div className="mb-2">
            <span className="text-3xl font-bold text-gray-900">245ms</span>
          </div>
          <div className="text-sm text-green-600">healthy</div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Database className="w-5 h-5 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-600">Cache Hit Ratio</span>
            </div>
          </div>
          <div className="mb-2">
            <span className="text-3xl font-bold text-gray-900">84.5%</span>
          </div>
          <div className="text-sm text-green-600">healthy</div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-600">Error Rate</span>
            </div>
          </div>
          <div className="mb-2">
            <span className="text-3xl font-bold text-gray-900">0.03%</span>
          </div>
          <div className="text-sm text-green-600">healthy</div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Performance */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center mb-4">
            <Settings className="w-5 h-5 text-gray-600 mr-2" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">System Performance</h3>
              <p className="text-gray-600 text-sm">CPU and memory utilization over time</p>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={systemPerformanceData}>
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  domain={[0, 80]}
                />
                <Area 
                  type="monotone" 
                  dataKey="memory" 
                  stackId="1"
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="cpu" 
                  stackId="1"
                  stroke="#06b6d4" 
                  fill="#06b6d4" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Response Times */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center mb-4">
            <Clock className="w-5 h-5 text-gray-600 mr-2" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Response Times</h3>
              <p className="text-gray-600 text-sm">API response time percentiles</p>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={responseTimeData}>
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  domain={[0, 800]}
                />
                <Line 
                  type="monotone" 
                  dataKey="p50" 
                  stroke="#14b8a6" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="p95" 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="p99" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Server Status */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center mb-4">
            <Server className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Server Status</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">CPU Usage</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${getProgressBarColor(44, 'cpu')}`} style={{ width: '44%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">44%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Memory Usage</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${getProgressBarColor(64, 'memory')}`} style={{ width: '64%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">64%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Disk Usage</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${getProgressBarColor(32, 'disk')}`} style={{ width: '32%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">32%</span>
              </div>
            </div>
          </div>
        </div>

        {/* API Health */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center mb-4">
            <Activity className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">API Health</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Requests/min</span>
              <span className="text-sm font-medium text-gray-900">1,250</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Connections</span>
              <span className="text-sm font-medium text-gray-900">847</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Queue Size</span>
              <span className="text-sm font-medium text-gray-900">12</span>
            </div>
          </div>
        </div>

        {/* Database Health */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center mb-4">
            <Database className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Database Health</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Connection Pool</span>
              <span className="text-sm font-medium text-green-600">Healthy</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Query Time</span>
              <span className="text-sm font-medium text-gray-900">12ms avg</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Storage Used</span>
              <span className="text-sm font-medium text-gray-900">2.4GB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background Jobs */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Zap className="w-5 h-5 text-gray-600 mr-2" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Background Jobs</h3>
              <p className="text-gray-600">Scheduled tasks and their execution status</p>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                  Job Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                  Last Run
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                  Next Run
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {backgroundJobs.map((job) => {
                const IconComponent = job.icon;
                return (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={job.iconColor}>
                          <IconComponent className="w-4 h-4 mr-3 flex-shrink-0" />
                        </div>
                        <div className="font-medium text-gray-900">{job.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{job.lastRun}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{job.nextRun}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{job.duration}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{job.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 whitespace-nowrap">
                          Run Now
                        </button>
                        <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 whitespace-nowrap">
                          View Logs
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
