import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Zap, Cloud, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your API and cloud spending</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spend</p>
              <p className="text-2xl font-bold text-gray-900">$4,240</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+12% MoM</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">AI Spend</p>
              <p className="text-2xl font-bold text-gray-900">$1,680</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+18% MoM</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cloud Spend</p>
              <p className="text-2xl font-bold text-gray-900">$2,080</p>
              <div className="flex items-center mt-1">
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600">-5% MoM</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Cloud className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">SaaS Spend</p>
              <p className="text-2xl font-bold text-gray-900">$480</p>
              <div className="flex items-center mt-1">
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600">-2% MoM</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Daily Spending Trends</h3>
            <p className="text-gray-600 text-sm">Track your spending patterns across all services</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  { date: 'Jan 1', total: 1200, ai: 550, cloud: 450, saas: 200 },
                  { date: 'Jan 2', total: 1350, ai: 600, cloud: 500, saas: 250 },
                  { date: 'Jan 3', total: 1150, ai: 520, cloud: 430, saas: 200 },
                  { date: 'Jan 4', total: 1450, ai: 650, cloud: 550, saas: 250 },
                  { date: 'Jan 5', total: 1750, ai: 800, cloud: 700, saas: 250 },
                  { date: 'Jan 6', total: 1600, ai: 720, cloud: 650, saas: 230 },
                  { date: 'Jan 7', total: 1200, ai: 550, cloud: 450, saas: 200 }
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  domain={[0, 1800]}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#14b8a6" 
                  strokeWidth={3}
                  dot={{ fill: '#14b8a6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#14b8a6', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="cloud" 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 5, stroke: '#06b6d4', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="ai" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 5, stroke: '#8b5cf6', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="saas" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Chart Legend */}
          <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-teal-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Total Spend</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-cyan-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Cloud</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">AI</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">SaaS</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">AI-Powered Recommendations</h3>
        <div className="space-y-4">
          <div className="flex items-start p-4 bg-blue-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
            <div>
              <p className="font-medium text-gray-900">Switch to Claude Haiku for simple tasks</p>
              <p className="text-sm text-gray-600">Save $120/month by using Haiku for basic operations</p>
            </div>
          </div>
          <div className="flex items-start p-4 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
            <div>
              <p className="font-medium text-gray-900">Optimize Zoom licenses</p>
              <p className="text-sm text-gray-600">5 unused licenses detected. Save $75/month</p>
            </div>
          </div>
          <div className="flex items-start p-4 bg-yellow-50 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3"></div>
            <div>
              <p className="font-medium text-gray-900">AWS idle resources detected</p>
              <p className="text-sm text-gray-600">3 EC2 instances running idle. Save $180/month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
