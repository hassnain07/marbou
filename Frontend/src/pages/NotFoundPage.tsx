import { useI18n } from '@/i18n/I18nContext';
import { useRouter, Link } from '@/router/Router';
import { EmptyState } from '@/components/ui';
import { Home, Search } from 'lucide-react';

export function NotFoundPage() {
  const { t } = useI18n();
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-7xl font-bold text-primary-200 mb-4">404</div>
          <h1 className="text-2xl font-bold text-primary-800 mb-2">{t('pageNotFound')}</h1>
          <p className="text-primary-600">{t('pageNotFoundDesc')}</p>
        </div>
        
        <div className="flex flex-col gap-3">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            {t('backHome')}
          </Link>
          <Link
            to="/search"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-sand-100 text-primary-600 rounded-lg font-medium hover:bg-sand-200 transition-colors"
          >
            <Search className="w-5 h-5" />
            {t('browseListings')}
          </Link>
        </div>
      </div>
    </div>
  );
}
