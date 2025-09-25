import React from 'react';
import { ArrowLeft, Download, Mail, CreditCard, Calendar, DollarSign } from 'lucide-react';

interface InvoiceDetailProps {
  invoiceId: string;
  onBack: () => void;
}

export default function InvoiceDetail({ invoiceId, onBack }: InvoiceDetailProps) {
  const invoiceData = {
    id: 'INV-2024-001',
    number: 'INV-2024-001',
    date: '2024-01-01',
    dueDate: '2024-01-15',
    status: 'paid',
    amount: 4240,
    tax: 424,
    subtotal: 3816,
    period: 'January 2024',
    paymentMethod: 'Visa •••• 4242',
    paidDate: '2024-01-10'
  };

  const lineItems = [
    {
      id: '1',
      provider: 'Claude API',
      description: 'AI API Usage - 2.4M tokens',
      quantity: '2,400,000',
      unit: 'tokens',
      rate: 0.00041,
      amount: 980
    },
    {
      id: '2',
      provider: 'Amazon Web Services',
      description: 'Cloud Infrastructure - EC2, S3, Lambda',
      quantity: '1',
      unit: 'month',
      rate: 1840,
      amount: 1840
    },
    {
      id: '3',
      provider: 'OpenAI',
      description: 'GPT API Usage - 1.8M tokens',
      quantity: '1,800,000',
      unit: 'tokens',
      rate: 0.00039,
      amount: 700
    },
    {
      id: '4',
      provider: 'Zoom',
      description: 'Video Conferencing - 45 licenses',
      quantity: '45',
      unit: 'licenses',
      rate: 5,
      amount: 225
    },
    {
      id: '5',
      provider: 'Slack',
      description: 'Team Communication - 32 licenses',
      quantity: '32',
      unit: 'licenses',
      rate: 5,
      amount: 160
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
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
            <h1 className="text-2xl font-semibold text-gray-900">Invoice {invoiceData.number}</h1>
            <p className="text-gray-600">{invoiceData.period}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <Mail className="w-4 h-4 mr-2" />
            Send Invoice
          </button>
          <button className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Invoice Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Details */}
        <div className="lg:col-span-2 bg-white rounded-lg border shadow-sm p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">bimo</h2>
              <p className="text-gray-600">
                123 Startup Street<br />
                San Francisco, CA 94105<br />
                United States
              </p>
            </div>
            <div className="text-right">
              <h3 className="text-lg font-semibold text-gray-900">Invoice #{invoiceData.number}</h3>
              <p className="text-gray-600">Date: {invoiceData.date}</p>
              <p className="text-gray-600">Due: {invoiceData.dueDate}</p>
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full mt-2 ${getStatusColor(invoiceData.status)}`}>
                {invoiceData.status.charAt(0).toUpperCase() + invoiceData.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Bill To */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Bill To:</h4>
            <p className="text-gray-600">
              Your Startup Inc.<br />
              456 Business Ave<br />
              San Francisco, CA 94107<br />
              United States
            </p>
          </div>

          {/* Line Items */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Service</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Description</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-600">Qty</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-600">Rate</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-600">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lineItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-4 text-sm font-medium text-gray-900">{item.provider}</td>
                    <td className="py-4 text-sm text-gray-600">{item.description}</td>
                    <td className="py-4 text-sm text-gray-600 text-right">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-4 text-sm text-gray-600 text-right">
                      ${item.rate.toFixed(item.unit === 'tokens' ? 5 : 2)}
                    </td>
                    <td className="py-4 text-sm font-medium text-gray-900 text-right">
                      ${item.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${invoiceData.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%):</span>
                  <span className="font-medium">${invoiceData.tax}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-lg font-semibold">${invoiceData.amount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="space-y-6">
          {/* Payment Status */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoiceData.status)}`}>
                  {invoiceData.status.charAt(0).toUpperCase() + invoiceData.status.slice(1)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="font-semibold">${invoiceData.amount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Due Date:</span>
                <span className="text-sm">{invoiceData.dueDate}</span>
              </div>
              {invoiceData.status === 'paid' && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Paid Date:</span>
                    <span className="text-sm">{invoiceData.paidDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Payment Method:</span>
                    <span className="text-sm">{invoiceData.paymentMethod}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </button>
              <button className="w-full flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                <Mail className="w-4 h-4 mr-2" />
                Email Invoice
              </button>
              <button className="w-full flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                <CreditCard className="w-4 h-4 mr-2" />
                Payment Methods
              </button>
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">Total Services: 5</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">Billing Period: {invoiceData.period}</span>
              </div>
              <div className="flex items-center">
                <CreditCard className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">Auto-pay: Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
