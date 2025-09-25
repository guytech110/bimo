import React, { useState } from 'react';
import { AppState } from './types';
import LoginPage from './components/LoginPage';
import OnboardingFlow from './components/OnboardingFlow';
import Dashboard from './components/Dashboard';
import SidebarLayout from './components/SidebarLayout';
import ProvidersIndex from './components/ProvidersIndex';
import ProviderDetail from './components/ProviderDetail';
import BudgetsAlerts from './components/BudgetsAlerts';
import BillingUsage from './components/BillingUsage';
import UsersAccess from './components/UsersAccess';
import MonitoringHealth from './components/MonitoringHealth';

function App() {
  const [appState, setAppState] = useState<AppState>({
    currentPage: 'onboarding',
    onboardingComplete: false,
  });
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handlePageChange = (page: AppState['currentPage']) => {
    setAppState(prev => ({ ...prev, currentPage: page }));
    setSelectedProvider(null); // Clear provider selection when changing pages
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleOnboardingComplete = () => {
    setAppState(prev => ({ 
      ...prev, 
      onboardingComplete: true, 
      currentPage: 'dashboard' 
    }));
  };

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
  };

  const handleBackToProviders = () => {
    setSelectedProvider(null);
  };

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Show onboarding if not completed
  if (!appState.onboardingComplete) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // Main app with sidebar layout
  const renderCurrentPage = () => {
    // Show provider detail if on providers page and a provider is selected
    if (appState.currentPage === 'providers' && selectedProvider) {
      return (
        <ProviderDetail 
          providerId={selectedProvider} 
          onBack={handleBackToProviders} 
        />
      );
    }

    switch (appState.currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'providers':
        return <ProvidersIndex onProviderSelect={handleProviderSelect} />;
      case 'budgets':
        return <BudgetsAlerts />;
      case 'billing':
        return <BillingUsage />;
      case 'users':
        return <UsersAccess />;
      case 'monitoring':
        return <MonitoringHealth />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarLayout 
      currentPage={appState.currentPage}
      onPageChange={handlePageChange}
    >
      {renderCurrentPage()}
    </SidebarLayout>
  );
}

export default App;
