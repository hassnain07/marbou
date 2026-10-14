import { ReactNode } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-success-500" />,
    error: <XCircle className="w-5 h-5 text-error-500" />,
    info: <Info className="w-5 h-5 text-primary-500" />,
  };
  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
      <div className="flex items-center gap-3 bg-white shadow-lg rounded-xl px-5 py-3 border border-sand-100">
        {icons[toast.type]}
        <span className="text-sm font-medium text-primary-800">{toast.message}</span>
      </div>
    </div>
  );
}

export function Modal({ open, onClose, children, title, size = 'md' }: {
  open: boolean; onClose: () => void; children: ReactNode; title?: string; size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-primary-950/40 backdrop-blur-sm" />
      <div className={`relative w-full ${sizes[size]} bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in`} onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-sand-100">
            <h3 className="text-lg font-bold text-primary-800">{title}</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-sand-100 text-primary-400">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

export function Badge({ children, variant = 'default' }: { children: ReactNode; variant?: 'default' | 'success' | 'warning' | 'error' | 'primary' | 'accent' | 'info' }) {
  const variants = {
    default: 'bg-sand-100 text-primary-600',
    success: 'bg-success-100 text-success-700',
    warning: 'bg-warning-100 text-warning-700',
    error: 'bg-error-100 text-error-700',
    primary: 'bg-primary-100 text-primary-700',
    accent: 'bg-accent-100 text-accent-700',
    info: 'bg-blue-100 text-blue-700',
  };
  return <span className={`badge ${variants[variant]}`}>{children}</span>;
}

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-sand-100 flex items-center justify-center text-primary-300 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-primary-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-primary-400 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function ListingCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const map: Record<string, { variant: any; label: string }> = {
    published: { variant: 'success', label: t('published') },
    underReview: { variant: 'warning', label: t('underReview') },
    sold: { variant: 'error', label: t('sold') },
    rented: { variant: 'info', label: t('rented') },
    expired: { variant: 'default', label: t('expired') },
    archived: { variant: 'default', label: t('archived') },
    draft: { variant: 'default', label: t('draft') },
    pending: { variant: 'warning', label: t('pending') },
    approved: { variant: 'success', label: t('approved') },
    rejected: { variant: 'error', label: t('rejectedStatus') },
  };
  const config = map[status] || map.published;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function RatingStars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' };
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={`${sizes[size]} ${star <= Math.round(rating) ? 'text-accent-400' : 'text-sand-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function TrustBadge({ type }: { type: 'verified' | 'topRated' | 'responsive' | 'sponsored' }) {
  const { t } = useI18n();
  const config = {
    verified: { variant: 'primary' as const, label: t('verified'), icon: <CheckCircle className="w-3 h-3" /> },
    topRated: { variant: 'accent' as const, label: t('topRated'), icon: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg> },
    responsive: { variant: 'success' as const, label: t('responsive'), icon: <Info className="w-3 h-3" /> },
    sponsored: { variant: 'accent' as const, label: t('sponsored'), icon: null },
  };
  const c = config[type];
  return <Badge variant={c.variant}>{c.icon}{c.label}</Badge>;
}

export function Breadcrumbs({ items }: { items: { label: string; onClick?: () => void }[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-primary-400 overflow-x-auto no-scrollbar py-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5 whitespace-nowrap">
          {i > 0 && <span className="text-sand-300">/</span>}
          {item.onClick ? (
            <button onClick={item.onClick} className="hover:text-primary-600 transition-colors">{item.label}</button>
          ) : (
            <span className="text-primary-600 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-24 h-24 rounded-full bg-accent-50 flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-primary-800 mb-2">{title}</h2>
      <p className="text-primary-400 max-w-md">{description}</p>
    </div>
  );
}
