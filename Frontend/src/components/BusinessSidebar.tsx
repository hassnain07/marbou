import { ReactNode } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useRouter, Link } from '@/router/Router';
import {
  LayoutDashboard, FileText, Wrench, Briefcase, MessageSquare, Store,
  Users, Shield, Star, CreditCard, BarChart3,
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

export const BIZ_TABS = [
  { id: 'overview', icon: LayoutDashboard, key: 'businessOverview' as TranslationKey },
  { id: 'listings', icon: FileText, key: 'listingsManagement' as TranslationKey },
  { id: 'services', icon: Wrench, key: 'servicesManagement' as TranslationKey },
  { id: 'jobs', icon: Briefcase, key: 'jobPosts' as TranslationKey },
  { id: 'messages', icon: MessageSquare, key: 'messagesLeads' as TranslationKey },
  { id: 'profile', icon: Store, key: 'storeProfile' as TranslationKey },
  { id: 'staff', icon: Users, key: 'staffDirectory' as TranslationKey },
  { id: 'verification', icon: Shield, key: 'verification' as TranslationKey },
  { id: 'reviews', icon: Star, key: 'reviewsReplies' as TranslationKey },
  { id: 'plan', icon: CreditCard, key: 'planSubs' as TranslationKey },
  { id: 'analytics', icon: BarChart3, key: 'analytics' as TranslationKey },
];

export function BusinessSidebar({ 
  activeTab, 
  business, 
  sidebarOpen, 
  onCloseSidebar 
}: {
  activeTab: string;
  business: any;
  sidebarOpen: boolean;
  onCloseSidebar: () => void;
}) {
  const { t, lang } = useI18n();
  const { navigate, path } = useRouter();

  // Extract business ID from current path if it exists, otherwise use the business prop ID
  const getBusinessId = () => {
    const pathParts = path.split('/').filter(Boolean);
    // Check if any part starts with 'biz-'
    const bizIdFromPath = pathParts.find(p => p.startsWith('biz-'));
    return bizIdFromPath || business.id;
  };

  const bizId = getBusinessId();

  const SidebarLink = ({ tab }: { tab: typeof BIZ_TABS[0] }) => {
    const Icon = tab.icon;
    return (
      <button
        onClick={() => {
          if (tab.id === 'listings') {
            navigate(`/business/${bizId}/listings`);
          } else if (tab.id === 'services') {
            navigate(`/business/${bizId}/services`);
          } else if (tab.id === 'jobs') {
            navigate(`/business/${bizId}/jobs`);
          } else if (tab.id === 'messages') {
            navigate(`/business/${bizId}/messages`);
          } else if (tab.id === 'profile') {
            navigate(`/business/${bizId}/profile`);
          } else if (tab.id === 'staff') {
            navigate(`/business/${bizId}/staff`);
          } else if (tab.id === 'verification') {
            navigate(`/business/${bizId}/verification`);
          } else if (tab.id === 'reviews') {
            navigate(`/business/${bizId}/reviews`);
          } else if (tab.id === 'plan') {
            navigate(`/business/${bizId}/plan`);
          } else if (tab.id === 'overview') {
            navigate(`/business`);
          } else {
            navigate(`/business/${tab.id}`);
          }
          onCloseSidebar();
        }}
        className={`nav-link w-full ${activeTab === tab.id ? 'nav-link-active' : ''}`}
      >
        <Icon className="w-4 h-4" />{t(tab.key)}
      </button>
    );
  };

  return (
    <aside 
      className={`fixed md:sticky top-0 inset-y-0 start-0 z-40 w-60 bg-white border-e border-sand-100 transition-transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'}`} 
      style={{ height: '100vh' }}
    >
      <div className="p-4 border-b border-sand-100">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-5 h-5">
              <path d="M28 70 L28 30 L50 30 L50 70" stroke="#fdfbf7" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="72" cy="50" r="14" stroke="#f97e16" strokeWidth="6" fill="none" />
              <circle cx="72" cy="50" r="4" fill="#fdfbf7" />
            </svg>
          </div>
          <span className="font-bold text-primary-700">{t('brandName')}</span>
        </Link>
      </div>
      <div className="p-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
        <div className="flex items-center gap-2 p-2 mb-2 bg-sand-50 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-sand-100 overflow-hidden">
            <img src={business.logo} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-primary-700 truncate">{lang === 'ar' ? business.nameAr : business.name}</p>
            <p className="text-[10px] text-primary-400">{t('demoLabel')}</p>
          </div>
        </div>
        <div className="space-y-1">
          {BIZ_TABS.map((tab) => <SidebarLink key={tab.id} tab={tab} />)}
        </div>
      </div>
    </aside>
  );
}
