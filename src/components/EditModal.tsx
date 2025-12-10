import React, { useState, useMemo } from 'react';
import { X, Search, ChevronDown, Check } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { DynamicIcon } from '../components/DynamicIcon';
import dynamicIconImports from 'lucide-react/dynamicIconImports.mjs';
import clsx from 'clsx';

interface IconPickerProps {
  selectedIcon: string;
  onSelect: (icon: string) => void;
}

const IconPicker: React.FC<IconPickerProps> = ({ selectedIcon, onSelect }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { t } = useTranslation();
  
  // Get all valid icon names
  const allIcons = useMemo(() => Object.keys(dynamicIconImports), []);
  
  const filteredIcons = useMemo(() => {
    if (!search) return allIcons;
    return allIcons.filter(icon => icon.toLowerCase().includes(search.toLowerCase()));
  }, [search, allIcons]);

  const displayedIcons = useMemo(() => {
    return filteredIcons.slice(0, page * 60);
  }, [filteredIcons, page]);

  const hasMore = displayedIcons.length < filteredIcons.length;

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex justify-between items-center">
        {t('chooseIcon')}
        <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
          {filteredIcons.length} icons available
        </span>
      </label>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder={t('searchIcons') || "Search icons..."}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors outline-none text-sm"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 p-2">
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-[240px] overflow-y-auto custom-scrollbar p-1">
          {displayedIcons.map(icon => (
            <button
              key={icon}
              type="button"
              onClick={() => onSelect(icon)}
              className={clsx(
                "aspect-square flex items-center justify-center rounded-lg transition-colors duration-200",
                selectedIcon === icon 
                  ? "bg-indigo-500 text-white shadow-sm" 
                  : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-600 dark:hover:text-indigo-400"
              )}
              title={icon}
            >
              <DynamicIcon name={icon} size={20} />
            </button>
          ))}
          
          {displayedIcons.length === 0 && (
             <div className="col-span-full py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                No icons found
             </div>
          )}
        </div>
        
        {hasMore && (
          <button
            type="button"
            onClick={() => setPage(p => p + 1)}
            className="w-full mt-2 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            Load More <ChevronDown size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  type: 'category' | 'link';
}

export const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSave, initialData, type }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(initialData || { name: '', icon: type === 'category' ? 'folder' : 'link', url: '', description: '' });

  React.useEffect(() => {
    if (isOpen) {
        setFormData(initialData || { name: '', icon: type === 'category' ? 'folder' : 'link', url: '', description: '' });
    }
  }, [isOpen, initialData, type]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const InputField = ({ label, value, onChange, required = false, type = "text", placeholder = "" }: any) => (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        required={required}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/20 rounded-lg">
                <DynamicIcon name={formData.icon} size={24} className="text-white" />
             </div>
             <div>
                <h3 className="font-bold text-xl leading-tight">
                    {initialData ? (type === 'category' ? t('editCategory') : t('editLink')) : (type === 'category' ? t('addCategory') : t('addLink'))}
                </h3>
                <p className="text-indigo-100 text-xs opacity-90 font-medium tracking-wide">
                    {type === 'category' ? "Manage your dashboard section" : "Add a new bookmark"}
                </p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-5">
            <InputField 
                label={t('name')} 
                value={formData.name} 
                onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., GitHub"
            />

            {type === 'link' && (
                <>
                <InputField 
                    label={t('url')} 
                    value={formData.url} 
                    onChange={(e: any) => setFormData({ ...formData, url: e.target.value })}
                    required
                    type="url"
                    placeholder="https://example.com"
                />
                <InputField 
                    label={t('description')} 
                    value={formData.description} 
                    onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the site"
                />
                </>
            )}

            <IconPicker selectedIcon={formData.icon} onSelect={(icon) => setFormData({ ...formData, icon })} />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-xl font-medium transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Check size={18} />
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
