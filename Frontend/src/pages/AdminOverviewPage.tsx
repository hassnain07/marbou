import { ReactNode } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useRouter } from '@/router/Router';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useApp } from '@/context/AppContext';
import {
  Users, FileText, Clock, Flag, Store, MessageSquare, Briefcase,
  Wrench, CreditCard, TrendingUp, AlertCircle, CheckCircle,
  XCircle, ArrowRight,
} from 'lucide-react';

function KpiCard({ icon, label, value, color }: { icon: ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="card p-4">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-primary-700">{value}</p>
      <p className="text-xs text-primary-400">{label}</p>
    </div>
  );
}

function SimpleBarChart({ data, labels, color = 'bg-primary-500' }: { data: number[]; labels: string[]; color?: string }) {
  const max = Math.max(...data);
  const height = 120; // Fixed height in pixels
  
  return (
    <div className="flex items-end justify-between gap-2" style={{ height: `${height}px` }}>
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full bg-sand-100 rounded-t-lg overflow-hidden" style={{ height: `${(v / max) * height}px` }}>
            <div className={`w-full ${color} rounded-t-lg`} style={{ height: '100%' }} />
          </div>
          <span className="text-[10px] text-primary-300 whitespace-nowrap">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export function AdminOverviewPage() {
  const { t, lang, formatNumber } = useI18n();
  const { navigate } = useRouter();
  const { showToast } = useApp();

  // Mock data based on PRD M24.ADM-01
  const kpis = [
    { label: t('kpiUsers'), value: formatNumber(12450), color: 'bg-primary-500', icon: <Users className="w-5 h-5 text-white" /> },
    { label: t('kpiActiveListings'), value: formatNumber(3200), color: 'bg-success-500', icon: <FileText className="w-5 h-5 text-white" /> },
    { label: t('kpiPendingReviews'), value: formatNumber(45), color: 'bg-warning-500', icon: <Clock className="w-5 h-5 text-white" /> },
    { label: t('kpiReports'), value: formatNumber(12), color: 'bg-error-500', icon: <Flag className="w-5 h-5 text-white" /> },
    { label: t('kpiBusinesses'), value: formatNumber(230), color: 'bg-primary-600', icon: <Store className="w-5 h-5 text-white" /> },
  ];

  const secondaryKpis = [
    { label: t('kpiMessages'), value: formatNumber(8900), color: 'bg-primary-400', icon: <MessageSquare className="w-5 h-5 text-white" /> },
    { label: t('kpiJobs'), value: formatNumber(120), color: 'bg-primary-500', icon: <Briefcase className="w-5 h-5 text-white" /> },
    { label: t('kpiServices'), value: formatNumber(340), color: 'bg-primary-600', icon: <Wrench className="w-5 h-5 text-white" /> },
    { label: t('kpiPayments'), value: formatNumber(56), color: 'bg-accent-500', icon: <CreditCard className="w-5 h-5 text-white" /> },
    { label: t('kpiPromotions'), value: formatNumber(18), color: 'bg-accent-400', icon: <TrendingUp className="w-5 h-5 text-white" /> },
  ];

  const pendingActions = [
    { icon: <Clock className="w-5 h-5 text-warning-500" />, label: `45 ${t('kpiPendingReviews')}`, tab: 'listings', count: 45 },
    { icon: <CreditCard className="w-5 h-5 text-accent-500" />, label: `2 ${t('paymentsBankak')}`, tab: 'payments', count: 2 },
    { icon: <Flag className="w-5 h-5 text-error-500" />, label: `12 ${t('kpiReports')}`, tab: 'reports', count: 12 },
    { icon: <Users className="w-5 h-5 text-primary-500" />, label: `8 ${t('verificationQueue')}`, tab: 'verification', count: 8 },
  ];

  const systemStatus = [
    { label: 'API Status', status: 'healthy', value: '✓ Operational' },
    { label: 'Database', status: 'healthy', value: '✓ Operational' },
    { label: 'Cache (Redis)', status: 'healthy', value: '✓ Operational' },
    { label: 'Search Index', status: 'healthy', value: '✓ Operational' },
  ];

  const recentActivity = [
    { time: '2 minutes ago', action: 'New listing posted', entity: 'Samsung Galaxy S24', status: 'pending' },
    { time: '5 minutes ago', action: 'User verification', entity: 'Al-Nile Motors', status: 'approved' },
    { time: '12 minutes ago', action: 'Report submitted', entity: 'Suspicious listing', status: 'new' },
    { time: '18 minutes ago', action: 'Payment received', entity: 'Premium Plan', status: 'completed' },
  ];

  return (
    <AdminSidebar activeTab="overview">
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-primary-800">{t('adminOverview')}</h1>
          <p className="text-sm text-primary-400">Welcome back! Here's your platform summary.</p>
        </div>

        {/* Primary KPIs */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-primary-600">Key Metrics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {kpis.map((kpi, i) => (
              <KpiCard key={i} icon={kpi.icon} label={kpi.label} value={kpi.value} color={kpi.color} />
            ))}
          </div>
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {secondaryKpis.map((kpi, i) => (
            <KpiCard key={i} icon={kpi.icon} label={kpi.label} value={kpi.value} color={kpi.color} />
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Search Trends Chart */}
          <div className="lg:col-span-2 card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-primary-700">{t('searchTrends')}</h3>
              <span className="text-xs text-primary-400">Last 7 days</span>
            </div>
            <SimpleBarChart data={[45, 62, 38, 78, 55, 90, 68]} labels={['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']} />
          </div>

          {/* System Status */}
          <div className="card p-4 space-y-3">
            <h3 className="font-bold text-primary-700">System Health</h3>
            {systemStatus.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-primary-600">{item.label}</span>
                <span className={`text-xs font-semibold ${item.status === 'healthy' ? 'text-success-600' : 'text-error-600'}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Actions & Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pending Actions */}
          <div className="card p-4 space-y-3">
            <h3 className="font-bold text-primary-700 mb-4">{t('pendingActions')}</h3>
            <div className="space-y-2">
              {pendingActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => navigate(`/admin/${action.tab}`)}
                  className="w-full p-3 rounded-lg bg-sand-50 hover:bg-sand-100 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    {action.icon}
                    <span className="text-sm text-primary-700 font-medium">{action.label}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary-400 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card p-4 space-y-3">
            <h3 className="font-bold text-primary-700 mb-4">Recent Activity</h3>
            <div className="space-y-2">
              {recentActivity.map((activity, i) => (
                <div key={i} className="p-3 bg-sand-50 rounded-lg">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-medium text-primary-700">{activity.action}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activity.status === 'pending' ? 'bg-warning-100 text-warning-700' :
                      activity.status === 'approved' ? 'bg-success-100 text-success-700' :
                      activity.status === 'completed' ? 'bg-primary-100 text-primary-700' :
                      'bg-error-100 text-error-700'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                  <p className="text-xs text-primary-400 mb-1">{activity.entity}</p>
                  <p className="text-xs text-primary-300">{activity.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats Footer */}
        <div className="grid sm:grid-cols-4 gap-3 pt-4 border-t border-sand-100">
          <div className="text-center p-3">
            <p className="text-2xl font-bold text-primary-600">98.7%</p>
            <p className="text-xs text-primary-400">Platform Uptime</p>
          </div>
          <div className="text-center p-3">
            <p className="text-2xl font-bold text-primary-600">2.1s</p>
            <p className="text-xs text-primary-400">Avg API Response</p>
          </div>
          <div className="text-center p-3">
            <p className="text-2xl font-bold text-primary-600">94%</p>
            <p className="text-xs text-primary-400">User Retention</p>
          </div>
          <div className="text-center p-3">
            <p className="text-2xl font-bold text-primary-600">847</p>
            <p className="text-xs text-primary-400">Active Users Now</p>
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
}
