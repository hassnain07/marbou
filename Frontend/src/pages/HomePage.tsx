import { memo } from 'react';
import { MapPin, Star } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { useRouter } from '@/router/Router';
import { ListingCard } from '@/components/marketplace';
import { RatingStars } from '@/components/ui';
import { HomeHero } from '@/components/home/HomeHero';
import { MobileQuickSearch } from '@/components/home/MobileQuickSearch';
import { CategoryCardRow } from '@/components/home/CategoryCardRow';
import { FeaturedListings } from '@/components/home/FeaturedListings';
import { SectionHeader } from '@/components/home/SectionHeader';
import { listings, businesses, jobs } from '@/data/mockData';
import type { TranslationKey } from '@/i18n/translations';

const BusinessCard = memo(function BusinessCardComponent({ biz }: { biz: (typeof businesses)[0] }) {
  const { lang, t } = useI18n();
  const { navigate } = useRouter();
  const name = lang === 'ar' ? biz.nameAr : biz.name;
  const city = lang === 'ar' ? biz.cityAr : biz.city;
  const area = lang === 'ar' ? biz.areaAr : biz.area;
  return (
    <button
      type="button"
      onClick={() => navigate(`/business/${biz.id}`)}
      className="card group min-w-[200px] overflow-hidden text-start transition-all hover:shadow-md"
      aria-label={`${name} - business`}
    >
      <div className="relative h-24 bg-sand-100">
        <img src={biz.cover} alt="" className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute -bottom-6 start-3 h-12 w-12 overflow-hidden rounded-xl border-2 border-white bg-white shadow-md">
          <img src={biz.logo} alt="" className="h-full w-full object-cover" loading="lazy" />
        </div>
      </div>
      <div className="p-3 pt-8">
        <div className="mb-1 flex items-center gap-1.5">
          <h4 className="line-clamp-1 text-sm font-bold text-primary-800 transition-colors group-hover:text-primary-600">{name}</h4>
          {biz.verified && <Star className="h-3.5 w-3.5 shrink-0 fill-primary-500 text-primary-500" aria-label={t('verified')} />}
        </div>
        <div className="mb-2 flex items-center gap-2 text-xs text-primary-400">
          <RatingStars rating={biz.rating} />
          <span>({biz.reviewCount})</span>
        </div>
        <p className="flex items-center gap-1 text-xs text-primary-400">
          <MapPin className="h-3 w-3" aria-hidden="true" />
          {city} - {area}
        </p>
      </div>
    </button>
  );
});

const JobCard = memo(function JobCardComponent({ job }: { job: (typeof jobs)[0] }) {
  const { lang, t } = useI18n();
  const { navigate } = useRouter();
  const title = lang === 'ar' ? job.titleAr : job.title;
  const company = lang === 'ar' ? job.companyAr : job.company;
  const city = lang === 'ar' ? job.cityAr : job.city;
  const salary = lang === 'ar' ? job.salaryAr : job.salary;
  const typeLabel = t(job.type as TranslationKey);

  return (
    <button
      type="button"
      onClick={() => navigate(`/jobs/${job.id}`)}
      className="card group min-w-[260px] p-4 text-start transition-all hover:shadow-md"
      aria-label={`${title} - ${company}`}
    >
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-sand-100">
          <img src={job.logo} alt="" className="h-full w-full object-cover" loading="lazy" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="line-clamp-1 text-sm font-bold text-primary-800 transition-colors group-hover:text-primary-600">{title}</h4>
          <p className="text-xs text-primary-400">{company}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="badge bg-primary-50 text-primary-600">{typeLabel}</span>
            {job.verified && <span className="badge bg-success-50 text-success-600">{t('verified')}</span>}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-sand-50 pt-3">
        <span className="text-xs font-medium text-primary-500">{salary}</span>
        <span className="flex items-center gap-1 text-xs text-primary-400">
          <MapPin className="h-3 w-3" aria-hidden="true" />
          {city}
        </span>
      </div>
    </button>
  );
});

export function HomePage() {
  const { t } = useI18n();
  const latest = listings.filter((l) => l.status === 'published').slice(0, 10);

  return (
    <div className="space-y-8 py-2">
      {/* Desktop / tablet hero */}
      <HomeHero />
      {/* Desktop / tablet category cards */}
      <CategoryCardRow />

      {/* Mobile search + category tiles */}
      <MobileQuickSearch />

      {/* Featured listings (both mobile + desktop) */}
      <FeaturedListings />

      {/* Latest listings */}
      <section>
        <SectionHeader title={t('hpLatest')} viewAllTo="/search?sort=newest" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 items-stretch">
          {latest.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      {/* Trusted stores */}
      <section>
        <SectionHeader title={t('trustedStores')} viewAllTo="/search?type=business" />
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
          {businesses.map((biz) => (
            <BusinessCard key={biz.id} biz={biz} />
          ))}
        </div>
      </section>

      {/* Jobs highlights */}
      <section>
        <SectionHeader title={t('jobsHighlights')} viewAllTo="/jobs" />
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>
    </div>
  );
}
