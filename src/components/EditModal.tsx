import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { DynamicIcon } from '../components/DynamicIcon';
import dynamicIconImports from 'lucide-react/dynamicIconImports.mjs';

interface IconPickerProps {
  selectedIcon: string;
  onSelect: (icon: string) => void;
}

const IconPicker: React.FC<IconPickerProps> = ({ selectedIcon, onSelect }) => {
  const [search, setSearch] = useState('');
  const { t } = useTranslation();
  
  // Get all valid icon names (these are kebab-case keys from dynamicIconImports)
  const allIcons = Object.keys(dynamicIconImports);
  
  const filteredIcons = allIcons.filter(icon => icon.toLowerCase().includes(search.toLowerCase())).slice(0, 50);

  return (
    <div className="mt-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('chooseIcon')}</label>
      <input
        type="text"
        placeholder="Search icons..."
        className="w-full p-2 mb-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg dark:border-gray-600">
        {filteredIcons.map(icon => (
          <button
            key={icon}
            type="button"
            onClick={() => onSelect(icon)}
            className={`p-2 rounded flex items-center justify-center hover:bg-indigo-100 dark:hover:bg-indigo-900 ${selectedIcon === icon ? 'bg-indigo-200 dark:bg-indigo-800 ring-2 ring-indigo-500' : ''}`}
            title={icon}
          >
            <DynamicIcon name={icon} size={20} />
          </button>
        ))}
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

  // Reset form when opening
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
          <h3 className="font-semibold text-lg">
            {initialData ? (type === 'category' ? t('editCategory') : t('editLink')) : (type === 'category' ? t('addCategory') : t('addLink'))}
          </h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('name')}</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {type === 'link' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('url')}</label>
                <input
                  required
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('description')}</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </>
          )}

          <IconPicker selectedIcon={formData.icon} onSelect={(icon) => setFormData({ ...formData, icon })} />

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
