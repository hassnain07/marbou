import { useState, useMemo } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Modal, EmptyState } from '@/components/ui';
import {
  ToggleLeft, Plus, Edit2, Trash2, Search, Filter, Eye, Lock,
  CheckCircle, XCircle, Clock, AlertCircle, Copy, ChevronDown, ChevronUp
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

type FeatureStatus = 'active' | 'inactive' | 'beta' | 'deprecated';
type RolloutType = 'percentage' | 'user_list' | 'everyone' | 'admin_only';

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  status: FeatureStatus;
  rolloutType: RolloutType;
  rolloutPercentage?: number;
  allowedUsers?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags: string[];
  documentation?: string;
  affectsPages: string[];
}

const mockFeatureFlags: FeatureFlag[] = [
  {
    id: 'ff-1',
    key: 'new_dashboard_ui',
    name: 'New Dashboard UI',
    description: 'Redesigned admin dashboard with improved navigation and metrics',
    status: 'beta',
    rolloutType: 'percentage',
    rolloutPercentage: 45,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-10T14:30:00Z',
    createdBy: 'Admin User',
    tags: ['ui', 'dashboard', 'v2'],
    affectsPages: ['/admin', '/admin/users', '/admin/listings'],
  },
  {
    id: 'ff-2',
    key: 'advanced_search_filters',
    name: 'Advanced Search Filters',
    description: 'Enable advanced filtering options for search results',
    status: 'active',
    rolloutType: 'everyone',
    createdAt: '2024-12-15T00:00:00Z',
    updatedAt: '2025-01-08T10:15:00Z',
    createdBy: 'Admin User',
    tags: ['search', 'filters'],
    affectsPages: ['/search'],
  },
  {
    id: 'ff-3',
    key: 'real_time_notifications',
    name: 'Real-time Notifications',
    description: 'WebSocket-based real-time notification system',
    status: 'beta',
    rolloutType: 'user_list',
    allowedUsers: ['user-1', 'user-2', 'user-3'],
    createdAt: '2024-11-20T00:00:00Z',
    updatedAt: '2025-01-12T09:00:00Z',
    createdBy: 'Admin User',
    tags: ['notifications', 'websocket'],
    affectsPages: ['/'],
  },
  {
    id: 'ff-4',
    key: 'legacy_api_v1',
    name: 'Legacy API v1',
    description: 'Old API version - deprecated, use v2 instead',
    status: 'deprecated',
    rolloutType: 'admin_only',
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2025-01-14T08:30:00Z',
    createdBy: 'Admin User',
    tags: ['api', 'deprecated'],
    affectsPages: [],
  },
];

export function AdminFeatureFlagsPage() {
  const { t } = useI18n();
  const { showToast } = useApp();

  const [flags, setFlags] = useState<FeatureFlag[]>(mockFeatureFlags);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(mockFeatureFlags[0]);
  const [showModal, setShowModal] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FeatureStatus | 'all'>('all');
  const [expandedFlags, setExpandedFlags] = useState<Set<string>>(new Set());

  const filteredFlags = useMemo(() => {
    return flags.filter(flag => {
      const matchesSearch =
        flag.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flag.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterStatus === 'all' || flag.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [flags, searchQuery, filterStatus]);

  const handleAddFlag = () => {
    setEditingFlag(null);
    setShowModal(true);
  };

  const handleEditFlag = (flag: FeatureFlag) => {
    setEditingFlag(flag);
    setShowModal(true);
  };

  const handleSaveFlag = (flagData: Partial<FeatureFlag>) => {
    if (editingFlag) {
      setFlags(flags.map(f => (f.id === editingFlag.id ? { ...f, ...flagData } : f)));
      showToast(t('featureFlagUpdated') || 'Feature flag updated', 'success');
    } else {
      const newFlag: FeatureFlag = {
        id: `ff-${Date.now()}`,
        key: flagData.key || '',
        name: flagData.name || '',
        description: flagData.description || '',
        status: flagData.status || 'inactive',
        rolloutType: flagData.rolloutType || 'percentage',
        rolloutPercentage: flagData.rolloutPercentage || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Admin User',
        tags: flagData.tags || [],
        affectsPages: flagData.affectsPages || [],
      };
      setFlags([...flags, newFlag]);
      setSelectedFlag(newFlag);
      showToast(t('featureFlagCreated') || 'Feature flag created', 'success');
    }
    setShowModal(false);
  };

  const handleDeleteFlag = (flag: FeatureFlag) => {
    setFlags(flags.filter(f => f.id !== flag.id));
    if (selectedFlag?.id === flag.id) {
      setSelectedFlag(flags[0] || null);
    }
    showToast(t('featureFlagDeleted') || 'Feature flag deleted', 'success');
  };

  const toggleExpanded = (flagId: string) => {
    setExpandedFlags(prev => {
      const next = new Set(prev);
      if (next.has(flagId)) {
        next.delete(flagId);
      } else {
        next.add(flagId);
      }
      return next;
    });
  };

  const getStatusIcon = (status: FeatureStatus) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-success-600" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-primary-400" />;
      case 'beta':
        return <Clock className="w-4 h-4 text-warning-600" />;
      case 'deprecated':
        return <AlertCircle className="w-4 h-4 text-error-600" />;
    }
  };

  const getStatusColor = (status: FeatureStatus): string => {
    switch (status) {
      case 'active':
        return 'bg-success-100 text-success-700';
      case 'inactive':
        return 'bg-sand-100 text-primary-600';
      case 'beta':
        return 'bg-warning-100 text-warning-700';
      case 'deprecated':
        return 'bg-error-100 text-error-700';
    }
  };

  const getRolloutTypeLabel = (type: RolloutType): string => {
    const labels: Record<RolloutType, string> = {
      percentage: t('percentage') || 'Percentage',
      user_list: t('userList') || 'User List',
      everyone: t('everyone') || 'Everyone',
      admin_only: t('adminOnly') || 'Admin Only',
    };
    return labels[type];
  };

  return (
    <AdminSidebar activeTab="feature-flags" showRoleSelector={false}>
      <div className="p-4 sm:p-6 space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary-800">
              {t('featureFlags') || 'Feature Flags'}
            </h1>
            <p className="text-sm text-primary-500 mt-1">
              {t('manageFeaturesRollout') || 'Manage features and gradual rollouts'}
            </p>
          </div>
          <button onClick={handleAddFlag} className="btn-primary">
            <Plus className="w-4 h-4" />
            {t('addFeatureFlag') || 'Add Feature Flag'}
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

              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as FeatureStatus | 'all')}
                  className="input text-sm flex-1"
                >
                  <option value="all">{t('allStatuses') || 'All Statuses'}</option>
                  <option value="active">{t('active') || 'Active'}</option>
                  <option value="inactive">{t('inactive') || 'Inactive'}</option>
                  <option value="beta">{t('beta') || 'Beta'}</option>
                  <option value="deprecated">{t('deprecated') || 'Deprecated'}</option>
                </select>
              </div>

              {/* List */}
              <div className="space-y-2">
                {filteredFlags.length === 0 ? (
                  <EmptyState
                    icon={<ToggleLeft className="w-12 h-12 text-primary-300" />}
                    title={t('noFlagsFound') || 'No feature flags'}
                    description={t('createFirstFlag') || 'Create your first feature flag'}
                  />
                ) : (
                  filteredFlags.map(flag => (
                    <button
                      key={flag.id}
                      onClick={() => setSelectedFlag(flag)}
                      className={`w-full text-left p-3 rounded-lg border transition ${
                        selectedFlag?.id === flag.id
                          ? 'border-primary-300 bg-primary-50'
                          : 'border-sand-100 hover:border-sand-200 hover:bg-sand-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-primary-800 truncate">{flag.name}</p>
                          <p className="text-xs text-primary-500 font-mono">{flag.key}</p>
                        </div>
                        {getStatusIcon(flag.status)}
                      </div>
                      <div className="mt-2 flex items-center gap-1">
                        <span className={`badge text-xs ${getStatusColor(flag.status)}`}>
                          {t(flag.status as TranslationKey) || flag.status}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="lg:col-span-2">
            {selectedFlag ? (
              <div className="space-y-4">
                {/* Header Card */}
                <div className="card p-4 bg-gradient-to-br from-primary-50 to-sand-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-primary-800">{selectedFlag.name}</h2>
                      <p className="text-sm text-primary-600 mt-1">{selectedFlag.description}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className={`badge text-sm ${getStatusColor(selectedFlag.status)}`}>
                          {t(selectedFlag.status as TranslationKey) || selectedFlag.status}
                        </span>
                        <span className="badge bg-sand-100 text-primary-600 text-sm">
                          {getRolloutTypeLabel(selectedFlag.rolloutType)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditFlag(selectedFlag)}
                        className="btn-secondary text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFlag(selectedFlag)}
                        className="btn-secondary text-sm text-error-600 hover:bg-error-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="card p-4 space-y-4">
                  <div>
                    <h3 className="font-bold text-primary-800 mb-3 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      {t('flagDetails') || 'Flag Details'}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-primary-600 font-medium">{t('key') || 'Key'}</p>
                        <p className="text-primary-800 font-mono flex items-center gap-2 mt-1">
                          {selectedFlag.key}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(selectedFlag.key);
                              showToast(t('copied') || 'Copied', 'success');
                            }}
                            className="text-primary-400 hover:text-primary-600"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </p>
                      </div>
                      <div>
                        <p className="text-primary-600 font-medium">{t('createdBy') || 'Created By'}</p>
                        <p className="text-primary-800 mt-1">{selectedFlag.createdBy}</p>
                      </div>
                      <div>
                        <p className="text-primary-600 font-medium">{t('createdAt') || 'Created At'}</p>
                        <p className="text-primary-800 mt-1">
                          {new Date(selectedFlag.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-primary-600 font-medium">{t('updatedAt') || 'Updated At'}</p>
                        <p className="text-primary-800 mt-1">
                          {new Date(selectedFlag.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Rollout Configuration */}
                  <div className="pt-4 border-t border-sand-100">
                    <h3 className="font-bold text-primary-800 mb-3">{t('rolloutConfig') || 'Rollout Configuration'}</h3>
                    <div className="space-y-3 text-sm">
                      <div className="bg-sand-50 p-3 rounded-lg border border-sand-100">
                        <p className="text-primary-600 font-medium mb-1">{t('rolloutType') || 'Rollout Type'}</p>
                        <p className="text-primary-800">{getRolloutTypeLabel(selectedFlag.rolloutType)}</p>
                      </div>

                      {selectedFlag.rolloutType === 'percentage' && selectedFlag.rolloutPercentage !== undefined && (
                        <div className="bg-sand-50 p-3 rounded-lg border border-sand-100">
                          <p className="text-primary-600 font-medium mb-2">{t('rolloutPercentage') || 'Rollout Percentage'}</p>
                          <div className="w-full bg-sand-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full transition-all"
                              style={{ width: `${selectedFlag.rolloutPercentage}%` }}
                            />
                          </div>
                          <p className="text-primary-700 font-bold mt-2">{selectedFlag.rolloutPercentage}%</p>
                        </div>
                      )}

                      {selectedFlag.rolloutType === 'user_list' && selectedFlag.allowedUsers && (
                        <div className="bg-sand-50 p-3 rounded-lg border border-sand-100">
                          <p className="text-primary-600 font-medium mb-2">{t('allowedUsers') || 'Allowed Users'}</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedFlag.allowedUsers.map(userId => (
                              <span key={userId} className="badge bg-primary-100 text-primary-700 text-xs">
                                {userId}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tags & Pages */}
                  <div className="pt-4 border-t border-sand-100 space-y-3">
                    {selectedFlag.tags.length > 0 && (
                      <div>
                        <h3 className="font-bold text-primary-800 mb-2 text-sm">{t('tags') || 'Tags'}</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedFlag.tags.map(tag => (
                            <span key={tag} className="badge bg-sand-100 text-primary-600 text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedFlag.affectsPages.length > 0 && (
                      <div>
                        <h3 className="font-bold text-primary-800 mb-2 text-sm">{t('affectsPages') || 'Affects Pages'}</h3>
                        <div className="space-y-1">
                          {selectedFlag.affectsPages.map(page => (
                            <p key={page} className="text-sm text-primary-700 font-mono">
                              {page}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card p-8">
                <EmptyState
                  icon={<ToggleLeft className="w-12 h-12 text-primary-300" />}
                  title={t('noFlagSelected') || 'No flag selected'}
                  description={t('selectFlagToViewDetails') || 'Select a feature flag from the list to view details'}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <FeatureFlagModal
          flag={editingFlag}
          onClose={() => setShowModal(false)}
          onSave={handleSaveFlag}
        />
      )}
    </AdminSidebar>
  );
}

interface FeatureFlagModalProps {
  flag: FeatureFlag | null;
  onClose: () => void;
  onSave: (flag: Partial<FeatureFlag>) => void;
}

function FeatureFlagModal({ flag, onClose, onSave }: FeatureFlagModalProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState(
    flag || {
      key: '',
      name: '',
      description: '',
      status: 'inactive' as FeatureStatus,
      rolloutType: 'percentage' as RolloutType,
      rolloutPercentage: 50,
      tags: [],
      affectsPages: [],
    }
  );

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Modal
      title={flag ? t('editFeatureFlag') || 'Edit Feature Flag' : t('addFeatureFlag') || 'Add Feature Flag'}
      onClose={onClose}
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        <div>
          <label className="block text-sm font-medium text-primary-800 mb-1">
            {t('key') || 'Key'} *
          </label>
          <input
            type="text"
            value={formData.key}
            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
            placeholder="feature_flag_key"
            className="input w-full"
            disabled={!!flag}
          />
          <p className="text-xs text-primary-500 mt-1">{t('cannotChangeKey') || 'Cannot be changed after creation'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-800 mb-1">
            {t('name') || 'Name'} *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Feature flag name"
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
            placeholder="Describe what this feature flag controls"
            className="input w-full h-20 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary-800 mb-1">
              {t('status') || 'Status'} *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as FeatureStatus })}
              className="input w-full"
            >
              <option value="inactive">{t('inactive') || 'Inactive'}</option>
              <option value="active">{t('active') || 'Active'}</option>
              <option value="beta">{t('beta') || 'Beta'}</option>
              <option value="deprecated">{t('deprecated') || 'Deprecated'}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-800 mb-1">
              {t('rolloutType') || 'Rollout Type'} *
            </label>
            <select
              value={formData.rolloutType}
              onChange={(e) => setFormData({ ...formData, rolloutType: e.target.value as RolloutType })}
              className="input w-full"
            >
              <option value="percentage">{t('percentage') || 'Percentage'}</option>
              <option value="user_list">{t('userList') || 'User List'}</option>
              <option value="everyone">{t('everyone') || 'Everyone'}</option>
              <option value="admin_only">{t('adminOnly') || 'Admin Only'}</option>
            </select>
          </div>
        </div>

        {formData.rolloutType === 'percentage' && (
          <div>
            <label className="block text-sm font-medium text-primary-800 mb-1">
              {t('rolloutPercentage') || 'Rollout Percentage'}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.rolloutPercentage || 50}
              onChange={(e) => setFormData({ ...formData, rolloutPercentage: parseInt(e.target.value) })}
              className="w-full"
            />
            <p className="text-sm text-primary-700 font-bold mt-1">{formData.rolloutPercentage}%</p>
          </div>
        )}

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
