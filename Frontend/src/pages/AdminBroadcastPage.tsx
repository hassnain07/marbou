import { useState, useMemo } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Modal, EmptyState } from '@/components/ui';
import {
  Megaphone, Plus, Edit2, Trash2, Search, Filter, Send, Clock,
  CheckCircle, AlertCircle, Eye, Users, Calendar, Bell, Copy, Pause,
  Play, BarChart3, MessageSquare, Settings
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

type NotificationStatus = 'draft' | 'scheduled' | 'sent' | 'paused' | 'failed';
type NotificationType = 'in_app' | 'push' | 'email' | 'sms';
type TargetAudience = 'all_users' | 'all_buyers' | 'all_sellers' | 'premium_users' | 'new_users' | 'inactive_users' | 'custom';

interface BroadcastNotification {
  id: string;
  title: string;
  titleAr?: string;
  message: string;
  messageAr?: string;
  type: NotificationType[];
  status: NotificationStatus;
  targetAudience: TargetAudience;
  customFilters?: Record<string, any>;
  scheduledFor?: string;
  sentAt?: string;
  deliveryStats?: {
    total: number;
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
  };
  deepLink?: string;
  richContent?: {
    imageUrl?: string;
    actionUrl?: string;
    actionText?: string;
  };
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  testMode: boolean;
  testRecipients?: string[];
}

const mockBroadcasts: BroadcastNotification[] = [
  {
    id: 'bc-1',
    title: 'New Feature Available',
    titleAr: 'ميزة جديدة متاحة',
    message: 'Check out our new advanced search filters to find exactly what you are looking for!',
    messageAr: 'اكتشف مرشحات البحث المتقدمة الجديدة لدينا للعثور على ما تبحث عنه بالضبط!',
    type: ['in_app', 'push'],
    status: 'sent',
    targetAudience: 'all_users',
    sentAt: '2025-01-10T10:00:00Z',
    deliveryStats: {
      total: 8500,
      delivered: 8420,
      opened: 5240,
      clicked: 2100,
      failed: 80,
    },
    deepLink: 'marbou://search?advanced=true',
    priority: 'medium',
    testMode: false,
    createdAt: '2025-01-09T14:30:00Z',
    createdBy: 'Admin User',
    updatedAt: '2025-01-10T10:00:00Z',
    updatedBy: 'Admin User',
  },
  {
    id: 'bc-2',
    title: 'Upgrade to Premium Today',
    titleAr: 'ترقّ إلى البريميوم اليوم',
    message: 'Get unlimited listings and boost your visibility. Limited time offer - Save 20%!',
    messageAr: 'احصل على قوائم غير محدودة وعزز رؤيتك. عرض محدود الوقت - وفر 20%!',
    type: ['in_app', 'push', 'email'],
    status: 'scheduled',
    targetAudience: 'premium_users',
    scheduledFor: '2025-01-20T09:00:00Z',
    priority: 'high',
    testMode: false,
    deepLink: 'marbou://subscription?plan=premium',
    richContent: {
      imageUrl: 'https://via.placeholder.com/400x200?text=Premium+Upgrade',
      actionUrl: 'marbou://subscription?plan=premium',
      actionText: 'Upgrade Now',
    },
    createdAt: '2025-01-08T10:00:00Z',
    createdBy: 'Admin User',
    updatedAt: '2025-01-08T10:00:00Z',
    updatedBy: 'Admin User',
  },
  {
    id: 'bc-3',
    title: 'System Maintenance Alert',
    titleAr: 'تنبيه صيانة النظام',
    message: 'We will perform scheduled maintenance on January 21 from 2-4 AM GMT. Services may be unavailable.',
    messageAr: 'سيتم إجراء صيانة مجدولة في 21 يناير من الساعة 2-4 صباحاً بتوقيت غرينتش.',
    type: ['in_app', 'push'],
    status: 'draft',
    targetAudience: 'all_users',
    priority: 'critical',
    testMode: true,
    testRecipients: ['admin@marbou.com', 'support@marbou.com'],
    createdAt: '2025-01-14T09:00:00Z',
    createdBy: 'Admin User',
    updatedAt: '2025-01-14T09:00:00Z',
    updatedBy: 'Admin User',
  },
  {
    id: 'bc-4',
    title: 'Your Listing Sold!',
    titleAr: 'تم بيع قائمتك!',
    message: 'Congratulations! Your item has been sold. View the buyer offer now.',
    messageAr: 'تهانينا! تم بيع عنصرك. اعرض عرض المشتري الآن.',
    type: ['in_app', 'push'],
    status: 'failed',
    targetAudience: 'all_sellers',
    sentAt: '2025-01-05T08:00:00Z',
    deliveryStats: {
      total: 3200,
      delivered: 2950,
      opened: 1800,
      clicked: 950,
      failed: 250,
    },
    priority: 'high',
    testMode: false,
    deepLink: 'marbou://messages',
    createdAt: '2025-01-04T15:00:00Z',
    createdBy: 'Admin User',
    updatedAt: '2025-01-05T09:30:00Z',
    updatedBy: 'Admin User',
  },
];

export function AdminBroadcastPage() {
  const { t } = useI18n();
  const { showToast } = useApp();

  const [broadcasts, setBroadcasts] = useState<BroadcastNotification[]>(mockBroadcasts);
  const [selectedBroadcast, setSelectedBroadcast] = useState<BroadcastNotification | null>(mockBroadcasts[0]);
  const [showModal, setShowModal] = useState(false);
  const [editingBroadcast, setEditingBroadcast] = useState<BroadcastNotification | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<NotificationStatus | 'all'>('all');

  const filteredBroadcasts = useMemo(() => {
    return broadcasts.filter(bc => {
      const matchesSearch =
        bc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bc.titleAr?.includes(searchQuery) ||
        bc.message.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterStatus === 'all' || bc.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [broadcasts, searchQuery, filterStatus]);

  const handleCreateBroadcast = () => {
    setEditingBroadcast(null);
    setShowModal(true);
  };

  const handleEditBroadcast = (bc: BroadcastNotification) => {
    setEditingBroadcast(bc);
    setShowModal(true);
  };

  const handleSaveBroadcast = (bcData: Partial<BroadcastNotification>) => {
    if (editingBroadcast) {
      setBroadcasts(broadcasts.map(bc => (bc.id === editingBroadcast.id ? { ...bc, ...bcData } : bc)));
      showToast(t('broadcastUpdated') || 'Broadcast updated', 'success');
    } else {
      const newBroadcast: BroadcastNotification = {
        id: `bc-${Date.now()}`,
        title: bcData.title || '',
        titleAr: bcData.titleAr || '',
        message: bcData.message || '',
        messageAr: bcData.messageAr || '',
        type: bcData.type || ['in_app'],
        status: 'draft',
        targetAudience: bcData.targetAudience || 'all_users',
        priority: bcData.priority || 'medium',
        testMode: bcData.testMode || false,
        createdAt: new Date().toISOString(),
        createdBy: 'Admin User',
        updatedAt: new Date().toISOString(),
        updatedBy: 'Admin User',
      };
      setBroadcasts([...broadcasts, newBroadcast]);
      setSelectedBroadcast(newBroadcast);
      showToast(t('broadcastCreated') || 'Broadcast created', 'success');
    }
    setShowModal(false);
  };

  const handleSendBroadcast = (bc: BroadcastNotification) => {
    const updatedBroadcasts = broadcasts.map(b => {
      if (b.id === bc.id) {
        return {
          ...b,
          status: 'sent' as NotificationStatus,
          sentAt: new Date().toISOString(),
          deliveryStats: {
            total: Math.floor(Math.random() * 10000),
            delivered: Math.floor(Math.random() * 8000),
            opened: Math.floor(Math.random() * 5000),
            clicked: Math.floor(Math.random() * 2000),
            failed: Math.floor(Math.random() * 500),
          },
        };
      }
      return b;
    });

    setBroadcasts(updatedBroadcasts);
    setSelectedBroadcast(updatedBroadcasts.find(b => b.id === bc.id) || null);
    showToast(t('broadcastSent') || 'Broadcast sent successfully', 'success');
  };

  const handleDeleteBroadcast = (bc: BroadcastNotification) => {
    setBroadcasts(broadcasts.filter(b => b.id !== bc.id));
    if (selectedBroadcast?.id === bc.id) {
      setSelectedBroadcast(broadcasts[0] || null);
    }
    showToast(t('broadcastDeleted') || 'Broadcast deleted', 'success');
  };

  const getStatusIcon = (status: NotificationStatus) => {
    switch (status) {
      case 'draft':
        return <Clock className="w-4 h-4 text-warning-600" />;
      case 'scheduled':
        return <Calendar className="w-4 h-4 text-primary-600" />;
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-success-600" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-primary-400" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-error-600" />;
    }
  };

  const getStatusColor = (status: NotificationStatus): string => {
    switch (status) {
      case 'draft':
        return 'bg-warning-100 text-warning-700';
      case 'scheduled':
        return 'bg-primary-100 text-primary-700';
      case 'sent':
        return 'bg-success-100 text-success-700';
      case 'paused':
        return 'bg-sand-100 text-primary-600';
      case 'failed':
        return 'bg-error-100 text-error-700';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'critical':
        return 'bg-error-100 text-error-700';
      case 'high':
        return 'bg-warning-100 text-warning-700';
      case 'medium':
        return 'bg-primary-100 text-primary-700';
      case 'low':
        return 'bg-success-100 text-success-700';
      default:
        return 'bg-sand-100 text-primary-600';
    }
  };

  return (
    <AdminSidebar activeTab="broadcast" showRoleSelector={false}>
      <div className="p-4 sm:p-6 space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary-800">
              {t('broadcast') || 'Broadcast'}
            </h1>
            <p className="text-sm text-primary-500 mt-1">
              {t('sendNotificationsToUsers') || 'Send notifications to users across the platform'}
            </p>
          </div>
          <button onClick={handleCreateBroadcast} className="btn-primary">
            <Plus className="w-4 h-4" />
            {t('createBroadcast') || 'Create Broadcast'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Broadcast List */}
          <div className="lg:col-span-1">
            <div className="card p-4 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-primary-400" />
                <input
                  type="text"
                  placeholder={t('search') || 'Search...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-9 text-sm"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as NotificationStatus | 'all')}
                  className="input text-sm flex-1"
                >
                  <option value="all">{t('allStatuses') || 'All Statuses'}</option>
                  <option value="draft">{t('draft') || 'Draft'}</option>
                  <option value="scheduled">{t('scheduled') || 'Scheduled'}</option>
                  <option value="sent">{t('sent') || 'Sent'}</option>
                  <option value="paused">{t('paused') || 'Paused'}</option>
                  <option value="failed">{t('failed') || 'Failed'}</option>
                </select>
              </div>

              {/* List */}
              <div className="space-y-2">
                {filteredBroadcasts.length === 0 ? (
                  <EmptyState
                    icon={<Megaphone className="w-12 h-12 text-primary-300" />}
                    title={t('noBroadcastsFound') || 'No broadcasts found'}
                    description={t('createFirstBroadcast') || 'Create your first broadcast'}
                  />
                ) : (
                  filteredBroadcasts.map(bc => (
                    <button
                      key={bc.id}
                      onClick={() => setSelectedBroadcast(bc)}
                      className={`w-full text-left p-3 rounded-lg border transition ${
                        selectedBroadcast?.id === bc.id
                          ? 'border-primary-300 bg-primary-50'
                          : 'border-sand-100 hover:border-sand-200 hover:bg-sand-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-medium text-primary-800 truncate text-sm">{bc.title}</p>
                        {getStatusIcon(bc.status)}
                      </div>
                      <p className="text-xs text-primary-500 line-clamp-2 mb-2">{bc.message}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`badge ${getStatusColor(bc.status)}`}>{bc.status}</span>
                        <span className={`badge ${getPriorityColor(bc.priority)}`}>{bc.priority}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="lg:col-span-2">
            {selectedBroadcast ? (
              <div className="space-y-4">
                {/* Header Card */}
                <div className="card p-4 bg-gradient-to-br from-primary-50 to-sand-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-primary-800">{selectedBroadcast.title}</h2>
                      <p className="text-sm text-primary-600 mt-1" dir="rtl">
                        {selectedBroadcast.titleAr}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`badge text-sm ${getStatusColor(selectedBroadcast.status)}`}>
                          {selectedBroadcast.status}
                        </span>
                        <span className={`badge text-sm ${getPriorityColor(selectedBroadcast.priority)}`}>
                          {selectedBroadcast.priority}
                        </span>
                        {selectedBroadcast.testMode && (
                          <span className="badge bg-accent-100 text-accent-700 text-sm">
                            {t('testMode') || 'Test Mode'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {selectedBroadcast.status === 'draft' && (
                        <>
                          <button
                            onClick={() => handleEditBroadcast(selectedBroadcast)}
                            className="btn-secondary text-sm"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSendBroadcast(selectedBroadcast)}
                            className="btn-primary text-sm"
                          >
                            <Send className="w-4 h-4" />
                            {t('send') || 'Send'}
                          </button>
                        </>
                      )}
                      {selectedBroadcast.status !== 'draft' && (
                        <button
                          onClick={() => handleDeleteBroadcast(selectedBroadcast)}
                          className="btn-secondary text-sm text-error-600 hover:bg-error-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div className="card p-4">
                  <h3 className="font-bold text-primary-800 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    {t('message') || 'Message'}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-primary-600 font-medium mb-1">{t('english') || 'English'}</p>
                      <div className="bg-sand-50 p-3 rounded-lg border border-sand-100">
                        <p className="text-sm text-primary-700">{selectedBroadcast.message}</p>
                      </div>
                    </div>
                    {selectedBroadcast.messageAr && (
                      <div>
                        <p className="text-xs text-primary-600 font-medium mb-1">{t('arabic') || 'Arabic'}</p>
                        <div className="bg-sand-50 p-3 rounded-lg border border-sand-100" dir="rtl">
                          <p className="text-sm text-primary-700">{selectedBroadcast.messageAr}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery & Audience */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="card p-4">
                    <h3 className="font-bold text-primary-800 mb-3 flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4" />
                      {t('targetAudience') || 'Target Audience'}
                    </h3>
                    <p className="text-sm text-primary-700 capitalize">{selectedBroadcast.targetAudience.replace(/_/g, ' ')}</p>
                  </div>

                  <div className="card p-4">
                    <h3 className="font-bold text-primary-800 mb-3 flex items-center gap-2 text-sm">
                      <Bell className="w-4 h-4" />
                      {t('notificationTypes') || 'Types'}
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedBroadcast.type.map(type => (
                        <span key={type} className="badge bg-primary-100 text-primary-700 text-xs">
                          {type.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Delivery Stats (if sent) */}
                {selectedBroadcast.deliveryStats && (
                  <div className="card p-4">
                    <h3 className="font-bold text-primary-800 mb-3 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      {t('deliveryStats') || 'Delivery Statistics'}
                    </h3>
                    <div className="grid grid-cols-5 gap-2">
                      <div className="bg-sand-50 p-2 rounded text-center">
                        <p className="text-xs text-primary-600 font-medium">{t('total') || 'Total'}</p>
                        <p className="text-lg font-bold text-primary-800">{selectedBroadcast.deliveryStats.total}</p>
                      </div>
                      <div className="bg-success-50 p-2 rounded text-center">
                        <p className="text-xs text-success-600 font-medium">{t('delivered') || 'Delivered'}</p>
                        <p className="text-lg font-bold text-success-700">{selectedBroadcast.deliveryStats.delivered}</p>
                      </div>
                      <div className="bg-primary-50 p-2 rounded text-center">
                        <p className="text-xs text-primary-600 font-medium">{t('opened') || 'Opened'}</p>
                        <p className="text-lg font-bold text-primary-700">{selectedBroadcast.deliveryStats.opened}</p>
                      </div>
                      <div className="bg-accent-50 p-2 rounded text-center">
                        <p className="text-xs text-accent-600 font-medium">{t('clicked') || 'Clicked'}</p>
                        <p className="text-lg font-bold text-accent-700">{selectedBroadcast.deliveryStats.clicked}</p>
                      </div>
                      <div className="bg-error-50 p-2 rounded text-center">
                        <p className="text-xs text-error-600 font-medium">{t('failed') || 'Failed'}</p>
                        <p className="text-lg font-bold text-error-700">{selectedBroadcast.deliveryStats.failed}</p>
                      </div>
                    </div>

                    {/* Delivery Rates */}
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div>
                        <p className="text-xs text-primary-600 font-medium mb-1">{t('deliveryRate') || 'Delivery Rate'}</p>
                        <div className="w-full bg-sand-200 rounded-full h-2">
                          <div
                            className="bg-success-600 h-2 rounded-full"
                            style={{
                              width: `${
                                selectedBroadcast.deliveryStats.total > 0
                                  ? (selectedBroadcast.deliveryStats.delivered / selectedBroadcast.deliveryStats.total) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-primary-700 mt-1 font-bold">
                          {selectedBroadcast.deliveryStats.total > 0
                            ? ((selectedBroadcast.deliveryStats.delivered / selectedBroadcast.deliveryStats.total) * 100).toFixed(1)
                            : 0}
                          %
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-primary-600 font-medium mb-1">{t('openRate') || 'Open Rate'}</p>
                        <div className="w-full bg-sand-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{
                              width: `${
                                selectedBroadcast.deliveryStats.delivered > 0
                                  ? (selectedBroadcast.deliveryStats.opened / selectedBroadcast.deliveryStats.delivered) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-primary-700 mt-1 font-bold">
                          {selectedBroadcast.deliveryStats.delivered > 0
                            ? ((selectedBroadcast.deliveryStats.opened / selectedBroadcast.deliveryStats.delivered) * 100).toFixed(1)
                            : 0}
                          %
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-primary-600 font-medium mb-1">{t('clickRate') || 'Click Rate'}</p>
                        <div className="w-full bg-sand-200 rounded-full h-2">
                          <div
                            className="bg-accent-600 h-2 rounded-full"
                            style={{
                              width: `${
                                selectedBroadcast.deliveryStats.opened > 0
                                  ? (selectedBroadcast.deliveryStats.clicked / selectedBroadcast.deliveryStats.opened) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-primary-700 mt-1 font-bold">
                          {selectedBroadcast.deliveryStats.opened > 0
                            ? ((selectedBroadcast.deliveryStats.clicked / selectedBroadcast.deliveryStats.opened) * 100).toFixed(1)
                            : 0}
                          %
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="card p-4">
                  <h3 className="font-bold text-primary-800 mb-3 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    {t('metadata') || 'Metadata'}
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-primary-600 font-medium">{t('createdAt') || 'Created At'}</p>
                      <p className="text-primary-800 mt-1">
                        {new Date(selectedBroadcast.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-primary-600 font-medium">{t('createdBy') || 'Created By'}</p>
                      <p className="text-primary-800 mt-1">{selectedBroadcast.createdBy}</p>
                    </div>
                    {selectedBroadcast.scheduledFor && (
                      <div>
                        <p className="text-primary-600 font-medium">{t('scheduledFor') || 'Scheduled For'}</p>
                        <p className="text-primary-800 mt-1">
                          {new Date(selectedBroadcast.scheduledFor).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {selectedBroadcast.sentAt && (
                      <div>
                        <p className="text-primary-600 font-medium">{t('sentAt') || 'Sent At'}</p>
                        <p className="text-primary-800 mt-1">
                          {new Date(selectedBroadcast.sentAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card p-8">
                <EmptyState
                  icon={<Megaphone className="w-12 h-12 text-primary-300" />}
                  title={t('noBroadcastSelected') || 'No broadcast selected'}
                  description={t('selectBroadcastToViewDetails') || 'Select a broadcast from the list to view details'}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <BroadcastModal
          broadcast={editingBroadcast}
          onClose={() => setShowModal(false)}
          onSave={handleSaveBroadcast}
        />
      )}
    </AdminSidebar>
  );
}

interface BroadcastModalProps {
  broadcast: BroadcastNotification | null;
  onClose: () => void;
  onSave: (broadcast: Partial<BroadcastNotification>) => void;
}

function BroadcastModal({ broadcast, onClose, onSave }: BroadcastModalProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState(
    broadcast || {
      title: '',
      titleAr: '',
      message: '',
      messageAr: '',
      type: ['in_app'] as NotificationType[],
      targetAudience: 'all_users' as TargetAudience,
      priority: 'medium',
      testMode: false,
    }
  );

  const handleTypeToggle = (type: NotificationType) => {
    setFormData(prev => ({
      ...prev,
      type: prev.type.includes(type) ? prev.type.filter(t => t !== type) : [...prev.type, type],
    }));
  };

  const handleSave = () => {
    if (!formData.title || !formData.message) {
      alert(t('fillRequiredFields') || 'Please fill all required fields');
      return;
    }
    onSave(formData);
  };

  return (
    <Modal
      title={broadcast ? t('editBroadcast') || 'Edit Broadcast' : t('createBroadcast') || 'Create Broadcast'}
      onClose={onClose}
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        <div>
          <label className="block text-sm font-medium text-primary-800 mb-1">
            {t('title') || 'Title'} (English) *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Broadcast title"
            className="input w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-800 mb-1">
            {t('title') || 'Title'} (Arabic)
          </label>
          <input
            type="text"
            value={formData.titleAr}
            onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
            placeholder="عنوان البث"
            className="input w-full"
            dir="rtl"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-800 mb-1">
            {t('message') || 'Message'} (English) *
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Broadcast message"
            className="input w-full h-20 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-800 mb-1">
            {t('message') || 'Message'} (Arabic)
          </label>
          <textarea
            value={formData.messageAr}
            onChange={(e) => setFormData({ ...formData, messageAr: e.target.value })}
            placeholder="رسالة البث"
            className="input w-full h-20 resize-none"
            dir="rtl"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-800 mb-2">
            {t('notificationTypes') || 'Notification Types'}
          </label>
          <div className="flex gap-2">
            {(['in_app', 'push', 'email', 'sms'] as NotificationType[]).map(type => (
              <button
                key={type}
                onClick={() => handleTypeToggle(type)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  formData.type.includes(type)
                    ? 'bg-primary-600 text-white'
                    : 'bg-sand-100 text-primary-700 hover:bg-sand-200'
                }`}
              >
                {type.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-800 mb-1">
            {t('targetAudience') || 'Target Audience'} *
          </label>
          <select
            value={formData.targetAudience}
            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as TargetAudience })}
            className="input w-full"
          >
            <option value="all_users">{t('allUsers') || 'All Users'}</option>
            <option value="all_buyers">{t('allBuyers') || 'All Buyers'}</option>
            <option value="all_sellers">{t('allSellers') || 'All Sellers'}</option>
            <option value="premium_users">{t('premiumUsers') || 'Premium Users'}</option>
            <option value="new_users">{t('newUsers') || 'New Users'}</option>
            <option value="inactive_users">{t('inactiveUsers') || 'Inactive Users'}</option>
            <option value="custom">{t('custom') || 'Custom'}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-800 mb-1">
            {t('priority') || 'Priority'} *
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
            className="input w-full"
          >
            <option value="low">{t('low') || 'Low'}</option>
            <option value="medium">{t('medium') || 'Medium'}</option>
            <option value="high">{t('high') || 'High'}</option>
            <option value="critical">{t('critical') || 'Critical'}</option>
          </select>
        </div>

        <div className="flex gap-2 pt-4 border-t border-sand-100">
          <button onClick={onClose} className="btn-secondary flex-1">
            {t('cancel') || 'Cancel'}
          </button>
          <button onClick={handleSave} className="btn-primary flex-1">
            {t('save') || 'Save'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
