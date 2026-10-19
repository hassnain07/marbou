import { useState, useMemo } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Modal, EmptyState } from '@/components/ui';
import {
  ImageIcon, Plus, Edit2, Trash2, Search, Filter, AlertCircle, Check,
  HardDrive, Zap, BarChart3, Copy, Settings, FileType, Weight, Layers
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

type MediaType = 'image' | 'video' | 'document' | 'audio';
type LimitScope = 'user_subscription' | 'listing' | 'message' | 'global';

interface MediaLimit {
  id: string;
  mediaType: MediaType;
  limitScope: LimitScope;
  maxFileSize: number; // in MB
  maxFilesPerUpload: number;
  allowedFormats: string[];
  maxTotalStoragePerUser: number; // in MB
  enableCompression: boolean;
  compressionQuality?: number; // 0-100
  createdAt: string;
  updatedAt: string;
  modifiedBy: string;
  isActive: boolean;
  notes?: string;
}

const mockMediaLimits: MediaLimit[] = [
  {
    id: 'ml-1',
    mediaType: 'image',
    limitScope: 'listing',
    maxFileSize: 10,
    maxFilesPerUpload: 20,
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    maxTotalStoragePerUser: 5000,
    enableCompression: true,
    compressionQuality: 85,
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2025-01-10T14:30:00Z',
    modifiedBy: 'Admin User',
    isActive: true,
    notes: 'Standard image limits for listings',
  },
  {
    id: 'ml-2',
    mediaType: 'video',
    limitScope: 'listing',
    maxFileSize: 500,
    maxFilesPerUpload: 5,
    allowedFormats: ['mp4', 'mov', 'avi', 'mkv'],
    maxTotalStoragePerUser: 50000,
    enableCompression: true,
    compressionQuality: 80,
    createdAt: '2024-11-15T00:00:00Z',
    updatedAt: '2025-01-08T10:15:00Z',
    modifiedBy: 'Admin User',
    isActive: true,
    notes: 'Video uploads limited to 500MB per file',
  },
  {
    id: 'ml-3',
    mediaType: 'document',
    limitScope: 'message',
    maxFileSize: 50,
    maxFilesPerUpload: 3,
    allowedFormats: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
    maxTotalStoragePerUser: 10000,
    enableCompression: false,
    createdAt: '2024-10-20T00:00:00Z',
    updatedAt: '2025-01-12T09:00:00Z',
    modifiedBy: 'Admin User',
    isActive: true,
  },
  {
    id: 'ml-4',
    mediaType: 'audio',
    limitScope: 'user_subscription',
    maxFileSize: 100,
    maxFilesPerUpload: 10,
    allowedFormats: ['mp3', 'wav', 'flac', 'aac', 'm4a'],
    maxTotalStoragePerUser: 20000,
    enableCompression: false,
    createdAt: '2024-09-10T00:00:00Z',
    updatedAt: '2024-12-15T08:30:00Z',
    modifiedBy: 'Admin User',
    isActive: false,
  },
];

export function AdminMediaLimitsPage() {
  const { t } = useI18n();
  const { showToast } = useApp();

  const [limits, setLimits] = useState<MediaLimit[]>(mockMediaLimits);
  const [selectedLimit, setSelectedLimit] = useState<MediaLimit | null>(mockMediaLimits[0]);
  const [showModal, setShowModal] = useState(false);
  const [editingLimit, setEditingLimit] = useState<MediaLimit | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterScope, setFilterScope] = useState<LimitScope | 'all'>('all');

  const filteredLimits = useMemo(() => {
    return limits.filter(limit => {
      const matchesSearch =
        limit.mediaType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        limit.notes?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesScope = filterScope === 'all' || limit.limitScope === filterScope;

      return matchesSearch && matchesScope;
    });
  }, [limits, searchQuery, filterScope]);

  const handleAddLimit = () => {
    setEditingLimit(null);
    setShowModal(true);
  };

  const handleEditLimit = (limit: MediaLimit) => {
    setEditingLimit(limit);
    setShowModal(true);
  };

  const handleSaveLimit = (limitData: Partial<MediaLimit>) => {
    if (editingLimit) {
      setLimits(limits.map(l => (l.id === editingLimit.id ? { ...l, ...limitData } : l)));
      showToast(t('mediaLimitUpdated') || 'Media limit updated', 'success');
    } else {
      const newLimit: MediaLimit = {
        id: `ml-${Date.now()}`,
        mediaType: limitData.mediaType || 'image',
        limitScope: limitData.limitScope || 'listing',
        maxFileSize: limitData.maxFileSize || 10,
        maxFilesPerUpload: limitData.maxFilesPerUpload || 1,
        allowedFormats: limitData.allowedFormats || [],
        maxTotalStoragePerUser: limitData.maxTotalStoragePerUser || 1000,
        enableCompression: limitData.enableCompression || false,
        compressionQuality: limitData.compressionQuality,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        modifiedBy: 'Admin User',
        isActive: limitData.isActive !== false,
      };
      setLimits([...limits, newLimit]);
      setSelectedLimit(newLimit);
      showToast(t('mediaLimitCreated') || 'Media limit created', 'success');
    }
    setShowModal(false);
  };

  const handleDeleteLimit = (limit: MediaLimit) => {
    setLimits(limits.filter(l => l.id !== limit.id));
    if (selectedLimit?.id === limit.id) {
      setSelectedLimit(limits[0] || null);
    }
    showToast(t('mediaLimitDeleted') || 'Media limit deleted', 'success');
  };

  const getMediaTypeIcon = (type: MediaType) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-primary-600" />;
      case 'video':
        return <Layers className="w-4 h-4 text-warning-600" />;
      case 'document':
        return <FileType className="w-4 h-4 text-success-600" />;
      case 'audio':
        return <Zap className="w-4 h-4 text-accent-600" />;
    }
  };

  const formatBytes = (mb: number): string => {
    if (mb >= 1000) {
      return `${(mb / 1000).toFixed(1)} GB`;
    }
    return `${mb} MB`;
  };

  return (
    <AdminSidebar activeTab="media-limits" showRoleSelector={false}>
      <div className="p-4 sm:p-6 space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary-800">
              {t('mediaLimits') || 'Media Limits'}
            </h1>
            <p className="text-sm text-primary-500 mt-1">
              {t('configureUploadLimits') || 'Configure upload size and file type limits'}
            </p>
          </div>
          <button onClick={handleAddLimit} className="btn-primary">
            <Plus className="w-4 h-4" />
            {t('addMediaLimit') || 'Add Media Limit'}
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
                  value={filterScope}
                  onChange={(e) => setFilterScope(e.target.value as LimitScope | 'all')}
                  className="input text-sm flex-1"
                >
                  <option value="all">{t('allScopes') || 'All Scopes'}</option>
                  <option value="listing">{t('listing') || 'Listing'}</option>
                  <option value="message">{t('message') || 'Message'}</option>
                  <option value="user_subscription">{t('userSubscription') || 'User Subscription'}</option>
                  <option value="global">{t('global') || 'Global'}</option>
                </select>
              </div>

              {/* List */}
              <div className="space-y-2">
                {filteredLimits.length === 0 ? (
                  <EmptyState
                    icon={<ImageIcon className="w-12 h-12 text-primary-300" />}
                    title={t('noLimitsFound') || 'No media limits'}
                    description={t('createFirstLimit') || 'Create your first media limit'}
                  />
                ) : (
                  filteredLimits.map(limit => (
                    <button
                      key={limit.id}
                      onClick={() => setSelectedLimit(limit)}
                      className={`w-full text-left p-3 rounded-lg border transition ${
                        selectedLimit?.id === limit.id
                          ? 'border-primary-300 bg-primary-50'
                          : 'border-sand-100 hover:border-sand-200 hover:bg-sand-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {getMediaTypeIcon(limit.mediaType)}
                            <p className="font-medium text-primary-800 capitalize">{limit.mediaType}</p>
                          </div>
                          <p className="text-xs text-primary-500 mt-1">{limit.limitScope}</p>
                        </div>
                        {limit.isActive && <Check className="w-4 h-4 text-success-600 shrink-0" />}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="lg:col-span-2">
            {selectedLimit ? (
              <div className="space-y-4">
                {/* Header Card */}
                <div className="card p-4 bg-gradient-to-br from-primary-50 to-sand-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getMediaTypeIcon(selectedLimit.mediaType)}
                        <h2 className="text-xl font-bold text-primary-800 capitalize">
                          {selectedLimit.mediaType} {t('limits') || 'Limits'}
                        </h2>
                      </div>
                      <p className="text-sm text-primary-600 mt-1 capitalize">{selectedLimit.limitScope}</p>
                      {selectedLimit.notes && (
                        <p className="text-sm text-primary-600 mt-2">{selectedLimit.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditLimit(selectedLimit)}
                        className="btn-secondary text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLimit(selectedLimit)}
                        className="btn-secondary text-sm text-error-600 hover:bg-error-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* File Size Limits */}
                <div className="card p-4">
                  <h3 className="font-bold text-primary-800 mb-4 flex items-center gap-2">
                    <Weight className="w-4 h-4" />
                    {t('fileSizeLimits') || 'File Size Limits'}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-sand-50 p-3 rounded-lg border border-sand-100">
                      <p className="text-xs text-primary-600 font-medium mb-1">{t('maxFileSize') || 'Max File Size'}</p>
                      <p className="text-lg font-bold text-primary-800">
                        {formatBytes(selectedLimit.maxFileSize)}
                      </p>
                    </div>
                    <div className="bg-sand-50 p-3 rounded-lg border border-sand-100">
                      <p className="text-xs text-primary-600 font-medium mb-1">
                        {t('maxFilesPerUpload') || 'Max Files Per Upload'}
                      </p>
                      <p className="text-lg font-bold text-primary-800">{selectedLimit.maxFilesPerUpload}</p>
                    </div>
                    <div className="bg-sand-50 p-3 rounded-lg border border-sand-100 col-span-2">
                      <p className="text-xs text-primary-600 font-medium mb-1">
                        {t('maxTotalStorage') || 'Max Total Storage Per User'}
                      </p>
                      <p className="text-lg font-bold text-primary-800">
                        {formatBytes(selectedLimit.maxTotalStoragePerUser)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Allowed Formats */}
                <div className="card p-4">
                  <h3 className="font-bold text-primary-800 mb-3 flex items-center gap-2">
                    <FileType className="w-4 h-4" />
                    {t('allowedFormats') || 'Allowed Formats'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedLimit.allowedFormats.map(format => (
                      <span key={format} className="badge bg-primary-100 text-primary-700 text-sm">
                        .{format}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Compression Settings */}
                {selectedLimit.enableCompression && (
                  <div className="card p-4 bg-gradient-to-br from-success-50 to-sand-50">
                    <h3 className="font-bold text-primary-800 mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-success-600" />
                      {t('compressionEnabled') || 'Compression Enabled'}
                    </h3>
                    {selectedLimit.compressionQuality !== undefined && (
                      <div className="bg-white p-3 rounded-lg border border-sand-100">
                        <p className="text-sm text-primary-600 font-medium mb-2">
                          {t('compressionQuality') || 'Compression Quality'}
                        </p>
                        <div className="w-full bg-sand-200 rounded-full h-2">
                          <div
                            className="bg-success-600 h-2 rounded-full transition-all"
                            style={{ width: `${selectedLimit.compressionQuality}%` }}
                          />
                        </div>
                        <p className="text-primary-700 font-bold mt-2">{selectedLimit.compressionQuality}%</p>
                      </div>
                    )}
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
                      <p className="text-primary-600 font-medium">{t('status') || 'Status'}</p>
                      <p className="text-primary-800 mt-1">
                        <span className={`badge ${selectedLimit.isActive ? 'bg-success-100 text-success-700' : 'bg-sand-100 text-primary-600'}`}>
                          {selectedLimit.isActive ? t('active') || 'Active' : t('inactive') || 'Inactive'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-primary-600 font-medium">{t('modifiedBy') || 'Modified By'}</p>
                      <p className="text-primary-800 mt-1">{selectedLimit.modifiedBy}</p>
                    </div>
                    <div>
                      <p className="text-primary-600 font-medium">{t('createdAt') || 'Created At'}</p>
                      <p className="text-primary-800 mt-1">
                        {new Date(selectedLimit.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-primary-600 font-medium">{t('updatedAt') || 'Updated At'}</p>
                      <p className="text-primary-800 mt-1">
                        {new Date(selectedLimit.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card p-8">
                <EmptyState
                  icon={<ImageIcon className="w-12 h-12 text-primary-300" />}
                  title={t('noLimitSelected') || 'No limit selected'}
                  description={t('selectLimitToViewDetails') || 'Select a media limit from the list to view details'}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <MediaLimitModal
          limit={editingLimit}
          onClose={() => setShowModal(false)}
          onSave={handleSaveLimit}
        />
      )}
    </AdminSidebar>
  );
}

interface MediaLimitModalProps {
  limit: MediaLimit | null;
  onClose: () => void;
  onSave: (limit: Partial<MediaLimit>) => void;
}

function MediaLimitModal({ limit, onClose, onSave }: MediaLimitModalProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState(
    limit || {
      mediaType: 'image' as MediaType,
      limitScope: 'listing' as LimitScope,
      maxFileSize: 10,
      maxFilesPerUpload: 1,
      allowedFormats: [],
      maxTotalStoragePerUser: 1000,
      enableCompression: false,
      isActive: true,
    }
  );

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Modal
      title={limit ? t('editMediaLimit') || 'Edit Media Limit' : t('addMediaLimit') || 'Add Media Limit'}
      onClose={onClose}
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary-800 mb-1">
              {t('mediaType') || 'Media Type'} *
            </label>
            <select
              value={formData.mediaType}
              onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as MediaType })}
              className="input w-full"
              disabled={!!limit}
            >
              <option value="image">{t('image') || 'Image'}</option>
              <option value="video">{t('video') || 'Video'}</option>
              <option value="document">{t('document') || 'Document'}</option>
              <option value="audio">{t('audio') || 'Audio'}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-800 mb-1">
              {t('limitScope') || 'Limit Scope'} *
            </label>
            <select
              value={formData.limitScope}
              onChange={(e) => setFormData({ ...formData, limitScope: e.target.value as LimitScope })}
              className="input w-full"
            >
              <option value="listing">{t('listing') || 'Listing'}</option>
              <option value="message">{t('message') || 'Message'}</option>
              <option value="user_subscription">{t('userSubscription') || 'User Subscription'}</option>
              <option value="global">{t('global') || 'Global'}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary-800 mb-1">
              {t('maxFileSize') || 'Max File Size (MB)'} *
            </label>
            <input
              type="number"
              value={formData.maxFileSize}
              onChange={(e) => setFormData({ ...formData, maxFileSize: parseInt(e.target.value) || 0 })}
              min="1"
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-800 mb-1">
              {t('maxFilesPerUpload') || 'Max Files Per Upload'} *
            </label>
            <input
              type="number"
              value={formData.maxFilesPerUpload}
              onChange={(e) => setFormData({ ...formData, maxFilesPerUpload: parseInt(e.target.value) || 1 })}
              min="1"
              className="input w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-800 mb-1">
            {t('maxTotalStorage') || 'Max Total Storage Per User (MB)'} *
          </label>
          <input
            type="number"
            value={formData.maxTotalStoragePerUser}
            onChange={(e) => setFormData({ ...formData, maxTotalStoragePerUser: parseInt(e.target.value) || 0 })}
            min="1"
            className="input w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-800 mb-2">
            {t('notes') || 'Notes'}
          </label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Optional notes about this limit"
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
