import { ReactNode, useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useRouter, Link } from '@/router/Router';
import { Menu, X } from 'lucide-react';
import {
  LayoutDashboard, FileText, FolderTree, Users, Flag, Briefcase,
  CreditCard, Megaphone, Bell, FileEdit, BarChart3, Lock, ToggleLeft,
  Globe, Upload, Smartphone, Wrench, FileCheck
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

// Admin sidebar tabs based on PRD M24 requirements (ADM-01 to ADM-23)
const ADMIN_TABS = [
  // Core dashboard
  { id: 'overview', icon: LayoutDashboard, key: 'adminOverview' as TranslationKey, roles: ['superAdmin', 'admin', 'moderator', 'finance', 'support'] },
  
  // User management (ADM-02, ADM-06)
  { id: 'users', icon: Users, key: 'usersBusinesses' as TranslationKey, roles: ['superAdmin', 'admin', 'moderator', 'support'] },
  { id: 'verification', icon: FileCheck, key: 'verificationQueue' as TranslationKey, roles: ['superAdmin', 'admin', 'support'] },
  
  // Listing management (ADM-03, ADM-05)
  { id: 'listings', icon: FileText, key: 'listingsModeration' as TranslationKey, roles: ['superAdmin', 'admin', 'moderator'] },
  { id: 'reports', icon: Flag, key: 'reportsAppeals' as TranslationKey, roles: ['superAdmin', 'admin', 'moderator'] },
  
  // Schema & categories (ADM-04)
  { id: 'categories', icon: FolderTree, key: 'categoryBuilder' as TranslationKey, roles: ['superAdmin', 'admin'] },
  
  // Jobs & Candidates (ADM-07)
  { id: 'candidates', icon: Briefcase, key: 'candidateCV' as TranslationKey, roles: ['superAdmin', 'admin', 'support'] },
  
  // Payments (ADM-08)
  { id: 'payments', icon: CreditCard, key: 'paymentVerification' as TranslationKey, roles: ['superAdmin', 'finance'] },
  
  // Feature flags & controls (ADM-09, ADM-10, ADM-15, ADM-16, ADM-23)
  { id: 'feature-flags', icon: ToggleLeft, key: 'featureFlags' as TranslationKey, roles: ['superAdmin', 'admin'] },
  { id: 'media-limits', icon: Upload, key: 'mediaLimits' as TranslationKey, roles: ['superAdmin', 'admin'] },
  { id: 'app-versions', icon: Smartphone, key: 'appVersions' as TranslationKey, roles: ['superAdmin', 'admin'] },
  { id: 'maintenance', icon: Wrench, key: 'maintenance' as TranslationKey, roles: ['superAdmin', 'admin'] },
  
  // Content & Communications (ADM-12, ADM-13)
  { id: 'content', icon: FileEdit, key: 'contentManagement' as TranslationKey, roles: ['superAdmin', 'admin'] },
  { id: 'broadcast', icon: Megaphone, key: 'broadcast' as TranslationKey, roles: ['superAdmin', 'admin'] },
  
  // Analytics & insights (ADM-20 - includes system health and audit insights)
  { id: 'analytics', icon: BarChart3, key: 'analyticsSystem' as TranslationKey, roles: ['superAdmin', 'admin', 'finance'] },
  
  // Admin controls (ADM-17, ADM-18, ADM-19)
  { id: 'roles', icon: Lock, key: 'rolesPermissions' as TranslationKey, roles: ['superAdmin'] },
];

interface AdminSidebarProps {
  /** Current active tab ID */
  activeTab?: string;
  /** Optional role selector dropdown */
  showRoleSelector?: boolean;
  /** Current admin role */
  adminRole?: string;
  /** Role change callback */
  onRoleChange?: (role: string) => void;
  /** Available roles for selector */
  availableRoles?: string[];
  /** Children components to render in the main content area */
  children?: ReactNode;
}

/**
 * Shared Admin Sidebar Component
 * Used across all admin pages with consistent styling and navigation
 */
export function AdminSidebar({
  activeTab = 'overview',
  showRoleSelector = false,
  adminRole = 'superAdmin',
  onRoleChange,
  availableRoles = ['superAdmin', 'admin', 'moderator', 'finance', 'support', 'content', 'marketing', 'verificationRole', 'technical'],
  children,
}: AdminSidebarProps) {
  const { t } = useI18n();
  const { navigate } = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleTabClick = (tabId: string) => {
    // Special case: overview tab routes to /admin (root), not /admin/overview
    if (tabId === 'overview') {
      navigate('/admin');
    } else {
      navigate(`/admin/${tabId}`);
    }
    setSidebarOpen(false);
  };

  const SidebarLink = ({ tab }: { tab: typeof ADMIN_TABS[0] }) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;
    // Check if current role has access to this tab
    const hasAccess = tab.roles.includes(adminRole);

    if (!hasAccess) return null; // Hide tab if user role doesn't have access

    return (
      <button
        onClick={() => handleTabClick(tab.id)}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
          isActive
            ? 'bg-primary-600 text-white shadow-lg'
            : 'text-primary-100 hover:bg-primary-800'
        }`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="text-sm font-medium truncate">{t(tab.key)}</span>
      </button>
    );
  };

  return (
    <div className="flex min-h-screen bg-sand-50">
      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 start-0 z-40 w-64 bg-primary-900 transition-transform duration-300 md:translate-x-0 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'
        }`}
        style={{ height: '100vh' }}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-primary-800 sticky top-0 bg-primary-900">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
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
            <div className="min-w-0">
              <p className="font-bold text-white text-sm">{t('brandName')}</p>
              <p className="text-[10px] text-primary-300">{t('admin')} Portal</p>
            </div>
          </Link>
        </div>

        {/* Sidebar Content */}
        <div className="p-3 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-primary-700 scrollbar-track-transparent">
          {/* Role Selector */}
          {showRoleSelector && (
            <div className="mb-4">
              <label className="block text-xs font-semibold text-primary-200 mb-2">{t('adminRole')}</label>
              <select
                value={adminRole}
                onChange={(e) => onRoleChange?.(e.target.value)}
                className="w-full bg-primary-800 text-white text-sm rounded-lg px-3 py-2 border border-primary-700 hover:border-primary-600 focus:border-primary-500 focus:outline-none transition-colors"
              >
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    {t(role as TranslationKey)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            {ADMIN_TABS.map((tab) => (
              <SidebarLink key={tab.id} tab={tab} />
            ))}
          </nav>
        </div>


      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-primary-950/50 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-sand-100 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-sand-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-primary-600" />
            ) : (
              <Menu className="w-5 h-5 text-primary-600" />
            )}
          </button>
          <h1 className="font-bold text-primary-700 text-sm">
            {t((activeTab as TranslationKey) || 'adminOverview')}
          </h1>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export { ADMIN_TABS };
