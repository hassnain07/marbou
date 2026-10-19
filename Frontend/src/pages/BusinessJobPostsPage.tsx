import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useRouter } from '@/router/Router';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { businesses } from '@/data/mockData';
import { BusinessSidebar } from '@/components/BusinessSidebar';
import { Modal, EmptyState } from '@/components/ui';
import {
  LayoutDashboard, Plus, Search, Eye, Calendar, Trash2, AlertCircle, Save, Edit2, Copy, Check,
  Briefcase, Users, Zap, DollarSign, MapPin, Clock,
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

const JOB_TYPES = [
  { id: 'government', key: 'government' },
  { id: 'private', key: 'private' },
  { id: 'freelance', key: 'freelance' },
  { id: 'remote', key: 'remote' },
];

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { bg: string; text: string }> = {
    open: { bg: 'bg-success-100', text: 'text-success-700' },
    closed: { bg: 'bg-error-100', text: 'text-error-700' },
    expired: { bg: 'bg-sand-100', text: 'text-primary-400' },
  };
  const config = statusConfig[status] || statusConfig.open;
  return <span className={`badge ${config.bg} ${config.text} text-xs`}>{status}</span>;
};

export function BusinessJobPostsPage() {
  const { t, lang, formatPrice, formatDate } = useI18n();
  const { navigate } = useRouter();
  const { showToast } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const biz = businesses[0];

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

  // Mock job posts data
  const bizJobs = [
    {
      id: 'job-001',
      title: 'Senior Plumber',
      titleAr: 'سباك أول',
      description: 'We are looking for an experienced plumber to join our team',
      descriptionAr: 'نبحث عن سباك ذي خبرة للانضمام إلى فريقنا',
      jobType: 'private',
      location: 'Khartoum',
      locationAr: 'الخرطوم',
      salary: 50000,
      currency: 'SDG',
      requirements: 'Experience in residential and commercial plumbing',
      requirementsAr: 'خبرة في السباكة السكنية والتجارية',
      applicants: 5,
      views: 120,
      status: 'open',
      postedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      expiresAt: Date.now() + 23 * 24 * 60 * 60 * 1000,
    },
    {
      id: 'job-002',
      title: 'Electrical Technician',
      titleAr: 'فني كهرباء',
      description: 'Seeking qualified electrical technician with 3+ years experience',
      descriptionAr: 'نبحث عن فني كهرباء مؤهل بخبرة 3 سنوات على الأقل',
      jobType: 'private',
      location: 'Omdurman',
      locationAr: 'أم درمان',
      salary: 45000,
      currency: 'SDG',
      requirements: 'Valid license, tools, and vehicle',
      requirementsAr: 'رخصة سارية والعدد والمركبة',
      applicants: 8,
      views: 200,
      status: 'open',
      postedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
      expiresAt: Date.now() + 28 * 24 * 60 * 60 * 1000,
    },
    {
      id: 'job-003',
      title: 'AC Maintenance Specialist',
      titleAr: 'متخصص صيانة التكييف',
      description: 'Looking for AC maintenance professional',
      descriptionAr: 'نبحث عن متخصص صيانة تكييف الهواء',
      jobType: 'freelance',
      location: 'Khartoum',
      locationAr: 'الخرطوم',
      salary: null,
      currency: 'SDG',
      requirements: 'Experience and certification required',
      requirementsAr: 'الخبرة والشهادات مطلوبة',
      applicants: 3,
      views: 80,
      status: 'closed',
      postedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      expiresAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    },
  ];

  const filteredJobs = bizJobs
    .filter((j) => filterStatus === 'all' || j.status === filterStatus)
    .filter((j) => {
      const query = searchQuery.toLowerCase();
      return (
        (lang === 'ar' ? j.titleAr : j.title).toLowerCase().includes(query) ||
        (lang === 'ar' ? j.descriptionAr : j.description).toLowerCase().includes(query)
      );
    });

  const stats = {
    total: bizJobs.length,
    open: bizJobs.filter((j) => j.status === 'open').length,
    closed: bizJobs.filter((j) => j.status === 'closed').length,
    applicants: bizJobs.reduce((sum, j) => sum + j.applicants, 0),
  };

  const handleDeleteJob = () => {
    if (selectedJob) {
      showToast(t('deletedSuccessfully'), 'success');
      setShowDeleteModal(false);
      setSelectedJob(null);
    }
  };

  const handleEditJob = (job: any) => {
    setEditingJob({ ...job });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    showToast(t('successState'), 'success');
    setShowEditModal(false);
    setEditingJob(null);
  };

  const handleCloseJob = (job: any) => {
    showToast(lang === 'ar' ? 'تم إغلاق الوظيفة' : 'Job closed', 'success');
  };

  const handleRenewJob = (job: any) => {
    showToast(lang === 'ar' ? 'تم تجديد الوظيفة' : 'Job renewed', 'success');
  };

  const handleDuplicateJob = (job: any) => {
    showToast(lang === 'ar' ? 'تم نسخ الوظيفة' : 'Job duplicated', 'success');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <BusinessSidebar 
        activeTab="jobs" 
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
          <span className="font-bold text-primary-700">{t('jobPosts')}</span>
        </div>

        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary-800">{t('jobPosts')}</h1>
              <p className="text-sm text-primary-400 mt-1">{lang === 'ar' ? 'أدير جميع عروض الوظائف الخاصة بك' : 'Manage all your job postings'}</p>
            </div>
            <button onClick={() => navigate(`/business/${biz.id}/post-job`)} className="btn-primary">
              <Plus className="w-4 h-4" />{t('postJob')}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-primary-700">{stats.total}</p>
              <p className="text-xs text-primary-400 mt-1">{t('total')}</p>
            </div>
            <div className="card p-4 text-center bg-gradient-to-br from-success-50 to-success-50/30 border-success-100">
              <p className="text-2xl font-bold text-success-700">{stats.open}</p>
              <p className="text-xs text-success-600 mt-1">{lang === 'ar' ? 'مفتوحة' : 'Open'}</p>
            </div>
            <div className="card p-4 text-center bg-gradient-to-br from-warning-50 to-warning-50/30 border-warning-100">
              <p className="text-2xl font-bold text-warning-700">{stats.closed}</p>
              <p className="text-xs text-warning-600 mt-1">{lang === 'ar' ? 'مغلقة' : 'Closed'}</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-primary-700">{stats.applicants}</p>
              <p className="text-xs text-primary-400 mt-1">{lang === 'ar' ? 'متقدمون' : 'Applicants'}</p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="card p-4 mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
              <input
                type="text"
                placeholder={lang === 'ar' ? 'ابحث عن وظيفة...' : 'Search jobs...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-9 w-full"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {['all', 'open', 'closed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`chip text-xs whitespace-nowrap ${
                    filterStatus === status ? 'chip-active' : 'chip-default'
                  }`}
                >
                  {status === 'all' ? t('all') : status === 'open' ? lang === 'ar' ? 'مفتوحة' : 'Open' : lang === 'ar' ? 'مغلقة' : 'Closed'}
                </button>
              ))}
            </div>
          </div>

          {/* Jobs List */}
          {filteredJobs.length === 0 ? (
            <EmptyState
              icon={<AlertCircle className="w-10 h-10" />}
              title={lang === 'ar' ? 'لا توجد وظائف' : 'No Jobs'}
              description={lang === 'ar' ? 'لم يتم العثور على وظائف' : 'No jobs found'}
              action={<button onClick={() => navigate(`/business/${biz.id}/post-job`)} className="btn-primary text-sm">{t('postJob')}</button>}
            />
          ) : (
            <div className="space-y-3">
              {filteredJobs.map((job) => (
                <div key={job.id} className="card p-4 flex items-center gap-4 hover:border-primary-300 transition-all group">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-primary-50 shrink-0 flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-primary-600" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-primary-800 text-sm line-clamp-1">
                        {lang === 'ar' ? job.titleAr : job.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-primary-400 mb-2">
                      <span className="badge bg-sand-100 text-primary-600 text-xs">{t(JOB_TYPES.find((t) => t.id === job.jobType)?.key as TranslationKey)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{job.location}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />{job.applicants}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={job.status} />
                      {job.salary && (
                        <span className="font-bold text-primary-600 text-sm flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />{formatPrice(job.salary)}
                        </span>
                      )}
                      <span className="text-xs text-primary-400 ml-auto">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {lang === 'ar' ? 'ينتهي:' : 'Expires:'} {formatDate(job.expiresAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => handleEditJob(job)}
                      className="btn-sm btn-primary text-xs flex items-center gap-1"
                      title={t('edit')}
                    >
                      <Edit2 className="w-3 h-3" />{t('edit')}
                    </button>
                    <div className="flex gap-1">
                      {job.status === 'open' && (
                        <button
                          onClick={() => handleCloseJob(job)}
                          className="p-2 rounded-lg hover:bg-warning-50 text-warning-500 transition-colors"
                          title={lang === 'ar' ? 'إغلاق' : 'Close'}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {job.status === 'closed' && (
                        <button
                          onClick={() => handleRenewJob(job)}
                          className="p-2 rounded-lg hover:bg-success-50 text-success-500 transition-colors"
                          title={lang === 'ar' ? 'تجديد' : 'Renew'}
                        >
                          <Zap className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDuplicateJob(job)}
                        className="p-2 rounded-lg hover:bg-primary-50 text-primary-500 transition-colors"
                        title={lang === 'ar' ? 'نسخ' : 'Duplicate'}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedJob(job.id);
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
              ))}
            </div>
          )}

          {/* Delete Modal */}
          <Modal
            open={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedJob(null);
            }}
            title={t('delete')}
            size="sm"
          >
            <div className="space-y-4">
              <p className="text-sm text-primary-600">
                {lang === 'ar'
                  ? 'هل أنت متأكد من حذف هذه الوظيفة؟ لا يمكن التراجع عن هذا الإجراء.'
                  : 'Are you sure you want to delete this job? This action cannot be undone.'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedJob(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  {t('cancel')}
                </button>
                <button onClick={handleDeleteJob} className="btn-danger flex-1">
                  {t('delete')}
                </button>
              </div>
            </div>
          </Modal>

          {/* Edit Modal */}
          <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title={t('edit')} size="md">
            {editingJob && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <label className="text-sm font-medium text-primary-600 mb-1 block">{t('title')} (EN)</label>
                  <input
                    type="text"
                    value={editingJob.title || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary-600 mb-1 block">{t('title')} (AR)</label>
                  <input
                    type="text"
                    value={editingJob.titleAr || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, titleAr: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary-600 mb-1 block">{t('description')}</label>
                  <textarea
                    value={editingJob.description || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                    rows={3}
                    className="input w-full resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-primary-600 mb-1 block">{lang === 'ar' ? 'نوع الوظيفة' : 'Job Type'}</label>
                    <select value={editingJob.jobType || 'private'} onChange={(e) => setEditingJob({ ...editingJob, jobType: e.target.value })} className="input w-full">
                      {JOB_TYPES.map((jt) => (
                        <option key={jt.id} value={jt.id}>{t(jt.key as TranslationKey)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-primary-600 mb-1 block">{lang === 'ar' ? 'الراتب' : 'Salary'}</label>
                    <input type="number" value={editingJob.salary || ''} onChange={(e) => setEditingJob({ ...editingJob, salary: parseInt(e.target.value) || null })} className="input w-full" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary-600 mb-1 block">{t('location')}</label>
                  <input
                    type="text"
                    value={editingJob.location || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                    className="input w-full"
                  />
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
