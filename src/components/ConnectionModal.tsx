import React, { useState } from 'react';
import { X, Key, Link } from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  description: string;
  logo: string;
  category: 'ai' | 'cloud' | 'saas';
}

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider | null;
  onConnect: (method: 'api-key' | 'oauth', credentials: any) => void;
}

export default function ConnectionModal({ isOpen, onClose, provider, onConnect }: ConnectionModalProps) {
  const [connectionMethod, setConnectionMethod] = useState<'api-key' | 'oauth'>('api-key');
  const [apiKey, setApiKey] = useState('');
  const oauthSupported = provider?.id !== 'openai';

  const handleConnect = () => {
    if (connectionMethod === 'api-key' && apiKey.trim()) {
      onConnect('api-key', { api_key: apiKey });
      setApiKey(''); // Clear the form
    } else if (connectionMethod === 'oauth') {
      onConnect('oauth', {});
    }
  };

  const handleClose = () => {
    setApiKey('');
    onClose();
  };

  if (!isOpen || !provider) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center mr-3">
              <img 
                src={provider.logo} 
                alt={provider.name}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `<div class="w-8 h-8 bg-gray-300 rounded flex items-center justify-center text-gray-600 font-semibold text-sm">${provider.name.charAt(0)}</div>`;
                }}
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Connect to {provider.name}</h3>
              <p className="text-sm text-gray-600">{provider.description}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Connection Methods */}
        <div className="p-6">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setConnectionMethod('api-key')}
              className={`flex items-center px-4 py-2 rounded-lg border ${
                connectionMethod === 'api-key'
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-gray-300 text-gray-600'
              }`}
            >
              <Key className="w-4 h-4 mr-2" />
              API Key
            </button>
            {oauthSupported && (
              <button
                onClick={() => setConnectionMethod('oauth')}
                className={`flex items-center px-4 py-2 rounded-lg border ${
                  connectionMethod === 'oauth'
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-300 text-gray-600'
                }`}
              >
                <Link className="w-4 h-4 mr-2" />
                OAuth
              </button>
            )}
          </div>

          {connectionMethod === 'api-key' && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Key className="w-4 h-4 mr-2" />
                API Key Connection
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Connect using your {provider.name} API key or access token
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How to get your API key:
                </label>
                <div className="space-y-2 text-sm text-gray-600">
                  {provider.id === 'azure' && (
                    <>
                      <div className="flex items-center">
                        <span className="w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-semibold mr-2">1</span>
                        Go to Azure Portal
                      </div>
                      <div className="flex items-center">
                        <span className="w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-semibold mr-2">2</span>
                        Navigate to Cost Management
                      </div>
                      <div className="flex items-center">
                        <span className="w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-semibold mr-2">3</span>
                        Create Service Principal
                      </div>
                      <div className="flex items-center">
                        <span className="w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-semibold mr-2">4</span>
                        Copy Application ID and Secret
                      </div>
                    </>
                  )}
                  {provider.id === 'claude' && (
                    <>
                      <div className="flex items-center">
                        <span className="w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-semibold mr-2">1</span>
                        Go to console.anthropic.com
                      </div>
                      <div className="flex items-center">
                        <span className="w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-semibold mr-2">2</span>
                        Navigate to API Keys
                      </div>
                      <div className="flex items-center">
                        <span className="w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-semibold mr-2">3</span>
                        Create new API key
                      </div>
                    </>
                  )}
                  {provider.id === 'aws' && (
                    <>
                      <div className="flex items-center">
                        <span className="w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-semibold mr-2">1</span>
                        Go to AWS IAM Console
                      </div>
                      <div className="flex items-center">
                        <span className="w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-semibold mr-2">2</span>
                        Create programmatic access user
                      </div>
                      <div className="flex items-center">
                        <span className="w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-semibold mr-2">3</span>
                        Attach billing policies
                      </div>
                    </>
                  )}
                  {provider.id === 'openai' && (
                    <>
                      <div className="flex items-center">
                        <span className="w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-semibold mr-2">1</span>
                        Go to platform.openai.com
                      </div>
                      <div className="flex items-center">
                        <span className="w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-semibold mr-2">2</span>
                        Navigate to API Keys
                      </div>
                      <div className="flex items-center">
                        <span className="w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-semibold mr-2">3</span>
                        Create new secret key
                      </div>
                    </>
                  )}
                  {provider.id === 'gcp' && (
                    <>
                      <div className="flex items-center">
                        <span className="w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-semibold mr-2">1</span>
                        Go to Google Cloud Console
                      </div>
                      <div className="flex items-center">
                        <span className="w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-semibold mr-2">2</span>
                        Navigate to IAM & Admin
                      </div>
                      <div className="flex items-center">
                        <span className="w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-semibold mr-2">3</span>
                        Create service account
                      </div>
                    </>
                  )}
                  {!['azure', 'claude', 'aws', 'openai', 'gcp'].includes(provider.id) && (
                    <>
                      <div className="flex items-center">
                        <span className="w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-semibold mr-2">1</span>
                        Go to {provider.name} dashboard
                      </div>
                      <div className="flex items-center">
                        <span className="w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-semibold mr-2">2</span>
                        Navigate to API settings
                      </div>
                      <div className="flex items-center">
                        <span className="w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-semibold mr-2">3</span>
                        Generate API key
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {provider.name} API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`Enter your ${provider.name} API key...`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your API key is encrypted and stored securely. We only use it to fetch your usage data.
                </p>
              </div>
            </div>
          )}

          {connectionMethod === 'oauth' && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Link className="w-4 h-4 mr-2" />
                OAuth Connection
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Connect securely using OAuth. You'll be redirected to {provider.name} to authorize access.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  OAuth provides enhanced security and doesn't require you to share API keys directly.
                </p>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleConnect}
              disabled={connectionMethod === 'api-key' && !apiKey.trim()}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
