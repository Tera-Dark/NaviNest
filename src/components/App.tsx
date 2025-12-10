import React, { useEffect, useState, Suspense } from 'react';
import { Dashboard } from '../components/Dashboard';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { DashboardProvider, useDashboard } from '../store/DashboardContext';
import { useTranslation } from '../hooks/useTranslation';

const AiChatWidget = React.lazy(() => import('../components/AiChatWidget').then(module => ({ default: module.AiChatWidget })));

// Inner component to access context
const AppContent = ({ siteMeta }: { siteMeta: any }) => {
  const { config } = useDashboard();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  
  const hasCategories = config.categories && config.categories.length > 0;

  // Filter categories based on search
  const filteredCategories = React.useMemo(() => {
    if (!searchQuery) return config.categories;

    return config.categories.map(cat => ({
      ...cat,
      items: cat.items.filter(item => 
        item.name.toLowerCase().includes(searchQuery) || 
        item.description.toLowerCase().includes(searchQuery)
      )
    })).filter(cat => cat.items.length > 0);
  }, [config.categories, searchQuery]);

  useEffect(() => {
    const handleSearch = (e: any) => setSearchQuery(e.detail);
    window.addEventListener('search-query', handleSearch);
    return () => window.removeEventListener('search-query', handleSearch);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50/50 dark:bg-gray-900/50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col h-full overflow-y-auto transition-all duration-300 scroll-smooth">
        <Header siteMeta={siteMeta} />

        <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative">
          {!hasCategories ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-white/30 dark:bg-gray-800/30 rounded-2xl border border-white/20 dark:border-gray-700/30">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t('welcome')}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {t('welcomeMessage')}
              </p>
            </div>
          ) : (
            <Dashboard />
          )}
          
          <div id="no-results" className={`text-center py-20 ${filteredCategories.length === 0 && searchQuery ? 'block' : 'hidden'}`}>
            <p className="text-xl text-gray-500 dark:text-gray-400">{t('noResults')}</p>
          </div>
        </main>

        <footer className="mt-auto py-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <div className="max-w-7xl mx-auto px-4">
            <p>&copy; {new Date().getFullYear()} NaviNest. Open Source Personal Dashboard.</p>
            <p className="mt-1 text-xs opacity-70">
              Built with Astro, Tailwind, and React.
            </p>
          </div>
        </footer>
      </div>
      
      <Suspense fallback={null}>
        <AiChatWidget />
      </Suspense>
    </div>
  );
};

export const App = ({ siteMeta }: { siteMeta: any }) => {
  return (
    <DashboardProvider>
      <AppContent siteMeta={siteMeta} />
    </DashboardProvider>
  );
};
