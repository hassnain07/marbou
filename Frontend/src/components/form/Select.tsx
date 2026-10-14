import { memo, forwardRef, FC, useState, useRef, useEffect } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id?: string;
  name?: string;
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
  className?: string;
}

export const Select: FC<SelectProps> = memo(
  forwardRef<HTMLSelectElement, SelectProps>(
    (
      {
        id,
        name,
        label,
        value = '',
        onChange,
        options,
        placeholder,
        error,
        disabled = false,
        required = false,
        searchable = false,
        className,
      },
      ref
    ) => {
      const { dir } = useI18n();
      const [isOpen, setIsOpen] = useState(false);
      const [searchTerm, setSearchTerm] = useState('');
      const containerRef = useRef<HTMLDivElement>(null);
      const searchInputRef = useRef<HTMLInputElement>(null);

      const selectedOption = options.find((opt) => opt.value === value);
      const filteredOptions = searchable
        ? options.filter((opt) =>
            opt.label.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : options;

      useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (
            containerRef.current &&
            !containerRef.current.contains(event.target as Node)
          ) {
            setIsOpen(false);
            setSearchTerm('');
          }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }, []);

      useEffect(() => {
        if (isOpen && searchable && searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, [isOpen, searchable]);

      const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!isOpen) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(true);
          }
          return;
        }

        switch (e.key) {
          case 'Escape':
            setIsOpen(false);
            setSearchTerm('');
            break;
          case 'ArrowDown':
          case 'ArrowUp':
            // Navigation will be handled by natural tab/focus
            break;
          case 'Enter':
            if (filteredOptions.length > 0) {
              handleSelectOption(filteredOptions[0].value);
            }
            break;
        }
      };

      const handleSelectOption = (optionValue: string) => {
        onChange?.(optionValue);
        setIsOpen(false);
        setSearchTerm('');
      };

      // For non-searchable, use native select
      if (!searchable) {
        return (
          <div className="w-full space-y-2">
            {label && (
              <label
                htmlFor={id}
                className="block text-sm font-semibold text-primary-900"
              >
                {label}
                {required && <span className="text-error-500 ms-1">*</span>}
              </label>
            )}
            <select
              ref={ref}
              id={id}
              name={name}
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={disabled}
              required={required}
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-error` : undefined}
              aria-required={required}
              className={`
                w-full rounded-xl border bg-white px-4 py-2.5 text-primary-900
                placeholder:text-sand-400 transition-all outline-none appearance-none
                font-sans text-base leading-6 cursor-pointer
                ${
                  disabled
                    ? 'opacity-50 cursor-not-allowed bg-sand-50'
                    : 'hover:border-sand-300'
                }
                ${
                  error
                    ? 'border-error-500 focus:ring-2 focus:ring-error-100 focus:border-error-500'
                    : 'border-sand-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-400'
                }
                ${className || ''}
              `}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23214E3D' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: dir === 'rtl' ? 'left 12px center' : 'right 12px center',
                paddingRight: dir === 'rtl' ? '1rem' : '2.5rem',
                paddingLeft: dir === 'rtl' ? '2.5rem' : '1rem',
              }}
            >
              {placeholder && (
                <option value="" disabled>
                  {placeholder}
                </option>
              )}
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {error && (
              <div id={`${id}-error`} className="text-xs font-medium text-error-600">
                {error}
              </div>
            )}
          </div>
        );
      }

      // Searchable dropdown
      return (
        <div className="w-full space-y-2">
          {label && (
            <label className="block text-sm font-semibold text-primary-900">
              {label}
              {required && <span className="text-error-500 ms-1">*</span>}
            </label>
          )}

          <div
            ref={containerRef}
            className="relative"
            onKeyDown={handleKeyDown}
            role="listbox"
            aria-expanded={isOpen}
            aria-required={required}
          >
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              disabled={disabled}
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-error` : undefined}
              className={`
                w-full rounded-xl border bg-white px-4 py-2.5 text-primary-900
                placeholder:text-sand-400 transition-all outline-none
                font-sans text-base leading-6 text-start flex items-center justify-between
                ${
                  disabled
                    ? 'opacity-50 cursor-not-allowed bg-sand-50'
                    : 'hover:border-sand-300 cursor-pointer'
                }
                ${
                  error
                    ? 'border-error-500 focus:ring-2 focus:ring-error-100 focus:border-error-500'
                    : 'border-sand-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-400'
                }
              `}
            >
              <span>{selectedOption?.label || placeholder || 'Select option'}</span>
              <ChevronDown
                className={`w-5 h-5 text-sand-400 transition-transform ${
                  isOpen ? 'rotate-180' : ''
                } ${dir === 'rtl' ? 'rotate-180' : ''}`}
              />
            </button>

            {isOpen && (
              <div className="absolute top-full start-0 end-0 mt-1 z-50 bg-white border border-sand-200 rounded-xl shadow-lg">
                {searchable && (
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border-b border-sand-100 rounded-t-xl outline-none focus:ring-2 focus:ring-primary-100"
                  />
                )}
                <div className="max-h-48 overflow-y-auto">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelectOption(opt.value)}
                        role="option"
                        aria-selected={opt.value === value}
                        className={`
                          w-full text-start px-4 py-2.5 transition-colors text-base
                          ${
                            opt.value === value
                              ? 'bg-primary-100 text-primary-700 font-semibold'
                              : 'text-primary-900 hover:bg-sand-50'
                          }
                        `}
                      >
                        {opt.label}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-sand-400 text-sm">
                      No options found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div id={`${id}-error`} className="text-xs font-medium text-error-600">
              {error}
            </div>
          )}
        </div>
      );
    }
  )
);

Select.displayName = 'Select';
