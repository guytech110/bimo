import React, { useState } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, CreditCard, Shield, Calendar, CheckCircle } from 'lucide-react';

interface PaymentMethodsProps {
  onBack: () => void;
}

export default function PaymentMethods({ onBack }: PaymentMethodsProps) {
  const [showAddCard, setShowAddCard] = useState(false);

  const paymentMethods = [
    {
      id: '1',
      type: 'card',
      brand: 'Visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
      holderName: 'John Doe',
      billingAddress: {
        line1: '123 Startup Street',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
        country: 'US'
      },
      addedDate: '2023-08-15'
    },
    {
      id: '2',
      type: 'card',
      brand: 'Mastercard',
      last4: '5555',
      expiryMonth: 8,
      expiryYear: 2026,
      isDefault: false,
      holderName: 'Sarah Chen',
      billingAddress: {
        line1: '456 Business Ave',
        city: 'San Francisco',
        state: 'CA',
        zip: '94107',
        country: 'US'
      },
      addedDate: '2023-11-20'
    },
    {
      id: '3',
      type: 'bank',
      bankName: 'Chase Bank',
      last4: '7890',
      accountType: 'Checking',
      isDefault: false,
      holderName: 'Your Startup Inc.',
      addedDate: '2024-01-05'
    }
  ];

  const billingHistory = [
    {
      id: '1',
      date: '2024-01-15',
      amount: 4240,
      method: 'Visa •••• 4242',
      status: 'succeeded',
      invoice: 'INV-2024-001'
    },
    {
      id: '2',
      date: '2023-12-15',
      amount: 3890,
      method: 'Visa •••• 4242',
      status: 'succeeded',
      invoice: 'INV-2023-012'
    },
    {
      id: '3',
      date: '2023-11-15',
      amount: 3650,
      method: 'Visa •••• 4242',
      status: 'succeeded',
      invoice: 'INV-2023-011'
    }
  ];

  const getCardIcon = (brand?: string) => {
    const iconClass = "w-8 h-8 text-gray-600";
    return <CreditCard className={iconClass} />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
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
            <h1 className="text-2xl font-semibold text-gray-900">Payment Methods</h1>
            <p className="text-gray-600">Manage your billing and payment information</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddCard(true)}
          className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Payment Method
        </button>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Saved Payment Methods</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {paymentMethods.map((method) => (
            <div key={method.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center mr-4">
                    {getCardIcon(method.type === 'card' ? method.brand : 'bank')}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">
                        {method.type === 'card' 
                          ? `${method.brand} •••• ${method.last4}`
                          : `${method.bankName} •••• ${method.last4}`
                        }
                      </p>
                      {method.isDefault && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-teal-100 text-teal-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {method.type === 'card' 
                        ? `Expires ${method.expiryMonth}/${method.expiryYear} • ${method.holderName}`
                        : `${method.accountType} • ${method.holderName}`
                      }
                    </p>
                    <p className="text-xs text-gray-500">Added {method.addedDate}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!method.isDefault && (
                    <button className="px-3 py-1 text-sm text-teal-600 bg-teal-50 rounded hover:bg-teal-100">
                      Set as Default
                    </button>
                  )}
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Billing Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Auto-pay Settings */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Auto-pay Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Automatic Payments</p>
                <p className="text-sm text-gray-600">Automatically pay invoices when due</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Payment Notifications</p>
                <p className="text-sm text-gray-600">Email notifications for payments</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Retry Attempts
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                <option value="3">3 attempts</option>
                <option value="5">5 attempts</option>
                <option value="10">10 attempts</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security & Compliance</h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">PCI DSS Compliant</p>
                <p className="text-sm text-gray-600">Your payment data is encrypted and secure</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">SSL Encryption</p>
                <p className="text-sm text-gray-600">All transactions use 256-bit SSL encryption</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Fraud Protection</p>
                <p className="text-sm text-gray-600">Advanced fraud detection and prevention</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                <Shield className="w-4 h-4 mr-2" />
                View Security Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {billingHistory.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${transaction.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {transaction.method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-600 hover:text-teal-800">
                    <button>{transaction.invoice}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Payment Method Modal */}
      {showAddCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Add Payment Method</h3>
              <button
                onClick={() => setShowAddCard(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVC
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="setDefault"
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label htmlFor="setDefault" className="ml-2 text-sm text-gray-700">
                  Set as default payment method
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={() => setShowAddCard(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddCard(false)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Add Payment Method
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
