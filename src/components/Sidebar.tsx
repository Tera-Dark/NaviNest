import React, { useState } from 'react';
import { useDashboard } from '../store/DashboardContext';
import { useTranslation } from '../hooks/useTranslation';
import { Home, Star, Settings, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export const Sidebar = () => {
  const { currentView, setCurrentView, toggleEditMode, isEditMode } = useDashboard();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);

  const navItems = [
    { id: 'home', label: t('general') || 'Home', icon: Home, view: 'home' },
    { id: 'favorites', label: t('favorites') || 'Favorites', icon: Star, view: 'favorites' },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Toggle Button - Visible only on small screens */}
      <button 
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md md:hidden border border-gray-200 dark:border-gray-700"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Container */}
      <aside 
        className={clsx(
          "fixed md:relative top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40 flex flex-col transition-all duration-300 ease-in-out",
          isOpen ? "w-64 translate-x-0" : "w-20 -translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo / Header Area */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
            {isOpen ? (
                 <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">NaviNest</span>
            ) : (
                 <span className="text-xl font-bold text-indigo-500">N</span>
            )}
            
            <button 
                onClick={toggleSidebar}
                className="hidden md:flex p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500"
            >
                {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                  setCurrentView(item.view as 'home' | 'favorites');
                  if (window.innerWidth < 768) setIsOpen(false);
              }}
              className={clsx(
                "w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-colors duration-200 group relative",
                currentView === item.view 
                  ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
              )}
              title={!isOpen ? item.label : undefined}
            >
              <item.icon size={24} className={clsx("flex-shrink-0 transition-transform", currentView === item.view && "scale-105")} />
              {isOpen && <span>{item.label}</span>}
              
              {/* Active Indicator - Static version */}
              {currentView === item.view && (
                  <div 
                    className="absolute left-0 w-1 h-8 bg-indigo-500 rounded-r-full top-1/2 -translate-y-1/2" 
                  />
              )}
            </button>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
            <button
              onClick={toggleEditMode}
              className={clsx(
                "w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-colors duration-200",
                isEditMode 
                  ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 font-medium" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
               title={!isOpen ? (isEditMode ? "Exit Edit" : "Edit Mode") : undefined}
            >
                <Settings size={24} className="flex-shrink-0" />
                {isOpen && <span>{isEditMode ? t('save') : t('editMode')}</span>}
            </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
            className="fixed inset-0 bg-black/20 z-30 md:hidden"
            onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
