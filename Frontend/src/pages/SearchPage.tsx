import { useState, useMemo, useEffect, memo } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { useRouter } from '@/router/Router';
import { ListingCard, ListingCardGrid, FilterPanel, type FilterState, SearchBar } from '@/components/marketplace';
import { EmptyState, Skeleton } from '@/components/ui';
import { listings, categories, sudanCities } from '@/data/mockData';
import {
  Search, SlidersHorizontal, X, Grid, List, MapPin, Save,
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

const ITEMS_PER_PAGE = 20;

export function SearchPage() {
  const { t, lang, formatPrice } = useI18n();
  const { path, navigate } = useRouter();
  const { addSavedSearch, showToast, dataSaver } = useApp();

  const urlParams = new URLSearchParams(path.split('?')[1] || '');
  const initialQuery = urlParams.get('q') || '';
  const initialPage = parseInt(urlParams.get('page') || '1');
  const initialCategory = urlParams.get('category') || '';
  const initialSort = urlParams.get('sort') || 'relevance';

  const [query, setQuery] = useState(initialQuery);
  
  // Deserialize specs from URL
  const initialSpecs: Record<string, string> = {};
  urlParams.forEach((value, key) => {
    if (key.startsWith('specs[') && key.endsWith(']')) {
      const specKey = key.slice(6, -1); // Extract key from specs[key]
      initialSpecs[specKey] = value;
    }
  });

  const [filters, setFilters] = useState<FilterState>({
    category: initialCategory || undefined,
    subcategory: urlParams.get('subcategory') || undefined,
    city: urlParams.get('city') || undefined,
    minPrice: urlParams.get('minPrice') ? parseInt(urlParams.get('minPrice')!) : undefined,
    maxPrice: urlParams.get('maxPrice') ? parseInt(urlParams.get('maxPrice')!) : undefined,
    condition: urlParams.get('condition') || undefined,
    specs: Object.keys(initialSpecs).length > 0 ? initialSpecs : undefined,
  });
  const [sort, setSort] = useState(initialSort);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (filters.category) params.set('category', filters.category);
    if (filters.subcategory) params.set('subcategory', filters.subcategory);
    if (filters.city) params.set('city', filters.city);
    if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
    if (filters.condition) params.set('condition', filters.condition);
    if (filters.specs) {
      Object.entries(filters.specs).forEach(([k, v]) => {
        params.set(`specs[${k}]`, v);
      });
    }
    if (sort !== 'relevance') params.set('sort', sort);
    if (currentPage > 1) params.set('page', String(currentPage));

    const newPath = `/search${params.toString() ? `?${params.toString()}` : ''}`;
    if (newPath !== path) {
      // Use replace for filter/sort changes, push for new queries
      const isFilterChange = query === initialQuery;
      navigate(newPath, { replace: isFilterChange });
    }
  }, [query, filters, sort, currentPage, path, navigate, initialQuery]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [query, filters, sort]);

  const results = useMemo(() => {
    let filtered = listings.filter((l) => l.status === 'published');

    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter((l) =>
        l.title.toLowerCase().includes(q) ||
        l.titleAr.includes(query) ||
        l.description.toLowerCase().includes(q) ||
        l.descriptionAr.includes(query) ||
        l.city.toLowerCase().includes(q) ||
        l.cityAr.includes(query)
      );
    }
    if (filters.category) {
      filtered = filtered.filter((l) => l.category === filters.category);
    }
    if (filters.subcategory) {
      filtered = filtered.filter((l) => l.subcategory === filters.subcategory);
    }
    if (filters.city) {
      filtered = filtered.filter((l) => {
        const city = sudanCities.find((c) => c.id === filters.city);
        return city && (l.city === city.name || l.cityAr === city.nameAr);
      });
    }
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter((l) => l.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter((l) => l.price <= filters.maxPrice!);
    }
    if (filters.condition && filters.condition !== 'all') {
      filtered = filtered.filter((l) => l.condition === filters.condition);
    }

    // Filter by specs
    if (filters.specs && Object.keys(filters.specs).length > 0) {
      filtered = filtered.filter((listing) => {
        return Object.entries(filters.specs!).every(([specKey, specValue]) => {
          return listing.specs?.some((s) => s.key === specKey && String(s.value) === specValue);
        });
      });
    }

    switch (sort) {
      case 'newest':
        filtered = [...filtered].sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
        break;
      case 'lowestPrice':
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case 'highestPrice':
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case 'nearby':
        filtered = [...filtered].sort((a, b) => b.views - a.views);
        break;
      case 'promoted':
        filtered = [...filtered].sort((a, b) => (b.promoted ? 1 : 0) - (a.promoted ? 1 : 0));
        break;
    }

    return filtered;
  }, [query, filters, sort]);

  // Pagination
  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
  const paginatedResults = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return results.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [results, currentPage]);

  const activeCategory = categories.find((c) => c.id === filters.category);
  const resetFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSaveSearch = () => {
    addSavedSearch(query, query);
    showToast(t('saveSearch'), 'success');
  };

  const PaginationControls = memo(function PaginationControlsComponent() {
    return (
      <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-sand-100">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-lg border border-sand-200 text-sm font-medium text-primary-600 hover:bg-sand-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label={t('back')}
        >
          {t('back')}
        </button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
            const pageNum = currentPage > 3 ? currentPage - 2 + i : i + 1;
            if (pageNum > totalPages) return null;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pageNum === currentPage
                    ? 'bg-primary-600 text-white'
                    : 'border border-sand-200 text-primary-600 hover:bg-sand-50'
                }`}
                aria-label={`Page ${pageNum}`}
                aria-current={pageNum === currentPage ? 'page' : undefined}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-lg border border-sand-200 text-sm font-medium text-primary-600 hover:bg-sand-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label={t('next')}
        >
          {t('next')}
        </button>
        <span className="text-sm text-primary-400 ms-2">
          {currentPage} / {totalPages}
        </span>
      </div>
    );
  });

  return (
    <div className="py-4">
      {/* Search bar */}
      <div className="mb-4">
        <SearchBar
          value={query}
          onChange={setQuery}
          onSubmit={(value) => {
            setQuery(value);
            setCurrentPage(1);
          }}
          placeholder={t('searchPlaceholder')}
          suggestions={categories.map((c) => t(c.key))}
          showFilters
          onFilterToggle={() => setShowFilters(true)}
        />
      </div>

      <div className="flex gap-6">
        {/* Desktop filters */}
        <aside className="hidden md:block w-64 shrink-0">
          <FilterPanel
            filters={filters}
            onChange={handleFilterChange}
            onReset={resetFilters}
            resultCount={paginatedResults.length}
          />
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-primary-500">
              <span className="font-bold text-primary-700">{results.length}</span> {t('resultsCount')}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveSearch}
                className="text-xs text-primary-500 hover:text-primary-700 flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-sand-50 transition-colors"
                aria-label={t('saveSearch')}
              >
                <Save className="w-3.5 h-3.5" aria-hidden="true" />
                {t('saveSearch')}
              </button>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setCurrentPage(1);
                }}
                className="input py-1.5 text-sm w-auto"
                aria-label={t('sortBy')}
              >
                <option value="relevance">{t('relevance')}</option>
                <option value="newest">{t('newest')}</option>
                <option value="lowestPrice">{t('lowestPrice')}</option>
                <option value="highestPrice">{t('highestPrice')}</option>
                <option value="nearby">{t('nearby')}</option>
              </select>
              <div className="hidden sm:flex bg-sand-100 rounded-lg p-1">
                <button
                  onClick={() => setLayout('grid')}
                  className={`p-1.5 rounded-md transition-colors ${layout === 'grid' ? 'bg-white shadow-sm text-primary-700' : 'text-primary-400'}`}
                  aria-label={t('grid')}
                  aria-pressed={layout === 'grid'}
                >
                  <Grid className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  onClick={() => setLayout('list')}
                  className={`p-1.5 rounded-md transition-colors ${layout === 'list' ? 'bg-white shadow-sm text-primary-700' : 'text-primary-400'}`}
                  aria-label={t('list')}
                  aria-pressed={layout === 'list'}
                >
                  <List className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
              <button
                onClick={() => setShowMap(!showMap)}
                className={`btn-secondary px-3 py-1.5 text-sm transition-colors ${showMap ? 'bg-primary-50' : ''}`}
                aria-label={t('mapView')}
                aria-pressed={showMap}
              >
                <MapPin className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {showMap && (
            <div className="card p-0 overflow-hidden mb-4">
              <div className="relative h-64 bg-gradient-to-br from-primary-50 to-sand-100 flex items-center justify-center">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, #3a8a57 2px, transparent 2px), radial-gradient(circle at 70% 60%, #3a8a57 2px, transparent 2px)', backgroundSize: '40px 40px' }} aria-hidden="true" />
                {results.slice(0, 8).map((l, i) => (
                  <div
                    key={l.id}
                    className="absolute bg-primary-600 text-white rounded-full p-2 shadow-lg cursor-pointer hover:scale-110 transition-transform"
                    style={{ top: `${20 + (i % 4) * 20}%`, left: `${15 + (i % 5) * 18}%` }}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/listing/${l.id}`)}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/listing/${l.id}`)}
                    aria-label={`${l.title} at ${l.city}`}
                  >
                    <MapPin className="w-4 h-4" aria-hidden="true" />
                  </div>
                ))}
                <div className="relative z-10 text-center">
                  <p className="text-sm font-medium text-primary-500">{t('mapView')}</p>
                  <p className="text-xs text-primary-300">{results.length} {t('resultsCount')}</p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className={layout === 'list' ? 'space-y-3' : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4'}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card overflow-hidden">
                  <Skeleton className="h-40 w-full rounded-none" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              icon={<Search className="w-10 h-10" />}
              title={t('noResults')}
              description={t('noResultsDesc')}
              action={<button onClick={resetFilters} className="btn-primary text-sm">{t('reset')}</button>}
            />
          ) : (
            <>
              <ListingCardGrid listings={paginatedResults} layout={layout} />
              {totalPages > 1 && <PaginationControls />}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onChange={handleFilterChange}
          onReset={resetFilters}
          resultCount={results.length}
          isMobile
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}

export function CategoryPage() {
  const { t, lang } = useI18n();
  const { path, navigate } = useRouter();
  const catId = path.split('/')[2] || '';
  const category = categories.find((c) => c.id === catId);

  if (!category) {
    return <EmptyState icon={<Search className="w-10 h-10" />} title={t('noResults')} description={t('noResultsDesc')} />;
  }

  const catListings = listings.filter((l) => l.category === catId && l.status === 'published');

  return (
    <div className="py-4">
      <div className="flex items-center gap-1.5 text-sm text-primary-400 mb-3">
        <button onClick={() => navigate('/')} className="hover:text-primary-600 transition-colors">{t('home')}</button>
        <span className="text-sand-300">/</span>
        <span className="text-primary-600 font-medium">{t(category.key)}</span>
      </div>

      <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl p-6 text-white mb-6">
        <h1 className="text-2xl font-bold mb-1">{t(category.key)}</h1>
        <p className="text-sm text-primary-100">{catListings.length} {t('resultsCount')}</p>
      </div>

      {category.subcategories.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-primary-700 mb-3">{t('categories')}</h3>
          <div className="flex flex-wrap gap-2">
            {category.subcategories.map((s) => (
              <button
                key={s.id}
                onClick={() => navigate(`/search?category=${catId}`)}
                className="chip-default"
              >
                {t(s.key)}
              </button>
            ))}
          </div>
        </div>
      )}

      <ListingCardGrid listings={catListings} />
    </div>
  );
}
