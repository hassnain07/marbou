import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useRouter, Link } from '@/router/Router';
import { listings, businesses } from '@/data/mockData';
import {
  Phone, MapPin, Clock, Mail, Share2, Star, MessageSquare,
  Eye, Heart, Filter, ChevronDown, X, Copy, ArrowLeft, Send,
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

export function PublicStoreProfilePage() {
  // This is the PUBLIC store profile page - accessible from marketplace, read-only
  const { t, lang, formatPrice, formatNumber } = useI18n();
  const { path, navigate } = useRouter();
  const [listingFilter, setListingFilter] = useState<'all' | 'active' | 'sold'>('all');
  const [showShareModal, setShowShareModal] = useState(false);

  // Extract business ID from path: /store/{biz-id}
  const pathParts = path.split('/').filter(Boolean);
  const bizId = pathParts[1] || 'biz-1';
  const biz = businesses[0]; // In real app, fetch by bizId

  // Get business listings
  const bizListings = listings.filter((l) => l.businessId === biz.id);
  const activeListings = bizListings.filter((l) => l.status === 'published');
  const soldListings = bizListings.filter((l) => l.status === 'sold');

  const filteredListings = 
    listingFilter === 'active' ? activeListings :
    listingFilter === 'sold' ? soldListings :
    bizListings;

  const storeUrl = `${lang === 'ar' ? 'marbou.sd/ar' : 'marbou.sd'}/store/${biz.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(storeUrl);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with back button */}
      <div className="sticky top-0 z-40 bg-white border-b border-sand-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="p-2 rounded-lg hover:bg-sand-50">
            <ArrowLeft className="w-5 h-5 text-primary-600" />
          </Link>
          <h1 className="font-bold text-primary-700 flex-1 text-center">{lang === 'ar' ? biz.nameAr : biz.name}</h1>
          <button
            onClick={() => setShowShareModal(true)}
            className="p-2 rounded-lg hover:bg-sand-50"
          >
            <Share2 className="w-5 h-5 text-primary-600" />
          </button>
        </div>
      </div>

      {/* Cover Section */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-40 sm:h-56 bg-gradient-to-r from-primary-100 to-primary-50 overflow-hidden">
          <img src={biz.cover} alt="cover" className="w-full h-full object-cover" />
        </div>

        {/* Logo & Header */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 mb-6 relative z-10">
            {/* Logo */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-white border-4 border-sand-100 shadow-lg overflow-hidden flex-shrink-0">
              <img src={biz.logo} alt={biz.name} className="w-full h-full object-cover" />
            </div>

            {/* Header Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-primary-800">{lang === 'ar' ? biz.nameAr : biz.name}</h1>
              </div>
              <div className="flex items-center gap-3 text-sm text-primary-600 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-warning-500" />
                  <span className="font-medium">4.8</span>
                  <span className="text-primary-400">(234 {t('ratingCount')})</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <button className="btn-primary text-sm flex items-center gap-2 justify-center w-full sm:w-auto">
              <MessageSquare className="w-4 h-4" />{t('contactBusiness')}
            </button>
          </div>

          {/* Description */}
          <p className="text-primary-700 mb-6">{lang === 'ar' ? biz.descriptionAr : biz.description}</p>

          {/* Business Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {/* Location */}
            <div className="p-3 rounded-lg bg-sand-50 border border-sand-100">
              <div className="flex items-center gap-2 text-primary-600 text-sm mb-1">
                <MapPin className="w-4 h-4" />
                {t('location')}
              </div>
              <p className="text-sm font-medium text-primary-800">{biz.area}</p>
              <p className="text-xs text-primary-400">{biz.city}</p>
            </div>

            {/* Phone */}
            <div className="p-3 rounded-lg bg-sand-50 border border-sand-100">
              <div className="flex items-center gap-2 text-primary-600 text-sm mb-1">
                <Phone className="w-4 h-4" />
                {t('call')}
              </div>
              <p className="text-sm font-medium text-primary-800">{biz.phone}</p>
            </div>

            {/* Business Hours */}
            <div className="p-3 rounded-lg bg-sand-50 border border-sand-100">
              <div className="flex items-center gap-2 text-primary-600 text-sm mb-1">
                <Clock className="w-4 h-4" />
                {t('businessHours')}
              </div>
              <p className="text-sm font-medium text-primary-800">9:00 AM - 6:00 PM</p>
            </div>

            {/* Email */}
            <div className="p-3 rounded-lg bg-sand-50 border border-sand-100">
              <div className="flex items-center gap-2 text-primary-600 text-sm mb-1">
                <Mail className="w-4 h-4" />
                Email
              </div>
              <p className="text-sm font-medium text-primary-800 truncate">{biz.email || 'info@store.com'}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 p-4 bg-primary-50 rounded-xl border border-primary-100 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-700">{formatNumber(bizListings.length)}</p>
              <p className="text-xs text-primary-600">{t('listingsCount')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-700">{formatNumber(1250)}</p>
              <p className="text-xs text-primary-600">{t('views2')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-700">{formatNumber(89)}</p>
              <p className="text-xs text-primary-600">{t('leads')}</p>
            </div>
            <div className="text-center hidden sm:block">
              <p className="text-2xl font-bold text-primary-700">{formatNumber(340)}</p>
              <p className="text-xs text-primary-600">{t('favorites')}</p>
            </div>
            <div className="text-center hidden sm:block">
              <p className="text-2xl font-bold text-primary-700">98%</p>
              <p className="text-xs text-primary-600">{t('responseRate')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Listings Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 border-t border-sand-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-primary-800">{t('listingsCount')}</h2>
          <div className="relative group">
            <button className="input text-sm py-1.5 px-3 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span>{listingFilter === 'all' ? t('allStatus') : listingFilter}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg border border-sand-100 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-10">
              <button
                onClick={() => setListingFilter('all')}
                className="w-full px-3 py-2 text-sm text-start hover:bg-sand-50 text-primary-700"
              >
                {t('allStatus')}
              </button>
              <button
                onClick={() => setListingFilter('active')}
                className="w-full px-3 py-2 text-sm text-start hover:bg-sand-50 text-primary-700"
              >
                {t('active')}
              </button>
              <button
                onClick={() => setListingFilter('sold')}
                className="w-full px-3 py-2 text-sm text-start hover:bg-sand-50 text-primary-700"
              >
                {t('sold')}
              </button>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="card overflow-hidden hover:border-primary-300 transition-all group cursor-pointer"
                onClick={() => navigate(`/listing/${listing.id}`)}
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden bg-sand-100">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                  <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 hover:bg-white">
                    <Heart className="w-4 h-4 text-error-500" />
                  </div>
                  {listing.status === 'sold' && (
                    <div className="absolute inset-0 bg-primary-950/50 flex items-center justify-center">
                      <span className="bg-error-500 text-white px-3 py-1 rounded-full text-sm font-medium">{t('sold')}</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-3">
                  <h3 className="font-bold text-primary-800 text-sm line-clamp-2 mb-2">{listing.title}</h3>
                  <p className="text-primary-600 text-sm mb-2">{listing.location}</p>

                  {/* Price & Stats */}
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-primary-700">{formatPrice(listing.price)}</p>
                    <div className="flex items-center gap-1 text-xs text-primary-400">
                      <Eye className="w-3 h-3" />
                      {formatNumber(Math.random() * 500)}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        listing.status === 'published'
                          ? 'bg-success-100 text-success-700'
                          : 'bg-sand-100 text-primary-600'
                      }`}
                    >
                      {listing.status === 'published' ? t('active') : t('sold')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-primary-300 mx-auto mb-3" />
            <p className="text-primary-600 font-medium">{lang === 'ar' ? 'لا توجد إعلانات' : 'No listings'}</p>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-primary-950/30 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:w-96 p-6 space-y-4 animate-in slide-in-from-bottom md:slide-in-from-center">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-primary-800">{t('shareStore')}</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 rounded-lg hover:bg-sand-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Share Link */}
            <div className="p-3 bg-sand-50 rounded-xl border border-sand-100">
              <p className="text-xs text-primary-400 mb-2">{lang === 'ar' ? 'رابط المتجر' : 'Store Link'}</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={storeUrl}
                  readOnly
                  className="input text-sm flex-1"
                />
                <button
                  onClick={handleCopyLink}
                  className="btn-primary text-sm px-3 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />{t('copy')}
                </button>
              </div>
            </div>

            {/* Share Options */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-primary-600">{lang === 'ar' ? 'شارك عبر' : 'Share via'}</p>
              <div className="grid grid-cols-3 gap-2">
                <button className="p-3 rounded-lg bg-primary-50 hover:bg-primary-100 border border-primary-100 text-center">
                  <div className="text-2xl mb-2">f</div>
                  <p className="text-xs text-primary-700 font-medium">Facebook</p>
                </button>
                <button className="p-3 rounded-lg bg-green-50 hover:bg-green-100 border border-green-100 text-center">
                  <div className="text-2xl mb-2">💬</div>
                  <p className="text-xs text-primary-700 font-medium">WhatsApp</p>
                </button>
                <button className="p-3 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-100 text-center">
                  <div className="text-2xl mb-2">𝕏</div>
                  <p className="text-xs text-primary-700 font-medium">Twitter</p>
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full btn-secondary"
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
