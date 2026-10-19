import { useState, useMemo } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { AdminSidebar } from '@/components/AdminSidebar';
import { EmptyState, Modal } from '@/components/ui';
import {
  Search, Eye, MessageSquare, Check, X, AlertCircle, Flag,
  ChevronLeft, ChevronRight, FileText, User, MessageCircle,
  Clock, CheckCircle, XCircle, TrendingUp, Paperclip,
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

type ReportType = 'user' | 'listing' | 'message' | 'review' | 'business';
type ReportStatus = 'new' | 'reviewing' | 'resolved' | 'dismissed' | 'appealed';
type ReportSeverity = 'low' | 'medium' | 'high' | 'critical';
type AppealStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'closed';

interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedDate: string;
}

interface Report {
  id: string;
  type: ReportType;
  reportedBy: {
    name: string;
    email: string;
    id: string;
    reputation: number;
  };
  reportedEntity: {
    type: string; // 'user', 'listing', 'message', 'review', 'business'
    id: string;
    title: string; // e.g., listing title, business name, user name
    owner?: string;
  };
  reason: string;
  description: string;
  severity: ReportSeverity;
  status: ReportStatus;
  submittedDate: string;
  attachments: Attachment[];
  moderatorNotes?: string;
  resolution?: string;
  resolvedDate?: string;
  resolvedBy?: string;
}

interface Appeal {
  id: string;
  originalReportId: string;
  appealer: {
    name: string;
    email: string;
    id: string;
  };
  appealReason: string;
  appealDetails: string;
  status: AppealStatus;
  submittedDate: string;
  attachments: Attachment[];
  reviewerNotes?: string;
  decision?: string; // 'approved' or 'rejected'
  decidedDate?: string;
  decidedBy?: string;
}

const mockReports: Report[] = [
  {
    id: 'rep-001',
    type: 'listing',
    reportedBy: { name: 'Ahmed Mohammed', email: 'ahmed@example.com', id: 'user-001', reputation: 85 },
    reportedEntity: { type: 'listing', id: 'lst-123', title: 'Suspicious Electronics Deal', owner: 'Unknown Seller' },
    reason: 'Suspicious Pricing',
    description: 'This listing has an unusually low price compared to market. Possible scam or stolen goods.',
    severity: 'high',
    status: 'reviewing',
    submittedDate: '2024-03-20',
    attachments: [{ id: 'att-001', name: 'screenshot.png', type: 'image', url: '#', uploadedDate: '2024-03-20' }],
    moderatorNotes: 'Checking seller history and similar listings.',
  },
  {
    id: 'rep-002',
    type: 'user',
    reportedBy: { name: 'Fatima Hassan', email: 'fatima@example.com', id: 'user-002', reputation: 92 },
    reportedEntity: { type: 'user', id: 'seller-456', title: 'Spam User Account' },
    reason: 'Spamming',
    description: 'User has posted 20+ nearly identical listings in 1 hour. Appears to be automated spam.',
    severity: 'critical',
    status: 'resolved',
    submittedDate: '2024-03-19',
    attachments: [],
    moderatorNotes: 'User account suspended after analysis.',
    resolution: 'Account Suspended',
    resolvedDate: '2024-03-19',
    resolvedBy: 'Admin',
  },
  {
    id: 'rep-003',
    type: 'message',
    reportedBy: { name: 'Ibrahim Salih', email: 'ibrahim@example.com', id: 'user-003', reputation: 78 },
    reportedEntity: { type: 'message', id: 'msg-789', title: 'Abusive Message' },
    reason: 'Harassment/Abuse',
    description: 'Received threatening messages from another user demanding payment or they will harm my business.',
    severity: 'critical',
    status: 'new',
    submittedDate: '2024-03-21',
    attachments: [
      { id: 'att-002', name: 'message-1.png', type: 'image', url: '#', uploadedDate: '2024-03-21' },
      { id: 'att-003', name: 'message-2.png', type: 'image', url: '#', uploadedDate: '2024-03-21' },
    ],
  },
  {
    id: 'rep-004',
    type: 'review',
    reportedBy: { name: 'Karim Osman', email: 'karim@example.com', id: 'user-004', reputation: 88 },
    reportedEntity: { type: 'review', id: 'rev-321', title: 'False Review on Al-Nile Motors' },
    reason: 'False Information',
    description: 'This review is from a competitor. They never actually purchased from us. Review contains false claims.',
    severity: 'medium',
    status: 'resolved',
    submittedDate: '2024-03-18',
    attachments: [],
    moderatorNotes: 'Verified claim. Competitor account detected.',
    resolution: 'Review Removed',
    resolvedDate: '2024-03-18',
    resolvedBy: 'Support',
  },
  {
    id: 'rep-005',
    type: 'business',
    reportedBy: { name: 'Noor Ali', email: 'noor@example.com', id: 'user-005', reputation: 81 },
    reportedEntity: { type: 'business', id: 'biz-555', title: 'Unauthorized Business Profile' },
    reason: 'Impersonation',
    description: 'Someone created a fake business profile using my company name and logo without authorization.',
    severity: 'high',
    status: 'dismissed',
    submittedDate: '2024-03-17',
    attachments: [],
    moderatorNotes: 'Profile verified as legitimate. Submitted by actual business owner.',
    resolution: 'No Action Taken',
    resolvedDate: '2024-03-17',
    resolvedBy: 'Admin',
  },
];

const mockAppeals: Appeal[] = [
  {
    id: 'app-001',
    originalReportId: 'rep-004',
    appealer: { name: 'Competitor User', email: 'competitor@example.com', id: 'user-006' },
    appealReason: 'Decision was unfair',
    appealDetails: 'The review was legitimate. I am a genuine customer who purchased their service and had a bad experience.',
    status: 'in_review',
    submittedDate: '2024-03-19',
    attachments: [{ id: 'att-004', name: 'purchase_receipt.pdf', type: 'document', url: '#', uploadedDate: '2024-03-19' }],
    reviewerNotes: 'Checking purchase history and payment records.',
  },
  {
    id: 'app-002',
    originalReportId: 'rep-002',
    appealer: { name: 'Spam User', email: 'spammer@example.com', id: 'seller-456' },
    appealReason: 'Account suspension was too harsh',
    appealDetails: 'I was reposting listings because my internet was unstable. It was a technical issue, not spam.',
    status: 'rejected',
    submittedDate: '2024-03-20',
    attachments: [],
    reviewerNotes: 'Account history shows repeated patterns over months. Appeal rejected.',
    decision: 'rejected',
    decidedDate: '2024-03-20',
    decidedBy: 'Support Admin',
  },
  {
    id: 'app-003',
    originalReportId: 'rep-005',
    appealer: { name: 'Business Owner', email: 'noor@example.com', id: 'user-005' },
    appealReason: 'Appeal for action on fake profile',
    appealDetails: 'The decision was incorrect. There IS a fake profile impersonating my business. Please review again.',
    status: 'approved',
    submittedDate: '2024-03-18',
    attachments: [],
    reviewerNotes: 'Upon review, found duplicate profile. Removing fake profile.',
    decision: 'approved',
    decidedDate: '2024-03-19',
    decidedBy: 'Admin',
  },
];

function getStatusColor(status: ReportStatus | AppealStatus): string {
  const colors: Record<string, string> = {
    new: 'bg-sand-100 text-primary-700',
    reviewing: 'bg-info-100 text-info-700',
    'in_review': 'bg-info-100 text-info-700',
    resolved: 'bg-success-100 text-success-700',
    approved: 'bg-success-100 text-success-700',
    dismissed: 'bg-sand-100 text-primary-700',
    rejected: 'bg-error-100 text-error-700',
    appealed: 'bg-warning-100 text-warning-700',
    pending: 'bg-sand-100 text-primary-700',
    closed: 'bg-primary-100 text-primary-700',
  };
  return colors[status] || 'bg-sand-100 text-primary-700';
}

function getSeverityColor(severity: ReportSeverity): { label: string; color: string; bgColor: string } {
  const colors: Record<ReportSeverity, { label: string; color: string; bgColor: string }> = {
    critical: { label: 'Critical', color: 'text-error-600', bgColor: 'bg-error-100' },
    high: { label: 'High', color: 'text-warning-600', bgColor: 'bg-warning-100' },
    medium: { label: 'Medium', color: 'text-info-600', bgColor: 'bg-info-100' },
    low: { label: 'Low', color: 'text-success-600', bgColor: 'bg-success-100' },
  };
  return colors[severity];
}

export function AdminReportsAppealsPage() {
  const { t } = useI18n();
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'reports' | 'appeals'>('reports');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | AppealStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ReportType | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<ReportSeverity | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'severity'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState<{ type: 'resolve' | 'dismiss'; data: Report } | null>(null);
  const [resolution, setResolution] = useState('');
  const [notes, setNotes] = useState('');

  // Filter and search reports
  const filteredReports = useMemo(() => {
    return mockReports.filter(r => {
      const matchesSearch =
        r.reportedEntity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.reportedBy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesType = typeFilter === 'all' || r.type === typeFilter;
      const matchesSeverity = severityFilter === 'all' || r.severity === severityFilter;

      return matchesSearch && matchesStatus && matchesType && matchesSeverity;
    });
  }, [searchQuery, statusFilter, typeFilter, severityFilter]);

  // Filter and search appeals
  const filteredAppeals = useMemo(() => {
    return mockAppeals.filter(a => {
      const matchesSearch =
        a.appealer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.id.includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  // Sort reports
  const sortedReports = useMemo(() => {
    const sorted = [...filteredReports];
    if (sortBy === 'newest') sorted.sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());
    if (sortBy === 'oldest') sorted.sort((a, b) => new Date(a.submittedDate).getTime() - new Date(b.submittedDate).getTime());
    if (sortBy === 'severity') {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      sorted.sort((a, b) => severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder]);
    }
    return sorted;
  }, [filteredReports, sortBy]);

  // Sort appeals
  const sortedAppeals = useMemo(() => {
    const sorted = [...filteredAppeals];
    if (sortBy === 'newest') sorted.sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());
    if (sortBy === 'oldest') sorted.sort((a, b) => new Date(a.submittedDate).getTime() - new Date(b.submittedDate).getTime());
    return sorted;
  }, [filteredAppeals, sortBy]);

  // Pagination
  const reportPages = Math.ceil(sortedReports.length / itemsPerPage);
  const appealPages = Math.ceil(sortedAppeals.length / itemsPerPage);
  const paginatedReports = sortedReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const paginatedAppeals = sortedAppeals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAction = (type: 'resolve' | 'dismiss', report: Report) => {
    setShowActionModal({ type, data: report });
    setResolution('');
    setNotes('');
  };

  const executeAction = () => {
    if (!showActionModal) return;

    const messages: Record<string, string> = {
      resolve: `Report ${showActionModal.data.id} has been resolved`,
      dismiss: `Report ${showActionModal.data.id} has been dismissed`,
    };

    showToast(messages[showActionModal.type], 'success');
    setShowActionModal(null);
    setShowDetailsModal(false);
    setResolution('');
    setNotes('');
  };

  const statusCounts = useMemo(
    () => ({
      new: mockReports.filter(r => r.status === 'new').length,
      reviewing: mockReports.filter(r => r.status === 'reviewing').length,
      resolved: mockReports.filter(r => r.status === 'resolved').length,
      dismissed: mockReports.filter(r => r.status === 'dismissed').length,
      appeals_pending: mockAppeals.filter(a => a.status === 'pending').length,
      appeals_in_review: mockAppeals.filter(a => a.status === 'in_review').length,
    }),
    []
  );

  return (
    <AdminSidebar activeTab="reports" showRoleSelector={false}>
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary-800 mb-1">{t('reportsAppeals')}</h1>
          <p className="text-sm text-primary-400">{t('demoLabel')}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mb-6">
          <div className="card p-3 border-l-4 border-sand-300">
            <p className="text-2xl font-bold text-primary-700">{statusCounts.new}</p>
            <p className="text-xs text-primary-400">New</p>
          </div>
          <div className="card p-3 border-l-4 border-info-400">
            <p className="text-2xl font-bold text-info-600">{statusCounts.reviewing}</p>
            <p className="text-xs text-primary-400">Reviewing</p>
          </div>
          <div className="card p-3 border-l-4 border-success-400">
            <p className="text-2xl font-bold text-success-600">{statusCounts.resolved}</p>
            <p className="text-xs text-primary-400">Resolved</p>
          </div>
          <div className="card p-3 border-l-4 border-sand-300">
            <p className="text-2xl font-bold text-primary-700">{statusCounts.dismissed}</p>
            <p className="text-xs text-primary-400">Dismissed</p>
          </div>
          <div className="card p-3 border-l-4 border-sand-300">
            <p className="text-2xl font-bold text-primary-700">{statusCounts.appeals_pending}</p>
            <p className="text-xs text-primary-400">Appeals</p>
          </div>
          <div className="card p-3 border-l-4 border-info-400">
            <p className="text-2xl font-bold text-info-600">{statusCounts.appeals_in_review}</p>
            <p className="text-xs text-primary-400">In Review</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-6 border-b border-sand-200">
          <button
            onClick={() => {
              setActiveTab('reports');
              setCurrentPage(1);
              setSearchQuery('');
            }}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'reports'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-primary-400 hover:text-primary-600'
            }`}
          >
            Reports <span className="text-xs">({sortedReports.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('appeals');
              setCurrentPage(1);
              setSearchQuery('');
            }}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'appeals'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-primary-400 hover:text-primary-600'
            }`}
          >
            Appeals <span className="text-xs">({sortedAppeals.length})</span>
          </button>
        </div>

        {/* Controls */}
        <div className="card p-4 mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-primary-400" />
            <input
              type="text"
              placeholder={activeTab === 'reports' ? 'Search by entity name, reporter, or ID...' : 'Search by appealer name or ID...'}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-sand-200 rounded-lg focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-primary-700 mb-1">{t('status')}</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full px-2 py-2 border border-sand-200 rounded text-sm"
              >
                <option value="all">All Status</option>
                {activeTab === 'reports' && (
                  <>
                    <option value="new">New</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </>
                )}
                {activeTab === 'appeals' && (
                  <>
                    <option value="pending">Pending</option>
                    <option value="in_review">In Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </>
                )}
              </select>
            </div>

            {activeTab === 'reports' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-primary-700 mb-1">Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => {
                      setTypeFilter(e.target.value as ReportType | 'all');
                      setCurrentPage(1);
                    }}
                    className="w-full px-2 py-2 border border-sand-200 rounded text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="user">User</option>
                    <option value="listing">Listing</option>
                    <option value="message">Message</option>
                    <option value="review">Review</option>
                    <option value="business">Business</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary-700 mb-1">Severity</label>
                  <select
                    value={severityFilter}
                    onChange={(e) => {
                      setSeverityFilter(e.target.value as ReportSeverity | 'all');
                      setCurrentPage(1);
                    }}
                    className="w-full px-2 py-2 border border-sand-200 rounded text-sm"
                  >
                    <option value="all">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-primary-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full px-2 py-2 border border-sand-200 rounded text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                {activeTab === 'reports' && <option value="severity">Highest Severity</option>}
              </select>
            </div>
          </div>
        </div>

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div>
            {paginatedReports.length === 0 ? (
              <EmptyState
                title="No reports found"
                description="All reports have been processed"
                icon={<Flag className="w-12 h-12 text-primary-300" />}
              />
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto rounded-lg border border-sand-200 mb-6">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-sand-50 border-b border-sand-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">Reported Entity</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">Reporter</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">Severity</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">Submitted</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedReports.map((r) => {
                        const severityInfo = getSeverityColor(r.severity);
                        return (
                          <tr key={r.id} className="border-b border-sand-100 hover:bg-sand-50">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-primary-900 text-sm">{r.reportedEntity.title}</p>
                                <p className="text-xs text-primary-500">{r.id}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div>
                                <p className="font-medium text-primary-900">{r.reportedBy.name}</p>
                                <p className="text-xs text-primary-500">Rep: {r.reportedBy.reputation}%</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs capitalize">{r.type}</span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${severityInfo.bgColor} ${severityInfo.color}`}>
                                {severityInfo.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(r.status)}`}>
                                {r.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-primary-600">{r.submittedDate}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    setSelectedReport(r);
                                    setShowDetailsModal(true);
                                  }}
                                  className="p-1.5 hover:bg-primary-100 rounded text-primary-600"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {(r.status === 'new' || r.status === 'reviewing') && (
                                  <>
                                    <button
                                      onClick={() => handleAction('resolve', r)}
                                      className="p-1.5 hover:bg-success-100 rounded text-success-600"
                                      title="Resolve"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleAction('dismiss', r)}
                                      className="p-1.5 hover:bg-sand-100 rounded text-primary-600"
                                      title="Dismiss"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3 mb-6">
                  {paginatedReports.map((r) => {
                    const severityInfo = getSeverityColor(r.severity);
                    return (
                      <div key={r.id} className="card p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-primary-900 text-sm">{r.reportedEntity.title}</h3>
                            <p className="text-xs text-primary-500 mt-1">{r.id}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(r.status)}`}>
                            {r.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm mb-3">
                          <p className="text-primary-700">{r.reportedBy.name}</p>
                          <div className="flex gap-2">
                            <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs capitalize">{r.type}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${severityInfo.bgColor} ${severityInfo.color}`}>
                              {severityInfo.label}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedReport(r);
                              setShowDetailsModal(true);
                            }}
                            className="flex-1 py-2 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
                          >
                            View Details
                          </button>
                          {(r.status === 'new' || r.status === 'reviewing') && (
                            <button
                              onClick={() => handleAction('resolve', r)}
                              className="flex-1 py-2 bg-success-600 text-white rounded text-sm hover:bg-success-700"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-primary-600">Items per page:</label>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-2 py-1 border border-sand-200 rounded text-sm"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-1 rounded hover:bg-sand-100 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-primary-700">
                      {currentPage} / {reportPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(reportPages, currentPage + 1))}
                      disabled={currentPage === reportPages}
                      className="p-1 rounded hover:bg-sand-100 disabled:opacity-50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Appeals Tab */}
        {activeTab === 'appeals' && (
          <div>
            {paginatedAppeals.length === 0 ? (
              <EmptyState
                title="No appeals found"
                description="All appeals have been reviewed"
                icon={<MessageCircle className="w-12 h-12 text-primary-300" />}
              />
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto rounded-lg border border-sand-200 mb-6">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-sand-50 border-b border-sand-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">Appeal ID</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">Appealer</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">Original Report</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">Submitted</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAppeals.map((a) => (
                        <tr key={a.id} className="border-b border-sand-100 hover:bg-sand-50">
                          <td className="px-4 py-3 text-sm font-medium text-primary-900">{a.id}</td>
                          <td className="px-4 py-3 text-sm">
                            <div>
                              <p className="font-medium text-primary-900">{a.appealer.name}</p>
                              <p className="text-xs text-primary-500">{a.appealer.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-primary-600">{a.originalReportId}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(a.status)}`}>
                              {a.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-primary-600">{a.submittedDate}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                setSelectedAppeal(a);
                                setShowDetailsModal(true);
                              }}
                              className="p-1.5 hover:bg-primary-100 rounded text-primary-600"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3 mb-6">
                  {paginatedAppeals.map((a) => (
                    <div key={a.id} className="card p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-primary-900 text-sm">{a.appealer.name}</h3>
                          <p className="text-xs text-primary-500 mt-1">{a.id}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(a.status)}`}>
                          {a.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm mb-3">
                        <p className="text-primary-700">{a.appealer.email}</p>
                        <p className="text-xs text-primary-600">Original: {a.originalReportId}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedAppeal(a);
                          setShowDetailsModal(true);
                        }}
                        className="w-full py-2 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-primary-600">Items per page:</label>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-2 py-1 border border-sand-200 rounded text-sm"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-1 rounded hover:bg-sand-100 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-primary-700">
                      {currentPage} / {appealPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(appealPages, currentPage + 1))}
                      disabled={currentPage === appealPages}
                      className="p-1 rounded hover:bg-sand-100 disabled:opacity-50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Report Details Modal */}
        {showDetailsModal && selectedReport && (
          <Modal
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            title={`Report: ${selectedReport.reportedEntity.title}`}
            className="sm:max-w-2xl"
          >
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-primary-600 uppercase">Type</p>
                  <p className="text-sm font-medium text-primary-900 capitalize">{selectedReport.type}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary-600 uppercase">Status</p>
                  <p className={`text-sm font-medium capitalize ${getStatusColor(selectedReport.status)}`}>
                    {selectedReport.status.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary-600 uppercase">Severity</p>
                  <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getSeverityColor(selectedReport.severity).bgColor} ${getSeverityColor(selectedReport.severity).color}`}>
                    {getSeverityColor(selectedReport.severity).label}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary-600 uppercase">Submitted</p>
                  <p className="text-sm text-primary-900">{selectedReport.submittedDate}</p>
                </div>
              </div>

              {/* Reporter & Reported Entity */}
              <div className="grid grid-cols-2 gap-4">
                <div className="card p-3 bg-sand-50">
                  <p className="text-xs font-semibold text-primary-600 uppercase mb-2">Reported By</p>
                  <p className="text-sm font-medium text-primary-900">{selectedReport.reportedBy.name}</p>
                  <p className="text-xs text-primary-600">{selectedReport.reportedBy.email}</p>
                  <p className="text-xs text-primary-600 mt-1">Reputation: {selectedReport.reportedBy.reputation}%</p>
                </div>
                <div className="card p-3 bg-sand-50">
                  <p className="text-xs font-semibold text-primary-600 uppercase mb-2">Reported Entity</p>
                  <p className="text-sm font-medium text-primary-900">{selectedReport.reportedEntity.title}</p>
                  {selectedReport.reportedEntity.owner && <p className="text-xs text-primary-600">{selectedReport.reportedEntity.owner}</p>}
                </div>
              </div>

              {/* Reason & Description */}
              <div>
                <p className="text-sm font-semibold text-primary-700 mb-2">Reason: {selectedReport.reason}</p>
                <div className="p-3 bg-sand-50 rounded border border-sand-200">
                  <p className="text-sm text-primary-900">{selectedReport.description}</p>
                </div>
              </div>

              {/* Attachments */}
              {selectedReport.attachments.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-primary-700 mb-2 flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Attachments ({selectedReport.attachments.length})
                  </p>
                  <div className="space-y-2">
                    {selectedReport.attachments.map((att) => (
                      <div key={att.id} className="flex items-center justify-between p-2 border border-sand-200 rounded">
                        <div>
                          <p className="text-sm font-medium text-primary-900">{att.name}</p>
                          <p className="text-xs text-primary-500">{att.type}</p>
                        </div>
                        <button className="px-2 py-1 text-primary-600 hover:bg-sand-100 rounded text-sm">Download</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Moderator Notes & Resolution */}
              {selectedReport.moderatorNotes && (
                <div>
                  <p className="text-sm font-semibold text-primary-700 mb-2">Moderator Notes</p>
                  <div className="p-3 bg-sand-50 rounded border border-sand-200">
                    <p className="text-sm text-primary-900">{selectedReport.moderatorNotes}</p>
                  </div>
                </div>
              )}

              {selectedReport.resolution && (
                <div className="p-3 bg-success-50 rounded border border-success-200">
                  <p className="text-xs font-semibold text-success-700 uppercase mb-1">Resolution</p>
                  <p className="text-sm text-success-900">{selectedReport.resolution}</p>
                  {selectedReport.resolvedBy && <p className="text-xs text-success-700 mt-1">By {selectedReport.resolvedBy} on {selectedReport.resolvedDate}</p>}
                </div>
              )}

              {/* Action Buttons */}
              {(selectedReport.status === 'new' || selectedReport.status === 'reviewing') && (
                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-sand-200">
                  <button
                    onClick={() => {
                      handleAction('dismiss', selectedReport);
                    }}
                    className="py-2 border border-sand-400 text-primary-700 rounded hover:bg-sand-50 font-medium transition text-sm"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => {
                      handleAction('resolve', selectedReport);
                    }}
                    className="py-2 bg-success-600 text-white rounded hover:bg-success-700 font-medium transition text-sm"
                  >
                    Resolve
                  </button>
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* Appeal Details Modal */}
        {showDetailsModal && selectedAppeal && (
          <Modal
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            title={`Appeal: ${selectedAppeal.appealer.name}`}
            className="sm:max-w-2xl"
          >
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-primary-600 uppercase">Status</p>
                  <p className={`text-sm font-medium capitalize ${getStatusColor(selectedAppeal.status)}`}>
                    {selectedAppeal.status.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary-600 uppercase">Original Report</p>
                  <p className="text-sm font-medium text-primary-900">{selectedAppeal.originalReportId}</p>
                </div>
              </div>

              {/* Appealer Info */}
              <div className="card p-3 bg-sand-50">
                <p className="text-xs font-semibold text-primary-600 uppercase mb-2">Appealer</p>
                <p className="text-sm font-medium text-primary-900">{selectedAppeal.appealer.name}</p>
                <p className="text-xs text-primary-600">{selectedAppeal.appealer.email}</p>
              </div>

              {/* Appeal Reason & Details */}
              <div>
                <p className="text-sm font-semibold text-primary-700 mb-2">Reason: {selectedAppeal.appealReason}</p>
                <div className="p-3 bg-sand-50 rounded border border-sand-200">
                  <p className="text-sm text-primary-900">{selectedAppeal.appealDetails}</p>
                </div>
              </div>

              {/* Attachments */}
              {selectedAppeal.attachments.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-primary-700 mb-2 flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Attachments ({selectedAppeal.attachments.length})
                  </p>
                  <div className="space-y-2">
                    {selectedAppeal.attachments.map((att) => (
                      <div key={att.id} className="flex items-center justify-between p-2 border border-sand-200 rounded">
                        <div>
                          <p className="text-sm font-medium text-primary-900">{att.name}</p>
                          <p className="text-xs text-primary-500">{att.type}</p>
                        </div>
                        <button className="px-2 py-1 text-primary-600 hover:bg-sand-100 rounded text-sm">Download</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviewer Notes & Decision */}
              {selectedAppeal.reviewerNotes && (
                <div>
                  <p className="text-sm font-semibold text-primary-700 mb-2">Reviewer Notes</p>
                  <div className="p-3 bg-sand-50 rounded border border-sand-200">
                    <p className="text-sm text-primary-900">{selectedAppeal.reviewerNotes}</p>
                  </div>
                </div>
              )}

              {selectedAppeal.decision && (
                <div className={`p-3 rounded border ${
                  selectedAppeal.decision === 'approved'
                    ? 'bg-success-50 border-success-200'
                    : 'bg-error-50 border-error-200'
                }`}>
                  <p className="text-xs font-semibold uppercase mb-1">{selectedAppeal.decision === 'approved' ? 'Approved' : 'Rejected'}</p>
                  {selectedAppeal.decidedBy && <p className="text-xs mt-1">By {selectedAppeal.decidedBy} on {selectedAppeal.decidedDate}</p>}
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* Action Confirmation Modal */}
        {showActionModal && (
          <Modal
            isOpen={true}
            onClose={() => {
              setShowActionModal(null);
              setResolution('');
              setNotes('');
            }}
            title={`${showActionModal.type.toUpperCase()} - ${showActionModal.data.id}`}
            className="sm:max-w-md"
          >
            <div className="space-y-4">
              <div className="p-3 bg-sand-50 rounded border border-sand-200">
                <p className="text-sm text-primary-700">
                  {showActionModal.type === 'resolve' && `Resolve this report?`}
                  {showActionModal.type === 'dismiss' && `Dismiss this report? No action will be taken.`}
                </p>
              </div>

              {showActionModal.type === 'resolve' && (
                <div>
                  <label className="block text-xs font-semibold text-primary-700 mb-2">Resolution Action</label>
                  <textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Describe the action taken (e.g., Account Suspended, Listing Removed, Warning Sent)"
                    className="w-full px-3 py-2 border border-sand-200 rounded text-sm focus:outline-none focus:border-primary-500"
                    rows={2}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-primary-700 mb-2">Internal Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this action..."
                  className="w-full px-3 py-2 border border-sand-200 rounded text-sm focus:outline-none focus:border-primary-500"
                  rows={2}
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-sand-200">
                <button
                  onClick={() => {
                    setShowActionModal(null);
                    setResolution('');
                    setNotes('');
                  }}
                  className="px-4 py-2 text-primary-700 border border-sand-200 rounded hover:bg-sand-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={executeAction}
                  className={`px-4 py-2 text-white rounded transition font-medium ${
                    showActionModal.type === 'resolve'
                      ? 'bg-success-600 hover:bg-success-700'
                      : 'bg-sand-600 hover:bg-sand-700'
                  }`}
                >
                  {showActionModal.type === 'resolve' ? 'Resolve' : 'Dismiss'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminSidebar>
  );
}

export default AdminReportsAppealsPage;
