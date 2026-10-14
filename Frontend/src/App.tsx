import { RouterProvider, useRouter } from '@/router/Router';
import { I18nProvider } from '@/i18n/I18nContext';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { AppShell } from '@/components/AppShell';
import { Toast } from '@/components/ui';
import { HomePage } from '@/pages/HomePage';
import { SearchPage, CategoryPage } from '@/pages/SearchPage';
import { ListingDetailPage } from '@/pages/ListingDetailPage';
import { AddListingPage } from '@/pages/AddListingPage';
import { FavoritesPage, ComparePage, MessagesPage } from '@/pages/FavoritesCompareMessages';
import { AccountPage } from '@/pages/AccountPage';
import { JobsPage, JobDetailPage, BusinessProfilePage } from '@/pages/JobsServicesBusiness';
import { BusinessDashboard } from '@/pages/BusinessDashboard';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { SellerProfilePage } from '@/pages/SellerProfilePage';
import { RegisterPage, LoginPage } from '@/pages/AuthPages';
import { HelpPage, ComingSoonPage } from '@/pages/HelpPage';
import { useI18n } from '@/i18n/I18nContext';

function Routes() {
  const { path } = useRouter();
  const { t } = useI18n();

  const parts = path.split('?')[0].split('/').filter(Boolean);
  const root = parts[0] || '';
  const isDashboard = root === 'business' || root === 'admin';
  const isAuth = root === 'register' || root === 'login';

  const renderPage = () => {
    if (!root || root === 'home') return <HomePage />;

    if (root === 'search') return <SearchPage />;
    if (root === 'category') return <CategoryPage />;
    if (root === 'listing') return <ListingDetailPage />;
    if (root === 'add-listing') return <AddListingPage />;
    if (root === 'favorites') return <FavoritesPage />;
    if (root === 'compare') return <ComparePage />;
    if (root === 'messages') return <MessagesPage />;
    if (root === 'account') return <AccountPage />;
    if (root === 'jobs') {
      if (parts[1]) return <JobDetailPage />;
      return <JobsPage />;
    }
    if (root === 'business' && parts[1] && parts[1].startsWith('biz-')) return <BusinessProfilePage />;
    if (root === 'business') return <BusinessDashboard />;
    if (root === 'admin') return <AdminDashboard />;
    if (root === 'register') return <RegisterPage />;
    if (root === 'login') return <LoginPage />;
    if (root === 'seller') return <SellerProfilePage />;
    if (root === 'help') return <HelpPage />;

    // Coming soon pages
    if (root === 'auctions') return <ComingSoonPage title={t('auctionsComingSoon')} description={t('comingLaterDesc')} />;
    if (root === 'barter') return <ComingSoonPage title={t('barterComingSoon')} description={t('comingLaterDesc')} />;
    if (root === 'cart') return <ComingSoonPage title={t('cartOrdersComingSoon')} description={t('comingLaterDesc')} />;
    if (root === 'delivery') return <ComingSoonPage title={t('deliveryComingSoon')} description={t('comingLaterDesc')} />;
    if (root === 'booking') return <ComingSoonPage title={t('bookingComingSoon')} description={t('comingLaterDesc')} />;

    return <HomePage />;
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
