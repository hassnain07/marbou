import { ReactNode } from 'react';
import { Gauge, WifiOff } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { useRouter } from '@/router/Router';
import { Footer } from '@/components/Footer';
import { AuthGateSheet } from '@/components/AuthGateSheet';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { BottomNav } from '@/components/layout/BottomNav';

export function AppShell({ children }: { children: ReactNode }) {
  const { path } = useRouter();
  const { networkState, dataSaver } = useApp();
  const { t } = useI18n();
  const isDashboard = path.startsWith('/business') || path.startsWith('/admin');

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-clip bg-sand-50">
      <SiteHeader />

      {networkState === 'offline' && (
        <div className="flex items-center gap-2 border-b border-error-200 bg-error-50 px-4 py-2 text-sm text-error-700">
          <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{t('offline')}</span>
        </div>
      )}
      {networkState === 'slow' && (
        <div className="flex items-center gap-2 border-b border-warning-200 bg-warning-50 px-4 py-2 text-sm text-warning-700">
          <Gauge className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{t('slowConnection')}</span>
        </div>
      )}
      {dataSaver && (
        <div className="flex items-center gap-2 border-b border-accent-200 bg-accent-50 px-4 py-2 text-sm text-accent-700">
          <Gauge className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{t('dataSaverOn')}</span>
        </div>
      )}

      <main className={`${isDashboard ? 'w-full' : 'mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 lg:px-6'} flex-1 pb-24 md:pb-8`}>
        {children}
      </main>
      {!isDashboard && <Footer />}
      <BottomNav />
      <AuthGateSheet />
    </div>
  );
}
