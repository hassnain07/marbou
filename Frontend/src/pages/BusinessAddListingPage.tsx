import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useRouter } from '@/router/Router';
import { businesses } from '@/data/mockData';
import { BusinessSidebar } from '@/components/BusinessSidebar';
import { AddListingPage } from './AddListingPage';
import {
  LayoutDashboard,
} from 'lucide-react';

export function BusinessAddListingPage() {
  const { t, lang } = useI18n();
  const { path, navigate } = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get business from URL
  const bizId = path.split('/')[2];
  const biz = bizId ? businesses.find((b) => b.id === bizId) : businesses[0];

  if (!biz) {
    return (
      <div className="py-4 max-w-6xl mx-auto">
        <p>{t('noResults')}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <BusinessSidebar 
        activeTab="listings" 
        business={biz} 
        sidebarOpen={sidebarOpen} 
        onCloseSidebar={() => setSidebarOpen(false)} 
      />

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-primary-950/30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-sand-100 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-sand-50">
            <LayoutDashboard className="w-5 h-5 text-primary-600" />
          </button>
          <span className="font-bold text-primary-700">{t('addListing')}</span>
        </div>

        <div className="p-4 sm:p-6">
          <AddListingPage />
        </div>
      </div>
    </div>
  );
}
