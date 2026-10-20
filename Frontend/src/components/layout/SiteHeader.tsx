import { useState, type FormEvent } from 'react';
import { Bell, CheckCheck, Heart, LogOut, Menu, MessageSquare, User, X } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Link, useRouter } from '@/router/Router';
import { categories, sampleNotifications } from '@/data/mockData';
import { BrandLogo } from '@/components/BrandLogo';
import { CitySelect } from '@/components/layout/CitySelect';
import { TopBar } from '@/components/layout/TopBar';
import { CategoryNavBar } from '@/components/layout/CategoryNavBar';
import { buildSearchUrl } from '@/utils/buildSearchUrl';

const actionCls = 'relative flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-primary-950 transition-colors hover:bg-sand-100';

function CountBadge({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span className="absolute -end-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white">
      {n > 9 ? '9+' : n}
    </span>
  );
}

function HeaderSearch() {
  const { t } = useI18n();
  const { navigate } = useRouter();
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate(buildSearchUrl(q, city));
  };

  return (
    <form onSubmit={submit} role="search" className="hidden max-w-3xl flex-1 items-stretch gap-3 md:flex">
      <CitySelect value={city} onChange={setCity} className="w-44 shrink-0 rounded-xl border border-sand-200 bg-white" />
      <div className="flex flex-1 items-stretch overflow-hidden rounded-xl border border-sand-200 bg-white focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('hpSearchHint')}
          aria-label={t('search')}
          className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-primary-400"
        />
        <button type="submit" className="bg-accent-500 px-6 text-sm font-bold text-white transition-colors hover:bg-accent-600">
          {t('hpSearchBtn')}
        </button>
      </div>
    </form>
  );
}

function UserMenu() {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const { navigate } = useRouter();
  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <Link to="/login" className="whitespace-nowrap rounded-lg bg-primary-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-950/90">
        {t('signIn')}
      </Link>
    );
  }

  const go = (to: string) => { navigate(to); setOpen(false); };
  const home = user.accountType === 'business' ? '/business' : '/account';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={user.displayName}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-950 text-white"
      >
        <User className="h-4 w-4" aria-hidden="true" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute end-0 top-full z-50 mt-2 min-w-[210px] rounded-xl border border-sand-100 bg-white p-2 shadow-xl animate-slide-down">
            <div className="mb-2 border-b border-sand-100 px-3 py-2">
              <p className="text-sm font-semibold text-primary-950">{user.displayName}</p>
              <p className="text-xs text-primary-400">{user.email}</p>
            </div>
            <button type="button" onClick={() => go(home)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-primary-800 hover:bg-primary-50">
              <User className="h-4 w-4" aria-hidden="true" />
              {user.accountType === 'business' ? t('business') : t('account')}
            </button>
            <button type="button" onClick={() => go('/account/messages')} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-primary-800 hover:bg-primary-50">
              <MessageSquare className="h-4 w-4" aria-hidden="true" />
              {t('messages')}
            </button>
            <hr className="my-2 border-sand-100" />
            <button
              type="button"
              onClick={() => { logout(); setOpen(false); navigate('/'); }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-error-600 hover:bg-error-50"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {t('logout')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function NotificationsBell() {
  const { lang, t } = useI18n();
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <button type="button" onClick={() => navigate('/login')} aria-label={t('notifications')} className={actionCls}>
        <Bell className="h-5 w-5" aria-hidden="true" />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t('notifications')}
        aria-expanded={open}
        className={actionCls}
      >
        <span className="relative">
          <Bell className="h-5 w-5" aria-hidden="true" />
          <CountBadge n={sampleNotifications.length} />
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute end-0 top-full z-50 mt-2 w-80 rounded-2xl border border-sand-100 bg-white shadow-xl animate-slide-down overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-sand-100 px-4 py-3">
              <p className="font-bold text-sm text-primary-950">{t('notifications')}</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 hover:bg-sand-100 text-primary-400"
                aria-label={t('hpClose')}
              >
                <CheckCheck className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            {/* Notification list */}
            <ul className="max-h-80 overflow-y-auto divide-y divide-sand-50">
              {sampleNotifications.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-primary-400">No notifications</li>
              ) : (
                sampleNotifications.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => { navigate('/account/messages'); setOpen(false); }}
                      className={`w-full text-start px-4 py-3 hover:bg-sand-50 transition-colors ${!n.read ? 'bg-primary-50/40' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!n.read ? 'bg-accent-500' : 'bg-sand-200'}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-primary-900 truncate">
                            {lang === 'ar' ? n.titleAr : n.title}
                          </p>
                          <p className="text-xs text-primary-400 mt-0.5 line-clamp-2">
                            {lang === 'ar' ? n.textAr : n.text}
                          </p>
                        </div>
                      </div>
                    </button>
                  </li>
                ))
              )}
            </ul>
            {/* Footer */}
            <div className="border-t border-sand-100 px-4 py-2.5">
              <button
                type="button"
                onClick={() => { navigate('/account'); setOpen(false); }}
                className="w-full text-center text-xs font-semibold text-primary-600 hover:text-primary-800 transition-colors"
              >
                {t('hpViewAll')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lang, t, toggleLang } = useI18n();
  const { user, logout } = useAuth();
  const { navigate } = useRouter();
  if (!open) return null;

  const go = (to: string) => { navigate(to); onClose(); };
  const rowCls = 'w-full rounded-lg px-3 py-2.5 text-start text-sm text-primary-800 hover:bg-primary-50';

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-primary-950/50" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t('hpMenu')}
        className="absolute inset-y-0 start-0 flex w-72 max-w-[85%] flex-col bg-white shadow-2xl animate-fade-in"
      >
        <div className="flex items-center justify-between border-b border-sand-100 p-4">
          <BrandLogo size="sm" onClick={onClose} />
          <button type="button" onClick={onClose} aria-label={t('hpClose')} className="rounded-lg p-2 hover:bg-sand-100">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {categories.map((c) => (
            <button key={c.id} type="button" onClick={() => go(`/category/${c.id}`)} className={rowCls}>
              {t(c.key)}
            </button>
          ))}
          <button type="button" onClick={() => go('/jobs')} className={rowCls}>{t('jobs')}</button>
        </nav>
        <div className="space-y-2 border-t border-sand-100 p-4">
          <button type="button" onClick={toggleLang} className="w-full rounded-lg border border-sand-200 py-2 text-sm font-medium text-primary-800">
            {lang === 'ar' ? 'English' : 'عربي'}
          </button>
          {user ? (
            <button type="button" onClick={() => { logout(); onClose(); navigate('/'); }} className="w-full rounded-lg bg-error-50 py-2 text-sm font-medium text-error-600">
              {t('logout')}
            </button>
          ) : (
            <div className="flex gap-2">
              <button type="button" onClick={() => go('/login')} className="flex-1 rounded-lg bg-primary-950 py-2 text-sm font-semibold text-white">{t('signIn')}</button>
              <button type="button" onClick={() => go('/register')} className="flex-1 rounded-lg border border-primary-950 py-2 text-sm font-semibold text-primary-950">{t('register')}</button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

export function SiteHeader() {
  const { t } = useI18n();
  const { favorites } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <TopBar />
      <header className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 sm:px-4 lg:gap-5 lg:px-6">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={t('hpMenu')}
            className="-ms-2 rounded-lg p-2 hover:bg-sand-100 xl:hidden"
          >
            <Menu className="h-6 w-6 text-primary-950" aria-hidden="true" />
          </button>

          <BrandLogo />
          <HeaderSearch />

          <div className="ms-auto flex items-center gap-1 md:ms-0">
            <Link to="/account/messages" className={`${actionCls} hidden lg:flex`}>
              <User className="h-5 w-5" aria-hidden="true" />
              <span className="hidden xl:inline">{t('hpMyOffers')}</span>
            </Link>

            <NotificationsBell />

            <Link to="/favorites" className={`${actionCls} hidden lg:flex`}>
              <span className="relative">
                <Heart className="h-5 w-5" aria-hidden="true" />
                <CountBadge n={favorites.length} />
              </span>
              <span className="hidden xl:inline">{t('hpSaved')}</span>
            </Link>

            <div className="ms-1 hidden md:block">
              <UserMenu />
            </div>
          </div>
        </div>
        <CategoryNavBar />
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
