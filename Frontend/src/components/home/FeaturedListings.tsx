import { useMemo } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { listings } from '@/data/mockData';
import { ListingCard } from '@/components/marketplace';
import { SectionHeader } from '@/components/home/SectionHeader';

export function FeaturedListings() {
  const { t } = useI18n();

  const featured = useMemo(() => {
    const pool = listings.filter((l) => l.status === 'published' && l.sellerVerified && l.images.length > 0);
    const firstPerCategory = ['vehicles', 'hotels', 'real-estate']
      .map((cat) => pool.find((l) => l.category === cat))
      .filter((l): l is (typeof pool)[number] => Boolean(l));
    const rest = pool.filter((l) => !firstPerCategory.includes(l));
    return [...firstPerCategory, ...rest].slice(0, 6);
  }, []);

  if (featured.length === 0) return null;

  return (
    <section>
      <SectionHeader
        title={
          <>
            <span className="md:hidden">{t('hpFeaturedDeals')}</span>
            <span className="hidden md:inline">{t('hpFeaturedListings')}</span>
          </>
        }
        viewAllTo="/search"
        viewAllLabel={t('hpViewAllListings')}
      />
      {/* Mobile: horizontal snap scroll */}
      <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 md:hidden">
        {featured.map((l) => (
          <div key={l.id} className="min-w-[72%] snap-start sm:min-w-[44%]">
            <ListingCard listing={l} />
          </div>
        ))}
      </div>
      {/* Desktop: uniform grid — same as Latest Listings */}
      <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 items-stretch">
        {featured.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>
    </section>
  );
}
