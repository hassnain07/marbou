import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useRouter } from '@/router/Router';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { businesses, listings } from '@/data/mockData';
import { BusinessSidebar } from '@/components/BusinessSidebar';
import { Modal, EmptyState } from '@/components/ui';
import {
  LayoutDashboard, Plus, Search, Eye, Clock, Edit2, Copy, Check, Trash2, AlertCircle, Save,
  Wrench, Zap, Droplets, Hammer, PaintRoller, Lightbulb, Home, Link as LinkIcon,
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

const SERVICE_CATEGORIES = [
  { id: 'construction', key: 'construction', icon: Hammer },
  { id: 'electrical', key: 'electrical', icon: Zap },
  { id: 'plumbing', key: 'plumbing', icon: Wrench },
  { id: 'painting', key: 'painting', icon: PaintRoller },
  { id: 'ac', key: 'ac', icon: Droplets },
  { id: 'carpentry', key: 'carpentry', icon: Hammer },
  { id: 'maintenance', key: 'maintenance', icon: Wrench },
  { id: 'cleaning', key: 'cleaning', icon: PaintRoller },
  { id: 'mechanic', key: 'mechanic', icon: Wrench },
];

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { bg: string; text: string }> = {
    active: { bg: 'bg-success-100', text: 'text-success-700' },
    inactive: { bg: 'bg-sand-100', text: 'text-primary-400' },
    archived: { bg: 'bg-error-100', text: 'text-error-700' },
  };
  const config = statusConfig[status] || statusConfig.inactive;
  return <span className={`badge ${config.bg} ${config.text} text-xs`}>{status}</span>;
};

export function BusinessServicePage() {
  const { t, lang, formatPrice } = useI18n();
  const { path, navigate } = useRouter();
  const { user } = useAuth();
  const { showToast } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get business from URL
  const bizId = path.split('/')[2];
  const biz = bizId ? businesses.find((b) => b.id === bizId) : businesses[0];

  if (!biz) {
    return (
      <div className="py-4 max-w-6xl mx-auto">
        <EmptyState
          icon={<AlertCircle className="w-10 h-10" />}
          title={t('noResults')}
        />
      </div>
    );
  }

  // Mock services data
  const bizServices = [
    {
      id: 'svc-001',
      name: biz.services[0] || 'Plumbing Services',
      nameAr: 'خدمات سباكة',
      category: 'plumbing',
      description: 'Professional plumbing services',
      descriptionAr: 'خدمات سباكة احترافية',
      price: 5000,
      currency: 'SDG',
      coverage: 'Khartoum',
      coverageAr: 'الخرطوم',
      rating: 4.5,
      reviews: 12,
      status: 'active',
      postedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    },
    {
      id: 'svc-002',
      name: biz.services[1] || 'Electrical Services',
      nameAr: 'خدمات كهرباء',
      category: 'electrical',
      description: 'Electrical installation and repair',
      descriptionAr: 'تركيب وإصلاح كهرباء',
      price: 7000,
      currency: 'SDG',
      coverage: 'Khartoum',
      coverageAr: 'الخرطوم',
      rating: 4.7,
      reviews: 18,
      status: 'active',
      postedAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
    },
  ];

  const filteredServices = bizServices
    .filter((s) => filterStatus === 'all' || s.status === filterStatus)
    .filter((s) => {
      const query = searchQuery.toLowerCase();
      return (
        (lang === 'ar' ? s.nameAr : s.name).toLowerCase().includes(query) ||
        (lang === 'ar' ? s.descriptionAr : s.description).toLowerCase().includes(query)
      );
    });

  const stats = {
    total: bizServices.length,
    active: bizServices.filter((s) => s.status === 'active').length,
    archived: bizServices.filter((s) => s.status === 'archived').length,
    reviews: bizServices.reduce((sum, s) => sum + s.reviews, 0),
  };

  const handleDeleteService = () => {
    if (selectedService) {
      showToast(t('deletedSuccessfully'), 'success');
      setShowDeleteModal(false);
      setSelectedService(null);
    }
  };

  const handleEditService = (service: any) => {
    setEditingService({ ...service });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    showToast(t('successState'), 'success');
    setShowEditModal(false);
    setEditingService(null);
  };

  const handleArchiveService = (service: any) => {
    showToast(lang === 'ar' ? 'تم أرشفة الخدمة' : 'Service archived', 'success');
  };

  const handlePublishService = (service: any) => {
    showToast(lang === 'ar' ? 'تم نشر الخدمة' : 'Service published', 'success');
  };

  const SidebarLink = ({ tab }: { tab: typeof BIZ_TABS[0] }) => {
    const Icon = tab.icon;
    return (
      <button
        onClick={() => {
          if (tab.id === 'services') {
            navigate(`/business/${biz.id}/services`);
          } else if (tab.id === 'listings') {
            navigate(`/business/${biz.id}/listings`);
          } else {
            navigate(`/business/${tab.id}`);
          }
          setSidebarOpen(false);
        }}
        className={`nav-link w-full ${tab.id === 'services' ? 'nav-link-active' : ''}`}
      >
        <Icon className="w-4 h-4" />{t(tab.key)}
      </button>
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <BusinessSidebar 
        activeTab="services" 
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
            <LayoutDashboard className="w-5 h-5 text-primary-600" />
          </button>
          <span className="font-bold text-primary-700">{t('services')}</span>
        </div>

        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary-800">{t('services')}</h1>
              <p className="text-sm text-primary-400 mt-1">{lang === 'ar' ? 'إدارة جميع الخدمات التي تقدمها' : 'Manage all your services'}</p>
            </div>
            <button onClick={() => navigate(`/business/${biz.id}/add-service`)} className="btn-primary">
              <Plus className="w-4 h-4" />{t('addService')}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-primary-700">{stats.total}</p>
              <p className="text-xs text-primary-400 mt-1">{t('total')}</p>
            </div>
            <div className="card p-4 text-center bg-gradient-to-br from-success-50 to-success-50/30 border-success-100">
              <p className="text-2xl font-bold text-success-700">{stats.active}</p>
              <p className="text-xs text-success-600 mt-1">{lang === 'ar' ? 'نشط' : 'Active'}</p>
            </div>
            <div className="card p-4 text-center bg-gradient-to-br from-warning-50 to-warning-50/30 border-warning-100">
              <p className="text-2xl font-bold text-warning-700">{stats.archived}</p>
              <p className="text-xs text-warning-600 mt-1">{t('archived')}</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-primary-700">{stats.reviews}</p>
              <p className="text-xs text-primary-400 mt-1">{lang === 'ar' ? 'تقييمات' : 'Reviews'}</p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="card p-4 mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
              <input
                type="text"
                placeholder={lang === 'ar' ? 'ابحث عن خدمة...' : 'Search services...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-9 w-full"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {['all', 'active', 'archived'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`chip text-xs whitespace-nowrap ${
                    filterStatus === status ? 'chip-active' : 'chip-default'
                  }`}
                >
                  {status === 'all' ? t('all') : t(status as TranslationKey)}
                </button>
              ))}
            </div>
          </div>

          {/* Services */}
          {filteredServices.length === 0 ? (
            <EmptyState
              icon={<AlertCircle className="w-10 h-10" />}
              title={lang === 'ar' ? 'لا توجد خدمات' : 'No Services'}
              description={lang === 'ar' ? 'لم يتم العثور على خدمات' : 'No services found'}
              action={<button onClick={() => navigate(`/business/${biz.id}/add-service`)} className="btn-primary text-sm">{t('addService')}</button>}
            />
          ) : (
            <div className="space-y-3">
              {filteredServices.map((service) => {
                const categoryIcon = SERVICE_CATEGORIES.find((c) => c.id === service.category);
                const Icon = categoryIcon?.icon || Wrench;
                return (
                  <div key={service.id} className="card p-4 flex items-center gap-4 hover:border-primary-300 transition-all group">
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-primary-50 shrink-0 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-primary-600" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-primary-800 text-sm line-clamp-1">
                          {lang === 'ar' ? service.nameAr : service.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-primary-400 mb-2">
                        <span className="badge bg-sand-100 text-primary-600 text-xs">{t(SERVICE_CATEGORIES.find((c) => c.id === service.category)?.key as TranslationKey)}</span>
                        <span>•</span>
                        <span>{service.coverage}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={service.status} />
                        <span className="font-bold text-primary-600 text-sm">{formatPrice(service.price)}</span>
                        <span className="text-xs text-primary-400">• {service.rating} ⭐ ({service.reviews})</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => handleEditService(service)}
                        className="btn-sm btn-primary text-xs flex items-center gap-1"
                        title={t('edit')}
                      >
                        <Edit2 className="w-3 h-3" />{t('edit')}
                      </button>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handlePublishService(service)}
                          className="p-2 rounded-lg hover:bg-success-50 text-success-500 transition-colors"
                          title={lang === 'ar' ? 'نشر' : 'Publish'}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleArchiveService(service)}
                          className="p-2 rounded-lg hover:bg-warning-50 text-warning-500 transition-colors"
                          title={lang === 'ar' ? 'أرشفة' : 'Archive'}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedService(service.id);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 rounded-lg hover:bg-error-50 text-error-500 transition-colors"
                          title={t('delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Delete Modal */}
          <Modal
            open={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedService(null);
            }}
            title={t('delete')}
            size="sm"
          >
            <div className="space-y-4">
              <p className="text-sm text-primary-600">
                {lang === 'ar'
                  ? 'هل أنت متأكد من حذف هذه الخدمة؟ لا يمكن التراجع عن هذا الإجراء.'
                  : 'Are you sure you want to delete this service? This action cannot be undone.'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedService(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  {t('cancel')}
                </button>
                <button onClick={handleDeleteService} className="btn-danger flex-1">
                  {t('delete')}
                </button>
              </div>
            </div>
          </Modal>

          {/* Edit Modal */}
          <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title={t('edit')} size="md">
            {editingService && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <label className="text-sm font-medium text-primary-600 mb-1 block">{t('name')} (EN)</label>
                  <input
                    type="text"
                    value={editingService.name || ''}
                    onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary-600 mb-1 block">{t('name')} (AR)</label>
                  <input
                    type="text"
                    value={editingService.nameAr || ''}
                    onChange={(e) => setEditingService({ ...editingService, nameAr: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary-600 mb-1 block">{t('description')}</label>
                  <textarea
                    value={editingService.description || ''}
                    onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                    rows={3}
                    className="input w-full resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary-600 mb-1 block">{t('descriptionAr')}</label>
                  <textarea
                    value={editingService.descriptionAr || ''}
                    onChange={(e) => setEditingService({ ...editingService, descriptionAr: e.target.value })}
                    rows={3}
                    className="input w-full resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-primary-600 mb-1 block">{t('price')}</label>
                    <input type="number" value={editingService.price || ''} onChange={(e) => setEditingService({ ...editingService, price: parseInt(e.target.value) || 0 })} className="input w-full" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-primary-600 mb-1 block">{lang === 'ar' ? 'الفئة' : 'Category'}</label>
                    <select value={editingService.category || 'plumbing'} onChange={(e) => setEditingService({ ...editingService, category: e.target.value })} className="input w-full">
                      {SERVICE_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>{t(cat.key as TranslationKey)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary-600 mb-1 block">{lang === 'ar' ? 'نطاق التغطية' : 'Coverage Area'}</label>
                  <input
                    type="text"
                    value={editingService.coverage || ''}
                    onChange={(e) => setEditingService({ ...editingService, coverage: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary-600 mb-1 block">{t('status')}</label>
                  <select value={editingService.status || 'active'} onChange={(e) => setEditingService({ ...editingService, status: e.target.value })} className="input w-full">
                    <option value="active">{lang === 'ar' ? 'نشط' : 'Active'}</option>
                    <option value="inactive">{lang === 'ar' ? 'غير نشط' : 'Inactive'}</option>
                    <option value="archived">{t('archived')}</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setShowEditModal(false)} className="btn-secondary flex-1">
                    {t('cancel')}
                  </button>
                  <button onClick={handleSaveEdit} className="btn-primary flex-1">
                    <Save className="w-4 h-4" />{t('save')}
                  </button>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </div>
  );
}
