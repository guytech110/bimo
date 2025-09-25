import React, { useState } from 'react';
import { Search, AlertTriangle, Users, Cloud } from 'lucide-react';
import { apiPost, API_BASE } from '../lib/utils';
import ConnectionModal from './ConnectionModal';

interface ProvidersIndexProps {
  onProviderSelect: (providerId: string) => void;
}

export default function ProvidersIndex({ onProviderSelect }: ProvidersIndexProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const defaultCatalog = [
    { id: 'openai', name: 'OpenAI API', category: 'ai', logo_url: 'https://c.animaapp.com/mf9achtzLNLvGx/img/screenshot-2025-08-30-at-9-06-04-pm_2.png' },
    { id: 'claude', name: 'Claude API', category: 'ai', logo_url: 'https://c.animaapp.com/mf9achtzLNLvGx/img/screenshot-2025-08-30-at-9-14-35-pm_1.png' },
    { id: 'gemini', name: 'Google Gemini', category: 'ai', logo_url: '/logos/gemini.png' },
    { id: 'aws', name: 'AWS Cloud', category: 'cloud', logo_url: '/logos/azure.png' },
    { id: 'gcp', name: 'Google Cloud', category: 'cloud', logo_url: '/logos/gcp.png' },
    { id: 'azure', name: 'Microsoft Azure', category: 'cloud', logo_url: '/logos/azure.png' },
    { id: 'zoom', name: 'Zoom', category: 'saas', logo_url: 'https://c.animaapp.com/mf9achtzLNLvGx/img/screenshot-2025-08-30-at-9-17-36-pm_2.png' },
    { id: 'slack', name: 'Slack', category: 'saas', logo_url: '/logos/slack.svg' },
    { id: 'notion', name: 'Notion', category: 'saas', logo_url: '/logos/notion.png' },
    { id: 'cursor', name: 'Cursor', category: 'saas', logo_url: '/logos/cursor.svg' },
  ]
  const [providers, setProviders] = useState<any[]>(
    defaultCatalog.map((p) => {
      const providerId = p.id
      const name = p.name || providerId
      const rawType = (p as any).type || (p as any).category || 'ai'
      const norm = rawType.toString().toLowerCase()
      const type = norm === 'ai' ? 'AI' : norm === 'cloud' ? 'Cloud' : norm === 'saas' ? 'SaaS' : 'AI'
      const logo = (p as any).logo || (p as any).icon || (p as any).logo_url || `/logos/${providerId}.png`
      return {
        id: providerId,
        name,
        type,
        logo,
        connected: false,
        metrics: { label: 'Not Connected', primary: 'Connect to view metrics', secondary: null, cost: null }
      }
    })
  )
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  React.useEffect(() => {
    let mounted = true

    async function load() {
      const fallbackCatalog = [
        { id: 'openai', name: 'OpenAI API', category: 'ai', logo_url: 'https://c.animaapp.com/mf9achtzLNLvGx/img/screenshot-2025-08-30-at-9-06-04-pm_2.png' },
        { id: 'claude', name: 'Claude API', category: 'ai', logo_url: 'https://c.animaapp.com/mf9achtzLNLvGx/img/screenshot-2025-08-30-at-9-14-35-pm_1.png' },
        { id: 'gemini', name: 'Google Gemini', category: 'ai', logo_url: '/logos/gemini.png' },
        { id: 'aws', name: 'AWS Cloud', category: 'cloud', logo_url: '/logos/azure.png' },
        { id: 'gcp', name: 'Google Cloud', category: 'cloud', logo_url: '/logos/gcp.png' },
        { id: 'azure', name: 'Microsoft Azure', category: 'cloud', logo_url: '/logos/azure.png' },
        { id: 'zoom', name: 'Zoom', category: 'saas', logo_url: 'https://c.animaapp.com/mf9achtzLNLvGx/img/screenshot-2025-08-30-at-9-17-36-pm_2.png' },
        { id: 'slack', name: 'Slack', category: 'saas', logo_url: '/logos/slack.svg' },
        { id: 'notion', name: 'Notion', category: 'saas', logo_url: '/logos/notion.png' },
      ]
      try {
        const base = API_BASE

        // fetch catalog of supported providers
        let catalog: any[] = []
        try {
          const catalogRes = await fetch(`${base}/v1/providers/catalog`)
          if (catalogRes.ok) {
            const catalogJson = await catalogRes.json()
            catalog = Array.isArray(catalogJson) ? catalogJson : (catalogJson?.data || [])
          }
        } catch (_) {
          // ignore network errors and use fallback below
        }

        // fallback catalog so the page is never empty in dev/build
        if (!catalog || catalog.length === 0) {
          catalog = fallbackCatalog
        }

        // fetch existing connections
        let connections: any[] = []
        try {
          const conRes = await fetch(`${base}/v1/providers/connections`)
          if (conRes.ok) {
            const conJson = await conRes.json()
            connections = Array.isArray(conJson) ? conJson : (conJson.data || [])
          }
        } catch (_) {
          // ignore, default to no connections
        }

        // merge into provider list
        const merged = (catalog || []).map((p: any) => {
          const providerId = p.id || p.provider_id
          const conn = (connections || []).find((c: any) => c.provider_id === providerId)
          const name = p.name || providerId
          // backend uses category/logo_url
          const rawType = (p.type || p.category || 'ai').toString().toLowerCase()
          const type = rawType === 'ai' ? 'AI' : rawType === 'cloud' ? 'Cloud' : rawType === 'saas' ? 'SaaS' : 'AI'
          const logo = p.logo || p.icon || p.logo_url || `/logos/${providerId}.png`
          return {
            id: providerId,
            name,
            type,
            logo,
            connected: !!conn,
            metrics: conn
              ? { label: 'Connected', primary: conn.status || 'connected', secondary: null, cost: null }
              : { label: 'Not Connected', primary: 'Connect to view metrics', secondary: null, cost: null }
          }
        })

        if (mounted) setProviders(merged)
      } catch (e) {
        console.error('failed to load providers', e)
        if (!mounted) return
        // Last-resort: render fallback
        const merged = fallbackCatalog.map((p: any) => {
          const providerId = p.id
          const name = p.name || providerId
          const rawType = (p.type || p.category || 'ai').toString().toLowerCase()
          const type = rawType === 'ai' ? 'AI' : rawType === 'cloud' ? 'Cloud' : rawType === 'saas' ? 'SaaS' : 'AI'
          const logo = p.logo || p.icon || p.logo_url || `/logos/${providerId}.png`
          return {
            id: providerId,
            name,
            type,
            logo,
            connected: false,
            metrics: { label: 'Not Connected', primary: 'Connect to view metrics', secondary: null, cost: null }
          }
        })
        setProviders(merged)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || provider.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getConnectionStatus = (connected: boolean) => {
    if (connected) {
      return (
        <div className="flex items-center text-green-600 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Connected
        </div>
      );
    }
    return (
      <div className="flex items-center text-gray-500 text-sm">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Not Connected
      </div>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Cloud':
        return <Cloud className="w-4 h-4 text-gray-500" />;
      case 'SaaS':
        return <Users className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const handleConnect = async (method: 'api-key' | 'oauth', credentials: any) => {
    if (!selectedProvider) return;

    try {
      const res = await apiPost(`/v1/providers/${selectedProvider.id}/connect`, { 
        provider_id: selectedProvider.id, 
        method, 
        credentials 
      });
      
      if (res.status >= 200 && res.status < 300) {
        alert('Connected successfully');
        setShowConnectionModal(false);
        setSelectedProvider(null);
        // Refresh the page to update the connection status
        window.location.reload();
      } else {
        alert('Failed to connect: ' + JSON.stringify(res.body));
      }
    } catch (err) {
      alert('Connection request failed');
    }
  };

  const handleConnectClick = (provider: any) => {
    if (provider.connected) {
      onProviderSelect(provider.id);
      return;
    }

    // Convert provider data to match ConnectionModal interface
    const modalProvider = {
      id: provider.id,
      name: provider.name,
      description: `Track your ${provider.name} usage and costs`,
      logo: provider.logo,
      category: provider.type.toLowerCase() as 'ai' | 'cloud' | 'saas'
    };

    setSelectedProvider(modalProvider);
    setShowConnectionModal(true);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Providers</h1>
          <p className="text-gray-600">Manage and monitor your connected service providers</p>
        </div>
        <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium">
          Connect Provider
        </button>
      </div>

      {/* Filter Tabs and Search */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {['All', 'AI', 'Cloud', 'SaaS'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
          />
        </div>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProviders.map((provider) => (
          <div key={provider.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            {/* Provider Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 mr-3 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                  {provider.logo.startsWith('http') || provider.logo.startsWith('/') ? (
                    <img 
                      src={provider.logo} 
                      alt={provider.name}
                      className="w-10 h-10 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `<div class="w-10 h-10 bg-gray-300 rounded flex items-center justify-center text-gray-600 font-semibold">${provider.name.charAt(0)}</div>`;
                      }}
                    />
                  ) : (
                    <div className="text-2xl">{provider.logo}</div>
                  )}
                </div>
                <div>
                  <div className="flex items-center">
                    <h3 className="font-semibold text-gray-900 mr-2">{provider.name}</h3>
                    {provider.type !== 'AI' && getTypeIcon(provider.type)}
                  </div>
                  <p className="text-sm text-gray-500">{provider.type}</p>
                </div>
              </div>
              {getConnectionStatus(provider.connected)}
            </div>

            {/* Metrics */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-1">{provider.metrics.label}</p>
              <div className="flex items-baseline">
                <span className="text-lg font-semibold text-gray-900">
                  {provider.metrics.primary}
                </span>
                {provider.metrics.secondary && (
                  <span className="text-lg font-semibold text-gray-900 ml-1">
                    • {provider.metrics.secondary}
                  </span>
                )}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => handleConnectClick(provider)}
              className={`w-full py-2.5 px-4 rounded-lg font-medium transition-colors ${
                'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {provider.connected ? 'View Details' : 'Connect'}
            </button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProviders.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No providers found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Connection Modal */}
      <ConnectionModal
        isOpen={showConnectionModal}
        onClose={() => {
          setShowConnectionModal(false);
          setSelectedProvider(null);
        }}
        provider={selectedProvider}
        onConnect={handleConnect}
      />
    </div>
  );
}
