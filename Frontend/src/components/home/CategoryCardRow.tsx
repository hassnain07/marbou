import { useMemo } from 'react';
import { ArrowLeft, ArrowRight, LayoutGrid } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { Link } from '@/router/Router';
import { jobs, listings } from '@/data/mockData';
import type { TranslationKey } from '@/i18n/translations';

// Reliable Unsplash photo URLs — each is a direct image link at 400×300
const CARDS: {
  to: string;
  key: TranslationKey;
  photo: string;
  tint: string;
  emoji: string;
  categoryId?: string;
}[] = [
  {
    to: '/category/vehicles',
    key: 'hpNavVehicles',
    photo: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=300&fit=crop&auto=format',
    tint: 'bg-sky-600',
    emoji: '🚗',
    categoryId: 'vehicles',
  },
  {
    to: '/category/hotels',
    key: 'hpCardHotels',
    photo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&auto=format',
    tint: 'bg-amber-600',
    emoji: '🏨',
    categoryId: 'hotels',
  },
  {
    to: '/category/real-estate',
    key: 'hpCardRealEstate',
    photo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format',
    tint: 'bg-emerald-700',
    emoji: '🏠',
    categoryId: 'real-estate',
  },
  {
    to: '/category/electronics',
    key: 'hpNavPhones',
    photo: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop&auto=format',
    tint: 'bg-slate-700',
    emoji: '📱',
    categoryId: 'electronics',
  },
  {
    to: '/category/tractors-equipment',
    key: 'hpCardEquipment',
    photo: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop&auto=format',
    tint: 'bg-yellow-700',
    emoji: '🚜',
    categoryId: 'tractors-equipment',
  },
  {
    to: '/jobs',
    key: 'hpNavJobs',
    photo: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop&auto=format',
    tint: 'bg-primary-700',
    emoji: '💼',
  },
  {
    to: '/category/home-furniture',
    key: 'hpNavHome',
    photo: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop&auto=format',
    tint: 'bg-rose-700',
    emoji: '🛋️',
    categoryId: 'home-furniture',
  },
];

function CategoryPhoto({ photo, tint, emoji }: { photo: string; tint: string; emoji: string }) {
  return (
    <div className="relative h-[100px] overflow-hidden bg-sand-100">
      <img
        src={photo}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        onError={(e) => {
          // On error, hide image and show tinted emoji fallback
          e.currentTarget.style.display = 'none';
          const parent = e.currentTarget.parentElement;
          if (parent) {
            parent.classList.add(tint);
            const span = parent.querySelector('[data-emoji]') as HTMLSpanElement | null;
            if (span) span.style.display = 'flex';
          }
        }}
      />
      {/* Emoji fallback — hidden by default, shown via JS above */}
      <span
        data-emoji
        style={{ display: 'none' }}
        className="absolute inset-0 items-center justify-center text-4xl"
        aria-hidden="true"
      >
        {emoji}
      </span>
      {/* Subtle gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
  );
}

export function CategoryCardRow() {
  const { t, dir, formatNumber } = useI18n();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const counts = useMemo(() => {
    const published = listings.filter((l) => l.status === 'published');
    return CARDS.map((c) =>
      c.categoryId ? published.filter((l) => l.category === c.categoryId).length : jobs.length,
    );
  }, []);

  return (
    <section className="hidden gap-3 md:grid md:grid-cols-4 lg:grid-cols-8" aria-label={t('categories')}>
      {CARDS.map((c, i) => (
        <Link
          key={c.key}
          to={c.to}
          className="card group flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          <CategoryPhoto photo={c.photo} tint={c.tint} emoji={c.emoji} />
          <div className="p-2.5">
            <p className="line-clamp-1 text-xs font-bold text-primary-950">{t(c.key)}</p>
            <p className="mt-0.5 text-[11px] text-primary-400">
              {formatNumber(counts[i])}+ {t('hpItems')}
            </p>
          </div>
        </Link>
      ))}

      {/* View All card */}
      <Link
        to="/search"
        className="card group flex flex-col items-center justify-center gap-2 p-3 text-center transition-all hover:shadow-lg hover:-translate-y-0.5 bg-sand-50"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-950 text-white">
          <LayoutGrid className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="text-xs font-bold text-primary-950">{t('hpAllCategories')}</p>
        <span className="flex items-center gap-0.5 text-xs font-bold text-accent-500">
          {t('hpViewAll')}
          <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </Link>
    </section>
  );
}
