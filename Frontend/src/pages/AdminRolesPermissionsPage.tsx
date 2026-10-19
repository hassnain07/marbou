import { useState, useMemo } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Modal, EmptyState } from '@/components/ui';
import {
  Lock, Plus, Edit2, Trash2, Search, Filter, Eye, Copy, Check,
  Users, Shield, Settings, AlertCircle, CheckCircle, X, ChevronDown, ChevronUp
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

type AdminRole = 'superAdmin' | 'admin' | 'moderator' | 'finance' | 'support' | 'content' | 'marketing' | 'verification' | 'technical';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  risky: boolean;
}

interface RoleConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  level: number;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  modifiedBy: string;
  userCount: number;
}

const allPermissions: Permission[] = [
  // Users Management
  { id: 'users.view', name: 'View Users', description: 'View user profiles and information', category: 'Users', risky: false },
  { id: 'users.edit', name: 'Edit Users', description: 'Modify user account details', category: 'Users', risky: true },
  { id: 'users.suspend', name: 'Suspend Users', description: 'Suspend or ban user accounts', category: 'Users', risky: true },
  { id: 'users.export', name: 'Export Users', description: 'Export user data', category: 'Users', risky: false },

  // Listings Management
  { id: 'listings.view', name: 'View Listings', description: 'View all listings', category: 'Listings', risky: false },
  { id: 'listings.moderate', name: 'Moderate Listings', description: 'Approve or reject listings', category: 'Listings', risky: true },
  { id: 'listings.delete', name: 'Delete Listings', description: 'Delete listings', category: 'Listings', risky: true },
  { id: 'listings.feature', name: 'Feature Listings', description: 'Mark listings as featured', category: 'Listings', risky: false },

  // Reports & Appeals
  { id: 'reports.view', name: 'View Reports', description: 'View user reports', category: 'Reports', risky: false },
  { id: 'reports.resolve', name: 'Resolve Reports', description: 'Process and resolve reports', category: 'Reports', risky: true },
  { id: 'appeals.view', name: 'View Appeals', description: 'View user appeals', category: 'Reports', risky: false },
  { id: 'appeals.resolve', name: 'Resolve Appeals', description: 'Process and resolve appeals', category: 'Reports', risky: true },

  // Categories & Fields
  { id: 'categories.view', name: 'View Categories', description: 'View category structure', category: 'Content', risky: false },
  { id: 'categories.create', name: 'Create Categories', description: 'Create new categories', category: 'Content', risky: true },
  { id: 'categories.edit', name: 'Edit Categories', description: 'Modify categories', category: 'Content', risky: true },
  { id: 'categories.delete', name: 'Delete Categories', description: 'Delete categories', category: 'Content', risky: true },

  // Payments & Finance
  { id: 'payments.view', name: 'View Payments', description: 'View payment records', category: 'Finance', risky: false },
  { id: 'payments.approve', name: 'Approve Payments', description: 'Approve pending payments', category: 'Finance', risky: true },
  { id: 'payments.refund', name: 'Process Refunds', description: 'Process refunds', category: 'Finance', risky: true },
  { id: 'payments.export', name: 'Export Payment Data', description: 'Export financial reports', category: 'Finance', risky: false },

  // Settings & System
  { id: 'settings.view', name: 'View Settings', description: 'View system settings', category: 'System', risky: false },
  { id: 'settings.edit', name: 'Edit Settings', description: 'Modify system settings', category: 'System', risky: true },
  { id: 'flags.manage', name: 'Manage Feature Flags', description: 'Control feature flags', category: 'System', risky: true },
  { id: 'maintenance.manage', name: 'Manage Maintenance', description: 'Schedule maintenance', category: 'System', risky: true },

  // Admin & Security
  { id: 'admin.view', name: 'View Admin Actions', description: 'View admin activity logs', category: 'Admin', risky: false },
  { id: 'admin.roles', name: 'Manage Roles', description: 'Create and modify roles', category: 'Admin', risky: true },
  { id: 'admin.permissions', name: 'Manage Permissions', description: 'Assign permissions to roles', category: 'Admin', risky: true },
  { id: 'admin.audit', name: 'View Audit Logs', description: 'Access audit logs', category: 'Admin', risky: false },
];

const mockRoles: RoleConfig[] = [
  {
    id: 'role-superadmin',
    name: 'superAdmin',
    displayName: 'Super Admin',
    description: 'Full system access and control',
    level: 9,
    permissions: allPermissions.map(p => p.id),
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-01-14T00:00:00Z',
    modifiedBy: 'System',
    userCount: 2,
  },
  {
    id: 'role-admin',
    name: 'admin',
    displayName: 'Admin',
    description: 'Administrative access to most features',
    level: 8,
    permissions: allPermissions.filter(p => !p.risky || p.category !== 'Admin').map(p => p.id),
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
    modifiedBy: 'System',
    userCount: 5,
  },
  {
    id: 'role-moderator',
    name: 'moderator',
    displayName: 'Moderator',
    description: 'Content moderation and user management',
    level: 6,
    permissions: [
      'users.view', 'users.suspend', 'listings.view', 'listings.moderate', 'listings.delete',
      'reports.view', 'reports.resolve', 'appeals.view', 'appeals.resolve'
    ],
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-01-12T00:00:00Z',
    modifiedBy: 'Admin',
    userCount: 8,
  },
  {
    id: 'role-finance',
    name: 'finance',
    displayName: 'Finance Manager',
    description: 'Financial and payment management',
    level: 5,
    permissions: [
      'users.view', 'payments.view', 'payments.approve', 'payments.refund', 'payments.export',
      'admin.view', 'admin.audit'
    ],
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-01-08T00:00:00Z',
    modifiedBy: 'Admin',
    userCount: 3,
  },
  {
    id: 'role-support',
    name: 'support',
    displayName: 'Support Staff',
    description: 'Customer support and assistance',
    level: 3,
    permissions: [
      'users.view', 'listings.view', 'reports.view', 'appeals.view', 'admin.view'
    ],
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-01-09T00:00:00Z',
    modifiedBy: 'Admin',
    userCount: 12,
  },
];

export function AdminRolesPermissionsPage() {
  const { t } = useI18n();
  const { showToast } = useApp();

  const [roles, setRoles] = useState<RoleConfig[]>(mockRoles);
  const [selectedRole, setSelectedRole] = useState<RoleConfig | null>(mockRoles[0]);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  const filteredRoles = useMemo(() => {
    return roles.filter(role => {
      return (
        role.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [roles, searchQuery]);

  const handleEditRole = (role: RoleConfig) => {
    setEditingRole(role);
    setShowModal(true);
  };

  const handleSaveRole = (roleData: Partial<RoleConfig>) => {
    if (editingRole) {
      setRoles(roles.map(r => (r.id === editingRole.id ? { ...r, ...roleData, updatedAt: new Date().toISOString() } : r)));
      showToast(t('roleUpdated') || 'Role updated', 'success');
    } else {
      const newRole: RoleConfig = {
        id: `role-${Date.now()}`,
        name: roleData.name || '',
        displayName: roleData.displayName || '',
        description: roleData.description || '',
        level: roleData.level || 5,
        permissions: roleData.permissions || [],
        isSystem: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        modifiedBy: 'Admin User',
        userCount: 0,
      };
      setRoles([...roles, newRole]);
      setSelectedRole(newRole);
      showToast(t('roleCreated') || 'Role created', 'success');
    }
    setShowModal(false);
  };

  const handleDeleteRole = (role: RoleConfig) => {
    if (role.isSystem) {
      showToast(t('cannotDeleteSystemRole') || 'Cannot delete system roles', 'error');
      return;
    }
    setRoles(roles.filter(r => r.id !== role.id));
    if (selectedRole?.id === role.id) {
      setSelectedRole(roles[0] || null);
    }
    showToast(t('roleDeleted') || 'Role deleted', 'success');
  };

  const getPermissionsByCategory = (permissions: string[]) => {
    const grouped: Record<string, Permission[]> = {};
    permissions.forEach(permId => {
      const perm = allPermissions.find(p => p.id === permId);
      if (perm) {
        if (!grouped[perm.category]) grouped[perm.category] = [];
        grouped[perm.category].push(perm);
      }
    });
    return grouped;
  };

  const getRoleColor = (level: number) => {
    if (level >= 8) return 'bg-error-50 border-error-200';
    if (level >= 6) return 'bg-warning-50 border-warning-200';
    if (level >= 3) return 'bg-primary-50 border-primary-200';
    return 'bg-sand-50 border-sand-200';
  };

  return (
    <AdminSidebar activeTab="roles" showRoleSelector={false}>
      <div className="p-4 sm:p-6 space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary-800">
              {t('rolesPermissions') || 'Roles & Permissions'}
            </h1>
            <p className="text-sm text-primary-500 mt-1">
              {t('manageAdminRolesPermissions') || 'Manage admin roles and their permissions'}
            </p>
          </div>
          <button onClick={() => { setEditingRole(null); setShowModal(true); }} className="btn-primary">
            <Plus className="w-4 h-4" />
            {t('createRole') || 'Create Role'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Role List */}
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
                {filteredRoles.length === 0 ? (
                  <EmptyState
                    icon={<Lock className="w-12 h-12 text-primary-300" />}
                    title={t('noRolesFound') || 'No roles found'}
                    description={t('createFirstRole') || 'Create your first role'}
                  />
                ) : (
                  filteredRoles.map(role => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role)}
                      className={`w-full text-left p-3 rounded-lg border transition ${
                        selectedRole?.id === role.id
                          ? 'border-primary-300 bg-primary-50'
                          : 'border-sand-100 hover:border-sand-200 hover:bg-sand-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-medium text-primary-800 truncate text-sm">
                          {role.displayName}
                        </p>
                        {role.isSystem && <Shield className="w-4 h-4 text-primary-600 shrink-0" />}
                      </div>
                      <p className="text-xs text-primary-500 mb-2 line-clamp-2">{role.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="badge bg-sand-100 text-primary-600">{role.userCount} users</span>
                        <span className="text-primary-400 font-bold">Level {role.level}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="lg:col-span-2">
            {selectedRole ? (
              <div className="space-y-4">
                {/* Header Card */}
                <div className={`card p-4 border-2 ${getRoleColor(selectedRole.level)}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-xl font-bold text-primary-800">{selectedRole.displayName}</h2>
                        {selectedRole.isSystem && (
                          <span className="badge bg-primary-100 text-primary-700 text-xs">
                            {t('system') || 'System'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-primary-600">{selectedRole.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-primary-600">
                        <span>Level: {selectedRole.level}/9</span>
                        <span>•</span>
                        <span>{selectedRole.userCount} users</span>
                        <span>•</span>
                        <span>{selectedRole.permissions.length} permissions</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditRole(selectedRole)}
                        className="btn-secondary text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {!selectedRole.isSystem && (
                        <button
                          onClick={() => handleDeleteRole(selectedRole)}
                          className="btn-secondary text-sm text-error-600 hover:bg-error-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Permissions by Category */}
                <div className="space-y-3">
                  {Object.entries(getPermissionsByCategory(selectedRole.permissions)).map(([category, perms]) => (
                    <div key={category} className="card p-4">
                      <button
                        onClick={() => setExpandedRole(expandedRole === category ? null : category)}
                        className="w-full flex items-center justify-between font-bold text-primary-800 hover:text-primary-600"
                      >
                        <span className="flex items-center gap-2">
                          {category}
                          <span className="text-xs badge bg-primary-100 text-primary-700">
                            {perms.length}
                          </span>
                        </span>
                        {expandedRole === category ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      {expandedRole === category && (
                        <div className="mt-3 space-y-2">
                          {perms.map(perm => (
                            <div key={perm.id} className="flex items-start gap-2 p-2 bg-sand-50 rounded">
                              <Check className="w-4 h-4 text-success-600 mt-0.5 shrink-0" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-primary-800">{perm.name}</p>
                                  {perm.risky && (
                                    <span className="badge bg-error-100 text-error-700 text-xs">
                                      {t('risky') || 'Risky'}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-primary-600 mt-1">{perm.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Metadata */}
                <div className="card p-4">
                  <h3 className="font-bold text-primary-800 mb-3 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    {t('metadata') || 'Metadata'}
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-primary-600 font-medium">{t('createdAt') || 'Created At'}</p>
                      <p className="text-primary-800 mt-1">
                        {new Date(selectedRole.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-primary-600 font-medium">{t('updatedAt') || 'Updated At'}</p>
                      <p className="text-primary-800 mt-1">
                        {new Date(selectedRole.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-primary-600 font-medium">{t('modifiedBy') || 'Modified By'}</p>
                      <p className="text-primary-800 mt-1">{selectedRole.modifiedBy}</p>
                    </div>
                    <div>
                      <p className="text-primary-600 font-medium">{t('level') || 'Access Level'}</p>
                      <p className="text-primary-800 mt-1">{selectedRole.level}/9</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card p-8">
                <EmptyState
                  icon={<Lock className="w-12 h-12 text-primary-300" />}
                  title={t('noRoleSelected') || 'No role selected'}
                  description={t('selectRoleToViewDetails') || 'Select a role from the list to view details'}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <RoleModal
          role={editingRole}
          onClose={() => setShowModal(false)}
          onSave={handleSaveRole}
          availablePermissions={allPermissions}
        />
      )}
    </AdminSidebar>
  );
}

interface RoleModalProps {
  role: RoleConfig | null;
  onClose: () => void;
  onSave: (role: Partial<RoleConfig>) => void;
  availablePermissions: Permission[];
}

function RoleModal({ role, onClose, onSave, availablePermissions }: RoleModalProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState(
    role || {
      displayName: '',
      description: '',
      level: 5,
      permissions: [],
    }
  );

  const handlePermissionToggle = (permId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId],
    }));
  };

  const handleSave = () => {
    if (!formData.displayName || !formData.description) {
      alert(t('fillRequiredFields') || 'Please fill all required fields');
      return;
    }
    onSave(formData);
  };

  const permissionsByCategory = availablePermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Modal
      title={role ? t('editRole') || 'Edit Role' : t('createRole') || 'Create Role'}
      onClose={onClose}
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        <div>
          <label className="block text-sm font-medium text-primary-800 mb-1">
            {t('roleName') || 'Role Name'} *
          </label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            placeholder="e.g., Content Manager"
            className="input w-full"
            disabled={!!role}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-800 mb-1">
            {t('description') || 'Description'} *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe this role's responsibilities"
            className="input w-full h-16 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-800 mb-1">
            {t('accessLevel') || 'Access Level'} (1-9) *
          </label>
          <input
            type="range"
            min="1"
            max="9"
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
            className="w-full"
          />
          <p className="text-sm text-primary-700 font-bold mt-1">Level {formData.level}/9</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-800 mb-3">
            {t('permissions') || 'Permissions'}
          </label>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {Object.entries(permissionsByCategory).map(([category, perms]) => (
              <div key={category} className="bg-sand-50 p-3 rounded-lg">
                <p className="text-xs font-bold text-primary-700 mb-2">{category}</p>
                <div className="space-y-2">
                  {perms.map(perm => (
                    <label key={perm.id} className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm.id)}
                        onChange={() => handlePermissionToggle(perm.id)}
                        className="mt-1"
                      />
                      <div>
                        <p className="text-sm font-medium text-primary-800">{perm.name}</p>
                        <p className="text-xs text-primary-600">{perm.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
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
