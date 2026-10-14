import { memo, forwardRef, TextareaHTMLAttributes, FC, useEffect, useRef } from 'react';
import { useI18n } from '@/i18n/I18nContext';

interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'rows'> {
  label?: string;
  error?: string;
  helperText?: string;
  rows?: number;
  autoResize?: boolean;
  maxLength?: number;
  showCount?: boolean;
  disabled?: boolean;
  required?: boolean;
}

export const TextArea: FC<TextAreaProps> = memo(
  forwardRef<HTMLTextAreaElement, TextAreaProps>(
    (
      {
        id,
        name,
        label,
        error,
        helperText,
        rows = 4,
        autoResize = true,
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
      const internalRef = useRef<HTMLTextAreaElement>(null);
      const textareaRef = ref || internalRef;

      const currentLength = typeof value === 'string' ? value.length : 0;
      const showCharCount = showCount && maxLength;

      useEffect(() => {
        if (autoResize && textareaRef && 'current' in textareaRef && textareaRef.current) {
          const textarea = textareaRef.current;
          textarea.style.height = 'auto';
          textarea.style.height = `${textarea.scrollHeight}px`;
        }
      }, [value, autoResize, textareaRef]);

      const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
        if (autoResize) {
          const textarea = e.currentTarget;
          textarea.style.height = 'auto';
          textarea.style.height = `${textarea.scrollHeight}px`;
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

          <div className="relative">
            <textarea
              ref={textareaRef}
              id={id}
              name={name}
              value={value}
              onChange={onChange}
              onInput={handleInput}
              placeholder={placeholder}
              maxLength={maxLength}
              disabled={disabled}
              required={required}
              rows={rows}
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
                placeholder:text-sand-400 transition-all outline-none resize-none
                font-sans text-base leading-6 min-h-[100px]
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

TextArea.displayName = 'TextArea';
