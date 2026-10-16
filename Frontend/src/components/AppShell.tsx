import { useState, ReactNode } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Link, useRouter } from '@/router/Router';
import { categories, sudanCities } from '@/data/mockData';
import { Footer } from '@/components/Footer';
import { AuthGateSheet } from '@/components/AuthGateSheet';
import {
  Search, MapPin, Bell, MessageSquare, User, Plus, Home, Menu, X,
  Globe, ChevronDown, Store, Shield, ShoppingBag, Settings, Wifi, WifiOff, Gauge, LogOut,
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

function Logo() {
  const { t } = useI18n();
  return (
    <Link to="/" className="flex items-center gap-2 shrink-0">
      <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-sm">
        <svg viewBox="0 0 100 100" className="w-6 h-6">
          <path d="M28 70 L28 30 L50 30 L50 70" stroke="#fdfbf7" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="72" cy="50" r="14" stroke="#f97e16" strokeWidth="6" fill="none" />
          <circle cx="72" cy="50" r="4" fill="#fdfbf7" />
        </svg>
      </div>
      <span className="text-xl font-extrabold text-primary-700 tracking-tight hidden sm:block">{t('brandName')}</span>
    </Link>
  );
}

function LocationSelector({ compact = false }: { compact?: boolean }) {
  const { lang, t } = useI18n();
  const { location, setLocation } = useApp();
  const [open, setOpen] = useState(false);
  const city = sudanCities.find((c) => c.id === location.cityId);
  const area = city?.areas.find((a) => a.id === location.areaId);
  const label = lang === 'ar'
    ? `${city?.nameAr || ''}${area ? ' - ' + area.nameAr : ''}`
    : `${city?.name || ''}${area ? ' - ' + area.name : ''}`;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800 font-medium px-3 py-2 rounded-lg hover:bg-primary-50 transition-colors whitespace-nowrap"
      >
        <MapPin className="w-4 h-4 text-primary-400 shrink-0" />
        <span className="hidden sm:inline max-w-[120px] truncate">{label}</span>
        <ChevronDown className="w-4 h-4 text-primary-300 shrink-0" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 start-0 bg-white rounded-xl shadow-xl border border-sand-100 z-50 p-3 min-w-[240px] max-h-[320px] overflow-y-auto animate-slide-down">
            {sudanCities.map((c) => (
              <div key={c.id} className="mb-2">
                <p className="text-xs font-bold text-primary-400 px-2 py-1">{lang === 'ar' ? c.nameAr : c.name}</p>
                {c.areas.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => { setLocation({ cityId: c.id, areaId: a.id }); setOpen(false); }}
                    className={`w-full text-start px-3 py-1.5 rounded-lg text-sm hover:bg-primary-50 transition-colors ${location.cityId === c.id && location.areaId === a.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-primary-600'}`}
                  >
                    {lang === 'ar' ? a.nameAr : a.name}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function LangSwitch() {
  const { lang, toggleLang } = useI18n();
  return (
    <button
      onClick={toggleLang}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors"
    >
      <Globe className="w-4 h-4" />
      {lang === 'ar' ? 'EN' : 'ع'}
    </button>
  );
}

function UserMenu() {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const { navigate } = useRouter();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
          <User className="w-4 h-4 text-primary-600" />
        </div>
        <span className="hidden sm:inline max-w-[120px] truncate">{user.displayName}</span>
        <ChevronDown className="w-4 h-4 text-primary-300 shrink-0" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 end-0 bg-white rounded-xl shadow-xl border border-sand-100 z-50 p-2 min-w-[200px] animate-slide-down">
            <div className="px-3 py-2 border-b border-sand-100 mb-2">
              <p className="font-medium text-primary-700 text-sm">{user.displayName}</p>
              <p className="text-xs text-primary-400">{user.email}</p>
            </div>
            <button
              onClick={() => { navigate('/account'); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-primary-600 hover:bg-primary-50 transition-colors"
            >
              <User className="w-4 h-4" />
              {t('account')}
            </button>
            <button
              onClick={() => { navigate('/messages'); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-primary-600 hover:bg-primary-50 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              {t('messages')}
            </button>
            <button
              onClick={() => { navigate('/account/settings'); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-primary-600 hover:bg-primary-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              {t('settings')}
            </button>
            <hr className="my-2 border-sand-100" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-error-600 hover:bg-error-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function DemoRoleSwitcher() {
  const { t } = useI18n();
  const { demoRole, setDemoRole } = useApp();
  const [open, setOpen] = useState(false);
  const { navigate } = useRouter();

  const roles: { id: 'buyer' | 'business' | 'admin'; label: string; icon: ReactNode; path: string }[] = [
    { id: 'buyer', label: t('buyerSeller'), icon: <User className="w-4 h-4" />, path: '/account' },
    { id: 'business', label: t('business'), icon: <Store className="w-4 h-4" />, path: '/business' },
    { id: 'admin', label: t('admin'), icon: <Shield className="w-4 h-4" />, path: '/admin' },
  ];

  const current = roles.find((r) => r.id === demoRole) || roles[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-sand-100 text-primary-600 hover:bg-sand-200 transition-colors"
      >
        {current.icon}
        <span className="hidden sm:inline">{current.label}</span>
        <span className="badge bg-accent-100 text-accent-700 text-[10px]">{t('demoLabel')}</span>
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 end-0 bg-white rounded-xl shadow-xl border border-sand-100 z-50 p-2 min-w-[200px] animate-slide-down">
            <p className="text-xs text-primary-400 px-3 py-1 font-medium">{t('switchDemoView')}</p>
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => { setDemoRole(r.id); navigate(r.path); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-primary-50 transition-colors ${demoRole === r.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-primary-600'}`}
              >
                {r.icon}
                {r.label}
                {demoRole === r.id && <span className="badge bg-primary-100 text-primary-700 ms-auto text-[10px]">{t('activeRole')}</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function NetworkStatusControl() {
  const { t } = useI18n();
  const { networkState, setNetworkState, dataSaver, setDataSaver } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 p-1.5 rounded-lg text-primary-500 hover:bg-primary-50 transition-colors"
        title={t('networkStatus')}
      >
        {networkState === 'connected' ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 end-0 bg-white rounded-xl shadow-xl border border-sand-100 z-50 p-3 min-w-[220px] animate-slide-down">
            <p className="text-xs font-bold text-primary-400 mb-2">{t('networkStatus')}</p>
            {(['connected', 'slow', 'offline'] as const).map((s) => (
              <button
                key={s}
                onClick={() => { setNetworkState(s); }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm hover:bg-primary-50 ${networkState === s ? 'bg-primary-50 text-primary-700 font-medium' : 'text-primary-600'}`}
              >
                {s === 'connected' && <Wifi className="w-3.5 h-3.5" />}
                {s === 'slow' && <Gauge className="w-3.5 h-3.5" />}
                {s === 'offline' && <WifiOff className="w-3.5 h-3.5" />}
                {t(s as TranslationKey)}
              </button>
            ))}
            <hr className="my-2 border-sand-100" />
            <label className="flex items-center justify-between px-3 py-1.5 text-sm text-primary-600 cursor-pointer">
              <span className="flex items-center gap-2"><Gauge className="w-3.5 h-3.5" />{t('dataSaver')}</span>
              <button
                onClick={(e) => { e.preventDefault(); setDataSaver(!dataSaver); }}
                className={`w-10 h-5 rounded-full transition-colors ${dataSaver ? 'bg-primary-500' : 'bg-sand-200'}`}
              >
                <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform ${dataSaver ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0.5 rtl:-translate-x-0.5'}`} />
              </button>
            </label>
          </div>
        </>
      )}
    </div>
  );
}

function CategoryMenu() {
  const { lang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const { navigate } = useRouter();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors"
      >
        <Menu className="w-4 h-4" />
        <span className="hidden lg:inline">{t('categories')}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 start-0 bg-white rounded-xl shadow-xl border border-sand-100 z-50 p-3 min-w-[280px] max-h-[400px] overflow-y-auto animate-slide-down">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { navigate(`/category/${cat.id}`); setOpen(false); }}
                className="w-full text-start px-3 py-2 rounded-lg text-sm text-primary-600 hover:bg-primary-50 transition-colors flex items-center justify-between"
              >
                <span>{lang === 'ar' ? t(cat.key) : t(cat.key)}</span>
                <ChevronDown className="w-3 h-3 -rotate-90 text-primary-300" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function Header() {
  const { t } = useI18n();
  const { navigate } = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-sand-100 shadow-sm w-full">
      <div className="w-full px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-4">
          {/* Left: Logo */}
          <div className="shrink-0">
            <Logo />
          </div>
          
          {/* Center: Search bar - desktop only */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-6">
            <form
              onSubmit={(e) => { e.preventDefault(); navigate(`/search?q=${encodeURIComponent(searchQuery)}`); }}
              className="w-full"
            >
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="input ps-10 pe-4 py-2.5 text-sm w-full"
                />
              </div>
            </form>
          </div>
          
          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Search icon on mobile/tablet */}
            <button
              onClick={() => navigate('/search')}
              className="lg:hidden p-2 rounded-lg text-primary-500 hover:bg-primary-50 transition-colors"
              aria-label={t('search')}
            >
              <Search className="w-5 h-5" />
            </button>
            
            {/* Location - md and up */}
            <div className="hidden md:block">
              <LocationSelector compact />
            </div>
            
            {/* Notifications - sm and up */}
            <Link to="/account/notifications" className="hidden sm:flex p-2 rounded-lg text-primary-500 hover:bg-primary-50 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 end-1 w-2 h-2 bg-error-500 rounded-full" />
            </Link>
            
            {/* Language switch */}
            <div className="hidden md:block">
              <LangSwitch />
            </div>
            
            {/* User menu or Auth buttons */}
            {user ? (
              <div className="hidden sm:block">
                <UserMenu />
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => navigate('/auth/login')}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/auth/register')}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
            
            {/* Demo role - lg and up, dev only */}
            {import.meta.env.DEV && (
              <div className="hidden lg:block">
                <DemoRoleSwitcher />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const { t } = useI18n();
  const { path, navigate } = useRouter();
  const { compareList } = useApp();

  const items = [
    { to: '/', icon: <Home className="w-5 h-5" />, label: t('home'), active: path === '/' },
    { to: '/search', icon: <Search className="w-5 h-5" />, label: t('search'), active: path.startsWith('/search') || path.startsWith('/category') },
    { to: '/add-listing', icon: <Plus className="w-6 h-6" />, label: t('addListing'), active: path === '/add-listing', center: true },
    { to: '/messages', icon: <MessageSquare className="w-5 h-5" />, label: t('messages'), active: path.startsWith('/messages') },
    { to: '/account', icon: <User className="w-5 h-5" />, label: t('account'), active: path.startsWith('/account') || path.startsWith('/business') || path.startsWith('/admin') },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-sand-100 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] safe-area-inset-bottom">
      {compareList.length > 0 && (
        <div className="bg-primary-700 text-white px-4 py-2 flex items-center justify-between shadow-sm border-b border-primary-800">
          <span className="text-sm">{compareList.length} {t('compare')}</span>
          <button onClick={() => navigate('/compare')} className="text-sm font-bold underline">{t('compareListings')}</button>
        </div>
      )}
      <div className="flex items-center justify-around h-16 px-1 pb-safe">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => navigate(item.to)}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${item.active ? 'text-primary-700' : 'text-primary-400'}`}
          >
            {item.center ? (
              <div className="w-12 h-12 rounded-full bg-primary-700 text-white flex items-center justify-center shadow-lg -mt-6 transition-all hover:shadow-xl hover:scale-110">
                {item.icon}
              </div>
            ) : (
              <>
                <div className="relative">
                  {item.icon}
                  {item.to === '/messages' && <span className="absolute -top-1 -end-1 w-2 h-2 bg-accent-500 rounded-full" />}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { path } = useRouter();
  const { networkState, dataSaver } = useApp();
  const { t } = useI18n();
  const isDashboard = path.startsWith('/business') || path.startsWith('/admin');

  return (
    <div className="min-h-screen bg-sand-50 flex flex-col w-full overflow-x-hidden">
      <Header />
      
      {/* Network and Data Saver Banners */}
      {networkState === 'offline' && (
        <div className="bg-error-50 border-b border-error-200 px-4 py-2 text-sm text-error-700 flex items-center gap-2">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>{t('offline')}</span>
        </div>
      )}
      
      {networkState === 'slow' && (
        <div className="bg-warning-50 border-b border-warning-200 px-4 py-2 text-sm text-warning-700 flex items-center gap-2">
          <Gauge className="w-4 h-4 shrink-0" />
          <span>{t('slowConnection')}</span>
        </div>
      )}
      
      {dataSaver && (
        <div className="bg-accent-50 border-b border-accent-200 px-4 py-2 text-sm text-accent-700 flex items-center gap-2">
          <Gauge className="w-4 h-4 shrink-0" />
          <span>{t('dataSaverOn')}</span>
        </div>
      )}
      
      <main className={`${isDashboard ? 'w-full' : 'max-w-7xl mx-auto w-full px-3 sm:px-4 lg:px-6 py-4'} pb-20 md:pb-8 flex-1`}>
        {children}
      </main>
      {!isDashboard && <Footer />}
      <BottomNav />
      <AuthGateSheet />
    </div>
  );
}
