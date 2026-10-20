import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { useRouter } from '@/router/Router';

export function SectionHeader({
  title, viewAllTo, viewAllLabel,
}: {
  title: ReactNode;
  viewAllTo?: string;
  viewAllLabel?: string;
}) {
  const { t, dir } = useI18n();
  const { navigate } = useRouter();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-lg font-bold text-primary-950 sm:text-xl">
        <span className="h-6 w-1 rounded-full bg-accent-500" aria-hidden="true" />
        {title}
      </h2>
      {viewAllTo && (
        <button
          type="button"
          onClick={() => navigate(viewAllTo)}
          className="flex items-center gap-1 text-sm font-medium text-primary-700 transition-colors hover:text-primary-950"
        >
          {viewAllLabel ?? t('hpViewAll')}
          <Arrow className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
