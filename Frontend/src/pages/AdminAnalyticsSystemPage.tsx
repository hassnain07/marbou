import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { AdminSidebar } from '@/components/AdminSidebar';
import {
  BarChart3, Server, AlertCircle, CheckCircle, TrendingUp, Users, Eye,
  Search, MessageSquare, Heart, ShoppingBag, Briefcase, DollarSign, Zap,
  Calendar, Download, Activity, Target, Clock, ArrowUp, ArrowDown, Database,
  HardDrive, Wifi, Zap as Lightning, RefreshCw, AlertTriangle
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

interface MetricData {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

interface SystemComponent {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  lastCheck: string;
  details?: string;
}

const mockMetrics = {
  totalViews: { label: 'Total Views', value: 2845230, change: 12.5, trend: 'up' as const, lastUpdated: '2025-01-14T10:00:00Z' },
  totalSearches: { label: 'Total Searches', value: 542180, change: 8.3, trend: 'up' as const, lastUpdated: '2025-01-14T10:00:00Z' },
  totalListings: { label: 'Total Listings', value: 125480, change: -2.1, trend: 'down' as const, lastUpdated: '2025-01-14T10:00:00Z' },
  totalMessages: { label: 'Messages Sent', value: 856420, change: 15.7, trend: 'up' as const, lastUpdated: '2025-01-14T10:00:00Z' },
  totalFavorites: { label: 'Favorites', value: 342100, change: 5.2, trend: 'up' as const, lastUpdated: '2025-01-14T10:00:00Z' },
  conversionRate: { label: 'Conversion Rate (%)', value: 3.8, change: 0.5, trend: 'up' as const, lastUpdated: '2025-01-14T10:00:00Z' },
  totalPayments: { label: 'Total Payments', value: 4250000, change: 22.5, trend: 'up' as const, lastUpdated: '2025-01-14T10:00:00Z' },
  activeSubscriptions: { label: 'Active Subscriptions', value: 8420, change: 11.3, trend: 'up' as const, lastUpdated: '2025-01-14T10:00:00Z' },
};

const mockSystemHealth: SystemComponent[] = [
  {
    name: 'Web Server',
    status: 'healthy',
    uptime: 99.98,
    responseTime: 145,
    lastCheck: '2025-01-14T10:05:00Z',
    details: 'All instances running normally',
  },
  {
    name: 'API Server',
    status: 'healthy',
    uptime: 99.95,
    responseTime: 234,
    lastCheck: '2025-01-14T10:05:00Z',
    details: 'Load balanced across 4 instances',
  },
  {
    name: 'Database',
    status: 'healthy',
    uptime: 99.99,
    responseTime: 89,
    lastCheck: '2025-01-14T10:05:00Z',
    details: 'Primary: 98.5% CPU, 72% Memory',
  },
  {
    name: 'Cache Server',
    status: 'warning',
    uptime: 99.87,
    responseTime: 12,
    lastCheck: '2025-01-14T10:05:00Z',
    details: 'Memory usage at 85%, consider optimization',
  },
  {
    name: 'Message Queue',
    status: 'healthy',
    uptime: 99.92,
    responseTime: 156,
    lastCheck: '2025-01-14T10:05:00Z',
    details: '2,450 items in queue, processing normally',
  },
  {
    name: 'Storage',
    status: 'healthy',
    uptime: 100.0,
    responseTime: 267,
    lastCheck: '2025-01-14T10:05:00Z',
    details: '1.2TB / 2TB used (60%)',
  },
  {
    name: 'Search Engine',
    status: 'healthy',
    uptime: 99.94,
    responseTime: 423,
    lastCheck: '2025-01-14T10:05:00Z',
    details: 'Elasticsearch cluster: 3 nodes, healthy',
  },
  {
    name: 'Backup System',
    status: 'critical',
    uptime: 0,
    responseTime: 0,
    lastCheck: '2025-01-14T09:15:00Z',
    details: 'Last backup: 48 hours ago - needs attention',
  },
];

export function AdminAnalyticsSystemPage() {
  const { t } = useI18n();
  const { showToast } = useApp();

  const [activeTab, setActiveTab] = useState('analytics');
  const [dateRange, setDateRange] = useState('7d');

  const handleExportReport = () => {
    showToast(t('reportExported') || 'Report exported successfully', 'success');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-success-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning-600" />;
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-error-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-success-50 border-success-200';
      case 'warning':
        return 'bg-warning-50 border-warning-200';
      case 'critical':
        return 'bg-error-50 border-error-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-success-100 text-success-700';
      case 'warning':
        return 'bg-warning-100 text-warning-700';
      case 'critical':
        return 'bg-error-100 text-error-700';
    }
  };

  const renderMetricCard = (metric: MetricData) => {
    const isPositive = metric.trend === 'up';
    const trendColor = isPositive ? 'text-success-600' : metric.trend === 'down' ? 'text-error-600' : 'text-primary-600';
    const trendBgColor = isPositive ? 'bg-success-50' : metric.trend === 'down' ? 'bg-error-50' : 'bg-sand-50';

    return (
      <div key={metric.label} className="card p-4">
        <div className="flex items-start justify-between mb-2">
          <p className="text-sm text-primary-600 font-medium">{metric.label}</p>
          <div className={`flex items-center gap-1 px-2 py-1 rounded ${trendBgColor}`}>
            {isPositive ? (
              <ArrowUp className={`w-3 h-3 ${trendColor}`} />
            ) : metric.trend === 'down' ? (
              <ArrowDown className={`w-3 h-3 ${trendColor}`} />
            ) : null}
            <span className={`text-xs font-bold ${trendColor}`}>
              {Math.abs(metric.change)}%
            </span>
          </div>
        </div>
        <p className="text-2xl font-bold text-primary-800">
          {typeof metric.value === 'number' && metric.value > 1000
            ? (metric.value / 1000).toFixed(0) + 'k'
            : metric.value}
        </p>
        <p className="text-xs text-primary-500 mt-2">
          Updated: {new Date(metric.lastUpdated).toLocaleTimeString()}
        </p>
      </div>
    );
  };

  return (
    <AdminSidebar activeTab="analytics" showRoleSelector={false}>
      <div className="p-4 sm:p-6 space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary-800">
              {t('analyticsSystem') || 'Analytics & System Health'}
            </h1>
            <p className="text-sm text-primary-500 mt-1">
              {t('viewMetricsAndHealth') || 'View platform metrics and system health status'}
            </p>
          </div>
          <button onClick={handleExportReport} className="btn-primary">
            <Download className="w-4 h-4" />
            {t('exportReport') || 'Export Report'}
          </button>
        </div>

        {/* Tabs */}
        <div className="card p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition ${
                activeTab === 'analytics'
                  ? 'bg-primary-600 text-white'
                  : 'bg-sand-100 text-primary-700 hover:bg-sand-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              {t('analytics') || 'Analytics'}
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition ${
                activeTab === 'system'
                  ? 'bg-primary-600 text-white'
                  : 'bg-sand-100 text-primary-700 hover:bg-sand-200'
              }`}
            >
              <Server className="w-4 h-4" />
              {t('systemHealth') || 'System Health'}
            </button>
          </div>
        </div>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Date Range Filter */}
            <div className="card p-4">
              <div className="flex items-center gap-4">
                <Calendar className="w-4 h-4 text-primary-400" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="input text-sm"
                >
                  <option value="7d">{t('last7Days') || 'Last 7 Days'}</option>
                  <option value="30d">{t('last30Days') || 'Last 30 Days'}</option>
                  <option value="90d">{t('last90Days') || 'Last 90 Days'}</option>
                  <option value="1y">{t('lastYear') || 'Last Year'}</option>
                  <option value="all">{t('allTime') || 'All Time'}</option>
                </select>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.values(mockMetrics).map(metric => renderMetricCard(metric))}
            </div>

            {/* Performance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="font-bold text-primary-800 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary-600" />
                  {t('topPerformers') || 'Top Performers'}
                </h3>
                <div className="space-y-3">
                  {[
                    { name: 'Most Viewed Category', value: 'Vehicles', metric: '245,230 views' },
                    { name: 'Most Active User', value: 'Seller #4521', metric: '1,240 listings' },
                    { name: 'Peak Traffic Time', value: 'Tuesday 2-4 PM', metric: '+28% vs average' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-between justify-between p-2 bg-sand-50 rounded">
                      <div>
                        <p className="text-xs text-primary-600 font-medium">{item.name}</p>
                        <p className="text-sm font-bold text-primary-800">{item.value}</p>
                      </div>
                      <p className="text-xs text-success-600 font-bold">{item.metric}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-bold text-primary-800 mb-4 flex items-center gap-2">
                  <Lightning className="w-5 h-5 text-primary-600" />
                  {t('keyInsights') || 'Key Insights'}
                </h3>
                <div className="space-y-3">
                  {[
                    { insight: 'Conversion rate increased by 12% this week', status: 'success' },
                    { insight: 'User retention dropped 1.2% compared to last month', status: 'warning' },
                    { insight: 'Mobile traffic now accounts for 72% of total traffic', status: 'info' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-2 bg-sand-50 rounded border-l-4 border-primary-600">
                      <p className="text-sm text-primary-700">{item.insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Health Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            {/* System Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card p-4 bg-gradient-to-br from-success-50 to-sand-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-primary-600 font-medium">{t('healthyComponents') || 'Healthy Components'}</p>
                  <CheckCircle className="w-5 h-5 text-success-600" />
                </div>
                <p className="text-3xl font-bold text-success-700">7/8</p>
                <p className="text-xs text-primary-500 mt-1">87.5% operational</p>
              </div>
              <div className="card p-4 bg-gradient-to-br from-warning-50 to-sand-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-primary-600 font-medium">{t('averageUptime') || 'Average Uptime'}</p>
                  <RefreshCw className="w-5 h-5 text-warning-600" />
                </div>
                <p className="text-3xl font-bold text-warning-700">99.94%</p>
                <p className="text-xs text-primary-500 mt-1">Over 30 days</p>
              </div>
              <div className="card p-4 bg-gradient-to-br from-primary-50 to-sand-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-primary-600 font-medium">{t('lastCheck') || 'Last Health Check'}</p>
                  <Clock className="w-5 h-5 text-primary-600" />
                </div>
                <p className="text-3xl font-bold text-primary-700">Just now</p>
                <p className="text-xs text-primary-500 mt-1">2 minutes ago</p>
              </div>
            </div>

            {/* System Components */}
            <div className="space-y-3">
              {mockSystemHealth.map(component => (
                <div
                  key={component.name}
                  className={`card p-4 border-2 ${getStatusColor(component.status)}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(component.status)}
                      <div className="flex-1">
                        <h3 className="font-bold text-primary-800">{component.name}</h3>
                        {component.details && (
                          <p className="text-sm text-primary-600 mt-1">{component.details}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end mb-1">
                          <span className={`badge text-xs ${getStatusBadgeColor(component.status)}`}>
                            {component.status}
                          </span>
                        </div>
                        <p className="text-xs text-primary-600 font-medium">{t('uptime') || 'Uptime'}</p>
                        <p className="text-lg font-bold text-primary-800">{component.uptime}%</p>
                      </div>
                      <div className="text-right border-l border-sand-200 pl-3">
                        <p className="text-xs text-primary-600 font-medium">{t('responseTime') || 'Response'}</p>
                        <p className="text-lg font-bold text-primary-800">{component.responseTime}ms</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-sand-200">
                    <p className="text-xs text-primary-500">
                      {t('lastCheck') || 'Last Check'}: {new Date(component.lastCheck).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Alerts Section */}
            <div className="card p-6">
              <h3 className="font-bold text-primary-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-error-600" />
                {t('activeAlerts') || 'Active Alerts'}
              </h3>
              <div className="space-y-3">
                <div className="bg-error-50 p-4 rounded-lg border border-error-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-error-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-error-700">{t('critical') || 'Critical'}: Backup System Offline</p>
                      <p className="text-sm text-error-600 mt-1">Last backup was 48 hours ago. Please investigate immediately.</p>
                      <p className="text-xs text-error-500 mt-2">Alert triggered: 2025-01-14 09:15:00</p>
                    </div>
                  </div>
                </div>
                <div className="bg-warning-50 p-4 rounded-lg border border-warning-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-warning-700">{t('warning') || 'Warning'}: Cache Memory High</p>
                      <p className="text-sm text-warning-600 mt-1">Cache server memory usage at 85%. Consider optimization or scaling.</p>
                      <p className="text-xs text-warning-500 mt-2">Alert triggered: 2025-01-14 10:02:00</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminSidebar>
  );
}
