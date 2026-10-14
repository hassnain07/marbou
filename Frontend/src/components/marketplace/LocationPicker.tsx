import { memo, useCallback, useMemo } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { sudanCities } from '@/data/mockData';

interface LocationPickerProps {
  cityId?: string;
  areaId?: string;
  onChange: (location: { cityId: string; areaId: string }) => void;
  label?: string;
  error?: string;
  required?: boolean;
  size?: 'sm' | 'md';
}

function LocationPickerComponent({
  cityId,
  areaId,
  onChange,
  label,
  error,
  required = false,
  size = 'md',
}: LocationPickerProps) {
  const { t, lang } = useI18n();

  const displayLabel = label || t('location');
  const isRtl = lang === 'ar';

  // Get current city data
  const currentCity = useMemo(
    () => sudanCities.find((c) => c.id === cityId),
    [cityId],
  );

  // Get current area data
  const currentArea = useMemo(
    () => currentCity?.areas.find((a) => a.id === areaId),
    [currentCity, areaId],
  );

  // Combined label: "City - Area"
  const combinedLabel = useMemo(() => {
    if (!currentCity) return displayLabel;
    if (!currentArea) {
      const cityName =
        lang === 'ar' ? currentCity.nameAr : currentCity.name;
      return cityName;
    }
    const cityName =
      lang === 'ar' ? currentCity.nameAr : currentCity.name;
    const areaName =
      lang === 'ar' ? currentArea.nameAr : currentArea.name;
    return `${cityName} - ${areaName}`;
  }, [currentCity, currentArea, lang, displayLabel]);

  const handleCityChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newCityId = e.target.value;
      if (newCityId) {
        // Clear area when city changes
        onChange({ cityId: newCityId, areaId: '' });
      }
    },
    [onChange],
  );

  const handleAreaChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newAreaId = e.target.value;
      if (cityId) {
        onChange({ cityId, areaId: newAreaId });
      }
    },
    [cityId, onChange],
  );

  const sizeClasses = {
    sm: 'text-xs py-1.5 px-2',
    md: 'text-sm py-2 px-3',
  };

  return (
    <fieldset className="space-y-2">
      {displayLabel && (
        <legend className="text-sm font-medium text-primary-800 flex items-center gap-1">
          {displayLabel}
          {required && <span className="text-error-500" aria-label="required">*</span>}
        </legend>
      )}

      <div className={`flex gap-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* City Select */}
        <div className="flex-1 relative group">
          <select
            value={cityId || ''}
            onChange={handleCityChange}
            aria-label={t('city')}
            required={required}
            className={`
              w-full input bg-white
              ${sizeClasses[size]}
              border border-sand-200 rounded-lg
              focus:ring-2 focus:ring-primary-500 focus:border-primary-500
              transition-all appearance-none cursor-pointer
              ${error ? 'border-error-500 focus:ring-error-500' : ''}
              ${isRtl ? 'text-right' : 'text-left'}
            `}
          >
            <option value="">{t('selectCity')}</option>
            {sudanCities.map((city) => (
              <option key={city.id} value={city.id}>
                {lang === 'ar' ? city.nameAr : city.name}
              </option>
            ))}
          </select>
          {/* Dropdown arrow */}
          <div
            className={`
              pointer-events-none absolute top-1/2 -translate-y-1/2
              text-primary-400 group-hover:text-primary-600
              ${isRtl ? 'left-3' : 'right-3'}
            `}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>

        {/* Area Select */}
        <div className="flex-1 relative group">
          <select
            value={areaId || ''}
            onChange={handleAreaChange}
            disabled={!cityId}
            aria-label={t('area')}
            className={`
              w-full input bg-white
              ${sizeClasses[size]}
              border border-sand-200 rounded-lg
              focus:ring-2 focus:ring-primary-500 focus:border-primary-500
              transition-all appearance-none cursor-pointer
              disabled:bg-sand-50 disabled:text-primary-300 disabled:cursor-not-allowed
              ${error ? 'border-error-500 focus:ring-error-500' : ''}
              ${isRtl ? 'text-right' : 'text-left'}
            `}
          >
            <option value="">{t('selectArea')}</option>
            {currentCity?.areas.map((area) => (
              <option key={area.id} value={area.id}>
                {lang === 'ar' ? area.nameAr : area.name}
              </option>
            ))}
          </select>
          {/* Dropdown arrow */}
          <div
            className={`
              pointer-events-none absolute top-1/2 -translate-y-1/2
              text-primary-400 group-hover:text-primary-600
              ${cityId ? 'group-hover:text-primary-600' : 'text-primary-200'}
              ${isRtl ? 'left-3' : 'right-3'}
            `}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Combined label display (optional, for better UX) */}
      {currentCity && (
        <div className="text-xs text-primary-500 font-medium ps-1">
          {combinedLabel}
        </div>
      )}

      {error && (
        <span className="text-xs text-error-500 ps-1" role="alert">
          {error}
        </span>
      )}
    </fieldset>
  );
}

export const LocationPicker = memo(LocationPickerComponent);
