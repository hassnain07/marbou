import { memo, useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { Search, Filter, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
  showFilters?: boolean;
  onFilterToggle?: () => void;
}

function SearchBarComponent({
  value,
  onChange,
  onSubmit,
  placeholder,
  suggestions = [],
  showFilters = false,
  onFilterToggle,
}: SearchBarProps) {
  const { t, lang } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayPlaceholder = placeholder || t('searchPlaceholder');

  // Debounced suggestions filtering
  const filteredSuggestions = useMemo(() => {
    if (!value.trim() || !isOpen) return [];
    const query = value.toLowerCase();
    return suggestions
      .filter((s) => s.toLowerCase().includes(query))
      .slice(0, 6);
  }, [value, suggestions, isOpen]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.currentTarget.value;
      onChange(newValue);
      setIsOpen(true);
      setActiveIndex(-1);
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          if (activeIndex >= 0 && filteredSuggestions[activeIndex]) {
            onSubmit(filteredSuggestions[activeIndex]);
            setIsOpen(false);
            setActiveIndex(-1);
          } else {
            onSubmit(value);
            setIsOpen(false);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setActiveIndex(-1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) =>
            prev < filteredSuggestions.length - 1 ? prev + 1 : prev,
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        default:
          break;
      }
    },
    [activeIndex, filteredSuggestions, value, onSubmit],
  );

  const handleSuggestionClick = (suggestion: string) => {
    onSubmit(suggestion);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleClear = () => {
    onChange('');
    setActiveIndex(-1);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isRtl = lang === 'ar';

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center gap-2 bg-white rounded-xl border border-sand-200 shadow-sm focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all">
        {/* Search icon - positioned based on RTL/LTR */}
        <div className={`flex items-center justify-center text-primary-400 shrink-0 ${isRtl ? 'order-last pe-3' : 'ps-3'}`}>
          <Search className="w-5 h-5" aria-hidden="true" />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={displayPlaceholder}
          role="combobox"
          aria-expanded={isOpen && filteredSuggestions.length > 0}
          aria-controls="search-suggestions"
          aria-activedescendant={
            activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined
          }
          aria-autocomplete="list"
          className={`
            flex-1 bg-transparent outline-none text-primary-800
            placeholder:text-primary-300
            text-sm px-2 py-2.5
            ${isRtl ? 'text-right' : 'text-left'}
          `}
        />

        {/* Clear button */}
        {value && (
          <button
            onClick={handleClear}
            className={`p-2 text-primary-400 hover:text-primary-600 transition-colors shrink-0 ${isRtl ? 'order-first ps-1' : 'pe-1'}`}
            aria-label={t('clear')}
            type="button"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}

        {/* Filter button */}
        {showFilters && (
          <button
            onClick={onFilterToggle}
            className={`p-2 text-primary-400 hover:bg-sand-50 hover:text-primary-600 transition-colors shrink-0 rounded-lg ${isRtl ? 'order-first ps-2' : 'pe-2'}`}
            aria-label={t('filters')}
            type="button"
          >
            <Filter className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {isOpen && filteredSuggestions.length > 0 && (
        <ul
          id="search-suggestions"
          className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-sand-100 shadow-lg z-50 overflow-hidden"
          role="listbox"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <li key={`${suggestion}-${index}`}>
              <button
                id={`suggestion-${index}`}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`
                  w-full px-3 py-2.5 text-left text-sm
                  ${isRtl ? 'text-right' : 'text-left'}
                  transition-colors
                  ${
                    index === activeIndex
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-primary-700 hover:bg-sand-50'
                  }
                  ${index === filteredSuggestions.length - 1 ? '' : 'border-b border-sand-50'}
                  focus:outline-none focus:bg-primary-50
                `}
                role="option"
                aria-selected={index === activeIndex}
                type="button"
              >
                <div className="flex items-center gap-2">
                  <Search
                    className="w-3.5 h-3.5 text-primary-300 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="truncate">{suggestion}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export const SearchBar = memo(SearchBarComponent);
