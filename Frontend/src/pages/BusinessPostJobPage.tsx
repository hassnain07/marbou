import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useRouter } from '@/router/Router';
import { businesses } from '@/data/mockData';
import { BusinessSidebar } from '@/components/BusinessSidebar';
import { Modal, EmptyState } from '@/components/ui';
import {
  ChevronLeft, ChevronRight, Plus, Save, AlertCircle, LayoutDashboard,
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

const JOB_TYPES = [
  { id: 'government', key: 'government' },
  { id: 'private', key: 'private' },
  { id: 'freelance', key: 'freelance' },
  { id: 'remote', key: 'remote' },
];

export function BusinessPostJobPage() {
  const { t, lang } = useI18n();
  const { path, navigate } = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [jobTitle, setJobTitle] = useState('');
  const [jobTitleAr, setJobTitleAr] = useState('');
  const [jobType, setJobType] = useState('private');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [requirements, setRequirements] = useState('');
  const [requirementsAr, setRequirementsAr] = useState('');
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('');
  const [locationAr, setLocationAr] = useState('');
  const [deadline, setDeadline] = useState('');

  const bizId = path.split('/')[2];
  const biz = bizId ? businesses.find((b) => b.id === bizId) : businesses[0];

  if (!biz) {
    return (
      <div className="py-4 max-w-2xl mx-auto">
        <EmptyState
          icon={<AlertCircle className="w-10 h-10" />}
          title={t('noResults')}
        />
      </div>
    );
  }

  const completeness = Math.round(
    ((jobTitle ? 1 : 0) + (jobType ? 1 : 0) + (description ? 1 : 0) + (requirements ? 1 : 0) + (location ? 1 : 0)) / 5 * 100
  );

  const handlePublishJob = () => {
    navigate(`/business/${biz.id}/jobs`);
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
        <div className="py-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4 px-4">
            <h1 className="text-xl font-bold text-primary-800">{lang === 'ar' ? 'انشر وظيفة جديدة' : 'Post New Job'}</h1>
          </div>

          {/* Completeness bar */}
          <div className="card p-3 mb-4 mx-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-primary-500">{t('completenessScore')}</span>
              <span className="text-xs font-bold text-primary-700">{Math.round(completeness)}%</span>
            </div>
            <div className="h-2 bg-sand-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-300" style={{ width: `${completeness}%` }} />
            </div>
            {completeness < 100 && (
              <div className="mt-2 space-y-0.5">
                {!jobTitle && <p className="text-[11px] text-primary-400">{lang === 'ar' ? 'أضف عنوان الوظيفة' : 'Add job title'}</p>}
                {!description && <p className="text-[11px] text-primary-400">{lang === 'ar' ? 'أضف وصف الوظيفة' : 'Add job description'}</p>}
                {!requirements && <p className="text-[11px] text-primary-400">{lang === 'ar' ? 'أضف المتطلبات' : 'Add requirements'}</p>}
                {!location && <p className="text-[11px] text-primary-400">{lang === 'ar' ? 'أضف الموقع' : 'Add location'}</p>}
              </div>
            )}
          </div>

          <div className="card p-5 sm:p-6 mx-4">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-primary-800">{lang === 'ar' ? 'تفاصيل الوظيفة' : 'Job Details'}</h2>
              
              <div>
                <label className="text-sm font-medium text-primary-600 mb-1.5 block">{lang === 'ar' ? 'عنوان الوظيفة' : 'Job Title'} (English)</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="input"
                  placeholder={lang === 'ar' ? 'عنوان الوظيفة' : 'Job title'}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-primary-600 mb-1.5 block">{lang === 'ar' ? 'عنوان الوظيفة' : 'Job Title'} (Arabic)</label>
                <input
                  type="text"
                  value={jobTitleAr}
                  onChange={(e) => setJobTitleAr(e.target.value)}
                  className="input"
                  placeholder={lang === 'ar' ? 'Job title' : 'عنوان الوظيفة'}
                  dir="rtl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-primary-600 mb-1.5 block">{lang === 'ar' ? 'نوع الوظيفة' : 'Job Type'}</label>
                  <select value={jobType} onChange={(e) => setJobType(e.target.value)} className="input">
                    {JOB_TYPES.map((jt) => (
                      <option key={jt.id} value={jt.id}>{t(jt.key as TranslationKey)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary-600 mb-1.5 block">{lang === 'ar' ? 'الراتب (SDG)' : 'Salary (SDG)'}</label>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="input"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-primary-600 mb-1.5 block">{t('description')}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="input resize-none"
                  placeholder={lang === 'ar' ? 'وصف الوظيفة بالتفصيل...' : 'Describe the job in detail...'}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-primary-600 mb-1.5 block">{lang === 'ar' ? 'الوصف (العربية)' : 'Description (Arabic)'}</label>
                <textarea
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  rows={4}
                  className="input resize-none"
                  placeholder={lang === 'ar' ? 'Describe the job in detail...' : 'وصف الوظيفة بالتفصيل...'}
                  dir="rtl"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-primary-600 mb-1.5 block">{lang === 'ar' ? 'المتطلبات' : 'Requirements'}</label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows={3}
                  className="input resize-none"
                  placeholder={lang === 'ar' ? 'المتطلبات المطلوبة...' : 'Required qualifications...'}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-primary-600 mb-1.5 block">{lang === 'ar' ? 'المتطلبات (العربية)' : 'Requirements (Arabic)'}</label>
                <textarea
                  value={requirementsAr}
                  onChange={(e) => setRequirementsAr(e.target.value)}
                  rows={3}
                  className="input resize-none"
                  placeholder={lang === 'ar' ? 'Required qualifications...' : 'المتطلبات المطلوبة...'}
                  dir="rtl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-primary-600 mb-1.5 block">{t('location')} (EN)</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input"
                    placeholder={lang === 'ar' ? 'الموقع' : 'Location'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary-600 mb-1.5 block">{t('location')} (AR)</label>
                  <input
                    type="text"
                    value={locationAr}
                    onChange={(e) => setLocationAr(e.target.value)}
                    className="input"
                    placeholder={lang === 'ar' ? 'Location' : 'الموقع'}
                    dir="rtl"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-primary-600 mb-1.5 block">{lang === 'ar' ? 'تاريخ الانتهاء' : 'Application Deadline'}</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="input"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button onClick={() => navigate(`/business/${biz.id}/jobs`)} className="btn-secondary flex-1">
                  {t('cancel')}
                </button>
                <button onClick={handlePublishJob} className="btn-primary flex-1">
                  <Save className="w-4 h-4" />{t('publish')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
