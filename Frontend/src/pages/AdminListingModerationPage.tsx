import { useState, useMemo } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { AdminSidebar } from '@/components/AdminSidebar';
import { EmptyState, StatusBadge, Modal } from '@/components/ui';
import {
  Search, Eye, MessageSquare, Check, X, Clock, AlertCircle, Flag,
  ChevronLeft, ChevronRight, Image, FileText, MapPin, DollarSign,
  Calendar, User, Trash2, Edit, Award, TrendingUp,
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

type ListingStatus = 'submitted' | 'under_review' | 'approved' | 'rejected' | 'flagged';
type ListingCategory = 'vehicles' | 'realEstate' | 'electronics' | 'fashion' | 'services' | 'jobs' | 'other';
type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

interface ListingImage {
  id: string;
  url: string;
  isCover: boolean;
  uploadedDate: string;
}

interface ModerationListing {
  id: string;
  title: string;
  titleAr: string;
  category: ListingCategory;
  seller: {
    name: string;
    email: string;
    phone: string;
    id: string;
    reputation: number; // 0-100
  };
  status: ListingStatus;
  price: number;
  currency: string;
  location: string;
  description: string;
  images: ListingImage[];
  submittedDate: string;
  completeness: number; // 0-100
  riskScore: number; // 0-100
  riskFlags: string[]; // e.g., 'duplicate', 'suspicious_price', 'banned_seller'
  violatedRules?: string[];
  moderatorNotes?: string;
  lastReviewedBy?: string;
  lastReviewedDate?: string;
}

const mockListings: ModerationListing[] = [
  {
    id: 'lst-001',
    title: 'Samsung Galaxy A54 - New Sealed Box',
    titleAr: 'سامسونج جالاكسي A54 - جديد',
    category: 'electronics',
    seller: { name: 'Ahmed Mohammed', email: 'ahmed@example.com', phone: '+249123456789', id: 'seller-001', reputation: 85 },
    status: 'under_review',
    price: 250000,
    currency: 'SDG',
    location: 'Khartoum',
    description: 'Brand new sealed Samsung Galaxy A54. Original box with all accessories. First owner.',
    images: [
      { id: 'img-001', url: '#', isCover: true, uploadedDate: '2024-03-20' },
      { id: 'img-002', url: '#', isCover: false, uploadedDate: '2024-03-20' },
    ],
    submittedDate: '2024-03-20',
    completeness: 85,
    riskScore: 12,
    riskFlags: [],
    moderatorNotes: 'Images look legitimate. Seller has good reputation.',
    lastReviewedBy: 'Admin',
    lastReviewedDate: '2024-03-20',
  },
  {
    id: 'lst-002',
    title: 'Urgent: iPhone 13 Pro - Best Price!!!',
    titleAr: 'عاجل: آيفون 13 برو - أفضل سعر',
    category: 'electronics',
    seller: { name: 'Unknown Seller', email: 'seller@temp.com', phone: '+249999999999', id: 'seller-002', reputation: 5 },
    status: 'submitted',
    price: 100000,
    currency: 'SDG',
    location: 'Omdurman',
    description: 'Cheap iphone 13 pro contact me fast',
    images: [{ id: 'img-003', url: '#', isCover: true, uploadedDate: '2024-03-21' }],
    submittedDate: '2024-03-21',
    completeness: 45,
    riskScore: 68,
    riskFlags: ['suspicious_price', 'low_completeness', 'low_reputation', 'spam_keywords'],
    violatedRules: ['Misleading title format', 'Incomplete listing'],
  },
  {
    id: 'lst-003',
    title: 'Modern 3-Bedroom Villa in New Amarat',
    titleAr: 'فيلا حديثة 3 غرف نوم في أمارات جديدة',
    category: 'realEstate',
    seller: { name: 'Ibrahim Salih', email: 'ibrahim@properties.com', phone: '+249187654321', id: 'seller-003', reputation: 92 },
    status: 'approved',
    price: 500000000,
    currency: 'SDG',
    location: 'Khartoum - New Amarat',
    description: 'Beautiful modern villa with 3 bedrooms, 2 bathrooms, spacious living area, modern kitchen, parking garage.',
    images: [
      { id: 'img-004', url: '#', isCover: true, uploadedDate: '2024-03-19' },
      { id: 'img-005', url: '#', isCover: false, uploadedDate: '2024-03-19' },
      { id: 'img-006', url: '#', isCover: false, uploadedDate: '2024-03-19' },
    ],
    submittedDate: '2024-03-19',
    completeness: 95,
    riskScore: 2,
    riskFlags: [],
    lastReviewedBy: 'Support Admin',
    lastReviewedDate: '2024-03-19',
  },
  {
    id: 'lst-004',
    title: 'Duplicate: Toyota Camry 2015',
    titleAr: 'مكرر: تويوتا كامري 2015',
    category: 'vehicles',
    seller: { name: 'Karim Osman', email: 'karim@cars.com', phone: '+249167890123', id: 'seller-004', reputation: 72 },
    status: 'flagged',
    price: 8500000,
    currency: 'SDG',
    location: 'Khartoum',
    description: 'Toyota Camry 2015 model, manual transmission, good condition.',
    images: [{ id: 'img-007', url: '#', isCover: true, uploadedDate: '2024-03-21' }],
    submittedDate: '2024-03-21',
    completeness: 72,
    riskScore: 45,
    riskFlags: ['duplicate_detected', 'possible_repost'],
    violatedRules: ['Possible duplicate listing'],
    moderatorNotes: 'Similar listing found (lst-xyz). Check if same vehicle.',
  },
  {
    id: 'lst-005',
    title: 'Professional Painting Services',
    titleAr: 'خدمات الرسم الاحترافية',
    category: 'services',
    seller: { name: 'Noor Ali', email: 'noor@painting.com', phone: '+249145678901', id: 'seller-005', reputation: 88 },
    status: 'submitted',
    price: 0,
    currency: 'SDG',
    location: 'Khartoum',
    description: 'Professional painting services for residential and commercial properties. Quality work guaranteed. 10 years experience.',
    images: [
      { id: 'img-008', url: '#', isCover: true, uploadedDate: '2024-03-21' },
      { id: 'img-009', url: '#', isCover: false, uploadedDate: '2024-03-21' },
    ],
    submittedDate: '2024-03-21',
    completeness: 88,
    riskScore: 8,
    riskFlags: [],
  },
];

function getStatusColor(status: ListingStatus): string {
  const colors: Record<ListingStatus, string> = {
    submitted: 'bg-sand-100 text-primary-700',
    under_review: 'bg-info-100 text-info-700',
    approved: 'bg-success-100 text-success-700',
    rejected: 'bg-error-100 text-error-700',
    flagged: 'bg-warning-100 text-warning-700',
  };
  return colors[status] || 'bg-sand-100 text-primary-700';
}

function getRiskColor(score: number): { label: string; color: string; bgColor: string } {
  if (score >= 70) return { label: 'Critical', color: 'text-error-600', bgColor: 'bg-error-100' };
  if (score >= 50) return { label: 'High', color: 'text-warning-600', bgColor: 'bg-warning-100' };
  if (score >= 25) return { label: 'Medium', color: 'text-info-600', bgColor: 'bg-info-100' };
  return { label: 'Low', color: 'text-success-600', bgColor: 'bg-success-100' };
}

export function AdminListingModerationPage() {
  const { t, lang } = useI18n();
  const { showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ListingStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ListingCategory | 'all'>('all');
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'risk' | 'completeness'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedListing, setSelectedListing] = useState<ModerationListing | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState<{ type: 'approve' | 'reject' | 'flag'; data: ModerationListing } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [moderatorNotes, setModeratorNotes] = useState('');

  // Filter and search
  const filteredListings = useMemo(() => {
    return mockListings.filter(l => {
      const matchesSearch =
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.titleAr.includes(searchQuery) ||
        l.seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.id.includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || l.category === categoryFilter;
      const matchesRisk =
        riskFilter === 'all' ||
        (riskFilter === 'critical' && l.riskScore >= 70) ||
        (riskFilter === 'high' && l.riskScore >= 50 && l.riskScore < 70) ||
        (riskFilter === 'medium' && l.riskScore >= 25 && l.riskScore < 50) ||
        (riskFilter === 'low' && l.riskScore < 25);

      return matchesSearch && matchesStatus && matchesCategory && matchesRisk;
    });
  }, [searchQuery, statusFilter, categoryFilter, riskFilter]);

  // Sort
  const sortedListings = useMemo(() => {
    const sorted = [...filteredListings];
    if (sortBy === 'newest') sorted.sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());
    if (sortBy === 'oldest') sorted.sort((a, b) => new Date(a.submittedDate).getTime() - new Date(b.submittedDate).getTime());
    if (sortBy === 'risk') sorted.sort((a, b) => b.riskScore - a.riskScore);
    if (sortBy === 'completeness') sorted.sort((a, b) => b.completeness - a.completeness);
    return sorted;
  }, [filteredListings, sortBy]);

  // Pagination
  const pages = Math.ceil(sortedListings.length / itemsPerPage);
  const paginatedListings = sortedListings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAction = (type: 'approve' | 'reject' | 'flag', listing: ModerationListing) => {
    setShowActionModal({ type, data: listing });
    setRejectionReason('');
    setModeratorNotes('');
  };

  const executeAction = () => {
    if (!showActionModal) return;

    const messages: Record<string, string> = {
      approve: `Listing "${showActionModal.data.title}" has been approved`,
      reject: `Listing "${showActionModal.data.title}" has been rejected`,
      flag: `Listing "${showActionModal.data.title}" has been flagged for review`,
    };

    showToast(messages[showActionModal.type], 'success');
    console.log('Action:', showActionModal.type, 'on listing:', showActionModal.data.id);
    setShowActionModal(null);
    setShowDetailsModal(false);
    setRejectionReason('');
    setModeratorNotes('');
  };

  const statusCounts = useMemo(
    () => ({
      submitted: mockListings.filter(l => l.status === 'submitted').length,
      under_review: mockListings.filter(l => l.status === 'under_review').length,
      approved: mockListings.filter(l => l.status === 'approved').length,
      rejected: mockListings.filter(l => l.status === 'rejected').length,
      flagged: mockListings.filter(l => l.status === 'flagged').length,
    }),
    []
  );

  return (
    <AdminSidebar activeTab="listings" showRoleSelector={false}>
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary-800 mb-1">{t('listingsModeration')}</h1>
          <p className="text-sm text-primary-400">{t('demoLabel')}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <div className="card p-3 border-l-4 border-sand-300">
            <p className="text-2xl font-bold text-primary-700">{statusCounts.submitted}</p>
            <p className="text-xs text-primary-400">Submitted</p>
          </div>
          <div className="card p-3 border-l-4 border-info-400">
            <p className="text-2xl font-bold text-info-600">{statusCounts.under_review}</p>
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
          <div className="card p-3 border-l-4 border-warning-400">
            <p className="text-2xl font-bold text-warning-600">{statusCounts.flagged}</p>
            <p className="text-xs text-primary-400">Flagged</p>
          </div>
        </div>

        {/* Controls */}
        <div className="card p-4 mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-primary-400" />
            <input
              type="text"
              placeholder="Search by title, seller, or listing ID..."
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
                  setStatusFilter(e.target.value as ListingStatus | 'all');
                  setCurrentPage(1);
                }}
                className="w-full px-2 py-2 border border-sand-200 rounded text-sm"
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary-700 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value as ListingCategory | 'all');
                  setCurrentPage(1);
                }}
                className="w-full px-2 py-2 border border-sand-200 rounded text-sm"
              >
                <option value="all">All Categories</option>
                <option value="vehicles">Vehicles</option>
                <option value="realEstate">Real Estate</option>
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
                <option value="services">Services</option>
                <option value="jobs">Jobs</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary-700 mb-1">Risk Level</label>
              <select
                value={riskFilter}
                onChange={(e) => {
                  setRiskFilter(e.target.value as 'all' | 'low' | 'medium' | 'high' | 'critical');
                  setCurrentPage(1);
                }}
                className="w-full px-2 py-2 border border-sand-200 rounded text-sm"
              >
                <option value="all">All Risk Levels</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
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
                <option value="risk">Highest Risk</option>
                <option value="completeness">Completeness</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {paginatedListings.length === 0 ? (
          <EmptyState
            title="No listings to moderate"
            description="All listings have been processed"
            icon={<FileText className="w-12 h-12 text-primary-300" />}
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-sand-200 mb-6">
              <table className="w-full">
                <thead>
                  <tr className="bg-sand-50 border-b border-sand-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">Listing</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">Seller</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">Risk</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">Completeness</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedListings.map((l) => {
                    const riskInfo = getRiskColor(l.riskScore);
                    return (
                      <tr key={l.id} className="border-b border-sand-100 hover:bg-sand-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-primary-900 text-sm">{l.title}</p>
                            <p className="text-xs text-primary-500">{l.id}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div>
                            <p className="font-medium text-primary-900">{l.seller.name}</p>
                            <p className="text-xs text-primary-500">Rep: {l.seller.reputation}%</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs capitalize">{l.category}</span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(l.status)}`}>
                            {l.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-1">
                            <span className={`font-bold ${riskInfo.color}`}>{l.riskScore}%</span>
                            <span className={`px-1.5 py-0.5 rounded text-xs ${riskInfo.bgColor} ${riskInfo.color}`}>{riskInfo.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-1">
                            <div className="w-12 h-1.5 bg-sand-200 rounded-full overflow-hidden">
                              <div className="h-full bg-primary-500" style={{ width: `${l.completeness}%` }} />
                            </div>
                            <span className="text-xs text-primary-600 font-medium">{l.completeness}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setSelectedListing(l);
                                setShowDetailsModal(true);
                              }}
                              className="p-1.5 hover:bg-primary-100 rounded text-primary-600"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {(l.status === 'submitted' || l.status === 'under_review') && (
                              <>
                                <button
                                  onClick={() => handleAction('approve', l)}
                                  className="p-1.5 hover:bg-success-100 rounded text-success-600"
                                  title="Approve"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleAction('reject', l)}
                                  className="p-1.5 hover:bg-error-100 rounded text-error-600"
                                  title="Reject"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleAction('flag', l)}
                                  className="p-1.5 hover:bg-warning-100 rounded text-warning-600"
                                  title="Flag"
                                >
                                  <Flag className="w-4 h-4" />
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
              {paginatedListings.map((l) => {
                const riskInfo = getRiskColor(l.riskScore);
                return (
                  <div key={l.id} className="card p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-primary-900 text-sm">{l.title}</h3>
                        <p className="text-xs text-primary-500 mt-1">{l.id}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(l.status)}`}>
                        {l.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm mb-3">
                      <p className="text-primary-700">{l.seller.name}</p>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs capitalize">{l.category}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${riskInfo.bgColor} ${riskInfo.color}`}>
                          Risk: {l.riskScore}% ({riskInfo.label})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-primary-600">Completeness:</span>
                        <div className="flex-1 h-1.5 bg-sand-200 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-500" style={{ width: `${l.completeness}%` }} />
                        </div>
                        <span className="text-xs text-primary-600 font-medium">{l.completeness}%</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedListing(l);
                          setShowDetailsModal(true);
                        }}
                        className="flex-1 py-2 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
                      >
                        View Details
                      </button>
                      {(l.status === 'submitted' || l.status === 'under_review') && (
                        <button
                          onClick={() => handleAction('approve', l)}
                          className="flex-1 py-2 bg-success-600 text-white rounded text-sm hover:bg-success-700"
                        >
                          Approve
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
        {showDetailsModal && selectedListing && (
          <Modal
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            title={selectedListing.title}
            className="sm:max-w-3xl"
          >
            <div className="space-y-6">
              {/* Images */}
              <div>
                <p className="text-sm font-semibold text-primary-700 mb-3">Images ({selectedListing.images.length})</p>
                <div className="grid grid-cols-3 gap-2">
                  {selectedListing.images.map((img) => (
                    <div key={img.id} className="relative bg-sand-100 rounded overflow-hidden h-24 flex items-center justify-center border-2 border-sand-200">
                      <Image className="w-8 h-8 text-primary-300" />
                      {img.isCover && <span className="absolute top-1 right-1 px-2 py-0.5 bg-primary-600 text-white text-xs rounded">Cover</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-primary-600 uppercase">Category</p>
                  <p className="text-sm font-medium text-primary-900 capitalize">{selectedListing.category}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary-600 uppercase">Status</p>
                  <p className={`text-sm font-medium capitalize ${getStatusColor(selectedListing.status)}`}>
                    {selectedListing.status.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary-600 uppercase">Price</p>
                  <p className="text-sm font-medium text-primary-900">
                    {selectedListing.price.toLocaleString()} {selectedListing.currency}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary-600 uppercase">Location</p>
                  <p className="text-sm text-primary-900">{selectedListing.location}</p>
                </div>
              </div>

              {/* Seller Info */}
              <div className="card p-3 bg-sand-50">
                <p className="text-xs font-semibold text-primary-600 uppercase mb-2">Seller Information</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-primary-600">Name</p>
                    <p className="font-medium text-primary-900">{selectedListing.seller.name}</p>
                  </div>
                  <div>
                    <p className="text-primary-600">Reputation</p>
                    <p className="font-medium text-primary-900">{selectedListing.seller.reputation}%</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-primary-600">Email</p>
                    <p className="font-medium text-primary-900">{selectedListing.seller.email}</p>
                  </div>
                </div>
              </div>

              {/* Moderation Info */}
              <div className="grid grid-cols-3 gap-3">
                <div className="card p-3 bg-sand-50">
                  <p className="text-xs text-primary-600">Completeness</p>
                  <p className="text-2xl font-bold text-primary-900">{selectedListing.completeness}%</p>
                </div>
                <div className="card p-3 bg-sand-50">
                  <p className="text-xs text-primary-600">Risk Score</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-bold text-primary-900">{selectedListing.riskScore}%</p>
                    <span className="text-xs text-primary-600">{getRiskColor(selectedListing.riskScore).label}</span>
                  </div>
                </div>
                <div className="card p-3 bg-sand-50">
                  <p className="text-xs text-primary-600">Submitted</p>
                  <p className="text-sm font-medium text-primary-900">{selectedListing.submittedDate}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-sm font-semibold text-primary-700 mb-2">Description</p>
                <div className="p-3 bg-sand-50 rounded border border-sand-200">
                  <p className="text-sm text-primary-900">{selectedListing.description}</p>
                </div>
              </div>

              {/* Risk Flags */}
              {selectedListing.riskFlags.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-primary-700 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-error-600" />
                    Risk Flags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedListing.riskFlags.map((flag) => (
                      <span key={flag} className="px-2 py-1 bg-error-100 text-error-700 rounded text-xs font-medium capitalize">
                        {flag.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Violated Rules */}
              {selectedListing.violatedRules && selectedListing.violatedRules.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-primary-700 mb-2">Violated Rules</p>
                  <ul className="space-y-1">
                    {selectedListing.violatedRules.map((rule, i) => (
                      <li key={i} className="text-sm text-primary-900 flex items-start gap-2">
                        <X className="w-4 h-4 text-error-600 shrink-0 mt-0.5" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Moderator Notes */}
              <div>
                <p className="text-sm font-semibold text-primary-700 mb-2">Internal Notes</p>
                <div className="p-3 bg-sand-50 rounded border border-sand-200 min-h-16">
                  <p className="text-sm text-primary-900">{selectedListing.moderatorNotes || 'No notes yet'}</p>
                </div>
              </div>

              {/* Action Buttons */}
              {(selectedListing.status === 'submitted' || selectedListing.status === 'under_review') && (
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-sand-200">
                  <button
                    onClick={() => {
                      handleAction('reject', selectedListing);
                    }}
                    className="py-2 border border-error-400 text-error-700 rounded hover:bg-error-50 font-medium transition text-sm"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      handleAction('flag', selectedListing);
                    }}
                    className="py-2 border border-warning-400 text-warning-700 rounded hover:bg-warning-50 font-medium transition text-sm"
                  >
                    Flag
                  </button>
                  <button
                    onClick={() => {
                      handleAction('approve', selectedListing);
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
              setRejectionReason('');
              setModeratorNotes('');
            }}
            title={`${showActionModal.type.toUpperCase()} - ${showActionModal.data.title}`}
            className="sm:max-w-md"
          >
            <div className="space-y-4">
              <div className="p-3 bg-sand-50 rounded border border-sand-200">
                <p className="text-sm text-primary-700">
                  {showActionModal.type === 'approve' && `Approve this listing for publication?`}
                  {showActionModal.type === 'reject' && `Reject this listing? The seller will be notified.`}
                  {showActionModal.type === 'flag' && `Flag this listing for further review?`}
                </p>
              </div>

              {showActionModal.type === 'reject' && (
                <div>
                  <label className="block text-xs font-semibold text-primary-700 mb-2">Reason for Rejection</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this listing is being rejected..."
                    className="w-full px-3 py-2 border border-sand-200 rounded text-sm focus:outline-none focus:border-primary-500"
                    rows={3}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-primary-700 mb-2">Internal Notes (Optional)</label>
                <textarea
                  value={moderatorNotes}
                  onChange={(e) => setModeratorNotes(e.target.value)}
                  placeholder="Add internal notes about this action..."
                  className="w-full px-3 py-2 border border-sand-200 rounded text-sm focus:outline-none focus:border-primary-500"
                  rows={2}
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-sand-200">
                <button
                  onClick={() => {
                    setShowActionModal(null);
                    setRejectionReason('');
                    setModeratorNotes('');
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
                      : showActionModal.type === 'flag'
                      ? 'bg-warning-600 hover:bg-warning-700'
                      : 'bg-error-600 hover:bg-error-700'
                  }`}
                >
                  {showActionModal.type === 'approve' && 'Approve'}
                  {showActionModal.type === 'reject' && 'Reject'}
                  {showActionModal.type === 'flag' && 'Flag for Review'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminSidebar>
  );
}

export default AdminListingModerationPage;
