import { ChevronDown, MapPin } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { sudanCities } from '@/data/mockData';

interface CitySelectProps {
  value: string; // sudanCities id, '' = all Sudan
  onChange: (value: string) => void;
  className?: string;
}

export function CitySelect({ value, onChange, className = '' }: CitySelectProps) {
  const { lang, t } = useI18n();
  return (
    <label className={`relative flex items-center ${className}`}>
      <MapPin className="pointer-events-none absolute start-3 h-4 w-4 text-primary-950" aria-hidden="true" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={t('location')}
        className="w-full cursor-pointer appearance-none bg-transparent py-2.5 ps-9 pe-8 text-sm font-medium text-primary-950 outline-none"
      >
        <option value="">{t('hpAllSudan')}</option>
        {sudanCities.map((c) => (
          <option key={c.id} value={c.id}>
            {lang === 'ar' ? c.nameAr : c.name}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute end-3 h-4 w-4 text-primary-400" aria-hidden="true" />
    </label>
  );
}
