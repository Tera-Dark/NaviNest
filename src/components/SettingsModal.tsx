import React, { useState } from 'react';
import { X, Globe, Download, RotateCcw, Copy, Check } from 'lucide-react';
import { setLanguage, type Language } from '../utils/i18n';
import { useTranslation } from '../hooks/useTranslation';
import { useDashboard } from '../store/DashboardContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { t, lang } = useTranslation();
  const { config, resetConfig } = useDashboard();
  const [activeTab, setActiveTab] = useState<'general' | 'export'>('general');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyConfig = () => {
    // Clean up IDs for export to make it cleaner
    const exportConfig = {
        ...config,
        categories: config.categories.map(({ id, items, ...catRest }) => ({
            ...catRest,
            items: items.map(({ id: itemId, ...itemRest }) => itemRest)
        }))
    };
    
    navigator.clipboard.writeText(JSON.stringify(exportConfig, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 bg-indigo-600 text-white flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold">{t('settings')}</h2>
          <button onClick={onClose} className="p-1 hover:bg-indigo-500 rounded transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'general' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('general')}
          >
            {t('general')}
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'export' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('export')}
          >
            {t('exportConfig')}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'general' ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Globe size={20} /> {t('language')}
                </h3>
                <div className="flex gap-4">
                  {(['en', 'zh'] as Language[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLanguage(l)}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        lang === l
                          ? 'bg-indigo-100 border-indigo-500 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                          : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                      }`}
                    >
                      {l === 'en' ? 'English' : '中文'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <RotateCcw size={20} /> {t('resetConfig')}
                </h3>
                <button
                  onClick={resetConfig}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium"
                >
                  {t('resetConfig')}
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  This will revert all your local changes to the default configuration.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {t('jsonConfig')}
                 </h3>
                 <button 
                    onClick={handleCopyConfig}
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
                 >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? t('copied') : t('copy')}
                 </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('jsonConfigHelp')}
              </p>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl overflow-x-auto text-xs font-mono border border-gray-200 dark:border-gray-700 max-h-[400px]">
                {JSON.stringify(config, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
