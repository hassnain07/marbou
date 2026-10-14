import { memo } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { Link } from '@/router/Router';
import { Heart, MapPin, Eye, Video, Star, GitCompare } from 'lucide-react';
import { TrustBadge, Skeleton } from '@/components/ui';
import type { Listing } from '@/data/mockData';

interface ListingCardProps {
  listing: Listing;
  layout?: 'grid' | 'list';
  loading?: boolean;
  dataSaver?: boolean;
  blurDataURL?: string;
}

function ListingCardComponent({ listing, layout = 'grid', loading = false, dataSaver, blurDataURL }: ListingCardProps) {
  const { lang, t, formatPrice, formatDate, formatNumber } = useI18n();
  const { isFavorite, toggleFavorite, isComparing, toggleCompare, compareList, dataSaver: appDataSaver } = useApp();

  const shouldUseSaver = dataSaver ?? appDataSaver;

  const title = lang === 'ar' ? listing.titleAr : listing.title;
  const city = lang === 'ar' ? listing.cityAr : listing.city;
  const area = lang === 'ar' ? listing.areaAr : listing.area;
  const desc = lang === 'ar' ? listing.descriptionAr : listing.description;
  const sellerName = lang === 'ar' ? listing.sellerNameAr : listing.sellerName;
  const fav = isFavorite(listing.id);
  const comparing = isComparing(listing.id);
  const canCompare = listing.category === 'vehicles' || listing.category === 'real-estate' || listing.category === 'electronics';

  // LQIP blur-up effect with gradient fallback
  const imgStyle: React.CSSProperties | undefined = shouldUseSaver
    ? { background: `linear-gradient(135deg, #dcede0, #f4e9d0)`, height: '100%' }
    : blurDataURL
      ? {
          backgroundImage: `url('${blurDataURL}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px)',
        }
      : undefined;

  const specsPreview = listing.specs.slice(0, 3).map((s) => (lang === 'ar' ? s.valueAr : s.value)).join(' · ');

  if (loading) {
    return layout === 'list' ? (
      <div className="card overflow-hidden flex flex-row gap-4 p-4">
        <Skeleton className="w-40 sm:w-56 h-40 rounded-lg shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
    ) : (
      <div className="card overflow-hidden">
        <Skeleton className="aspect-[4/3] rounded-none" />
        <div className="p-3 space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    );
  }

  if (layout === 'list') {
    return (
      <Link to={`/listing/${listing.id}`} className="block">
        <div className="card overflow-hidden hover:shadow-md transition-all flex flex-row group">
          <div className="relative w-40 sm:w-56 shrink-0 bg-sand-100">
            {listing.images.length > 0 ? (
              <img
                src={listing.images[0]}
                alt={title}
                className="w-full h-full object-cover transition-all duration-300"
                loading="lazy"
                style={imgStyle}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary-300 min-h-[120px]">
                <span className="text-xs">{t('addPhotos')}</span>
              </div>
            )}
            {listing.promoted && (
              <div className="absolute top-2 start-2">
                <TrustBadge type="sponsored" />
              </div>
            )}
            {listing.hasVideo && (
              <div className="absolute top-2 end-2 bg-primary-900/70 text-white rounded-md p-1">
                <Video className="w-3.5 h-3.5" aria-hidden="true" />
              </div>
            )}
          </div>
          <div className="flex-1 p-4 flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-primary-800 text-sm sm:text-base line-clamp-2 group-hover:text-primary-600 transition-colors">
                {title}
              </h3>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleFavorite(listing.id);
                }}
                className="shrink-0 p-1.5 rounded-lg hover:bg-sand-50 transition-colors"
                aria-label={fav ? t('removeFavorite') : t('addFavorite')}
                aria-pressed={fav}
              >
                <Heart
                  className={`w-5 h-5 ${fav ? 'fill-error-500 text-error-500' : 'text-primary-300'}`}
                  aria-hidden="true"
                />
              </button>
            </div>
            <p className="text-lg font-bold text-primary-700 mt-1">{formatPrice(listing.price, listing.perMonth)}</p>
            {listing.negotiable && <span className="text-xs text-primary-400">{t('negotiable')}</span>}
            <p className="text-xs text-primary-400 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
              {city} - {area}
            </p>
            {specsPreview && <p className="text-xs text-primary-500 mt-2 line-clamp-1">{specsPreview}</p>}
            <div className="flex items-center justify-between mt-auto pt-2">
              <span className="text-xs text-primary-400 flex items-center gap-1">
                <Eye className="w-3 h-3" aria-hidden="true" />
                {formatNumber(listing.views)}
              </span>
              <span className="text-xs text-primary-400">{formatDate(listing.postedAt)}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/listing/${listing.id}`} className="block">
      <div className="card overflow-hidden hover:shadow-lg transition-all duration-200 group h-full flex flex-col">
        <div className="relative aspect-[4/3] bg-sand-100 overflow-hidden">
          {listing.images.length > 0 ? (
            <img
              src={listing.images[0]}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              style={imgStyle}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary-300">
              <span className="text-xs">{t('addPhotos')}</span>
            </div>
          )}
          <div className="absolute top-2 start-2 flex flex-col gap-1">
            {listing.promoted && <TrustBadge type="sponsored" />}
            {listing.condition === 'new' && (
              <span className="badge bg-success-100 text-success-700">{t('new')}</span>
            )}
            {listing.isWanted && (
              <span className="badge bg-accent-100 text-accent-700">{t('wantedToBuyLabel')}</span>
            )}
          </div>
          {listing.hasVideo && (
            <div className="absolute top-2 end-2 bg-primary-900/70 text-white rounded-md p-1.5">
              <Video className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(listing.id);
            }}
            className="absolute bottom-2 end-2 bg-white/90 rounded-full p-2 shadow-sm hover:bg-white transition-all"
            aria-label={fav ? t('removeFavorite') : t('addFavorite')}
            aria-pressed={fav}
          >
            <Heart
              className={`w-4 h-4 ${fav ? 'fill-error-500 text-error-500' : 'text-primary-400'}`}
              aria-hidden="true"
            />
          </button>
          {canCompare && (
            <button
              onClick={(e) => {
                e.preventDefault();
                if (compareList.length < 3 || comparing) toggleCompare(listing.id);
              }}
              className={`absolute bottom-2 start-2 bg-white/90 rounded-full p-2 shadow-sm hover:bg-white transition-all ${comparing ? 'ring-2 ring-primary-500' : ''}`}
              aria-label={comparing ? t('removeCompare') : t('addCompare')}
              aria-pressed={comparing}
            >
              <GitCompare
                className={`w-4 h-4 ${comparing ? 'text-primary-600' : 'text-primary-400'}`}
                aria-hidden="true"
              />
            </button>
          )}
        </div>
        <div className="p-3 flex flex-col flex-1">
          <h3 className="font-bold text-primary-800 text-sm line-clamp-2 group-hover:text-primary-600 transition-colors min-h-[2.5rem]">
            {title}
          </h3>
          <p className="text-lg font-bold text-primary-700 mt-1">{formatPrice(listing.price, listing.perMonth)}</p>
          {listing.negotiable && <span className="text-xs text-primary-400">{t('negotiable')}</span>}
          <p className="text-xs text-primary-400 mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
            {city} - {area}
          </p>
          {specsPreview && <p className="text-xs text-primary-500 mt-1.5 line-clamp-1">{specsPreview}</p>}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-sand-50">
            <div className="flex items-center gap-1.5">
              {listing.sellerVerified && (
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-primary-500 text-primary-500" aria-hidden="true" />
                  <span className="text-xs text-primary-500 font-medium">{listing.sellerRating}</span>
                </div>
              )}
              <span className="text-xs text-primary-300 truncate max-w-[80px]">{sellerName}</span>
            </div>
            <span className="text-xs text-primary-400 flex items-center gap-0.5">
              <Eye className="w-3 h-3" aria-hidden="true" />
              {formatNumber(listing.views)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export const ListingCard = memo(ListingCardComponent);

interface ListingCardGridProps {
  listings: Listing[];
  layout?: 'grid' | 'list';
  loading?: boolean;
}

function ListingCardGridComponent({ listings, layout = 'grid', loading = false }: ListingCardGridProps) {
  if (layout === 'list') {
    return (
      <div className="space-y-3">
        {listings.map((l) => (
          <ListingCard key={l.id} listing={l} layout="list" loading={loading} />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {listings.map((l) => (
        <ListingCard key={l.id} listing={l} loading={loading} />
      ))}
    </div>
  );
}

export const ListingCardGrid = memo(ListingCardGridComponent);
