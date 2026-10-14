import { useState, useMemo, useEffect } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { useRouter } from '@/router/Router';
import { ListingCardGrid } from '@/components/ListingCard';
import { EmptyState, Skeleton } from '@/components/ui';
import { listings, categories, sudanCities } from '@/data/mockData';
import {
  Search, SlidersHorizontal, X, Grid, List, MapPin, ChevronDown, Save,
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

export function SearchPage() {
  const { t, lang, formatPrice } = useI18n();
  const { path, navigate } = useRouter();
  const { addSavedSearch, showToast, dataSaver } = useApp();

  const urlParams = new URLSearchParams(path.split('?')[1] || '');
  const initialQuery = urlParams.get('q') || '';
  const initialCategory = urlParams.get('category') || '';
  const initialSort = urlParams.get('sort') || 'relevance';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSub, setSelectedSub] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [condition, setCondition] = useState<'all' | 'new' | 'used'>('all');
  const [sort, setSort] = useState(initialSort);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [query, selectedCategory, selectedSub, selectedCity, minPrice, maxPrice, condition, sort]);

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
    if (selectedCategory) {
      filtered = filtered.filter((l) => l.category === selectedCategory);
    }
    if (selectedSub) {
      filtered = filtered.filter((l) => l.subcategory === selectedSub);
    }
    if (selectedCity) {
      filtered = filtered.filter((l) => {
        const city = sudanCities.find((c) => c.id === selectedCity);
        return city && (l.city === city.name || l.cityAr === city.nameAr);
      });
    }
    if (minPrice) {
      filtered = filtered.filter((l) => l.price >= parseInt(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter((l) => l.price <= parseInt(maxPrice));
    }
    if (condition !== 'all') {
      filtered = filtered.filter((l) => l.condition === condition);
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
  }, [query, selectedCategory, selectedSub, selectedCity, minPrice, maxPrice, condition, sort]);

  const activeCategory = categories.find((c) => c.id === selectedCategory);
  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedSub('');
    setSelectedCity('');
    setMinPrice('');
    setMaxPrice('');
    setCondition('all');
  };

  const hasActiveFilters = selectedCategory || selectedSub || selectedCity || minPrice || maxPrice || condition !== 'all';

  const FilterPanel = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-bold text-primary-700 mb-2 block">{t('categories')}</label>
        <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSub(''); }} className="input">
          <option value="">{t('all')}</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{t(c.key)}</option>)}
        </select>
      </div>
      {activeCategory && activeCategory.subcategories.length > 0 && (
        <div>
          <label className="text-sm font-bold text-primary-700 mb-2 block">{t('categories')}</label>
          <div className="flex flex-wrap gap-2">
            {activeCategory.subcategories.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSub(selectedSub === s.id ? '' : s.id)}
                className={selectedSub === s.id ? 'chip-active' : 'chip-default'}
              >
                {t(s.key)}
              </button>
            ))}
          </div>
        </div>
      )}
      <div>
        <label className="text-sm font-bold text-primary-700 mb-2 block">{t('location')}</label>
        <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="input">
          <option value="">{t('all')}</option>
          {sudanCities.map((c) => <option key={c.id} value={c.id}>{lang === 'ar' ? c.nameAr : c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="text-sm font-bold text-primary-700 mb-2 block">{t('price')}</label>
        <div className="flex gap-2">
          <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder={t('minPrice')} className="input text-sm" />
          <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder={t('maxPrice')} className="input text-sm" />
        </div>
      </div>
      <div>
        <label className="text-sm font-bold text-primary-700 mb-2 block">{t('condition')}</label>
        <div className="flex gap-2">
          {(['all', 'new', 'used'] as const).map((c) => (
            <button key={c} onClick={() => setCondition(c)} className={condition === c ? 'chip-active' : 'chip-default'}>
              {c === 'all' ? t('all') : c === 'new' ? t('new') : t('used')}
            </button>
          ))}
        </div>
      </div>
      {hasActiveFilters && (
        <button onClick={resetFilters} className="btn-secondary w-full text-sm">
          <X className="w-4 h-4" />{t('reset')}
        </button>
      )}
    </div>
  );

  return (
    <div className="py-4">
      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="input ps-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(true)}
          className="btn-secondary px-3 lg:hidden"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-6">
        {/* Desktop filters */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="card p-4 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-primary-800 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />{t('filters')}
              </h3>
              <button onClick={() => addSavedSearch(query, query)} className="text-xs text-primary-500 hover:text-primary-700 flex items-center gap-1">
                <Save className="w-3.5 h-3.5" />{t('saveSearch')}
              </button>
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-primary-500">
              <span className="font-bold text-primary-700">{results.length}</span> {t('resultsCount')}
            </p>
            <div className="flex items-center gap-2">
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="input py-1.5 text-sm w-auto">
                <option value="relevance">{t('relevance')}</option>
                <option value="newest">{t('newest')}</option>
                <option value="lowestPrice">{t('lowestPrice')}</option>
                <option value="highestPrice">{t('highestPrice')}</option>
                <option value="nearby">{t('nearby')}</option>
              </select>
              <div className="hidden sm:flex bg-sand-100 rounded-lg p-1">
                <button onClick={() => setLayout('grid')} className={`p-1.5 rounded-md ${layout === 'grid' ? 'bg-white shadow-sm text-primary-700' : 'text-primary-400'}`}>
                  <Grid className="w-4 h-4" />
                </button>
                <button onClick={() => setLayout('list')} className={`p-1.5 rounded-md ${layout === 'list' ? 'bg-white shadow-sm text-primary-700' : 'text-primary-400'}`}>
                  <List className="w-4 h-4" />
                </button>
              </div>
              <button onClick={() => setShowMap(!showMap)} className={`btn-secondary px-3 py-1.5 text-sm ${showMap ? 'bg-primary-50' : ''}`}>
                <MapPin className="w-4 h-4" />
              </button>
            </div>
          </div>

          {showMap && (
            <div className="card p-0 overflow-hidden mb-4">
              <div className="relative h-64 bg-gradient-to-br from-primary-50 to-sand-100 flex items-center justify-center">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, #3a8a57 2px, transparent 2px), radial-gradient(circle at 70% 60%, #3a8a57 2px, transparent 2px)', backgroundSize: '40px 40px' }} />
                {results.slice(0, 8).map((l, i) => (
                  <div
                    key={l.id}
                    className="absolute bg-primary-600 text-white rounded-full p-2 shadow-lg cursor-pointer hover:scale-110 transition-transform"
                    style={{ top: `${20 + (i % 4) * 20}%`, left: `${15 + (i % 5) * 18}%` }}
                  >
                    <MapPin className="w-4 h-4" />
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
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
            <ListingCardGrid listings={results} layout={layout} />
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden animate-fade-in">
          <div className="absolute inset-0 bg-primary-950/40" onClick={() => setShowFilters(false)} />
          <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-sand-100 sticky top-0 bg-white">
              <h3 className="font-bold text-primary-800">{t('filters')}</h3>
              <button onClick={() => setShowFilters(false)} className="p-1.5 rounded-lg hover:bg-sand-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <FilterPanel />
            </div>
            <div className="sticky bottom-0 bg-white border-t border-sand-100 p-4 flex gap-2">
              <button onClick={resetFilters} className="btn-secondary flex-1">{t('reset')}</button>
              <button onClick={() => setShowFilters(false)} className="btn-primary flex-1">{t('apply')} ({results.length})</button>
            </div>
          </div>
        </div>
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
        <button onClick={() => navigate('/')} className="hover:text-primary-600">{t('home')}</button>
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
