import { useState, useMemo } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { AdminSidebar } from '@/components/AdminSidebar';
import { EmptyState, StatusBadge, Modal } from '@/components/ui';
import {
  Search, ChevronDown, Eye, MessageSquare, History, Shield,
  Trash2, Check, X, Users, Store, Calendar, Clock, Mail, Phone,
  ChevronLeft, ChevronRight, FileText,
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

type UserRole = 'buyer' | 'seller' | 'serviceProvider' | 'jobSeeker';
type VerificationStatus = 'verified' | 'unverified' | 'pending' | 'rejected';
type UserStatus = 'active' | 'suspended' | 'banned';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountType: UserRole;
  verificationStatus: VerificationStatus;
  status: UserStatus;
  registrationDate: string;
  lastActive: string;
  listingsCount?: number;
}

interface Business {
  id: string;
  name: string;
  owner: string;
  ownerEmail: string;
  businessType: string;
  category: string;
  verificationStatus: VerificationStatus;
  registrationDate: string;
  listingsCount: number;
  staffCount: number;
}

const mockUsers: User[] = [
  {
    id: 'user-001',
    name: 'Ahmed Mohammed',
    email: 'ahmed@example.com',
    phone: '+249123456789',
    accountType: 'seller',
    verificationStatus: 'verified',
    status: 'active',
    registrationDate: '2024-01-15',
    lastActive: '2 hours ago',
    listingsCount: 12,
  },
  {
    id: 'user-002',
    name: 'Fatima Hassan',
    email: 'fatima@example.com',
    phone: '+249198765432',
    accountType: 'buyer',
    verificationStatus: 'verified',
    status: 'active',
    registrationDate: '2024-02-20',
    lastActive: '1 hour ago',
  },
  {
    id: 'user-003',
    name: 'Ibrahim Salih',
    email: 'ibrahim@example.com',
    phone: '+249112345678',
    accountType: 'serviceProvider',
    verificationStatus: 'pending',
    status: 'active',
    registrationDate: '2024-03-10',
    lastActive: '5 hours ago',
    listingsCount: 8,
  },
  {
    id: 'user-004',
    name: 'Noor Ali',
    email: 'noor@example.com',
    phone: '+249134567890',
    accountType: 'jobSeeker',
    verificationStatus: 'unverified',
    status: 'suspended',
    registrationDate: '2024-03-25',
    lastActive: '3 days ago',
  },
  {
    id: 'user-005',
    name: 'Karim Osman',
    email: 'karim@example.com',
    phone: '+249156789012',
    accountType: 'seller',
    verificationStatus: 'verified',
    status: 'active',
    registrationDate: '2024-01-05',
    lastActive: 'now',
    listingsCount: 25,
  },
];

const mockBusinesses: Business[] = [
  {
    id: 'biz-001',
    name: 'Al-Nile Motors',
    owner: 'Ahmed Mohammed',
    ownerEmail: 'ahmed@alnile.com',
    businessType: 'dealership',
    category: 'vehicles',
    verificationStatus: 'verified',
    registrationDate: '2023-12-01',
    listingsCount: 45,
    staffCount: 8,
  },
  {
    id: 'biz-002',
    name: 'Blue Nile Properties',
    owner: 'Ibrahim Salih',
    ownerEmail: 'ibrahim@bluenile.com',
    businessType: 'realEstate',
    category: 'realEstate',
    verificationStatus: 'verified',
    registrationDate: '2023-11-15',
    listingsCount: 120,
    staffCount: 12,
  },
  {
    id: 'biz-003',
    name: 'Tech Services Hub',
    owner: 'Noor Ali',
    ownerEmail: 'noor@techservices.com',
    businessType: 'services',
    category: 'services',
    verificationStatus: 'pending',
    registrationDate: '2024-02-28',
    listingsCount: 18,
    staffCount: 3,
  },
  {
    id: 'biz-004',
    name: 'Fashion Hub',
    owner: 'Fatima Hassan',
    ownerEmail: 'fatima@fashionhub.com',
    businessType: 'fashion',
    category: 'womenFashion',
    verificationStatus: 'rejected',
    registrationDate: '2024-01-20',
    listingsCount: 0,
    staffCount: 0,
  },
];

function getStatusColor(status: UserStatus | VerificationStatus): string {
  const colors: Record<string, string> = {
    active: 'bg-success-100 text-success-700',
    suspended: 'bg-warning-100 text-warning-700',
    banned: 'bg-error-100 text-error-700',
    verified: 'bg-success-100 text-success-700',
    unverified: 'bg-sand-100 text-primary-700',
    pending: 'bg-warning-100 text-warning-700',
    rejected: 'bg-error-100 text-error-700',
  };
  return colors[status] || 'bg-sand-100 text-primary-700';
}

function getAccountTypeLabel(type: UserRole): TranslationKey {
  const labels: Record<UserRole, TranslationKey> = {
    buyer: 'buyer',
    seller: 'seller',
    serviceProvider: 'serviceProvider',
    jobSeeker: 'jobSeeker',
  };
  return labels[type];
}

export function AdminUsersPage() {
  const { t, lang } = useI18n();
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'users' | 'businesses'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedBusinesses, setSelectedBusinesses] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: string; id: string; label: string } | null>(null);

  // Filter and search users
  const filteredUsers = useMemo(() => {
    return mockUsers.filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery)
    );
  }, [searchQuery]);

  // Filter and search businesses
  const filteredBusinesses = useMemo(() => {
    return mockBusinesses.filter(biz =>
      biz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      biz.owner.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Pagination
  const userPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const businessPages = Math.ceil(filteredBusinesses.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const paginatedBusinesses = filteredBusinesses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleUserAction = (action: string, userId: string, userName: string) => {
    // Non-destructive actions execute immediately
    if (['view', 'message', 'activity', 'audit'].includes(action)) {
      const actionMessages: Record<string, string> = {
        view: `Opening profile for ${userName}`,
        message: `Opening messages with ${userName}`,
        activity: `Loading activity for ${userName}`,
        audit: `Loading audit log for ${userName}`,
      };
      showToast(actionMessages[action], 'info');
      console.log(`Action: ${action} on ${userId}`);
      return;
    }
    
    // Destructive actions need confirmation
    setConfirmAction({ type: action, id: userId, label: userName });
    setShowConfirmModal(`user-${action}`);
  };

  const handleBusinessAction = (action: string, bizId: string, bizName: string) => {
    // Non-destructive actions execute immediately
    if (['view', 'listings', 'activity', 'audit'].includes(action)) {
      const actionMessages: Record<string, string> = {
        view: `Opening profile for ${bizName}`,
        listings: `Loading listings for ${bizName}`,
        activity: `Loading activity for ${bizName}`,
        audit: `Loading audit log for ${bizName}`,
      };
      showToast(actionMessages[action], 'info');
      console.log(`Action: ${action} on ${bizId}`);
      return;
    }
    
    // Destructive actions need confirmation
    setConfirmAction({ type: action, id: bizId, label: bizName });
    setShowConfirmModal(`biz-${action}`);
  };

  const executeAction = () => {
    if (!confirmAction) return;
    
    const actionMessages: Record<string, string> = {
      view: `Viewing profile for ${confirmAction.label}`,
      message: `Opening messages with ${confirmAction.label}`,
      suspend: `User ${confirmAction.label} has been suspended`,
      unsuspend: `User ${confirmAction.label} suspension removed`,
      ban: `User ${confirmAction.label} has been banned`,
      unban: `User ${confirmAction.label} ban removed`,
      verify: `${confirmAction.label} has been verified`,
      reject: `${confirmAction.label} verification rejected`,
      listings: `Viewing listings for ${confirmAction.label}`,
      activity: `Viewing activity log for ${confirmAction.label}`,
      audit: `Viewing audit log for ${confirmAction.label}`,
    };

    const message = actionMessages[confirmAction.type] || `Action "${confirmAction.type}" executed on ${confirmAction.label}`;
    showToast(message, 'success');
    
    console.log(`Action: ${confirmAction.type} on ${confirmAction.id} (${confirmAction.label})`);
    
    setShowConfirmModal(null);
    setConfirmAction(null);
  };

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleBusinessSelection = (bizId: string) => {
    const newSelected = new Set(selectedBusinesses);
    if (newSelected.has(bizId)) {
      newSelected.delete(bizId);
    } else {
      newSelected.add(bizId);
    }
    setSelectedBusinesses(newSelected);
  };

  const selectAllUsers = () => {
    if (selectedUsers.size === paginatedUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(paginatedUsers.map(u => u.id)));
    }
  };

  const selectAllBusinesses = () => {
    if (selectedBusinesses.size === paginatedBusinesses.length) {
      setSelectedBusinesses(new Set());
    } else {
      setSelectedBusinesses(new Set(paginatedBusinesses.map(b => b.id)));
    }
  };

  return (
    <AdminSidebar activeTab="users" showRoleSelector={false}>
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary-800 mb-1">{t('usersBusinesses')}</h1>
          <p className="text-sm text-primary-400">{t('demoLabel')}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-6 border-b border-sand-200">
          <button
            onClick={() => {
              setActiveTab('users');
              setCurrentPage(1);
              setSearchQuery('');
            }}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-primary-400 hover:text-primary-600'
            }`}
          >
            {t('usersTab')} <span className="text-xs">({filteredUsers.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('businesses');
              setCurrentPage(1);
              setSearchQuery('');
            }}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'businesses'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-primary-400 hover:text-primary-600'
            }`}
          >
            {t('businessesTab')} <span className="text-xs">({filteredBusinesses.length})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-primary-400" />
          <input
            type="text"
            placeholder={activeTab === 'users' ? t('searchUsers') : t('searchBusinesses')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-sand-200 rounded-lg focus:outline-none focus:border-primary-500"
          />
        </div>

        {/* Bulk Actions */}
        {(selectedUsers.size > 0 || selectedBusinesses.size > 0) && (
          <div className="mb-4 p-3 bg-primary-50 rounded-lg flex items-center justify-between">
            <span className="text-sm font-medium text-primary-700">
              {activeTab === 'users'
                ? `${selectedUsers.size} ${t('selectUsers')}`
                : `${selectedBusinesses.size} ${t('selectBusinesses')}`}
            </span>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition">
                {t('sendNotification')}
              </button>
              {activeTab === 'users' && (
                <>
                  <button className="px-3 py-1 text-sm bg-warning-600 text-white rounded hover:bg-warning-700 transition">
                    {t('suspendSelected')}
                  </button>
                  <button className="px-3 py-1 text-sm bg-success-600 text-white rounded hover:bg-success-700 transition">
                    {t('unsuspendSelected')}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            {filteredUsers.length === 0 ? (
              <EmptyState
                title={t('noUsers')}
                description="No users match your search"
                icon={<Users className="w-12 h-12 text-primary-300" />}
              />
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto rounded-lg border border-sand-200">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-sand-50 border-b border-sand-200">
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedUsers.size === paginatedUsers.length && paginatedUsers.length > 0}
                            onChange={selectAllUsers}
                            className="rounded"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">{t('name')}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">{t('email')}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">{t('accountType')}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">{t('verificationStatus')}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">{t('status')}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">{t('registrationDate')}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">{t('actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.map((user) => (
                        <tr key={user.id} className="border-b border-sand-100 hover:bg-sand-50">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedUsers.has(user.id)}
                              onChange={() => toggleUserSelection(user.id)}
                              className="rounded"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-primary-900">{user.name}</td>
                          <td className="px-4 py-3 text-sm text-primary-600">{user.email}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 bg-sand-100 text-primary-700 rounded text-xs">
                              {t(getAccountTypeLabel(user.accountType))}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(user.verificationStatus)}`}>
                              {t(user.verificationStatus as TranslationKey)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(user.status)}`}>
                              {t(user.status as TranslationKey)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-primary-600">{user.registrationDate}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleUserAction('view', user.id, user.name)}
                                className="p-1.5 hover:bg-primary-100 rounded text-primary-600"
                                title={t('viewProfile')}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleUserAction('message', user.id, user.name)}
                                className="p-1.5 hover:bg-primary-100 rounded text-primary-600"
                                title={t('sendMessage')}
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleUserAction(user.status === 'suspended' ? 'unsuspend' : 'suspend', user.id, user.name)
                                }
                                className="p-1.5 hover:bg-warning-100 rounded text-warning-600"
                                title={user.status === 'suspended' ? t('unsuspend') : t('suspend')}
                              >
                                <Shield className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleUserAction('ban', user.id, user.name)}
                                className="p-1.5 hover:bg-error-100 rounded text-error-600"
                                title={t('ban')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {paginatedUsers.map((user) => (
                    <div key={user.id} className="card p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                            className="rounded mr-2"
                          />
                          <h3 className="font-semibold text-primary-900">{user.name}</h3>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm mb-3">
                        <div className="flex items-center gap-2 text-primary-600">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-primary-600">
                          <Phone className="w-4 h-4" />
                          {user.phone}
                        </div>
                        <div className="flex gap-2">
                          <span className="px-2 py-1 bg-sand-100 text-primary-700 rounded text-xs">
                            {t(getAccountTypeLabel(user.accountType))}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(user.verificationStatus)}`}>
                            {t(user.verificationStatus as TranslationKey)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUserAction('view', user.id, user.name)}
                          className="flex-1 py-2 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
                        >
                          {t('viewProfile')}
                        </button>
                        <button
                          onClick={() =>
                            handleUserAction(user.status === 'suspended' ? 'unsuspend' : 'suspend', user.id, user.name)
                          }
                          className="flex-1 py-2 bg-warning-600 text-white rounded text-sm hover:bg-warning-700"
                        >
                          {user.status === 'suspended' ? t('unsuspend') : t('suspend')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-primary-600">{t('itemsPerPage')}:</label>
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
                      {currentPage} / {userPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(userPages, currentPage + 1))}
                      disabled={currentPage === userPages}
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

        {/* Businesses Tab */}
        {activeTab === 'businesses' && (
          <div>
            {filteredBusinesses.length === 0 ? (
              <EmptyState
                title={t('noBusinesses')}
                description="No businesses match your search"
                icon={<Store className="w-12 h-12 text-primary-300" />}
              />
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto rounded-lg border border-sand-200">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-sand-50 border-b border-sand-200">
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedBusinesses.size === paginatedBusinesses.length && paginatedBusinesses.length > 0}
                            onChange={selectAllBusinesses}
                            className="rounded"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">{t('businessName')}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">{t('owner')}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">{t('businessType')}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">{t('verificationStatus')}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">{t('listingsCount')}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-700">{t('actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedBusinesses.map((biz) => (
                        <tr key={biz.id} className="border-b border-sand-100 hover:bg-sand-50">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedBusinesses.has(biz.id)}
                              onChange={() => toggleBusinessSelection(biz.id)}
                              className="rounded"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-primary-900">{biz.name}</td>
                          <td className="px-4 py-3 text-sm text-primary-600">{biz.owner}</td>
                          <td className="px-4 py-3 text-sm">{biz.businessType}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(biz.verificationStatus)}`}>
                              {t(biz.verificationStatus as TranslationKey)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-primary-600">{biz.listingsCount}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleBusinessAction('view', biz.id, biz.name)}
                                className="p-1.5 hover:bg-primary-100 rounded text-primary-600"
                                title={t('viewProfile')}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleBusinessAction('listings', biz.id, biz.name)}
                                className="p-1.5 hover:bg-primary-100 rounded text-primary-600"
                                title={t('viewListings')}
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleBusinessAction('verify', biz.id, biz.name)}
                                className="p-1.5 hover:bg-success-100 rounded text-success-600"
                                title={t('verifyUser')}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleBusinessAction('reject', biz.id, biz.name)}
                                className="p-1.5 hover:bg-error-100 rounded text-error-600"
                                title={t('reject')}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {paginatedBusinesses.map((biz) => (
                    <div key={biz.id} className="card p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <input
                            type="checkbox"
                            checked={selectedBusinesses.has(biz.id)}
                            onChange={() => toggleBusinessSelection(biz.id)}
                            className="rounded mr-2"
                          />
                          <h3 className="font-semibold text-primary-900">{biz.name}</h3>
                          <p className="text-sm text-primary-600">{biz.owner}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm mb-3">
                        <div className="flex gap-2">
                          <span className="px-2 py-1 bg-sand-100 text-primary-700 rounded text-xs">{biz.businessType}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(biz.verificationStatus)}`}>
                            {t(biz.verificationStatus as TranslationKey)}
                          </span>
                        </div>
                        <p className="text-primary-600">{biz.listingsCount} listings</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBusinessAction('view', biz.id, biz.name)}
                          className="flex-1 py-2 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
                        >
                          {t('viewProfile')}
                        </button>
                        <button
                          onClick={() => handleBusinessAction('verify', biz.id, biz.name)}
                          className="flex-1 py-2 bg-success-600 text-white rounded text-sm hover:bg-success-700"
                        >
                          {t('verifyUser')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-primary-600">{t('itemsPerPage')}:</label>
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
                      {currentPage} / {businessPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(businessPages, currentPage + 1))}
                      disabled={currentPage === businessPages}
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

        {/* Confirmation Modal */}
        {showConfirmModal && confirmAction && (
          <Modal
            isOpen={showConfirmModal !== null}
            onClose={() => {
              setShowConfirmModal(null);
              setConfirmAction(null);
            }}
            title={`Confirm ${confirmAction.type}`}
            className="sm:max-w-md"
          >
            <div className="space-y-4">
              <p className="text-primary-700">
                {confirmAction.type === 'suspend' && `${t('confirmSuspend')}: ${confirmAction.label}?`}
                {confirmAction.type === 'unsuspend' && `Remove suspension from ${confirmAction.label}?`}
                {confirmAction.type === 'ban' && `${t('confirmBan')}: ${confirmAction.label}?`}
                {confirmAction.type === 'unban' && `Remove ban from ${confirmAction.label}?`}
                {confirmAction.type === 'verify' && `Verify ${confirmAction.label}?`}
                {confirmAction.type === 'reject' && `${t('confirmRejectVerification')}: ${confirmAction.label}?`}
                {!['suspend', 'unsuspend', 'ban', 'unban', 'verify', 'reject'].includes(confirmAction.type) && 
                  `Confirm ${confirmAction.type} for ${confirmAction.label}?`}
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowConfirmModal(null);
                    setConfirmAction(null);
                  }}
                  className="px-4 py-2 text-primary-700 border border-sand-200 rounded hover:bg-sand-50"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={executeAction}
                  className="px-4 py-2 bg-error-600 text-white rounded hover:bg-error-700"
                >
                  {t('confirm')}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminSidebar>
  );
}

// Export for lazy loading
export default AdminUsersPage;
