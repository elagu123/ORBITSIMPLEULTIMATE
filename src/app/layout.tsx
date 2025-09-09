import React, { useState } from 'react';
import Sidebar from '../components/layouts/Sidebar';
import Header from '../components/layouts/Header';
import DashboardPage from './dashboard/page';
import CustomersPage from './customers/page';
import ContentPage from './content/page';
import CalendarPage from './calendar/page';
import SettingsPage from './settings/page';
import AssetsPage from './assets/page';
import SystemsPage from './systems/page';
import AIStrategyPage from './aistrategy/page';
// FIX: Corrected import path for types to point to the new single source of truth.
import { Page, PostContent } from '../types/index';
import { useProfile } from '../store/profileContext';
import { useAI } from '../store/aiContext'; // Import the new context hook
import OnboardingWizard from '../components/features/onboarding/OnboardingWizard';
import FloatingAIButton from '../components/features/ai/FloatingAIButton';

const MainLayout: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('Systems');
  const { hasOnboarded } = useProfile();
  const { appContext, setAppContext } = useAI(); // Use the AI context
  const [prefilledContent, setPrefilledContent] = useState<PostContent | null>(null);

  const handleNavigateWithContent = (content: PostContent, page: Page) => {
    setPrefilledContent(content);
    handlePageChange(page);
  };

  const handlePageChange = (page: Page) => {
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

  const renderContent = () => {
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
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {!hasOnboarded && <OnboardingWizard />}
      <Sidebar activePage={activePage} setActivePage={handlePageChange} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header pageTitle={activePage} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
      <FloatingAIButton appContext={appContext} />
    </div>
  );
};

export default MainLayout;