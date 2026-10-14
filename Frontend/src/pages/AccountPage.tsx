import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import type { TranslationKey } from '@/i18n/translations';
import { useApp } from '@/context/AppContext';
import { useRouter, Link } from '@/router/Router';
import { ListingCardGrid } from '@/components/ListingCard';
import { EmptyState, StatusBadge, Modal, RatingStars } from '@/components/ui';
import { listings, sampleNotifications, jobs } from '@/data/mockData';
import {
  User, Heart, Search, Eye, Bell, Briefcase, CreditCard, Shield,
  Settings, LogOut, MapPin, Globe, Gauge, Check, Smartphone, Laptop,
  Clock, FileText, Download, Trash2, Star, MessageSquare, Plus,
} from 'lucide-react';

const TABS = [
  { id: 'overview', icon: User },
  { id: 'profile', icon: User },
  { id: 'my-listings', icon: FileText },
  { id: 'favorites', icon: Heart },
  { id: 'saved-searches', icon: Search },
  { id: 'recently-viewed', icon: Eye },
  { id: 'messages', icon: MessageSquare },
  { id: 'notifications', icon: Bell },
  { id: 'job-applications', icon: Briefcase },
  { id: 'payments', icon: CreditCard },
  { id: 'security', icon: Shield },
  { id: 'settings', icon: Settings },
];

export function AccountPage() {
  const { t, lang, formatDate, formatPrice } = useI18n();
  const { path, navigate } = useRouter();
  const { favorites, myListings, recentlyViewed, savedSearches, removeSavedSearch, appliedJobs, savedJobs, toggleSavedJob, showToast, dataSaver, setDataSaver } = useApp();

  const tabId = path.split('/')[2] || 'overview';
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [listingFilter, setListingFilter] = useState('all');

  const myListingItems = listings.filter((l) => myListings.includes(l.id));
  const filteredMyListings = listingFilter === 'all' ? myListingItems : myListingItems.filter((l) => l.status === listingFilter);
  const favListings = listings.filter((l) => favorites.includes(l.id));
  const recentListings = listings.filter((l) => recentlyViewed.includes(l.id));
  const appliedJobsData = appliedJobs.map((a) => ({ ...a, job: jobs.find((j) => j.id === a.jobId) })).filter((a) => a.job) as ({ jobId: string; status: string; date: string; job: typeof jobs[0] })[];

  const SidebarLink = ({ tab }: { tab: typeof TABS[0] }) => {
    const Icon = tab.icon;
    return (
      <button
        onClick={() => navigate(`/account/${tab.id}`)}
        className={`nav-link w-full ${tabId === tab.id ? 'nav-link-active' : ''}`}
      >
        <Icon className="w-4 h-4" />
        {t(tab.id as TranslationKey)}
      </button>
    );
  };

  return (
    <div className="py-4 max-w-6xl mx-auto">
      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="card p-3 sticky top-20">
            <div className="flex items-center gap-3 p-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-bold text-primary-700 text-sm">Demo User</p>
                <p className="text-xs text-primary-400">{t('demoLabel')}</p>
              </div>
            </div>
            <div className="space-y-1">
              {TABS.map((tab) => <SidebarLink key={tab.id} tab={tab} />)}
            </div>
          </div>
        </aside>

        {/* Mobile tab selector */}
        <div className="md:hidden mb-4">
          <select value={tabId} onChange={(e) => navigate(`/account/${e.target.value}`)} className="input">
            {TABS.map((tab) => <option key={tab.id} value={tab.id}>{t(tab.id as TranslationKey)}</option>)}
          </select>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {tabId === 'overview' && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-primary-800">{t('overview')}</h1>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="card p-4">
                  <FileText className="w-5 h-5 text-primary-400 mb-2" />
                  <p className="text-2xl font-bold text-primary-700">{myListings.length}</p>
                  <p className="text-xs text-primary-400">{t('myListings')}</p>
                </div>
                <div className="card p-4">
                  <Heart className="w-5 h-5 text-error-400 mb-2" />
                  <p className="text-2xl font-bold text-primary-700">{favorites.length}</p>
                  <p className="text-xs text-primary-400">{t('favorites')}</p>
                </div>
                <div className="card p-4">
                  <Briefcase className="w-5 h-5 text-primary-400 mb-2" />
                  <p className="text-2xl font-bold text-primary-700">{appliedJobs.length}</p>
                  <p className="text-xs text-primary-400">{t('jobApplications')}</p>
                </div>
                <div className="card p-4">
                  <Eye className="w-5 h-5 text-primary-400 mb-2" />
                  <p className="text-2xl font-bold text-primary-700">{recentlyViewed.length}</p>
                  <p className="text-xs text-primary-400">{t('recentlyViewed')}</p>
                </div>
              </div>
              <div className="card p-4">
                <h3 className="font-bold text-primary-700 mb-3">{t('recentlyViewed')}</h3>
                {recentListings.length > 0 ? (
                  <div className="flex gap-3 overflow-x-auto no-scrollbar">
                    {recentListings.slice(0, 5).map((l) => (
                      <Link key={l.id} to={`/listing/${l.id}`} className="min-w-[160px]">
                        <div className="card overflow-hidden">
                          <div className="aspect-[4/3] bg-sand-100">
                            {l.images[0] && <img src={l.images[0]} alt="" className="w-full h-full object-cover" loading="lazy" />}
                          </div>
                          <div className="p-2">
                            <p className="text-xs font-medium text-primary-700 line-clamp-1">{lang === 'ar' ? l.titleAr : l.title}</p>
                            <p className="text-xs font-bold text-primary-600">{formatPrice(l.price)}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-primary-400">{t('noRecentlyViewed')}</p>
                )}
              </div>
            </div>
          )}

          {tabId === 'profile' && (
            <div className="card p-6 max-w-2xl">
              <h1 className="text-xl font-bold text-primary-800 mb-4">{t('profile')}</h1>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="w-10 h-10 text-primary-500" />
                </div>
                <div>
                  <h2 className="font-bold text-primary-700">Demo User</h2>
                  <p className="text-sm text-primary-400">demo@marbou.sd</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-primary-600 mb-1.5 block">{t('contactDetails')}</label>
                  <input className="input" defaultValue="Demo User" />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary-600 mb-1.5 block">Email</label>
                  <input className="input" defaultValue="demo@marbou.sd" />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary-600 mb-1.5 block">{t('call')}</label>
                  <input className="input" defaultValue="+249 91 234 5678" />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary-600 mb-1.5 block">{t('location')}</label>
                  <select className="input">
                    <option>Khartoum - Al-Riyadh</option>
                    <option>Omdurman - Al-Thawra</option>
                  </select>
                </div>
                <button onClick={() => showToast(t('successState'), 'success')} className="btn-primary">{t('save')}</button>
              </div>
            </div>
          )}

          {tabId === 'my-listings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-primary-800">{t('myListings')}</h1>
                <Link to="/add-listing" className="btn-primary text-sm"><Plus className="w-4 h-4" />{t('addListing')}</Link>
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {['all', 'published', 'underReview', 'sold', 'draft'].map((s) => (
                  <button key={s} onClick={() => setListingFilter(s)} className={listingFilter === s ? 'chip-active' : 'chip-default'}>
                    {s === 'all' ? t('all') : t(s as TranslationKey)}
                  </button>
                ))}
              </div>
              {filteredMyListings.length === 0 ? (
                <EmptyState icon={<FileText className="w-10 h-10" />} title={t('noListings')} action={<Link to="/add-listing" className="btn-primary text-sm">{t('addFirstListing')}</Link>} />
              ) : (
                <div className="space-y-3">
                  {filteredMyListings.map((l) => (
                    <div key={l.id} className="card p-3 flex items-center gap-3">
                      <Link to={`/listing/${l.id}`} className="w-20 h-20 rounded-xl overflow-hidden bg-sand-100 shrink-0">
                        {l.images[0] && <img src={l.images[0]} alt="" className="w-full h-full object-cover" />}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/listing/${l.id}`} className="font-bold text-primary-700 text-sm hover:text-primary-500 line-clamp-1">{lang === 'ar' ? l.titleAr : l.title}</Link>
                        <p className="text-sm font-bold text-primary-600">{formatPrice(l.price, l.perMonth)}</p>
                        <div className="mt-1"><StatusBadge status={l.status} /></div>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <button onClick={() => showToast(t('edit'), 'info')} className="text-xs text-primary-500 hover:text-primary-700 px-2 py-1 rounded hover:bg-primary-50">{t('edit')}</button>
                        <button onClick={() => showToast(t('clone'), 'info')} className="text-xs text-primary-500 hover:text-primary-700 px-2 py-1 rounded hover:bg-primary-50">{t('clone')}</button>
                        <button onClick={() => showToast(t('renew'), 'info')} className="text-xs text-primary-500 hover:text-primary-700 px-2 py-1 rounded hover:bg-primary-50">{t('renew')}</button>
                        <button onClick={() => showToast(t('archive'), 'info')} className="text-xs text-primary-500 hover:text-primary-700 px-2 py-1 rounded hover:bg-primary-50">{t('archive')}</button>
                        <button onClick={() => showToast(t('delete'), 'error')} className="text-xs text-error-500 hover:text-error-600 px-2 py-1 rounded hover:bg-error-50">{t('delete')}</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tabId === 'favorites' && (
            <div>
              <h1 className="text-xl font-bold text-primary-800 mb-4">{t('favorites')}</h1>
              {favListings.length === 0 ? (
                <EmptyState icon={<Heart className="w-10 h-10" />} title={t('noFavorites')} action={<Link to="/search" className="btn-primary text-sm">{t('browseListings')}</Link>} />
              ) : <ListingCardGrid listings={favListings} />}
            </div>
          )}

          {tabId === 'saved-searches' && (
            <div>
              <h1 className="text-xl font-bold text-primary-800 mb-4">{t('savedSearches')}</h1>
              {savedSearches.length === 0 ? (
                <EmptyState icon={<Search className="w-10 h-10" />} title={t('noSearches')} />
              ) : (
                <div className="space-y-2">
                  {savedSearches.map((s) => (
                    <div key={s.id} className="card p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-primary-700 text-sm">{s.query || s.queryAr}</p>
                        <p className="text-xs text-primary-400">{t('notificationPrefs')}: {s.alerts ? 'ON' : 'OFF'}</p>
                      </div>
                      <button onClick={() => removeSavedSearch(s.id)} className="text-error-500 hover:text-error-600 p-2"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tabId === 'recently-viewed' && (
            <div>
              <h1 className="text-xl font-bold text-primary-800 mb-4">{t('recentlyViewed')}</h1>
              {recentListings.length === 0 ? (
                <EmptyState icon={<Eye className="w-10 h-10" />} title={t('noRecentlyViewed')} />
              ) : <ListingCardGrid listings={recentListings} />}
            </div>
          )}

          {tabId === 'messages' && (
            <div>
              <h1 className="text-xl font-bold text-primary-800 mb-4">{t('messages')}</h1>
              <Link to="/messages" className="btn-primary text-sm">{t('messages')}</Link>
            </div>
          )}

          {tabId === 'notifications' && (
            <div>
              <h1 className="text-xl font-bold text-primary-800 mb-4">{t('notifications')}</h1>
              <div className="space-y-2">
                {sampleNotifications.map((n) => (
                  <div key={n.id} className={`card p-3 flex items-start gap-3 ${!n.read ? 'border-primary-200 bg-primary-50/30' : ''}`}>
                    <div className="w-10 h-10 rounded-full bg-sand-100 flex items-center justify-center shrink-0">
                      {n.type === 'message' && <MessageSquare className="w-5 h-5 text-primary-400" />}
                      {n.type === 'offer' && <Star className="w-5 h-5 text-accent-400" />}
                      {n.type === 'listing' && <FileText className="w-5 h-5 text-primary-400" />}
                      {n.type === 'review' && <Star className="w-5 h-5 text-primary-400" />}
                      {n.type === 'system' && <Bell className="w-5 h-5 text-primary-400" />}
                      {n.type === 'job' && <Briefcase className="w-5 h-5 text-primary-400" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-primary-700 text-sm">{lang === 'ar' ? n.titleAr : n.title}</p>
                      <p className="text-sm text-primary-500">{lang === 'ar' ? n.textAr : n.text}</p>
                      <p className="text-xs text-primary-300 mt-1">{formatDate(n.time)}</p>
                    </div>
                    {!n.read && <div className="w-2 h-2 bg-accent-500 rounded-full mt-1 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tabId === 'job-applications' && (
            <div>
              <h1 className="text-xl font-bold text-primary-800 mb-4">{t('jobApplications')}</h1>
              {appliedJobsData.length === 0 ? (
                <EmptyState icon={<Briefcase className="w-10 h-10" />} title={t('noApplications')} action={<Link to="/jobs" className="btn-primary text-sm">{t('jobs')}</Link>} />
              ) : (
                <div className="space-y-3">
                  {appliedJobsData.map((a) => (
                    <div key={a.jobId} className="card p-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-sand-100 overflow-hidden">
                        <img src={a.job.logo} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <Link to={`/jobs/${a.job.id}`} className="font-bold text-primary-700 text-sm hover:text-primary-500">{lang === 'ar' ? a.job.titleAr : a.job.title}</Link>
                        <p className="text-xs text-primary-400">{lang === 'ar' ? a.job.companyAr : a.job.company}</p>
                      </div>
                      <StatusBadge status={a.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tabId === 'payments' && (
            <div>
              <h1 className="text-xl font-bold text-primary-800 mb-4">{t('paymentsSubs')}</h1>
              <div className="card p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-primary-700">{t('planName')}</h3>
                  <span className="badge bg-primary-100 text-primary-700">{t('demoLabel')}</span>
                </div>
                <p className="text-sm text-primary-400">Free Plan</p>
              </div>
              <div className="card p-4">
                <h3 className="font-bold text-primary-700 mb-3">{t('billingHistory')}</h3>
                <EmptyState icon={<CreditCard className="w-10 h-10" />} title={t('noPayments')} />
              </div>
            </div>
          )}

          {tabId === 'security' && (
            <div className="max-w-2xl space-y-4">
              <h1 className="text-xl font-bold text-primary-800">{t('securityCenter')}</h1>
              <div className="card p-4">
                <h3 className="font-bold text-primary-700 mb-3 flex items-center gap-2"><Shield className="w-4 h-4" />{t('password')}</h3>
                <input type="password" className="input mb-2" placeholder="Current password" />
                <input type="password" className="input mb-2" placeholder="New password" />
                <button onClick={() => showToast(t('successState'), 'success')} className="btn-primary text-sm">{t('save')}</button>
              </div>
              <div className="card p-4">
                <h3 className="font-bold text-primary-700 mb-3">{t('twoFactor')}</h3>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-primary-600">{t('twoFactor')}</span>
                  <button onClick={(e) => { e.preventDefault(); showToast(t('demoLabel'), 'info'); }} className="w-10 h-5 rounded-full bg-sand-200">
                    <span className="block w-4 h-4 bg-white rounded-full shadow translate-x-0.5 rtl:-translate-x-0.5" />
                  </button>
                </label>
              </div>
              <div className="card p-4">
                <h3 className="font-bold text-primary-700 mb-3">{t('devices')}</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-sand-50">
                    <Smartphone className="w-5 h-5 text-primary-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary-700">iPhone 14 Pro</p>
                      <p className="text-xs text-primary-400">Khartoum · Active now</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-sand-50">
                    <Laptop className="w-5 h-5 text-primary-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary-700">MacBook Pro</p>
                      <p className="text-xs text-primary-400">Khartoum · 2h ago</p>
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={() => showToast(t('demoLabel'), 'info')} className="btn-danger w-full">{t('logoutAll')}</button>
            </div>
          )}

          {tabId === 'settings' && (
            <div className="max-w-2xl space-y-4">
              <h1 className="text-xl font-bold text-primary-800">{t('settings')}</h1>
              <div className="card p-4">
                <h3 className="font-bold text-primary-700 mb-3">{t('languageSetting')}</h3>
                <Link to="/" className="btn-secondary text-sm">{t('language')}</Link>
              </div>
              <div className="card p-4">
                <h3 className="font-bold text-primary-700 mb-3">{t('dataSaver')}</h3>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-primary-600 flex items-center gap-2"><Gauge className="w-4 h-4" />{t('dataSaver')}</span>
                  <button onClick={(e) => { e.preventDefault(); setDataSaver(!dataSaver); }} className={`w-10 h-5 rounded-full transition-colors ${dataSaver ? 'bg-primary-500' : 'bg-sand-200'}`}>
                    <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform ${dataSaver ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0.5 rtl:-translate-x-0.5'}`} />
                  </button>
                </label>
                <p className="text-xs text-primary-400 mt-2">{dataSaver ? t('dataSaverOn') : t('dataSaverOff')}</p>
              </div>
              <div className="card p-4">
                <h3 className="font-bold text-primary-700 mb-3">{t('notificationPrefs')}</h3>
                {['Email', 'Push', 'SMS'].map((n) => (
                  <label key={n} className="flex items-center justify-between py-2">
                    <span className="text-sm text-primary-600">{n}</span>
                    <button onClick={(e) => { e.preventDefault(); }} className="w-10 h-5 rounded-full bg-sand-200">
                      <span className="block w-4 h-4 bg-white rounded-full shadow translate-x-0.5 rtl:-translate-x-0.5" />
                    </button>
                  </label>
                ))}
              </div>
              <div className="card p-4">
                <h3 className="font-bold text-primary-700 mb-3">{t('accountDeletion')}</h3>
                <button onClick={() => setShowDeleteModal(true)} className="btn-danger text-sm"><Trash2 className="w-4 h-4" />{t('accountDeletion')}</button>
              </div>
              <div className="card p-4">
                <h3 className="font-bold text-primary-700 mb-3">{t('dataExport')}</h3>
                <button onClick={() => setShowExportModal(true)} className="btn-secondary text-sm"><Download className="w-4 h-4" />{t('dataExport')}</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete modal */}
      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title={t('accountDeletion')} size="sm">
        <div className="space-y-4">
          <p className="text-sm text-primary-600">
            {lang === 'ar' ? 'هذا نموذج تفاعلي. لن يتم حذف بياناتك فعلياً. سيتم حذف حسابك في النظام المستقبلي.' : 'This is an interactive prototype. Your data will not actually be deleted. Account deletion will happen in the future system.'}
          </p>
          <button onClick={() => { setShowDeleteModal(false); showToast(t('demoLabel'), 'info'); }} className="btn-danger w-full">{t('confirm')}</button>
        </div>
      </Modal>

      {/* Export modal */}
      <Modal open={showExportModal} onClose={() => setShowExportModal(false)} title={t('dataExport')} size="sm">
        <div className="space-y-4">
          <p className="text-sm text-primary-600">
            {lang === 'ar' ? 'سيتم إنشاء ملف بياناتك في النظام المستقبلي. هذا نموذج تفاعلي فقط.' : 'Your data export file will be generated in the future system. This is a prototype only.'}
          </p>
          <button onClick={() => { setShowExportModal(false); showToast(t('demoLabel'), 'info'); }} className="btn-primary w-full">{t('confirm')}</button>
        </div>
      </Modal>
    </div>
  );
}
