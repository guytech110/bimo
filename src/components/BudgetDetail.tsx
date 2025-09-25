import React, { useState } from 'react';
import { ArrowLeft, Edit, Trash2, Plus, Bell, Mail, MessageSquare, Users as TeamsIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface BudgetDetailProps {
  budgetId: string;
  onBack: () => void;
}

export default function BudgetDetail({ budgetId, onBack }: BudgetDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState(1000);
  const [alertThreshold, setAlertThreshold] = useState(80);
  const [alertChannels, setAlertChannels] = useState(['email', 'slack']);

  const budgetData = {
    id: 'claude-budget',
    provider: 'Claude API',
    budget: 1000,
    currentSpend: 980,
    percentUsed: 98,
    status: 'critical',
    alertChannel: 'Email, Slack',
    createdDate: '2024-01-01',
    lastModified: '2024-01-15'
  };

  const spendingHistory = [
    { date: 'Jan 1', spend: 32, budget: 1000 },
    { date: 'Jan 2', spend: 69, budget: 1000 },
    { date: 'Jan 3', spend: 96, budget: 1000 },
    { date: 'Jan 4', spend: 139, budget: 1000 },
    { date: 'Jan 5', spend: 178, budget: 1000 },
    { date: 'Jan 6', spend: 212, budget: 1000 },
    { date: 'Jan 7', spend: 242, budget: 1000 }
  ];

  const alertHistory = [
    {
      id: '1',
      type: 'Budget Exceeded',
      message: 'Budget 98% exceeded - $980 of $1000 used',
      timestamp: '2025-01-07 14:30:00',
      severity: 'High',
      status: 'Active'
    },
    {
      id: '2',
      type: 'Threshold Alert',
      message: 'Budget 90% threshold reached - $900 of $1000 used',
      timestamp: '2025-01-06 16:22:00',
      severity: 'Medium',
      status: 'Acknowledged'
    },
    {
      id: '3',
      type: 'Threshold Alert',
      message: 'Budget 80% threshold reached - $800 of $1000 used',
      timestamp: '2025-01-05 12:15:00',
      severity: 'Low',
      status: 'Acknowledged'
    }
  ];

  const handleSave = () => {
    setIsEditing(false);
    // Save logic here
  };

  const handleChannelToggle = (channel: string) => {
    setAlertChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
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
            <h1 className="text-2xl font-semibold text-gray-900">{budgetData.provider} Budget</h1>
            <p className="text-gray-600">Manage spending limits and alert settings</p>
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
                Edit Budget
              </button>
              <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
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

      {/* Budget Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Settings */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Budget Limit
              </label>
              {isEditing ? (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(parseInt(e.target.value))}
                    className="pl-8 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">${budgetData.budget}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alert Threshold
              </label>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={alertThreshold}
                    onChange={(e) => setAlertThreshold(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-600">{alertThreshold}% of budget</p>
                </div>
              ) : (
                <p className="text-lg font-semibold text-gray-900">80% of budget</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Status
              </label>
              <div className="flex items-center space-x-2">
                <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800 border border-red-200">
                  Critical
                </span>
                <span className="text-sm text-gray-600">
                  ${budgetData.currentSpend} of ${budgetData.budget} used ({budgetData.percentUsed}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Configuration */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Notification Channels
              </label>
              <div className="space-y-2">
                {[
                  { id: 'email', label: 'Email', icon: Mail },
                  { id: 'slack', label: 'Slack', icon: MessageSquare },
                  { id: 'teams', label: 'Microsoft Teams', icon: TeamsIcon }
                ].map(({ id, label, icon: Icon }) => (
                  <label key={id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={alertChannels.includes(id)}
                      onChange={() => handleChannelToggle(id)}
                      disabled={!isEditing}
                      className="mr-3 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <Icon className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alert Frequency
              </label>
              {isEditing ? (
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                  <option>Immediate</option>
                  <option>Daily Digest</option>
                  <option>Weekly Summary</option>
                </select>
              ) : (
                <p className="text-sm text-gray-900">Immediate</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Created
              </label>
              <p className="text-sm text-gray-600">{budgetData.createdDate}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Modified
              </label>
              <p className="text-sm text-gray-600">{budgetData.lastModified}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Spending Trend */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spendingHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Line type="monotone" dataKey="spend" stroke="#14b8a6" strokeWidth={3} />
              <Line type="monotone" dataKey="budget" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alert History */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Alert History</h3>
          <button className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Alert Rule
          </button>
        </div>
        
        <div className="space-y-4">
          {alertHistory.map((alert) => (
            <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-900">{alert.type}</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${
                    alert.severity === 'High' ? 'bg-red-100 text-red-800' :
                    alert.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {alert.severity}
                  </span>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  alert.status === 'Active' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {alert.status}
                </span>
              </div>
              <p className="text-gray-700 mb-1">{alert.message}</p>
              <p className="text-sm text-gray-500">{alert.timestamp}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
