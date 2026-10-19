import React, { useState, useRef } from 'react';
import { Upload, X, Eye, Download, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { BusinessSidebar } from '../components/BusinessSidebar';
import { businesses } from '@/data/mockData';
import { useRouter } from '@/router/Router';
import { useI18n } from '@/i18n/I18nContext';

interface Document {
  id: string;
  name: string;
  type: 'commercial_registration' | 'tax_certificate' | 'business_license' | 'other';
  file: File;
  preview?: string;
  uploadedDate: Date;
}

interface VerificationRequest {
  id: string;
  type: 'business' | 'dealer' | 'employer' | 'service_provider';
  status: 'pending' | 'approved' | 'rejected' | 'more_info';
  documents: Document[];
  submittedDate: Date;
  reviewedDate?: Date;
  reason?: string;
  history: VerificationHistory[];
}

interface VerificationHistory {
  date: Date;
  status: string;
  note: string;
}

export function BusinessVerificationPage() {
  const { path } = useRouter();
  const { t, lang } = useI18n();
  const pathParts = path.split('/').filter(Boolean);
  const bizId = pathParts.find(p => p.startsWith('biz-')) || 'biz-1';
  const business = businesses.find(b => b.id === bizId) || businesses[0];
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [currentRequest, setCurrentRequest] = useState<VerificationRequest>({
    id: 'vrf-001',
    type: 'business',
    status: 'pending',
    documents: [
      {
        id: 'doc-1',
        name: 'Commercial_Registration.pdf',
        type: 'commercial_registration',
        file: new File([''], 'Commercial_Registration.pdf'),
        uploadedDate: new Date('2025-01-10'),
      },
      {
        id: 'doc-2',
        name: 'Tax_Certificate.pdf',
        type: 'tax_certificate',
        file: new File([''], 'Tax_Certificate.pdf'),
        uploadedDate: new Date('2025-01-10'),
      },
    ],
    submittedDate: new Date('2025-01-10'),
    history: [
      {
        date: new Date('2025-01-10'),
        status: 'submitted',
        note: 'Verification request submitted with 2 documents',
      },
      {
        date: new Date('2025-01-11'),
        status: 'under_review',
        note: 'Admin began reviewing submitted documents',
      },
    ],
  });

  const [showForm, setShowForm] = useState(currentRequest.status === 'rejected' || currentRequest.status === 'more_info');
  const [selectedType, setSelectedType] = useState<'business' | 'dealer' | 'employer' | 'service_provider'>('business');
  const [uploadedDocs, setUploadedDocs] = useState<Document[]>(currentRequest.documents);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const docTypeLabels: Record<string, string> = {
    commercial_registration: 'Commercial Registration Certificate',
    tax_certificate: 'Tax Certificate',
    business_license: 'Business License',
    other: 'Other Document',
  };

  const verificationTypeLabels: Record<string, string> = {
    business: 'Verified Business',
    dealer: 'Verified Dealer',
    employer: 'Verified Employer',
    service_provider: 'Verified Service Provider',
  };

  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'text-warning-600',
      bgColor: 'bg-warning-50',
      label: 'Pending Review',
    },
    approved: {
      icon: CheckCircle,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
      label: 'Approved',
    },
    rejected: {
      icon: XCircle,
      color: 'text-error-600',
      bgColor: 'bg-error-50',
      label: 'Rejected',
    },
    more_info: {
      icon: AlertCircle,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      label: 'More Info Requested',
    },
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const newDoc: Document = {
        id: `doc-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: 'other',
        file,
        uploadedDate: new Date(),
      };

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = e => {
          newDoc.preview = e.target?.result as string;
          setUploadedDocs(prev => [...prev, newDoc]);
        };
        reader.readAsDataURL(file);
      } else {
        setUploadedDocs(prev => [...prev, newDoc]);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeDocument = (id: string) => {
    setUploadedDocs(prev => prev.filter(doc => doc.id !== id));
    if (selectedDoc?.id === id) {
      setSelectedDoc(null);
    }
  };

  const handleSubmitVerification = () => {
    const newRequest: VerificationRequest = {
      id: `vrf-${Date.now()}`,
      type: selectedType,
      status: 'pending',
      documents: uploadedDocs,
      submittedDate: new Date(),
      history: [
        {
          date: new Date(),
          status: 'submitted',
          note: `Verification request submitted with ${uploadedDocs.length} documents`,
        },
      ],
    };
    setCurrentRequest(newRequest);
    setShowForm(false);
  };

  const StatusIcon = statusConfig[currentRequest.status].icon;
  const config = statusConfig[currentRequest.status];

  return (
    <div className="flex min-h-screen">
      <BusinessSidebar activeTab="verification" business={business} sidebarOpen={sidebarOpen} onCloseSidebar={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-primary-950/30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-sand-100 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-sand-50">
            <Upload className="w-5 h-5 text-primary-600" />
          </button>
          <span className="font-bold text-primary-700">{t('verification')}</span>
          <div className="w-9" />
        </div>

        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-800 mb-2">{t('verification')}</h1>
            <p className="text-sm text-primary-400">
              {lang === 'ar' ? 'تقديم المستندات للتحقق من عملك' : 'Submit documents to verify your business'}
            </p>
          </div>

          {/* Current Status Card */}
          {!showForm && (
            <div className={`${config.bgColor} border border-sand-100 rounded-lg p-4 sm:p-6 mb-6`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <StatusIcon className={`${config.color} w-6 h-6 mt-1 flex-shrink-0`} />
                  <div>
                    <h2 className={`text-lg font-semibold ${config.color}`}>{config.label}</h2>
                    <p className="text-primary-600 text-sm mt-1">
                      Type: <span className="font-medium">{verificationTypeLabels[currentRequest.type]}</span>
                    </p>
                    <p className="text-primary-600 text-sm">
                      Submitted: {currentRequest.submittedDate.toLocaleDateString()}
                    </p>
                    {currentRequest.reason && (
                      <div className="mt-3 p-3 bg-white bg-opacity-60 rounded border border-sand-200">
                        <p className="text-sm font-medium text-primary-700 mb-1">Admin Note:</p>
                        <p className="text-sm text-primary-600">{currentRequest.reason}</p>
                      </div>
                    )}
                  </div>
                </div>
                {(currentRequest.status === 'rejected' || currentRequest.status === 'more_info') && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium flex-shrink-0"
                  >
                    Resubmit
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Submitted Documents */}
          {!showForm && currentRequest.documents.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-primary-800 mb-4">Submitted Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentRequest.documents.map(doc => (
                  <div key={doc.id} className="card p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-primary-700 truncate">{doc.name}</p>
                        <p className="text-xs text-primary-500">
                          {docTypeLabels[doc.type] || doc.type}
                        </p>
                        <p className="text-xs text-primary-500 mt-1">
                          Uploaded: {doc.uploadedDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="flex-1 px-3 py-2 bg-sand-50 hover:bg-sand-100 text-primary-600 text-sm rounded transition flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <a
                        href="#"
                        className="flex-1 px-3 py-2 bg-sand-50 hover:bg-sand-100 text-primary-600 text-sm rounded transition flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verification History */}
          {!showForm && currentRequest.history.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-primary-800 mb-4">Verification History</h3>
              <div className="card overflow-hidden">
                {currentRequest.history.map((entry, idx) => (
                  <div key={idx} className={`p-4 ${idx < currentRequest.history.length - 1 ? 'border-b border-sand-100' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-primary-700 text-sm capitalize">
                          {entry.status.replace(/_/g, ' ')}
                        </p>
                        <p className="text-primary-600 text-sm mt-1">{entry.note}</p>
                        <p className="text-xs text-primary-500 mt-2">
                          {entry.date.toLocaleDateString()} at {entry.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submission Form */}
          {showForm && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-primary-800 mb-6">
                {currentRequest.status === 'pending' ? 'Update Verification Request' : 'Submit Verification Request'}
              </h2>

              {/* Verification Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-primary-800 mb-3">
                  Verification Type <span className="text-error-600">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(['business', 'dealer', 'employer', 'service_provider'] as const).map(type => (
                    <label
                      key={type}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                        selectedType === type
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-sand-100 bg-white hover:border-sand-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="verification_type"
                        value={type}
                        checked={selectedType === type}
                        onChange={e => setSelectedType(e.target.value as any)}
                        className="w-4 h-4"
                      />
                      <span className="ml-3 font-medium text-primary-700">
                        {verificationTypeLabels[type]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Document Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-primary-800 mb-3">
                  Upload Documents <span className="text-error-600">*</span>
                </label>
                <p className="text-sm text-primary-600 mb-4">
                  Upload business registration documents. Supported: PDF, JPG, PNG (max 5MB per file)
                </p>

                {/* Upload Area */}
                <div
                  className="border-2 border-dashed border-sand-200 rounded-lg p-6 text-center hover:border-sand-300 hover:bg-sand-50 transition cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 text-primary-400 mx-auto mb-2" />
                  <p className="font-medium text-primary-700">Click to upload or drag and drop</p>
                  <p className="text-sm text-primary-500 mt-1">PDF, JPG, PNG up to 5MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Uploaded Documents List */}
                {uploadedDocs.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-primary-800 mb-3">
                      Uploaded Documents ({uploadedDocs.length})
                    </h4>
                    <div className="space-y-2">
                      {uploadedDocs.map(doc => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 bg-sand-50 border border-sand-100 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-primary-700 truncate">{doc.name}</p>
                            <p className="text-xs text-primary-500">
                              {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {doc.preview && (
                              <button
                                onClick={() => setSelectedDoc(doc)}
                                className="p-2 text-primary-600 hover:bg-sand-100 rounded transition"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => removeDocument(doc.id)}
                              className="p-2 text-error-600 hover:bg-error-50 rounded transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setUploadedDocs(currentRequest.documents);
                  }}
                  className="px-6 py-2 border border-sand-200 text-primary-700 rounded-lg hover:bg-sand-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitVerification}
                  disabled={uploadedDocs.length === 0}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed transition font-medium"
                >
                  {currentRequest.status === 'pending' ? 'Update & Resubmit' : 'Submit for Verification'}
                </button>
              </div>
            </div>
          )}

          {/* Document Preview Modal */}
          {selectedDoc && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-sand-100">
                  <div>
                    <h3 className="font-semibold text-primary-800">{selectedDoc.name}</h3>
                    <p className="text-xs text-primary-500 mt-1">
                      {docTypeLabels[selectedDoc.type] || selectedDoc.type}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedDoc(null)}
                    className="p-2 hover:bg-sand-50 rounded transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Document Preview Content */}
                <div className="flex-1 overflow-auto bg-sand-50 flex items-center justify-center">
                  {selectedDoc.preview ? (
                    <div className="flex flex-col items-center gap-4">
                      <img
                        src={selectedDoc.preview}
                        alt={selectedDoc.name}
                        style={{ transform: `scale(${zoomLevel / 100})` }}
                        className="max-w-full transition-transform"
                      />
                      {/* Zoom Controls */}
                      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg">
                        <button
                          onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                          className="px-3 py-1 bg-sand-100 hover:bg-sand-200 rounded text-sm"
                        >
                          −
                        </button>
                        <span className="text-sm font-medium w-12 text-center text-primary-700">{zoomLevel}%</span>
                        <button
                          onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                          className="px-3 py-1 bg-sand-100 hover:bg-sand-200 rounded text-sm"
                        >
                          +
                        </button>
                        <button
                          onClick={() => setZoomLevel(100)}
                          className="px-3 py-1 bg-sand-100 hover:bg-sand-200 rounded text-sm text-primary-700"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-primary-600 text-sm">Document preview not available</p>
                      <p className="text-primary-500 text-xs mt-2">{selectedDoc.name}</p>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-sand-100 flex justify-end gap-2">
                  <a
                    href="#"
                    className="px-4 py-2 border border-sand-200 text-primary-700 rounded-lg hover:bg-sand-50 transition text-sm font-medium flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                  <button
                    onClick={() => setSelectedDoc(null)}
                    className="px-4 py-2 bg-sand-100 text-primary-700 rounded-lg hover:bg-sand-200 transition text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
