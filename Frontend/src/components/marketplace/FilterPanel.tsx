import { memo, useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { getSpecOptionsForCategory } from '@/services/filters';
import { ChevronDown, X } from 'lucide-react';

export interface FilterState {
  category?: string;
  subcategory?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  specs?: Record<string, string>;
}

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  resultCount?: number;
  isMobile?: boolean;
  onClose?: () => void;
}

interface FilterGroup {
  id: string;
  label: string;
  type: 'select' | 'range' | 'checkbox-group';
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
}

function FilterPanelComponent({
  filters,
  onChange,
  onReset,
  resultCount = 0,
  isMobile = false,
  onClose,
}: FilterPanelProps) {
  const { t, lang } = useI18n();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['category', 'price', 'condition']),
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Get dynamic spec options for the selected category
  const specOptions = useMemo(() => {
    if (!filters.category) return {};
    return getSpecOptionsForCategory(filters.category);
  }, [filters.category]);

  const dynamicSpecGroups: FilterGroup[] = useMemo(() => {
    return Object.entries(specOptions).map(([specKey, values]) => ({
      id: `spec-${specKey}`,
      label: specKey.charAt(0).toUpperCase() + specKey.slice(1), // Capitalize key
      type: 'select' as const,
      options: values.map((v) => ({ value: v, label: v })),
    }));
  }, [specOptions]);

  const staticFilterGroups: FilterGroup[] = [
    {
      id: 'category',
      label: t('category'),
      type: 'select',
      options: [
        { value: 'vehicles', label: t('vehicles') },
        { value: 'real-estate', label: t('realEstate') },
        { value: 'electronics', label: t('electronics') },
        { value: 'spare-parts', label: t('spareParts') },
      ],
    },
    {
      id: 'price',
      label: t('price'),
      type: 'range',
      min: 0,
      max: 100000000,
    },
    {
      id: 'condition',
      label: t('condition'),
      type: 'checkbox-group',
      options: [
        { value: 'new', label: t('new') },
        { value: 'refurbished', label: t('refurbished') },
        { value: 'used', label: t('used') },
      ],
    },
  ];

  const filterGroups = [...staticFilterGroups, ...dynamicSpecGroups];

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  const handleChange = useCallback(
    (key: keyof FilterState | string, value: any) => {
      // Handle spec filters
      if (key.startsWith('spec-')) {
        const specKey = key.replace('spec-', '');
        const newSpecs = { ...filters.specs };
        if (value) {
          newSpecs[specKey] = value;
        } else {
          delete newSpecs[specKey];
        }
        onChange({ ...filters, specs: Object.keys(newSpecs).length > 0 ? newSpecs : undefined });
      } else {
        onChange({ ...filters, [key]: value });
      }
    },
    [filters, onChange],
  );

  const isRtl = lang === 'ar';

  const panelContent = (
    <div className="space-y-4 divide-y divide-sand-100">
      {filterGroups.map((group) => (
        <div key={group.id} className="pt-4 first:pt-0">
          <button
            onClick={() => toggleGroup(group.id)}
            className={`
              w-full flex items-center justify-between p-2 mb-2
              rounded-lg hover:bg-sand-50 transition-colors
              focus:outline-none focus:ring-2 focus:ring-primary-500
              text-primary-700 font-medium text-sm
            `}
            aria-expanded={expandedGroups.has(group.id)}
            aria-controls={`filter-group-${group.id}`}
            type="button"
          >
            <span>{group.label}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                expandedGroups.has(group.id) ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </button>

          {expandedGroups.has(group.id) && (
            <div id={`filter-group-${group.id}`} className="space-y-2 ps-2">
              {group.type === 'select' && (
                <select
                  value={
                    group.id.startsWith('spec-')
                      ? filters.specs?.[group.id.replace('spec-', '')] || ''
                      : String(filters[group.id as keyof FilterState] || '')
                  }
                  onChange={(e) =>
                    handleChange(
                      group.id,
                      e.target.value || undefined,
                    )
                  }
                  className="w-full input text-sm"
                  aria-label={group.label}
                >
                  <option value="">{t('selectAll')}</option>
                  {group.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {group.type === 'range' && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder={t('minPrice')}
                      value={filters.minPrice || ''}
                      onChange={(e) =>
                        handleChange(
                          'minPrice',
                          e.target.value ? parseInt(e.target.value) : undefined,
                        )
                      }
                      className="input text-xs flex-1"
                      aria-label={t('minPrice')}
                    />
                    <input
                      type="number"
                      placeholder={t('maxPrice')}
                      value={filters.maxPrice || ''}
                      onChange={(e) =>
                        handleChange(
                          'maxPrice',
                          e.target.value ? parseInt(e.target.value) : undefined,
                        )
                      }
                      className="input text-xs flex-1"
                      aria-label={t('maxPrice')}
                    />
                  </div>
                </div>
              )}

              {group.type === 'checkbox-group' && (
                <div className="space-y-2">
                  {group.options?.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-sand-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={filters.condition === opt.value}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleChange('condition', opt.value);
                          } else {
                            handleChange('condition', undefined);
                          }
                        }}
                        className="rounded accent-primary-600"
                      />
                      <span className="text-sm text-primary-700">
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const actions = (
    <div className="flex gap-2 pt-4 border-t border-sand-100">
      <button
        onClick={onReset}
        className="flex-1 px-4 py-2 text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
        type="button"
      >
        {t('reset')}
      </button>
      <button
        onClick={onClose}
        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
        type="button"
      >
        {t('apply')} {resultCount > 0 && `(${resultCount})`}
      </button>
    </div>
  );

  if (isMobile) {
    return (
      <div
        ref={containerRef}
        className="fixed inset-0 z-[90] flex flex-col animate-slide-up md:hidden"
      >
        <div className="absolute inset-0 bg-primary-950/40 backdrop-blur-sm" />
        <div className="relative mt-auto bg-white rounded-t-2xl shadow-2xl max-h-[90vh] overflow-auto">
          <div className="sticky top-0 flex items-center justify-between p-4 border-b border-sand-100 bg-white">
            <h3 className="text-lg font-bold text-primary-800">{t('filters')}</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-sand-100 text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label={t('close')}
              type="button"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
          <div className="p-4">{panelContent}</div>
          <div className="sticky bottom-0 p-4 bg-white border-t border-sand-100">
            {actions}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="hidden md:block bg-white rounded-2xl border border-sand-100 p-4 sticky top-4 h-fit"
    >
      <h3 className="text-lg font-bold text-primary-800 mb-4">{t('filters')}</h3>
      {panelContent}
      {actions}
    </div>
  );
}

export const FilterPanel = memo(FilterPanelComponent);
