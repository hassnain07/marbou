import { Globe, ShieldCheck } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { useRouter } from '@/router/Router';

export function TopBar() {
  const { lang, setLang, t } = useI18n();
  const { navigate } = useRouter();

  const langButton = (code: 'en' | 'ar', label: string) => (
    <button
      type="button"
      onClick={() => setLang(code)}
      aria-pressed={lang === code}
      className={lang === code ? 'font-bold text-white' : 'text-white/70 hover:text-white'}
    >
      {label}
    </button>
  );

  return (
    <div className="hidden bg-primary-950 text-xs text-white md:block">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 lg:px-6">
        <span>{t('hpTopTagline')}</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5" aria-hidden="true" />
            {langButton('en', 'English')}
            <span className="text-white/40" aria-hidden="true">|</span>
            {langButton('ar', 'عربي')}
          </span>
          <button
            type="button"
            onClick={() => navigate('/business')}
            className="flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1 font-semibold transition-colors hover:bg-white/20"
          >
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            {t('hpMerchantPortal')}
          </button>
        </div>
      </div>
    </div>
  );
}
