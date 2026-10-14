import { memo, forwardRef, FC, useState, useRef } from 'react';
import { useI18n } from '@/i18n/I18nContext';

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  helperText?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  className?: string;
}

// Sudan phone validation: +249 followed by 9 or 1, then 8 more digits
// Format: +249 XX XXX XXXX
const SUDAN_PHONE_REGEX = /^(09|01)[0-9]{8}$/;

const formatPhoneNumber = (input: string): string => {
  // Remove all non-digits
  const digits = input.replace(/\D/g, '');

  // If starts with 249, remove it (we'll add it as prefix)
  let cleaned = digits.startsWith('249') ? digits.slice(3) : digits;

  // Keep only first 10 digits (9 or 1 + 8 more)
  cleaned = cleaned.slice(0, 10);

  // Format as XX XXX XXXX
  if (cleaned.length === 0) return '';
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 5) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
  return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
};

const phoneInputToValue = (formatted: string): string => {
  // Convert formatted input to plain phone (without +249 prefix)
  return formatted.replace(/\D/g, '');
};

export const PhoneInput: FC<PhoneInputProps> = memo(
  forwardRef<HTMLInputElement, PhoneInputProps>(
    (
      {
        value = '',
        onChange,
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
      const { dir } = useI18n();
      const [displayValue, setDisplayValue] = useState(() => formatPhoneNumber(value));
      const [isFocused, setIsFocused] = useState(false);
      const internalRef = useRef<HTMLInputElement>(null);
      const inputRef = ref || internalRef;

      const isValid = !value || SUDAN_PHONE_REGEX.test(value);

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        const formatted = formatPhoneNumber(input);
        setDisplayValue(formatted);

        const plainValue = phoneInputToValue(input);
        onChange?.(plainValue);
      };

      const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);

        // Format on blur if there's a value
        if (displayValue) {
          const plainValue = phoneInputToValue(displayValue);
          if (plainValue) {
            setDisplayValue(formatPhoneNumber(plainValue));
            onChange?.(plainValue);
          }
        }
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

          <div className="flex gap-2">
            {/* Country code prefix */}
            <div
              className={`
                flex items-center px-3 rounded-xl border bg-sand-50
                font-sans text-base font-medium text-primary-900
                ${
                  disabled
                    ? 'opacity-50 bg-sand-50'
                    : 'border-sand-200'
                }
                ${
                  error
                    ? 'border-error-500'
                    : 'border-sand-200'
                }
              `}
              style={{
                flex: '0 0 auto',
              }}
            >
              +249
            </div>

            {/* Phone input */}
            <input
              ref={inputRef}
              id={id}
              name={name}
              type="tel"
              inputMode="tel"
              value={displayValue}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={handleBlur}
              placeholder="90 123 4567"
              disabled={disabled}
              required={required}
              aria-invalid={!!error || !isValid}
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
                font-sans text-base leading-6 font-mono
                ${
                  disabled
                    ? 'opacity-50 cursor-not-allowed bg-sand-50'
                    : 'hover:border-sand-300'
                }
                ${
                  error || !isValid
                    ? 'border-error-500 focus:ring-2 focus:ring-error-100 focus:border-error-500'
                    : 'border-sand-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-400'
                }
                ${className || ''}
              `}
            />
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

          {!error && value && !isValid && (
            <div className="text-xs font-medium text-warning-600">
              Please enter a valid Sudan phone number (09 or 01 followed by 8 digits)
            </div>
          )}
        </div>
      );
    }
  )
);

PhoneInput.displayName = 'PhoneInput';
