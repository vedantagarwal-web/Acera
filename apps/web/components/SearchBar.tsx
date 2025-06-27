'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, TrendingUp, TrendingDown, X } from 'lucide-react';
import { searchStocks, StockData } from '../lib/realTimeData';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  accentColor?: string;
  className?: string;
}

export function SearchBar({ accentColor = 'blue', className = '' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StockData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate dropdown position when opening
  const updateDropdownPosition = () => {
    if (searchRef.current) {
      const rect = searchRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      });
    }
  };

  // Search function with debouncing
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim().length >= 1) {
        setIsLoading(true);
        try {
          const searchResults = await searchStocks(query);
          setResults(searchResults.slice(0, 8)); // Limit to 8 results
          updateDropdownPosition();
          setIsOpen(true);
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(searchTimeout);
  }, [query]);

  // Update dropdown position on scroll/resize
  useEffect(() => {
    if (isOpen) {
      const handleScroll = () => updateDropdownPosition();
      const handleResize = () => updateDropdownPosition();
      
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isOpen]);

  const handleResultClick = (stock: StockData) => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    // Navigate to stock detail page
    router.push(`/stocks/${stock.symbol}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setQuery('');
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatChange = (changePercent: number) => {
    const sign = changePercent >= 0 ? '+' : '';
    return `${sign}${changePercent.toFixed(2)}%`;
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none z-10" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search stocks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`pl-8 pr-8 py-2 w-60 rounded-lg glass border-none text-white placeholder-gray-400 focus:ring-1 focus:ring-${accentColor}-500/50 focus:outline-none transition-all text-xs`}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown - Rendered as Portal */}
      {mounted && isOpen && (query.length > 0 || results.length > 0) && 
        createPortal(
          <div 
            className="fixed bg-black/90 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl max-h-80 overflow-y-auto"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              zIndex: 99999
            }}
          >
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="text-white/50 text-xs">Searching...</div>
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="p-2 border-b border-white/10">
                  <div className="text-xs text-white/50">Search Results ({results.length})</div>
                </div>
                {results.map((stock, index) => (
                  <button
                    key={`${stock.symbol}-${index}`}
                    onClick={() => handleResultClick(stock)}
                    className="w-full p-3 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white text-sm">{stock.symbol}</span>
                          <span className="text-xs text-white/50 truncate">{stock.name}</span>
                        </div>
                        <div className="text-xs text-white/30 mt-0.5">
                          Vol: {(stock.volume / 1e6).toFixed(1)}M
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-white text-sm">{formatPrice(stock.price)}</div>
                        <div className="flex items-center gap-1 justify-end">
                          {stock.changePercent >= 0 ? (
                            <TrendingUp className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-500" />
                          )}
                          <span
                            className={`text-xs ${
                              stock.changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'
                            }`}
                          >
                            {formatChange(stock.changePercent)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </>
            ) : query.trim().length >= 1 ? (
              <div className="p-4 text-center">
                <div className="text-white/50 text-xs">No results found for "{query}"</div>
                <div className="text-white/30 text-xs mt-1">Try searching for a stock symbol or company name</div>
              </div>
            ) : null}
          </div>,
          document.body
        )
      }
    </div>
  );
} 