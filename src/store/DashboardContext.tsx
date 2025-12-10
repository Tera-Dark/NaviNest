import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import initialConfig from '../data/config.json';

// Define types locally to avoid circular deps
export interface LinkItem {
  id: string;
  name: string;
  url: string;
  icon: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  items: LinkItem[];
}

export interface Config {
  siteMeta: {
    title: string;
    description: string;
    theme: string;
    logo: string;
    about?: {
      en: string;
      zh: string;
    };
    [key: string]: any;
  };
  aiConfig: any;
  favorites?: string[]; // Add favorites array
  categories: Category[];
}

interface DashboardContextType {
  config: Config;
  isEditMode: boolean;
  toggleEditMode: () => void;
  updateConfig: (newConfig: Config) => void;
  addCategory: (name: string, icon: string) => void;
  updateCategory: (id: string, name: string, icon: string) => void;
  deleteCategory: (id: string) => void;
  addLink: (categoryId: string, link: Omit<LinkItem, 'id'>) => void;
  updateLink: (categoryId: string, linkId: string, link: Partial<LinkItem>) => void;
  deleteLink: (categoryId: string, linkId: string) => void;
  reorderCategories: (newCategories: Category[]) => void;
  reorderLinks: (categoryId: string, newLinks: LinkItem[]) => void;
  toggleFavorite: (linkId: string) => void; // Add toggle action
  resetConfig: () => void;
  importConfig: (configStr: string, mode: 'merge' | 'overwrite') => boolean;
  currentView: 'home' | 'favorites';
  setCurrentView: (view: 'home' | 'favorites') => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Helper to add IDs if missing (migration for existing json)
const normalizeConfig = (conf: any): Config => {
  const categories = conf.categories.map((cat: any) => ({
    ...cat,
    id: cat.id || uuidv4(),
    items: cat.items.map((item: any) => ({
      ...item,
      id: item.id || uuidv4()
    }))
  }));
  return { ...conf, categories };
};

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<Config>(() => normalizeConfig(initialConfig));
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'favorites'>('home');

  useEffect(() => {
    const savedConfig = localStorage.getItem('navinest_config');
    if (savedConfig) {
      try {
        let parsed = normalizeConfig(JSON.parse(savedConfig));
        
        // Auto-migration: Check for new default categories from initialConfig that are missing in saved config
        // This is a simple heuristic: if a category with the same name doesn't exist, we add it.
        const existingNames = new Set(parsed.categories.map(c => c.name));
        const normalizedDefaults = normalizeConfig(initialConfig);
        
        const newCategories = normalizedDefaults.categories.filter(c => !existingNames.has(c.name));
        
        if (newCategories.length > 0) {
            console.log("Merging new default categories:", newCategories.map(c => c.name));
            parsed = {
                ...parsed,
                categories: [...parsed.categories, ...newCategories]
            };
        }

        setConfig(parsed);
      } catch (e) {
        console.error("Failed to parse saved config", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('navinest_config', JSON.stringify(config));
    }
  }, [config, isLoaded]);

  const toggleEditMode = () => setIsEditMode(!isEditMode);

  const updateConfig = (newConfig: Config) => {
    setConfig(newConfig);
  };

  const addCategory = (name: string, icon: string) => {
    const newCategory: Category = {
      id: uuidv4(),
      name,
      icon,
      items: []
    };
    setConfig(prev => ({ ...prev, categories: [...prev.categories, newCategory] }));
  };

  const updateCategory = (id: string, name: string, icon: string) => {
    setConfig(prev => ({
      ...prev,
      categories: prev.categories.map(cat => 
        cat.id === id ? { ...cat, name, icon } : cat
      )
    }));
  };

  const deleteCategory = (id: string) => {
    setConfig(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat.id !== id)
    }));
  };

  const addLink = (categoryId: string, link: Omit<LinkItem, 'id'>) => {
    const newLink = { ...link, id: uuidv4() };
    setConfig(prev => ({
      ...prev,
      categories: prev.categories.map(cat => 
        cat.id === categoryId 
          ? { ...cat, items: [...cat.items, newLink] } 
          : cat
      )
    }));
  };

  const updateLink = (categoryId: string, linkId: string, updates: Partial<LinkItem>) => {
    setConfig(prev => ({
      ...prev,
      categories: prev.categories.map(cat => 
        cat.id === categoryId 
          ? {
              ...cat,
              items: cat.items.map(item => 
                item.id === linkId ? { ...item, ...updates } : item
              )
            }
          : cat
      )
    }));
  };

  const deleteLink = (categoryId: string, linkId: string) => {
    setConfig(prev => ({
      ...prev,
      categories: prev.categories.map(cat => 
        cat.id === categoryId 
          ? { ...cat, items: cat.items.filter(item => item.id !== linkId) } 
          : cat
      )
    }));
  };

  const reorderCategories = (newCategories: Category[]) => {
    setConfig(prev => ({ ...prev, categories: newCategories }));
  };

  const reorderLinks = (categoryId: string, newLinks: LinkItem[]) => {
    setConfig(prev => ({
      ...prev,
      categories: prev.categories.map(cat => 
        cat.id === categoryId ? { ...cat, items: newLinks } : cat
      )
    }));
  };

  const toggleFavorite = (linkId: string) => {
    setConfig(prev => {
        const currentFavorites = prev.favorites || [];
        const newFavorites = currentFavorites.includes(linkId) 
            ? currentFavorites.filter(id => id !== linkId)
            : [...currentFavorites, linkId];
        return { ...prev, favorites: newFavorites };
    });
  };

  const resetConfig = () => {
    if (confirm('Are you sure you want to reset configuration to defaults? This cannot be undone.')) {
        const normalized = normalizeConfig(initialConfig);
        setConfig(normalized);
        localStorage.removeItem('navinest_config');
    }
  };

  const importConfig = (configStr: string, mode: 'merge' | 'overwrite'): boolean => {
    try {
        const parsed = JSON.parse(configStr);
        
        // Basic validation
        if (!parsed.categories || !Array.isArray(parsed.categories)) {
            alert('Invalid configuration format: Missing categories array');
            return false;
        }

        const normalized = normalizeConfig(parsed);

        if (mode === 'overwrite') {
            setConfig(normalized);
            return true;
        }

        if (mode === 'merge') {
            // Generate new IDs for imported categories and items to avoid collision
            // Also map old IDs to new IDs to preserve favorites
            const idMap = new Map<string, string>();
            
            const newCategories = normalized.categories.map(cat => {
                const newCatId = uuidv4();
                // We don't map category IDs generally, but good practice
                
                const newItems = cat.items.map(item => {
                    const newItemId = uuidv4();
                    idMap.set(item.id, newItemId);
                    return { ...item, id: newItemId };
                });

                return { ...cat, id: newCatId, items: newItems };
            });

            // Handle favorites
            let newFavorites: string[] = [];
            if (normalized.favorites && Array.isArray(normalized.favorites)) {
                newFavorites = normalized.favorites
                    .map(oldId => idMap.get(oldId))
                    .filter((id): id is string => !!id);
            }

            setConfig(prev => ({
                ...prev,
                categories: [...prev.categories, ...newCategories],
                favorites: [...(prev.favorites || []), ...newFavorites]
            }));
            return true;
        }

        return false;
    } catch (e) {
        console.error("Import failed", e);
        alert('Failed to parse configuration JSON');
        return false;
    }
  };

  if (!isLoaded) return null; // Or a loader

  return (
    <DashboardContext.Provider value={{
      config,
      isEditMode,
      toggleEditMode,
      updateConfig,
      addCategory,
      updateCategory,
      deleteCategory,
      addLink,
      updateLink,
      deleteLink,
      reorderCategories,
      reorderLinks,
      toggleFavorite,
      resetConfig,
      importConfig,
      currentView,
      setCurrentView
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
