import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { Link, useRouter } from '@/router/Router';
import { ListingCard } from '@/components/ListingCard';
import { TrustBadge, RatingStars } from '@/components/ui';
import { listings, businesses, jobs, categories, popularSearches, searchSuggestions } from '@/data/mockData';
import {
  Search, MapPin, ChevronLeft, ChevronRight, TrendingUp, Briefcase,
  Wrench, Store, ArrowLeft, ArrowRight, Sparkles, Clock, Star,
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

function SectionHeader({ title, viewAllTo }: { title: string; viewAllTo?: string }) {
  const { t, dir } = useI18n();
  const { navigate } = useRouter();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-lg sm:text-xl font-bold text-primary-800 flex items-center gap-2">
        <span className="w-1 h-5 bg-primary-600 rounded-full" />
        {title}
      </h2>
      {viewAllTo && (
        <button onClick={() => navigate(viewAllTo)} className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-700 font-medium transition-colors">
          {t('browseAll')}
          <Arrow className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function CategoryTile({ catId, label, icon }: { catId: string; label: string; icon: string }) {
  const { navigate } = useRouter();
  const icons: Record<string, string> = {
    'vehicles': '🚗', 'tractors-equipment': '🚜', 'spare-parts': '🔧',
    'real-estate': '🏠', 'hotels': '🏨', 'electronics': '📱',
    'women-fashion': '👗', 'men': '👔', 'children-mothers': '👶',
    'home-furniture': '🛋️', 'animals-livestock': '🐑', 'food-goods': '🛒',
    'services': '🛠️', 'jobs': '💼',
  };
  return (
    <button
      onClick={() => navigate(`/category/${catId}`)}
      className="card p-3 flex flex-col items-center gap-2 hover:shadow-md hover:border-primary-200 transition-all group"
    >
      <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-2xl group-hover:bg-primary-100 transition-colors">
        {icons[catId] || '📦'}
      </div>
      <span className="text-xs font-medium text-primary-600 text-center line-clamp-2">{label}</span>
    </button>
  );
}

function PromoBanner() {
  const { t, lang } = useI18n();
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-700 to-primary-500 p-6 sm:p-8 text-white">
      <div className="absolute top-0 end-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 start-0 w-32 h-32 bg-accent-400/10 rounded-full translate-y-1/2" />
      <div className="relative z-10">
        <p className="text-xs font-medium text-primary-100 mb-1">{t('promotionalBanner')}</p>
        <h3 className="text-xl sm:text-2xl font-bold mb-2">
          {lang === 'ar' ? 'اعرض إعلانك المميز وصل لآلاف المشترين' : 'Promote your listing and reach thousands of buyers'}
        </h3>
        <p className="text-sm text-primary-100 mb-4 max-w-md">
          {lang === 'ar' ? 'الإعلانات المميزة تظهر في الصفحة الرئيسية ونتائج البحث' : 'Featured listings appear on the homepage and search results'}
        </p>
        <Link to="/add-listing" className="btn bg-white text-primary-700 hover:bg-sand-50 px-5 py-2 text-sm font-bold">
          {t('addListing')}
        </Link>
      </div>
    </div>
  );
}

function BusinessCard({ biz }: { biz: typeof businesses[0] }) {
  const { lang, t } = useI18n();
  const { navigate } = useRouter();
  const name = lang === 'ar' ? biz.nameAr : biz.name;
  const city = lang === 'ar' ? biz.cityAr : biz.city;
  const area = lang === 'ar' ? biz.areaAr : biz.area;
  return (
    <button onClick={() => navigate(`/business/${biz.id}`)} className="card overflow-hidden text-start hover:shadow-md transition-all group min-w-[200px]">
      <div className="relative h-24 bg-sand-100">
        <img src={biz.cover} alt="" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute -bottom-6 start-3 w-12 h-12 rounded-xl bg-white border-2 border-white shadow-md overflow-hidden">
          <img src={biz.logo} alt="" className="w-full h-full object-cover" />
        </div>
      </div>
      <div className="p-3 pt-8">
        <div className="flex items-center gap-1.5 mb-1">
          <h4 className="font-bold text-primary-800 text-sm group-hover:text-primary-600 transition-colors line-clamp-1">{name}</h4>
          {biz.verified && <Star className="w-3.5 h-3.5 fill-primary-500 text-primary-500 shrink-0" />}
        </div>
        <div className="flex items-center gap-2 text-xs text-primary-400 mb-2">
          <RatingStars rating={biz.rating} />
          <span>({biz.reviewCount})</span>
        </div>
        <p className="text-xs text-primary-400 flex items-center gap-1">
          <MapPin className="w-3 h-3" />{city} - {area}
        </p>
      </div>
    </button>
  );
}

function JobCard({ job }: { job: typeof jobs[0] }) {
  const { lang, t, formatDate } = useI18n();
  const { navigate } = useRouter();
  const title = lang === 'ar' ? job.titleAr : job.title;
  const company = lang === 'ar' ? job.companyAr : job.company;
  const city = lang === 'ar' ? job.cityAr : job.city;
  const salary = lang === 'ar' ? job.salaryAr : job.salary;
  const typeLabel = t(job.type as TranslationKey);

  return (
    <button onClick={() => navigate(`/jobs/${job.id}`)} className="card p-4 text-start hover:shadow-md transition-all group min-w-[260px]">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-sand-100 overflow-hidden shrink-0">
          <img src={job.logo} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-primary-800 text-sm group-hover:text-primary-600 transition-colors line-clamp-1">{title}</h4>
          <p className="text-xs text-primary-400">{company}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="badge bg-primary-50 text-primary-600">{typeLabel}</span>
            {job.verified && <span className="badge bg-success-50 text-success-600">{t('verified')}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-sand-50">
        <span className="text-xs text-primary-500 font-medium">{salary}</span>
        <span className="text-xs text-primary-400 flex items-center gap-1">
          <MapPin className="w-3 h-3" />{city}
        </span>
      </div>
    </button>
  );
}

export function HomePage() {
  const { t, lang } = useI18n();
  const { navigate } = useRouter();
  const { location } = useApp();

  const featured = listings.filter((l) => l.promoted && l.status === 'published').slice(0, 10);
  const latest = listings.filter((l) => l.status === 'published').slice(0, 10);
  const nearby = listings.filter((l) => l.status === 'published').slice(4, 12);
  const recommended = listings.filter((l) => l.status === 'published').slice(2, 10);
  const services = listings.filter((l) => l.category === 'services' && l.status === 'published');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-8 py-4">
      {/* Hero search */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 p-6 sm:p-10 text-white">
        <div className="absolute top-0 end-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 start-0 w-40 h-40 bg-accent-400/10 rounded-full translate-y-1/3" />
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-2xl sm:text-4xl font-extrabold mb-2">{t('tagline')}</h1>
          <p className="text-sm sm:text-base text-primary-100 mb-5">
            {lang === 'ar' ? 'مكان واحد منظم في السودان لكل ما تحتاجه' : 'One organized place in Sudan for everything you need'}
          </p>
          <form onSubmit={(e) => { e.preventDefault(); navigate(`/search?q=${encodeURIComponent(searchQuery)}`); }}>
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-300" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full rounded-xl border-0 bg-white ps-12 pe-4 py-3.5 text-primary-900 placeholder:text-primary-300 outline-none focus:ring-2 focus:ring-primary-300 shadow-lg"
                />
              </div>
              <button type="submit" className="btn bg-accent-500 hover:bg-accent-600 text-white px-6 py-3.5 font-bold shadow-lg">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>
          <div className="flex flex-wrap gap-2 mt-4">
            {searchSuggestions.slice(0, 4).map((s, i) => (
              <button
                key={i}
                onClick={() => navigate(`/search?q=${encodeURIComponent(lang === 'ar' ? s.en : s.en)}`)}
                className="text-xs bg-white/10 hover:bg-white/20 text-white rounded-full px-3 py-1.5 transition-colors"
              >
                {lang === 'ar' ? s.ar : s.en}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <section>
        <SectionHeader title={t('categories')} viewAllTo="/search" />
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3">
          {categories.map((cat) => (
            <CategoryTile key={cat.id} catId={cat.id} label={t(cat.key)} icon={cat.icon} />
          ))}
        </div>
      </section>

      {/* Promo banner */}
      <PromoBanner />

      {/* Featured listings */}
      {featured.length > 0 && (
        <section>
          <SectionHeader title={t('featuredListings')} viewAllTo="/search?sort=promoted" />
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {featured.map((l) => (
              <div key={l.id} className="min-w-[180px] sm:min-w-[220px]">
                <ListingCard listing={l} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Latest listings */}
      <section>
        <SectionHeader title={t('latestListings')} viewAllTo="/search?sort=newest" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {latest.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      </section>

      {/* Nearby listings */}
      <section>
        <SectionHeader title={t('nearbyListings')} viewAllTo="/search" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {nearby.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      </section>

      {/* Trusted stores */}
      <section>
        <SectionHeader title={t('trustedStores')} viewAllTo="/search?type=business" />
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {businesses.map((biz) => <BusinessCard key={biz.id} biz={biz} />)}
        </div>
      </section>

      {/* Recommended */}
      <section>
        <SectionHeader title={t('recommendedListings')} viewAllTo="/search" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {recommended.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      </section>

      {/* Services near you */}
      <section>
        <SectionHeader title={t('servicesNearYou')} viewAllTo="/category/services" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {services.slice(0, 4).map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      </section>

      {/* Jobs highlights */}
      <section>
        <SectionHeader title={t('jobsHighlights')} viewAllTo="/jobs" />
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {jobs.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      </section>

      {/* Popular searches */}
      <section>
        <SectionHeader title={t('popularSearches')} />
        <div className="flex flex-wrap gap-2">
          {popularSearches.map((s, i) => (
            <button
              key={i}
              onClick={() => navigate(`/search?q=${encodeURIComponent(lang === 'ar' ? s.en : s.en)}`)}
              className="chip-default"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              {lang === 'ar' ? s.ar : s.en}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
