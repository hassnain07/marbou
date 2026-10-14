import { memo, forwardRef, FC, useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { ChevronDown } from 'lucide-react';

interface PriceInputProps {
  value?: number;
  onChange?: (value: number) => void;
  currency?: string;
  onCurrencyChange?: (currency: string) => void;
  min?: number;
  max?: number;
  error?: string;
  helperText?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  className?: string;
}

const CURRENCIES = [
  { code: 'SDG', symbol: 'ج.س', name: 'Sudanese Pound' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal' },
];

const formatPrice = (value: number, lang: 'ar' | 'en'): string => {
  return lang === 'ar'
    ? value.toLocaleString('ar-EG')
    : value.toLocaleString('en-US');
};

export const PriceInput: FC<PriceInputProps> = memo(
  forwardRef<HTMLInputElement, PriceInputProps>(
    (
      {
        value = 0,
        onChange,
        currency = 'SDG',
        onCurrencyChange,
        min = 0,
        max,
        error,
        helperText,
        label,
        disabled = false,
        required = false,
        id,
        name,
        className,
      },
      ref
    ) => {
      const { dir, lang } = useI18n();
      const [displayValue, setDisplayValue] = useState(() => formatPrice(value, lang));
      const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
      const selectedCurrency = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        // Remove all non-digit characters
        const numericValue = parseInt(input.replace(/\D/g, '') || '0', 10);

        // Validate against min/max
        if (numericValue < min || (max !== undefined && numericValue > max)) {
          return;
        }

        setDisplayValue(formatPrice(numericValue, lang));
        onChange?.(numericValue);
      };

      const handleCurrencyChange = (newCurrency: string) => {
        onCurrencyChange?.(newCurrency);
        setIsCurrencyOpen(false);
      };

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

          <div className="flex gap-2 items-center">
            {/* Price Input */}
            <input
              ref={ref}
              id={id}
              name={name}
              type="text"
              inputMode="decimal"
              value={displayValue}
              onChange={handleChange}
              placeholder="0"
              disabled={disabled}
              required={required}
              aria-invalid={!!error}
              aria-describedby={
                error
                  ? `${id}-error`
                  : helperText
                    ? `${id}-helper`
                    : undefined
              }
              aria-required={required}
              className={`
                flex-1 rounded-xl border bg-white px-4 py-2.5 text-primary-900
                placeholder:text-sand-400 transition-all outline-none
                font-sans text-base leading-6 font-mono text-end
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
            />

            {/* Currency Selector */}
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                disabled={disabled}
                className={`
                  flex items-center gap-1.5 px-3 py-2.5 rounded-xl border
                  transition-all outline-none font-sans font-medium text-base
                  ${
                    disabled
                      ? 'opacity-50 cursor-not-allowed bg-sand-50'
                      : 'hover:border-sand-300 bg-white cursor-pointer'
                  }
                  ${
                    error
                      ? 'border-error-500 focus:ring-2 focus:ring-error-100'
                      : 'border-sand-200 focus:ring-2 focus:ring-primary-100'
                  }
                `}
              >
                <span className="text-primary-900 font-semibold min-w-12">
                  {selectedCurrency.code}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-sand-400 transition-transform ${
                    isCurrencyOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isCurrencyOpen && (
                <div className="absolute end-0 top-full mt-1 z-50 bg-white border border-sand-200 rounded-xl shadow-lg min-w-56">
                  {CURRENCIES.map((curr) => (
                    <button
                      key={curr.code}
                      type="button"
                      onClick={() => handleCurrencyChange(curr.code)}
                      className={`
                        w-full text-start px-4 py-2.5 transition-colors text-base
                        flex items-center justify-between
                        ${
                          curr.code === currency
                            ? 'bg-primary-100 text-primary-700 font-semibold'
                            : 'text-primary-900 hover:bg-sand-50'
                        }
                      `}
                    >
                      <div>
                        <div className="font-semibold">{curr.code}</div>
                        <div className="text-xs text-sand-500">{curr.name}</div>
                      </div>
                      <span className="text-lg">{curr.symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div id={`${id}-error`} className="text-xs font-medium text-error-600">
              {error}
            </div>
          )}

          {helperText && !error && (
            <div id={`${id}-helper`} className="text-xs text-sand-500">
              {helperText}
            </div>
          )}

          {(min !== undefined || max !== undefined) && (
            <div className="text-xs text-sand-500">
              {min !== undefined && max !== undefined
                ? `Range: ${formatPrice(min, lang)} - ${formatPrice(max, lang)}`
                : min !== undefined
                  ? `Minimum: ${formatPrice(min, lang)}`
                  : `Maximum: ${formatPrice(max as number, lang)}`}
            </div>
          )}
        </div>
      );
    }
  )
);

PriceInput.displayName = 'PriceInput';
