import React, { useState, useMemo } from 'react';
import { useDashboard, type Category, type LinkItem } from '../store/DashboardContext';
import { DynamicIcon } from './DynamicIcon';
import { EditModal } from './EditModal';
import { useTranslation } from '../hooks/useTranslation';
import { Plus, GripVertical, Trash2, Edit2, Link as LinkIcon, Star } from 'lucide-react';
import clsx from 'clsx';

const LinkCardItem = ({ item, categoryId, isFavoriteSection = false }: { item: LinkItem, categoryId: string, isFavoriteSection?: boolean }) => {
  const { isEditMode, updateLink, deleteLink, toggleFavorite, config } = useDashboard();
  const [isEditing, setIsEditing] = useState(false);
  // const controls = useDragControls(); // Unused now
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);

  const isFavorite = config.favorites?.includes(item.id);

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

  const CardContent = (
    <div className={clsx(
      "h-full flex flex-col p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl transition-all duration-200 overflow-hidden",
      isEditMode && !isFavoriteSection ? "cursor-grab active:cursor-grabbing border-dashed border-indigo-300 dark:border-indigo-700" : "hover:shadow-md hover:-translate-y-0.5"
    )}>
       {!isEditMode ? (
         <a href={item.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-0"></a>
       ) : (
         !isFavoriteSection && (
          <div className="absolute top-2 right-2 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-gray-800/80 rounded-lg p-1">
            <button onClick={() => setIsEditing(true)} className="p-1 text-blue-500 hover:bg-blue-100 rounded"><Edit2 size={16} /></button>
            <button onClick={() => { if(confirm(t('confirmDelete'))) deleteLink(categoryId, item.id); }} className="p-1 text-red-500 hover:bg-red-100 rounded"><Trash2 size={16} /></button>
            <div className="p-1 text-gray-400 cursor-grab touch-none"><GripVertical size={16} /></div>
          </div>
         )
       )}

       {/* Favorite Button */}
       <div className="absolute top-2 right-2 z-20" style={{ display: isEditMode && !isFavoriteSection ? 'none' : 'block' }}>
           <button 
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(item.id);
            }}
            className={clsx(
                "p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100",
                isFavorite ? "opacity-100 text-yellow-400 hover:text-yellow-500 bg-yellow-100/50 dark:bg-yellow-900/30" : "text-gray-400 hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
           >
               <Star size={16} fill={isFavorite ? "currentColor" : "none"} />
           </button>
       </div>

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
  );

  const EditModalComponent = isEditing && (
    <EditModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={(data) => updateLink(categoryId, item.id, data)}
        initialData={item}
        type="link"
    />
  );

  if (isFavoriteSection) {
    return (
      <>
        <div className="relative group h-full">
            {CardContent}
        </div>
        {EditModalComponent}
      </>
    );
  }

  return (
    <>
      {/* Reorder.Item removed, using div instead */}
      <div className="relative group h-full">
        {CardContent}
      </div>
      {EditModalComponent}
    </>
  );
};

const CategorySection = ({ category }: { category: Category }) => {
  const { isEditMode, updateCategory, deleteCategory, reorderLinks, addLink } = useDashboard();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingLink, setIsAddingLink] = useState(false);
  // const controls = useDragControls(); // Unused now
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
      {/* Reorder.Item removed */}
      <div className="mb-8 relative">
        <div className="flex items-center justify-between mb-4 px-1 group">
            <div className="flex items-center gap-2">
                {isEditMode && (
                    <div className="cursor-grab touch-none text-gray-400 hover:text-gray-600">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            </div>
            
            {category.items.length === 0 && !isEditMode && (
                <p className="text-gray-500 italic text-sm">No items yet.</p>
            )}
        </div>
      </div>

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
  const { config, isEditMode, reorderCategories, addCategory, currentView } = useDashboard();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const { t } = useTranslation();

  const favoriteLinks = useMemo(() => {
    if (!config.favorites || config.favorites.length === 0) return [];
    
    const allLinks = config.categories.flatMap(cat => cat.items);
    return config.favorites
      .map(favId => allLinks.find(link => link.id === favId))
      .filter((link): link is LinkItem => !!link);
  }, [config]);

  // View: Favorites
  if (currentView === 'favorites') {
      return (
        <div className="w-full">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                <Star className="text-yellow-400" size={28} fill="currentColor" />
                {t('favorites')}
            </h2>
            
            {favoriteLinks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {favoriteLinks.map(link => {
                        const category = config.categories.find(c => c.items.some(i => i.id === link.id));
                        if (!category) return null;
                        
                        return (
                            <LinkCardItem 
                                key={`fav-page-${link.id}`} 
                                item={link} 
                                categoryId={category.id} 
                                isFavoriteSection={true} 
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Star size={48} className="mb-4 opacity-50" />
                    <p className="text-lg">{t('noFavorites') || "No favorites yet"}</p>
                    <p className="text-sm mt-2">Click the star icon on any link to add it here.</p>
                </div>
            )}
        </div>
      );
  }

  // View: Home
  return (
    <div className="w-full">
      <div className="flex flex-col">
        {config.categories.map((category) => (
          <CategorySection key={category.id} category={category} />
        ))}
      </div>

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
