import { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { useRouter } from '@/router/Router';
import { categories, sudanCities, listings } from '@/data/mockData';
import { Modal, ComingSoon } from '@/components/ui';
import {
  Check, ChevronLeft, ChevronRight, Upload, X, Image as ImageIcon,
  Video, Star, Save, Send, Cloud, CloudOff, RefreshCw, GripVertical,
  Tag, DollarSign, MapPin, FileText, AlertCircle, Info,
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

const STEPS = ['selectIntent', 'selectCategory', 'enterDetails', 'addPhotosVideo', 'enterPriceLocation', 'enterDescription', 'reviewListing'];

const INTENTS = [
  { id: 'sell', key: 'sell', icon: '🏷️' },
  { id: 'rent', key: 'rent', icon: '🔑' },
  { id: 'offerService', key: 'offerService', icon: '🛠️' },
  { id: 'postJob', key: 'postJob', icon: '💼' },
  { id: 'wantedListing', key: 'wantedListing', icon: '🔍' },
];

const DRAFT_KEY = 'marbou-addlisting-draft';

// Simple mock translation function
const getSimpleTranslation = (text: string, toArabic: boolean): string => {
  if (!text) return '';
  
  const englishToArabic: Record<string, string> = {
    'car': 'سيارة', 'house': 'منزل', 'phone': 'هاتف', 'laptop': 'كمبيوتر',
    'apartment': 'شقة', 'villa': 'فيلا', 'land': 'أرض', 'office': 'مكتب',
    'shop': 'محل', 'garage': 'كراج', 'truck': 'شاحنة', 'motorcycle': 'دراجة',
    'furniture': 'أثاث', 'sofa': 'أريكة', 'table': 'طاولة', 'chair': 'كرسي',
  };

  if (toArabic) {
    const words = text.toLowerCase().split(' ');
    const translated = words.map(w => englishToArabic[w] || w).join(' ');
    return translated;
  } else {
    // Reverse lookup
    const arabicToEnglish = Object.fromEntries(Object.entries(englishToArabic).map(([k, v]) => [v, k]));
    const words = text.split(' ');
    const translated = words.map(w => arabicToEnglish[w] || w).join(' ');
    return translated;
  }
};

export function AddListingPage() {
  const { t, lang, formatPrice } = useI18n();
  const { navigate } = useRouter();
  const { addMyListing, showToast, networkState } = useApp();

  const [step, setStep] = useState(0);
  const [intent, setIntent] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [hasVideo, setHasVideo] = useState(false);
  const [price, setPrice] = useState('');
  const [negotiable, setNegotiable] = useState(false);
  const [city, setCity] = useState('khartoum');
  const [area, setArea] = useState('');
  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [description, setDescription] = useState('');
  const [specs, setSpecs] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [syncState, setSyncState] = useState<'savedLocally' | 'waiting' | 'uploading' | 'saved' | 'retry'>('savedLocally');
  
  // Track auto-translation state
  const [titleAutoTranslated, setTitleAutoTranslated] = useState(false);
  const [titleArAutoTranslated, setTitleArAutoTranslated] = useState(false);
  const titleDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const titleArDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Load draft
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        const d = JSON.parse(draft);
        if (d.step !== undefined) {
          setStep(d.step); setIntent(d.intent || ''); setCategory(d.category || '');
          setSubcategory(d.subcategory || ''); setPhotos(d.photos || []);
          setCoverIndex(d.coverIndex || 0); setPrice(d.price || '');
          setNegotiable(d.negotiable || false); setCity(d.city || 'khartoum');
          setArea(d.area || ''); setTitle(d.title || ''); setTitleAr(d.titleAr || '');
          setDescription(d.description || ''); setSpecs(d.specs || {});
        }
      } catch {}
    }
  }, []);

  // Save draft
  useEffect(() => {
    const draft = { step, intent, category, subcategory, photos, coverIndex, price, negotiable, city, area, title, titleAr, description, specs };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    setSyncState(networkState === 'offline' ? 'waiting' : 'savedLocally');
  }, [step, intent, category, subcategory, photos, coverIndex, price, negotiable, city, area, title, titleAr, description, specs, networkState]);

  // Handle title (English) auto-translate to Arabic
  const handleTitleChange = (value: string) => {
    setTitle(value);
    
    // Clear existing timeout
    if (titleDebounceRef.current) clearTimeout(titleDebounceRef.current);
    
    // Set new debounced translation
    titleDebounceRef.current = setTimeout(() => {
      if (value && (titleAr === '' || titleArAutoTranslated)) {
        const translated = getSimpleTranslation(value, true);
        setTitleAr(translated);
        setTitleArAutoTranslated(true);
      }
    }, 300);
  };

  // Handle title (Arabic) auto-translate to English
  const handleTitleArChange = (value: string) => {
    setTitleAr(value);
    
    // Clear existing timeout
    if (titleArDebounceRef.current) clearTimeout(titleArDebounceRef.current);
    
    // Set new debounced translation
    titleArDebounceRef.current = setTimeout(() => {
      if (value && (title === '' || titleAutoTranslated)) {
        const translated = getSimpleTranslation(value, false);
        setTitle(translated);
        setTitleAutoTranslated(true);
      }
    }, 300);
  };

  // Allow manual editing to break auto-translation
  const handleTitleManualEdit = () => {
    setTitleAutoTranslated(false);
  };

  const handleTitleArManualEdit = () => {
    setTitleArAutoTranslated(false);
  };

  const activeCategory = categories.find((c) => c.id === category);

  // Category-specific fields
  const getFields = (): { key: string; label: string; labelAr: string; type: string; required: boolean; options?: string[] }[] => {
    if (!category) return [];
    if (category === 'vehicles') return [
      { key: 'make', label: 'Make', labelAr: 'الماركة', type: 'text', required: true },
      { key: 'model', label: 'Model', labelAr: 'الموديل', type: 'text', required: true },
      { key: 'year', label: 'Year', labelAr: 'سنة الصنع', type: 'number', required: true },
      { key: 'mileage', label: 'Mileage', labelAr: 'المسافة', type: 'number', required: false },
      { key: 'fuel', label: 'Fuel Type', labelAr: 'الوقود', type: 'select', required: true, options: ['Petrol', 'Diesel', 'Hybrid', 'Electric'] },
      { key: 'transmission', label: 'Transmission', labelAr: 'ناقل الحركة', type: 'select', required: true, options: ['Automatic', 'Manual'] },
      { key: 'color', label: 'Color', labelAr: 'اللون', type: 'text', required: false },
    ];
    if (category === 'real-estate') return [
      { key: 'area', label: 'Area (sqm)', labelAr: 'المساحة (م²)', type: 'number', required: true },
      { key: 'rooms', label: 'Rooms', labelAr: 'غرف', type: 'number', required: true },
      { key: 'bathrooms', label: 'Bathrooms', labelAr: 'حمامات', type: 'number', required: false },
      { key: 'floor', label: 'Floor', labelAr: 'الطابق', type: 'text', required: false },
      { key: 'finishing', label: 'Finishing', labelAr: 'التشطيب', type: 'select', required: true, options: ['Finished', 'Semi-finished', 'Unfinished'] },
      { key: 'furnishing', label: 'Furnishing', labelAr: 'التأثيث', type: 'select', required: false, options: ['Furnished', 'Semi-furnished', 'Unfurnished'] },
    ];
    if (category === 'electronics') return [
      { key: 'brand', label: 'Brand', labelAr: 'الماركة', type: 'text', required: true },
      { key: 'model', label: 'Model', labelAr: 'الموديل', type: 'text', required: true },
      { key: 'storage', label: 'Storage', labelAr: 'التخزين', type: 'text', required: false },
      { key: 'ram', label: 'RAM', labelAr: 'الذاكرة', type: 'text', required: false },
      { key: 'condition', label: 'Condition', labelAr: 'الحالة', type: 'select', required: true, options: ['New', 'Used - Excellent', 'Used - Good', 'Used - Fair'] },
      { key: 'warranty', label: 'Warranty', labelAr: 'الضمان', type: 'text', required: false },
    ];
    return [
      { key: 'condition', label: 'Condition', labelAr: 'الحالة', type: 'select', required: true, options: ['New', 'Used - Excellent', 'Used - Good', 'Used - Fair'] },
    ];
  };

  const fields = getFields();
  const completeness = Math.round(
    ((intent ? 1 : 0) + (category ? 1 : 0) + (title ? 1 : 0) + (price ? 1 : 0) + (city ? 1 : 0) + (description ? 1 : 0) + (photos.length > 0 ? 1 : 0) + (fields.filter(f => f.required && specs[f.key]).length === fields.filter(f => f.required).length ? 1 : 0)) / 8 * 100
  );

  const handlePhotoAdd = () => {
    // Simulate adding a photo with a sample image
    const sampleImages = [
      'https://images.pexels.com/photos/33521845/pexels-photo-33521845.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/7587828/pexels-photo-7587828.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/30639091/pexels-photo-30639091.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    ];
    const newPhoto = sampleImages[photos.length % sampleImages.length];
    setPhotos([...photos, newPhoto]);
  };

  const handleSubmit = () => {
    const newId = `lst-${Date.now()}`;
    addMyListing(newId);
    localStorage.removeItem(DRAFT_KEY);
    showToast(t('listingSubmitted'), 'success');
    navigate('/account/my-listings');
  };

  const handleSaveDraft = () => {
    showToast(t('draftSaved'), 'success');
    navigate('/account/my-listings');
  };

  const SyncIndicator = () => {
    const config = {
      savedLocally: { icon: <Save className="w-3.5 h-3.5" />, label: t('savedLocally'), color: 'text-primary-500' },
      waiting: { icon: <CloudOff className="w-3.5 h-3.5" />, label: t('waitingConnection'), color: 'text-warning-500' },
      uploading: { icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" />, label: t('uploading'), color: 'text-primary-500' },
      saved: { icon: <Cloud className="w-3.5 h-3.5" />, label: t('savedLocally'), color: 'text-success-500' },
      retry: { icon: <RefreshCw className="w-3.5 h-3.5" />, label: t('retry'), color: 'text-error-500' },
    };
    const c = config[syncState];
    return (
      <div className={`flex items-center gap-1.5 text-xs ${c.color}`}>
        {c.icon}{c.label}
      </div>
    );
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-6 overflow-x-auto no-scrollbar">
      {STEPS.map((s, i) => (
        <div key={i} className="flex items-center shrink-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? 'bg-primary-600 text-white' : i === step ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-300' : 'bg-sand-100 text-primary-300'}`}>
            {i < step ? <Check className="w-4 h-4" /> : i + 1}
          </div>
          {i < STEPS.length - 1 && <div className={`w-8 sm:w-12 h-0.5 mx-0.5 ${i < step ? 'bg-primary-600' : 'bg-sand-200'}`} />}
        </div>
      ))}
    </div>
  );

  const Arrow = lang === 'ar' ? ChevronLeft : ChevronRight;
  const ArrowBack = lang === 'ar' ? ChevronRight : ChevronLeft;

  return (
    <div className="py-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-primary-800">{t('addListing')}</h1>
        <SyncIndicator />
      </div>

      <StepIndicator />

      {/* Completeness bar */}
      <div className="card p-3 mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-primary-500">{t('completenessScore')}</span>
          <span className="text-xs font-bold text-primary-700">{completeness}%</span>
        </div>
        <div className="h-2 bg-sand-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-300" style={{ width: `${completeness}%` }} />
        </div>
        {completeness < 100 && (
          <div className="mt-2 space-y-0.5">
            {!title && <p className="text-[11px] text-primary-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{lang === 'ar' ? 'أضف عنواناً' : 'Add a title'}</p>}
            {!description && <p className="text-[11px] text-primary-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{lang === 'ar' ? 'أضف وصفاً' : 'Add a description'}</p>}
            {photos.length === 0 && <p className="text-[11px] text-primary-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{lang === 'ar' ? 'أضف صوراً' : 'Add photos'}</p>}
            {!price && <p className="text-[11px] text-primary-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{lang === 'ar' ? 'أضف السعر' : 'Add price'}</p>}
            {fields.filter(f => f.required).some(f => !specs[f.key]) && <p className="text-[11px] text-primary-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{lang === 'ar' ? 'أكمل المواصفات المطلوبة' : 'Complete required specs'}</p>}
          </div>
        )}
      </div>

      <div className="card p-5 sm:p-6">
        {/* Step 0: Intent */}
        {step === 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-primary-800 mb-4">{t('selectIntent')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {INTENTS.map((intent_opt) => (
                <button
                  key={intent_opt.id}
                  onClick={() => { setIntent(intent_opt.id); setStep(1); }}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${intent === intent_opt.id ? 'border-primary-500 bg-primary-50' : 'border-sand-100 hover:border-primary-200'}`}
                >
                  <div className="text-3xl mb-2">{intent_opt.icon}</div>
                  <span className="text-sm font-medium text-primary-700">{t(intent_opt.key as TranslationKey)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Category */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-primary-800">{t('selectCategory')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${category === cat.id ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-sand-100 text-primary-600 hover:border-primary-200'}`}
                >
                  {t(cat.key)}
                </button>
              ))}
            </div>
            {activeCategory && activeCategory.subcategories.length > 0 && (
              <div>
                <p className="text-sm font-medium text-primary-500 mb-2">{t('categories')}</p>
                <div className="flex flex-wrap gap-2">
                  {activeCategory.subcategories.map((s) => (
                    <button key={s.id} onClick={() => setSubcategory(s.id)} className={subcategory === s.id ? 'chip-active' : 'chip-default'}>
                      {t(s.key)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(0)} className="btn-secondary text-sm"><ArrowBack className="w-4 h-4" />{t('back')}</button>
              <button onClick={() => setStep(2)} disabled={!category} className="btn-primary text-sm">{t('next')}<Arrow className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-primary-800">{t('enterDetails')}</h2>
            <div>
              <label className="text-sm font-medium text-primary-600 mb-1.5 block">{t('title')} ({lang === 'ar' ? 'عربي' : 'English'})</label>
              <input 
                value={title} 
                onChange={(e) => { handleTitleChange(e.target.value); handleTitleManualEdit(); }}
                className="input" 
                placeholder={lang === 'ar' ? 'عنوان الإعلان' : 'Listing title'} 
              />
              {titleAutoTranslated && <p className="text-[11px] text-primary-300 mt-1">{lang === 'ar' ? '(مترجم تلقائياً)' : '(Auto-translated)'}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-primary-600 mb-1.5 block">{t('title')} ({lang === 'ar' ? 'إنجليزي' : 'Arabic'})</label>
              <input 
                value={titleAr} 
                onChange={(e) => { handleTitleArChange(e.target.value); handleTitleArManualEdit(); }}
                className="input" 
                placeholder={lang === 'ar' ? 'Listing title' : 'عنوان الإعلان'} 
                dir={lang === 'ar' ? 'ltr' : 'rtl'} 
              />
              {titleArAutoTranslated && <p className="text-[11px] text-primary-300 mt-1">{lang === 'ar' ? '(مترجم تلقائياً)' : '(Auto-translated)'}</p>}
            </div>
            {fields.map((field) => (
              <div key={field.key}>
                <label className="text-sm font-medium text-primary-600 mb-1.5 block">
                  {lang === 'ar' ? field.labelAr : field.label}
                  {field.required && <span className="text-error-500 ms-1">*</span>}
                </label>
                {field.type === 'select' ? (
                  <select value={specs[field.key] || ''} onChange={(e) => setSpecs({ ...specs, [field.key]: e.target.value })} className="input">
                    <option value="">--</option>
                    {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={field.type === 'number' ? 'number' : 'text'} value={specs[field.key] || ''} onChange={(e) => setSpecs({ ...specs, [field.key]: e.target.value })} className="input" />
                )}
              </div>
            ))}
            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(1)} className="btn-secondary text-sm"><ArrowBack className="w-4 h-4" />{t('back')}</button>
              <button onClick={() => setStep(3)} disabled={!title} className="btn-primary text-sm">{t('next')}<Arrow className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {/* Step 3: Photos */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-primary-800">{t('addPhotosVideo')}</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {photos.map((photo, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-sand-100 group">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                  {i === coverIndex && (
                    <div className="absolute top-1 start-1 badge bg-primary-600 text-white text-[10px]">{t('coverImage')}</div>
                  )}
                  <div className="absolute inset-0 bg-primary-950/0 group-hover:bg-primary-950/40 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                    {i !== coverIndex && (
                      <button onClick={() => setCoverIndex(i)} className="bg-white rounded-full p-1.5" title={t('setCover')}>
                        <Star className="w-3.5 h-3.5 text-primary-500" />
                      </button>
                    )}
                    <button onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))} className="bg-white rounded-full p-1.5">
                      <X className="w-3.5 h-3.5 text-error-500" />
                    </button>
                  </div>
                  <div className="absolute bottom-1 end-1 text-primary-300">
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
              {photos.length < 8 && (
                <button onClick={handlePhotoAdd} className="aspect-square rounded-xl border-2 border-dashed border-sand-200 hover:border-primary-300 flex flex-col items-center justify-center gap-1 text-primary-300 hover:text-primary-500 transition-all">
                  <ImageIcon className="w-6 h-6" />
                  <span className="text-xs">{t('addPhotos')}</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-3 p-3 bg-sand-50 rounded-xl">
              <button onClick={() => setHasVideo(!hasVideo)} className={`p-2 rounded-lg ${hasVideo ? 'bg-primary-100 text-primary-600' : 'bg-white text-primary-400'}`}>
                <Video className="w-5 h-5" />
              </button>
              <div>
                <p className="text-xs font-medium text-primary-600">{t('addVideo')}</p>
                <p className="text-xs text-primary-300">{t('videoLimitInfo')}</p>
              </div>
            </div>
            {networkState === 'offline' && (
              <div className="flex items-center gap-2 p-3 bg-warning-50 rounded-xl text-warning-600 text-sm">
                <AlertCircle className="w-4 h-4" />{t('waitingConnection')}
              </div>
            )}
            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(2)} className="btn-secondary text-sm"><ArrowBack className="w-4 h-4" />{t('back')}</button>
              <button onClick={() => setStep(4)} className="btn-primary text-sm">{t('next')}<Arrow className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {/* Step 4: Price & Location */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-primary-800">{t('enterPriceLocation')}</h2>
            <div>
              <label className="text-sm font-medium text-primary-600 mb-1.5 block">{t('price')} (SDG)</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="input" placeholder="0" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={negotiable} onChange={(e) => setNegotiable(e.target.checked)} className="accent-primary-600 w-4 h-4" />
              <span className="text-sm text-primary-600">{t('negotiable')}</span>
            </label>
            <div>
              <label className="text-sm font-medium text-primary-600 mb-1.5 block">{t('location')}</label>
              <select value={city} onChange={(e) => { setCity(e.target.value); setArea(''); }} className="input mb-2">
                {sudanCities.map((c) => <option key={c.id} value={c.id}>{lang === 'ar' ? c.nameAr : c.name}</option>)}
              </select>
              <select value={area} onChange={(e) => setArea(e.target.value)} className="input">
                <option value="">--</option>
                {sudanCities.find((c) => c.id === city)?.areas.map((a) => <option key={a.id} value={a.id}>{lang === 'ar' ? a.nameAr : a.name}</option>)}
              </select>
            </div>
            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(3)} className="btn-secondary text-sm"><ArrowBack className="w-4 h-4" />{t('back')}</button>
              <button onClick={() => setStep(5)} disabled={!price} className="btn-primary text-sm">{t('next')}<Arrow className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {/* Step 5: Description */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-primary-800">{t('enterDescription')}</h2>
            <div>
              <label className="text-sm font-medium text-primary-600 mb-1.5 block">{t('description')}</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} className="input resize-none" placeholder={lang === 'ar' ? 'صف إعلانك بالتفصيل...' : 'Describe your listing in detail...'} />
            </div>
            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(4)} className="btn-secondary text-sm"><ArrowBack className="w-4 h-4" />{t('back')}</button>
              <button onClick={() => setStep(6)} className="btn-primary text-sm">{t('next')}<Arrow className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {/* Step 6: Review */}
        {step === 6 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-primary-800">{t('reviewListing')}</h2>
            <div className="card p-4 bg-sand-50/50">
              {photos[0] && <img src={photos[coverIndex] || photos[0]} alt="" className="w-full h-40 object-cover rounded-xl mb-3" />}
              <h3 className="font-bold text-primary-800">{title || titleAr || 'Untitled'}</h3>
              <p className="text-lg font-bold text-primary-700">{price ? formatPrice(parseInt(price)) : '--'}</p>
              <p className="text-sm text-primary-400">{lang === 'ar' ? sudanCities.find(c => c.id === city)?.nameAr : sudanCities.find(c => c.id === city)?.name}</p>
              {description && <p className="text-sm text-primary-500 mt-2 line-clamp-3">{description}</p>}
            </div>
            <div className="flex items-center gap-2 p-3 bg-primary-50 rounded-xl text-sm text-primary-600">
              <Info className="w-4 h-4 shrink-0" />
              {lang === 'ar' ? 'سيتم وضع إعلانك قيد المراجعة قبل النشر' : 'Your listing will be placed under review before publishing'}
            </div>
            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(5)} className="btn-secondary text-sm"><ArrowBack className="w-4 h-4" />{t('back')}</button>
              <div className="flex gap-2">
                <button onClick={handleSaveDraft} className="btn-secondary text-sm"><Save className="w-4 h-4" />{t('saveDraft')}</button>
                <button onClick={handleSubmit} className="btn-primary text-sm"><Send className="w-4 h-4" />{t('submitForReview')}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
