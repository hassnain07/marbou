import { useState, useEffect } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import type { TranslationKey } from '@/i18n/translations';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter, Link } from '@/router/Router';
import { useGate } from '@/hooks/useGate';
import { ListingCard } from '@/components/ListingCard';
import { Modal, RatingStars, TrustBadge, StatusBadge, EmptyState } from '@/components/ui';
import { listings, businesses, sampleReviews } from '@/data/mockData';
import {
  Heart, Share2, GitCompare, Phone, MessageSquare, MapPin, Eye, Clock,
  ChevronLeft, ChevronRight, X, Shield, Flag, Ban, CheckCircle, ChevronDown,
  Star, Send, Video, Lock,
} from 'lucide-react';

export function ListingDetailPage() {
  const { t, lang, formatPrice, formatDate, formatNumber } = useI18n();
  const { path, navigate } = useRouter();
  const { user } = useAuth();
  const { requireAuth } = useGate();
  const { isFavorite, toggleFavorite, isComparing, toggleCompare, compareList, addRecentlyViewed, showToast, showAuthGate, dataSaver } = useApp();

  const id = path.split('/')[2];
  const listing = listings.find((l) => l.id === id);

  const [activeImage, setActiveImage] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showCallContact, setShowCallContact] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState(sampleReviews);

  useEffect(() => {
    if (listing) addRecentlyViewed(listing.id);
  }, [id]);

  if (!listing) {
    return <EmptyState icon={<X className="w-10 h-10" />} title={t('noResults')} description={t('noResultsDesc')} />;
  }

  const title = lang === 'ar' ? listing.titleAr : listing.title;
  const desc = lang === 'ar' ? listing.descriptionAr : listing.description;
  const city = lang === 'ar' ? listing.cityAr : listing.city;
  const area = lang === 'ar' ? listing.areaAr : listing.area;
  const sellerName = lang === 'ar' ? listing.sellerNameAr : listing.sellerName;
  const business = businesses.find((b) => b.id === listing.businessId);
  const fav = isFavorite(listing.id);
  const comparing = isComparing(listing.id);
  const canCompare = listing.category === 'vehicles' || listing.category === 'real-estate' || listing.category === 'electronics';

  const similar = listings.filter((l) => l.category === listing.category && l.id !== listing.id && l.status === 'published').slice(0, 5);
  const recentlyViewedIds = JSON.parse(localStorage.getItem('marbou-recent') || '[]').filter((r: string) => r !== listing.id);
  const recent = recentlyViewedIds.map((r: string) => listings.find((l) => l.id === r)).filter(Boolean).slice(0, 5) as typeof listings;

  const handleShare = () => {
    showToast(lang === 'ar' ? 'تم نسخ الرابط' : 'Link copied', 'success');
  };

  const handleReport = () => {
    if (!requireAuth('report')) return;
    setShowReport(false);
    showToast(t('reportSubmitted'), 'success');
  };

  const handleReview = () => {
    if (!requireAuth('review')) return;
    setReviews([{ id: Date.now().toString(), author: 'Demo User', authorAr: 'مستخدم تجريبي', avatar: '', rating: reviewRating, text: reviewText, textAr: reviewText, date: new Date().toISOString().slice(0, 10) }, ...reviews]);
    setReviewText('');
    setReviewRating(5);
    setShowReview(false);
    showToast(lang === 'ar' ? 'تم نشر التقييم' : 'Review posted', 'success');
  };

  const handleCallClick = () => {
    if (!user) {
      showAuthGate('contact');
      return;
    }
    setShowCallContact(true);
  };

  return (
    <div className="py-4 pb-24 md:pb-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-sm text-primary-400 mb-4 overflow-x-auto no-scrollbar">
        <button onClick={() => navigate('/')} className="hover:text-primary-600 whitespace-nowrap">{t('home')}</button>
        <span className="text-sand-300">/</span>
        <button onClick={() => navigate(`/category/${listing.category}`)} className="hover:text-primary-600 whitespace-nowrap">{t(listing.category as TranslationKey)}</button>
        <span className="text-sand-300">/</span>
        <span className="text-primary-600 font-medium whitespace-nowrap line-clamp-1">{title}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Gallery + details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image gallery */}
          <div className="card overflow-hidden">
            <div className="relative aspect-video bg-sand-100">
              {listing.images.length > 0 ? (
                <img src={listing.images[activeImage]} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary-300">
                  <span>{t('addPhotos')}</span>
                </div>
              )}
              {listing.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage((activeImage - 1 + listing.images.length) % listing.images.length)}
                    className="absolute start-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white"
                  >
                    <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
                  </button>
                  <button
                    onClick={() => setActiveImage((activeImage + 1) % listing.images.length)}
                    className="absolute end-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white"
                  >
                    <ChevronRight className="w-5 h-5 rtl:rotate-180" />
                  </button>
                </>
              )}
              <button onClick={() => setLightbox(true)} className="absolute top-2 end-2 bg-primary-900/60 text-white rounded-lg px-3 py-1 text-xs">
                {activeImage + 1} / {listing.images.length}
              </button>
              {listing.hasVideo && (
                <div className="absolute top-2 start-2 bg-primary-900/70 text-white rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-xs">
                  <Video className="w-3.5 h-3.5" />{t('addVideo')}
                </div>
              )}
            </div>
            {listing.images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto no-scrollbar">
                {listing.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${activeImage === i ? 'border-primary-500' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title and price */}
          <div className="card p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-primary-800 mb-2">{title}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-primary-400">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{city} - {area}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{formatDate(listing.postedAt)}</span>
                  <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{formatNumber(listing.views)}</span>
                  <span className="text-xs">{t('listingRef')}: {listing.ref}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                {listing.promoted && <TrustBadge type="sponsored" />}
                {listing.status !== 'published' && <StatusBadge status={listing.status} />}
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl sm:text-3xl font-extrabold text-primary-700">{formatPrice(listing.price, listing.perMonth)}</span>
              {listing.negotiable && <span className="text-sm text-primary-400">{t('negotiable')}</span>}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  if (!user) {
                    showAuthGate('favorite');
                  } else {
                    toggleFavorite(listing.id);
                  }
                }}
                className={`btn px-4 py-2 text-sm border ${fav ? 'bg-error-50 border-error-200 text-error-600' : 'border-sand-200 text-primary-600 hover:bg-sand-50'}`}
              >
                <Heart className={`w-4 h-4 ${fav ? 'fill-error-500' : ''}`} />{t('favorite')}
              </button>
              <button onClick={handleShare} className="btn px-4 py-2 text-sm border border-sand-200 text-primary-600 hover:bg-sand-50">
                <Share2 className="w-4 h-4" />{t('share')}
              </button>
              {canCompare && (
                <button
                  onClick={() => { if (compareList.length < 4 || comparing) toggleCompare(listing.id); else showToast(t('maxCompareReached'), 'error'); }}
                  className={`btn px-4 py-2 text-sm border ${comparing ? 'bg-primary-50 border-primary-300 text-primary-700' : 'border-sand-200 text-primary-600 hover:bg-sand-50'}`}
                >
                  <GitCompare className="w-4 h-4" />{t('compare')}
                </button>
              )}
              <button onClick={() => { if (requireAuth('report')) setShowReport(true); }} className="btn px-4 py-2 text-sm border border-sand-200 text-primary-600 hover:bg-sand-50">
                <Flag className="w-4 h-4" />{t('report')}
              </button>
            </div>
          </div>

          {/* Specifications */}
          <div className="card p-4 sm:p-6">
            <h2 className="text-lg font-bold text-primary-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary-600 rounded-full" />{t('specifications')}
            </h2>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-0">
              {listing.specs.map((spec, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-sand-50">
                  <span className="text-sm text-primary-400">{lang === 'ar' ? spec.keyAr : spec.key}</span>
                  <span className="text-sm font-medium text-primary-700">{lang === 'ar' ? spec.valueAr : spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Market Price Insights */}
          <div className="card p-4 sm:p-6">
            <h2 className="text-lg font-bold text-primary-800 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary-600 rounded-full" />{t('marketPriceInsights')}
            </h2>
            <p className="text-xs text-primary-400 mb-4">{t('marketPriceDisclaimer')} ({lang === 'ar' ? 'تقدير فقط - mock data' : 'estimated - mock data'})</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-sand-50 rounded-xl">
                <p className="text-xs text-primary-400 mb-1">{t('lowestPrice')}</p>
                <p className="text-sm font-bold text-success-600">{formatPrice(Math.round(listing.price * 0.85))}</p>
              </div>
              <div className="text-center p-3 bg-primary-50 rounded-xl">
                <p className="text-xs text-primary-400 mb-1">{t('averagePrice')}</p>
                <p className="text-sm font-bold text-primary-700">{formatPrice(Math.round(listing.price * 1.0))}</p>
              </div>
              <div className="text-center p-3 bg-sand-50 rounded-xl">
                <p className="text-xs text-primary-400 mb-1">{t('highestPrice')}</p>
                <p className="text-sm font-bold text-warning-600">{formatPrice(Math.round(listing.price * 1.15))}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-primary-400 mb-1">
                <span>{t('priceRange')}</span>
                <span>{formatPrice(Math.round(listing.price * 0.85))} - {formatPrice(Math.round(listing.price * 1.15))}</span>
              </div>
              <div className="relative h-2 bg-sand-100 rounded-full overflow-hidden">
                <div className="absolute h-full bg-gradient-to-r from-success-300 via-primary-400 to-warning-300 rounded-full" style={{ insetInlineStart: '15%', width: '70%' }} />
                <div className="absolute h-4 w-4 bg-white border-2 border-primary-600 rounded-full -mt-1 top-1/2 -translate-y-1/2" style={{ insetInlineStart: 'calc(50% - 8px)' }} />
              </div>
              <p className="text-xs text-center text-primary-500 mt-2">
                {lang === 'ar' ? 'هذا الإعلان ضمن النطاق المتوقع' : 'This listing is within the expected range'}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="card p-4 sm:p-6">
            <h2 className="text-lg font-bold text-primary-800 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary-600 rounded-full" />{t('description')}
            </h2>
            <p className="text-sm text-primary-600 leading-relaxed whitespace-pre-line">{desc}</p>
          </div>

          {/* Location map placeholder */}
          <div className="card p-4 sm:p-6">
            <h2 className="text-lg font-bold text-primary-800 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary-600 rounded-full" />{t('location')}
            </h2>
            <div className="relative h-48 rounded-xl bg-gradient-to-br from-primary-50 to-sand-100 overflow-hidden">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, #3a8a57 2px, transparent 2px), radial-gradient(circle at 70% 60%, #3a8a57 2px, transparent 2px)', backgroundSize: '40px 40px' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary-600 text-white rounded-full p-3 shadow-lg">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="absolute bottom-2 start-2 bg-white/90 rounded-lg px-3 py-1.5 text-xs text-primary-600 font-medium">
                {city} - {area}
              </div>
            </div>
          </div>

          {/* Safety tips */}
          <div className="card p-4 bg-warning-50/50 border-warning-100">
            <h3 className="font-bold text-warning-700 mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5" />{t('safetyTips')}
            </h3>
            <ul className="text-sm text-warning-600 space-y-1">
              <li>• {lang === 'ar' ? 'قابل البائع في مكان عام' : 'Meet the seller in a public place'}</li>
              <li>• {lang === 'ar' ? 'افحص المنتج قبل الدفع' : 'Inspect the item before paying'}</li>
              <li>• {lang === 'ar' ? 'لا تدفع مسبقاً قبل رؤية المنتج' : 'Do not pay in advance before seeing the item'}</li>
            </ul>
          </div>

          {/* Reviews */}
          {business && (
            <div className="card p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-primary-800 flex items-center gap-2">
                  <span className="w-1 h-5 bg-primary-600 rounded-full" />{t('reviews')}
                </h2>
                <button onClick={() => { if (requireAuth('review')) setShowReview(true); }} className="btn-primary text-sm py-2 px-4">
                  {t('writeReview')}
                </button>
              </div>
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-sand-50">
                <div className="text-3xl font-bold text-primary-700">{business.rating}</div>
                <div>
                  <RatingStars rating={business.rating} size="md" />
                  <p className="text-xs text-primary-400 mt-1">{business.reviewCount} {t('ratingCount')}</p>
                </div>
              </div>
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="border-b border-sand-50 pb-4 last:border-0">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-sand-100 overflow-hidden shrink-0">
                        {rev.avatar && <img src={rev.avatar} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-primary-700 text-sm">{lang === 'ar' ? rev.authorAr : rev.author}</span>
                          <RatingStars rating={rev.rating} />
                          <span className="text-xs text-primary-300">{rev.date}</span>
                        </div>
                        <p className="text-sm text-primary-600">{lang === 'ar' ? rev.textAr : rev.text}</p>
                        {rev.reply && (
                          <div className="mt-2 ps-3 border-s-2 border-sand-100">
                            <p className="text-xs font-medium text-primary-500 mb-1">{t('businessReply')}</p>
                            <p className="text-sm text-primary-500">{lang === 'ar' ? rev.replyAr : rev.reply}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Seller card */}
        <div className="space-y-4">
          <div className="card p-4 sm:p-6 sticky top-20">
            <h3 className="font-bold text-primary-800 mb-3">{t('sellerInfo')}</h3>
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => navigate(`/seller/${encodeURIComponent(sellerName)}`)} className="w-14 h-14 rounded-xl bg-sand-100 overflow-hidden shrink-0 hover:opacity-80 transition-opacity">
                <img src={listing.sellerAvatar} alt="" className="w-full h-full object-cover" />
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <button onClick={() => navigate(`/seller/${encodeURIComponent(sellerName)}`)} className="font-bold text-primary-700 hover:text-primary-500 transition-colors">{sellerName}</button>
                  {listing.sellerVerified && <CheckCircle className="w-4 h-4 text-primary-500" />}
                </div>
                <div className="flex items-center gap-2 text-xs text-primary-400">
                  <RatingStars rating={listing.sellerRating} />
                  <span>{listing.sellerRating}</span>
                </div>
                <p className="text-xs text-primary-300 mt-0.5">{t('usuallyReplies')} {lang === 'ar' ? 'في غضون ساعتين' : 'within 2 hours'}</p>
              </div>
            </div>
            <button onClick={() => navigate(`/seller/${encodeURIComponent(sellerName)}`)} className="btn-secondary w-full text-sm mb-3">
              {t('viewDetails')}
            </button>
            <div className="space-y-2">
              <button onClick={handleCallClick} className="btn-primary w-full text-sm justify-center">
                <Phone className="w-4 h-4" />{t('call')}
              </button>
              <button onClick={() => {
                if (!requireAuth('chat')) {
                  return;
                }
                navigate('/account/messages');
              }} className="btn-secondary w-full text-sm justify-center">
                <MessageSquare className="w-4 h-4" />{t('message')}
              </button>
              {listing.whatsapp && (
                <a href={`https://wa.me/${listing.whatsapp.replace(/\s+/g, '').replace(/^\+/, '')}?text=${encodeURIComponent(`Hi, I'm interested in: ${title}\nListing ID: ${listing.ref}\nPrice: ${formatPrice(listing.price)}`)}`} target="_blank" rel="noopener noreferrer" className="btn w-full text-sm bg-success-50 text-success-600 border border-success-200 hover:bg-success-100 justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2z"/></svg>
                  {t('whatsapp')}
                </a>
              )}
            </div>
            <button onClick={() => {
              if (!requireAuth('message')) {
                return;
              }
              navigate('/account/messages');
            }} className="w-full mt-2 text-xs text-primary-400 hover:text-primary-600 flex items-center justify-center gap-1 py-2">
              {user ? <MessageSquare className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {user ? t('message') : t('signInToMessage')}
            </button>
          </div>
        </div>
      </div>

      {/* Similar listings */}
      {similar.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-primary-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-primary-600 rounded-full" />{t('similarListings')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {similar.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </div>
      )}

      {/* Recently viewed */}
      {recent.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-primary-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-primary-600 rounded-full" />{t('recentlyViewed')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {recent.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </div>
      )}

      {/* Sticky mobile contact bar */}
      <div className="md:hidden fixed bottom-16 inset-x-0 z-20 bg-white border-t border-sand-100 p-3 flex gap-2 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
        <button onClick={handleCallClick} className="btn-primary flex-1 text-sm justify-center">
          <Phone className="w-4 h-4" />{t('call')}
        </button>
        {listing.whatsapp && (
          <a href={`https://wa.me/${listing.whatsapp.replace(/\s+/g, '').replace(/^\+/, '')}?text=${encodeURIComponent(`Hi, I'm interested in: ${title}\nListing ID: ${listing.ref}\nPrice: ${formatPrice(listing.price)}`)}`} target="_blank" rel="noopener noreferrer" className="btn-secondary flex-1 text-sm justify-center">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2z"/></svg>
            {t('whatsapp')}
          </a>
        )}
        <button onClick={() => {
          if (!requireAuth('chat')) {
            return;
          }
          navigate('/account/messages');
        }} className="btn w-full text-sm justify-center bg-primary-50 text-primary-600 border border-primary-100 hover:bg-primary-100">
          <MessageSquare className="w-4 h-4" />{t('message')}
        </button>
      </div>

      {/* Lightbox */}
      {lightbox && listing.images.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-primary-950/90 flex items-center justify-center animate-fade-in" onClick={() => setLightbox(false)}>
          <button className="absolute top-4 end-4 text-white p-2" onClick={() => setLightbox(false)}>
            <X className="w-6 h-6" />
          </button>
          <img src={listing.images[activeImage]} alt="" className="max-w-full max-h-full object-contain" />
        </div>
      )}

      {/* Contact modal */}
      <Modal open={showContact} onClose={() => setShowContact(false)} title={t('contactPreview')}>
        <div className="space-y-4">
          <div className="bg-sand-50 rounded-xl p-4 text-center">
            <p className="text-xs text-primary-400 mb-1">{t('sellerInfo')}</p>
            <p className="text-lg font-bold text-primary-700">{listing?.phone || t('notAvailable')}</p>
          </div>
          <div className="flex gap-2">
            {listing?.phone && (
              <a href={`tel:${listing.phone.replace(/\s+/g, '')}`} className="btn-primary flex-1 justify-center text-sm">
                <Phone className="w-4 h-4" />{t('call')}
              </a>
            )}
            <button onClick={() => { setShowContact(false); navigate('/account/messages'); }} className="btn-secondary flex-1 justify-center text-sm">
              <MessageSquare className="w-4 h-4" />{t('message')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Call privacy modal (intermediary contact gateway) */}
      <Modal open={showCallContact} onClose={() => setShowCallContact(false)} title={t('contactSeller')} size="sm">
        <div className="space-y-4">
          <div className="bg-primary-50 rounded-xl p-4">
            <p className="text-xs text-primary-500 font-medium mb-2">{lang === 'ar' ? 'معلومات المتصل' : 'Caller Information'}</p>
            <p className="text-sm text-primary-700 font-bold mb-3">{listing.phone}</p>
            <div className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-sand-100 text-xs text-primary-400">
              <Clock className="w-4 h-4" />
              {lang === 'ar' ? 'عادة يرد البائع خلال ساعتين' : 'Seller usually replies within 2 hours'}
            </div>
          </div>
          <div className="bg-warning-50/50 border border-warning-100 rounded-xl p-3 flex gap-2 text-xs text-warning-700">
            <Shield className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{lang === 'ar' ? 'تأكد من الالتقاء في مكان عام آمن' : 'Always meet in a public place and verify the item'}</span>
          </div>
          {listing?.phone && (
            <a href={`tel:${listing.phone.replace(/\s+/g, '')}`} className="btn-primary w-full justify-center">
              <Phone className="w-4 h-4" />{lang === 'ar' ? 'اتصل الآن' : 'Call Now'}
            </a>
          )}
          <button onClick={() => setShowCallContact(false)} className="btn-secondary w-full">
            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
        </div>
      </Modal>

      {/* Report modal */}
      <Modal open={showReport} onClose={() => setShowReport(false)} title={t('report')} size="sm">
        <div className="space-y-3">
          {['Fraud or scam', 'Prohibited content', 'Misleading images', 'Duplicate listing', 'Spam', 'Other'].map((reason, i) => (
            <label key={i} className="flex items-center gap-3 p-3 rounded-xl border border-sand-100 hover:bg-sand-50 cursor-pointer">
              <input type="radio" name="report" className="accent-primary-600" defaultChecked={i === 0} />
              <span className="text-sm text-primary-700">{lang === 'ar' ? ['احتيال', 'محتوى ممنوع', 'صور مضللة', 'إعلان مكرر', 'إزعاج', 'أخرى'][i] : reason}</span>
            </label>
          ))}
          <button onClick={handleReport} className="btn-danger w-full">{t('report')}</button>
        </div>
      </Modal>

      {/* Review modal */}
      <Modal open={showReview} onClose={() => setShowReview(false)} title={t('writeReview')} size="sm">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-primary-600 mb-2 block">{t('rating')}</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setReviewRating(star)}>
                  <Star className={`w-8 h-8 ${star <= reviewRating ? 'fill-accent-400 text-accent-400' : 'text-sand-200'}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-primary-600 mb-2 block">{t('description')}</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              className="input resize-none"
              placeholder={lang === 'ar' ? 'اكتب تقييمك...' : 'Write your review...'}
            />
          </div>
          <button onClick={handleReview} className="btn-primary w-full">{t('submit')}</button>
        </div>
      </Modal>
    </div>
  );
}
