import { useState, useMemo } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Modal, EmptyState } from '@/components/ui';
import {
  CreditCard, Check, X, AlertCircle, Eye, ZoomIn, ZoomOut, RotateCw,
  Download, Search, Filter, Clock, CheckCircle, XCircle, AlertTriangle,
  User, Mail, Phone, MapPin, DollarSign, Calendar, Hash, Copy
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

type PaymentStatus = 'pending' | 'approved' | 'rejected';
type RejectionReason = 'illegible' | 'incorrect_amount' | 'duplicate_reference' | 'other';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  subscriptionType: string;
  joinedAt: string;
}

interface PaymentReceipt {
  id: string;
  userId: string;
  user: UserProfile;
  reference: string;
  amount: number;
  currency: string;
  receiptImageUrl: string;
  submittedAt: string;
  status: PaymentStatus;
  isDuplicate: boolean;
  isReusedImage: boolean;
  notes?: string;
  rejectionReason?: RejectionReason;
  rejectionNotes?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  auditTrail: Array<{
    timestamp: string;
    action: string;
    actor: string;
  }>;
}

const mockPayments: PaymentReceipt[] = [
  {
    id: 'pay-1',
    userId: 'user-1',
    user: {
      id: 'user-1',
      name: 'Ahmed Mohammed',
      email: 'ahmed@example.com',
      phone: '+249 901 234 567',
      location: 'Khartoum',
      subscriptionType: 'Premium',
      joinedAt: '2024-06-15',
    },
    reference: 'BNK-2025-001-789',
    amount: 499,
    currency: 'SDG',
    receiptImageUrl: 'https://via.placeholder.com/400x600?text=Receipt+Image',
    submittedAt: '2025-01-14T10:30:00Z',
    status: 'pending',
    isDuplicate: false,
    isReusedImage: false,
    auditTrail: [
      { timestamp: '2025-01-14T10:30:00Z', action: 'Submitted', actor: 'Ahmed Mohammed' },
    ],
  },
  {
    id: 'pay-2',
    userId: 'user-2',
    user: {
      id: 'user-2',
      name: 'Fatima Hassan',
      email: 'fatima@example.com',
      phone: '+249 912 345 678',
      location: 'Port Sudan',
      subscriptionType: 'Standard',
      joinedAt: '2023-09-20',
    },
    reference: 'BNK-2025-001-790',
    amount: 249,
    currency: 'SDG',
    receiptImageUrl: 'https://via.placeholder.com/400x600?text=Receipt+Image',
    submittedAt: '2025-01-13T14:15:00Z',
    status: 'pending',
    isDuplicate: true,
    isReusedImage: false,
    notes: 'Duplicate reference detected - check transaction history',
    auditTrail: [
      { timestamp: '2025-01-13T14:15:00Z', action: 'Submitted', actor: 'Fatima Hassan' },
    ],
  },
  {
    id: 'pay-3',
    userId: 'user-3',
    user: {
      id: 'user-3',
      name: 'Ibrahim Ali',
      email: 'ibrahim@example.com',
      phone: '+249 923 456 789',
      location: 'Medani',
      subscriptionType: 'Premium',
      joinedAt: '2024-01-10',
    },
    reference: 'BNK-2025-001-791',
    amount: 799,
    currency: 'SDG',
    receiptImageUrl: 'https://via.placeholder.com/400x600?text=Receipt+Image',
    submittedAt: '2025-01-12T09:45:00Z',
    status: 'approved',
    isDuplicate: false,
    isReusedImage: false,
    approvedAt: '2025-01-12T11:20:00Z',
    approvedBy: 'Finance Admin',
    auditTrail: [
      { timestamp: '2025-01-12T09:45:00Z', action: 'Submitted', actor: 'Ibrahim Ali' },
      { timestamp: '2025-01-12T11:20:00Z', action: 'Approved', actor: 'Finance Admin' },
    ],
  },
  {
    id: 'pay-4',
    userId: 'user-4',
    user: {
      id: 'user-4',
      name: 'Layla Ahmed',
      email: 'layla@example.com',
      phone: '+249 934 567 890',
      location: 'Khartoum',
      subscriptionType: 'Standard',
      joinedAt: '2024-11-05',
    },
    reference: 'BNK-2025-001-792',
    amount: 150,
    currency: 'SDG',
    receiptImageUrl: 'https://via.placeholder.com/400x600?text=Receipt+Image',
    submittedAt: '2025-01-10T16:30:00Z',
    status: 'rejected',
    isDuplicate: false,
    isReusedImage: true,
    rejectionReason: 'illegible',
    rejectionNotes: 'Receipt is blurry and difficult to verify',
    rejectedAt: '2025-01-10T17:45:00Z',
    rejectedBy: 'Finance Admin',
    auditTrail: [
      { timestamp: '2025-01-10T16:30:00Z', action: 'Submitted', actor: 'Layla Ahmed' },
      { timestamp: '2025-01-10T17:45:00Z', action: 'Rejected - Illegible receipt', actor: 'Finance Admin' },
    ],
  },
];

export function AdminPaymentVerificationPage() {
  const { t } = useI18n();
  const { showToast } = useApp();

  const [payments, setPayments] = useState<PaymentReceipt[]>(mockPayments);
  const [selectedPayment, setSelectedPayment] = useState<PaymentReceipt | null>(mockPayments[0]);
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<RejectionReason>('illegible');
  const [rejectionNotes, setRejectionNotes] = useState('');

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchStatus = filterStatus === 'all' || p.status === filterStatus;
      const matchSearch =
        p.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.user.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [payments, filterStatus, searchQuery]);

  const statusColors: Record<PaymentStatus, string> = {
    pending: 'bg-warning-100 text-warning-700',
    approved: 'bg-success-100 text-success-700',
    rejected: 'bg-error-100 text-error-700',
  };

  const statusIcons: Record<PaymentStatus, typeof Clock> = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
  };

  const handleApprove = () => {
    if (selectedPayment) {
      const updated = {
        ...selectedPayment,
        status: 'approved' as PaymentStatus,
        approvedAt: new Date().toISOString(),
        approvedBy: 'Current Admin',
        auditTrail: [
          ...selectedPayment.auditTrail,
          {
            timestamp: new Date().toISOString(),
            action: 'Approved',
            actor: 'Current Admin',
          },
        ],
      };
      setPayments(payments.map(p => (p.id === selectedPayment.id ? updated : p)));
      setSelectedPayment(updated);
      showToast(t('paymentApproved') || 'Payment approved', 'success');
    }
  };

  const handleReject = () => {
    if (selectedPayment && rejectionNotes.trim()) {
      const reasons: Record<RejectionReason, string> = {
        illegible: 'Illegible receipt',
        incorrect_amount: 'Incorrect amount',
        duplicate_reference: 'Duplicate reference',
        other: 'Other',
      };

      const updated = {
        ...selectedPayment,
        status: 'rejected' as PaymentStatus,
        rejectionReason,
        rejectionNotes,
        rejectedAt: new Date().toISOString(),
        rejectedBy: 'Current Admin',
        auditTrail: [
          ...selectedPayment.auditTrail,
          {
            timestamp: new Date().toISOString(),
            action: `Rejected - ${reasons[rejectionReason]}`,
            actor: 'Current Admin',
          },
        ],
      };
      setPayments(payments.map(p => (p.id === selectedPayment.id ? updated : p)));
      setSelectedPayment(updated);
      setShowRejectModal(false);
      setRejectionNotes('');
      showToast(t('paymentRejected') || 'Payment rejected', 'success');
    }
  };

  return (
    <AdminSidebar activeTab="payments" showRoleSelector={false}>
      <div className="p-4 sm:p-6 space-y-6 pb-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary-800">{t('paymentVerification') || 'Payment Verification'}</h1>
            <p className="text-sm text-primary-500 mt-1">
              {t('paymentVerifyDesc') || 'Review and verify Bankak receipts for payment processing'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Payments Queue */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card p-4">
              <h2 className="font-bold text-primary-800 mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                {t('queue') || 'Queue'}
              </h2>

              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-primary-400" />
                <input
                  type="text"
                  placeholder={t('search') || 'Search...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-9 text-sm"
                />
              </div>

              <div className="space-y-2 mb-3">
                {['all', 'pending', 'approved', 'rejected'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status as any)}
                    className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition ${
                      filterStatus === status
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-primary-600 hover:bg-sand-50'
                    }`}
                  >
                    {status === 'all' ? t('all') : t(status as TranslationKey) || status}
                    <span className="ml-auto text-xs text-primary-400">
                      ({filteredPayments.filter(p => status === 'all' || p.status === status).length})
                    </span>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {filteredPayments.length === 0 ? (
                  <EmptyState
                    icon={<CreditCard className="w-8 h-8 text-primary-300" />}
                    title={t('noPayments') || 'No payments'}
                    description={t('noPaymentFound') || 'No payments found'}
                  />
                ) : (
                  filteredPayments.map(p => {
                    const Icon = statusIcons[p.status];
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPayment(p)}
                        className={`w-full text-left p-3 rounded-lg border transition ${
                          selectedPayment?.id === p.id
                            ? 'border-primary-300 bg-primary-50'
                            : 'border-sand-100 hover:border-sand-200'
                        }`}
                      >
                        <div className="flex items-start gap-2 mb-1">
                          <Icon className="w-4 h-4 mt-0.5 shrink-0 text-primary-600" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-primary-800 truncate">{p.user.name}</p>
                            <p className="text-xs text-primary-500 truncate">{p.reference}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`inline-block text-xs font-bold px-2 py-1 rounded ${statusColors[p.status]}`}>
                            {t(p.status as TranslationKey) || p.status}
                          </span>
                          <span className="text-xs font-bold text-primary-700">{p.amount} {p.currency}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right: Payment Details */}
          <div className="lg:col-span-3 space-y-4">
            {selectedPayment ? (
              <>
                {/* User & Payment Info */}
                <div className="card p-4 bg-gradient-to-br from-primary-50 to-sand-50">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary-200 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-primary-800">{selectedPayment.user.name}</h3>
                        <p className="text-sm text-primary-600">{selectedPayment.user.subscriptionType} Subscriber</p>
                      </div>
                    </div>
                    <span className={`badge font-bold ${statusColors[selectedPayment.status]}`}>
                      {t(selectedPayment.status as TranslationKey) || selectedPayment.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div className="flex items-center gap-2 text-primary-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{selectedPayment.user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-primary-600">
                      <Phone className="w-4 h-4" />
                      <span>{selectedPayment.user.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-primary-600">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedPayment.user.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-primary-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(selectedPayment.user.joinedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Fraud Warnings */}
                  {(selectedPayment.isDuplicate || selectedPayment.isReusedImage) && (
                    <div className="bg-error-50 border border-error-200 rounded p-2 text-xs">
                      {selectedPayment.isDuplicate && (
                        <div className="flex items-center gap-2 text-error-700 mb-1">
                          <AlertTriangle className="w-4 h-4" />
                          <span>{t('duplicateRef') || 'Duplicate reference detected'}</span>
                        </div>
                      )}
                      {selectedPayment.isReusedImage && (
                        <div className="flex items-center gap-2 text-error-700">
                          <AlertTriangle className="w-4 h-4" />
                          <span>{t('reusedImage') || 'Receipt image reuse detected'}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Payment Details */}
                <div className="card p-4">
                  <h3 className="font-bold text-primary-800 mb-3">{t('paymentDetails') || 'Payment Details'}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-sand-50 p-3 rounded">
                      <p className="text-primary-500 text-xs font-medium mb-1">{t('reference') || 'Reference'}</p>
                      <div className="flex items-center gap-2">
                        <code className="text-primary-800 font-mono">{selectedPayment.reference}</code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedPayment.reference);
                            showToast(t('copied') || 'Copied', 'info');
                          }}
                          className="text-primary-400 hover:text-primary-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="bg-sand-50 p-3 rounded">
                      <p className="text-primary-500 text-xs font-medium mb-1">{t('amount') || 'Amount'}</p>
                      <p className="text-primary-800 font-bold">
                        {selectedPayment.amount} {selectedPayment.currency}
                      </p>
                    </div>
                    <div className="bg-sand-50 p-3 rounded">
                      <p className="text-primary-500 text-xs font-medium mb-1">{t('submitted') || 'Submitted'}</p>
                      <p className="text-primary-800 text-sm">
                        {new Date(selectedPayment.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-sand-50 p-3 rounded">
                      <p className="text-primary-500 text-xs font-medium mb-1">{t('subscription') || 'Subscription'}</p>
                      <p className="text-primary-800 text-sm">{selectedPayment.user.subscriptionType}</p>
                    </div>
                  </div>
                </div>

                {/* Receipt Viewer & Actions */}
                <div className="card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-primary-800">{t('receiptImage') || 'Receipt Image'}</h3>
                    <button
                      onClick={() => setShowReceiptModal(true)}
                      className="btn-secondary text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      {t('viewLarge') || 'View Large'}
                    </button>
                  </div>
                  <img
                    src={selectedPayment.receiptImageUrl}
                    alt="Receipt"
                    className="w-full max-h-64 object-contain rounded bg-sand-50 border border-sand-100"
                  />
                </div>

                {/* Actions */}
                {selectedPayment.status === 'pending' && (
                  <div className="card p-4 bg-primary-50 border border-primary-200 space-y-3">
                    <button onClick={handleApprove} className="w-full btn-primary">
                      <Check className="w-4 h-4" />
                      {t('approve') || 'Approve'}
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      className="w-full btn-secondary"
                    >
                      <X className="w-4 h-4" />
                      {t('reject') || 'Reject'}
                    </button>
                  </div>
                )}

                {/* Audit Trail */}
                <div className="card p-4">
                  <h3 className="font-bold text-primary-800 mb-3">{t('auditTrail') || 'Audit Trail'}</h3>
                  <div className="space-y-2">
                    {selectedPayment.auditTrail.map((entry, idx) => (
                      <div key={idx} className="border-l-2 border-primary-200 pl-3 py-1 text-sm">
                        <p className="font-medium text-primary-700">{entry.action}</p>
                        <p className="text-xs text-primary-500">
                          {entry.actor} • {new Date(entry.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <EmptyState
                icon={<CreditCard className="w-12 h-12 text-primary-300" />}
                title={t('noSelection') || 'No selection'}
                description={t('selectPayment') || 'Select a payment to view details'}
              />
            )}
          </div>
        </div>
      </div>

      {/* Receipt Zoom Modal */}
      <Modal
        isOpen={showReceiptModal}
        title={t('receiptViewer') || 'Receipt Viewer'}
        onClose={() => {
          setShowReceiptModal(false);
          setZoomLevel(100);
        }}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <button
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 20))}
              className="btn-secondary text-sm"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium w-16 text-center">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(200, zoomLevel + 20))}
              className="btn-secondary text-sm"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button onClick={() => setZoomLevel(0)} className="btn-secondary text-sm">
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-sand-50 rounded flex items-center justify-center overflow-auto max-h-96">
            <img
              src={selectedPayment?.receiptImageUrl}
              alt="Receipt"
              style={{ width: `${zoomLevel}%` }}
              className="object-contain"
            />
          </div>
          <a
            href={selectedPayment?.receiptImageUrl}
            download="receipt.jpg"
            className="flex items-center justify-center gap-2 btn-secondary w-full"
          >
            <Download className="w-4 h-4" />
            {t('downloadReceipt') || 'Download'}
          </a>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        title={t('rejectPayment') || 'Reject Payment'}
        onClose={() => setShowRejectModal(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-primary-700 mb-2 block">{t('reason') || 'Reason'}</label>
            <select
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value as RejectionReason)}
              className="input text-sm"
            >
              <option value="illegible">{t('illegibleReceipt') || 'Illegible receipt'}</option>
              <option value="incorrect_amount">{t('incorrectAmount') || 'Incorrect amount'}</option>
              <option value="duplicate_reference">{t('duplicateRef') || 'Duplicate reference'}</option>
              <option value="other">{t('other') || 'Other'}</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-primary-700 mb-1 block">
              {t('notes') || 'Rejection Notes'} *
            </label>
            <textarea
              placeholder="Provide details for the rejection"
              className="input text-sm h-20 resize-none"
              value={rejectionNotes}
              onChange={(e) => setRejectionNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button onClick={handleReject} className="btn-primary flex-1">
              <X className="w-4 h-4" />
              {t('reject') || 'Reject'}
            </button>
            <button onClick={() => setShowRejectModal(false)} className="btn-secondary flex-1">
              {t('cancel') || 'Cancel'}
            </button>
          </div>
        </div>
      </Modal>
    </AdminSidebar>
  );
}
