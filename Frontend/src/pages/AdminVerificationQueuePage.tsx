import { useState, useMemo } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { AdminSidebar } from '@/components/AdminSidebar';
import { EmptyState, StatusBadge, Modal } from '@/components/ui';
import {
  Search, Eye, Download, MessageSquare, Check, X, Clock, AlertCircle,
  CheckCircle, XCircle, ChevronLeft, ChevronRight, Calendar, User, Store,
  FileText, Filter, ArrowUpDown,
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

type VerificationType = 'business' | 'user' | 'seller' | 'serviceProvider';
type VerificationStatus = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'changes_requested';

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedDate: string;
  status: 'verified' | 'rejected' | 'pending';
  notes?: string;
}

interface VerificationRequest {
  id: string;
  type: VerificationType;
  entityName: string;
  ownerName?: string;
  email: string;
  phone: string;
  submittedDate: string;
  status: VerificationStatus;
  priority: 'low' | 'normal' | 'high';
  documents: Document[];
  notes: string;
  riskScore: number; // 0-100
  lastReviewedBy?: string;
  lastReviewedDate?: string;
}

const mockVerifications: VerificationRequest[] = [
  {
    id: 'ver-001',
    type: 'business',
    entityName: 'Al-Nile Motors Trading',
    ownerName: 'Ahmed Mohammed',
    email: 'ahmed@alnile.com',
    phone: '+249123456789',
    submittedDate: '2024-03-15',
    status: 'pending',
    priority: 'high',
    documents: [
      { id: 'doc-001', name: 'Business License', type: 'pdf', uploadedDate: '2024-03-15', status: 'verified' },
      { id: 'doc-002', name: 'Tax Registration', type: 'pdf', uploadedDate: '2024-03-15', status: 'pending' },
      { id: 'doc-003', name: 'Owner ID Copy', type: 'image', uploadedDate: '2024-03-15', status: 'verified' },
    ],
    notes: 'Business license verified. Waiting for tax registration confirmation.',
    riskScore: 15,
  },
  {
    id: 'ver-002',
    type: 'business',
    entityName: 'Blue Nile Properties Ltd',
    ownerName: 'Ibrahim Salih',
    email: 'ibrahim@bluenile.com',
    phone: '+249198765432',
    submittedDate: '2024-03-14',
    status: 'reviewing',
    priority: 'normal',
    documents: [
      { id: 'doc-004', name: 'Trade License', type: 'pdf', uploadedDate: '2024-03-14', status: 'verified' },
      { id: 'doc-005', name: 'Bank Statement', type: 'pdf', uploadedDate: '2024-03-14', status: 'verified' },
      { id: 'doc-006', name: 'Office Lease', type: 'pdf', uploadedDate: '2024-03-14', status: 'verified' },
    ],
    notes: 'All documents look good. Checking references.',
    riskScore: 8,
    lastReviewedBy: 'Admin User',
    lastReviewedDate: '2024-03-16',
  },
  {
    id: 'ver-003',
    type: 'seller',
    entityName: 'Karim Osman',
    email: 'karim@example.com',
    phone: '+249156789012',
    submittedDate: '2024-03-16',
    status: 'pending',
    priority: 'normal',
    documents: [
      { id: 'doc-007', name: 'National ID', type: 'image', uploadedDate: '2024-03-16', status: 'verified' },
      { id: 'doc-008', name: 'Phone Verification', type: 'record', uploadedDate: '2024-03-16', status: 'verified' },
    ],
    notes: 'Standard seller verification.',
    riskScore: 5,
  },
  {
    id: 'ver-004',
    type: 'serviceProvider',
    entityName: 'Tech Services Hub',
    ownerName: 'Noor Ali',
    email: 'noor@techservices.com',
    phone: '+249134567890',
    submittedDate: '2024-03-12',
    status: 'approved',
    priority: 'normal',
    documents: [
      { id: 'doc-009', name: 'Business Cert', type: 'pdf', uploadedDate: '2024-03-12', status: 'verified' },
      { id: 'doc-010', name: 'Insurance', type: 'pdf', uploadedDate: '2024-03-12', status: 'verified' },
    ],
    notes: 'Approved - all documents verified.',
    riskScore: 3,
    lastReviewedBy: 'Support Admin',
    lastReviewedDate: '2024-03-13',
  },
  {
    id: 'ver-005',
    type: 'business',
    entityName: 'Fashion Hub Store',
    ownerName: 'Fatima Hassan',
    email: 'fatima@fashionhub.com',
    phone: '+249145678901',
    submittedDate: '2024-03-10',
    status: 'rejected',
    priority: 'high',
    documents: [
      { id: 'doc-011', name: 'License', type: 'pdf', uploadedDate: '2024-03-10', status: 'rejected', notes: 'Expired' },
    ],
    notes: 'Business license is expired. Rejected for resubmission.',
    riskScore: 65,
    lastReviewedBy: 'Admin User',
    lastReviewedDate: '2024-03-11',
  },
];

function getStatusColor(status: VerificationStatus): string {
  const colors: Record<VerificationStatus, string> = {
    pending: 'bg-sand-100 text-primary-700',
    reviewing: 'bg-info-100 text-info-700',
    approved: 'bg-success-100 text-success-700',
    rejected: 'bg-error-100 text-error-700',
    changes_requested: 'bg-warning-100 text-warning-700',
  };
  return colors[status] || 'bg-sand-100 text-primary-700';
}

function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: 'bg-success-50 border-success-200 text-success-700',
    normal: 'bg-sand-50 border-sand-200 text-primary-700',
    high: 'bg-error-50 border-error-200 text-error-700',
  };
  return colors[priority] || 'bg-sand-50 border-sand-200 text-primary-700';
}

function getRiskIndicator(score: number): { label: string; color: string } {
  if (score >= 60) return { label: 'High Risk', color: 'text-error-600' };
  if (score >= 30) return { label: 'Medium Risk', color: 'text-warning-600' };
  return { label: 'Low Risk', color: 'text-success-600' };
}

export function AdminVerificationQueuePage() {
  const { t, lang } = useI18n();
  const { showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<VerificationType | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'normal' | 'high'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority' | 'riskScore'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState<{ type: 'approve' | 'reject' | 'request_changes'; data: VerificationRequest } | null>(null);
  const [actionNotes, setActionNotes] = useState('');

  // Filter and search
  const filteredVerifications = useMemo(() => {
    return mockVerifications.filter(v => {
      const matchesSearch =
        v.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.ownerName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        v.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
      const matchesType = typeFilter === 'all' || v.type === typeFilter;
      const matchesPriority = priorityFilter === 'all' || v.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesType && matchesPriority;
    });
  }, [searchQuery, statusFilter, typeFilter, priorityFilter]);

  // Sort
  const sortedVerifications = useMemo(() => {
    const sorted = [...filteredVerifications];
    if (sortBy === 'newest') sorted.sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());
    if (sortBy === 'oldest') sorted.sort((a, b) => new Date(a.submittedDate).getTime() - new Date(b.submittedDate).getTime());
    if (sortBy === 'priority') {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      sorted.sort((a, b) => priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]);
    }
    if (sortBy === 'riskScore') sorted.sort((a, b) => b.riskScore - a.riskScore);
    return sorted;
  }, [filteredVerifications, sortBy]);

  // Pagination
  const pages = Math.ceil(sortedVerifications.length / itemsPerPage);
  const paginatedVerifications = sortedVerifications.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAction = (type: 'approve' | 'reject' | 'request_changes', verification: VerificationRequest) => {
    setShowActionModal({ type, data: verification });
    setActionNotes('');
    console.log('Action triggered:', type, verification.entityName);
  };

  const executeAction = () => {
    if (!showActionModal) return;

    const messages: Record<string, string> = {
      approve: `${showActionModal.data.entityName} has been approved`,
      reject: `${showActionModal.data.entityName} verification rejected`,
      request_changes: `Requested changes for ${showActionModal.data.entityName}`,
    };

    console.log('Executing action:', showActionModal.type);
    showToast(messages[showActionModal.type], 'success');
    setShowActionModal(null);
    setActionNotes('');
    setShowDetailsModal(false);
  };

  const statusCounts = useMemo(
    () => ({
      pending: mockVerifications.filter(v => v.status === 'pending').length,
      reviewing: mockVerifications.filter(v => v.status === 'reviewing').length,
      approved: mockVerifications.filter(v => v.status === 'approved').length,
      rejected: mockVerifications.filter(v => v.status === 'rejected').length,
    }),
    []
  );

  return (
    <AdminSidebar activeTab="verification" showRoleSelector={false}>
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary-800 mb-1">{t('verificationQueue')}</h1>
          <p className="text-sm text-primary-400">{t('demoLabel')}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="card p-3 border-l-4 border-sand-300">
            <p className="text-2xl font-bold text-primary-700">{statusCounts.pending}</p>
            <p className="text-xs text-primary-400">Pending</p>
          </div>
          <div className="card p-3 border-l-4 border-info-400">
            <p className="text-2xl font-bold text-info-600">{statusCounts.reviewing}</p>
            <p className="text-xs text-primary-400">Reviewing</p>
          </div>
          <div className="card p-3 border-l-4 border-success-400">
            <p className="text-2xl font-bold text-success-600">{statusCounts.approved}</p>
            <p className="text-xs text-primary-400">Approved</p>
          </div>
          <div className="card p-3 border-l-4 border-error-400">
            <p className="text-2xl font-bold text-error-600">{statusCounts.rejected}</p>
            <p className="text-xs text-primary-400">Rejected</p>
          </div>
        </div>

        {/* Controls */}
        <div className="card p-4 mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-primary-400" />
            <input
              type="text"
              placeholder="Search by entity name, owner, or email..."
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
                  setStatusFilter(e.target.value as VerificationStatus | 'all');
                  setCurrentPage(1);
                }}
                className="w-full px-2 py-2 border border-sand-200 rounded text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewing">Reviewing</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="changes_requested">Changes Requested</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary-700 mb-1">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as VerificationType | 'all');
                  setCurrentPage(1);
                }}
                className="w-full px-2 py-2 border border-sand-200 rounded text-sm"
              >
                <option value="all">All Types</option>
                <option value="business">Business</option>
                <option value="seller">Seller</option>
                <option value="serviceProvider">Service Provider</option>
                <option value="user">User</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary-700 mb-1">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value as 'all' | 'low' | 'normal' | 'high');
                  setCurrentPage(1);
                }}
                className="w-full px-2 py-2 border border-sand-200 rounded text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full px-2 py-2 border border-sand-200 rounded text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">Priority</option>
                <option value="riskScore">Risk Score</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {paginatedVerifications.length === 0 ? (
          <EmptyState
            title="No verification requests"
            description="All pending verifications have been processed"
            icon={<Clock className="w-12 h-12 text-primary-300" />}
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-sand-200 mb-6">
              <table className="w-full">
                <thead>
                  <tr className="bg-sand-50 border-b border-sand-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">Entity</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">Risk</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">Submitted</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedVerifications.map((v) => (
                    <tr key={v.id} className="border-b border-sand-100 hover:bg-sand-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-primary-900">{v.entityName}</p>
                          {v.ownerName && <p className="text-xs text-primary-500">{v.ownerName}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs capitalize">{v.type}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(v.status)}`}>
                          {v.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium border capitalize ${getPriorityColor(v.priority)}`}>
                          {v.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`font-semibold ${getRiskIndicator(v.riskScore).color}`}>{v.riskScore}%</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-primary-600">{v.submittedDate}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setSelectedVerification(v);
                              setShowDetailsModal(true);
                            }}
                            className="p-1.5 hover:bg-primary-100 rounded text-primary-600"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {(v.status === 'pending' || v.status === 'reviewing') && (
                            <>
                              <button
                                onClick={() => handleAction('approve', v)}
                                className="p-1.5 hover:bg-success-100 rounded text-success-600"
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleAction('reject', v)}
                                className="p-1.5 hover:bg-error-100 rounded text-error-600"
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3 mb-6">
              {paginatedVerifications.map((v) => (
                <div key={v.id} className="card p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-primary-900">{v.entityName}</h3>
                      {v.ownerName && <p className="text-xs text-primary-500">{v.ownerName}</p>}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(v.status)}`}>
                      {v.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs capitalize">{v.type}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium border capitalize ${getPriorityColor(v.priority)}`}>
                        {v.priority}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskIndicator(v.riskScore).color}`}>
                        Risk: {v.riskScore}%
                      </span>
                    </div>
                    <p className="text-primary-600">Submitted: {v.submittedDate}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedVerification(v);
                        setShowDetailsModal(true);
                      }}
                      className="flex-1 py-2 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
                    >
                      View Details
                    </button>
                    {(v.status === 'pending' || v.status === 'reviewing') && (
                      <button
                        onClick={() => handleAction('approve', v)}
                        className="flex-1 py-2 bg-success-600 text-white rounded text-sm hover:bg-success-700"
                      >
                        Approve
                      </button>
                    )}
                  </div>
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
                  {currentPage} / {pages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(pages, currentPage + 1))}
                  disabled={currentPage === pages}
                  className="p-1 rounded hover:bg-sand-100 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedVerification && (
          <Modal
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            title={selectedVerification.entityName}
            className="sm:max-w-2xl"
          >
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-primary-600 uppercase">Type</p>
                  <p className="text-sm font-medium text-primary-900 capitalize">{selectedVerification.type}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary-600 uppercase">Status</p>
                  <p className={`text-sm font-medium capitalize ${getStatusColor(selectedVerification.status)}`}>
                    {selectedVerification.status.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary-600 uppercase">Email</p>
                  <p className="text-sm text-primary-900">{selectedVerification.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary-600 uppercase">Phone</p>
                  <p className="text-sm text-primary-900">{selectedVerification.phone}</p>
                </div>
                {selectedVerification.ownerName && (
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-primary-600 uppercase">Owner</p>
                    <p className="text-sm text-primary-900">{selectedVerification.ownerName}</p>
                  </div>
                )}
              </div>

              {/* Risk & Priority */}
              <div className="grid grid-cols-3 gap-4">
                <div className="card p-3 bg-sand-50">
                  <p className="text-xs text-primary-600">Risk Score</p>
                  <p className={`text-lg font-bold ${getRiskIndicator(selectedVerification.riskScore).color}`}>
                    {selectedVerification.riskScore}%
                  </p>
                  <p className="text-xs text-primary-600">{getRiskIndicator(selectedVerification.riskScore).label}</p>
                </div>
                <div className="card p-3 bg-sand-50">
                  <p className="text-xs text-primary-600">Priority</p>
                  <p className="text-lg font-bold capitalize text-primary-900">{selectedVerification.priority}</p>
                </div>
                <div className="card p-3 bg-sand-50">
                  <p className="text-xs text-primary-600">Submitted</p>
                  <p className="text-lg font-bold text-primary-900">{selectedVerification.submittedDate}</p>
                </div>
              </div>

              {/* Documents */}
              <div>
                <p className="text-sm font-semibold text-primary-700 mb-3">Documents ({selectedVerification.documents.length})</p>
                <div className="space-y-2">
                  {selectedVerification.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border border-sand-200 rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-primary-900">{doc.name}</p>
                        <p className="text-xs text-primary-500">{doc.type} • {doc.uploadedDate}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            doc.status === 'verified'
                              ? 'bg-success-100 text-success-700'
                              : doc.status === 'rejected'
                              ? 'bg-error-100 text-error-700'
                              : 'bg-sand-100 text-primary-700'
                          }`}
                        >
                          {doc.status}
                        </span>
                        <button className="p-1 hover:bg-sand-100 rounded text-primary-600">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-sm font-semibold text-primary-700 mb-2">Internal Notes</p>
                <div className="p-3 bg-sand-50 rounded border border-sand-200">
                  <p className="text-sm text-primary-900">{selectedVerification.notes}</p>
                </div>
              </div>

              {/* Action Buttons */}
              {(selectedVerification.status === 'pending' || selectedVerification.status === 'reviewing') && (
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-sand-200">
                  <button
                    onClick={() => {
                      handleAction('request_changes', selectedVerification);
                    }}
                    className="py-2 border border-warning-400 text-warning-700 rounded hover:bg-warning-50 font-medium transition text-sm"
                  >
                    Request Changes
                  </button>
                  <button
                    onClick={() => {
                      handleAction('reject', selectedVerification);
                    }}
                    className="py-2 border border-error-400 text-error-700 rounded hover:bg-error-50 font-medium transition text-sm"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      handleAction('approve', selectedVerification);
                    }}
                    className="py-2 bg-success-600 text-white rounded hover:bg-success-700 font-medium transition text-sm"
                  >
                    Approve
                  </button>
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
              setActionNotes('');
            }}
            title={`${showActionModal.type.replace('_', ' ').toUpperCase()} - ${showActionModal.data.entityName}`}
            className="sm:max-w-md"
          >
            <div className="space-y-4">
              <div className="p-3 bg-sand-50 rounded border border-sand-200">
                <p className="text-sm text-primary-700">
                  {showActionModal.type === 'approve' && `Approve verification for ${showActionModal.data.entityName}?`}
                  {showActionModal.type === 'reject' && `Reject verification for ${showActionModal.data.entityName}?`}
                  {showActionModal.type === 'request_changes' && `Request changes for ${showActionModal.data.entityName}?`}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary-700 mb-2">Internal Notes (Optional)</label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Add notes about this action..."
                  className="w-full px-3 py-2 border border-sand-200 rounded text-sm focus:outline-none focus:border-primary-500"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-sand-200">
                <button
                  onClick={() => {
                    setShowActionModal(null);
                    setActionNotes('');
                  }}
                  className="px-4 py-2 text-primary-700 border border-sand-200 rounded hover:bg-sand-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={executeAction}
                  className={`px-4 py-2 text-white rounded transition font-medium ${
                    showActionModal.type === 'approve'
                      ? 'bg-success-600 hover:bg-success-700'
                      : showActionModal.type === 'request_changes'
                      ? 'bg-warning-600 hover:bg-warning-700'
                      : 'bg-error-600 hover:bg-error-700'
                  }`}
                >
                  {showActionModal.type === 'approve' && 'Approve'}
                  {showActionModal.type === 'reject' && 'Reject'}
                  {showActionModal.type === 'request_changes' && 'Request Changes'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminSidebar>
  );
}

export default AdminVerificationQueuePage;
