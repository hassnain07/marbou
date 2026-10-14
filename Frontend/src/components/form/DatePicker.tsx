import { memo, forwardRef, FC } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { Calendar } from 'lucide-react';

interface DatePickerProps {
  value?: string; // ISO string format (YYYY-MM-DD)
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  min?: string; // ISO string
  max?: string; // ISO string
  id?: string;
  name?: string;
  className?: string;
}

const formatDisplayDate = (isoDate: string, lang: 'ar' | 'en'): string => {
  if (!isoDate) return '';
  const date = new Date(`${isoDate}T00:00:00`);
  return lang === 'ar'
    ? date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
};

export const DatePicker: FC<DatePickerProps> = memo(
  forwardRef<HTMLInputElement, DatePickerProps>(
    (
      {
        value = '',
        onChange,
        label,
        error,
        helperText,
        disabled = false,
        required = false,
        min,
        max,
        id,
        name,
        className,
      },
      ref
    ) => {
      const { dir, lang } = useI18n();

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange?.(newValue);
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

          <div className="relative">
            <div className="absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <Calendar className="w-5 h-5 text-sand-400" />
            </div>

            <input
              ref={ref}
              id={id}
              name={name}
              type="date"
              value={value}
              onChange={handleChange}
              disabled={disabled}
              required={required}
              min={min}
              max={max}
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
                w-full rounded-xl border bg-white px-4 py-2.5 ps-10 text-primary-900
                placeholder:text-sand-400 transition-all outline-none
                font-sans text-base leading-6
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
                ${className || ''}
              `}
            />
          </div>

          {value && (
            <div className="text-xs text-sand-500 ps-3">
              {formatDisplayDate(value, lang)}
            </div>
          )}

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

          <div className="text-xs text-sand-400 ps-3">
            {/* Future: Add Hijri calendar support here if needed */}
            Gregorian calendar. Hijri support coming soon.
          </div>
        </div>
      );
    }
  )
);

DatePicker.displayName = 'DatePicker';
