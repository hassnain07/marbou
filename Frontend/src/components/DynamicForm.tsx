import { useI18n } from '@/i18n/I18nContext';
import { AlertCircle } from 'lucide-react';
import type { ReactNode } from 'react';

export interface FormField {
  key: string;
  label: string;
  labelAr: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'date' | 'textarea';
  required: boolean;
  options?: string[];
  placeholder?: string;
  placeholderAr?: string;
}

interface DynamicFormProps {
  fields: FormField[];
  specs: Record<string, string>;
  onChange: (specs: Record<string, string>) => void;
  showErrors?: boolean;
}

export function DynamicForm({
  fields,
  specs,
  onChange,
  showErrors = false,
}: DynamicFormProps) {
  const { t, lang } = useI18n();

  const handleChange = (key: string, value: string) => {
    onChange({ ...specs, [key]: value });
  };

  const getMissingRequiredFields = () => {
    return fields.filter((f) => f.required && !specs[f.key]);
  };

  const missingFields = getMissingRequiredFields();

  return (
    <div className="space-y-4">
      {showErrors && missingFields.length > 0 && (
        <div className="p-3 bg-error-50 border border-error-200 rounded-lg flex gap-2">
          <AlertCircle className="w-4 h-4 text-error-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-error-700 mb-1">
              {t('requiredFieldsMissing')}:
            </p>
            <ul className="text-xs text-error-600 space-y-0.5">
              {missingFields.map((f) => (
                <li key={f.key}>
                  • {lang === 'ar' ? f.labelAr : f.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {fields.map((field) => (
        <div key={field.key}>
          <label className="text-sm font-medium text-primary-600 mb-1.5 block">
            {lang === 'ar' ? field.labelAr : field.label}
            {field.required && <span className="text-error-500 ms-1">*</span>}
          </label>

          {field.type === 'select' ? (
            <select
              value={specs[field.key] || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="input"
              dir={lang === 'ar' && field.key !== 'year' ? 'rtl' : 'ltr'}
            >
              <option value="">
                {lang === 'ar' ? 'اختر...' : 'Select...'}
              </option>
              {field.options?.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : field.type === 'checkbox' ? (
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={specs[field.key] === 'true'}
                onChange={(e) => handleChange(field.key, e.target.checked ? 'true' : 'false')}
                className="w-4 h-4 rounded border-sand-200 text-primary-600 focus:ring-primary-300"
              />
              <span className="text-sm text-primary-600">
                {lang === 'ar' ? field.labelAr : field.label}
              </span>
            </label>
          ) : field.type === 'textarea' ? (
            <textarea
              value={specs[field.key] || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="input min-h-24"
              placeholder={
                lang === 'ar'
                  ? field.placeholderAr || 'أدخل...'
                  : field.placeholder || 'Enter...'
              }
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
            />
          ) : (
            <input
              type={field.type === 'number' ? 'number' : field.type}
              value={specs[field.key] || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="input"
              placeholder={
                lang === 'ar'
                  ? field.placeholderAr || 'أدخل...'
                  : field.placeholder || 'Enter...'
              }
              dir={field.type === 'number' ? 'ltr' : lang === 'ar' ? 'rtl' : 'ltr'}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Export utility function to get fields for a category
export function getCategoryFields(categoryId: string): FormField[] {
  if (categoryId === 'vehicles') {
    return [
      {
        key: 'make',
        label: 'Make',
        labelAr: 'الماركة',
        type: 'text',
        required: true,
        placeholder: 'Toyota, Nissan...',
        placeholderAr: 'تويوتا، نيسان...',
      },
      {
        key: 'model',
        label: 'Model',
        labelAr: 'الموديل',
        type: 'text',
        required: true,
      },
      {
        key: 'year',
        label: 'Year',
        labelAr: 'سنة الصنع',
        type: 'number',
        required: true,
      },
      {
        key: 'mileage',
        label: 'Mileage (km)',
        labelAr: 'المسافة (كم)',
        type: 'number',
        required: false,
      },
      {
        key: 'fuel',
        label: 'Fuel Type',
        labelAr: 'نوع الوقود',
        type: 'select',
        required: true,
        options: ['Petrol', 'Diesel', 'Hybrid', 'Electric'],
      },
      {
        key: 'transmission',
        label: 'Transmission',
        labelAr: 'ناقل الحركة',
        type: 'select',
        required: true,
        options: ['Automatic', 'Manual'],
      },
      {
        key: 'color',
        label: 'Color',
        labelAr: 'اللون',
        type: 'text',
        required: false,
      },
    ];
  }

  if (categoryId === 'real-estate') {
    return [
      {
        key: 'area',
        label: 'Area (sqm)',
        labelAr: 'المساحة (م²)',
        type: 'number',
        required: true,
      },
      {
        key: 'rooms',
        label: 'Rooms',
        labelAr: 'غرف النوم',
        type: 'number',
        required: true,
      },
      {
        key: 'bathrooms',
        label: 'Bathrooms',
        labelAr: 'الحمامات',
        type: 'number',
        required: false,
      },
      {
        key: 'floor',
        label: 'Floor',
        labelAr: 'الطابق',
        type: 'text',
        required: false,
      },
      {
        key: 'finishing',
        label: 'Finishing',
        labelAr: 'التشطيب',
        type: 'select',
        required: true,
        options: ['Finished', 'Semi-finished', 'Unfinished'],
      },
      {
        key: 'furnishing',
        label: 'Furnishing',
        labelAr: 'التأثيث',
        type: 'select',
        required: false,
        options: ['Furnished', 'Semi-furnished', 'Unfurnished'],
      },
    ];
  }

  if (categoryId === 'electronics') {
    return [
      {
        key: 'brand',
        label: 'Brand',
        labelAr: 'الماركة',
        type: 'text',
        required: true,
      },
      {
        key: 'model',
        label: 'Model',
        labelAr: 'الموديل',
        type: 'text',
        required: true,
      },
      {
        key: 'storage',
        label: 'Storage',
        labelAr: 'التخزين',
        type: 'text',
        required: false,
      },
      {
        key: 'ram',
        label: 'RAM',
        labelAr: 'الذاكرة',
        type: 'text',
        required: false,
      },
      {
        key: 'condition',
        label: 'Condition',
        labelAr: 'الحالة',
        type: 'select',
        required: true,
        options: ['New', 'Used - Excellent', 'Used - Good', 'Used - Fair'],
      },
      {
        key: 'warranty',
        label: 'Warranty',
        labelAr: 'الضمان',
        type: 'text',
        required: false,
      },
    ];
  }

  // Default fields for other categories
  return [
    {
      key: 'condition',
      label: 'Condition',
      labelAr: 'الحالة',
      type: 'select',
      required: true,
      options: ['New', 'Used - Excellent', 'Used - Good', 'Used - Fair'],
    },
  ];
}
