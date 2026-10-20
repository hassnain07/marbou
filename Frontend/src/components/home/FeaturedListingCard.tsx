import { Heart, MapPin, MessageCircle } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { useGate } from '@/hooks/useGate';
import { Link, useRouter } from '@/router/Router';
import type { Listing } from '@/data/mockData';
import type { TranslationKey } from '@/i18n/translations';

const BADGE: Record<string, TranslationKey> = {
  vehicles: 'hpVerifiedDealer',
  hotels: 'hpVerifiedHotel',
  'real-estate': 'hpVerifiedProperty',
};

const CTA: Record<string, TranslationKey> = {
  vehicles: 'hpCtaVehicle',
  hotels: 'hpCtaHotel',
  'real-estate': 'hpCtaProperty',
};

export function FeaturedListingCard({ listing }: { listing: Listing }) {
  const { lang, t, formatPrice } = useI18n();
  const { isFavorite, toggleFavorite } = useApp();
  const { requireAuth } = useGate();
  const { navigate } = useRouter();

  const fav = isFavorite(listing.id);
  const href = `/listing/${listing.id}`;
  const title = lang === 'ar' ? listing.titleAr : listing.title;
  const city = lang === 'ar' ? listing.cityAr : listing.city;
  const meta = listing.specs.slice(0, 3).map((s) => (lang === 'ar' ? s.valueAr : s.value)).join(' • ');
  const price = `${formatPrice(listing.price, listing.perMonth)}${listing.category === 'hotels' ? ` ${t('hpPerDay')}` : ''}`;
  const badgeKey = BADGE[listing.category] ?? 'verified';
  const ctaKey = CTA[listing.category] ?? 'hpCtaDefault';

  const whatsapp = (listing as Listing & { whatsapp?: string }).whatsapp;
  const openWhatsApp = () => {
    if (!whatsapp) { navigate(href); return; }
    const text = encodeURIComponent(`${title} - ${listing.ref}`);
    window.open(`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <article className="card flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/10] bg-sand-100">
        <Link to={href} className="block h-full w-full">
          {listing.images[0] && (
            <img src={listing.images[0]} alt={title} loading="lazy" className="h-full w-full object-cover" />
          )}
        </Link>
        <button
          type="button"
          onClick={() => requireAuth('favorite', () => toggleFavorite(listing.id))}
          aria-label={fav ? t('removeFavorite') : t('addFavorite')}
          aria-pressed={fav}
          className="absolute end-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow"
        >
          <Heart className={`h-5 w-5 ${fav ? 'fill-error-500 text-error-500' : 'text-primary-400'}`} aria-hidden="true" />
        </button>
        {listing.sellerVerified && (
          <span className="pointer-events-none absolute bottom-2 start-3 rounded-md bg-primary-500 px-2 py-0.5 text-[11px] font-bold text-white">
            {t(badgeKey)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="flex items-center justify-end gap-1 text-xs text-primary-500">
          <MapPin className="h-3 w-3" aria-hidden="true" />
          {city}
        </p>
        <h3 className="mt-1 line-clamp-1 text-sm font-bold text-primary-950">
          <Link to={href}>{title}</Link>
        </h3>
        {meta && <p className="mt-1 line-clamp-1 text-xs text-primary-400">{meta}</p>}
        <p className="mt-2 text-lg font-extrabold text-primary-950">{price}</p>

        <div className="mt-auto flex gap-2 pt-3">
          <Link
            to={href}
            className="flex-1 rounded-lg bg-primary-950 px-3 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-950/90"
          >
            {t(ctaKey)}
          </Link>
          <button
            type="button"
            onClick={openWhatsApp}
            aria-label={t('whatsapp')}
            className="flex w-11 items-center justify-center rounded-lg border border-success-500 bg-success-50 text-success-600 transition-colors hover:bg-success-100"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
