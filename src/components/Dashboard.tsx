import React, { useState } from 'react';
import { useDashboard, type Category, type LinkItem } from '../store/DashboardContext';
import { DynamicIcon } from './DynamicIcon';
import { EditModal } from './EditModal';
import { useTranslation } from '../hooks/useTranslation';
import { Reorder, useDragControls } from 'framer-motion';
import { Plus, GripVertical, Trash2, Edit2, Link as LinkIcon } from 'lucide-react';
import clsx from 'clsx';

const LinkCardItem = ({ item, categoryId }: { item: LinkItem, categoryId: string }) => {
  const { isEditMode, updateLink, deleteLink } = useDashboard();
  const [isEditing, setIsEditing] = useState(false);
  const controls = useDragControls();
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);

  React.useEffect(() => {
    const handleSearch = (e: any) => {
        const query = e.detail;
        if (!query) {
            setIsVisible(true);
            return;
        }
        const match = item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);
        setIsVisible(match);
    };
    window.addEventListener('search-query', handleSearch);
    return () => window.removeEventListener('search-query', handleSearch);
  }, [item]);

  if (!isVisible) return null;

  return (
    <>
      <Reorder.Item
        value={item}
        dragListener={isEditMode}
        dragControls={controls}
        className="relative group h-full"
      >
        <div className={clsx(
          "h-full flex flex-col p-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-xl transition-all duration-300 overflow-hidden",
          isEditMode ? "cursor-grab active:cursor-grabbing border-dashed border-indigo-300 dark:border-indigo-700" : "hover:shadow-lg hover:-translate-y-1"
        )}>
           {!isEditMode ? (
             <a href={item.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-0"></a>
           ) : (
             <div className="absolute top-2 right-2 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-gray-800/80 rounded-lg p-1">
               <button onClick={() => setIsEditing(true)} className="p-1 text-blue-500 hover:bg-blue-100 rounded"><Edit2 size={16} /></button>
               <button onClick={() => { if(confirm(t('confirmDelete'))) deleteLink(categoryId, item.id); }} className="p-1 text-red-500 hover:bg-red-100 rounded"><Trash2 size={16} /></button>
               <div onPointerDown={(e) => controls.start(e)} className="p-1 text-gray-400 cursor-grab touch-none"><GripVertical size={16} /></div>
             </div>
           )}

            <div className="flex items-center gap-3 mb-2 relative z-10 pointer-events-none">
                <div className="p-2 rounded-lg bg-indigo-100/50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                    <DynamicIcon name={item.icon} size={20} />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate w-full">
                    {item.name}
                </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 relative z-10 pointer-events-none">
                {item.description}
            </p>
        </div>
      </Reorder.Item>

      {isEditing && (
        <EditModal
            isOpen={isEditing}
            onClose={() => setIsEditing(false)}
            onSave={(data) => updateLink(categoryId, item.id, data)}
            initialData={item}
            type="link"
        />
      )}
    </>
  );
};

const CategorySection = ({ category }: { category: Category }) => {
  const { isEditMode, updateCategory, deleteCategory, reorderLinks, addLink } = useDashboard();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const controls = useDragControls();
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);

  React.useEffect(() => {
    const handleSearch = (e: any) => {
        const query = e.detail;
        if (!query) {
            setIsVisible(true);
            return;
        }
        // If any item matches, show category. Or if category name matches.
        const hasMatchingItems = category.items.some(item => 
            item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)
        );
        setIsVisible(hasMatchingItems);
    };
    window.addEventListener('search-query', handleSearch);
    return () => window.removeEventListener('search-query', handleSearch);
  }, [category]);

  if (!isVisible) return null;

  const handlePaste = async (e: React.ClipboardEvent) => {
      if (!isEditMode) return;
      e.preventDefault();
      const text = e.clipboardData.getData('text');
      if (text.startsWith('http')) {
          addLink(category.id, {
              name: text, // Ideally fetch metadata, but simple for now
              url: text,
              icon: 'Link',
              description: 'Imported Link'
          });
      }
  };

  const handleDrop = (e: React.DragEvent) => {
      if (!isEditMode) return;
      e.preventDefault();
      const text = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
      if (text && text.startsWith('http')) {
          addLink(category.id, {
              name: text,
              url: text,
              icon: 'Link',
              description: 'Dropped Link'
          });
      }
  };

  return (
    <>
      <Reorder.Item 
        value={category} 
        dragListener={isEditMode}
        dragControls={controls}
        className="mb-8 relative"
      >
        <div className="flex items-center justify-between mb-4 px-1 group">
            <div className="flex items-center gap-2">
                {isEditMode && (
                    <div onPointerDown={(e) => controls.start(e)} className="cursor-grab touch-none text-gray-400 hover:text-gray-600">
                        <GripVertical size={20} />
                    </div>
                )}
                <DynamicIcon name={category.icon} className="text-indigo-500" size={24} />
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{category.name}</h2>
            </div>
            
            {isEditMode && (
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setIsEditing(true)} className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"><Edit2 size={16} /></button>
                    <button onClick={() => { if(confirm(t('confirmDelete'))) deleteCategory(category.id); }} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><Trash2 size={16} /></button>
                </div>
            )}
        </div>

        <div 
            className={clsx(
                "min-h-[100px] rounded-xl transition-all", 
                isEditMode && "border-2 border-dashed border-gray-300 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-800/50"
            )}
            onPaste={handlePaste}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            tabIndex={isEditMode ? 0 : -1}
        >
            <Reorder.Group axis="y" values={category.items} onReorder={(newItems) => reorderLinks(category.id, newItems)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {category.items.map((item) => (
                    <LinkCardItem key={item.id} item={item} categoryId={category.id} />
                ))}
                
                {isEditMode && (
                     <button 
                        onClick={() => setIsAddingLink(true)}
                        className="flex flex-col items-center justify-center p-4 min-h-[120px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-gray-400 hover:text-indigo-500 transition-all"
                     >
                        <Plus size={32} />
                        <span className="mt-2 text-sm font-medium">{t('addLink')}</span>
                        <span className="text-xs mt-1 text-gray-400">{t('dropUrl')}</span>
                     </button>
                )}
            </Reorder.Group>
            
            {category.items.length === 0 && !isEditMode && (
                <p className="text-gray-500 italic text-sm">No items yet.</p>
            )}
        </div>
      </Reorder.Item>

      {isEditing && (
        <EditModal
            isOpen={isEditing}
            onClose={() => setIsEditing(false)}
            onSave={(data) => updateCategory(category.id, data.name, data.icon)}
            initialData={category}
            type="category"
        />
      )}
      
      {isAddingLink && (
        <EditModal
            isOpen={isAddingLink}
            onClose={() => setIsAddingLink(false)}
            onSave={(data) => addLink(category.id, data)}
            type="link"
        />
      )}
    </>
  );
};

export const Dashboard = () => {
  const { config, isEditMode, reorderCategories, addCategory } = useDashboard();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="w-full">
      <Reorder.Group axis="y" values={config.categories} onReorder={reorderCategories}>
        {config.categories.map((category) => (
          <CategorySection key={category.id} category={category} />
        ))}
      </Reorder.Group>

      {isEditMode && (
        <button
          onClick={() => setIsAddingCategory(true)}
          className="w-full py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-gray-500 hover:text-indigo-500 transition-all flex flex-col items-center justify-center gap-2 mb-8"
        >
          <Plus size={40} />
          <span className="text-lg font-medium">{t('addCategory')}</span>
        </button>
      )}

      {isAddingCategory && (
        <EditModal
            isOpen={isAddingCategory}
            onClose={() => setIsAddingCategory(false)}
            onSave={(data) => addCategory(data.name, data.icon)}
            type="category"
        />
      )}
    </div>
  );
};
