import { useI18n } from '@/i18n/I18nContext';
import { useRouter } from '@/router/Router';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

export function Footer() {
  const { t, lang, toggleLang } = useI18n();
  const { navigate } = useRouter();

  const footerLinks = [
    { key: 'termsOfService', href: '/help/terms' },
    { key: 'privacyPolicy', href: '/help/privacy' },
    { key: 'helpCenter', href: '/help' },
    { key: 'aboutUs', href: '/help/about' },
    { key: 'contactUs', href: '/help/contact' },
  ];

  const socialIcons = [
    { icon: Facebook, label: 'Facebook', href: 'https://facebook.com' },
    { icon: Twitter, label: 'Twitter', href: 'https://twitter.com' },
    { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
    { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com' },
  ];

  return (
    <footer className="bg-[#214E3D] text-white border-t border-primary-700 mt-8 sm:mt-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
          {/* Brand */}
          <div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-5 h-5">
                  <path
                    d="M28 70 L28 30 L50 30 L50 70"
                    stroke="#fdfbf7"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="72" cy="50" r="14" stroke="#f97e16" strokeWidth="6" fill="none" />
                  <circle cx="72" cy="50" r="4" fill="#fdfbf7" />
                </svg>
              </div>
              <span className="text-lg font-extrabold tracking-tight">{t('brandName')}</span>
            </button>
            <p className="text-sm text-primary-200">
              {lang === 'ar'
                ? 'منصة موثوقة للبيع والشراء في السودان'
                : 'A trusted platform for buying and selling in Sudan'}
            </p>
          </div>

          {/* Footer Links Section 1 */}
          <div className="sm:col-span-1">
            <h3 className="font-bold text-white mb-3">{lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}</h3>
            <ul className="space-y-2">
              {footerLinks.slice(0, 3).map((link) => (
                <li key={link.key}>
                  <button
                    onClick={() => navigate(link.href)}
                    className="text-sm text-primary-200 hover:text-white transition-colors"
                  >
                    {t(link.key as TranslationKey)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer Links Section 2 */}
          <div className="sm:col-span-1">
            <h3 className="font-bold text-white mb-3">{lang === 'ar' ? 'الشركة' : 'Company'}</h3>
            <ul className="space-y-2">
              {footerLinks.slice(3).map((link) => (
                <li key={link.key}>
                  <button
                    onClick={() => navigate(link.href)}
                    className="text-sm text-primary-200 hover:text-white transition-colors"
                  >
                    {t(link.key as TranslationKey)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Language */}
          <div>
            <h3 className="font-bold text-white mb-3">{lang === 'ar' ? 'تابعنا' : 'Follow Us'}</h3>
            <div className="flex items-center gap-2 mb-4">
              {socialIcons.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-primary-700 hover:bg-primary-600 transition-colors flex items-center justify-center"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
            <button
              onClick={toggleLang}
              className="text-xs bg-primary-700 hover:bg-primary-600 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              {lang === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-primary-700 my-6 sm:my-8" />

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-primary-200">
          <p>© 2024 {t('brandName')}. {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
          <p>
            {lang === 'ar'
              ? 'صنع بـ ❤️ في السودان'
              : 'Made with ❤️ in Sudan'}
          </p>
        </div>
      </div>
    </footer>
  );
}
