import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Modal, EmptyState } from '@/components/ui';
import {
  AlertTriangle, Plus, Edit2, Trash2, Search, AlertCircle, Check,
  Clock, Wrench, Settings, Zap, Users, BarChart3, Info, Calendar
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

type MaintenanceStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';
type AffectedArea = 'frontend' | 'backend' | 'database' | 'api' | 'all';

interface MaintenanceWindow {
  id: string;
  title: string;
  description: string;
  status: MaintenanceStatus;
  affectedAreas: AffectedArea[];
  scheduledStartAt: string;
  scheduledEndAt: string;
  actualStartAt?: string;
  actualEndAt?: string;
  allowPublicAccess: boolean;
  maintenanceMessage: string;
  maintenanceMessageAr?: string;
  affectedUsers?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  contactEmail?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

const mockMaintenanceWindows: MaintenanceWindow[] = [
  {
    id: 'mw-1',
    title: 'Database Migration',
    description: 'Upgrading database to v14.5 for improved performance',
    status: 'completed',
    affectedAreas: ['database', 'api'],
    scheduledStartAt: '2025-01-12T02:00:00Z',
    scheduledEndAt: '2025-01-12T04:00:00Z',
    actualStartAt: '2025-01-12T02:05:00Z',
    actualEndAt: '2025-01-12T03:55:00Z',
    allowPublicAccess: false,
    maintenanceMessage: 'We are performing database maintenance. Service will be back shortly.',
    maintenanceMessageAr: 'نحن نجري صيانة قاعدة البيانات. ستعود الخدمة قريباً.',
    affectedUsers: 2450,
    priority: 'high',
    reason: 'Performance optimization and security patches',
    contactEmail: 'support@marbou.com',
    createdAt: '2025-01-10T00:00:00Z',
    createdBy: 'Admin User',
    updatedAt: '2025-01-12T04:00:00Z',
    updatedBy: 'Admin User',
  },
  {
    id: 'mw-2',
    title: 'System Security Patch',
    description: 'Critical security updates and vulnerability fixes',
    status: 'scheduled',
    affectedAreas: ['backend', 'api'],
    scheduledStartAt: '2025-01-20T22:00:00Z',
    scheduledEndAt: '2025-01-21T00:30:00Z',
    allowPublicAccess: true,
    maintenanceMessage: 'Read-only mode: You can browse but cannot create new listings.',
    maintenanceMessageAr: 'وضع القراءة فقط: يمكنك التصفح لكن لا يمكنك إنشاء قوائم جديدة.',
    affectedUsers: 5000,
    priority: 'critical',
    reason: 'Security patch for CVE-2025-xxxx',
    contactEmail: 'security@marbou.com',
    createdAt: '2025-01-14T00:00:00Z',
    createdBy: 'Admin User',
    updatedAt: '2025-01-14T00:00:00Z',
    updatedBy: 'Admin User',
  },
  {
    id: 'mw-3',
    title: 'Frontend Deployment',
    description: 'Deploying new UI improvements and performance enhancements',
    status: 'active',
    affectedAreas: ['frontend'],
    scheduledStartAt: '2025-01-14T10:00:00Z',
    scheduledEndAt: '2025-01-14T11:00:00Z',
    actualStartAt: '2025-01-14T10:02:00Z',
    allowPublicAccess: true,
    maintenanceMessage: 'We are updating our interface. You may experience brief interruptions.',
    maintenanceMessageAr: 'نحن نحدث واجهتنا. قد تواجه انقطاعات قصيرة.',
    affectedUsers: 1200,
    priority: 'low',
    reason: 'UI improvements and bug fixes',
    createdAt: '2025-01-14T08:00:00Z',
    createdBy: 'Admin User',
    updatedAt: '2025-01-14T10:02:00Z',
    updatedBy: 'Admin User',
  },
];

export function AdminMaintenanceModePage() {
  const { t } = useI18n();
  const { showToast } = useApp();

  const [windows, setWindows] = useState<MaintenanceWindow[]>(mockMaintenanceWindows);
  const [selectedWindow, setSelectedWindow] = useState<MaintenanceWindow | null>(mockMaintenanceWindows[0]);
  const [showModal, setShowModal] = useState(false);
  const [editingWindow, setEditingWindow] = useState<MaintenanceWindow | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWindows = windows.filter(win => {
    return (
      win.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      win.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleAddWindow = () => {
    setEditingWindow(null);
    setShowModal(true);
  };

  const handleEditWindow = (window: MaintenanceWindow) => {
    setEditingWindow(window);
    setShowModal(true);
  };

  const handleSaveWindow = (windowData: Partial<MaintenanceWindow>) => {
    if (editingWindow) {
      setWindows(
        windows.map(w => (w.id === editingWindow.id ? { ...w, ...windowData, updatedAt: new Date().toISOString() } : w))
      );
      showToast(t('maintenanceWindowUpdated') || 'Maintenance window updated', 'success');
    } else {
      const newWindow: MaintenanceWindow = {
        id: `mw-${Date.now()}`,
        title: windowData.title || '',
        description: windowData.description || '',
        status: 'scheduled',
        affectedAreas: windowData.affectedAreas || ['all'],
        scheduledStartAt: windowData.scheduledStartAt || '',
        scheduledEndAt: windowData.scheduledEndAt || '',
        allowPublicAccess: windowData.allowPublicAccess || false,
        maintenanceMessage: windowData.maintenanceMessage || '',
        affectedUsers: 0,
        priority: windowData.priority || 'medium',
        reason: windowData.reason || '',
        createdAt: new Date().toISOString(),
        createdBy: 'Admin User',
        updatedAt: new Date().toISOString(),
        updatedBy: 'Admin User',
      };
      setWindows([...windows, newWindow]);
      setSelectedWindow(newWindow);
      showToast(t('maintenanceWindowCreated') || 'Maintenance window created', 'success');
    }
    setShowModal(false);
  };

  const handleDeleteWindow = (window: MaintenanceWindow) => {
    setWindows(windows.filter(w => w.id !== window.id));
    if (selectedWindow?.id === window.id) {
      setSelectedWindow(windows[0] || null);
    }
    showToast(t('maintenanceWindowDeleted') || 'Maintenance window deleted', 'success');
  };

  const getStatusIcon = (status: MaintenanceStatus) => {
    switch (status) {
      case 'active':
        return <Zap className="w-4 h-4 text-warning-600" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-primary-600" />;
      case 'completed':
        return <Check className="w-4 h-4 text-success-600" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-primary-400" />;
    }
  };

  const getStatusColor = (status: MaintenanceStatus): string => {
    switch (status) {
      case 'active':
        return 'bg-warning-100 text-warning-700';
      case 'scheduled':
        return 'bg-primary-100 text-primary-700';
      case 'completed':
        return 'bg-success-100 text-success-700';
      case 'cancelled':
        return 'bg-sand-100 text-primary-600';
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

  const getDuration = (start: string, end: string): string => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <AdminSidebar activeTab="maintenance" showRoleSelector={false}>
      <div className="p-4 sm:p-6 space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary-800">
              {t('maintenanceMode') || 'Maintenance Mode'}
            </h1>
            <p className="text-sm text-primary-500 mt-1">
              {t('scheduleAndManageMaintenance') || 'Schedule and manage system maintenance windows'}
            </p>
          </div>
          <button onClick={handleAddWindow} className="btn-primary">
            <Plus className="w-4 h-4" />
            {t('scheduleMaintenanceWindow') || 'Schedule Window'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: List */}
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

              {/* List */}
              <div className="space-y-2">
                {filteredWindows.length === 0 ? (
                  <EmptyState
                    icon={<Wrench className="w-12 h-12 text-primary-300" />}
                    title={t('noWindowsFound') || 'No maintenance windows'}
                    description={t('createFirstWindow') || 'Schedule your first maintenance window'}
                  />
                ) : (
                  filteredWindows.map(win => (
                    <button
                      key={win.id}
                      onClick={() => setSelectedWindow(win)}
                      className={`w-full text-left p-3 rounded-lg border transition ${
                        selectedWindow?.id === win.id
                          ? 'border-primary-300 bg-primary-50'
                          : 'border-sand-100 hover:border-sand-200 hover:bg-sand-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-medium text-primary-800 truncate text-sm">{win.title}</p>
                        {getStatusIcon(win.status)}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`badge ${getStatusColor(win.status)}`}>
                          {win.status}
                        </span>
                        <span className={`badge ${getPriorityColor(win.priority)}`}>
                          {win.priority}
                        </span>
                      </div>
                      <p className="text-xs text-primary-500 mt-1">
                        {new Date(win.scheduledStartAt).toLocaleDateString()}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="lg:col-span-2">
            {selectedWindow ? (
              <div className="space-y-4">
                {/* Status Card */}
                <div className="card p-4 bg-gradient-to-br from-primary-50 to-sand-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(selectedWindow.status)}
                        <h2 className="text-xl font-bold text-primary-800">{selectedWindow.title}</h2>
                      </div>
                      <p className="text-sm text-primary-600 mb-2">{selectedWindow.description}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`badge text-sm ${getStatusColor(selectedWindow.status)}`}>
                          {selectedWindow.status}
                        </span>
                        <span className={`badge text-sm ${getPriorityColor(selectedWindow.priority)}`}>
                          {selectedWindow.priority}
                        </span>
                        {selectedWindow.allowPublicAccess && (
                          <span className="badge bg-success-100 text-success-700 text-sm">
                            {t('publicAccessAllowed') || 'Public Access Allowed'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditWindow(selectedWindow)}
                        className="btn-secondary text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteWindow(selectedWindow)}
                        className="btn-secondary text-sm text-error-600 hover:bg-error-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div className="card p-4">
                  <h3 className="font-bold text-primary-800 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {t('schedule') || 'Schedule'}
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-sand-50 p-3 rounded-lg border border-sand-100">
                        <p className="text-xs text-primary-600 font-medium mb-1">
                          {t('scheduledStart') || 'Scheduled Start'}
                        </p>
                        <p className="text-sm font-bold text-primary-800">
                          {new Date(selectedWindow.scheduledStartAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-sand-50 p-3 rounded-lg border border-sand-100">
                        <p className="text-xs text-primary-600 font-medium mb-1">
                          {t('scheduledEnd') || 'Scheduled End'}
                        </p>
                        <p className="text-sm font-bold text-primary-800">
                          {new Date(selectedWindow.scheduledEndAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="bg-primary-50 p-3 rounded-lg border border-primary-100">
                      <p className="text-xs text-primary-600 font-medium mb-1">
                        {t('estimatedDuration') || 'Estimated Duration'}
                      </p>
                      <p className="text-sm font-bold text-primary-800">
                        {getDuration(selectedWindow.scheduledStartAt, selectedWindow.scheduledEndAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Message & Impact */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="card p-4">
                    <h3 className="font-bold text-primary-800 mb-2 text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      {t('maintenanceMessage') || 'Message (EN)'}
                    </h3>
                    <p className="text-sm text-primary-700 bg-sand-50 p-2 rounded">
                      {selectedWindow.maintenanceMessage}
                    </p>
                  </div>

                  <div className="card p-4">
                    <h3 className="font-bold text-primary-800 mb-2 text-sm flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {t('estimatedImpact') || 'Estimated Impact'}
                    </h3>
                    <p className="text-sm font-bold text-primary-800">
                      {selectedWindow.affectedUsers?.toLocaleString()} {t('users') || 'users'}
                    </p>
                  </div>
                </div>

                {/* Affected Areas */}
                <div className="card p-4">
                  <h3 className="font-bold text-primary-800 mb-3 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    {t('affectedAreas') || 'Affected Areas'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedWindow.affectedAreas.map(area => (
                      <span key={area} className="badge bg-primary-100 text-primary-700 text-sm">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Reason & Contact */}
                <div className="card p-4">
                  <h3 className="font-bold text-primary-800 mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    {t('details') || 'Details'}
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-primary-600 font-medium mb-1">{t('reason') || 'Reason'}</p>
                      <p className="text-primary-700">{selectedWindow.reason}</p>
                    </div>
                    {selectedWindow.contactEmail && (
                      <div>
                        <p className="text-primary-600 font-medium mb-1">{t('contactEmail') || 'Contact Email'}</p>
                        <p className="text-primary-700 font-mono">{selectedWindow.contactEmail}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-sand-100 text-xs">
                      <div>
                        <p className="text-primary-600 font-medium">{t('createdBy') || 'Created By'}</p>
                        <p className="text-primary-800">{selectedWindow.createdBy}</p>
                      </div>
                      <div>
                        <p className="text-primary-600 font-medium">{t('createdAt') || 'Created At'}</p>
                        <p className="text-primary-800">
                          {new Date(selectedWindow.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card p-8">
                <EmptyState
                  icon={<Wrench className="w-12 h-12 text-primary-300" />}
                  title={t('noWindowSelected') || 'No window selected'}
                  description={t('selectWindowToViewDetails') || 'Select a maintenance window to view details'}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <MaintenanceWindowModal
          window={editingWindow}
          onClose={() => setShowModal(false)}
          onSave={handleSaveWindow}
        />
      )}
    </AdminSidebar>
  );
}

interface MaintenanceWindowModalProps {
  window: MaintenanceWindow | null;
  onClose: () => void;
  onSave: (window: Partial<MaintenanceWindow>) => void;
}

function MaintenanceWindowModal({ window, onClose, onSave }: MaintenanceWindowModalProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState(
    window || {
      title: '',
      description: '',
      affectedAreas: ['all'] as AffectedArea[],
      scheduledStartAt: '',
      scheduledEndAt: '',
      allowPublicAccess: false,
      maintenanceMessage: '',
      priority: 'medium',
      reason: '',
    }
  );

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Modal
      title={
        window
          ? t('editMaintenanceWindow') || 'Edit Maintenance Window'
          : t('scheduleMaintenanceWindow') || 'Schedule Maintenance Window'
      }
      onClose={onClose}
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        <div>
          <label className="block text-sm font-medium text-primary-800 mb-1">
            {t('title') || 'Title'} *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Database Migration"
            className="input w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-800 mb-1">
            {t('description') || 'Description'} *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe what maintenance will be performed"
            className="input w-full h-16 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-primary-800 mb-1">
              {t('reason') || 'Reason'} *
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Why is this maintenance needed"
              className="input w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary-800 mb-1">
              {t('scheduledStart') || 'Scheduled Start'} *
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledStartAt}
              onChange={(e) => setFormData({ ...formData, scheduledStartAt: e.target.value })}
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-800 mb-1">
              {t('scheduledEnd') || 'Scheduled End'} *
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledEndAt}
              onChange={(e) => setFormData({ ...formData, scheduledEndAt: e.target.value })}
              className="input w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-800 mb-1">
            {t('maintenanceMessage') || 'Maintenance Message'} *
          </label>
          <textarea
            value={formData.maintenanceMessage}
            onChange={(e) => setFormData({ ...formData, maintenanceMessage: e.target.value })}
            placeholder="Message to display to users during maintenance"
            className="input w-full h-16 resize-none"
          />
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
