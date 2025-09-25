export type AppPage = 
  | 'onboarding' 
  | 'dashboard' 
  | 'providers' 
  | 'budgets' 
  | 'billing' 
  | 'users' 
  | 'monitoring';

export interface AppState {
  currentPage: AppPage;
  selectedProvider?: string;
  onboardingComplete: boolean;
}

export interface Provider {
  id: string;
  name: string;
  type: 'ai' | 'cloud' | 'saas';
  logo: string;
  description: string;
  connected: boolean;
  metrics: {
    primary: string;
    secondary: string;
    value: string;
  };
}

export interface ConnectionData {
  method: 'api-key' | 'oauth';
  apiKey?: string;
  connectedAt: string;
}

export interface Budget {
  id: string;
  provider: string;
  budget: number;
  currentSpend: number;
  percentUsed: number;
  alertChannel: string;
  status: 'healthy' | 'warning' | 'critical';
}

export interface Alert {
  id: string;
  type: 'budget' | 'anomaly' | 'threshold';
  provider: string;
  message: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'snoozed';
  severity: 'low' | 'medium' | 'high';
}
