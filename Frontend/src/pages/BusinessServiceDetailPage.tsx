import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useRouter } from '@/router/Router';
import { useAuth } from '@/context/AuthContext';
import { businesses } from '@/data/mockData';
import { BusinessSidebar } from '@/components/BusinessSidebar';
import { Modal, EmptyState } from '@/components/ui';
import {
  ChevronLeft, ChevronRight, Plus, Save, AlertCircle,
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

const SERVICE_CATEGORIES = [
  { id: 'construction', key: 'construction' },
  { id: 'electrical', key: 'electrical' },
  { id: 'plumbing', key: 'plumbing' },
  { id: 'painting', key: 'painting' },
  { id: 'ac', key: 'ac' },
  { id: 'carpentry', key: 'carpentry' },
  { id: 'maintenance', key: 'maintenance' },
  { id: 'cleaning', key: 'cleaning' },
  { id: 'mechanic', key: 'mechanic' },
];

export function BusinessServiceDetailPage() {
  const { t, lang, formatPrice } = useI18n();
  const { path, navigate } = useRouter();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [serviceName, setServiceName] = useState('');
  const [serviceNameAr, setServiceNameAr] = useState('');
  const [category, setCategory] = useState('plumbing');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [price, setPrice] = useState('');
  const [coverage, setCoverage] = useState('');
  const [coverageAr, setCoverageAr] = useState('');

  const bizId = path.split('/')[2];
  const biz = bizId ? businesses.find((b) => b.id === bizId) : businesses[0];

  if (!biz) {
    return (
      <div className="py-4 max-w-2xl mx-auto">
        <EmptyState
          icon={<AlertCircle className="w-10 h-10" />}
          title={t('noResults')}
        />
      </div>
    );
  }

  const SidebarLink = ({ tab }: { tab: any }) => {
    const Icon = tab.icon;
    return (
      <button
        onClick={() => {
          if (tab.id === 'services') {
            navigate(`/business/${biz.id}/services`);
          } else if (tab.id === 'listings') {
            navigate(`/business/${biz.id}/listings`);
          } else {
            navigate(`/business/${tab.id}`);
          }
          setSidebarOpen(false);
        }}
        className={`nav-link w-full ${path.includes('add-service') && tab.id === 'services' ? 'nav-link-active' : ''}`}
      >
        <Icon className="w-4 h-4" />{t(tab.key)}
      </button>
    );
  };

  const completeness = Math.round(
    ((serviceName ? 1 : 0) + (category ? 1 : 0) + (description ? 1 : 0) + (price ? 1 : 0) + (coverage ? 1 : 0)) / 5 * 100
  );

  const Arrow = lang === 'ar' ? ChevronLeft : ChevronRight;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <BusinessSidebar 
        activeTab="services" 
        business={biz} 
        sidebarOpen={sidebarOpen} 
        onCloseSidebar={() => setSidebarOpen(false)} 
      />

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-primary-950/30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="py-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4 px-4">
            <h1 className="text-xl font-bold text-primary-800">{lang === 'ar' ? 'أضف خدمة جديدة' : 'Add New Service'}</h1>
          </div>

          {/* Completeness bar */}
          <div className="card p-3 mb-4 mx-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-primary-500">{t('completenessScore')}</span>
              <span className="text-xs font-bold text-primary-700">{Math.round(completeness)}%</span>
            </div>
            <div className="h-2 bg-sand-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-300" style={{ width: `${completeness}%` }} />
            </div>
            {completeness < 100 && (
              <div className="mt-2 space-y-0.5">
                {!serviceName && <p className="text-[11px] text-primary-400">{lang === 'ar' ? 'أضف اسم الخدمة' : 'Add service name'}</p>}
                {!description && <p className="text-[11px] text-primary-400">{lang === 'ar' ? 'أضف وصف الخدمة' : 'Add service description'}</p>}
                {!price && <p className="text-[11px] text-primary-400">{lang === 'ar' ? 'أضف السعر' : 'Add price'}</p>}
                {!coverage && <p className="text-[11px] text-primary-400">{lang === 'ar' ? 'أضف نطاق التغطية' : 'Add coverage area'}</p>}
              </div>
            )}
          </div>

          <div className="card p-5 sm:p-6 mx-4">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-primary-800">{lang === 'ar' ? 'تفاصيل الخدمة' : 'Service Details'}</h2>
              
              <div>
                <label className="text-sm font-medium text-primary-600 mb-1.5 block">{lang === 'ar' ? 'اسم الخدمة' : 'Service Name'} (English)</label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="input"
                  placeholder={lang === 'ar' ? 'اسم الخدمة' : 'Service name'}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-primary-600 mb-1.5 block">{lang === 'ar' ? 'اسم الخدمة' : 'Service Name'} (Arabic)</label>
                <input
                  type="text"
                  value={serviceNameAr}
                  onChange={(e) => setServiceNameAr(e.target.value)}
                  className="input"
                  placeholder={lang === 'ar' ? 'Service name' : 'اسم الخدمة'}
                  dir="rtl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-primary-600 mb-1.5 block">{lang === 'ar' ? 'الفئة' : 'Category'}</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
                    {SERVICE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>{t(cat.key as TranslationKey)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary-600 mb-1.5 block">{t('price')} (SDG)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="input"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-primary-600 mb-1.5 block">{t('description')}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="input resize-none"
                  placeholder={lang === 'ar' ? 'صف الخدمة بالتفصيل...' : 'Describe the service in detail...'}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-primary-600 mb-1.5 block">{lang === 'ar' ? 'الوصف (العربية)' : 'Description (Arabic)'}</label>
                <textarea
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  rows={4}
                  className="input resize-none"
                  placeholder={lang === 'ar' ? 'Describe the service in detail...' : 'صف الخدمة بالتفصيل...'}
                  dir="rtl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-primary-600 mb-1.5 block">{lang === 'ar' ? 'نطاق التغطية' : 'Coverage Area'} (EN)</label>
                  <input
                    type="text"
                    value={coverage}
                    onChange={(e) => setCoverage(e.target.value)}
                    className="input"
                    placeholder={lang === 'ar' ? 'المنطقة' : 'Area'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary-600 mb-1.5 block">{lang === 'ar' ? 'نطاق التغطية' : 'Coverage Area'} (AR)</label>
                  <input
                    type="text"
                    value={coverageAr}
                    onChange={(e) => setCoverageAr(e.target.value)}
                    className="input"
                    placeholder={lang === 'ar' ? 'Area' : 'المنطقة'}
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button onClick={() => navigate(`/business/${biz.id}/services`)} className="btn-secondary flex-1">
                  {t('cancel')}
                </button>
                <button onClick={() => {}} className="btn-primary flex-1">
                  <Save className="w-4 h-4" />{t('publish')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
