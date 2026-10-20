import { Compass, Home, MessageCircle, Plus, User } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/router/Router';

export function BottomNav() {
  const { t } = useI18n();
  const { path, navigate } = useRouter();
  const { compareList } = useApp();
  const { user } = useAuth();

  const profileRoute = user?.accountType === 'business' ? '/business' : '/account';

  const items = [
    { to: '/', icon: Home, label: t('home'), active: path === '/' },
    { to: '/search', icon: Compass, label: t('hpExplore'), active: path.startsWith('/search') || path.startsWith('/category') },
    { to: '/add-listing', icon: Plus, label: t('hpSell'), active: path === '/add-listing', center: true },
    { to: '/account/messages', icon: MessageCircle, label: t('hpChat'), active: path.startsWith('/account/messages') },
    {
      to: profileRoute,
      icon: User,
      label: t('hpProfile'),
      active: (path.startsWith('/account') && !path.startsWith('/account/messages')) || path.startsWith('/business'),
    },
  ];

  return (
    <nav className="safe-area-inset-bottom fixed inset-x-0 bottom-0 z-40 border-t border-sand-100 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.06)] md:hidden">
      {compareList.length > 0 && (
        <div className="flex items-center justify-between border-b border-primary-800 bg-primary-950 px-4 py-2 text-white">
          <span className="text-sm">{compareList.length} {t('compare')}</span>
          <button type="button" onClick={() => navigate('/compare')} className="text-sm font-bold underline">
            {t('compareListings')}
          </button>
        </div>
      )}
      <div className="pb-safe flex h-16 items-center justify-around px-1">
        {items.map(({ to, icon: Icon, label, active, center }) => (
          <button
            key={to}
            type="button"
            onClick={() => navigate(to)}
            aria-current={active ? 'page' : undefined}
            className={`flex h-full flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
              center ? 'text-accent-600' : active ? 'text-primary-950' : 'text-primary-400'
            }`}
          >
            {center ? (
              <span className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-accent-500 text-white shadow-lg ring-4 ring-white">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
            ) : (
              <Icon className="h-5 w-5" aria-hidden="true" />
            )}
            <span className="text-[10px] font-semibold">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
