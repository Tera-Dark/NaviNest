import React, { useState } from 'react';
import { X, Globe, Download, RotateCcw, Copy, Check, Info, Upload, FileJson } from 'lucide-react';
import { setLanguage, type Language } from '../utils/i18n';
import { useTranslation } from '../hooks/useTranslation';
import { useDashboard } from '../store/DashboardContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { t, lang } = useTranslation();
  const { config, resetConfig, importConfig } = useDashboard();
  const [activeTab, setActiveTab] = useState<'general' | 'data' | 'about'>('general');
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');

  if (!isOpen) return null;

  const getCleanConfig = () => {
    return {
        ...config,
        categories: config.categories.map(({ id, items, ...catRest }) => ({
            ...catRest,
            items: items.map(({ id: itemId, ...itemRest }) => itemRest)
        }))
    };
  };

  const handleCopyConfig = () => {
    const exportConfig = getCleanConfig();
    navigator.clipboard.writeText(JSON.stringify(exportConfig, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const exportConfig = getCleanConfig();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportConfig, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "navinest-config.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (mode: 'merge' | 'overwrite') => {
    if (!importText.trim()) return;
    const success = importConfig(importText, mode);
    if (success) {
        alert(t('importSuccess') || 'Import successful!');
        setImportText('');
        onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
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
            className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'data' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('data')}
          >
            {t('dataManagement') || 'Data'}
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'about' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('about')}
          >
            About
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
          ) : activeTab === 'data' ? (
            <div className="space-y-8">
              {/* Export Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      <FileJson size={20} />
                      {t('exportConfig')}
                   </h3>
                   <div className="flex gap-2">
                       <button 
                          onClick={handleDownload}
                          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                       >
                          <Download size={16} />
                          {t('download') || 'Download'}
                       </button>
                       <button 
                          onClick={handleCopyConfig}
                          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
                       >
                          {copied ? <Check size={16} /> : <Copy size={16} />}
                          {copied ? t('copied') : t('copy')}
                       </button>
                   </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('jsonConfigHelp')}
                </p>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl overflow-x-auto text-xs font-mono border border-gray-200 dark:border-gray-700 max-h-[200px]">
                  {JSON.stringify(config, null, 2)}
                </pre>
              </div>

              {/* Import Section */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                 <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <Upload size={20} />
                    {t('importConfig') || 'Import Configuration'}
                 </h3>
                 <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('importHelp') || 'Paste your configuration JSON here to import.'}
                 </p>
                 <textarea 
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    className="w-full h-32 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none resize-none"
                    placeholder="{ ... }"
                 />
                 <div className="flex gap-3">
                    <button 
                        onClick={() => handleImport('merge')}
                        disabled={!importText.trim()}
                        className="flex-1 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                    >
                        {t('merge') || 'Merge'}
                    </button>
                    <button 
                        onClick={() => {
                            if(confirm('Are you sure you want to overwrite your current configuration? This cannot be undone.')) {
                                handleImport('overwrite');
                            }
                        }}
                        disabled={!importText.trim()}
                        className="flex-1 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                    >
                        {t('overwrite') || 'Overwrite'}
                    </button>
                 </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
               <div className="text-center mb-6">
                 <div className="inline-block p-4 rounded-full bg-indigo-100 dark:bg-indigo-900 mb-4">
                   <img src="/favicon.svg" alt="Logo" className="w-16 h-16" />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">NaviNest</h3>
                 <p className="text-gray-500 dark:text-gray-400">v1.0.0</p>
               </div>
               
               <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Info size={18} /> About
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {config.siteMeta.about ? (config.siteMeta.about as any)[lang] || config.siteMeta.about['en'] : 'No description available.'}
                  </p>
               </div>

               <div className="flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                  <p>© {new Date().getFullYear()} NaviNest. Open Source.</p>
                  <a href="https://github.com/Tera-Dark/NaviNest" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                    Visit GitHub Repository
                  </a>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
