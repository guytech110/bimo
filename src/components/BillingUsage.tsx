import React, { useState } from 'react';
import { Download, DollarSign, TrendingUp, Activity, Link, CreditCard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

export default function BillingUsage() {
  const [activeTab, setActiveTab] = useState('Overview');

  const monthlyData = [
    { month: 'Jul', value: 3200 },
    { month: 'Aug', value: 3600 },
    { month: 'Sep', value: 3100 },
    { month: 'Oct', value: 3800 },
    { month: 'Nov', value: 4100 },
    { month: 'Dec', value: 4400 },
    { month: 'Jan', value: 4200 }
  ];

  const projectData = [
    {
      id: '1',
      name: 'AI Chat Assistant',
      team: 'Engineering',
      totalSpend: 1680,
      providers: ['Claude API', 'OpenAI'],
      lastActivity: '2024-01-15',
      status: 'active'
    },
    {
      id: '2',
      name: 'Data Analytics Platform',
      team: 'Data Science',
      totalSpend: 1240,
      providers: ['AWS', 'MongoDB Atlas'],
      lastActivity: '2024-01-14',
      status: 'active'
    },
    {
      id: '3',
      name: 'Marketing Automation',
      team: 'Marketing',
      totalSpend: 890,
      providers: ['Slack', 'Mailchimp', 'Zoom'],
      lastActivity: '2024-01-13',
      status: 'active'
    },
    {
      id: '4',
      name: 'Mobile App Backend',
      team: 'Engineering',
      totalSpend: 430,
      providers: ['AWS', 'Claude API'],
      lastActivity: '2024-01-12',
      status: 'paused'
    }
  ];

  const teamData = [
    {
      id: '1',
      name: 'Engineering',
      members: 8,
      totalSpend: 2110,
      projects: 3,
      topProvider: 'Claude API',
      budget: 2500,
      percentUsed: 84.4
    },
    {
      id: '2',
      name: 'Data Science',
      members: 4,
      totalSpend: 1240,
      projects: 2,
      topProvider: 'AWS',
      budget: 1500,
      percentUsed: 82.7
    },
    {
      id: '3',
      name: 'Marketing',
      members: 5,
      totalSpend: 890,
      projects: 2,
      topProvider: 'Zoom',
      budget: 1000,
      percentUsed: 89.0
    },
    {
      id: '4',
      name: 'Operations',
      members: 3,
      totalSpend: 0,
      projects: 0,
      topProvider: 'None',
      budget: 500,
      percentUsed: 0
    }
  ];

  const invoicesData = [
    {
      id: 'INV-2024-001',
      date: '2024-01-01',
      dueDate: '2024-01-15',
      amount: 4240,
      status: 'paid',
      period: 'January 2024',
      services: 5
    },
    {
      id: 'INV-2023-012',
      date: '2023-12-01',
      dueDate: '2023-12-15',
      amount: 3890,
      status: 'paid',
      period: 'December 2023',
      services: 5
    },
    {
      id: 'INV-2023-011',
      date: '2023-11-01',
      dueDate: '2023-11-15',
      amount: 3650,
      status: 'paid',
      period: 'November 2023',
      services: 4
    },
    {
      id: 'INV-2023-010',
      date: '2023-10-01',
      dueDate: '2023-10-15',
      amount: 3420,
      status: 'paid',
      period: 'October 2023',
      services: 4
    },
    {
      id: 'INV-2023-009',
      date: '2023-09-01',
      dueDate: '2023-09-15',
      amount: 3100,
      status: 'paid',
      period: 'September 2023',
      services: 3
    }
  ];

  const tabs = ['Overview', 'By Project', 'By Team', 'Invoices'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressBarColor = (percentUsed: number) => {
    if (percentUsed >= 90) return 'bg-red-500';
    if (percentUsed >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Billing & Usage</h1>
          <p className="text-gray-600">Track spending, usage metrics, and manage invoices</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
          <button className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">
            <CreditCard className="w-4 h-4 mr-2" />
            Payment Methods
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-600">Monthly Spend</span>
            </div>
          </div>
          <div className="mb-2">
            <span className="text-3xl font-bold text-gray-900">$4,240</span>
          </div>
          <div className="text-sm text-red-600">+4% from last month</div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Activity className="w-5 h-5 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-600">API Requests</span>
            </div>
          </div>
          <div className="mb-2">
            <span className="text-3xl font-bold text-gray-900">64,000</span>
          </div>
          <div className="text-sm text-gray-500">This month</div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Link className="w-5 h-5 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-600">Tokens Used</span>
            </div>
          </div>
          <div className="mb-2">
            <span className="text-3xl font-bold text-gray-900">3.3M</span>
          </div>
          <div className="text-sm text-gray-500">Tokens processed</div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-600">Avg Cost/Request</span>
            </div>
          </div>
          <div className="mb-2">
            <span className="text-3xl font-bold text-gray-900">$0.066</span>
          </div>
          <div className="text-sm text-green-600">-8% from last month</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Overview' && (
        <>
          {/* Monthly Usage Trends Chart */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Usage Trends</h3>
              <p className="text-gray-600">Spending and usage patterns over time</p>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    domain={[0, 6000]}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#14b8a6" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Current Billing Period */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="w-5 h-5 bg-gray-200 rounded mr-3 flex items-center justify-center">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Current Billing Period</h3>
                <p className="text-gray-600">January 1 - January 31, 2025</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600 mb-1">7</div>
                <div className="text-sm text-gray-600">Days elapsed</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">$540</div>
                <div className="text-sm text-gray-600">Spent so far</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">$2,310</div>
                <div className="text-sm text-gray-600">Projected total</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">-$1,930</div>
                <div className="text-sm text-gray-600">vs. last month</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* By Project Tab */}
      {activeTab === 'By Project' && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Project Spending</h3>
              <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm">
                Create Project
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spend
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Providers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projectData.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{project.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{project.team}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">${project.totalSpend}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{project.providers.join(', ')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{project.lastActivity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* By Team Tab */}
      {activeTab === 'By Team' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamData.map((team) => (
              <div key={team.id} className="bg-white rounded-lg border shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{team.name}</h3>
                  <div className="text-sm text-gray-500">{team.members} members</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Spend:</span>
                    <span className="font-semibold">${team.totalSpend}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Projects:</span>
                    <span className="text-sm">{team.projects}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Top Provider:</span>
                    <span className="text-sm">{team.topProvider}</span>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Budget Usage:</span>
                      <span className="text-sm font-medium">{team.percentUsed}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressBarColor(team.percentUsed)}`}
                        style={{ width: `${Math.min(team.percentUsed, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">${team.totalSpend}</span>
                      <span className="text-xs text-gray-500">${team.budget}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'Invoices' && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Invoice History</h3>
              <div className="flex space-x-3">
                <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                  <Download className="w-4 h-4 mr-2 inline" />
                  Export All
                </button>
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                  <option>All Statuses</option>
                  <option>Paid</option>
                  <option>Pending</option>
                  <option>Overdue</option>
                </select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Services
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
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
                {invoicesData.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-teal-600 hover:text-teal-800 cursor-pointer">
                        {invoice.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{invoice.period}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">${invoice.amount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{invoice.services} services</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{invoice.dueDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-teal-600 hover:text-teal-900">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <CreditCard className="w-4 h-4" />
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
    </div>
  );
}
