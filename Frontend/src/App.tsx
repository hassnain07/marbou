import { RouterProvider, useRouter } from '@/router/Router';
import { I18nProvider } from '@/i18n/I18nContext';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { AppShell } from '@/components/AppShell';
import { Toast, Skeleton } from '@/components/ui';
import { Suspense, lazy } from 'react';
import { SearchPage, CategoryPage } from '@/pages/SearchPage';
import { useI18n } from '@/i18n/I18nContext';

const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })));
const ListingDetailPage = lazy(() => import('@/pages/ListingDetailPage').then((m) => ({ default: m.ListingDetailPage })));
const AddListingPage = lazy(() => import('@/pages/AddListingPage').then((m) => ({ default: m.AddListingPage })));
const FavoritesPage = lazy(() => import('@/pages/FavoritesCompareMessages').then((m) => ({ default: m.FavoritesPage })));
const ComparePage = lazy(() => import('@/pages/FavoritesCompareMessages').then((m) => ({ default: m.ComparePage })));
const MessagesPage = lazy(() => import('@/pages/FavoritesCompareMessages').then((m) => ({ default: m.MessagesPage })));
const AccountPage = lazy(() => import('@/pages/AccountPage').then((m) => ({ default: m.AccountPage })));
const JobsPage = lazy(() => import('@/pages/JobsServicesBusiness').then((m) => ({ default: m.JobsPage })));
const JobDetailPage = lazy(() => import('@/pages/JobsServicesBusiness').then((m) => ({ default: m.JobDetailPage })));
const BusinessProfilePage = lazy(() => import('@/pages/JobsServicesBusiness').then((m) => ({ default: m.BusinessProfilePage })));
const BusinessDashboard = lazy(() => import('@/pages/BusinessDashboard').then((m) => ({ default: m.BusinessDashboard })));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const SellerProfilePage = lazy(() => import('@/pages/SellerProfilePage').then((m) => ({ default: m.SellerProfilePage })));
const RegisterPage = lazy(() => import('@/pages/AuthPages').then((m) => ({ default: m.RegisterPage })));
const LoginPage = lazy(() => import('@/pages/AuthPages').then((m) => ({ default: m.LoginPage })));
const HelpPage = lazy(() => import('@/pages/HelpPage').then((m) => ({ default: m.HelpPage })));
const ComingSoonPage = lazy(() => import('@/pages/HelpPage').then((m) => ({ default: m.ComingSoonPage })));

// Fallback skeleton for generic page loading
function LoadingSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-12 w-full rounded-xl" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// Fallback skeleton for HomePage loading
function HomePageSkeleton() {
  return (
    <div className="space-y-8 py-4">
      {/* Hero skeleton */}
      <div className="rounded-2xl bg-sand-100 p-6 sm:p-10">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
      {/* Categories skeleton */}
      <div>
        <Skeleton className="h-6 w-1/3 mb-4" />
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
      {/* Featured listings skeleton */}
      <div>
        <Skeleton className="h-6 w-1/3 mb-4" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-48 h-48 rounded-xl shrink-0" />
          ))}
        </div>
      </div>
    </div>
  );
}

function Routes() {
  const { path } = useRouter();
  const { t } = useI18n();

  const parts = path.split('?')[0].split('/').filter(Boolean);
  const root = parts[0] || '';
  const isDashboard = root === 'business' || root === 'admin';
  const isAuth = root === 'register' || root === 'login';

  const renderPage = () => {
    if (!root || root === 'home') return <Suspense fallback={<HomePageSkeleton />}><HomePage /></Suspense>;

    if (root === 'search') return <SearchPage />;
    if (root === 'category') return <CategoryPage />;
    if (root === 'listing') return <Suspense fallback={<LoadingSkeleton />}><ListingDetailPage /></Suspense>;
    if (root === 'add-listing') return <Suspense fallback={<LoadingSkeleton />}><AddListingPage /></Suspense>;
    if (root === 'favorites') return <Suspense fallback={<LoadingSkeleton />}><FavoritesPage /></Suspense>;
    if (root === 'compare') return <Suspense fallback={<LoadingSkeleton />}><ComparePage /></Suspense>;
    if (root === 'messages') return <Suspense fallback={<LoadingSkeleton />}><MessagesPage /></Suspense>;
    if (root === 'account') return <Suspense fallback={<LoadingSkeleton />}><AccountPage /></Suspense>;
    if (root === 'jobs') {
      if (parts[1]) return <Suspense fallback={<LoadingSkeleton />}><JobDetailPage /></Suspense>;
      return <Suspense fallback={<LoadingSkeleton />}><JobsPage /></Suspense>;
    }
    if (root === 'business' && parts[1] && parts[1].startsWith('biz-')) return <Suspense fallback={<LoadingSkeleton />}><BusinessProfilePage /></Suspense>;
    if (root === 'business') return <Suspense fallback={<LoadingSkeleton />}><BusinessDashboard /></Suspense>;
    if (root === 'admin') return <Suspense fallback={<LoadingSkeleton />}><AdminDashboard /></Suspense>;
    if (root === 'register') return <Suspense fallback={<LoadingSkeleton />}><RegisterPage /></Suspense>;
    if (root === 'login') return <Suspense fallback={<LoadingSkeleton />}><LoginPage /></Suspense>;
    if (root === 'seller') return <Suspense fallback={<LoadingSkeleton />}><SellerProfilePage /></Suspense>;
    if (root === 'help') return <Suspense fallback={<LoadingSkeleton />}><HelpPage /></Suspense>;

    // Coming soon pages
    if (root === 'auctions') return <Suspense fallback={<LoadingSkeleton />}><ComingSoonPage title={t('auctionsComingSoon')} description={t('comingLaterDesc')} /></Suspense>;
    if (root === 'barter') return <Suspense fallback={<LoadingSkeleton />}><ComingSoonPage title={t('barterComingSoon')} description={t('comingLaterDesc')} /></Suspense>;
    if (root === 'cart') return <Suspense fallback={<LoadingSkeleton />}><ComingSoonPage title={t('cartOrdersComingSoon')} description={t('comingLaterDesc')} /></Suspense>;
    if (root === 'delivery') return <Suspense fallback={<LoadingSkeleton />}><ComingSoonPage title={t('deliveryComingSoon')} description={t('comingLaterDesc')} /></Suspense>;
    if (root === 'booking') return <Suspense fallback={<LoadingSkeleton />}><ComingSoonPage title={t('bookingComingSoon')} description={t('comingLaterDesc')} /></Suspense>;

    return <Suspense fallback={<HomePageSkeleton />}><HomePage /></Suspense>;
  };

  if (isDashboard || isAuth) {
    return (
      <>
        {renderPage()}
        <Toast />
      </>
    );
  }

  return (
    <AppShell>
      {renderPage()}
      <Toast />
    </AppShell>
  );
}

function App() {
  return (
    <I18nProvider>
      <AppProvider>
        <AuthProvider>
          <RouterProvider>
            <Routes />
          </RouterProvider>
        </AuthProvider>
      </AppProvider>
    </I18nProvider>
  );
}

export default App;
