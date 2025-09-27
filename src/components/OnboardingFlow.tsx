import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { apiPost } from '../lib/utils';
import ConnectionModal from './ConnectionModal';

interface OnboardingFlowProps {
  onComplete: () => void;
}

interface Provider {
  id: string;
  name: string;
  description: string;
  logo: string;
  category: 'ai' | 'cloud' | 'saas';
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [connectedProviders, setConnectedProviders] = useState<Set<string>>(new Set());
  const [budgets, setBudgets] = useState({
    aiApis: 1000,
    cloudServices: 2000,
    saasTools: 500
  });
  const [alertChannel, setAlertChannel] = useState('');

  const providers: Provider[] = [
    {
      id: 'claude',
      name: 'Claude API',
      description: 'Track your Anthropic Claude API spend',
      logo: 'https://c.animaapp.com/mf9achtzLNLvGx/img/screenshot-2025-08-30-at-9-14-35-pm_1.png',
      category: 'ai'
    },
    {
      id: 'aws',
      name: 'AWS Cloud',
      description: 'Monitor your AWS cloud infrastructure costs',
      logo: 'https://c.animaapp.com/mf9achtzLNLvGx/img/screenshot-2025-08-30-at-9-15-53-pm_1.png',
      category: 'cloud'
    },
    {
      id: 'zoom',
      name: 'Zoom',
      description: 'Track your Zoom subscription and usage',
  logo: 'https://c.animaapp.com/mf9achtzLNLvGx/img/screenshot-2025-08-30-at-9-17-36-pm_2.png',
      category: 'saas'
    },
    {
      id: 'openai',
      name: 'OpenAI API',
      description: 'Monitor your OpenAI GPT API usage and costs',
  logo: 'https://c.animaapp.com/mf9achtzLNLvGx/img/screenshot-2025-08-30-at-9-06-04-pm_2.png',
      category: 'ai'
    },
    {
      id: 'gcp',
      name: 'Google Cloud',
      description: 'Track your Google Cloud Platform spending',
  logo: '/logos/gcp.png',
      category: 'cloud'
    },
    {
      id: 'azure',
      name: 'Microsoft Azure',
      description: 'Monitor Microsoft Azure cloud costs',
  logo: '/logos/azure.png',
      category: 'cloud'
    }
  ];

  const filteredProviders = providers.filter(provider =>
    provider.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConnectProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setShowConnectionModal(true);
  };

  const handleConnect = async (method: 'api-key' | 'oauth', credentials: any) => {
    if (!selectedProvider) return;

    try {
      const res = await apiPost(`/providers/${selectedProvider.id}/connect`, {
        provider_id: selectedProvider.id,
        method,
        credentials,
      });

      if (res.status >= 200 && res.status < 300) {
      setConnectedProviders(prev => new Set([...prev, selectedProvider.id]));
    setShowConnectionModal(false);
    setSelectedProvider(null);
      } else {
        alert('Failed to connect: ' + JSON.stringify(res.body));
      }
    } catch (e) {
      alert('Connection request failed');
    }
  };

  const handleCloseModal = () => {
    setShowConnectionModal(false);
    setSelectedProvider(null);
  };

  // Step 1: Welcome
  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <div className="w-14 h-14 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <h1 className="text-xl font-semibold mb-4 text-gray-900">Welcome to bimo</h1>
            <p className="text-gray-600 mb-4">
              Take control of your startup's API and cloud spending
            </p>
            <p className="text-gray-500 text-sm mb-8">
              Monitor costs across Claude, AWS, Zoom and more. Set budgets, get alerts, and optimize your spend.
            </p>
            <button
              onClick={handleNext}
              className="w-full py-2.5 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Connect Providers
  if (currentStep === 2) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 pt-8">
            <h1 className="text-2xl font-semibold mb-2 text-gray-900">Connect Your Providers</h1>
            <p className="text-gray-600">Connect your services to start tracking spending</p>
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search for providers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Provider Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {filteredProviders.map((provider) => (
              <div key={provider.id} className="bg-white rounded-lg border shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mx-auto mb-4 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                  <img 
                    src={provider.logo} 
                    alt={provider.name}
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `<div class="w-12 h-12 bg-gray-300 rounded flex items-center justify-center text-gray-600 font-semibold">${provider.name.charAt(0)}</div>`;
                    }}
                  />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{provider.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{provider.description}</p>
                
                {connectedProviders.has(provider.id) ? (
                  <div className="flex items-center justify-center py-2 px-4 bg-green-50 border border-green-200 rounded-lg">
                    <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-green-700">Connected</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnectProvider(provider)}
                    className="w-full py-2 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
                  >
                    Connect
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              className="px-6 py-2 text-gray-600 hover:text-gray-800"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Next Step
            </button>
          </div>
        </div>

        {/* Connection Modal */}
        <ConnectionModal
          isOpen={showConnectionModal}
          onClose={handleCloseModal}
          provider={selectedProvider}
          onConnect={handleConnect}
        />
      </div>
    );
  }

  // Step 3: Set Budgets & Alerts
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 pt-8">
          <h1 className="text-2xl font-semibold mb-2 text-gray-900">Set Budgets & Alerts</h1>
          <p className="text-gray-600">Configure spending limits and notification preferences</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8">
          {/* Monthly Budget Limits */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Budget Limits</h3>
            <p className="text-gray-600 mb-6">Set spending limits for each category</p>

            <div className="space-y-6">
              {/* AI APIs */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-gray-700">AI APIs</label>
                  <span className="text-sm font-semibold text-gray-900">${budgets.aiApis}/month</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={budgets.aiApis}
                    onChange={(e) => setBudgets(prev => ({ ...prev, aiApis: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #374151 0%, #374151 ${(budgets.aiApis / 5000) * 100}%, #e5e7eb ${(budgets.aiApis / 5000) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                </div>
              </div>

              {/* Cloud Services */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-gray-700">Cloud Services</label>
                  <span className="text-sm font-semibold text-gray-900">${budgets.cloudServices}/month</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={budgets.cloudServices}
                    onChange={(e) => setBudgets(prev => ({ ...prev, cloudServices: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #374151 0%, #374151 ${(budgets.cloudServices / 10000) * 100}%, #e5e7eb ${(budgets.cloudServices / 10000) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                </div>
              </div>

              {/* SaaS Tools */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-gray-700">SaaS Tools</label>
                  <span className="text-sm font-semibold text-gray-900">${budgets.saasTools}/month</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="50"
                    value={budgets.saasTools}
                    onChange={(e) => setBudgets(prev => ({ ...prev, saasTools: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #374151 0%, #374151 ${(budgets.saasTools / 2000) * 100}%, #e5e7eb ${(budgets.saasTools / 2000) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Alert Notifications */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Alert Notifications</h3>
            <p className="text-gray-600 mb-4">Choose how you want to receive spending alerts</p>

            <div className="relative">
              <select
                value={alertChannel}
                onChange={(e) => setAlertChannel(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">Select alert channel</option>
                <option value="email">Email</option>
                <option value="slack">Slack</option>
                <option value="teams">Microsoft Teams</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              className="px-6 py-2 text-gray-600 hover:text-gray-800"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Finish Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
