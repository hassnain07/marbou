import { useState, ReactNode } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { useRouter, Link } from '@/router/Router';
import { AdminSidebar } from '@/components/AdminSidebar';
import { EmptyState, StatusBadge, Modal, ComingSoon } from '@/components/ui';
import {
  Clock, Upload, FileCheck, AlertCircle, ChevronDown,
  Plus, Edit, Eye, Shield, Settings, Server, History, Smartphone,
  Store, MessageSquare, Wrench, Save, Check, X, Users, FileText, Flag, Briefcase,
  CreditCard, Megaphone, Bell, FileEdit, BarChart3, Lock, ToggleLeft, Globe,
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

function KpiCard({ icon, label, value, color }: { icon: ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="card p-4">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-2`}>{icon}</div>
      <p className="text-2xl font-bold text-primary-700">{value}</p>
      <p className="text-xs text-primary-400">{label}</p>
    </div>
  );
}

function SimpleBarChart({ data, labels, color = 'bg-primary-500' }: { data: number[]; labels: string[]; color?: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end justify-between gap-2 h-32">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full bg-sand-100 rounded-t-lg flex items-end" style={{ height: `${(v / max) * 100}%` }}>
            <div className={`w-full ${color} rounded-t-lg`} style={{ height: '100%' }} />
          </div>
          <span className="text-[10px] text-primary-300">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export function AdminDashboard() {
  const { t, lang, formatNumber, formatDate } = useI18n();
  const { path, navigate } = useRouter();
  const { showToast } = useApp();
  const [adminRole, setAdminRole] = useState('superAdmin');
  const [showApprove, setShowApprove] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({
    otp: false, bankak: true, admob: false, subscriptions: true, promotions: true,
    auctions: false, barter: false, rental: false, wholesale: false, bookings: false,
    delivery: false, video: true, jobs: true, services: true, businessVerification: true,
    messaging: true, push: false, sms: false,
  });

  const tabId = path.split('/')[2] || 'overview';

  // Sample data for moderation queue
  const moderationQueue = [
    { id: 'lst-030', title: 'Samsung Galaxy A54 - New Sealed', titleAr: 'سامسونج جالاكسي A54', seller: 'Demo User', completeness: 85, risk: 'low', status: 'underReview' },
    { id: 'lst-031', title: 'Used iPhone 13 Pro', titleAr: 'آيفون 13 برو مستعمل', seller: 'Ahmed Ali', completeness: 65, risk: 'medium', status: 'underReview' },
  ];

  const payments = [
    { id: 'pay-001', ref: 'TR-2025-001', amount: '50,000 SDG', service: 'Basic Plan', user: 'Al-Nile Motors', status: 'pending' },
    { id: 'pay-002', ref: 'TR-2025-002', amount: '150,000 SDG', service: 'Premium Plan', user: 'Blue Nile Properties', status: 'pending' },
  ];

  const cmsPages = [
    'faq', 'helpCenter', 'safetyTipsPage', 'terms', 'privacy', 'acceptableUse',
    'prohibitedContent', 'listingRules', 'businessVerificationPolicy', 'paymentTerms',
    'refunds', 'dataRetention', 'locationPrivacy',
  ];

  const roles = ['superAdmin', 'admin', 'moderator', 'finance', 'support', 'content', 'marketing', 'verificationRole', 'technical'];
  const permissions = ['view', 'edit', 'delete', 'approve', 'manage'];

  const flagList = ['otp', 'bankak', 'admob', 'subscriptions', 'promotions', 'auctions', 'barter', 'rental', 'wholesale', 'bookings', 'delivery', 'video', 'jobs', 'services', 'businessVerification', 'messaging', 'push', 'sms'];

  return (
    <AdminSidebar activeTab={tabId} adminRole={adminRole} onRoleChange={setAdminRole} showRoleSelector={true}>
      <div className="p-4 sm:p-6">
          {tabId === 'overview' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-primary-800">{t('adminOverview')}</h1>
                <p className="text-sm text-primary-400">{t('demoLabel')}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <KpiCard icon={<Users className="w-5 h-5 text-white" />} label={t('kpiUsers')} value={formatNumber(12450)} color="bg-primary-500" />
                <KpiCard icon={<FileText className="w-5 h-5 text-white" />} label={t('kpiActiveListings')} value={formatNumber(3200)} color="bg-success-500" />
                <KpiCard icon={<Clock className="w-5 h-5 text-white" />} label={t('kpiPendingReviews')} value={formatNumber(45)} color="bg-warning-500" />
                <KpiCard icon={<Flag className="w-5 h-5 text-white" />} label={t('kpiReports')} value={formatNumber(12)} color="bg-error-500" />
                <KpiCard icon={<Store className="w-5 h-5 text-white" />} label={t('kpiBusinesses')} value={formatNumber(230)} color="bg-primary-600" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <KpiCard icon={<MessageSquare className="w-5 h-5 text-white" />} label={t('kpiMessages')} value={formatNumber(8900)} color="bg-primary-400" />
                <KpiCard icon={<Briefcase className="w-5 h-5 text-white" />} label={t('kpiJobs')} value={formatNumber(120)} color="bg-primary-500" />
                <KpiCard icon={<Wrench className="w-5 h-5 text-white" />} label={t('kpiServices')} value={formatNumber(340)} color="bg-primary-600" />
                <KpiCard icon={<CreditCard className="w-5 h-5 text-white" />} label={t('kpiPayments')} value={formatNumber(56)} color="bg-accent-500" />
                <KpiCard icon={<Megaphone className="w-5 h-5 text-white" />} label={t('kpiPromotions')} value={formatNumber(18)} color="bg-accent-400" />
              </div>
              <div className="card p-4">
                <h3 className="font-bold text-primary-700 mb-4">{t('searchTrends')}</h3>
                <SimpleBarChart data={[45, 62, 38, 78, 55, 90, 68]} labels={['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']} />
              </div>
              <div className="card p-4">
                <h3 className="font-bold text-primary-700 mb-3">{t('pendingActions')}</h3>
                <div className="space-y-2">
                  <button onClick={() => navigate('/admin/listings')} className="card p-3 flex items-center gap-3 hover:shadow-md transition-all w-full text-start">
                    <Clock className="w-5 h-5 text-warning-500" />
                    <span className="text-sm text-primary-700 flex-1">{moderationQueue.length} {t('kpiPendingReviews')}</span>
                  </button>
                  <button onClick={() => navigate('/admin/payments')} className="card p-3 flex items-center gap-3 hover:shadow-md transition-all w-full text-start">
                    <CreditCard className="w-5 h-5 text-accent-500" />
                    <span className="text-sm text-primary-700 flex-1">{payments.length} {t('paymentsBankak')}</span>
                  </button>
                  <button onClick={() => navigate('/admin/reports')} className="card p-3 flex items-center gap-3 hover:shadow-md transition-all w-full text-start">
                    <Flag className="w-5 h-5 text-error-500" />
                    <span className="text-sm text-primary-700 flex-1">12 {t('kpiReports')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {tabId === 'listings' && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-primary-800">{t('listingsModeration')}</h1>
              <div className="space-y-3">
                {moderationQueue.map((item) => (
                  <div key={item.id} className="card p-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="font-bold text-primary-700">{lang === 'ar' ? item.titleAr : item.title}</h3>
                        <p className="text-xs text-primary-400">{t('sellerInfo')}: {item.seller}</p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="p-2 bg-sand-50 rounded-lg">
                        <p className="text-xs text-primary-400">{t('completenessScore')}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-sand-200 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-500 rounded-full" style={{ width: `${item.completeness}%` }} />
                          </div>
                          <span className="text-xs font-bold text-primary-600">{item.completeness}%</span>
                        </div>
                      </div>
                      <div className="p-2 bg-sand-50 rounded-lg">
                        <p className="text-xs text-primary-400">{t('duplicateRisk')}</p>
                        <span className={`badge ${item.risk === 'low' ? 'bg-success-100 text-success-700' : item.risk === 'medium' ? 'bg-warning-100 text-warning-700' : 'bg-error-100 text-error-700'}`}>
                          {item.risk === 'low' ? (lang === 'ar' ? 'منخفض' : 'Low') : item.risk === 'medium' ? (lang === 'ar' ? 'متوسط' : 'Medium') : (lang === 'ar' ? 'مرتفع' : 'High')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { showToast(t('approve'), 'success'); }} className="btn-primary text-sm flex-1"><Check className="w-4 h-4" />{t('approve')}</button>
                      <button onClick={() => { showToast(t('rejectBtn'), 'error'); }} className="btn-danger text-sm flex-1"><X className="w-4 h-4" />{t('rejectBtn')}</button>
                      <button onClick={() => showToast(t('requestChanges'), 'info')} className="btn-secondary text-sm flex-1"><Edit className="w-4 h-4" />{t('requestChanges')}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tabId === 'categories' && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-primary-800">{t('categoryBuilder')}</h1>
              <div className="card p-4">
                <h3 className="font-bold text-primary-700 mb-3">{t('addField')}</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-primary-500 mb-1 block">{t('fieldLabel')} (EN)</label>
                    <input className="input" defaultValue="Make" />
                  </div>
                  <div>
                    <label className="text-sm text-primary-500 mb-1 block">{t('fieldLabel')} (AR)</label>
                    <input className="input" defaultValue="الماركة" dir="rtl" />
                  </div>
                  <div>
                    <label className="text-sm text-primary-500 mb-1 block">{t('fieldType')}</label>
                    <select className="input"><option>Text</option><option>Number</option><option>Select</option><option>Checkbox</option></select>
                  </div>
                  <div>
                    <label className="text-sm text-primary-500 mb-1 block">{t('displayOrder')}</label>
                    <input type="number" className="input" defaultValue="1" />
                  </div>
                </div>
                <label className="flex items-center gap-2 mt-3">
                  <input type="checkbox" className="accent-primary-600" defaultChecked />
                  <span className="text-sm text-primary-600">{t('required')}</span>
                </label>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => showToast(t('addField'), 'success')} className="btn-primary text-sm"><Plus className="w-4 h-4" />{t('addField')}</button>
                  <button onClick={() => showToast(t('previewForm'), 'info')} className="btn-secondary text-sm"><Eye className="w-4 h-4" />{t('previewForm')}</button>
                </div>
              </div>
              <div className="card p-4">
                <h3 className="font-bold text-primary-700 mb-3">{t('previewForm')}</h3>
                <div className="space-y-3">
                  <div><label className="text-sm text-primary-500 mb-1 block">Make *</label><input className="input" placeholder="Toyota" /></div>
                  <div><label className="text-sm text-primary-500 mb-1 block">Model *</label><input className="input" placeholder="Camry" /></div>
                  <div><label className="text-sm text-primary-500 mb-1 block">Year *</label><input type="number" className="input" placeholder="2019" /></div>
                </div>
              </div>
            </div>
          )}

          {tabId === 'users' && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-primary-800">{t('usersBusinesses')}</h1>
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-sand-50">
                    <tr>
                      <th className="text-start p-3 font-medium text-primary-500">{t('profile')}</th>
                      <th className="text-start p-3 font-medium text-primary-500">{t('status')}</th>
                      <th className="text-start p-3 font-medium text-primary-500">{t('verified')}</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Al-Nile Motors', type: 'Business', verified: true, status: 'active' },
                      { name: 'Demo User', type: 'User', verified: false, status: 'active' },
                      { name: 'Blue Nile Properties', type: 'Business', verified: true, status: 'active' },
                      { name: 'Ahmed Ali', type: 'User', verified: false, status: 'suspended' },
                    ].map((u, i) => (
                      <tr key={i} className="border-t border-sand-50 hover:bg-sand-50">
                        <td className="p-3">
                          <p className="font-medium text-primary-700">{u.name}</p>
                          <p className="text-xs text-primary-400">{u.type}</p>
                        </td>
                        <td className="p-3"><span className={`badge ${u.status === 'active' ? 'bg-success-100 text-success-700' : 'bg-error-100 text-error-700'}`}>{u.status}</span></td>
                        <td className="p-3">{u.verified ? <span className="badge bg-primary-100 text-primary-700">{t('verified')}</span> : <span className="badge bg-sand-100 text-primary-500">--</span>}</td>
                        <td className="p-3"><button onClick={() => showToast(t('viewDetails'), 'info')} className="text-primary-500 hover:text-primary-700"><Eye className="w-4 h-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tabId === 'reports' && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-primary-800">{t('reportsAppeals')}</h1>
              <div className="space-y-3">
                {[
                  { type: 'Listing', reason: 'Fraud or scam', status: 'pending' },
                  { type: 'User', reason: 'Prohibited content', status: 'reviewing' },
                  { type: 'Message', reason: 'Spam', status: 'resolved' },
                ].map((r, i) => (
                  <div key={i} className="card p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="badge bg-sand-100 text-primary-600">{r.type}</span>
                        <p className="text-sm text-primary-700 mt-1">{r.reason}</p>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => showToast(t('approve'), 'success')} className="btn-primary text-sm">{t('confirm')}</button>
                      <button onClick={() => showToast(t('rejectBtn'), 'error')} className="btn-danger text-sm">{t('rejectBtn')}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tabId === 'jobs-services' && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-primary-800">{t('jobsServices')}</h1>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="card p-4">
                  <h3 className="font-bold text-primary-700 mb-2">{t('jobs')}</h3>
                  <p className="text-2xl font-bold text-primary-600">{formatNumber(120)}</p>
                  <p className="text-xs text-primary-400">{t('kpiJobs')}</p>
                </div>
                <div className="card p-4">
                  <h3 className="font-bold text-primary-700 mb-2">{t('services')}</h3>
                  <p className="text-2xl font-bold text-primary-600">{formatNumber(340)}</p>
                  <p className="text-xs text-primary-400">{t('kpiServices')}</p>
                </div>
              </div>
            </div>
          )}

          {tabId === 'payments' && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-primary-800">{t('paymentsBankak')}</h1>
              <div className="space-y-3">
                {payments.map((p) => (
                  <div key={p.id} className="card p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-primary-700">{p.user}</p>
                        <p className="text-xs text-primary-400">{t('reference')}: {p.ref} · {p.service}</p>
                      </div>
                      <div className="text-end">
                        <p className="font-bold text-primary-700">{p.amount}</p>
                        <StatusBadge status={p.status} />
                      </div>
                    </div>
                    <button onClick={() => setShowPayment(p.id)} className="btn-secondary text-sm w-full"><Eye className="w-4 h-4" />{t('receiptPreview')}</button>
                  </div>
                ))}
              </div>
              <Modal open={!!showPayment} onClose={() => setShowPayment(null)} title={t('receiptPreview')} size="sm">
                <div className="space-y-4">
                  <div className="bg-sand-50 rounded-xl p-6 text-center">
                    <FileCheck className="w-12 h-12 text-primary-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-primary-600">{t('receiptPreview')}</p>
                    <p className="text-xs text-primary-400 mt-1">{t('demoLabel')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setShowPayment(null); showToast(t('approve'), 'success'); }} className="btn-primary flex-1"><Check className="w-4 h-4" />{t('approve')}</button>
                    <button onClick={() => { setShowPayment(null); showToast(t('rejectBtn'), 'error'); }} className="btn-danger flex-1"><X className="w-4 h-4" />{t('rejectBtn')}</button>
                  </div>
                </div>
              </Modal>
            </div>
          )}

          {tabId === 'subscriptions' && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-primary-800">{t('subsPromotions')}</h1>
              <div className="grid sm:grid-cols-3 gap-3">
                {['Free', 'Basic', 'Premium'].map((plan, i) => (
                  <div key={plan} className="card p-4">
                    <h3 className="font-bold text-primary-700">{plan}</h3>
                    <p className="text-sm text-primary-400 mt-1">{t('listingLimit')}: {i * 10}</p>
                    <p className="text-sm text-primary-400">{t('searchBoost')}: {i >= 1 ? '✓' : '✗'}</p>
                    <p className="text-sm text-primary-400">{t('homepagePlacement')}: {i >= 2 ? '✓' : '✗'}</p>
                  </div>
                ))}
              </div>
              <div className="card p-4">
                <h3 className="font-bold text-primary-700 mb-3">{t('banners')}</h3>
                <button onClick={() => showToast(t('addBanner'), 'info')} className="btn-secondary text-sm"><Plus className="w-4 h-4" />{t('addBanner')}</button>
              </div>
            </div>
          )}

          {tabId === 'notifications' && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-primary-800">{t('notificationsAdmin')}</h1>
              <div className="card p-4">
                <h3 className="font-bold text-primary-700 mb-3">{t('compose')}</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-primary-500 mb-1 block">{t('audience')}</label>
                    <select className="input"><option>All users</option><option>Businesses</option><option>Specific city</option></select>
                  </div>
                  <div>
                    <label className="text-sm text-primary-500 mb-1 block">{t('title')}</label>
                    <input className="input" placeholder="Notification title" />
                  </div>
                  <div>
                    <label className="text-sm text-primary-500 mb-1 block">{t('description')}</label>
                    <textarea className="input resize-none" rows={3} placeholder="Message content" />
                  </div>
                  <button onClick={() => showToast(t('successState'), 'success')} className="btn-primary"><Bell className="w-4 h-4" />{t('submit')}</button>
                </div>
              </div>
            </div>
          )}

          {tabId === 'cms' && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-primary-800">{t('cmsLegal')}</h1>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {cmsPages.map((p) => (
                  <Link key={p} to={`/help/${p}`} className="card p-3 flex items-center justify-between hover:shadow-md transition-all">
                    <span className="text-sm text-primary-700">{t(p as TranslationKey)}</span>
                    <span className="badge bg-success-100 text-success-700">{t('publishedStatus')}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {tabId === 'analytics' && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-primary-800">{t('analyticsSystem')}</h1>
              <p className="text-xs text-primary-400">{t('demoLabel')}</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="card p-4">
                  <h3 className="font-bold text-primary-700 mb-3">{t('searchTrends')}</h3>
                  <SimpleBarChart data={[45, 62, 38, 78, 55, 90, 68]} labels={['S', 'S', 'M', 'T', 'W', 'T', 'F']} />
                </div>
                <div className="card p-4">
                  <h3 className="font-bold text-primary-700 mb-3">{t('categoryActivity')}</h3>
                  <SimpleBarChart data={[80, 45, 60, 30, 55, 40]} labels={['V', 'RE', 'E', 'H', 'F', 'S']} color="bg-accent-500" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="card p-3"><Server className="w-5 h-5 text-primary-400 mb-1" /><p className="text-sm font-bold text-primary-700">{t('systemHealth')}</p><span className="badge bg-success-100 text-success-700">OK</span></div>
                <div className="card p-3"><History className="w-5 h-5 text-primary-400 mb-1" /><p className="text-sm font-bold text-primary-700">{t('auditLogs')}</p></div>
                <div className="card p-3"><Shield className="w-5 h-5 text-primary-400 mb-1" /><p className="text-sm font-bold text-primary-700">{t('backups')}</p></div>
                <div className="card p-3"><Smartphone className="w-5 h-5 text-primary-400 mb-1" /><p className="text-sm font-bold text-primary-700">{t('appVersions')}</p></div>
              </div>
            </div>
          )}

          {tabId === 'roles' && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-primary-800">{t('rolesPermissions')}</h1>
              <p className="text-xs text-primary-400">{t('demoLabel')}</p>
              <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-sand-50">
                    <tr>
                      <th className="text-start p-3 font-medium text-primary-500">{t('permissions')}</th>
                      {roles.map((r) => <th key={r} className="p-3 font-medium text-primary-500 text-xs">{t(r as TranslationKey)}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((perm) => (
                      <tr key={perm} className="border-t border-sand-50">
                        <td className="p-3 font-medium text-primary-600 capitalize">{perm}</td>
                        {roles.map((r) => (
                          <td key={r} className="p-3 text-center">
                            {(['superAdmin', 'admin'].includes(r) || (r === 'moderator' && perm !== 'manage') || (r === 'finance' && perm === 'approve')) ? (
                              <Check className="w-4 h-4 text-success-500 mx-auto" />
                            ) : (
                              <X className="w-4 h-4 text-sand-200 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tabId === 'feature-flags' && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-primary-800">{t('featureFlags')}</h1>
              <p className="text-xs text-primary-400">{t('demoLabel')}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {flagList.map((flag) => (
                  <div key={flag} className="card p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary-700">{t(flag as TranslationKey)}</p>
                      <span className={`badge ${featureFlags[flag] ? 'bg-success-100 text-success-700' : 'bg-sand-100 text-primary-400'}`}>
                        {featureFlags[flag] ? t('on') : t('off')}
                      </span>
                    </div>
                    <button
                      onClick={() => setFeatureFlags({ ...featureFlags, [flag]: !featureFlags[flag] })}
                      className={`w-12 h-6 rounded-full transition-colors ${featureFlags[flag] ? 'bg-primary-500' : 'bg-sand-200'}`}
                    >
                      <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${featureFlags[flag] ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-0.5 rtl:-translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tabId === 'country' && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-primary-800">{t('countrySettings')}</h1>
              <div className="card p-4 max-w-2xl space-y-3">
                <div>
                  <label className="text-sm text-primary-500 mb-1 block">{t('currency')}</label>
                  <input className="input" defaultValue="SDG - Sudanese Pound" />
                </div>
                <div>
                  <label className="text-sm text-primary-500 mb-1 block">{t('cities')}</label>
                  <input className="input" defaultValue="Khartoum, Omdurman, Bahri, Port Sudan..." />
                </div>
                <div>
                  <label className="text-sm text-primary-500 mb-1 block">{t('phoneCode')}</label>
                  <input className="input" defaultValue="+249" />
                </div>
                <div>
                  <label className="text-sm text-primary-500 mb-1 block">{t('languageSetting')}</label>
                  <select className="input"><option>Arabic (Default)</option><option>English</option></select>
                </div>
                <button onClick={() => showToast(t('successState'), 'success')} className="btn-primary"><Save className="w-4 h-4" />{t('save')}</button>
              </div>
              <div className="card p-4">
                <h3 className="font-bold text-primary-700 mb-2">{t('futureCountry')}</h3>
                <p className="text-sm text-primary-400">{lang === 'ar' ? 'تصميم مفاهيمي للتوسع المستقبلي' : 'Conceptual design for future expansion'}</p>
                <button onClick={() => showToast(t('comingLater'), 'info')} className="btn-secondary text-sm mt-2"><Plus className="w-4 h-4" />{t('futureCountry')}</button>
              </div>
            </div>
          )}
      </div>
    </AdminSidebar>
  );
}
