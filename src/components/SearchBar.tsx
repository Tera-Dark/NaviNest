import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export const SearchBar = () => {
  const [query, setQuery] = useState('');
  const { t } = useTranslation();

  React.useEffect(() => {
    const event = new CustomEvent('search-query', { detail: query.toLowerCase() });
    window.dispatchEvent(event);
  }, [query]);

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white/50 dark:bg-gray-800/50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm backdrop-blur-sm text-gray-900 dark:text-gray-100 transition-all shadow-sm"
        placeholder={t('searchPlaceholder')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
};
