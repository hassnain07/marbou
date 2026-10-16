import { useState, ReactNode } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp, useFlags } from '@/context/AppContext';
import { useRouter, Link } from '@/router/Router';
import { EmptyState, StatusBadge, Modal, RatingStars, ComingSoon } from '@/components/ui';
import { listings, businesses, sampleReviews } from '@/data/mockData';
import {
  LayoutDashboard, FileText, Wrench, Briefcase, MessageSquare, Store,
  Users, Shield, Star, CreditCard, Activity, Plus, Eye, TrendingUp,
  BarChart3, Clock, Check, X, Upload, Image, ChevronLeft, ChevronRight,
  Phone, MapPin, Save, FileCheck, AlertCircle,
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

function MetricCard({ icon, label, value, trend }: { icon: ReactNode; label: string; value: string; trend?: string }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-500">{icon}</div>
        {trend && <span className="text-xs text-success-500 flex items-center gap-0.5"><TrendingUp className="w-3 h-3" />{trend}</span>}
      </div>
      <p className="text-2xl font-bold text-primary-700">{value}</p>
      <p className="text-xs text-primary-400">{label}</p>
    </div>
  );
}

function SimpleBarChart({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end justify-between gap-2 h-32">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full bg-primary-100 rounded-t-lg flex items-end" style={{ height: `${(v / max) * 100}%` }}>
            <div className="w-full bg-primary-500 rounded-t-lg transition-all" style={{ height: '100%' }} />
          </div>
          <span className="text-[10px] text-primary-300">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export function BusinessDashboard() {
  const { t, lang, formatPrice, formatDate, formatNumber } = useI18n();
  const { path, navigate } = useRouter();
  const { showToast } = useApp();
  const { flags } = useFlags();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showBankak, setShowBankak] = useState(false);
  const [bankakStep, setBankakStep] = useState(0);
  const [bankakService, setBankakService] = useState('');
  const [bankakRef, setBankakRef] = useState('');
  const [bankakReceipt, setBankakReceipt] = useState(false);

  const tabId = path.split('/')[2] || 'overview';
  const biz = businesses[0];

  // Filter out plan tab if monetization is disabled
  const visibleBizTabs = BIZ_TABS.filter((tab) => !(tab.id === 'plan' && !flags?.monetizationEnabled));

  const SidebarLink = ({ tab }: { tab: typeof BIZ_TABS[0] }) => {
    const Icon = tab.icon;
    return (
      <button
        onClick={() => { navigate(`/business/${tab.id}`); setSidebarOpen(false); }}
        className={`nav-link w-full ${tabId === tab.id ? 'nav-link-active' : ''}`}
      >
        <Icon className="w-4 h-4" />{t(tab.key)}
      </button>
    );
  };

  const bizListings = listings.filter((l) => l.businessId === biz.id);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 inset-y-0 start-0 z-40 w-60 bg-white border-e border-sand-100 transition-transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'}`} style={{ height: '100vh' }}>
        <div className="p-4 border-b border-sand-100">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-5 h-5">
                <path d="M28 70 L28 30 L50 30 L50 70" stroke="#fdfbf7" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="72" cy="50" r="14" stroke="#f97e16" strokeWidth="6" fill="none" />
                <circle cx="72" cy="50" r="4" fill="#fdfbf7" />
              </svg>
            </div>
            <span className="font-bold text-primary-700">{t('brandName')}</span>
          </Link>
        </div>
        <div className="p-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
          <div className="flex items-center gap-2 p-2 mb-2 bg-sand-50 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-sand-100 overflow-hidden">
              <img src={biz.logo} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-primary-700 truncate">{lang === 'ar' ? biz.nameAr : biz.name}</p>
              <p className="text-[10px] text-primary-400">{t('demoLabel')}</p>
            </div>
          </div>
          <div className="space-y-1">
            {visibleBizTabs.map((tab) => <SidebarLink key={tab.id} tab={tab} />)}
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-primary-950/30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-sand-100 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-sand-50">
            <LayoutDashboard className="w-5 h-5 text-primary-600" />
          </button>
          <span className="font-bold text-primary-700">{t(tabId as TranslationKey) || t('businessOverview')}</span>
        </div>

        <div className="p-4 sm:p-6">
          {tabId === 'overview' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-primary-800">{t('businessOverview')}</h1>
                <p className="text-sm text-primary-400">{t('demoLabel')}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MetricCard icon={<Eye className="w-5 h-5" />} label={t('views2')} value={formatNumber(12450)} trend="+12%" />
                <MetricCard icon={<MessageSquare className="w-5 h-5" />} label={t('leads')} value={formatNumber(89)} trend="+5%" />
                <MetricCard icon={<Star className="w-5 h-5" />} label={t('favorites')} value={formatNumber(234)} trend="+8%" />
                <MetricCard icon={<FileText className="w-5 h-5" />} label={t('listingsCount')} value={formatNumber(bizListings.length)} />
              </div>
              <div className="card p-4">
                <h3 className="font-bold text-primary-700 mb-4">{t('analytics')}</h3>
                <SimpleBarChart data={[30, 45, 28, 52, 38, 60, 48]} labels={['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']} />
              </div>
              <div className="card p-4">
                <h3 className="font-bold text-primary-700 mb-3">{t('activityTimeline')}</h3>
                <div className="space-y-3">
                  {[
                    { icon: <Eye className="w-4 h-4" />, text: lang === 'ar' ? 'شخص شاهد إعلانك' : 'Someone viewed your listing', time: '2h ago' },
                    { icon: <MessageSquare className="w-4 h-4" />, text: lang === 'ar' ? 'رسالة جديدة من عميل' : 'New message from a customer', time: '5h ago' },
                    { icon: <Star className="w-4 h-4" />, text: lang === 'ar' ? 'تقييم جديد 5 نجوم' : 'New 5-star review', time: '1d ago' },
                  ].map((a, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-500">{a.icon}</div>
                      <span className="text-primary-600 flex-1">{a.text}</span>
                      <span className="text-xs text-primary-300">{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tabId === 'listings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-primary-800">{t('listingsManagement')}</h1>
                <Link to="/add-listing" className="btn-primary text-sm"><Plus className="w-4 h-4" />{t('addListing')}</Link>
              </div>
              <div className="space-y-2">
                {bizListings.map((l) => (
                  <div key={l.id} className="card p-3 flex items-center gap-3">
                    <Link to={`/listing/${l.id}`} className="w-16 h-16 rounded-xl overflow-hidden bg-sand-100 shrink-0">
                      {l.images[0] && <img src={l.images[0]} alt="" className="w-full h-full object-cover" />}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/listing/${l.id}`} className="font-bold text-primary-700 text-sm hover:text-primary-500 line-clamp-1">{lang === 'ar' ? l.titleAr : l.title}</Link>
                      <p className="text-sm font-bold text-primary-600">{formatPrice(l.price, l.perMonth)}</p>
                      <StatusBadge status={l.status} />
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => showToast(t('promote'), 'info')} className="p-2 rounded-lg hover:bg-sand-50 text-accent-500" title={t('promote')}><TrendingUp className="w-4 h-4" /></button>
                      <button onClick={() => showToast(t('edit'), 'info')} className="p-2 rounded-lg hover:bg-sand-50 text-primary-500" title={t('edit')}><FileText className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tabId === 'services' && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-primary-800">{t('servicesManagement')}</h1>
              <div className="flex flex-wrap gap-2">
                {biz.services?.map((s, i) => (
                  <div key={i} className="card p-3 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-primary-400" />
                    <span className="text-sm text-primary-700">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tabId === 'jobs' && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-primary-800">{t('jobPosts')}</h1>
              <EmptyState icon={<Briefcase className="w-10 h-10" />} title={t('noJobs')} action={<button onClick={() => showToast(t('demoLabel'), 'info')} className="btn-primary text-sm">{t('postJob')}</button>} />
            </div>
          )}

          {tabId === 'messages' && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-primary-800">{t('messagesLeads')}</h1>
              <Link to="/messages" className="btn-primary text-sm">{t('messages')}</Link>
            </div>
          )}

          {tabId === 'profile' && (
            <div className="max-w-2xl space-y-4">
              <h1 className="text-xl font-bold text-primary-800">{t('storeProfile')}</h1>
              <div className="card p-4">
                <div className="relative h-32 rounded-xl bg-sand-100 overflow-hidden mb-12">
                  <img src={biz.cover} alt="" className="w-full h-full object-cover" />
                  <div className="absolute -bottom-8 start-4 w-16 h-16 rounded-xl bg-white border-2 border-white shadow overflow-hidden">
                    <img src={biz.logo} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-primary-600 mb-1 block">{t('profile')}</label>
                    <input className="input" defaultValue={lang === 'ar' ? biz.nameAr : biz.name} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-primary-600 mb-1 block">{t('description')}</label>
                    <textarea className="input resize-none" rows={3} defaultValue={lang === 'ar' ? biz.descriptionAr : biz.description} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-primary-600 mb-1 block">{t('call')}</label>
                    <input className="input" defaultValue={biz.phone} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-primary-600 mb-1 block">{t('location')}</label>
                    <input className="input" defaultValue={`${biz.city} - ${biz.area}`} />
                  </div>
                  <button onClick={() => showToast(t('successState'), 'success')} className="btn-primary"><Save className="w-4 h-4" />{t('save')}</button>
                </div>
              </div>
            </div>
          )}

          {tabId === 'staff' && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-primary-800">{t('staffDirectory')}</h1>
              <div className="grid sm:grid-cols-2 gap-3">
                {biz.staff?.map((s, i) => (
                  <div key={i} className="card p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-sand-100 overflow-hidden">
                      <img src={s.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-primary-700 text-sm">{lang === 'ar' ? s.nameAr : s.name}</p>
                      <p className="text-xs text-primary-400">{lang === 'ar' ? s.roleAr : s.role}</p>
                    </div>
                    <span className="badge bg-primary-50 text-primary-600">{t('permissions')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tabId === 'verification' && (
            <div className="max-w-2xl space-y-4">
              <h1 className="text-xl font-bold text-primary-800">{t('verification')}</h1>
              <div className="card p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-success-50 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-success-500" />
                  </div>
                  <div>
                    <p className="font-bold text-primary-700">{t('approved')}</p>
                    <p className="text-xs text-primary-400">{t('demoLabel')}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {['Commercial Registration', 'Tax Certificate', 'Business License'].map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-sand-50 rounded-xl">
                      <FileCheck className="w-5 h-5 text-success-500" />
                      <span className="text-sm text-primary-600 flex-1">{doc}</span>
                      <span className="badge bg-success-100 text-success-700">{t('approved')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tabId === 'reviews' && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-primary-800">{t('reviewsReplies')}</h1>
              <div className="space-y-3">
                {sampleReviews.map((rev) => (
                  <div key={rev.id} className="card p-4">
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
                        {rev.reply ? (
                          <div className="mt-2 ps-3 border-s-2 border-sand-100">
                            <p className="text-xs font-medium text-primary-500 mb-1">{t('businessReply')}</p>
                            <p className="text-sm text-primary-500">{lang === 'ar' ? rev.replyAr : rev.reply}</p>
                          </div>
                        ) : (
                          <button onClick={() => showToast(t('demoLabel'), 'info')} className="text-xs text-primary-500 hover:text-primary-700 mt-2">{t('businessReply')}</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tabId === 'plan' && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-primary-800">{t('planSubs')}</h1>
              <div className="grid sm:grid-cols-3 gap-3">
                {['Free', 'Basic', 'Premium'].map((plan, i) => (
                  <div key={plan} className={`card p-4 ${i === 1 ? 'border-primary-300 ring-2 ring-primary-100' : ''}`}>
                    <h3 className="font-bold text-primary-700">{plan}</h3>
                    <p className="text-2xl font-bold text-primary-700 mt-2">{i === 0 ? '0' : i === 1 ? '50K' : '150K'} <span className="text-sm font-normal text-primary-400">{t('egp')}/{t('perMonth')}</span></p>
                    <ul className="text-xs text-primary-500 mt-3 space-y-1">
                      <li className="flex items-center gap-1"><Check className="w-3 h-3 text-success-500" />{i * 10} {t('listingsCount')}</li>
                      <li className="flex items-center gap-1"><Check className="w-3 h-3 text-success-500" />{i >= 1 ? t('promote') : '--'}</li>
                      <li className="flex items-center gap-1"><Check className="w-3 h-3 text-success-500" />{i >= 2 ? t('analytics') : '--'}</li>
                    </ul>
                    <button onClick={() => { setShowBankak(true); setBankakStep(0); }} className={`btn w-full mt-3 text-sm ${i === 1 ? 'btn-primary' : 'btn-secondary'}`}>{t('planName')}</button>
                  </div>
                ))}
              </div>
              <div className="card p-4">
                <h3 className="font-bold text-primary-700 mb-3">{t('billingHistory')}</h3>
                <EmptyState icon={<CreditCard className="w-8 h-8" />} title={t('noPayments')} />
              </div>
            </div>
          )}

          {tabId === 'analytics' && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-primary-800">{t('analytics')}</h1>
              <p className="text-xs text-primary-400">{t('demoLabel')}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MetricCard icon={<Eye className="w-5 h-5" />} label={t('views2')} value={formatNumber(12450)} trend="+12%" />
                <MetricCard icon={<MessageSquare className="w-5 h-5" />} label={t('leads')} value={formatNumber(89)} trend="+5%" />
                <MetricCard icon={<Star className="w-5 h-5" />} label={t('favorites')} value={formatNumber(234)} />
                <MetricCard icon={<TrendingUp className="w-5 h-5" />} label={t('promote')} value={formatNumber(18)} />
              </div>
              <div className="card p-4">
                <h3 className="font-bold text-primary-700 mb-4">{t('views2')}</h3>
                <SimpleBarChart data={[30, 45, 28, 52, 38, 60, 48]} labels={['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bankak modal */}
      <Modal open={showBankak} onClose={() => setShowBankak(false)} title={t('bankak')} size="sm">
        <div className="space-y-4">
          {bankakStep === 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-primary-700">{t('selectService')}</h3>
              {['Basic Plan', 'Premium Plan', 'Promotion'].map((s) => (
                <button key={s} onClick={() => { setBankakService(s); setBankakStep(1); }} className="card p-3 w-full text-start hover:border-primary-300 transition-all">
                  <span className="text-sm font-medium text-primary-700">{s}</span>
                </button>
              ))}
            </div>
          )}
          {bankakStep === 1 && (
            <div className="space-y-3">
              <h3 className="font-bold text-primary-700">{t('bankakInstructions')}</h3>
              <div className="bg-sand-50 rounded-xl p-4 text-sm text-primary-600 space-y-2">
                <p className="text-xs text-primary-400">{t('fictionalAccount')}</p>
                <p>{lang === 'ar' ? 'الاسم: مَربو التجريبي' : 'Name: MARBOU Demo'}</p>
                <p>{lang === 'ar' ? 'الحساب: 0123456789012' : 'Account: 0123456789012'}</p>
                <p>{lang === 'ar' ? 'البنك: بنك السودان' : 'Bank: Bank of Sudan'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-primary-600 mb-1 block">{t('transferReference')}</label>
                <input value={bankakRef} onChange={(e) => setBankakRef(e.target.value)} className="input" placeholder="TR-2025-XXXX" />
              </div>
              <button onClick={() => setBankakStep(2)} disabled={!bankakRef} className="btn-primary w-full">{t('next')}</button>
            </div>
          )}
          {bankakStep === 2 && (
            <div className="space-y-3">
              <h3 className="font-bold text-primary-700">{t('uploadReceipt')}</h3>
              <button onClick={() => setBankakReceipt(true)} className="w-full aspect-video rounded-xl border-2 border-dashed border-sand-200 hover:border-primary-300 flex flex-col items-center justify-center gap-2 text-primary-300">
                {bankakReceipt ? (
                  <>
                    <FileCheck className="w-10 h-10 text-success-500" />
                    <span className="text-sm text-success-600">{t('receiptPreview')}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-10 h-10" />
                    <span className="text-sm">{t('uploadReceipt')}</span>
                  </>
                )}
              </button>
              <button onClick={() => setBankakStep(3)} disabled={!bankakReceipt} className="btn-primary w-full">{t('submitPayment')}</button>
            </div>
          )}
          {bankakStep === 3 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-warning-50 flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-warning-500" />
              </div>
              <h3 className="font-bold text-primary-700">{t('pendingReview')}</h3>
              <p className="text-sm text-primary-400">{lang === 'ar' ? 'سيتم مراجعة دفعتك من قبل الإدارة' : 'Your payment will be reviewed by admin'}</p>
              <button onClick={() => { setShowBankak(false); setBankakStep(0); setBankakRef(''); setBankakReceipt(false); showToast(t('pendingReview'), 'success'); }} className="btn-primary w-full">{t('close')}</button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
