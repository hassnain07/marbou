import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useRouter, Link } from '@/router/Router';
import { EmptyState, ComingSoon } from '@/components/ui';
import { Search, ChevronLeft, ChevronRight, HelpCircle, FileText, Shield, Bell } from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

const HELP_PAGES = [
  { id: 'helpCenter', icon: HelpCircle },
  { id: 'faq', icon: HelpCircle },
  { id: 'listingGuidance', icon: FileText },
  { id: 'paymentGuidance', icon: FileText },
  { id: 'accountHelp', icon: HelpCircle },
  { id: 'jobsHelp', icon: HelpCircle },
  { id: 'servicesHelp', icon: HelpCircle },
  { id: 'safetyTipsPage', icon: Shield },
  { id: 'reporting', icon: Shield },
  { id: 'terms', icon: FileText },
  { id: 'privacy', icon: FileText },
  { id: 'acceptableUse', icon: FileText },
  { id: 'prohibitedContent', icon: FileText },
  { id: 'listingRules', icon: FileText },
  { id: 'businessVerificationPolicy', icon: Shield },
  { id: 'paymentTerms', icon: FileText },
  { id: 'refunds', icon: FileText },
  { id: 'dataRetention', icon: FileText },
  { id: 'locationPrivacy', icon: Shield },
];

export function HelpPage() {
  const { t, lang } = useI18n();
  const { path, navigate } = useRouter();
  const [search, setSearch] = useState('');

  const pageId = path.split('/')[2];
  const page = HELP_PAGES.find((p) => p.id === pageId);

  if (page) {
    const Icon = page.icon;
    return (
      <div className="py-4 max-w-3xl mx-auto">
        <div className="flex items-center gap-1.5 text-sm text-primary-400 mb-4">
          <button onClick={() => navigate('/help')} className="hover:text-primary-600">{t('helpCenter')}</button>
          <span className="text-sand-300">/</span>
          <span className="text-primary-600 font-medium">{t(page.id as TranslationKey)}</span>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary-600" />
            </div>
            <h1 className="text-xl font-bold text-primary-800">{t(page.id as TranslationKey)}</h1>
          </div>
          <div className="prose prose-sm max-w-none text-primary-600 space-y-3">
            <p>
              {lang === 'ar'
                ? 'هذه صفحة تجريبية ضمن النموذج التفاعلي لمَربو. المحتوى الكامل سيتم إضافته في النسخة الإنتاجية.'
                : 'This is a sample page within the MARBOU interactive prototype. Full content will be added in the production version.'}
            </p>
            <h3 className="font-bold text-primary-700">
              {lang === 'ar' ? 'القسم الأول' : 'Section 1'}
            </h3>
            <p>
              {lang === 'ar'
                ? 'هذا نص تجريبي يوضح تخطيط الصفحة. سيتم استبداله بمحتوى حقيقي في النسخة النهائية.'
                : 'This is sample text demonstrating the page layout. It will be replaced with real content in the final version.'}
            </p>
            <h3 className="font-bold text-primary-700">
              {lang === 'ar' ? 'القسم الثاني' : 'Section 2'}
            </h3>
            <ul className="list-disc ps-6 space-y-1">
              <li>{lang === 'ar' ? 'نقطة أولى' : 'First point'}</li>
              <li>{lang === 'ar' ? 'نقطة ثانية' : 'Second point'}</li>
              <li>{lang === 'ar' ? 'نقطة ثالثة' : 'Third point'}</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const filtered = search
    ? HELP_PAGES.filter((p) => t(p.id as TranslationKey).toLowerCase().includes(search.toLowerCase()))
    : HELP_PAGES;

  return (
    <div className="py-4 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-primary-800 mb-4 flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-primary-500" />{t('helpCenter')}
      </h1>
      <div className="relative mb-4">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="input ps-10"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {filtered.map((p) => {
          const Icon = p.icon;
          return (
            <Link key={p.id} to={`/help/${p.id}`} className="card p-4 flex items-center gap-3 hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                <Icon className="w-5 h-5 text-primary-600" />
              </div>
              <span className="text-sm font-medium text-primary-700 group-hover:text-primary-600">{t(p.id as TranslationKey)}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function ComingSoonPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="py-4 max-w-2xl mx-auto">
      <ComingSoon title={title} description={description} />
    </div>
  );
}
