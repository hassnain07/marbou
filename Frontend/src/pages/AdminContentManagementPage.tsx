import { useState, useMemo } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Modal, EmptyState } from '@/components/ui';
import {
  FileText, Plus, Edit2, Trash2, Search, Filter, Eye, Save,
  Clock, CheckCircle, Archive, RotateCcw, Copy, Calendar, User,
  AlertCircle, Bookmark, History, Globe
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

type PageStatus = 'draft' | 'published' | 'archived';
type PageType = 
  | 'terms-conditions'
  | 'privacy-policy'
  | 'acceptable-use'
  | 'prohibited-content'
  | 'listing-rules'
  | 'business-verification'
  | 'payment-terms'
  | 'refund-cancellation'
  | 'reports'
  | 'appeals'
  | 'data-retention'
  | 'location-privacy'
  | 'faq';

interface ContentVersion {
  id: string;
  versionNumber: number;
  title: string;
  content: string;
  status: PageStatus;
  createdAt: string;
  createdBy: string;
  publishedAt?: string;
  publishedBy?: string;
  archivedAt?: string;
  archivedBy?: string;
}

interface ContentPage {
  id: string;
  pageType: PageType;
  titleEn: string;
  titleAr: string;
  slug: string;
  currentStatus: PageStatus;
  currentVersion: ContentVersion;
  previousVersions: ContentVersion[];
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  viewCount: number;
  isPublished: boolean;
}

const mockContentPages: ContentPage[] = [
  {
    id: 'page-1',
    pageType: 'terms-conditions',
    titleEn: 'Terms & Conditions',
    titleAr: 'الشروط والأحكام',
    slug: 'terms-conditions',
    currentStatus: 'published',
    currentVersion: {
      id: 'v-1',
      versionNumber: 3,
      title: 'Terms & Conditions',
      content: 'These terms and conditions govern your use of the MARBOU platform. By accessing or using MARBOU, you agree to be bound by these terms...',
      status: 'published',
      createdAt: '2025-01-10T00:00:00Z',
      createdBy: 'Admin User',
      publishedAt: '2025-01-11T00:00:00Z',
      publishedBy: 'Admin User',
    },
    previousVersions: [
      {
        id: 'v-2',
        versionNumber: 2,
        title: 'Terms & Conditions',
        content: 'Previous version content...',
        status: 'archived',
        createdAt: '2025-01-05T00:00:00Z',
        createdBy: 'Admin User',
        publishedAt: '2025-01-06T00:00:00Z',
        publishedBy: 'Admin User',
        archivedAt: '2025-01-11T00:00:00Z',
        archivedBy: 'Admin User',
      },
    ],
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2025-01-11T00:00:00Z',
    updatedBy: 'Admin User',
    viewCount: 5420,
    isPublished: true,
  },
  {
    id: 'page-2',
    pageType: 'privacy-policy',
    titleEn: 'Privacy Policy',
    titleAr: 'سياسة الخصوصية',
    slug: 'privacy-policy',
    currentStatus: 'published',
    currentVersion: {
      id: 'v-3',
      versionNumber: 2,
      title: 'Privacy Policy',
      content: 'Your privacy is important to us. This privacy policy explains how we collect, use, and protect your personal information...',
      status: 'published',
      createdAt: '2025-01-08T00:00:00Z',
      createdBy: 'Admin User',
      publishedAt: '2025-01-09T00:00:00Z',
      publishedBy: 'Admin User',
    },
    previousVersions: [],
    createdAt: '2024-11-15T00:00:00Z',
    updatedAt: '2025-01-09T00:00:00Z',
    updatedBy: 'Admin User',
    viewCount: 3210,
    isPublished: true,
  },
  {
    id: 'page-3',
    pageType: 'prohibited-content',
    titleEn: 'Prohibited Content',
    titleAr: 'المحتوى المحظور',
    slug: 'prohibited-content',
    currentStatus: 'draft',
    currentVersion: {
      id: 'v-4',
      versionNumber: 1,
      title: 'Prohibited Content',
      content: 'The following types of content are prohibited on the MARBOU platform...',
      status: 'draft',
      createdAt: '2025-01-14T00:00:00Z',
      createdBy: 'Admin User',
    },
    previousVersions: [],
    createdAt: '2025-01-14T00:00:00Z',
    updatedAt: '2025-01-14T00:00:00Z',
    updatedBy: 'Admin User',
    viewCount: 0,
    isPublished: false,
  },
  {
    id: 'page-4',
    pageType: 'listing-rules',
    titleEn: 'Listing Rules',
    titleAr: 'قواعد الإدراج',
    slug: 'listing-rules',
    currentStatus: 'published',
    currentVersion: {
      id: 'v-5',
      versionNumber: 1,
      title: 'Listing Rules',
      content: 'All listings on MARBOU must follow these rules to ensure quality and safety for all users...',
      status: 'published',
      createdAt: '2025-01-12T00:00:00Z',
      createdBy: 'Admin User',
      publishedAt: '2025-01-13T00:00:00Z',
      publishedBy: 'Admin User',
    },
    previousVersions: [],
    createdAt: '2025-01-12T00:00:00Z',
    updatedAt: '2025-01-13T00:00:00Z',
    updatedBy: 'Admin User',
    viewCount: 2150,
    isPublished: true,
  },
];

const PAGE_TYPE_LABELS: Record<PageType, string> = {
  'terms-conditions': 'Terms & Conditions',
  'privacy-policy': 'Privacy Policy',
  'acceptable-use': 'Acceptable Use Policy',
  'prohibited-content': 'Prohibited Content',
  'listing-rules': 'Listing Rules',
  'business-verification': 'Business Verification',
  'payment-terms': 'Payment Terms',
  'refund-cancellation': 'Refund & Cancellation',
  'reports': 'Reports Policy',
  'appeals': 'Appeals Process',
  'data-retention': 'Data Retention Policy',
  'location-privacy': 'Location Privacy',
  'faq': 'FAQ',
};

export function AdminContentManagementPage() {
  const { t } = useI18n();
  const { showToast } = useApp();

  const [pages, setPages] = useState<ContentPage[]>(mockContentPages);
  const [selectedPage, setSelectedPage] = useState<ContentPage | null>(mockContentPages[0]);
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState<ContentPage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<PageStatus | 'all'>('all');
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const filteredPages = useMemo(() => {
    return pages.filter(page => {
      const matchesSearch =
        page.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.titleAr.includes(searchQuery) ||
        PAGE_TYPE_LABELS[page.pageType].toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterStatus === 'all' || page.currentStatus === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [pages, searchQuery, filterStatus]);

  const handleEditPage = (page: ContentPage) => {
    setEditingPage(page);
    setShowModal(true);
  };

  const handleSavePage = (pageData: Partial<ContentPage>) => {
    if (editingPage) {
      const updatedPages = pages.map(p => {
        if (p.id === editingPage.id) {
          const newVersion: ContentVersion = {
            id: `v-${Date.now()}`,
            versionNumber: (p.currentVersion?.versionNumber || 0) + 1,
            title: pageData.currentVersion?.title || p.currentVersion.title,
            content: pageData.currentVersion?.content || p.currentVersion.content,
            status: pageData.currentVersion?.status || 'draft',
            createdAt: new Date().toISOString(),
            createdBy: 'Admin User',
          };

          return {
            ...p,
            currentVersion: newVersion,
            previousVersions: [p.currentVersion, ...p.previousVersions],
            updatedAt: new Date().toISOString(),
            updatedBy: 'Admin User',
          };
        }
        return p;
      });

      setPages(updatedPages);
      setSelectedPage(updatedPages.find(p => p.id === editingPage.id) || null);
      showToast(t('contentPageUpdated') || 'Page updated', 'success');
    }
    setShowModal(false);
  };

  const handlePublish = (page: ContentPage) => {
    const updatedPages = pages.map(p => {
      if (p.id === page.id) {
        const updatedVersion = {
          ...p.currentVersion,
          status: 'published' as PageStatus,
          publishedAt: new Date().toISOString(),
          publishedBy: 'Admin User',
        };
        return {
          ...p,
          currentVersion: updatedVersion,
          currentStatus: 'published',
          isPublished: true,
        };
      }
      return p;
    });

    setPages(updatedPages);
    setSelectedPage(updatedPages.find(p => p.id === page.id) || null);
    showToast(t('pagePublished') || 'Page published', 'success');
  };

  const handleArchive = (page: ContentPage) => {
    const updatedPages = pages.map(p => {
      if (p.id === page.id) {
        const updatedVersion = {
          ...p.currentVersion,
          status: 'archived' as PageStatus,
          archivedAt: new Date().toISOString(),
          archivedBy: 'Admin User',
        };
        return {
          ...p,
          currentVersion: updatedVersion,
          currentStatus: 'archived',
          isPublished: false,
        };
      }
      return p;
    });

    setPages(updatedPages);
    setSelectedPage(updatedPages.find(p => p.id === page.id) || null);
    showToast(t('pageArchived') || 'Page archived', 'success');
  };

  const handleRestore = (page: ContentPage, versionId: string) => {
    const version = page.previousVersions.find(v => v.id === versionId);
    if (!version) return;

    const updatedPages = pages.map(p => {
      if (p.id === page.id) {
        return {
          ...p,
          currentVersion: { ...version, versionNumber: (p.currentVersion?.versionNumber || 0) + 1 },
          previousVersions: [p.currentVersion, ...p.previousVersions.filter(v => v.id !== versionId)],
          updatedAt: new Date().toISOString(),
          updatedBy: 'Admin User',
        };
      }
      return p;
    });

    setPages(updatedPages);
    setSelectedPage(updatedPages.find(p => p.id === page.id) || null);
    showToast(t('versionRestored') || 'Version restored', 'success');
  };

  const getStatusColor = (status: PageStatus): string => {
    switch (status) {
      case 'published':
        return 'bg-success-100 text-success-700';
      case 'draft':
        return 'bg-warning-100 text-warning-700';
      case 'archived':
        return 'bg-sand-100 text-primary-600';
    }
  };

  const getStatusIcon = (status: PageStatus) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-4 h-4 text-success-600" />;
      case 'draft':
        return <Clock className="w-4 h-4 text-warning-600" />;
      case 'archived':
        return <Archive className="w-4 h-4 text-primary-400" />;
    }
  };

  return (
    <AdminSidebar activeTab="content" showRoleSelector={false}>
      <div className="p-4 sm:p-6 space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary-800">
              {t('contentManagement') || 'Content Management'}
            </h1>
            <p className="text-sm text-primary-500 mt-1">
              {t('manageContentPages') || 'Manage legal pages, policies, and help content'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Page List */}
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
                  onChange={(e) => setFilterStatus(e.target.value as PageStatus | 'all')}
                  className="input text-sm flex-1"
                >
                  <option value="all">{t('allStatuses') || 'All Statuses'}</option>
                  <option value="published">{t('published') || 'Published'}</option>
                  <option value="draft">{t('draft') || 'Draft'}</option>
                  <option value="archived">{t('archived') || 'Archived'}</option>
                </select>
              </div>

              {/* List */}
              <div className="space-y-2">
                {filteredPages.length === 0 ? (
                  <EmptyState
                    icon={<FileText className="w-12 h-12 text-primary-300" />}
                    title={t('noPagesFound') || 'No pages found'}
                    description={t('createFirstPage') || 'Create your first content page'}
                  />
                ) : (
                  filteredPages.map(page => (
                    <button
                      key={page.id}
                      onClick={() => setSelectedPage(page)}
                      className={`w-full text-left p-3 rounded-lg border transition ${
                        selectedPage?.id === page.id
                          ? 'border-primary-300 bg-primary-50'
                          : 'border-sand-100 hover:border-sand-200 hover:bg-sand-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-medium text-primary-800 truncate text-sm">
                          {page.titleEn}
                        </p>
                        {getStatusIcon(page.currentStatus)}
                      </div>
                      <p className="text-xs text-primary-500">{page.currentVersion.versionNumber} versions</p>
                      <div className="mt-2">
                        <span className={`badge text-xs ${getStatusColor(page.currentStatus)}`}>
                          {page.currentStatus}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Page Details */}
          <div className="lg:col-span-2">
            {selectedPage ? (
              <div className="space-y-4">
                {/* Header Card */}
                <div className="card p-4 bg-gradient-to-br from-primary-50 to-sand-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-primary-800">{selectedPage.titleEn}</h2>
                      <p className="text-sm text-primary-600 mt-1" dir="rtl">
                        {selectedPage.titleAr}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`badge text-sm ${getStatusColor(selectedPage.currentStatus)}`}>
                          {selectedPage.currentStatus}
                        </span>
                        <span className="badge bg-sand-100 text-primary-600 text-sm">
                          v{selectedPage.currentVersion.versionNumber}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPage(selectedPage)}
                        className="btn-secondary text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {selectedPage.currentStatus === 'draft' && (
                        <button
                          onClick={() => handlePublish(selectedPage)}
                          className="btn-primary text-sm"
                        >
                          <Save className="w-4 h-4" />
                          {t('publish') || 'Publish'}
                        </button>
                      )}
                      {selectedPage.currentStatus === 'published' && (
                        <button
                          onClick={() => handleArchive(selectedPage)}
                          className="btn-secondary text-sm text-warning-600 hover:bg-warning-50"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content Preview */}
                <div className="card p-4">
                  <h3 className="font-bold text-primary-800 mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    {t('content') || 'Content'}
                  </h3>
                  <div className="bg-sand-50 p-4 rounded-lg border border-sand-100 max-h-64 overflow-y-auto">
                    <p className="text-sm text-primary-700 whitespace-pre-wrap">
                      {selectedPage.currentVersion.content}
                    </p>
                  </div>
                </div>

                {/* Version Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="card p-4">
                    <p className="text-xs text-primary-600 font-medium mb-1">{t('createdAt') || 'Created At'}</p>
                    <p className="text-sm font-bold text-primary-800">
                      {new Date(selectedPage.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="card p-4">
                    <p className="text-xs text-primary-600 font-medium mb-1">{t('updatedAt') || 'Updated At'}</p>
                    <p className="text-sm font-bold text-primary-800">
                      {new Date(selectedPage.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="card p-4">
                    <p className="text-xs text-primary-600 font-medium mb-1">{t('viewCount') || 'View Count'}</p>
                    <p className="text-sm font-bold text-primary-800">{selectedPage.viewCount}</p>
                  </div>
                  <div className="card p-4">
                    <p className="text-xs text-primary-600 font-medium mb-1">{t('updatedBy') || 'Updated By'}</p>
                    <p className="text-sm font-bold text-primary-800">{selectedPage.updatedBy}</p>
                  </div>
                </div>

                {/* Version History */}
                {selectedPage.previousVersions.length > 0 && (
                  <div className="card p-4">
                    <button
                      onClick={() => setShowVersionHistory(!showVersionHistory)}
                      className="w-full flex items-center justify-between font-bold text-primary-800 hover:text-primary-600"
                    >
                      <span className="flex items-center gap-2">
                        <History className="w-4 h-4" />
                        {t('versionHistory') || 'Version History'} ({selectedPage.previousVersions.length})
                      </span>
                      <span className="text-sm">{showVersionHistory ? '▼' : '▶'}</span>
                    </button>

                    {showVersionHistory && (
                      <div className="mt-4 space-y-2">
                        {selectedPage.previousVersions.map(version => (
                          <div key={version.id} className="bg-sand-50 p-3 rounded-lg border border-sand-100">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-primary-600">v{version.versionNumber}</span>
                                <span className={`badge text-xs ${getStatusColor(version.status)}`}>
                                  {version.status}
                                </span>
                              </div>
                              <button
                                onClick={() => handleRestore(selectedPage, version.id)}
                                className="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1"
                              >
                                <RotateCcw className="w-3 h-3" />
                                {t('restore') || 'Restore'}
                              </button>
                            </div>
                            <p className="text-xs text-primary-600">
                              {new Date(version.createdAt).toLocaleDateString()} by {version.createdBy}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="card p-8">
                <EmptyState
                  icon={<FileText className="w-12 h-12 text-primary-300" />}
                  title={t('noPageSelected') || 'No page selected'}
                  description={t('selectPageToViewDetails') || 'Select a page from the list to view details'}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && editingPage && (
        <ContentPageModal
          page={editingPage}
          onClose={() => setShowModal(false)}
          onSave={handleSavePage}
        />
      )}
    </AdminSidebar>
  );
}

interface ContentPageModalProps {
  page: ContentPage;
  onClose: () => void;
  onSave: (page: Partial<ContentPage>) => void;
}

function ContentPageModal({ page, onClose, onSave }: ContentPageModalProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    titleEn: page.titleEn,
    titleAr: page.titleAr,
    content: page.currentVersion.content,
  });

  const handleSave = () => {
    onSave({
      currentVersion: {
        id: `v-${Date.now()}`,
        versionNumber: page.currentVersion.versionNumber + 1,
        title: formData.titleEn,
        content: formData.content,
        status: 'draft',
        createdAt: new Date().toISOString(),
        createdBy: 'Admin User',
      },
    });
  };

  return (
    <Modal
      title={`${t('edit') || 'Edit'} ${page.titleEn}`}
      onClose={onClose}
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        <div>
          <label className="block text-sm font-medium text-primary-800 mb-1">
            {t('titleEnglish') || 'Title (English)'} *
          </label>
          <input
            type="text"
            value={formData.titleEn}
            onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
            className="input w-full"
            disabled
          />
          <p className="text-xs text-primary-500 mt-1">{t('cannotChangePageTitle') || 'Page title cannot be changed'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-800 mb-1">
            {t('titleArabic') || 'Title (Arabic)'}
          </label>
          <input
            type="text"
            value={formData.titleAr}
            onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
            placeholder="العنوان بالعربية"
            className="input w-full"
            dir="rtl"
            disabled
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-800 mb-1">
            {t('content') || 'Content'} *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Page content"
            className="input w-full h-64 resize-none"
          />
          <p className="text-xs text-primary-500 mt-1">
            {formData.content.length} {t('characters') || 'characters'}
          </p>
        </div>

        <div className="bg-primary-50 p-3 rounded-lg border border-primary-100 text-xs text-primary-700">
          <p className="font-medium mb-1">{t('versionInfo') || 'Version Information'}:</p>
          <p>• {t('newDraftCreated') || 'A new draft version will be created'}</p>
          <p>• {t('publishToMakeLive') || 'Publish this version to make it live'}</p>
        </div>

        <div className="flex gap-2 pt-4 border-t border-sand-100">
          <button onClick={onClose} className="btn-secondary flex-1">
            {t('cancel') || 'Cancel'}
          </button>
          <button onClick={handleSave} className="btn-primary flex-1">
            {t('saveDraft') || 'Save Draft'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
