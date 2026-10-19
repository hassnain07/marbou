import { useState, useRef } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { useRouter } from '@/router/Router';
import { BusinessSidebar } from '@/components/BusinessSidebar';
import { listings, businesses } from '@/data/mockData';
import {
  Phone, MapPin, Clock, Mail, Share2, Edit2, Star, MessageSquare,
  Eye, Heart, Filter, ChevronDown, Check, X, Copy, Link as LinkIcon, Save, Upload, Image as ImageIcon,
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

export function BusinessProfilePage() {
  // This is the BUSINESS PORTAL profile page - business can edit their own info
  const { t, lang, formatPrice, formatNumber } = useI18n();
  const { path, navigate } = useRouter();
  const { showToast } = useApp();

  // Get biz data first (before using in state)
  const pathParts = path.split('/').filter(Boolean);
  const tabId = pathParts[2] || 'profile';
  const biz = businesses[0];

  // File input refs
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const logoImageInputRef = useRef<HTMLInputElement>(null);

  // Now use biz in state initialization
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [listingFilter, setListingFilter] = useState<'all' | 'active' | 'sold'>('all');
  const [isEditMode, setIsEditMode] = useState(false);
  const [coverImage, setCoverImage] = useState(biz.cover);
  const [logoImage, setLogoImage] = useState(biz.logo);
  const [formData, setFormData] = useState({
    name: lang === 'ar' ? biz.nameAr : biz.name,
    description: lang === 'ar' ? biz.descriptionAr : biz.description,
    phone: biz.phone,
    email: biz.email || 'info@store.com',
    hours: '9:00 AM - 6:00 PM',
    location: `${biz.area}, ${biz.city}`,
  });

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
    showToast(t('copied'), 'success');
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverImage(event.target?.result as string);
        showToast(t('imageUpdated'), 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoImage(event.target?.result as string);
        showToast(t('imageUpdated'), 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Shared Sidebar */}
      <BusinessSidebar 
        activeTab={tabId} 
        business={biz}
        sidebarOpen={sidebarOpen}
        onCloseSidebar={() => setSidebarOpen(false)}
      />

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-primary-950/30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-sand-100 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-sand-50">
            <Edit2 className="w-5 h-5 text-primary-600" />
          </button>
          <span className="font-bold text-primary-700">{t('storeProfile')}</span>
        </div>

        <div className="bg-white">
          {/* Cover Section */}
          <div className="relative">
            {/* Cover Image */}
            <div className="h-40 sm:h-56 bg-gradient-to-r from-primary-100 to-primary-50 overflow-hidden relative group">
              <img src={coverImage} alt="cover" className="w-full h-full object-cover" />
              <button 
                onClick={() => coverImageInputRef.current?.click()}
                className={`absolute top-4 right-4 p-2 rounded-lg shadow-lg transition-all ${isEditMode ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-white/90 hover:bg-white text-primary-600'}`}
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                ref={coverImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="hidden"
              />
            </div>

            {/* Logo & Header */}
            <div className="px-4 sm:px-6 pb-4 pt-0">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 mb-4 relative z-10">
                {/* Logo */}
                <div 
                  className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-white border-4 border-sand-100 shadow-lg overflow-hidden flex-shrink-0 ${isEditMode ? 'cursor-pointer group' : ''}`}
                  onClick={() => isEditMode && logoImageInputRef.current?.click()}
                >
                  <img src={logoImage} alt={biz.name} className="w-full h-full object-cover" />
                  {isEditMode && (
                    <div className="absolute inset-0 bg-primary-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <input
                    ref={logoImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoImageChange}
                    className="hidden"
                  />
                </div>

                {/* Header Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-primary-800">{lang === 'ar' ? biz.nameAr : biz.name}</h1>
                    {biz.verified && <Check className="w-6 h-6 text-success-500" title={t('verified')} />}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-primary-600">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-warning-500" />
                      <span className="font-medium">4.8</span>
                      <span className="text-primary-400">(234 {t('ratingCount')})</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-col sm:flex-row">
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="btn-secondary text-sm flex items-center gap-2 justify-center"
                  >
                    <Share2 className="w-4 h-4" />{t('share')}
                  </button>
                  <button 
                    onClick={() => setIsEditMode(!isEditMode)}
                    className="btn-primary text-sm flex items-center gap-2 justify-center"
                  >
                    <Edit2 className="w-4 h-4" />{isEditMode ? t('cancel') : t('edit')}
                  </button>
                </div>
              </div>

              {/* Description */}
              {isEditMode ? (
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input w-full mb-4 resize-none"
                  rows={3}
                  placeholder={t('description')}
                />
              ) : (
                <p className="text-primary-700 mb-4">{formData.description}</p>
              )}

              {/* Business Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {/* Location */}
                <div className={`p-3 rounded-lg ${isEditMode ? 'bg-white border-2 border-primary-200' : 'bg-sand-50 border border-sand-100'}`}>
                  {isEditMode ? (
                    <>
                      <label className="text-xs text-primary-400 block mb-1">{t('location')}</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="input text-sm w-full"
                      />
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-primary-600 text-sm mb-1">
                        <MapPin className="w-4 h-4" />
                        {t('location')}
                      </div>
                      <p className="text-sm font-medium text-primary-800">{formData.location}</p>
                    </>
                  )}
                </div>

                {/* Phone */}
                <div className={`p-3 rounded-lg ${isEditMode ? 'bg-white border-2 border-primary-200' : 'bg-sand-50 border border-sand-100'}`}>
                  {isEditMode ? (
                    <>
                      <label className="text-xs text-primary-400 block mb-1">{t('call')}</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="input text-sm w-full"
                      />
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-primary-600 text-sm mb-1">
                        <Phone className="w-4 h-4" />
                        {t('call')}
                      </div>
                      <p className="text-sm font-medium text-primary-800">{formData.phone}</p>
                    </>
                  )}
                </div>

                {/* Business Hours */}
                <div className={`p-3 rounded-lg ${isEditMode ? 'bg-white border-2 border-primary-200' : 'bg-sand-50 border border-sand-100'}`}>
                  {isEditMode ? (
                    <>
                      <label className="text-xs text-primary-400 block mb-1">{t('businessHours')}</label>
                      <input
                        type="text"
                        value={formData.hours}
                        onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                        className="input text-sm w-full"
                      />
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-primary-600 text-sm mb-1">
                        <Clock className="w-4 h-4" />
                        {t('businessHours')}
                      </div>
                      <p className="text-sm font-medium text-primary-800">{formData.hours}</p>
                    </>
                  )}
                </div>

                {/* Email */}
                <div className={`p-3 rounded-lg ${isEditMode ? 'bg-white border-2 border-primary-200' : 'bg-sand-50 border border-sand-100'}`}>
                  {isEditMode ? (
                    <>
                      <label className="text-xs text-primary-400 block mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input text-sm w-full"
                      />
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-primary-600 text-sm mb-1">
                        <Mail className="w-4 h-4" />
                        Email
                      </div>
                      <p className="text-sm font-medium text-primary-800 truncate">{formData.email}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Save Button in Edit Mode */}
              {isEditMode && (
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => {
                      showToast(t('changesSaved'), 'success');
                      setIsEditMode(false);
                    }}
                    className="btn-primary flex items-center gap-2 justify-center flex-1"
                  >
                    <Save className="w-4 h-4" />{t('save')}
                  </button>
                  <button
                    onClick={() => setIsEditMode(false)}
                    className="btn-secondary flex items-center gap-2 justify-center flex-1"
                  >
                    {t('cancel')}
                  </button>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 p-4 bg-primary-50 rounded-xl border border-primary-100">
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
          <div className="border-t border-sand-100 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-primary-800">{t('listingsCount')}</h2>
              <div className="flex gap-2">
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
        </div>
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
