import { useState, type FormEvent } from 'react';
import {
  Briefcase, Car, Hotel, Home, LayoutGrid, Monitor,
  Search, Smartphone, Sofa, Wrench, type LucideIcon,
} from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { Link, useRouter } from '@/router/Router';
import { CitySelect } from '@/components/layout/CitySelect';
import { buildSearchUrl } from '@/utils/buildSearchUrl';
import type { TranslationKey } from '@/i18n/translations';

const TILES: { to: string; key: TranslationKey; icon: LucideIcon; tint: string }[] = [
  { to: '/category/vehicles', key: 'vehicles', icon: Car, tint: 'bg-sky-50 text-sky-600' },
  { to: '/category/hotels', key: 'hotels', icon: Hotel, tint: 'bg-accent-50 text-accent-500' },
  { to: '/category/real-estate', key: 'realEstate', icon: Home, tint: 'bg-primary-50 text-primary-500' },
  { to: '/search?category=electronics&subcategory=phones', key: 'phones', icon: Smartphone, tint: 'bg-sky-50 text-sky-600' },
  { to: '/jobs', key: 'jobs', icon: Briefcase, tint: 'bg-primary-50 text-primary-600' },
  { to: '/category/services', key: 'services', icon: Wrench, tint: 'bg-accent-50 text-accent-500' },
  { to: '/category/home-furniture', key: 'homeFurniture', icon: Sofa, tint: 'bg-accent-50 text-accent-500' },
  { to: '/category/electronics', key: 'electronics', icon: Monitor, tint: 'bg-sky-50 text-sky-600' },
  { to: '/search', key: 'hpAllCategories', icon: LayoutGrid, tint: 'bg-sand-100 text-primary-700' },
];

export function MobileQuickSearch() {
  const { t } = useI18n();
  const { navigate } = useRouter();
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate(buildSearchUrl(q, city));
  };

  return (
    <section className="space-y-3 md:hidden">
      <form onSubmit={submit} role="search" className="space-y-3">
        <div className="flex items-stretch overflow-hidden rounded-xl border border-sand-200 bg-white">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('hpSearchShort')}
            aria-label={t('search')}
            className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-primary-400"
          />
          <button type="submit" aria-label={t('hpSearchBtn')} className="flex w-12 items-center justify-center bg-accent-500 text-white">
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <CitySelect value={city} onChange={setCity} className="rounded-xl border border-sand-200 bg-white" />
      </form>

      <div className="grid grid-cols-3 gap-x-3 gap-y-4 pt-2">
        {TILES.map(({ to, key, icon: Icon, tint }) => (
          <Link key={key} to={to} className="flex flex-col items-center gap-2 text-center">
            <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${tint}`}>
              <Icon className="h-7 w-7" aria-hidden="true" />
            </span>
            <span className="text-xs font-medium leading-tight text-primary-800">{t(key)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
