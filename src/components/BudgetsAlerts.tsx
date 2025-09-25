import React from 'react';
import { Plus, Edit, Eye, AlertTriangle, Trash2 } from 'lucide-react';

export default function BudgetsAlerts() {
  const budgets = [
    {
      id: '1',
      provider: 'Claude API',
      budget: 1000,
      currentSpend: 540,
      percentUsed: 54,
      alertChannel: 'Email',
      status: 'healthy' as const
    },
    {
      id: '2',
      provider: 'AWS Cloud',
      budget: 2000,
      currentSpend: 1680,
      percentUsed: 84,
      alertChannel: 'Slack',
      status: 'warning' as const
    },
    {
      id: '3',
      provider: 'Zoom',
      budget: 300,
      currentSpend: 280,
      percentUsed: 93,
      alertChannel: 'Teams',
      status: 'critical' as const
    },
    {
      id: '4',
      provider: 'GitHub',
      budget: 150,
      currentSpend: 45,
      percentUsed: 30,
      alertChannel: 'Email',
      status: 'healthy' as const
    }
  ];

  const alerts = [
    {
      id: '1',
      provider: 'Zoom',
      type: 'budget',
      severity: 'High',
      message: 'Budget 93% exceeded - $280 of $300 used',
      timestamp: '2025-01-07 14:30:00',
      icon: AlertTriangle,
      iconColor: 'text-red-500'
    },
    {
      id: '2',
      provider: 'AWS Cloud',
      type: 'anomaly',
      severity: 'Medium',
      message: 'Unusual spending spike detected - 40% above normal',
      timestamp: '2025-01-07 12:15:00',
      icon: AlertTriangle,
      iconColor: 'text-red-500'
    },
    {
      id: '3',
      provider: 'Claude API',
      type: 'threshold',
      severity: 'Medium',
      message: 'Daily spend limit reached - $50 threshold exceeded',
      timestamp: '2025-01-07 09:45:00',
      icon: () => <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"><span className="text-white text-xs">✓</span></div>,
      iconColor: ''
    },
    {
      id: '4',
      provider: 'AWS Cloud',
      type: 'budget',
      severity: 'Low',
      message: 'Budget 80% threshold reached - $1600 of $2000 used',
      timestamp: '2025-01-06 16:22:00',
      icon: () => <div className="w-4 h-4 rounded-full bg-yellow-500"></div>,
      iconColor: ''
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-600 bg-red-50 border border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border border-yellow-200';
      case 'healthy':
        return 'text-green-600 bg-green-50 border border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Low':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getProgressBarColor = (percentUsed: number) => {
    if (percentUsed >= 90) return 'bg-red-500';
    if (percentUsed >= 80) return 'bg-yellow-500';
    return 'bg-gray-900';
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Budgets & Alerts</h1>
          <p className="text-gray-600">Manage spending limits and notification preferences</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">
          <Plus className="w-4 h-4 mr-2" />
          Add Budget
        </button>
      </div>

      {/* Budget Overview */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Budget Overview</h2>
          <p className="text-gray-600">Monitor spending against your set budgets</p>
        </div>

        {/* Budget Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-0 text-sm font-medium text-gray-600">Provider</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Budget</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Current Spend</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Usage</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Alert Channel</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((budget, index) => (
                <tr key={budget.id} className={index !== budgets.length - 1 ? 'border-b border-gray-100' : ''}>
                  <td className="py-4 px-0">
                    <span className="font-medium text-gray-900">{budget.provider}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-900">${budget.budget}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-900">${budget.currentSpend}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-900">{budget.percentUsed}%</span>
                      <div className="flex-1 max-w-32">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgressBarColor(budget.percentUsed)}`}
                            style={{ width: `${Math.min(budget.percentUsed, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">${budget.currentSpend}/${budget.budget}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-700">{budget.alertChannel}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${getStatusColor(budget.status)}`}>
                      {budget.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts Center */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-gray-600 mr-2" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Alerts Center</h2>
              <p className="text-gray-600">Recent notifications and alerts</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium">
              Mark All Read
            </button>
            <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium">
              Configure Alerts
            </button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {alerts.map((alert) => {
            const IconComponent = alert.icon;
            return (
              <div key={alert.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-start space-x-3">
                  <div className={alert.iconColor}>
                    <IconComponent />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">{alert.provider}</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {alert.type}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-1">{alert.message}</p>
                    <p className="text-sm text-gray-500">{alert.timestamp}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200">
                    Acknowledge
                  </button>
                  <button className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200">
                    Snooze
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
