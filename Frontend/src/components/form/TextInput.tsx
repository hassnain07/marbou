import { memo, forwardRef, InputHTMLAttributes, FC } from 'react';
import { useI18n } from '@/i18n/I18nContext';

interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  type?: 'text' | 'email' | 'tel' | 'url' | 'password';
  maxLength?: number;
  showCount?: boolean;
  disabled?: boolean;
  required?: boolean;
}

export const TextInput: FC<TextInputProps> = memo(
  forwardRef<HTMLInputElement, TextInputProps>(
    (
      {
        id,
        name,
        label,
        error,
        helperText,
        type = 'text',
        maxLength,
        showCount = false,
        disabled = false,
        required = false,
        value = '',
        onChange,
        placeholder,
        className,
        ...rest
      },
      ref
    ) => {
      const { dir } = useI18n();
      const currentLength = typeof value === 'string' ? value.length : 0;
      const showCharCount = showCount && maxLength;

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
            <input
              ref={ref}
              id={id}
              name={name}
              type={type}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              maxLength={maxLength}
              disabled={disabled}
              required={required}
              aria-invalid={!!error}
              aria-describedby={
                error
                  ? `${id}-error`
                  : showCharCount
                    ? `${id}-count`
                    : helperText
                      ? `${id}-helper`
                      : undefined
              }
              aria-required={required}
              className={`
                w-full rounded-xl border bg-white px-4 py-2.5 text-primary-900
                placeholder:text-sand-400 transition-all outline-none
                font-sans text-base leading-6
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
              {...rest}
            />
          </div>

          {showCharCount && (
            <div
              id={`${id}-count`}
              className="text-xs text-sand-400 text-end"
              aria-live="polite"
            >
              {currentLength} / {maxLength}
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
        </div>
      );
    }
  )
);

TextInput.displayName = 'TextInput';
