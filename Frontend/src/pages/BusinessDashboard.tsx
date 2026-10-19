import { useState, ReactNode } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp, useFlags } from '@/context/AppContext';
import { useRouter } from '@/router/Router';
import { BusinessSidebar } from '@/components/BusinessSidebar';
import { EmptyState, StatusBadge, Modal, RatingStars, ComingSoon } from '@/components/ui';
import { listings, businesses, sampleReviews } from '@/data/mockData';
import {
  LayoutDashboard, FileText, Wrench, Briefcase, MessageSquare, Store,
  Users, Shield, Star, CreditCard, Activity, Plus, Eye, TrendingUp,
  BarChart3, Clock, Check, X, Upload, Image, ChevronLeft, ChevronRight,
  Phone, MapPin, Save, FileCheck, AlertCircle,
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

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
    <div className="w-full space-y-4">
      <div className="flex items-end justify-between gap-2 h-48">
        {data.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            {/* Bar container - full height, bars grow from bottom */}
            <div className="w-full h-full flex items-end justify-center rounded-t-lg overflow-hidden bg-primary-50">
              <div 
                className="w-3/4 bg-gradient-to-t from-primary-600 to-primary-500 rounded-t-lg transition-all hover:from-primary-700 hover:to-primary-600 shadow-md"
                style={{ height: `${(v / max) * 100}%`, minHeight: '8px' }}
              />
            </div>
            {/* Label */}
            <span className="text-xs font-medium text-primary-600 text-center">{labels[i]}</span>
          </div>
        ))}
      </div>
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

  const bizListings = listings.filter((l) => l.businessId === biz.id);

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
            <LayoutDashboard className="w-5 h-5 text-primary-600" />
          </button>
          <span className="font-bold text-primary-700">{t(tabId as TranslationKey) || t('businessOverview')}</span>
        </div>

        <div className="p-4 sm:p-6">
          {tabId === 'overview' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-primary-800">{t('businessOverview')}</h1>
                  <p className="text-sm text-primary-400 mt-1">{lang === 'ar' ? 'مرحبا بك في لوحة التحكم الخاصة بك' : 'Welcome back to your dashboard'}</p>
                </div>
                <button onClick={() => showToast(t('refreshed'), 'success')} className="btn-secondary text-sm hidden sm:flex"><TrendingUp className="w-4 h-4" />{t('refresh')}</button>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <MetricCard icon={<Eye className="w-5 h-5" />} label={t('views2')} value={formatNumber(12450)} trend="+12%" />
                <MetricCard icon={<MessageSquare className="w-5 h-5" />} label={t('leads')} value={formatNumber(89)} trend="+5%" />
                <MetricCard icon={<Star className="w-5 h-5" />} label={t('favorites')} value={formatNumber(234)} trend="+8%" />
                <MetricCard icon={<FileText className="w-5 h-5" />} label={t('listingsCount')} value={formatNumber(bizListings.length)} />
              </div>

              {/* Main Charts */}
              <div className="grid lg:grid-cols-3 gap-4">
                {/* Views Chart */}
                <div className="lg:col-span-2 card p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="font-bold text-primary-800 text-lg">{t('views2')} {lang === 'ar' ? 'هذا الأسبوع' : 'This Week'}</h2>
                      <p className="text-sm text-primary-400 mt-1">{lang === 'ar' ? 'إجمالي المشاهدات: 12,450' : 'Total views: 12,450'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-700">+12%</p>
                      <p className="text-xs text-success-600">{lang === 'ar' ? 'عن الأسبوع الماضي' : 'vs last week'}</p>
                    </div>
                  </div>
                  <SimpleBarChart data={[30, 45, 28, 52, 38, 60, 48]} labels={['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']} />
                </div>

                {/* Quick Stats */}
                <div className="space-y-3">
                  <div className="card p-4 bg-gradient-to-br from-success-50 to-success-50/30 border-success-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
                        <Check className="w-5 h-5 text-success-600" />
                      </div>
                      <span className="text-sm font-medium text-primary-600">{t('approved')}</span>
                    </div>
                    <p className="text-2xl font-bold text-primary-800">24</p>
                    <p className="text-xs text-primary-400 mt-1">{lang === 'ar' ? 'إعلانات مفعلة' : 'Active listings'}</p>
                  </div>
                  <div className="card p-4 bg-gradient-to-br from-warning-50 to-warning-50/30 border-warning-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-warning-100 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-warning-600" />
                      </div>
                      <span className="text-sm font-medium text-primary-600">{t('pending')}</span>
                    </div>
                    <p className="text-2xl font-bold text-primary-800">3</p>
                    <p className="text-xs text-primary-400 mt-1">{lang === 'ar' ? 'تحت المراجعة' : 'Under review'}</p>
                  </div>
                  <div className="card p-4 bg-gradient-to-br from-accent-50 to-accent-50/30 border-accent-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-accent-600" />
                      </div>
                      <span className="text-sm font-medium text-primary-600">{t('conversion')}</span>
                    </div>
                    <p className="text-2xl font-bold text-primary-800">3.2%</p>
                    <p className="text-xs text-primary-400 mt-1">{lang === 'ar' ? 'معدل التحويل' : 'Conversion rate'}</p>
                  </div>
                </div>
              </div>

              {/* Secondary Charts */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Leads Chart */}
                <div className="card p-5 sm:p-6">
                  <div className="mb-6">
                    <h2 className="font-bold text-primary-800 text-lg">{t('leads')} ({t('messaging')})</h2>
                    <p className="text-sm text-primary-400 mt-1">{lang === 'ar' ? 'عدد الرسائل المستلمة' : 'Messages received'}</p>
                  </div>
                  <SimpleBarChart data={[12, 19, 15, 22, 18, 25, 20]} labels={['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']} />
                </div>

                {/* Favorites Trend */}
                <div className="card p-5 sm:p-6">
                  <div className="mb-6">
                    <h2 className="font-bold text-primary-800 text-lg">{t('favorites')} {lang === 'ar' ? 'والتقييمات' : '& Ratings'}</h2>
                    <p className="text-sm text-primary-400 mt-1">{lang === 'ar' ? 'عدد الإعجابات والتقييمات' : 'Likes and ratings'}</p>
                  </div>
                  <SimpleBarChart data={[25, 30, 28, 35, 32, 38, 34]} labels={['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']} />
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="card p-5 sm:p-6">
                <h2 className="font-bold text-primary-800 text-lg mb-4">{t('activityTimeline')}</h2>
                <div className="space-y-3">
                  {[
                    { icon: <Eye className="w-4 h-4" />, text: lang === 'ar' ? 'شخص جديد شاهد إعلاناتك' : 'New person viewed your listing', time: '2h ago', color: 'primary' },
                    { icon: <MessageSquare className="w-4 h-4" />, text: lang === 'ar' ? 'رسالة جديدة من عميل' : 'New message from customer', time: '5h ago', color: 'primary' },
                    { icon: <Star className="w-4 h-4" />, text: lang === 'ar' ? 'تقييم جديد 5 نجوم من محمد علي' : 'New 5-star review from Mohammed Ali', time: '1d ago', color: 'success' },
                    { icon: <Check className="w-4 h-4" />, text: lang === 'ar' ? 'تم نشر إعلانك بنجاح' : 'Your listing was published', time: '2d ago', color: 'success' },
                  ].map((a, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-lg bg-${a.color}-50 border border-${a.color}-100`}>
                      <div className={`w-8 h-8 rounded-full bg-${a.color}-100 flex items-center justify-center text-${a.color}-600`}>{a.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-primary-700">{a.text}</p>
                      </div>
                      <span className="text-xs text-primary-400 whitespace-nowrap">{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Stats */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="card p-4 text-center">
                  <p className="text-xs text-primary-400 mb-1">{t('accountHealth')}</p>
                  <p className="text-2xl font-bold text-primary-700">92%</p>
                  <div className="w-full bg-sand-100 rounded-full h-1.5 mt-3">
                    <div className="bg-success-500 h-full rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>
                <div className="card p-4 text-center">
                  <p className="text-xs text-primary-400 mb-1">{t('responseRate')}</p>
                  <p className="text-2xl font-bold text-primary-700">98%</p>
                  <p className="text-xs text-success-600 mt-2">{lang === 'ar' ? 'ممتاز' : 'Excellent'}</p>
                </div>
                <div className="card p-4 text-center">
                  <p className="text-xs text-primary-400 mb-1">{t('avgRating')}</p>
                  <p className="text-2xl font-bold text-primary-700">4.7⭐</p>
                  <p className="text-xs text-primary-400 mt-2">234 {t('ratingCount')}</p>
                </div>
              </div>
            </div>
          )}

          {tabId === 'services' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-primary-800">{t('servicesManagement')}</h1>
                <button onClick={() => navigate(`/business/${biz.id}/add-service`)} className="btn-primary text-sm"><Plus className="w-4 h-4" />{t('addService')}</button>
              </div>
              {biz.services && biz.services.length > 0 ? (
                <div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {biz.services.map((s, i) => (
                      <div key={i} className="card p-3 flex items-center gap-2 group hover:border-primary-300 transition-all">
                        <Wrench className="w-4 h-4 text-primary-400" />
                        <span className="text-sm text-primary-700">{s}</span>
                        <button onClick={() => showToast(t('deleted'), 'success')} className="ml-auto p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3 text-error-500 hover:text-error-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => navigate(`/business/${biz.id}/services`)} className="btn-primary text-sm">
                    {t('manageServices')} →
                  </button>
                </div>
              ) : (
                <EmptyState icon={<Wrench className="w-10 h-10" />} title={t('noServices')} action={<button onClick={() => navigate(`/business/${biz.id}/services`)} className="btn-primary text-sm">{t('addService')}</button>} />
              )}
            </div>
          )}

          {tabId === 'jobs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-primary-800">{t('jobPosts')}</h1>
                <button onClick={() => navigate(`/business/${biz.id}/post-job`)} className="btn-primary text-sm"><Plus className="w-4 h-4" />{t('postJob')}</button>
              </div>
              <button onClick={() => navigate(`/business/${biz.id}/jobs`)} className="btn-secondary text-sm">
                {t('manageJobs')} →
              </button>
            </div>
          )}

          {tabId === 'messages' && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-primary-800">{t('messagesLeads')}</h1>
              <div className="space-y-2">
                {[
                  { name: lang === 'ar' ? 'أحمد محمد' : 'Ahmed Mohammed', message: lang === 'ar' ? 'هل لديك هذا المنتج بالمخزون؟' : 'Do you have this product in stock?', time: '5m ago', unread: true },
                  { name: lang === 'ar' ? 'فاطمة علي' : 'Fatima Ali', message: lang === 'ar' ? 'أريد طلب تخصيص للمنتج' : 'I want to customize the product', time: '1h ago', unread: false },
                  { name: lang === 'ar' ? 'محمود حسن' : 'Mahmoud Hassan', message: lang === 'ar' ? 'شكراً على الخدمة الممتازة' : 'Thanks for the excellent service', time: '2h ago', unread: false },
                ].map((msg, i) => (
                  <button key={i} onClick={() => navigate('/account/messages')} className={`card p-3 text-start hover:border-primary-300 transition-all w-full ${msg.unread ? 'border-primary-200 bg-primary-50/30' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${msg.unread ? 'font-bold' : 'font-medium'} text-primary-700`}>{msg.name}</p>
                        <p className="text-sm text-primary-600 line-clamp-1">{msg.message}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-primary-400">{msg.time}</span>
                        {msg.unread && <div className="w-2 h-2 rounded-full bg-accent-500" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
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
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-primary-800">{t('staffDirectory')}</h1>
                <button onClick={() => showToast(t('featureComingSoon'), 'info')} className="btn-primary text-sm"><Plus className="w-4 h-4" />{t('addStaff')}</button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {biz.staff?.map((s, i) => (
                  <div key={i} className="card p-4 flex items-center gap-3 group">
                    <div className="w-12 h-12 rounded-full bg-sand-100 overflow-hidden">
                      <img src={s.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-primary-700 text-sm">{lang === 'ar' ? s.nameAr : s.name}</p>
                      <p className="text-xs text-primary-400">{lang === 'ar' ? s.roleAr : s.role}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => showToast(t('edit'), 'info')} className="p-2 rounded hover:bg-sand-50"><FileText className="w-4 h-4 text-primary-500" /></button>
                      <button onClick={() => showToast(t('delete'), 'error')} className="p-2 rounded hover:bg-error-50"><X className="w-4 h-4 text-error-500" /></button>
                    </div>
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
