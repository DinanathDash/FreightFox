import { useState, useEffect } from 'react';

export function useSearch(searchItems, options = {}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const {
    minQueryLength = 2,
    debounceTime = 300,
  } = options;
  
  useEffect(() => {
    if (!query || query.length < minQueryLength) {
      setResults(null);
      return;
    }
    
    const trimmedQuery = query.toLowerCase().trim();
    let timeoutId;
    
    setIsSearching(true);
    
    // Debounce the search to avoid unnecessary searches while typing
    timeoutId = setTimeout(() => {
      const searchResults = {};
      
      // Search through each item type (faqs, guides, videos, etc.)
      Object.keys(searchItems).forEach(itemType => {
        if (Array.isArray(searchItems[itemType])) {
          const matchingItems = searchItems[itemType].filter(item => {
            // Generic search across all properties
            return Object.values(item).some(value => {
              if (typeof value === 'string') {
                return value.toLowerCase().includes(trimmedQuery);
              }
              return false;
            });
          });
          
          searchResults[itemType] = matchingItems;
        }
      });
      
      setResults(searchResults);
      setIsSearching(false);
    }, debounceTime);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [query, searchItems, minQueryLength, debounceTime]);
  
  const hasResults = results && Object.values(results).some(items => items.length > 0);
  
  return {
    query,
    setQuery,
    results,
    isSearching,
    hasResults,
    clearSearch: () => setQuery('')
  };
}
