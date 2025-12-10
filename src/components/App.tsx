import React, { useEffect, useState, Suspense } from 'react';
import { Dashboard } from '../components/Dashboard';
import { Header } from '../components/Header';
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
    <div className="flex flex-col min-h-screen">
      <Header siteMeta={siteMeta} />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative">
        {!hasCategories ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-2xl border border-white/20 dark:border-gray-700/30">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t('welcome')}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t('welcomeMessage')}
            </p>
          </div>
        ) : (
          <>
             {/* Pass filtered categories if searching, but Dashboard expects full config structure for reordering. 
                 Reordering should be disabled while searching ideally, or we only filter for display. 
                 The Dashboard component handles the rendering of config.categories. 
                 We need to temporarily override the displayed categories in Dashboard if we want search.
                 However, Dashboard is tightly coupled to the Context's config. 
                 
                 Let's make Dashboard smart enough to handle search visibility or 
                 we update the context to have a "displayConfig" vs "storedConfig".
                 
                 For simplicity, let's use CSS hiding in Dashboard or pass a filter prop.
                 Let's modifying Dashboard.tsx to accept filtered items is tricky with Drag and Drop.
                 
                 Actually, the previous CSS-based search was very performant and didn't mess with state.
                 Let's re-implement CSS-based search or similar visibility logic in Dashboard.tsx components.
              */}
            <Dashboard />
          </>
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
