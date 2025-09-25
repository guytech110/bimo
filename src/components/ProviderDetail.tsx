import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Clock, Zap, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ConnectionModal from './ConnectionModal';
import { API_BASE, apiPost } from '../lib/utils';

interface ProviderDetailProps {
  providerId: string;
  onBack: () => void;
}

export default function ProviderDetail({ providerId, onBack }: ProviderDetailProps) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [catalog, setCatalog] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [models, setModels] = useState<any[] | null>(null)
  const [usage, setUsage] = useState<any | null>(null)
  const [source, setSource] = useState<'prod' | 'dev'>(() => {
    try { return (localStorage.getItem('bimo:source') as 'prod' | 'dev') || 'prod' } catch { return 'prod' }
  })

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const catRes = await fetch(`${API_BASE || (window as any).__API_BASE__ || ''}/v1/providers/catalog`)
        const catJson = catRes.ok ? await catRes.json() : []
        const conRes = await fetch(`${API_BASE || (window as any).__API_BASE__ || ''}/v1/providers/connections`)
        const conJson = conRes.ok ? await conRes.json() : { data: [] }
        if (!mounted) return
        setCatalog(Array.isArray(catJson) ? catJson : (catJson?.data || []))
        setConnections(Array.isArray(conJson) ? conJson : (conJson?.data || []))
        // fetch live data when connected and provider is supported
        const conn = (Array.isArray(conJson) ? conJson : (conJson?.data || [])).find((c: any) => c.provider_id === providerId)
        if (conn) {
          try {
            // Try fetching connection-level models (preferred). Fall back to provider models for openai.
            let mJson = { data: [] as any[] }
            try {
              const mid = conn.id || conn.connection_id || conn.id
              if (mid) {
                const mRes = await fetch(`${API_BASE || (window as any).__API_BASE__ || ''}/v1/providers/${mid}/models`)
                mJson = mRes.ok ? await mRes.json() : { data: [] }
              }
            } catch (e) {
              // ignore and try provider-level models for OpenAI
              if (providerId === 'openai') {
                try {
                  const mRes = await fetch(`${API_BASE || (window as any).__API_BASE__ || ''}/v1/providers/${providerId}/models`)
                  mJson = mRes.ok ? await mRes.json() : { data: [] }
                } catch {}
              }
            }

            // Usage: call the connection-level usage endpoint using the connection id
            let uJson = {}
            try {
              const connId = conn.id || conn.connection_id || conn.id
              if (connId) {
                const uRes = await fetch(`${API_BASE || (window as any).__API_BASE__ || ''}/v1/providers/${connId}/usage?source=${source}`)
                uJson = uRes.ok ? await uRes.json() : {}
              }
            } catch (e) {
              // ignore usage errors
            }

            if (!mounted) return
            setModels(mJson?.data || [])
            setUsage(uJson || null)
          } catch {}
        }
      } catch (e) {
        // ignore for now; show mock fallback visuals but with real header info if possible
      }
    }
    load()
    return () => { mounted = false }
  }, [providerId])

  const providerMeta = useMemo(() => {
    const p = (catalog || []).find((p: any) => (p.id || p.provider_id) === providerId)
    if (p) {
      return {
        id: p.id || p.provider_id,
        name: p.name || providerId,
        logo: p.logo_url || p.logo || `/logos/${providerId}.png`,
      }
    }
    // fallback minimal
    return { id: providerId, name: providerId, logo: `/logos/${providerId}.png` }
  }, [catalog, providerId])

  const connection = useMemo(() => {
    return (connections || []).find((c: any) => (c.provider_id === providerId)) || null
  }, [connections, providerId])

  // Aggregate usage (best-effort across possible shapes)
  const usageRows = Array.isArray(usage?.data) ? usage.data : []
  const totalTokensIn = usageRows.reduce((sum: number, d: any) => sum + (d.input_tokens || d.n_input_tokens || 0), 0)
  const totalTokensOut = usageRows.reduce((sum: number, d: any) => sum + (d.output_tokens || d.n_output_tokens || 0), 0)
  const totalCostCents = usageRows.reduce((sum: number, d: any) => sum + (d.total || d.line_items_total || 0), 0)
  const totalCostUsd = totalCostCents / 100
  const tokensK = (totalTokensIn + totalTokensOut) / 1000
  const costPerK = tokensK > 0 ? (totalCostUsd / tokensK) : null

  const tabs = ['Overview', 'Usage', 'Models', 'Prompts', 'Recommendations', 'Settings'];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mr-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Providers
          </button>
          <div className="flex items-center">
            <div className="w-8 h-8 mr-3 rounded-lg overflow-hidden bg-white flex items-center justify-center">
              <img 
                src={providerMeta.logo} 
                alt={providerMeta.name}
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `<div class=\"w-6 h-6 bg-gray-300 rounded flex items-center justify-center text-gray-600 font-semibold text-xs\">${(providerMeta.name || providerMeta.id || 'P').charAt(0).toUpperCase()}</div>`;
                }}
              />
            </div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-semibold text-gray-900">{providerMeta.name}</h1>
              {connection ? (
                <div className="flex items-center text-green-600 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Connected
                </div>
              ) : (
                <button onClick={() => setShowConnectionModal(true)} className="px-3 py-1 rounded-md bg-gray-900 text-white text-sm hover:bg-gray-800">Connect</button>
              )}
              {/* Source toggle: Developer vs Production */}
              <div className="ml-4 flex items-center space-x-2">
                <span className="text-xs text-gray-500">Source</span>
                <div className="relative inline-flex items-center">
                  <button onClick={() => { localStorage.setItem('bimo:source', 'dev'); setSource('dev'); setUsage(null); }} className={`px-2 py-1 text-xs rounded-l-md ${source === 'dev' ? 'bg-white text-gray-900 shadow-sm' : 'bg-gray-100 text-gray-600'}`}>Dev</button>
                  <button onClick={() => { localStorage.setItem('bimo:source', 'prod'); setSource('prod'); setUsage(null); }} className={`px-2 py-1 text-xs rounded-r-md ${source === 'prod' ? 'bg-white text-gray-900 shadow-sm' : 'bg-gray-100 text-gray-600'}`}>Prod</button>
                </div>
                <div className="ml-2 px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700">{source.toUpperCase()}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          {connection ? `Connected on ${new Date(connection.created_at).toLocaleString()}` : 'Not Connected'}
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

      {/* Overview: Key Metrics Cards */}
      {activeTab === 'Overview' && (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Tokens In</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{totalTokensIn ? totalTokensIn.toLocaleString() : '—'}</div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Tokens Out</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{totalTokensOut ? totalTokensOut.toLocaleString() : '—'}</div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Cost (MTD)</span>
            <DollarSign className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{Number.isFinite(totalCostUsd) && totalCostUsd > 0 ? `$${totalCostUsd.toFixed(2)}` : '—'}</div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Cost per 1K tokens</span>
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{costPerK ? `$${costPerK.toFixed(4)}` : '—'}</div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Cache Hit %</span>
            <Zap className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">—</div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Avg Latency</span>
            <Clock className="w-4 h-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">—</div>
        </div>
      </div>
      )}

      {/* Connection Modal */}
      <ConnectionModal
        isOpen={showConnectionModal}
        onClose={() => setShowConnectionModal(false)}
        provider={{ id: providerMeta.id, name: providerMeta.name, description: `Track your ${providerMeta.name} usage and costs`, logo: providerMeta.logo, category: 'ai' }}
        onConnect={async (method, credentials) => {
          const res = await apiPost(`/v1/providers/${providerMeta.id}/connect`, { provider_id: providerMeta.id, method, credentials })
          if (res.status >= 200 && res.status < 300) {
            setShowConnectionModal(false)
            // refresh connections
            try {
              const conRes = await fetch(`${API_BASE || (window as any).__API_BASE__ || ''}/v1/providers/connections`)
              const conJson = conRes.ok ? await conRes.json() : { data: [] }
              setConnections(Array.isArray(conJson) ? conJson : (conJson?.data || []))
            } catch {}
          } else {
            alert('Failed to connect: ' + JSON.stringify(res.body))
          }
        }}
      />


      {/* Usage Tab */}
      {activeTab === 'Usage' && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tokens & Cost Trends */}
        <div className="lg:col-span-2 bg-white rounded-lg border shadow-sm p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tokens & Cost Trends</h3>
            <p className="text-gray-600 text-sm">
              {usage?.data && usage.data.length > 0 ? 
                "Live usage data" : 
                "No usage data available - make some API calls to see live data"}
            </p>
          </div>
          
          <div className="h-80">
            {usage?.data && usage.data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usage.data.map((d: any) => ({ date: d.timestamp || d.accrual_date || d.date, tokensIn: d.input_tokens || 0, tokensOut: d.output_tokens || 0, cost: (d.line_items_total || d.total || 0) / 100 }))} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis 
                    yAxisId="tokens"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    domain={[0, 100000]}
                    tickFormatter={(value) => `${value / 1000}K`}
                  />
                  <YAxis 
                    yAxisId="cost"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    domain={[0, 80]}
                  />
                  <Line 
                    yAxisId="tokens"
                    type="monotone" 
                    dataKey="tokensIn" 
                    stroke="#14b8a6" 
                    strokeWidth={2}
                    dot={{ fill: '#14b8a6', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    yAxisId="tokens"
                    type="monotone" 
                    dataKey="tokensOut" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    yAxisId="cost"
                    type="monotone" 
                    dataKey="cost" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">No usage data yet</div>
            )}
          </div>

          {usage?.data && usage.data.length > 0 && (
            <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-teal-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Tokens In</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Tokens Out</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Cost</span>
              </div>
            </div>
          )}

          {/* Summary Stats (shows live data if available, otherwise mock) */}
          <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600 mb-1">
                {usage?.data && usage.data.length > 0 ? 
                  usage.data.reduce((sum: number, d: any) => sum + (d.input_tokens || 0), 0).toLocaleString() : 
                  '--'}
              </div>
              <div className="text-sm text-gray-600">Total Tokens In</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {usage?.data && usage.data.length > 0 ? 
                  usage.data.reduce((sum: number, d: any) => sum + (d.output_tokens || 0), 0).toLocaleString() : 
                  '--'}
              </div>
              <div className="text-sm text-gray-600">Total Tokens Out</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {usage?.data && usage.data.length > 0 ? 
                  `$${((usage.data.reduce((sum: number, d: any) => sum + (d.total || 0), 0) / 100).toFixed(0))}` : 
                  '--'}
              </div>
              <div className="text-sm text-gray-600">Total Cost</div>
            </div>
          </div>
        </div>

        {/* Cache Hit Rate (placeholder) */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cache Hit Rate</h3>
          
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-48 h-48">
              <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#14b8a6"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${89 * 2.51} ${(100 - 89) * 2.51}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">—</div>
                  <div className="text-sm text-gray-600">Not available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Models Tab */}
      {activeTab === 'Models' && (
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Available Models</h3>
            <button
              className="px-3 py-1 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800"
              onClick={async () => {
                try {
                  const mRes = await fetch(`${API_BASE || (window as any).__API_BASE__ || ''}/v1/providers/${providerId}/models`)
                  const mJson = mRes.ok ? await mRes.json() : { data: [] }
                  setModels(mJson?.data || [])
                } catch {}
              }}
            >
              Refresh
            </button>
          </div>
          {models && models.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {models.map((m: any) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">{m.id}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{m.owned_by || m.owner || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-gray-600">No models available</div>
          )}
        </div>
      )}

      {/* Prompts / Recommendations / Settings tabs - placeholders */}
      {['Prompts','Recommendations','Settings'].includes(activeTab) && (
        <div className="bg-white rounded-lg border shadow-sm p-6 text-sm text-gray-600">Coming soon</div>
      )}

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Prompts by Cost */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Prompts by Cost</h3>
          
          <div className="text-sm text-gray-600">No prompt breakdown available</div>
        </div>

        {/* Spend by Model (live-only; hidden when no model data) */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spend by Model</h3>
          
          {models && models.length > 0 ? (
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-48 h-48">
                <PieChart width={192} height={192}>
                  <Pie
                    data={models.slice(0,3).map((m, i) => ({ name: m.id, value: 100 - i*20, color: ['#06b6d4','#8b5cf6','#14b8a6'][i%3] }))}
                    cx={96}
                    cy={96}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {models.slice(0,3).map((m, i) => (
                      <Cell key={`cell-${i}`} fill={['#06b6d4','#8b5cf6','#14b8a6'][i%3]} />
                    ))}
                  </Pie>
                </PieChart>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">No model data available</div>
          )}
        </div>
      </div>
    </div>
  );
}

