import React, { useState, Suspense, useEffect } from 'react';
import Sidebar from '../components/layouts/Sidebar';
import Header from '../components/layouts/Header';
import PageLoading from '../components/ui/PageLoading';
// FIX: Corrected import path for types to point to the new single source of truth.
import { Page, PostContent } from '../types/index';
import { useProfile } from '../store/profileContext';
import { useOptimizedAI } from '../store/optimized/aiContext';
import FloatingAIButton from '../components/features/ai/FloatingAIButton';
import { ComponentErrorBoundary, NetworkErrorBoundary } from '../components/ui/ErrorBoundaries';
import { usePageView, useFeatureTracking } from '../hooks/useAnalytics';
import { PWAInstallBanner, PWAUpdateNotification, NetworkStatus } from '../components/ui/PWAComponents';
import PerformanceDebugger from '../components/debug/PerformanceDebugger';
import { useRenderPerformance } from '../hooks/usePerformanceMonitoring';

// Lazy load heavy components
const OnboardingWizard = React.lazy(() => import('../components/features/onboarding/OnboardingWizard'));

// Lazy load all page components to reduce initial bundle size
const DashboardPage = React.lazy(() => import('./dashboard/page'));
const CustomersPage = React.lazy(() => import('./customers/page'));
const ContentPage = React.lazy(() => import('./content/page'));
const CalendarPage = React.lazy(() => import('./calendar/page'));
const SettingsPage = React.lazy(() => import('./settings/page'));
const AssetsPage = React.lazy(() => import('./assets/page'));
const SystemsPage = React.lazy(() => import('./systems/page'));
const AIStrategyPage = React.lazy(() => import('./aistrategy/page'));

const MainLayout: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('Systems');
  const { hasOnboarded } = useProfile();
  const { appContext, setAppContext } = useOptimizedAI(); // Use the AI context
  const [prefilledContent, setPrefilledContent] = useState<PostContent | null>(null);
  const { trackFeature } = useFeatureTracking();
  
  // Performance monitoring for main layout
  useRenderPerformance('MainLayout');

  // Track page views when active page changes
  usePageView(activePage, {
    has_onboarded: hasOnboarded,
    user_context: appContext.selectedEntityId ? 'entity_selected' : 'general'
  });

  const handleNavigateWithContent = (content: PostContent, page: Page) => {
    setPrefilledContent(content);
    handlePageChange(page);
  };

  const handlePageChange = (page: Page) => {
    // Track navigation event
    trackFeature('navigation', 'page_changed', {
      from_page: activePage,
      to_page: page,
      has_entity_context: !!appContext.selectedEntityId
    });

    setActivePage(page);
    // Update AI context when page changes, preserving entity info if switching to a related page
    if (page !== 'Customers' && page !== 'Content') {
      setAppContext({ page });
    } else {
      setAppContext(prev => ({ ...prev, page }));
    }
  };

  const clearPrefilledContent = () => {
    setPrefilledContent(null);
  };

  const getPageName = (page: Page): string => {
    const pageNames = {
      'Dashboard': 'Dashboard',
      'Customers': 'Clientes',
      'Content': 'Contenido',
      'Calendar': 'Calendario',
      'Assets': 'Assets',
      'Systems': 'Sistemas',
      'AIStrategy': 'Estrategia IA',
      'Settings': 'Configuración'
    };
    return pageNames[page] || 'la página';
  };

  const renderContent = () => {
    const content = (() => {
      switch (activePage) {
        case 'Dashboard':
          return <DashboardPage setActivePage={handlePageChange} onNavigateWithContent={handleNavigateWithContent} />;
        case 'Customers':
          return <CustomersPage onNavigateWithContent={handleNavigateWithContent} />;
        case 'Content':
          return <ContentPage prefilledContent={prefilledContent} clearPrefilledContent={clearPrefilledContent} />;
        case 'Calendar':
          return <CalendarPage onNavigateWithContent={handleNavigateWithContent} />;
        case 'Assets':
          return <AssetsPage />;
        case 'Systems':
          return <SystemsPage />;
        case 'AIStrategy':
          return <AIStrategyPage />;
        case 'Settings':
          return <SettingsPage />;
        default:
          return <DashboardPage setActivePage={handlePageChange} onNavigateWithContent={handleNavigateWithContent}/>;
      }
    })();

    return (
      <ComponentErrorBoundary name={`page-${activePage.toLowerCase()}`}>
        <Suspense fallback={<PageLoading pageName={getPageName(activePage)} />}>
          {content}
        </Suspense>
      </ComponentErrorBoundary>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 text-gray-800 dark:text-gray-200">
      {!hasOnboarded && (
        <Suspense fallback={<PageLoading pageName="Onboarding" />}>
          <OnboardingWizard />
        </Suspense>
      )}
      <Sidebar activePage={activePage} setActivePage={handlePageChange} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header pageTitle={activePage} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent">
          <div className="min-h-full">
            {renderContent()}
          </div>
        </main>
      </div>
      <NetworkErrorBoundary name="floating-ai-button">
        <FloatingAIButton appContext={appContext} />
      </NetworkErrorBoundary>
      
      {/* PWA Components */}
      <PWAInstallBanner />
      <PWAUpdateNotification />
      <NetworkStatus />
      
      {/* Performance Debugging (only in development) */}
      {import.meta.env.DEV && (
        <PerformanceDebugger position="bottom-left" />
      )}
    </div>
  );
};

export default MainLayout;