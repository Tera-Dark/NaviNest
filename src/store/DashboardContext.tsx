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
  siteMeta: any;
  aiConfig: any;
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
  resetConfig: () => void;
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

  useEffect(() => {
    const savedConfig = localStorage.getItem('navinest_config');
    if (savedConfig) {
      try {
        setConfig(normalizeConfig(JSON.parse(savedConfig)));
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

  const resetConfig = () => {
    if (confirm('Are you sure you want to reset configuration to defaults? This cannot be undone.')) {
        const normalized = normalizeConfig(initialConfig);
        setConfig(normalized);
        localStorage.removeItem('navinest_config');
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
      resetConfig
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
