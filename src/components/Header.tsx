import React, { useState } from 'react';
import { SearchBar } from './SearchBar';
import { Clock } from './Clock';
import { SettingsModal } from './SettingsModal';
import { useDashboard } from '../store/DashboardContext';
import { useTranslation } from '../hooks/useTranslation';
import { Settings, Edit3, X, Check } from 'lucide-react';
import clsx from 'clsx';

export const Header = ({ siteMeta }: { siteMeta: any }) => {
  const { isEditMode, toggleEditMode } = useDashboard();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo & Title */}
            <div className="flex items-center gap-3 shrink-0">
              <img src={siteMeta.logo} alt="Logo" className="h-8 w-8" />
              <h1 className="hidden md:block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                {siteMeta.title}
              </h1>
            </div>

            {/* Search Bar - Centered */}
            <div className="flex-1 max-w-lg mx-auto">
              <SearchBar />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <Clock />
              
              <button 
                onClick={toggleEditMode}
                className={clsx(
                    "p-2 rounded-lg transition-all border shadow-sm flex items-center gap-2",
                    isEditMode 
                        ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700" 
                        : "bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:bg-white/80 dark:hover:bg-gray-700/80 text-gray-700 dark:text-gray-200"
                )}
                title={t('editMode')}
              >
                {isEditMode ? <Check size={20} /> : <Edit3 size={20} />}
                <span className="hidden sm:inline text-sm font-medium">{isEditMode ? t('save') : t('editMode')}</span>
              </button>

              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all border border-gray-200 dark:border-gray-700 shadow-sm text-gray-700 dark:text-gray-200"
                title={t('settings')}
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};
