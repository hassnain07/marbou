import { memo, useMemo } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import * as LucideIcons from 'lucide-react';
import type { CategoryDef } from '@/data/mockData';

interface CategoryTileProps {
  category: CategoryDef;
  onClick?: (categoryId: string) => void;
  featured?: boolean;
  size?: 'sm' | 'md';
}

function CategoryTileComponent({ category, onClick, featured = false, size = 'md' }: CategoryTileProps) {
  const { t } = useI18n();

  const sizes = {
    sm: {
      container: 'p-3 rounded-xl',
      icon: 'w-6 h-6',
      label: 'text-xs',
      minH: 'min-h-[100px]',
    },
    md: {
      container: 'p-4 rounded-2xl',
      icon: 'w-8 h-8',
      label: 'text-sm',
      minH: 'min-h-[120px]',
    },
  };

  const sizeConfig = sizes[size];

  // Dynamically load icon from lucide-react
  const IconComponent = useMemo(() => {
    const iconName = category.icon as keyof typeof LucideIcons;
    return (LucideIcons[iconName] as any) || LucideIcons.Package;
  }, [category.icon]);

  const label = t(category.key);

  return (
    <button
      onClick={() => onClick?.(category.id)}
      className={`
        w-full flex flex-col items-center justify-between text-center
        bg-white border border-sand-100 transition-all duration-200
        hover:shadow-md hover:scale-102 active:scale-98
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
        ${sizeConfig.container} ${sizeConfig.minH}
        ${featured ? 'ring-2 ring-accent-500 border-accent-300' : ''}
      `}
      aria-label={label}
      type="button"
    >
      <div className="flex-1 flex items-center justify-center mb-2 w-full">
        <IconComponent
          className={`${sizeConfig.icon} text-primary-600 shrink-0`}
          aria-hidden="true"
        />
      </div>
      <span className={`font-medium text-primary-800 line-clamp-2 ${sizeConfig.label}`}>
        {label}
      </span>
      {featured && (
        <span className="text-xs text-accent-600 font-semibold mt-1 badge bg-accent-50">
          {t('featured')}
        </span>
      )}
    </button>
  );
}

export const CategoryTile = memo(CategoryTileComponent);
