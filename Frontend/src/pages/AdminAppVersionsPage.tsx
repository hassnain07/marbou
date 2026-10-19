import { useState, useMemo } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Modal, EmptyState } from '@/components/ui';
import {
  Package, Plus, Edit2, Trash2, Search, Filter, AlertCircle, Check,
  Archive, AlertTriangle, Download, Copy, Settings, Calendar, TrendingUp
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

type Platform = 'ios' | 'android' | 'web';
type ReleaseType = 'stable' | 'beta' | 'alpha' | 'rc';
type UpdateType = 'optional' | 'recommended' | 'required';

interface AppVersion {
  id: string;
  platform: Platform;
  versionNumber: string;
  releaseType: ReleaseType;
  updateType: UpdateType;
  releaseDate: string;
  minSupportedVersion?: string;
  changelog: string;
  downloadUrl?: string;
  fileSize: number; // in MB
  releaseNotes: string;
  bugFixes: string[];
  features: string[];
  securityPatches: boolean;
  isDeprecated: boolean;
  supportEndsAt?: string;
  createdAt: string;
  releasedBy: string;
}

const mockAppVersions: AppVersion[] = [
  {
    id: 'av-1',
    platform: 'ios',
    versionNumber: '2.5.0',
    releaseType: 'stable',
    updateType: 'recommended',
    releaseDate: '2025-01-14T00:00:00Z',
    minSupportedVersion: '2.3.0',
    changelog: 'Latest improvements and stability fixes',
    fileSize: 145,
    releaseNotes: 'Version 2.5.0 brings improved performance and new features.',
    bugFixes: ['Fixed crash on startup', 'Improved image loading speed', 'Fixed notification display'],
    features: ['Dark mode support', 'New search UI', 'Improved filters'],
    securityPatches: true,
    isDeprecated: false,
    createdAt: '2025-01-14T00:00:00Z',
    releasedBy: 'Release Team',
  },
  {
    id: 'av-2',
    platform: 'android',
    versionNumber: '2.5.0',
    releaseType: 'stable',
    updateType: 'recommended',
    releaseDate: '2025-01-13T00:00:00Z',
    minSupportedVersion: '2.3.0',
    changelog: 'Feature parity with iOS',
    fileSize: 168,
    releaseNotes: 'Android version 2.5.0 sync with iOS features.',
    bugFixes: ['Fixed back button behavior', 'Improved battery performance', 'Fixed memory leaks'],
    features: ['Dark mode support', 'New search UI', 'Gesture improvements'],
    securityPatches: true,
    isDeprecated: false,
    createdAt: '2025-01-13T00:00:00Z',
    releasedBy: 'Release Team',
  },
  {
    id: 'av-3',
    platform: 'web',
    versionNumber: '2.5.1',
    releaseType: 'stable',
    updateType: 'optional',
    releaseDate: '2025-01-10T00:00:00Z',
    changelog: 'Minor fixes and optimizations',
    fileSize: 0,
    releaseNotes: 'Web platform maintenance release.',
    bugFixes: ['Fixed responsive layout', 'Improved API performance'],
    features: [],
    securityPatches: false,
    isDeprecated: false,
    createdAt: '2025-01-10T00:00:00Z',
    releasedBy: 'Release Team',
  },
];

export function AdminAppVersionsPage() {
  const { t } = useI18n();
  const { showToast } = useApp();

  const [versions, setVersions] = useState<AppVersion[]>(mockAppVersions);
  const [selectedVersion, setSelectedVersion] = useState<AppVersion | null>(mockAppVersions[0]);
  const [showModal, setShowModal] = useState(false);
  const [editingVersion, setEditingVersion] = useState<AppVersion | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'all'>('all');

  const filteredVersions = useMemo(() => {
    return versions.filter(version => {
      const matchesSearch =
        version.versionNumber.includes(searchQuery) ||
        version.changelog.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPlatform = filterPlatform === 'all' || version.platform === filterPlatform;

      return matchesSearch && matchesPlatform;
    });
  }, [versions, searchQuery, filterPlatform]);

  const handleAddVersion = () => {
    setEditingVersion(null);
    setShowModal(true);
  };

  const handleEditVersion = (version: AppVersion) => {
    setEditingVersion(version);
    setShowModal(true);
  };

  const handleSaveVersion = (versionData: Partial<AppVersion>) => {
    if (editingVersion) {
      setVersions(versions.map(v => (v.id === editingVersion.id ? { ...v, ...versionData } : v)));
      showToast(t('appVersionUpdated') || 'App version updated', 'success');
    } else {
      const newVersion: AppVersion = {
        id: `av-${Date.now()}`,
        platform: versionData.platform || 'ios',
        versionNumber: versionData.versionNumber || '1.0.0',
        releaseType: versionData.releaseType || 'alpha',
        updateType: versionData.updateType || 'optional',
        releaseDate: versionData.releaseDate || new Date().toISOString(),
        changelog: versionData.changelog || '',
        fileSize: versionData.fileSize || 0,
        releaseNotes: versionData.releaseNotes || '',
        bugFixes: versionData.bugFixes || [],
        features: versionData.features || [],
        securityPatches: versionData.securityPatches || false,
        isDeprecated: versionData.isDeprecated || false,
        createdAt: new Date().toISOString(),
        releasedBy: 'Admin User',
      };
      setVersions([...versions, newVersion]);
      setSelectedVersion(newVersion);
      showToast(t('appVersionCreated') || 'App version created', 'success');
    }
    setShowModal(false);
  };

  const handleDeleteVersion = (version: AppVersion) => {
    setVersions(versions.filter(v => v.id !== version.id));
    if (selectedVersion?.id === version.id) {
      setSelectedVersion(versions[0] || null);
    }
    showToast(t('appVersionDeleted') || 'App version deleted', 'success');
  };

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case 'ios':
        return '📱';
      case 'android':
        return '🤖';
      case 'web':
        return '🌐';
    }
  };

  const getReleaseTypeColor = (type: ReleaseType): string => {
    switch (type) {
      case 'stable':
        return 'bg-success-100 text-success-700';
      case 'beta':
        return 'bg-warning-100 text-warning-700';
      case 'alpha':
        return 'bg-accent-100 text-accent-700';
      case 'rc':
        return 'bg-primary-100 text-primary-700';
    }
  };

  const getUpdateTypeIcon = (type: UpdateType) => {
    switch (type) {
      case 'required':
        return <AlertCircle className="w-4 h-4 text-error-600" />;
      case 'recommended':
        return <TrendingUp className="w-4 h-4 text-warning-600" />;
      case 'optional':
        return <Download className="w-4 h-4 text-primary-600" />;
    }
  };

  return (
    <AdminSidebar activeTab="app-versions" showRoleSelector={false}>
      <div className="p-4 sm:p-6 space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary-800">
              {t('appVersions') || 'App Versions'}
            </h1>
            <p className="text-sm text-primary-500 mt-1">
              {t('manageAppReleases') || 'Manage and track app releases across platforms'}
            </p>
          </div>
          <button onClick={handleAddVersion} className="btn-primary">
            <Plus className="w-4 h-4" />
            {t('addAppVersion') || 'Add App Version'}
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
                  value={filterPlatform}
                  onChange={(e) => setFilterPlatform(e.target.value as Platform | 'all')}
                  className="input text-sm flex-1"
                >
                  <option value="all">{t('allPlatforms') || 'All Platforms'}</option>
                  <option value="ios">{t('ios') || 'iOS'}</option>
                  <option value="android">{t('android') || 'Android'}</option>
                  <option value="web">{t('web') || 'Web'}</option>
                </select>
              </div>

              {/* List */}
              <div className="space-y-2">
                {filteredVersions.length === 0 ? (
                  <EmptyState
                    icon={<Package className="w-12 h-12 text-primary-300" />}
                    title={t('noVersionsFound') || 'No app versions'}
                    description={t('createFirstVersion') || 'Create your first app version'}
                  />
                ) : (
                  filteredVersions.map(version => (
                    <button
                      key={version.id}
                      onClick={() => setSelectedVersion(version)}
                      className={`w-full text-left p-3 rounded-lg border transition ${
                        selectedVersion?.id === version.id
                          ? 'border-primary-300 bg-primary-50'
                          : 'border-sand-100 hover:border-sand-200 hover:bg-sand-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{getPlatformIcon(version.platform)}</span>
                            <p className="font-medium text-primary-800">{version.versionNumber}</p>
                          </div>
                          <p className="text-xs text-primary-500 mt-1">
                            {new Date(version.releaseDate).toLocaleDateString()}
                          </p>
                        </div>
                        {getUpdateTypeIcon(version.updateType)}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="lg:col-span-2">
            {selectedVersion ? (
              <div className="space-y-4">
                {/* Header Card */}
                <div className="card p-4 bg-gradient-to-br from-primary-50 to-sand-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getPlatformIcon(selectedVersion.platform)}</span>
                        <h2 className="text-xl font-bold text-primary-800">v{selectedVersion.versionNumber}</h2>
                      </div>
                      <p className="text-sm text-primary-600 mb-2">{selectedVersion.changelog}</p>
                      <div className="flex items-center gap-2">
                        <span className={`badge text-sm ${getReleaseTypeColor(selectedVersion.releaseType)}`}>
                          {selectedVersion.releaseType.toUpperCase()}
                        </span>
                        <span className="flex items-center gap-1 badge bg-sand-100 text-primary-600 text-sm">
                          {getUpdateTypeIcon(selectedVersion.updateType)}
                          {selectedVersion.updateType}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditVersion(selectedVersion)}
                        className="btn-secondary text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVersion(selectedVersion)}
                        className="btn-secondary text-sm text-error-600 hover:bg-error-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Release Notes */}
                <div className="card p-4">
                  <h3 className="font-bold text-primary-800 mb-3">{t('releaseNotes') || 'Release Notes'}</h3>
                  <p className="text-sm text-primary-700 whitespace-pre-wrap">{selectedVersion.releaseNotes}</p>
                </div>

                {/* Features and Fixes */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedVersion.features.length > 0 && (
                    <div className="card p-4">
                      <h3 className="font-bold text-primary-800 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-success-600" />
                        {t('features') || 'Features'} ({selectedVersion.features.length})
                      </h3>
                      <ul className="space-y-1 text-sm">
                        {selectedVersion.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-primary-700">
                            <Check className="w-3 h-3 text-success-600 mt-1 shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedVersion.bugFixes.length > 0 && (
                    <div className="card p-4">
                      <h3 className="font-bold text-primary-800 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-primary-600" />
                        {t('bugFixes') || 'Bug Fixes'} ({selectedVersion.bugFixes.length})
                      </h3>
                      <ul className="space-y-1 text-sm">
                        {selectedVersion.bugFixes.map((fix, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-primary-700">
                            <Check className="w-3 h-3 text-primary-600 mt-1 shrink-0" />
                            <span>{fix}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="card p-4">
                  <h3 className="font-bold text-primary-800 mb-3 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    {t('versionDetails') || 'Version Details'}
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-primary-600 font-medium">{t('releaseDate') || 'Release Date'}</p>
                      <p className="text-primary-800 mt-1">
                        {new Date(selectedVersion.releaseDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-primary-600 font-medium">{t('fileSize') || 'File Size'}</p>
                      <p className="text-primary-800 mt-1">
                        {selectedVersion.fileSize > 0 ? `${selectedVersion.fileSize} MB` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-primary-600 font-medium">{t('releasedBy') || 'Released By'}</p>
                      <p className="text-primary-800 mt-1">{selectedVersion.releasedBy}</p>
                    </div>
                    <div>
                      <p className="text-primary-600 font-medium">{t('securityPatches') || 'Security Patches'}</p>
                      <p className="text-primary-800 mt-1">
                        {selectedVersion.securityPatches ? (
                          <span className="badge bg-success-100 text-success-700 text-xs">{t('yes') || 'Yes'}</span>
                        ) : (
                          <span className="badge bg-sand-100 text-primary-600 text-xs">{t('no') || 'No'}</span>
                        )}
                      </p>
                    </div>
                    {selectedVersion.minSupportedVersion && (
                      <div>
                        <p className="text-primary-600 font-medium">{t('minSupportedVersion') || 'Min Supported'}</p>
                        <p className="text-primary-800 mt-1">v{selectedVersion.minSupportedVersion}</p>
                      </div>
                    )}
                    {selectedVersion.supportEndsAt && (
                      <div>
                        <p className="text-primary-600 font-medium">{t('supportEndsAt') || 'Support Ends'}</p>
                        <p className="text-primary-800 mt-1">
                          {new Date(selectedVersion.supportEndsAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card p-8">
                <EmptyState
                  icon={<Package className="w-12 h-12 text-primary-300" />}
                  title={t('noVersionSelected') || 'No version selected'}
                  description={t('selectVersionToViewDetails') || 'Select an app version from the list to view details'}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <AppVersionModal
          version={editingVersion}
          onClose={() => setShowModal(false)}
          onSave={handleSaveVersion}
        />
      )}
    </AdminSidebar>
  );
}

interface AppVersionModalProps {
  version: AppVersion | null;
  onClose: () => void;
  onSave: (version: Partial<AppVersion>) => void;
}

function AppVersionModal({ version, onClose, onSave }: AppVersionModalProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState(
    version || {
      platform: 'ios' as Platform,
      versionNumber: '',
      releaseType: 'alpha' as ReleaseType,
      updateType: 'optional' as UpdateType,
      releaseDate: new Date().toISOString().split('T')[0],
      changelog: '',
      fileSize: 0,
      releaseNotes: '',
      bugFixes: [],
      features: [],
      securityPatches: false,
      isDeprecated: false,
    }
  );

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Modal
      title={version ? t('editAppVersion') || 'Edit App Version' : t('addAppVersion') || 'Add App Version'}
      onClose={onClose}
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary-800 mb-1">
              {t('platform') || 'Platform'} *
            </label>
            <select
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value as Platform })}
              className="input w-full"
              disabled={!!version}
            >
              <option value="ios">{t('ios') || 'iOS'}</option>
              <option value="android">{t('android') || 'Android'}</option>
              <option value="web">{t('web') || 'Web'}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-800 mb-1">
              {t('versionNumber') || 'Version Number'} *
            </label>
            <input
              type="text"
              value={formData.versionNumber}
              onChange={(e) => setFormData({ ...formData, versionNumber: e.target.value })}
              placeholder="2.5.0"
              className="input w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary-800 mb-1">
              {t('releaseType') || 'Release Type'} *
            </label>
            <select
              value={formData.releaseType}
              onChange={(e) => setFormData({ ...formData, releaseType: e.target.value as ReleaseType })}
              className="input w-full"
            >
              <option value="stable">{t('stable') || 'Stable'}</option>
              <option value="beta">{t('beta') || 'Beta'}</option>
              <option value="alpha">{t('alpha') || 'Alpha'}</option>
              <option value="rc">{t('rc') || 'RC'}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-800 mb-1">
              {t('updateType') || 'Update Type'} *
            </label>
            <select
              value={formData.updateType}
              onChange={(e) => setFormData({ ...formData, updateType: e.target.value as UpdateType })}
              className="input w-full"
            >
              <option value="optional">{t('optional') || 'Optional'}</option>
              <option value="recommended">{t('recommended') || 'Recommended'}</option>
              <option value="required">{t('required') || 'Required'}</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-800 mb-1">
            {t('releaseDate') || 'Release Date'} *
          </label>
          <input
            type="date"
            value={formData.releaseDate}
            onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
            className="input w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-800 mb-1">
            {t('changelog') || 'Changelog'} *
          </label>
          <input
            type="text"
            value={formData.changelog}
            onChange={(e) => setFormData({ ...formData, changelog: e.target.value })}
            placeholder="Brief summary of changes"
            className="input w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-800 mb-1">
            {t('releaseNotes') || 'Release Notes'}
          </label>
          <textarea
            value={formData.releaseNotes}
            onChange={(e) => setFormData({ ...formData, releaseNotes: e.target.value })}
            placeholder="Detailed release notes"
            className="input w-full h-20 resize-none"
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
