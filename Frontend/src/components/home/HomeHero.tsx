import { useMemo, useState, type FormEvent } from 'react';
import { ClipboardCheck, Search, ShieldCheck, Store, Wallet } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { useRouter } from '@/router/Router';
import { sudanCities } from '@/data/mockData';
import { CitySelect } from '@/components/layout/CitySelect';
import { buildSearchUrl } from '@/utils/buildSearchUrl';
import type { TranslationKey } from '@/i18n/translations';

const CHIPS: { cityId?: string; key?: TranslationKey }[] = [
  { cityId: 'port-sudan' },
  { cityId: 'khartoum' },
  { key: 'hpAtbara' },
  { cityId: 'kassala' },
  { key: 'hpRedSea' },
  { cityId: 'omdurman' },
];

const TRUST = [
  { icon: ShieldCheck, key: 'hpTrustDealers' },
  { icon: Wallet, key: 'hpTrustPayments' },
  { icon: ClipboardCheck, key: 'hpTrustInspection' },
  { icon: Store, key: 'hpTrustMarketplace' },
] as const;

export function HomeHero() {
  const { lang, t } = useI18n();
  const { navigate } = useRouter();
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');

  const chips = useMemo(
    () =>
      CHIPS.map((c) => {
        if (c.cityId) {
          const found = sudanCities.find((x) => x.id === c.cityId);
          return { label: found ? (lang === 'ar' ? found.nameAr : found.name) : c.cityId, to: buildSearchUrl('', c.cityId) };
        }
        const label = t(c.key as TranslationKey);
        return { label, to: buildSearchUrl(label, '') };
      }),
    [lang, t],
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate(buildSearchUrl(q, city));
  };

  return (
    <section className="relative hidden min-h-[380px] overflow-hidden rounded-2xl bg-primary-950 text-white md:block">
      {/* 1. Background photo: fills the WHOLE hero, sits behind everything */}
      <img
        src="/images/home/heroBackground.avif"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-[75%_center]"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />

      {/* 2. Glow shown when the photo is missing, and a soft accent over it */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(0,184,90,0.35),transparent_60%)]" />

      {/* 3. Dark-green gradient: strong on the text side, fading toward the photo */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-950 via-primary-950/80 to-primary-950/15 rtl:bg-gradient-to-l" />

      {/* 4. Content */}
      <div className="relative grid items-center gap-8 p-8 lg:grid-cols-[1fr_290px] lg:p-10">
        <div>
          <h1 className="font-display text-3xl font-extrabold leading-tight lg:text-5xl">
            <span className="block">{t('hpHeroLine1')}</span>
            <span className="block">
              {t('hpHeroLine2')} <span className="text-lime-400">{t('hpHeroHighlight')}</span>
            </span>
          </h1>
          <p className="mt-3 max-w-lg text-sm text-white/90 lg:text-base">{t('hpHeroSub')}</p>

          <form onSubmit={submit} role="search" className="mt-6 flex max-w-2xl items-stretch gap-2 rounded-2xl bg-white p-2 shadow-lg">
            <label className="flex min-w-0 flex-1 items-center gap-2 px-3">
              <Search className="h-5 w-5 shrink-0 text-primary-400" aria-hidden="true" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t('hpHeroSearchHint')}
                aria-label={t('search')}
                className="w-full min-w-0 bg-transparent text-sm text-primary-950 outline-none placeholder:text-primary-400"
              />
            </label>
            <CitySelect value={city} onChange={setCity} className="w-44 shrink-0 border-s border-sand-200" />
            <button type="submit" className="rounded-xl bg-accent-500 px-8 py-3 font-bold text-white transition-colors hover:bg-accent-600">
              {t('hpSearchBtn')}
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">{t('hpPopular')}</span>
            {chips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => navigate(chip.to)}
                className="rounded-full border border-white/50 px-3 py-1 text-xs font-medium transition-colors hover:bg-white/15"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Trust card: floating, rounded, inset from the hero edges. No photo, no label. */}
        <aside className="hidden self-center rounded-2xl bg-white p-3 text-primary-950 shadow-2xl lg:block">
          <ul>
            {TRUST.map(({ icon: Icon, key }) => (
              <li key={key} className="flex items-center gap-3 rounded-xl p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold">{t(key)}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}