import { useState, type ReactNode } from 'react';
import {
  Briefcase, Building2, Car, ChevronDown, Hotel, LayoutGrid,
  Smartphone, Sofa, Wrench, type LucideIcon,
} from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { Link, useRouter } from '@/router/Router';
import { categories, type CategoryDef } from '@/data/mockData';
import type { TranslationKey } from '@/i18n/translations';

const NAV_ITEMS: { key: TranslationKey; to: string; icon: LucideIcon; categoryId?: string }[] = [
  { key: 'hpNavVehicles', to: '/category/vehicles', icon: Car, categoryId: 'vehicles' },
  { key: 'hpNavHotels', to: '/category/hotels', icon: Hotel, categoryId: 'hotels' },
  { key: 'hpNavRealEstate', to: '/category/real-estate', icon: Building2, categoryId: 'real-estate' },
  { key: 'hpNavPhones', to: '/category/electronics', icon: Smartphone, categoryId: 'electronics' },
  { key: 'hpNavJobs', to: '/jobs', icon: Briefcase },
  { key: 'hpNavServices', to: '/category/services', icon: Wrench, categoryId: 'services' },
  { key: 'hpNavHome', to: '/category/home-furniture', icon: Sofa, categoryId: 'home-furniture' },
];

const NAV_CATEGORY_IDS = NAV_ITEMS.map((i) => i.categoryId).filter(Boolean) as string[];

function CategoryDropdown({
  trigger, triggerClassName, cats, align = 'start',
}: {
  trigger: ReactNode;
  triggerClassName: string;
  cats: CategoryDef[];
  align?: 'start' | 'end';
}) {
  const { t } = useI18n();
  const { navigate } = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className={triggerClassName}>
        {trigger}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={`absolute top-full z-50 mt-2 max-h-80 w-64 overflow-y-auto rounded-xl border border-sand-100 bg-white p-2 shadow-xl animate-slide-down ${
              align === 'end' ? 'end-0' : 'start-0'
            }`}
          >
            {cats.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => { navigate(`/category/${c.id}`); setOpen(false); }}
                className="w-full rounded-lg px-3 py-2 text-start text-sm text-primary-800 hover:bg-primary-50"
              >
                {t(c.key)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function CategoryNavBar() {
  const { t } = useI18n();
  const { path } = useRouter();
  const moreCats = categories.filter((c) => !NAV_CATEGORY_IDS.includes(c.id));
  const itemBase = 'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-2 text-[13px] font-medium transition-colors';

  return (
    <nav className="hidden border-t border-sand-100 xl:block" aria-label={t('categories')}>
      <div className="mx-auto flex h-11 max-w-7xl items-center justify-between px-6">
        <CategoryDropdown
          cats={categories}
          triggerClassName="flex items-center gap-2 rounded-lg border border-accent-200 bg-accent-50 px-3 py-1.5 text-[13px] font-bold text-primary-950 hover:bg-accent-100"
          trigger={
            <>
              <LayoutGrid className="h-4 w-4 text-accent-500" aria-hidden="true" />
              {t('hpAllCategories')}
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            </>
          }
        />
        {NAV_ITEMS.map(({ key, to, icon: Icon }) => {
          const active = path === to || path.startsWith(`${to}/`) || path.startsWith(`${to}?`);
          return (
            <Link
              key={key}
              to={to}
              className={`${itemBase} ${active ? 'bg-primary-50 text-primary-950' : 'text-primary-800 hover:bg-sand-100'}`}
            >
              <Icon className="hidden h-4 w-4 text-primary-950 2xl:block" aria-hidden="true" />
              {t(key)}
            </Link>
          );
        })}
        <CategoryDropdown
          cats={moreCats}
          align="end"
          triggerClassName={`${itemBase} text-primary-800 hover:bg-sand-100`}
          trigger={<><span aria-hidden="true">•••</span>{t('hpMore')}</>}
        />
      </div>
    </nav>
  );
}
