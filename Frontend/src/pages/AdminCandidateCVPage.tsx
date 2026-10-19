import { useState, useMemo } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Modal, EmptyState } from '@/components/ui';
import {
  Briefcase, Plus, Eye, Send, CheckCircle, Clock, AlertCircle, User,
  Mail, Phone, MapPin, Zap, Download, RefreshCw, X, Save, Award,
  Calendar, FileText, Search, Filter, ArrowRight
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

type CVRequestStatus = 'pending' | 'in_review' | 'delivered' | 'revision_requested' | 'completed';

interface CandidateProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  avatar?: string;
  dateOfBirth?: string;
  nationality?: string;
  maritalStatus?: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number;
  current: boolean;
}

interface WorkExperience {
  id: string;
  companyName: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  url: string;
}

interface CVRequest {
  id: string;
  candidateId: string;
  candidate: CandidateProfile;
  status: CVRequestStatus;
  requestedAt: string;
  assignedTo?: string;
  assignedToName?: string;
  education: Education[];
  workExperience: WorkExperience[];
  certificates: Certificate[];
  skills: string[];
  languages: Array<{
    name: string;
    level: 'native' | 'fluent' | 'intermediate' | 'basic';
  }>;
  drivingLicense?: boolean;
  transportInfo?: string;
  internalNotes?: string;
  revisionNotes?: string;
  generatedCVUrl?: string;
  deliveredAt?: string;
  deliveredBy?: string;
}

// Mock CV requests data
const mockCVRequests: CVRequest[] = [
  {
    id: 'cv-req-1',
    candidateId: 'cand-001',
    candidate: {
      id: 'cand-001',
      fullName: 'Ahmed Mohammed Al-Sadhan',
      email: 'ahmed.sadhan@example.com',
      phone: '+249 901 234 567',
      location: 'Khartoum',
      dateOfBirth: '1995-06-15',
      nationality: 'Sudan',
      maritalStatus: 'Single',
    },
    status: 'pending',
    requestedAt: '2025-01-14T10:30:00Z',
    education: [
      {
        id: 'edu-1',
        institution: 'University of Khartoum',
        degree: 'Bachelor',
        field: 'Computer Science',
        startYear: 2017,
        endYear: 2021,
        current: false,
      },
    ],
    workExperience: [
      {
        id: 'exp-1',
        companyName: 'Tech Solutions Sudan',
        jobTitle: 'Software Developer',
        startDate: '2021-07-01',
        endDate: '2024-12-31',
        current: false,
        description: 'Developed web applications using React and Node.js',
      },
      {
        id: 'exp-2',
        companyName: 'StartUp Hub',
        jobTitle: 'Junior Developer',
        startDate: '2021-02-01',
        endDate: '2021-06-30',
        current: false,
        description: 'Internship focused on JavaScript and web development',
      },
    ],
    certificates: [
      {
        id: 'cert-1',
        title: 'AWS Solutions Architect Associate',
        issuer: 'Amazon',
        issueDate: '2023-06-15',
        url: 'https://example.com/cert1.pdf',
      },
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Database Design', 'REST APIs'],
    languages: [
      { name: 'Arabic', level: 'native' },
      { name: 'English', level: 'fluent' },
    ],
    drivingLicense: false,
    transportInfo: 'Own car',
  },
  {
    id: 'cv-req-2',
    candidateId: 'cand-002',
    candidate: {
      id: 'cand-002',
      fullName: 'Fatima Abdelrahman Hassan',
      email: 'fatima.hassan@example.com',
      phone: '+249 912 345 678',
      location: 'Port Sudan',
      dateOfBirth: '1992-03-22',
      nationality: 'Sudan',
      maritalStatus: 'Married',
    },
    status: 'in_review',
    requestedAt: '2025-01-12T14:15:00Z',
    assignedTo: 'admin-001',
    assignedToName: 'Sarah Admin',
    education: [
      {
        id: 'edu-2',
        institution: 'Omdurman Islamic University',
        degree: 'Bachelor',
        field: 'Business Administration',
        startYear: 2015,
        endYear: 2019,
        current: false,
      },
    ],
    workExperience: [
      {
        id: 'exp-3',
        companyName: 'Trading Company',
        jobTitle: 'Marketing Manager',
        startDate: '2019-09-01',
        endDate: '2024-12-31',
        current: false,
        description: 'Managed digital marketing campaigns and brand strategy',
      },
    ],
    certificates: [],
    skills: ['Marketing', 'Social Media', 'Brand Strategy', 'Team Leadership'],
    languages: [
      { name: 'Arabic', level: 'native' },
      { name: 'English', level: 'intermediate' },
    ],
    drivingLicense: true,
    transportInfo: 'Own car',
  },
  {
    id: 'cv-req-3',
    candidateId: 'cand-003',
    candidate: {
      id: 'cand-003',
      fullName: 'Ibrahim Ali Khalil',
      email: 'ibrahim.khalil@example.com',
      phone: '+249 923 456 789',
      location: 'Medani',
    },
    status: 'revision_requested',
    requestedAt: '2025-01-10T09:45:00Z',
    assignedTo: 'admin-002',
    assignedToName: 'Omar Support',
    revisionNotes: 'Please add more details to work experience and clarify career gap',
    education: [],
    workExperience: [],
    certificates: [],
    skills: [],
    languages: [
      { name: 'Arabic', level: 'native' },
    ],
  },
  {
    id: 'cv-req-4',
    candidateId: 'cand-004',
    candidate: {
      id: 'cand-004',
      fullName: 'Layla Mahmoud Ahmed',
      email: 'layla.ahmed@example.com',
      phone: '+249 934 567 890',
      location: 'Khartoum',
    },
    status: 'delivered',
    requestedAt: '2025-01-08T11:20:00Z',
    deliveredAt: '2025-01-12T15:30:00Z',
    deliveredBy: 'admin-001',
    generatedCVUrl: 'https://example.com/cv/layla-ahmed-cv.pdf',
    education: [
      {
        id: 'edu-3',
        institution: 'Red Sea University',
        degree: 'Diploma',
        field: 'Nursing',
        startYear: 2019,
        endYear: 2021,
        current: false,
      },
    ],
    workExperience: [
      {
        id: 'exp-4',
        companyName: 'Hospital X',
        jobTitle: 'Nurse',
        startDate: '2021-06-01',
        endDate: '',
        current: true,
        description: 'Patient care and medical support',
      },
    ],
    certificates: [],
    skills: ['Patient Care', 'Medical Support', 'Team Work'],
    languages: [
      { name: 'Arabic', level: 'native' },
      { name: 'English', level: 'basic' },
    ],
  },
];

export function AdminCandidateCVPage() {
  const { t } = useI18n();
  const { showToast } = useApp();

  const [cvRequests, setCvRequests] = useState<CVRequest[]>(mockCVRequests);
  const [selectedRequest, setSelectedRequest] = useState<CVRequest | null>(mockCVRequests[0]);
  const [filterStatus, setFilterStatus] = useState<CVRequestStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  const filteredRequests = useMemo(() => {
    return cvRequests.filter(req => {
      const matchStatus = filterStatus === 'all' || req.status === filterStatus;
      const matchSearch = 
        req.candidate.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.candidate.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [cvRequests, filterStatus, searchQuery]);

  const statusColors: Record<CVRequestStatus, string> = {
    pending: 'bg-warning-100 text-warning-700',
    in_review: 'bg-info-100 text-info-700',
    revision_requested: 'bg-error-100 text-error-700',
    delivered: 'bg-success-100 text-success-700',
    completed: 'bg-primary-100 text-primary-700',
  };

  const statusIcons: Record<CVRequestStatus, typeof Clock> = {
    pending: Clock,
    in_review: AlertCircle,
    revision_requested: RefreshCw,
    delivered: CheckCircle,
    completed: Award,
  };

  const handleAssignToMe = () => {
    if (selectedRequest) {
      setCvRequests(
        cvRequests.map(r =>
          r.id === selectedRequest.id
            ? {
                ...r,
                status: 'in_review' as CVRequestStatus,
                assignedTo: 'admin-current',
                assignedToName: 'You',
              }
            : r
        )
      );
      setSelectedRequest({
        ...selectedRequest,
        status: 'in_review',
        assignedTo: 'admin-current',
        assignedToName: 'You',
      });
      showToast(t('assignedToYou') || 'Assigned to you', 'success');
    }
  };

  const handleRequestRevision = () => {
    if (selectedRequest && revisionNotes.trim()) {
      setCvRequests(
        cvRequests.map(r =>
          r.id === selectedRequest.id
            ? {
                ...r,
                status: 'revision_requested' as CVRequestStatus,
                revisionNotes,
                internalNotes,
              }
            : r
        )
      );
      setSelectedRequest({
        ...selectedRequest,
        status: 'revision_requested',
        revisionNotes,
        internalNotes,
      });
      setShowReviewModal(false);
      setRevisionNotes('');
      setInternalNotes('');
      showToast(t('revisionRequested') || 'Revision requested', 'success');
    }
  };

  const handleDeliverCV = () => {
    if (selectedRequest) {
      const updatedRequest = {
        ...selectedRequest,
        status: 'delivered' as CVRequestStatus,
        deliveredAt: new Date().toISOString(),
        deliveredBy: 'admin-current',
        generatedCVUrl: 'https://example.com/cv/generated-cv.pdf',
        internalNotes,
      };
      setCvRequests(
        cvRequests.map(r =>
          r.id === selectedRequest.id ? updatedRequest : r
        )
      );
      setSelectedRequest(updatedRequest);
      setShowReviewModal(false);
      setInternalNotes('');
      showToast(t('cvDelivered') || 'CV delivered to candidate', 'success');
    }
  };

  return (
    <AdminSidebar activeTab="candidates" showRoleSelector={false}>
      <div className="p-4 sm:p-6 space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary-800">{t('candidateCV') || 'Candidate CV Processing'}</h1>
            <p className="text-sm text-primary-500 mt-1">{t('cvQueueProcessing') || 'Process and deliver generated CVs to candidates'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: CV Requests Queue */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card p-4">
              <h2 className="font-bold text-primary-800 mb-3 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                {t('queue') || 'Queue'}
              </h2>

              {/* Search */}
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

              {/* Status Filter */}
              <div className="space-y-2 mb-3">
                {['all', 'pending', 'in_review', 'revision_requested', 'delivered'].map((status) => (
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
                      ({filteredRequests.filter(r => status === 'all' || r.status === status).length})
                    </span>
                  </button>
                ))}
              </div>

              {/* CV Requests List */}
              <div className="space-y-2">
                {filteredRequests.length === 0 ? (
                  <EmptyState
                    icon={<Briefcase className="w-8 h-8 text-primary-300" />}
                    title={t('noRequests') || 'No requests'}
                    description={t('noCV') || 'No CV requests found'}
                  />
                ) : (
                  filteredRequests.map(req => {
                    const StatusIcon = statusIcons[req.status];
                    return (
                      <button
                        key={req.id}
                        onClick={() => setSelectedRequest(req)}
                        className={`w-full text-left p-3 rounded-lg border transition ${
                          selectedRequest?.id === req.id
                            ? 'border-primary-300 bg-primary-50'
                            : 'border-sand-100 hover:border-sand-200'
                        }`}
                      >
                        <div className="flex items-start gap-2 mb-1">
                          <StatusIcon className="w-4 h-4 mt-0.5 shrink-0 text-primary-600" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-primary-800 truncate">
                              {req.candidate.fullName}
                            </p>
                            <p className="text-xs text-primary-500 truncate">{req.candidate.email}</p>
                          </div>
                        </div>
                        <span className={`inline-block text-xs font-bold px-2 py-1 rounded ${statusColors[req.status]}`}>
                          {t(req.status as TranslationKey) || req.status}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right: CV Details & Review */}
          <div className="lg:col-span-3 space-y-4">
            {selectedRequest ? (
              <>
                {/* Candidate Info Card */}
                <div className="card p-4 bg-gradient-to-br from-primary-50 to-sand-50">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary-200 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-primary-800">{selectedRequest.candidate.fullName}</h3>
                        <p className="text-sm text-primary-600">{selectedRequest.candidate.location}</p>
                      </div>
                    </div>
                    <span className={`badge font-bold ${statusColors[selectedRequest.status]}`}>
                      {t(selectedRequest.status as TranslationKey) || selectedRequest.status}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-primary-600">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${selectedRequest.candidate.email}`} className="hover:underline truncate">
                        {selectedRequest.candidate.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-primary-600">
                      <Phone className="w-4 h-4" />
                      <span>{selectedRequest.candidate.phone}</span>
                    </div>
                    {selectedRequest.candidate.dateOfBirth && (
                      <div className="flex items-center gap-2 text-primary-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(selectedRequest.candidate.dateOfBirth).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedRequest.candidate.nationality && (
                      <div className="flex items-center gap-2 text-primary-600">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedRequest.candidate.nationality}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Candidate Data Tabs */}
                <div className="card space-y-4">
                  <div className="px-4 pt-4">
                    <h3 className="font-bold text-primary-800 mb-3">{t('candidateData') || 'Candidate Profile Data'}</h3>
                  </div>

                  {/* Education */}
                  {selectedRequest.education.length > 0 && (
                    <div className="px-4">
                      <h4 className="font-bold text-primary-700 mb-2 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        {t('education') || 'Education'}
                      </h4>
                      <div className="space-y-2">
                        {selectedRequest.education.map(edu => (
                          <div key={edu.id} className="bg-sand-50 p-3 rounded text-sm">
                            <p className="font-medium text-primary-800">{edu.degree} in {edu.field}</p>
                            <p className="text-primary-600">{edu.institution}</p>
                            <p className="text-xs text-primary-500">
                              {edu.startYear} - {edu.current ? t('present') || 'Present' : edu.endYear}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Work Experience */}
                  {selectedRequest.workExperience.length > 0 && (
                    <div className="px-4">
                      <h4 className="font-bold text-primary-700 mb-2 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        {t('workExperience') || 'Work Experience'}
                      </h4>
                      <div className="space-y-2">
                        {selectedRequest.workExperience.map(exp => (
                          <div key={exp.id} className="bg-sand-50 p-3 rounded text-sm">
                            <p className="font-medium text-primary-800">{exp.jobTitle}</p>
                            <p className="text-primary-600">{exp.companyName}</p>
                            <p className="text-xs text-primary-500">
                              {new Date(exp.startDate).toLocaleDateString()} -
                              {exp.current ? ` ${t('present') || 'Present'}` : ` ${new Date(exp.endDate).toLocaleDateString()}`}
                            </p>
                            {exp.description && (
                              <p className="text-primary-600 text-xs mt-1">{exp.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {selectedRequest.skills.length > 0 && (
                    <div className="px-4">
                      <h4 className="font-bold text-primary-700 mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        {t('skills') || 'Skills'}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedRequest.skills.map(skill => (
                          <span key={skill} className="badge bg-primary-100 text-primary-700 text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {selectedRequest.languages.length > 0 && (
                    <div className="px-4 pb-4">
                      <h4 className="font-bold text-primary-700 mb-2">{t('languages') || 'Languages'}</h4>
                      <div className="space-y-1">
                        {selectedRequest.languages.map(lang => (
                          <div key={lang.name} className="text-sm text-primary-600">
                            {lang.name} - <span className="text-primary-500">{lang.level}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="card p-4 bg-primary-50 border border-primary-200">
                  <div className="space-y-2">
                    {selectedRequest.status === 'pending' && (
                      <button onClick={handleAssignToMe} className="w-full btn-primary">
                        <Briefcase className="w-4 h-4" />
                        {t('assignToMe') || 'Assign to Me'}
                      </button>
                    )}

                    {selectedRequest.status === 'in_review' && (
                      <>
                        <button onClick={() => setShowReviewModal(true)} className="w-full btn-primary">
                          <Send className="w-4 h-4" />
                          {t('reviewAndDeliver') || 'Review & Deliver'}
                        </button>
                      </>
                    )}

                    {selectedRequest.status === 'delivered' && selectedRequest.generatedCVUrl && (
                      <a
                        href={selectedRequest.generatedCVUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block btn-primary text-center"
                      >
                        <Download className="w-4 h-4" />
                        {t('downloadCV') || 'Download CV'}
                      </a>
                    )}

                    {selectedRequest.status === 'revision_requested' && selectedRequest.revisionNotes && (
                      <div className="bg-error-50 border border-error-200 p-3 rounded text-sm">
                        <p className="font-bold text-error-700 mb-1">{t('revisionNotes') || 'Revision Notes'}</p>
                        <p className="text-error-600">{selectedRequest.revisionNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Status */}
                {selectedRequest.status === 'delivered' && (
                  <div className="card p-4 border border-success-200 bg-success-50">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-success-600" />
                      <p className="font-bold text-success-700">{t('cvDeliveredStatus') || 'CV Delivered'}</p>
                    </div>
                    <p className="text-sm text-success-600">
                      {t('deliveredBy')}: {selectedRequest.deliveredBy}
                    </p>
                    <p className="text-sm text-success-600">
                      {t('deliveredAt')}:{' '}
                      {selectedRequest.deliveredAt
                        ? new Date(selectedRequest.deliveredAt).toLocaleString()
                        : '--'}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={<Briefcase className="w-12 h-12 text-primary-300" />}
                title={t('noSelection') || 'No selection'}
                description={t('selectRequest') || 'Select a CV request from the queue to view details'}
              />
            )}
          </div>
        </div>
      </div>

      {/* Review & Deliver Modal */}
      <Modal
        isOpen={showReviewModal}
        title={t('reviewAndDeliver') || 'Review & Deliver CV'}
        onClose={() => setShowReviewModal(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-primary-700 mb-1 block">
              {t('internalNotes') || 'Internal Notes'}
            </label>
            <textarea
              placeholder="Notes for your team (not visible to candidate)"
              className="input text-sm h-24 resize-none"
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
            />
          </div>

          <div className="bg-info-50 border border-info-200 p-3 rounded text-sm">
            <p className="font-bold text-info-700 mb-1">{t('cvOptions') || 'CV Generation Options'}</p>
            <p className="text-info-600">
              {t('generateMessage') || 'A professionally formatted CV will be generated and delivered to the candidate immediately.'}
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleDeliverCV}
              className="w-full btn-primary"
            >
              <Send className="w-4 h-4" />
              {t('deliverCV') || 'Deliver CV'}
            </button>
            <button
              onClick={() => {
                setRevisionNotes('');
                setShowReviewModal(false);
              }}
              className="w-full btn-secondary"
            >
              <X className="w-4 h-4" />
              {t('cancel') || 'Cancel'}
            </button>
          </div>
        </div>
      </Modal>
    </AdminSidebar>
  );
}
