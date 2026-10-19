import { useState, memo } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { useFlags } from '@/context/AppContext';
import { Link, useRouter } from '@/router/Router';
import { ListingCard } from '@/components/marketplace';
import { CategoryTile, SearchBar } from '@/components/marketplace';
import { TrustBadge, RatingStars } from '@/components/ui';
import { listings, businesses, jobs, categories, popularSearches, searchSuggestions } from '@/data/mockData';
import {
  MapPin, TrendingUp, ArrowLeft, ArrowRight, Star,
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

const SectionHeader = memo(function SectionHeaderComponent({ title, viewAllTo }: { title: string; viewAllTo?: string }) {
  const { t, dir } = useI18n();
  const { navigate } = useRouter();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-lg sm:text-xl font-bold text-primary-800 flex items-center gap-2">
        <span className="w-1 h-5 bg-primary-600 rounded-full" aria-hidden="true" />
        {title}
      </h2>
      {viewAllTo && (
        <button onClick={() => navigate(viewAllTo)} className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-700 font-medium transition-colors" aria-label={`${t('browseAll')} ${title}`}>
          {t('browseAll')}
          <Arrow className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
});

const PromoBanner = memo(function PromoBannerComponent() {
  const { t, lang } = useI18n();
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-700 to-primary-500 p-6 sm:p-8 text-white">
      <div className="absolute top-0 end-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" aria-hidden="true" />
      <div className="absolute bottom-0 start-0 w-32 h-32 bg-accent-400/10 rounded-full translate-y-1/2" aria-hidden="true" />
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
});

const BusinessCard = memo(function BusinessCardComponent({ biz }: { biz: typeof businesses[0] }) {
  const { lang, t } = useI18n();
  const { navigate } = useRouter();
  const name = lang === 'ar' ? biz.nameAr : biz.name;
  const city = lang === 'ar' ? biz.cityAr : biz.city;
  const area = lang === 'ar' ? biz.areaAr : biz.area;
  return (
    <button onClick={() => navigate(`/business/${biz.id}`)} className="card overflow-hidden text-start hover:shadow-md transition-all group min-w-[200px]" aria-label={`${name} - business`}>
      <div className="relative h-24 bg-sand-100">
        <img src={biz.cover} alt="" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute -bottom-6 start-3 w-12 h-12 rounded-xl bg-white border-2 border-white shadow-md overflow-hidden">
          <img src={biz.logo} alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
      </div>
      <div className="p-3 pt-8">
        <div className="flex items-center gap-1.5 mb-1">
          <h4 className="font-bold text-primary-800 text-sm group-hover:text-primary-600 transition-colors line-clamp-1">{name}</h4>
          {biz.verified && <Star className="w-3.5 h-3.5 fill-primary-500 text-primary-500 shrink-0" aria-label={t('verified')} />}
        </div>
        <div className="flex items-center gap-2 text-xs text-primary-400 mb-2">
          <RatingStars rating={biz.rating} />
          <span>({biz.reviewCount})</span>
        </div>
        <p className="text-xs text-primary-400 flex items-center gap-1">
          <MapPin className="w-3 h-3" aria-hidden="true" />{city} - {area}
        </p>
      </div>
    </button>
  );
});

const JobCard = memo(function JobCardComponent({ job }: { job: typeof jobs[0] }) {
  const { lang, t, formatDate } = useI18n();
  const { navigate } = useRouter();
  const title = lang === 'ar' ? job.titleAr : job.title;
  const company = lang === 'ar' ? job.companyAr : job.company;
  const city = lang === 'ar' ? job.cityAr : job.city;
  const salary = lang === 'ar' ? job.salaryAr : job.salary;
  const typeLabel = t(job.type as TranslationKey);

  return (
    <button onClick={() => navigate(`/jobs/${job.id}`)} className="card p-4 text-start hover:shadow-md transition-all group min-w-[260px]" aria-label={`${title} - ${company}`}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-sand-100 overflow-hidden shrink-0">
          <img src={job.logo} alt="" className="w-full h-full object-cover" loading="lazy" />
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
          <MapPin className="w-3 h-3" aria-hidden="true" />{city}
        </span>
      </div>
    </button>
  );
});

export function HomePage() {
  const { t, lang } = useI18n();
  const { navigate } = useRouter();
  const { flags } = useFlags();

  const featured = listings.filter((l) => l.promoted && l.status === 'published').slice(0, 10);
  const latest = listings.filter((l) => l.status === 'published').slice(0, 10);
  const nearby = listings.filter((l) => l.status === 'published').slice(4, 12);
  const recommended = listings.filter((l) => l.status === 'published').slice(2, 10);
  const services = listings.filter((l) => l.category === 'services' && l.status === 'published');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (value: string) => {
    navigate(`/search?q=${encodeURIComponent(value)}`);
  };

  const allSuggestions = [
    ...searchSuggestions.map((s) => lang === 'ar' ? s.ar : s.en),
    ...categories.map((c) => t(c.key)),
  ];

  return (
    <div className="space-y-8 py-4">
      {/* Hero search with SearchBar component */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 p-6 sm:p-10 text-white">
        <div className="absolute top-0 end-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" aria-hidden="true" />
        <div className="absolute bottom-0 start-0 w-40 h-40 bg-accent-400/10 rounded-full translate-y-1/3" aria-hidden="true" />
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-2xl sm:text-4xl font-extrabold mb-2">{t('tagline')}</h1>
          <p className="text-sm sm:text-base text-primary-100 mb-5">
            {lang === 'ar' ? 'مكان واحد منظم في السودان لكل ما تحتاجه' : 'One organized place in Sudan for everything you need'}
          </p>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearchSubmit}
            placeholder={t('searchPlaceholder')}
            suggestions={allSuggestions.slice(0, 6)}
          />
          <div className="flex flex-wrap gap-2 mt-4">
            {searchSuggestions.slice(0, 4).map((s, i) => (
              <button
                key={i}
                onClick={() => handleSearchSubmit(lang === 'ar' ? s.ar : s.en)}
                className="text-xs bg-white/10 hover:bg-white/20 text-white rounded-full px-3 py-1.5 transition-colors"
                aria-label={`Search for ${lang === 'ar' ? s.ar : s.en}`}
              >
                {lang === 'ar' ? s.ar : s.en}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Categories with marketplace CategoryTile component */}
      <section>
        <SectionHeader title={t('categories')} viewAllTo="/search" />
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3">
          {categories.map((cat) => (
            <div key={cat.id} onClick={() => navigate(`/category/${cat.id}`)}>
              <CategoryTile category={cat} size="sm" />
            </div>
          ))}
        </div>
      </section>

      {/* Promo banner */}
      {flags?.monetizationEnabled && <PromoBanner />}

      {/* Featured listings */}
      {flags?.monetizationEnabled && featured.length > 0 && (
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

      {/* Jobs portal entry card */}
      <section>
        <button 
          onClick={() => navigate('/jobs')}
          className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 p-8 sm:p-12 text-white hover:shadow-lg transition-all group"
        >
          <div className="absolute top-0 end-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" aria-hidden="true" />
          <div className="absolute bottom-0 start-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" aria-hidden="true" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="text-start flex-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">{t('browseJobs')}</h2>
              <p className="text-sm sm:text-base text-primary-100 mb-4 max-w-md">
                {lang === 'ar' ? 'اكتشف الفرص الوظيفية المثيرة في السودان' : 'Discover exciting job opportunities in Sudan'}
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                <span className="font-semibold text-sm">{t('browseAll')}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>
            <div className="hidden sm:block text-6xl opacity-20">💼</div>
          </div>
        </button>
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
              onClick={() => handleSearchSubmit(lang === 'ar' ? s.ar : s.en)}
              className="chip-default"
              aria-label={`Search for ${lang === 'ar' ? s.ar : s.en}`}
            >
              <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
              {lang === 'ar' ? s.ar : s.en}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
