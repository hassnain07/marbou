import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { useRouter, Link } from '@/router/Router';
import { ListingCardGrid } from '@/components/ListingCard';
import { EmptyState, RatingStars, TrustBadge, Modal } from '@/components/ui';
import { listings } from '@/data/mockData';
import {
  MapPin, Phone, MessageSquare, Share2, Flag, Ban, CheckCircle,
  Clock, FileText, Star, TrendingUp,
} from 'lucide-react';

export function SellerProfilePage() {
  const { t, lang, formatDate, formatNumber } = useI18n();
  const { path, navigate } = useRouter();
  const { showToast } = useApp();
  const [showContact, setShowContact] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const sellerName = decodeURIComponent(path.split('/')[2] || '');

  const sellerListings = listings.filter(
    (l) => (lang === 'ar' ? l.sellerNameAr : l.sellerName) === sellerName && l.status === 'published'
  );

  if (sellerListings.length === 0) {
    return <EmptyState icon={<Star className="w-10 h-10" />} title={t('noResults')} description={t('noResultsDesc')} />;
  }

  const sample = sellerListings[0];
  const sellerNameAr = sample.sellerNameAr;
  const sellerNameEn = sample.sellerName;
  const displayName = lang === 'ar' ? sellerNameAr : sellerNameEn;
  const city = lang === 'ar' ? sample.cityAr : sample.city;
  const area = lang === 'ar' ? sample.areaAr : sample.area;
  const verified = sample.sellerVerified;
  const rating = sample.sellerRating;
  const avatar = sample.sellerAvatar;
  const totalViews = sellerListings.reduce((sum, l) => sum + l.views, 0);
  const avgPrice = Math.round(sellerListings.reduce((sum, l) => sum + l.price, 0) / sellerListings.length);

  return (
    <div className="py-4 pb-20 md:pb-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-sm text-primary-400 mb-4">
        <button onClick={() => navigate('/')} className="hover:text-primary-600">{t('home')}</button>
        <span className="text-sand-300">/</span>
        <span className="text-primary-600 font-medium">{displayName}</span>
      </div>

      {/* Profile header */}
      <div className="card p-6 mb-4">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-20 h-20 rounded-2xl bg-sand-100 overflow-hidden shrink-0">
            <img src={avatar} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-primary-800">{displayName}</h1>
              {verified && <CheckCircle className="w-5 h-5 text-primary-500" />}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <RatingStars rating={rating} size="md" />
              <span className="text-sm font-medium text-primary-600">{rating}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-primary-400">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{city} - {area}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{t('memberSince')} 2021</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowContact(true)} className="btn-primary text-sm">
            <Phone className="w-4 h-4" />{t('call')}
          </button>
          <Link to="/messages" className="btn-secondary text-sm justify-center">
            <MessageSquare className="w-4 h-4" />{t('message')}
          </Link>
          <button onClick={() => showToast(lang === 'ar' ? 'تم نسخ الرابط' : 'Link copied', 'success')} className="btn-secondary text-sm">
            <Share2 className="w-4 h-4" />{t('share')}
          </button>
          <button onClick={() => setShowReport(true)} className="btn-secondary text-sm">
            <Flag className="w-4 h-4" />{t('report')}
          </button>
          <button onClick={() => showToast(lang === 'ar' ? 'تم حظر المستخدم' : 'User blocked', 'info')} className="btn text-sm text-error-500 border border-error-200 hover:bg-error-50 px-4 py-2">
            <Ban className="w-4 h-4" />{t('block')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="card p-4 text-center">
          <FileText className="w-5 h-5 text-primary-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-primary-700">{sellerListings.length}</p>
          <p className="text-xs text-primary-400">{t('listingsCount')}</p>
        </div>
        <div className="card p-4 text-center">
          <Star className="w-5 h-5 text-accent-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-primary-700">{rating}</p>
          <p className="text-xs text-primary-400">{t('rating')}</p>
        </div>
        <div className="card p-4 text-center">
          <TrendingUp className="w-5 h-5 text-primary-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-primary-700">{formatNumber(totalViews)}</p>
          <p className="text-xs text-primary-400">{t('views')}</p>
        </div>
        <div className="card p-4 text-center">
          <CheckCircle className="w-5 h-5 text-primary-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-primary-700">{verified ? '100%' : '0%'}</p>
          <p className="text-xs text-primary-400">{t('verified')}</p>
        </div>
      </div>

      {/* Trust indicators */}
      <div className="card p-4 mb-4">
        <h3 className="font-bold text-primary-700 mb-3">{t('trustIndicators')}</h3>
        <div className="flex flex-wrap gap-2">
          {verified && <TrustBadge type="verified" />}
          {rating >= 4.5 && <TrustBadge type="topRated" />}
          <TrustBadge type="responsive" />
        </div>
      </div>

      {/* Seller's listings */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-primary-800 mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-primary-600 rounded-full" />{t('otherListings')}
        </h2>
        {sellerListings.length > 0 ? (
          <ListingCardGrid listings={sellerListings} />
        ) : (
          <EmptyState icon={<FileText className="w-10 h-10" />} title={t('noListings')} />
        )}
      </div>

      {/* Contact modal */}
      <Modal open={showContact} onClose={() => setShowContact(false)} title={t('contactPreview')} size="sm">
        <div className="space-y-4">
          <div className="bg-sand-50 rounded-xl p-4 text-center">
            <p className="text-xs text-primary-400 mb-1">{t('fictionalAccount')}</p>
            <p className="text-lg font-bold text-primary-700">+249 91 234 5678</p>
          </div>
          <div className="flex gap-2">
            <a href="tel:+249912345678" className="btn-primary flex-1 justify-center text-sm">
              <Phone className="w-4 h-4" />{t('call')}
            </a>
            <button onClick={() => { setShowContact(false); navigate('/messages'); }} className="btn-secondary flex-1 justify-center text-sm">
              <MessageSquare className="w-4 h-4" />{t('message')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Report modal */}
      <Modal open={showReport} onClose={() => setShowReport(false)} title={t('report')} size="sm">
        <div className="space-y-3">
          {['Fraud or scam', 'Fake listing', 'Inappropriate behavior', 'Spam', 'Other'].map((reason, i) => (
            <label key={i} className="flex items-center gap-3 p-3 rounded-xl border border-sand-100 hover:bg-sand-50 cursor-pointer">
              <input type="radio" name="report-seller" className="accent-primary-600" defaultChecked={i === 0} />
              <span className="text-sm text-primary-700">{lang === 'ar' ? ['احتيال', 'إعلان وهمي', 'سلوك غير لائق', 'إزعاج', 'أخرى'][i] : reason}</span>
            </label>
          ))}
          <button onClick={() => { setShowReport(false); showToast(t('reportSubmitted'), 'success'); }} className="btn-danger w-full">{t('report')}</button>
        </div>
      </Modal>
    </div>
  );
}
