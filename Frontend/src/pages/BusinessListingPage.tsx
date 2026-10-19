import { useState, useEffect } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter, Link } from '@/router/Router';
import { listings, businesses } from '@/data/mockData';
import { BusinessSidebar } from '@/components/BusinessSidebar';
import { Modal, EmptyState, StatusBadge } from '@/components/ui';
import {
  Plus, Edit2, Trash2, Eye, Copy, Zap, Archive, X, Save,
  Search, Filter, ChevronLeft, ChevronRight, TrendingUp, Clock,
  AlertCircle, Check, LayoutDashboard, Wrench, Briefcase, MessageSquare,
  Store, Users, Shield, Star, CreditCard, BarChart3, FileText, MapPin,
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

const BIZ_TABS = [
  { id: 'overview', icon: LayoutDashboard, key: 'businessOverview' as TranslationKey },
  { id: 'listings', icon: FileText, key: 'listingsManagement' as TranslationKey },
  { id: 'services', icon: Wrench, key: 'servicesManagement' as TranslationKey },
  { id: 'jobs', icon: Briefcase, key: 'jobPosts' as TranslationKey },
  { id: 'messages', icon: MessageSquare, key: 'messagesLeads' as TranslationKey },
  { id: 'profile', icon: Store, key: 'storeProfile' as TranslationKey },
  { id: 'staff', icon: Users, key: 'staffDirectory' as TranslationKey },
  { id: 'verification', icon: Shield, key: 'verification' as TranslationKey },
  { id: 'reviews', icon: Star, key: 'reviewsReplies' as TranslationKey },
  { id: 'plan', icon: CreditCard, key: 'planSubs' as TranslationKey },
  { id: 'analytics', icon: BarChart3, key: 'analytics' as TranslationKey },
];

export function BusinessListingPage() {
  const { t, lang, formatPrice, formatDate } = useI18n();
  const { path, navigate } = useRouter();
  const { user } = useAuth();
  const { showToast } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingListing, setEditingListing] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get business from URL or current user
  const bizId = path.split('/')[2];
  const biz = bizId ? businesses.find((b) => b.id === bizId) : businesses[0];

  if (!biz) {
    return (
      <div className="py-4 max-w-6xl mx-auto">
        <EmptyState
          icon={<AlertCircle className="w-10 h-10" />}
          title={t('noResults')}
        />
      </div>
    );
  }

  // Get all listings for this business
  const bizListings = listings.filter((l) => l.businessId === biz.id);
  
  // Filter listings
  const filteredListings = bizListings
    .filter((l) => filterStatus === 'all' || l.status === filterStatus)
    .filter((l) => {
      const query = searchQuery.toLowerCase();
      return (
        (lang === 'ar' ? l.titleAr : l.title).toLowerCase().includes(query) ||
        l.ref.toLowerCase().includes(query)
      );
    });

  const stats = {
    total: bizListings.length,
    active: bizListings.filter((l) => l.status === 'published').length,
    pending: bizListings.filter((l) => l.status === 'underReview').length,
    views: bizListings.reduce((sum, l) => sum + l.views, 0),
  };

  const handleDeleteListing = () => {
    if (selectedListing) {
      showToast(t('deletedSuccessfully'), 'success');
      setShowDeleteModal(false);
      setSelectedListing(null);
    }
  };

  const handleCloneListing = (listing: any) => {
    showToast(lang === 'ar' ? 'تم نسخ الإعلان' : 'Listing cloned', 'success');
  };

  const handleRenewListing = (listing: any) => {
    showToast(lang === 'ar' ? 'تم تجديد الإعلان' : 'Listing renewed', 'success');
  };

  const handlePromoteListing = (listing: any) => {
    showToast(t('featureComingSoon'), 'info');
  };

  const handleEditListing = (listing: any) => {
    setEditingListing({ ...listing });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    showToast(t('successState'), 'success');
    setShowEditModal(false);
    setEditingListing(null);
  };

  const handleArchiveListing = (listing: any) => {
    showToast(lang === 'ar' ? 'تم أرشفة الإعلان' : 'Listing archived', 'success');
  };

  const handleMarkSold = (listing: any) => {
    showToast(lang === 'ar' ? 'تم تعليم الإعلان كمباع' : 'Marked as sold', 'success');
  };

  const handleRepublish = (listing: any) => {
    showToast(lang === 'ar' ? 'تم إعادة نشر الإعلان' : 'Listing republished', 'success');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <BusinessSidebar 
        activeTab="listings" 
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
            <LayoutDashboard className="w-5 h-5 text-primary-600" />
          </button>
          <span className="font-bold text-primary-700">{t('listingsManagement')}</span>
        </div>

        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-800">{t('listingsManagement')}</h1>
          <p className="text-sm text-primary-400 mt-1">{lang === 'ar' ? 'إدارة جميع إعلانات نشاطك' : 'Manage all your business listings'}</p>
        </div>
        <button onClick={() => navigate(`/business/${biz.id}/add-listing`)} className="btn-primary">
          <Plus className="w-4 h-4" />{t('addListing')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-primary-700">{stats.total}</p>
          <p className="text-xs text-primary-400 mt-1">{t('total')}</p>
        </div>
        <div className="card p-4 text-center bg-gradient-to-br from-success-50 to-success-50/30 border-success-100">
          <p className="text-2xl font-bold text-success-700">{stats.active}</p>
          <p className="text-xs text-success-600 mt-1">{t('approved')}</p>
        </div>
        <div className="card p-4 text-center bg-gradient-to-br from-warning-50 to-warning-50/30 border-warning-100">
          <p className="text-2xl font-bold text-warning-700">{stats.pending}</p>
          <p className="text-xs text-warning-600 mt-1">{t('pending')}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-primary-700">{stats.views.toLocaleString()}</p>
          <p className="text-xs text-primary-400 mt-1">{t('views2')}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="card p-4 mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
          <input
            type="text"
            placeholder={lang === 'ar' ? 'ابحث عن إعلان...' : 'Search listings...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9 w-full"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {['all', 'published', 'underReview', 'sold', 'archived'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`chip text-xs whitespace-nowrap ${
                filterStatus === status ? 'chip-active' : 'chip-default'
              }`}
            >
              {status === 'all' ? t('all') : t(status as TranslationKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Table */}
      {filteredListings.length === 0 ? (
        <EmptyState
          icon={<AlertCircle className="w-10 h-10" />}
          title={t('noListings')}
          description={lang === 'ar' ? 'لم يتم العثور على إعلانات' : 'No listings found'}
          action={<button onClick={() => navigate(`/business/${biz.id}/add-listing`)} className="btn-primary text-sm">{t('addListing')}</button>}
        />
      ) : (
        <div className="space-y-3">
          {filteredListings.map((listing) => (
            <div key={listing.id} className="card p-4 flex items-center gap-4 hover:border-primary-300 transition-all group">
              {/* Image */}
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-sand-100 shrink-0">
                {listing.images[0] && (
                  <img src={listing.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-primary-800 text-sm line-clamp-1">
                    {lang === 'ar' ? listing.titleAr : listing.title}
                  </h3>
                  {listing.promoted && <span className="badge bg-accent-100 text-accent-700 text-xs">{t('promoted')}</span>}
                </div>
                <div className="flex items-center gap-3 text-xs text-primary-400 mb-2">
                  <span>{listing.ref}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />{listing.views} {t('views2')}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />{formatDate(listing.postedAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={listing.status} />
                  <span className="font-bold text-primary-600 text-sm">{formatPrice(listing.price, listing.perMonth)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => handleEditListing(listing)}
                  className="btn-sm btn-primary text-xs flex items-center gap-1"
                  title={t('edit')}
                >
                  <Edit2 className="w-3 h-3" />{t('edit')}
                </button>
                <div className="flex gap-1">
                  <button
                    onClick={() => handlePromoteListing(listing)}
                    className="p-2 rounded-lg hover:bg-accent-50 text-accent-500 transition-colors"
                    title={t('promote')}
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCloneListing(listing)}
                    className="p-2 rounded-lg hover:bg-primary-50 text-primary-500 transition-colors"
                    title={lang === 'ar' ? 'نسخ' : 'Clone'}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRenewListing(listing)}
                    className="p-2 rounded-lg hover:bg-success-50 text-success-500 transition-colors"
                    title={lang === 'ar' ? 'تجديد' : 'Renew'}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedListing(listing.id);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 rounded-lg hover:bg-error-50 text-error-500 transition-colors"
                    title={t('delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedListing(null);
        }}
        title={t('delete')}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-primary-600">
            {lang === 'ar'
              ? 'هل أنت متأكد من حذف هذا الإعلان؟ لا يمكن التراجع عن هذا الإجراء.'
              : 'Are you sure you want to delete this listing? This action cannot be undone.'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedListing(null);
              }}
              className="btn-secondary flex-1"
            >
              {t('cancel')}
            </button>
            <button onClick={handleDeleteListing} className="btn-danger flex-1">
              {t('delete')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title={t('edit')} size="md">
        {editingListing && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div>
              <label className="text-sm font-medium text-primary-600 mb-1 block">{t('title')} (EN)</label>
              <input
                type="text"
                value={editingListing.title || ''}
                onChange={(e) => setEditingListing({ ...editingListing, title: e.target.value })}
                className="input w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-primary-600 mb-1 block">{t('title')} (AR)</label>
              <input
                type="text"
                value={editingListing.titleAr || ''}
                onChange={(e) => setEditingListing({ ...editingListing, titleAr: e.target.value })}
                className="input w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-primary-600 mb-1 block">{t('description')}</label>
              <textarea
                value={editingListing.description || ''}
                onChange={(e) => setEditingListing({ ...editingListing, description: e.target.value })}
                rows={3}
                className="input w-full resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-primary-600 mb-1 block">{t('descriptionAr')}</label>
              <textarea
                value={editingListing.descriptionAr || ''}
                onChange={(e) => setEditingListing({ ...editingListing, descriptionAr: e.target.value })}
                rows={3}
                className="input w-full resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-primary-600 mb-1 block">{t('price')}</label>
                <input type="number" value={editingListing.price || ''} onChange={(e) => setEditingListing({ ...editingListing, price: parseInt(e.target.value) || 0 })} className="input w-full" />
              </div>
              <div>
                <label className="text-sm font-medium text-primary-600 mb-1 block">{t('condition')}</label>
                <select value={editingListing.condition || 'used'} onChange={(e) => setEditingListing({ ...editingListing, condition: e.target.value })} className="input w-full">
                  <option value="new">{t('new')}</option>
                  <option value="used">{t('used')}</option>
                  <option value="refurbished">{t('refurbished')}</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-primary-600 mb-1 block">{t('status')}</label>
              <select value={editingListing.status || 'published'} onChange={(e) => setEditingListing({ ...editingListing, status: e.target.value })} className="input w-full">
                <option value="draft">{t('draft')}</option>
                <option value="underReview">{t('underReview')}</option>
                <option value="published">{t('published')}</option>
                <option value="sold">{t('sold')}</option>
                <option value="archived">{t('archived')}</option>
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editingListing.negotiable || false} onChange={(e) => setEditingListing({ ...editingListing, negotiable: e.target.checked })} className="accent-primary-600 w-4 h-4" />
              <span className="text-sm text-primary-600">{t('negotiable')}</span>
            </label>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowEditModal(false)} className="btn-secondary flex-1">
                {t('cancel')}
              </button>
              <button onClick={handleSaveEdit} className="btn-primary flex-1">
                <Save className="w-4 h-4" />{t('save')}
              </button>
            </div>
          </div>
        )}
      </Modal>
        </div>
      </div>
    </div>
  );
}
