import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { useRouter } from '@/router/Router';
import { BusinessSidebar } from '@/components/BusinessSidebar';
import { businesses } from '@/data/mockData';
import {
  Users, Plus, Edit2, Trash2, MoreVertical, Mail, Phone, Shield, X,
  CheckCircle, Clock, AlertCircle, Send,
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

// Mock staff data
const mockStaff = [
  {
    id: 1,
    name: 'Ahmed Hassan',
    email: 'ahmed@store.com',
    phone: '+249 912 345 678',
    role: 'Manager' as const,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
    status: 'active' as const,
    joinDate: '2024-01-15',
    permissions: ['edit_listings', 'manage_messages', 'view_analytics'],
  },
  {
    id: 2,
    name: 'Fatima Ali',
    email: 'fatima@store.com',
    phone: '+249 923 456 789',
    role: 'Editor' as const,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima',
    status: 'active' as const,
    joinDate: '2024-02-20',
    permissions: ['edit_listings'],
  },
  {
    id: 3,
    name: 'Mohammed Ibrahim',
    email: 'mohammed@store.com',
    phone: '+249 934 567 890',
    role: 'Support' as const,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mohammed',
    status: 'active' as const,
    joinDate: '2024-03-10',
    permissions: ['manage_messages', 'view_analytics'],
  },
  {
    id: 4,
    name: 'Sara Mohamed',
    email: 'sara@store.com',
    phone: '+249 945 678 901',
    role: 'Editor' as const,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara',
    status: 'pending' as const,
    joinDate: '2024-04-01',
    permissions: ['edit_listings'],
  },
];

const ROLE_DESCRIPTIONS: Record<string, { desc: string; permissions: string[] }> = {
  Manager: {
    desc: 'Full access to all business functions',
    permissions: ['edit_listings', 'manage_messages', 'view_analytics', 'manage_staff'],
  },
  Editor: {
    desc: 'Can create and edit listings',
    permissions: ['edit_listings'],
  },
  Support: {
    desc: 'Can manage messages and view analytics',
    permissions: ['manage_messages', 'view_analytics'],
  },
};

function StaffCard({ staff, onEdit, onDelete }: { staff: typeof mockStaff[0]; onEdit: (id: number) => void; onDelete: (id: number) => void }) {
  const { t, lang } = useI18n();

  const getStatusBadge = () => {
    switch (staff.status) {
      case 'active':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-success-100 text-success-700">
            <CheckCircle className="w-3 h-3" />{t('active')}
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-warning-100 text-warning-700">
            <Clock className="w-3 h-3" />{lang === 'ar' ? 'قيد الانتظار' : 'Pending'}
          </span>
        );
      default:
        return null;
    }
  };

  const getRoleBadge = () => {
    const colors: Record<string, string> = {
      Manager: 'bg-primary-100 text-primary-700',
      Editor: 'bg-accent-100 text-accent-700',
      Support: 'bg-sand-100 text-primary-600',
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${colors[staff.role] || 'bg-sand-100'}`}>
        {staff.role}
      </span>
    );
  };

  return (
    <div className="card p-4 hover:border-primary-300 transition-all group">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
          <img src={staff.avatar} alt={staff.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-primary-800 text-sm">{staff.name}</p>
          <p className="text-xs text-primary-400">{staff.email}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(staff.id)}
            className="p-2 rounded-lg hover:bg-sand-50"
            title="Edit"
          >
            <Edit2 className="w-4 h-4 text-primary-500" />
          </button>
          <button
            onClick={() => onDelete(staff.id)}
            className="p-2 rounded-lg hover:bg-error-50"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-error-500" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        {getRoleBadge()}
        {getStatusBadge()}
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2 text-primary-600">
          <Phone className="w-3 h-3 text-primary-400" />
          {staff.phone}
        </div>
        <div className="flex items-center gap-2 text-primary-600">
          <Mail className="w-3 h-3 text-primary-400" />
          {staff.email}
        </div>
        <p className="text-primary-400">
          {lang === 'ar' ? 'تاريخ الانضمام:' : 'Joined:'} {staff.joinDate}
        </p>
      </div>
    </div>
  );
}

function AddStaffModal({ isOpen, onClose, onAdd }: { isOpen: boolean; onClose: () => void; onAdd: (data: any) => void }) {
  const { t, lang } = useI18n();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Editor' as const,
  });

  const handleSubmit = () => {
    if (formData.name && formData.email && formData.phone && formData.role) {
      onAdd(formData);
      setFormData({ name: '', email: '', phone: '', role: 'Editor' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-primary-950/30 flex items-end md:items-center justify-center z-50">
      <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:w-96 p-6 space-y-4 animate-in slide-in-from-bottom md:slide-in-from-center max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-primary-800">{lang === 'ar' ? 'إضافة موظف' : 'Add Staff Member'}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-sand-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-primary-600 block mb-1">{t('name')}</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input w-full text-sm"
              placeholder={lang === 'ar' ? 'أدخل الاسم' : 'Enter name'}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-primary-600 block mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input w-full text-sm"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-primary-600 block mb-1">{t('call')}</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input w-full text-sm"
              placeholder="+249 XXX XXX XXX"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-primary-600 block mb-1">{lang === 'ar' ? 'الدور' : 'Role'}</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="input w-full text-sm"
            >
              <option value="Manager">Manager</option>
              <option value="Editor">Editor</option>
              <option value="Support">Support</option>
            </select>

            {/* Role Description */}
            <p className="text-xs text-primary-400 mt-2 p-2 bg-sand-50 rounded">
              {ROLE_DESCRIPTIONS[formData.role].desc}
            </p>

            {/* Permissions */}
            <div className="mt-2">
              <p className="text-xs font-medium text-primary-600 mb-1">{lang === 'ar' ? 'الأذونات' : 'Permissions'}:</p>
              <div className="space-y-1">
                {ROLE_DESCRIPTIONS[formData.role].permissions.map((perm) => (
                  <div key={perm} className="text-xs text-primary-500 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-success-500" />
                    {perm.replace(/_/g, ' ')}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSubmit}
            className="btn-primary flex-1 text-sm"
          >
            {lang === 'ar' ? 'إضافة' : 'Add'}
          </button>
          <button
            onClick={onClose}
            className="btn-secondary flex-1 text-sm"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

export function BusinessStaffPage() {
  const { t, lang } = useI18n();
  const { path } = useRouter();
  const { showToast } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [staff, setStaff] = useState(mockStaff);
  const [filterRole, setFilterRole] = useState<'all' | 'Manager' | 'Editor' | 'Support'>('all');

  const pathParts = path.split('/').filter(Boolean);
  const tabId = pathParts[2] || 'staff';
  const biz = businesses[0];

  const filteredStaff = filterRole === 'all' ? staff : staff.filter((s) => s.role === filterRole);

  const handleAddStaff = (data: any) => {
    setStaff([...staff, { id: staff.length + 1, ...data, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`, status: 'active', joinDate: new Date().toISOString().split('T')[0] }]);
    setShowAddModal(false);
    showToast(lang === 'ar' ? 'تمت إضافة الموظف' : 'Staff member added', 'success');
  };

  const handleDeleteStaff = (id: number) => {
    setStaff(staff.filter((s) => s.id !== id));
    showToast(t('deleted'), 'success');
  };

  const handleEditStaff = (id: number) => {
    showToast(lang === 'ar' ? 'سيتم تحديث الموظف قريباً' : 'Staff update coming soon', 'info');
  };

  return (
    <div className="flex min-h-screen">
      {/* Shared Sidebar */}
      <BusinessSidebar 
        activeTab={tabId} 
        business={biz}
        sidebarOpen={sidebarOpen}
        onCloseSidebar={() => setSidebarOpen(false)}
      />

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-primary-950/30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-sand-100 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-sand-50">
            <Users className="w-5 h-5 text-primary-600" />
          </button>
          <span className="font-bold text-primary-700">{t('staffDirectory')}</span>
        </div>

        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary-800">{t('staffDirectory')}</h1>
              <p className="text-sm text-primary-400 mt-1">{lang === 'ar' ? 'إدارة موظفي الفريق' : 'Manage your team members'}</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary text-sm flex items-center gap-2 justify-center"
            >
              <Plus className="w-4 h-4" />{lang === 'ar' ? 'إضافة موظف' : 'Add Staff'}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="card p-3 sm:p-4">
              <p className="text-xs text-primary-400 mb-1">{lang === 'ar' ? 'الإجمالي' : 'Total'}</p>
              <p className="text-2xl font-bold text-primary-700">{staff.length}</p>
            </div>
            <div className="card p-3 sm:p-4 border-success-200 bg-success-50/30">
              <p className="text-xs text-primary-400 mb-1">{t('active')}</p>
              <p className="text-2xl font-bold text-success-600">{staff.filter((s) => s.status === 'active').length}</p>
            </div>
            <div className="card p-3 sm:p-4">
              <p className="text-xs text-primary-400 mb-1">{lang === 'ar' ? 'المديرون' : 'Managers'}</p>
              <p className="text-2xl font-bold text-primary-700">{staff.filter((s) => s.role === 'Manager').length}</p>
            </div>
            <div className="card p-3 sm:p-4">
              <p className="text-xs text-primary-400 mb-1">{lang === 'ar' ? 'معلق' : 'Pending'}</p>
              <p className="text-2xl font-bold text-warning-600">{staff.filter((s) => s.status === 'pending').length}</p>
            </div>
          </div>

          {/* Role Filter */}
          <div className="mb-6">
            <div className="flex gap-2 flex-wrap">
              {['all', 'Manager', 'Editor', 'Support'].map((role) => (
                <button
                  key={role}
                  onClick={() => setFilterRole(role as any)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    filterRole === role
                      ? 'bg-primary-600 text-white'
                      : 'bg-sand-50 text-primary-600 hover:bg-sand-100 border border-sand-100'
                  }`}
                >
                  {role === 'all' ? t('allRoles') : role}
                </button>
              ))}
            </div>
          </div>

          {/* Staff Grid */}
          {filteredStaff.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStaff.map((staffMember) => (
                <StaffCard
                  key={staffMember.id}
                  staff={staffMember}
                  onEdit={handleEditStaff}
                  onDelete={handleDeleteStaff}
                />
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <Users className="w-12 h-12 text-primary-300 mx-auto mb-3" />
              <p className="text-primary-600 font-medium">{lang === 'ar' ? 'لا توجد أعضاء فريق' : 'No staff members'}</p>
              <p className="text-sm text-primary-400 mt-1">
                {lang === 'ar' ? 'ابدأ بإضافة أعضاء فريق إلى عملك' : 'Start by adding team members to your business'}
              </p>
            </div>
          )}

          {/* Role Information */}
          <div className="mt-8 p-4 bg-primary-50 rounded-xl border border-primary-100">
            <h3 className="font-bold text-primary-800 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5" />{lang === 'ar' ? 'أدوار الموظفين' : 'Staff Roles'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.entries(ROLE_DESCRIPTIONS).map(([role, details]) => (
                <div key={role} className="p-3 bg-white rounded-lg border border-sand-100">
                  <p className="font-medium text-primary-700 text-sm mb-1">{role}</p>
                  <p className="text-xs text-primary-600 mb-2">{details.desc}</p>
                  <div className="space-y-1">
                    {details.permissions.map((perm) => (
                      <div key={perm} className="text-xs text-primary-500 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-success-500" />
                        {perm.replace(/_/g, ' ')}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      <AddStaffModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddStaff}
      />
    </div>
  );
}
