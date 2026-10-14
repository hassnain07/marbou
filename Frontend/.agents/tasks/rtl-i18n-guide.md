# MARBOU Frontend — RTL & i18n Implementation Guide

Complete specification for Arabic-first RTL support and internationalization (i18n) architecture enabling regional expansion without rebuilding.

---

## Overview

**Languages at Launch:**
- Arabic (ar-SD) — primary, RTL
- English (en-US) — secondary, LTR

**Future-ready for:** Egyptian Arabic (ar-EG), Gulf Arabic (ar-AE), French (fr), more

**Scope:** Web frontend only (mobile apps handle platform-native RTL)

---

## 1. Tailwind Logical Properties Audit & Migration

### What Are Logical Properties?

Logical properties use **direction-aware keywords** instead of physical directions:

| Physical | Logical | Meaning |
|---|---|---|
| `left` | `start` | Left in LTR, right in RTL |
| `right` | `end` | Right in LTR, left in RTL |
| `margin-left` | `margin-start` (ms) | Margin toward text start |
| `margin-right` | `margin-end` (me) | Margin toward text end |
| `padding-left` | `padding-start` (ps) | Padding toward text start |
| `padding-right` | `padding-end` (pe) | Padding toward text end |
| `border-left` | `border-start` (border-s) | Border on start side |
| `border-right` | `border-end` (border-e) | Border on end side |
| `rounded-tl` / `rounded-bl` | `rounded-ss` / `rounded-es` | **NOT YET in Tailwind v3** — use physical for now |
| `rounded-tr` / `rounded-br` | `rounded-se` / `rounded-ee` | **NOT YET in Tailwind v3** — use physical for now |

### Current Codebase Audit

**Files to scan for physical properties:**

```bash
grep -r "left-\|right-\|ml-\|mr-\|pl-\|pr-\|border-l\|border-r" src/
```

### Migration Priority

#### HIGH (User-visible, must fix)

| File | Issue | Physical | Logical | Status |
|---|---|---|---|---|
| AppShell.tsx | LocationSelector dropdown position | `start-0` ✓ | Already correct | — |
| AppShell.tsx | Close button position | `right-1.5` | `end-1.5` | [ ] |
| Modal.tsx | Close button position | `end-6` ✓ | Already correct | — |
| ListingCard.tsx | Image container | `left-0` | `start-0` | [ ] |
| Breadcrumbs.tsx | Gap after separator | `ml-1.5` | `ms-1.5` | [ ] |
| HomePage.tsx | Category grid padding | `px-4 md:px-6` | `ps-4 pe-4 md:ps-6 md:pe-6` | [ ] |

#### MEDIUM (Component structure)

| File | Issue | Fix |
|---|---|---|
| ui.tsx (EmptyState) | Action button padding | Use `ps-*` / `pe-*` |
| ui.tsx (Breadcrumbs) | Item divider positioning | Use logical spacing |
| ui.tsx (Badge) | Icon spacing | Use `ms-*` not `ml-*` |

#### LOW (Decorative, can defer)

| File | Issue | Fix |
|---|---|---|
| BottomNav.tsx | Icon alignment | Non-critical |

### Tailwind Logical Properties Support

Tailwind v3.2+ supports **inline logical properties** (margin, padding, spacing, borders):

```css
/* Supported in Tailwind v3.2+ */
start-0 end-0          /* inset-inline-start / inset-inline-end */
ps-4 pe-4              /* padding-inline-start / padding-inline-end */
ms-2 me-2              /* margin-inline-start / margin-inline-end */
border-s border-e      /* border-inline-start / border-inline-end */

/* NOT yet supported: logical corner radius */
rounded-ss rounded-se rounded-es rounded-ee
/* ^ These do NOT exist in Tailwind v3. Use physical properties instead:
     rounded-tl rounded-tr rounded-bl rounded-br
*/
```

**Key limitation:** Tailwind v3 does not support logical corner radius (`rounded-ss`, etc.). You must continue using physical properties (`rounded-tl`, etc.) for corners until Tailwind v4.

### Checklist: Replace All Physical Properties

- [ ] `left-` → `start-`
- [ ] `right-` → `end-`
- [ ] `inset-` → where needed, use `inset-0` (omnidirectional)
- [ ] `ml-` → `ms-`
- [ ] `mr-` → `me-`
- [ ] `pl-` → `ps-`
- [ ] `pr-` → `pe-`
- [ ] `border-l` → `border-s`
- [ ] `border-r` → `border-e`
- [ ] `rounded-tl` / `rounded-bl` / `rounded-tr` / `rounded-br` → **Keep as-is** (logical corners not yet in Tailwind v3)

---

## 2. RTL-Specific UI Patterns

### Back / Chevron Icons

In RTL, navigation direction reverses visually:

**Pattern: Back button**
```typescript
import { ChevronLeft } from 'lucide-react';

export function BackButton() {
  const { dir } = useI18n();
  
  return (
    <button aria-label="Go back">
      {/* Icon automatically flips in RTL via CSS transform */}
      <ChevronLeft
        className={dir === 'rtl' ? 'transform scale-x-[-1]' : ''}
      />
    </button>
  );
}
```

**Pattern: Category arrow (if decorative)**
```tsx
// Left arrow shown in LTR, right arrow shown in RTL
{dir === 'rtl' ? <ChevronRight /> : <ChevronLeft />}
```

### Price & Number Alignment

Prices often have leading zeros or special formatting; handle bi-directional text:

```typescript
import { useI18n } from '@/i18n/I18nContext';

export function PriceDisplay({ price, currency = 'SDG' }: Props) {
  const { lang } = useI18n();
  
  // Format: "1,500,000 SDG"
  const formatted = new Intl.NumberFormat(
    lang === 'ar' ? 'ar-SD' : 'en-US',
    { style: 'currency', currency, currencyDisplay: 'code' }
  ).format(price);
  
  return (
    <div dir="ltr" className="text-end">
      {/* dir="ltr" keeps numbers LTR inside RTL context */}
      {formatted}
    </div>
  );
}
```

### Mixed-Direction Content (Arabic UI + English Product Name)

Use `<bdi>` (bidirectional isolate) tag:

```tsx
<p>
  السعر: <bdi>Canon EOS R5</bdi>
  {/* Arabic text + isolated English brand name */}
</p>

{/* Output in RTL:
    Canon EOS R5 :السعر
*/}
```

### Search Input Alignment

Search input should default-left in LTR, default-right in RTL:

```tsx
const { dir } = useI18n();
<input
  type="search"
  dir={dir}
  className="input"
  placeholder={t('search')}
/>
```

### Form Field Labels

Labels should align with input naturally via `label for`:

```tsx
<div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
  <label htmlFor="phone" className="label">
    {t('phoneNumber')}
  </label>
  <input id="phone" type="tel" className="input" />
</div>

{/* Actually, this is automatic via dir="rtl" on parent. Simplify: */}
<label htmlFor="phone" className="label">
  {t('phoneNumber')}
</label>
<input id="phone" type="tel" className="input" />
```

---

## 3. Font Strategy

### Font Selection

| Language | Display Font | Body Font | Why |
|---|---|---|---|
| Arabic | Cairo | Noto Kufi Arabic | Professional, regional feel |
| English | Cairo (ok) or Inter | Inter | Clean, readable |

### Font Loading

```css
/* src/index.css */
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Noto+Kufi+Arabic:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

@layer base {
  [dir="rtl"] {
    @apply font-sans;  /* Noto Kufi Arabic for Arabic */
  }
  [dir="ltr"] {
    @apply font-sans;  /* Inter for English */
  }
}
```

### Font Subsetting (Production Optimization)

For deployed apps, subset fonts to reduce download:

```css
/* Keep only needed characters (Arabic + English + numbers) */
@font-face {
  font-family: 'Cairo';
  src: url('/fonts/cairo-subset.woff2') format('woff2');
  unicode-range: U+0600-06FF, U+0–9, U+20-7F;  /* Arabic, numbers, basic Latin */
  font-display: swap;
}
```

---

## 4. i18n Architecture

### Current Implementation: `I18nContext.tsx`

**Structure:**
```typescript
interface I18nContextType {
  lang: 'ar' | 'en';
  t: (key: TranslationKey) => string;
  toggleLang: () => void;
}

export const I18nContext = createContext<I18nContextType>(/* ... */);
```

### Translation File Structure: `i18n/translations.ts`

**For scalability at 1000+ strings, organize translations by feature instead of a single monolithic file.**

#### Scalable File Organization

```
src/i18n/
├── index.ts                    # Main export; imports and merges all features
├── common.ts                   # Shared strings (OK, Cancel, Loading, Error, etc.)
├── features/
│  ├── auth.ts                  # Login, Register, Password Reset
│  ├── listing.ts               # Create, Edit, View, Detail pages
│  ├── search.ts                # Search, Filters, Results, Sorting
│  ├── messaging.ts             # Messages, Threads, Notifications
│  ├── profile.ts               # User Profile, Business Profile, Settings
│  ├── business.ts              # Business Dashboard, Analytics
│  ├── admin.ts                 # Admin panels, moderation
│  ├── home.ts                  # Homepage, categories, featured
│  ├── jobs.ts                  # Jobs, Services, Applications
│  ├── comparison.ts            # Comparison tool, history
│  └── help.ts                  # Help, FAQ, Support
└── types.ts                    # Shared types

```

#### Implementation

**`src/i18n/common.ts`** (shared UI strings):
```typescript
export const common = {
  ar: {
    ok: 'موافق',
    cancel: 'إلغاء',
    save: 'حفظ',
    delete: 'حذف',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    noData: 'لا توجد بيانات',
    retry: 'إعادة محاولة',
  },
  en: {
    ok: 'OK',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    loading: 'Loading...',
    error: 'An error occurred',
    noData: 'No data',
    retry: 'Retry',
  },
};
```

**`src/i18n/features/listing.ts`** (listing-specific strings):
```typescript
export const listing = {
  ar: {
    listing_detail_title: 'العنوان',
    listing_detail_price: 'السعر',
    listing_detail_description: 'الوصف',
    listing_detail_seller_name: 'اسم البائع',
    listing_detail_location: 'الموقع',
    listing_detail_category: 'الفئة',
    listing_create_title: 'إنشاء إعلان جديد',
    listing_create_button: 'نشر الإعلان',
    listing_edit_button: 'تحرير الإعلان',
    listing_delete_confirm: 'هل تريد حذف هذا الإعلان؟',
    listing_status_active: 'نشط',
    listing_status_draft: 'مسودة',
    listing_status_expired: 'منتهى الصلاحية',
  },
  en: {
    listing_detail_title: 'Title',
    listing_detail_price: 'Price',
    listing_detail_description: 'Description',
    listing_detail_seller_name: 'Seller Name',
    listing_detail_location: 'Location',
    listing_detail_category: 'Category',
    listing_create_title: 'Create New Listing',
    listing_create_button: 'Publish Listing',
    listing_edit_button: 'Edit Listing',
    listing_delete_confirm: 'Delete this listing?',
    listing_status_active: 'Active',
    listing_status_draft: 'Draft',
    listing_status_expired: 'Expired',
  },
};
```

**`src/i18n/index.ts`** (main export, merges all features):
```typescript
import { common } from './common';
import { listing } from './features/listing';
import { search } from './features/search';
import { auth } from './features/auth';
import { messaging } from './features/messaging';
import { profile } from './features/profile';
import { business } from './features/business';
import { admin } from './features/admin';
import { home } from './features/home';
import { jobs } from './features/jobs';
import { comparison } from './features/comparison';
import { help } from './features/help';

// Merge all features per language
export const translations = {
  ar: {
    ...common.ar,
    ...listing.ar,
    ...search.ar,
    ...auth.ar,
    ...messaging.ar,
    ...profile.ar,
    ...business.ar,
    ...admin.ar,
    ...home.ar,
    ...jobs.ar,
    ...comparison.ar,
    ...help.ar,
  },
  en: {
    ...common.en,
    ...listing.en,
    ...search.en,
    ...auth.en,
    ...messaging.en,
    ...profile.en,
    ...business.en,
    ...admin.en,
    ...home.en,
    ...jobs.en,
    ...comparison.en,
    ...help.en,
  },
};

export type TranslationKey = keyof typeof translations.ar;

// Runtime language toggle
let currentLanguage: 'ar' | 'en' = 'ar';

export function setLanguage(lang: 'ar' | 'en') {
  currentLanguage = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
}

export function t(key: TranslationKey, params?: Record<string, string>): string {
  let value = translations[currentLanguage][key] || key;
  
  // Simple interpolation
  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      value = value.replace(`{{ ${paramKey} }}`, paramValue);
    });
  }
  
  return value;
}
```

#### Benefits of This Organization

1. **Scalability:** 1000 strings split across 12 files = ~83 strings per file (manageable)
2. **Maintainability:** Each feature team owns their translations
3. **Tree-shaking:** Unused features can be omitted in future
4. **Testing:** Feature translations can be tested independently
5. **Translation workflow:** Translators work on smaller files

#### Adding a New Feature

1. Create `src/i18n/features/newfeature.ts`
2. Add translations object with `ar` and `en` properties
3. Import and merge in `src/i18n/index.ts`
4. Use `t()` hook in components

#### Key Naming Conventions

**Pattern:** `feature_component_element`

```typescript
// Good (organized, scannable)
{
  listing_detail_title: 'Title',
  listing_detail_price: 'Price',
  listing_detail_seller_name: 'Seller Name',
  
  search_filter_category: 'Category',
  search_filter_priceRange: 'Price Range',
  search_results_count: '{{ count }} results found',
  
  auth_login_email: 'Email',
  auth_login_password: 'Password',
  auth_register_button: 'Create Account',
}

// Avoid (flat, hard to navigate at scale)
{
  title: 'Title',
  price: 'Price',
  email: 'Email',
  // Ambiguous: email for what?
}
```

### Pluralization Support

```typescript
// For Arabic (has complex plural rules)
{
  items_singular: '{{ count }} إعلان',  // 1 item
  items_plural: '{{ count }} إعلانات',  // 2-10 items
  items_many: '{{ count }} إعلان',       // 11+ items
}

// Usage
const count = 5;
const key = count === 1 ? 'items_singular' : count <= 10 ? 'items_plural' : 'items_many';
t(key).replace('{{ count }}', count.toString());
```

### Gender Forms in Arabic

Arabic adjectives/verbs agree with gender; support both:

```typescript
{
  verified_masculine: 'موثق',
  verified_feminine: 'موثقة',
  responsive_masculine: 'سريع الرد',
  responsive_feminine: 'سريعة الرد',
}

// Usage (if seller gender known)
<span>{t(seller.gender === 'male' ? 'verified_masculine' : 'verified_feminine')}</span>
```

---

## 5. Locale-Aware Formatting

### Currency Formatting

```typescript
export function formatCurrency(
  amount: number,
  currency: string = 'SDG',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol',
  }).format(amount);
}

// Usage
formatCurrency(1500000, 'SDG', 'ar-SD')  // "١٫٥٠٠٫٠٠٠ دج" (Arabic numerals)
formatCurrency(1500000, 'SDG', 'en-US')  // "$1,500,000.00"
```

### Number Formatting

```typescript
export function formatNumber(num: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(num);
}

// Arabic-Indic numerals option
export function formatNumberArabic(num: number): string {
  const formatted = new Intl.NumberFormat('ar-SD').format(num);
  return formatted;  // Uses ٠١٢٣٤٥٦٧٨٩
}
```

### Date Formatting

```typescript
export function formatDate(
  date: Date,
  format: 'short' | 'long',
  locale: string = 'en-US'
): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: format === 'long' ? 'long' : 'numeric',
    day: 'numeric',
  }).format(date);
}

// Usage
formatDate(new Date(), 'long', 'ar-SD')  // "١ يناير ٢٠٢٤"
formatDate(new Date(), 'long', 'en-US')  // "January 1, 2024"
```

### Phone Number Formatting

```typescript
export function formatPhone(
  phone: string,
  countryCode: string = 'SD'
): string {
  // Production: Use libphonenumber-js for full validation + formatting
  // npm install libphonenumber-js
  // import { parsePhoneNumber } from 'libphonenumber-js';
  
  // Fallback: Simple regex-based formatting for Sudan
  const PHONE_SPECS: Record<string, { code: string; pattern: RegExp; format: string; description: string }> = {
    SD: {
      code: '+249',
      pattern: /^(?:\+249|0)?(\d{2})(\d{3})(\d{4})$/,
      format: '+249 $1 $2 $3',  // +249 90 123 4567
      description: 'Sudan: +249 [2-digit area] [3-digit exchange] [4-digit line]',
    },
    EG: {
      code: '+20',
      pattern: /^(?:\+20|0)?(\d{2})(\d{4})(\d{4})$/,
      format: '+20 $1 $2 $3',  // +20 10 1234 5678
      description: 'Egypt: +20 [2-digit mobile] [4-digit] [4-digit]',
    },
    AE: {
      code: '+971',
      pattern: /^(?:\+971|0)?(\d{2})(\d{3})(\d{4})$/,
      format: '+971 $1 $2 $3',  // +971 50 123 4567
      description: 'UAE: +971 [2-digit area] [3-digit] [4-digit]',
    },
  };
  
  const spec = PHONE_SPECS[countryCode] || PHONE_SPECS.SD;
  const cleaned = phone.replace(/\D/g, '');  // Remove non-digits
  const match = cleaned.match(spec.pattern);
  
  if (!match) {
    // Validation failed; return original
    console.warn(`Invalid phone format for ${countryCode}: ${phone}`);
    return phone;
  }
  
  return spec.format
    .replace('$1', match[1])
    .replace('$2', match[2])
    .replace('$3', match[3]);
}

/**
 * Production Implementation with libphonenumber-js:
 * 
 * import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
 * 
 * export function formatPhoneProduction(phone: string, countryCode: string = 'SD'): string {
 *   try {
 *     const parsed = parsePhoneNumber(phone, countryCode as any);
 *     if (!parsed) throw new Error('Parse failed');
 *     return parsed.format('INTERNATIONAL');  // +249 90 123 4567
 *   } catch (error) {
 *     console.error('Phone format error:', error);
 *     return phone;  // Return original on error
 *   }
 * }
 * 
 * export function isValidPhone(phone: string, countryCode: string = 'SD'): boolean {
 *   return isValidPhoneNumber(phone, countryCode as any);
 * }
 */
```
```

---

## 6. Dynamic Text Direction

### Mixed-Direction Content

Use `lang` and `dir` attributes strategically:

```tsx
// Arabic page with English product name
<main dir="rtl" lang="ar">
  <h1>أحدث المنتجات</h1>
  <p dir="ltr" lang="en">
    {/* English product name stays LTR */}
    Canon EOS R5 - Professional Mirrorless Camera
  </p>
</main>
```

### Announcement of Direction Changes

```typescript
// When language toggles, announce to screen readers
const [prevDir, setPrevDir] = useState('ltr');

useEffect(() => {
  const newDir = lang === 'ar' ? 'rtl' : 'ltr';
  if (newDir !== prevDir) {
    // Announce direction change
    announce(
      lang === 'ar'
        ? 'تم التبديل إلى اللغة العربية'
        : 'Switched to English'
    );
    setPrevDir(newDir);
  }
}, [lang, prevDir]);
```

---

## 7. Admin i18n Configuration

### CMS Content Translation

Each content type (policies, help, categories) should support multiple languages:

```typescript
// Database schema (pseudo)
{
  id: 'help-article-1',
  titleAr: 'كيفية نشر إعلان',
  titleEn: 'How to Post a Listing',
  contentAr: '...',
  contentEn: '...',
  updatedAt: '2024-01-15',
}
```

### Category Names

```typescript
interface Category {
  id: string;
  nameAr: 'سيارات',
  nameEn: 'Vehicles',
  fields: Field[];
}

// Usage
<h2>{lang === 'ar' ? category.nameAr : category.nameEn}</h2>
```

### Admin Panel Language

Admin dashboards typically support same languages as frontend:

```typescript
// Admin dashboard toggles language same as frontend
// No separate admin i18n needed unless different audience
```

---

## 8. Regional Expansion Template

### Adding New Language (e.g., French)

1. **Add to translations.ts:**
```typescript
export const translations = {
  ar: { /* ... */ },
  en: { /* ... */ },
  fr: { /* ... */ },  // Add French
};
```

2. **Update i18n hook:**
```typescript
export type Language = 'ar' | 'en' | 'fr';

<select onChange={(e) => setLang(e.target.value as Language)}>
  <option value="ar">العربية</option>
  <option value="en">English</option>
  <option value="fr">Français</option>
</select>
```

3. **Add font (if needed):**
```css
@import url('https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700');
```

4. **No code changes needed** — architecture already supports N languages

### Adding New Country (e.g., Egypt)

1. **Adjust phone country code:**
```typescript
// Phone input detects country
<PhoneInput country="EG" />  // Shows +20 prefix
```

2. **Currency support:**
```typescript
// Already generic
formatCurrency(1000, 'EGP', 'ar-EG')  // "٬٠٠٠،١ ج.م"
```

3. **Categories (if country-specific):**
```typescript
// Backend returns country-specific categories
const categories = await api.getCategories(country: 'EG');
```

---

## 9. RTL Testing Checklist

Before launch, verify RTL with these tests:

### Visual Inspection

- [ ] Header logo aligns right in RTL
- [ ] Navigation menu flows right-to-left
- [ ] Buttons with icons: icon positioned correctly
- [ ] Search bar and filters layout
- [ ] Listing cards and grids
- [ ] Forms: labels and inputs aligned
- [ ] Modals and dialogs positioned
- [ ] Bottom navigation (mobile)
- [ ] Dropdowns positioned (should open left side)
- [ ] Images and text flow

### Functionality Tests

- [ ] Buttons clickable, functional
- [ ] Forms submittable
- [ ] Navigation working
- [ ] Modals closable
- [ ] No horizontal scroll at any viewport
- [ ] Touch targets reachable (44×44px)

### Screen Reader Tests

- [ ] Page structure announced correctly
- [ ] Headings navigable
- [ ] Forms labeled properly
- [ ] Buttons announced with label
- [ ] Language direction announced on toggle

### Keyboard Navigation

- [ ] Tab order logical (right-to-left)
- [ ] Focus visible
- [ ] Enter/Space activates
- [ ] Escape closes modals
- [ ] Skip links work

---

## 10. i18n Implementation Checklist

### Phase 1: Core Setup (Before Launch)

- [ ] Translations file complete (ar + en for all UI text)
- [ ] i18n context integrated into app
- [ ] Language toggle button in header
- [ ] localStorage persists language choice
- [ ] document.dir and lang attributes set per language
- [ ] All hard-coded text replaced with t('key') calls
- [ ] Common formatters (currency, date, phone) implemented
- [ ] RTL logical properties applied across codebase
- [ ] Icons (if directional) flip in RTL
- [ ] Mixed-direction content uses <bdi> tags

### Phase 2: Regional Expansion (Post-Launch)

- [ ] Admin config for categories, translations, currency per region
- [ ] Country selector in app (when multi-country)
- [ ] Phone country codes validated per region
- [ ] Delivery zones configured per country
- [ ] Payment methods per region

### Phase 3: Content Management

- [ ] CMS for policy pages (Terms, Privacy) in multiple languages
- [ ] Category names editable per language
- [ ] Admin notifications in admin language preference
- [ ] Support for right-to-left CMS interface (if applicable)

---

## 11. Common Pitfalls & Solutions

### Pitfall 1: Placeholder as Label
❌ **Wrong:**
```tsx
<input placeholder="بحث" />
```

✅ **Right:**
```tsx
<label htmlFor="search">البحث</label>
<input id="search" placeholder="اكتب هنا..." />
```

### Pitfall 2: Hard-Coded Text in Components
❌ **Wrong:**
```tsx
<button>Add Listing</button>
```

✅ **Right:**
```tsx
<button>{t('addListing')}</button>
```

### Pitfall 3: Physical Properties in Layout
❌ **Wrong:**
```tsx
<div className="ml-4 pr-6">Content</div>
```

✅ **Right:**
```tsx
<div className="ms-4 pe-6">Content</div>
```

### Pitfall 4: Hardcoded Date Formats
❌ **Wrong:**
```tsx
<span>{new Date().toLocaleDateString()}</span>
```

✅ **Right:**
```tsx
<span>{formatDate(new Date(), 'long', lang === 'ar' ? 'ar-SD' : 'en-US')}</span>
```

### Pitfall 5: Icon Direction Not Considered
❌ **Wrong:**
```tsx
<ChevronLeft />  {/* Always points left */}
```

✅ **Right:**
```tsx
{lang === 'ar' ? <ChevronRight /> : <ChevronLeft />}
// Or use CSS transform: scaleX(-1) in RTL
```

---

## 12. Documentation & Maintenance

### Translation Manager Instructions

**Adding new string:**

1. Add to `translations.ts`:
```typescript
{
  ar: { feature_newString: 'نص جديد' },
  en: { feature_newString: 'New string' },
}
```

2. Use in component:
```typescript
<span>{t('feature_newString')}</span>
```

3. Test in both languages:
- Arabic (RTL)
- English (LTR)

**Do NOT:**
- Commit untranslated strings (key != value)
- Commit strings not in all languages
- Use inline template strings (non-translatable)

### RTL Auditor Instructions

**Audit checklist (monthly):**
- [ ] Run grep for `left:|right:|ml-|mr-` (find missed conversions)
- [ ] Visual inspection in RTL browser
- [ ] Screen reader test in Arabic
- [ ] New components reviewed for RTL compliance

---

## 13. File-by-File Logical Properties Audit

### Immediate (Must fix)

**src/components/AppShell.tsx**
- Line ~X: `right-1.5` → `end-1.5` (close button)
- Line ~Y: Check all positioning

**src/pages/HomePage.tsx**
- Check all `px-` usage; convert to `ps-` / `pe-`
- Check left/right margins

**src/pages/SearchPage.tsx**
- Filter panel positioning
- Sidebar positioning

### Short Term

- [ ] All pages audited
- [ ] All components audited
- [ ] Git blame added to track who added physical properties

### Tooling

Add ESLint rule to prevent future physical properties:

```javascript
// .eslintrc.js
{
  rules: {
    '@tailwindcss/enforce-logical-properties': 'error',
  },
}
```

---

## 14. Status & Timeline

**Current State:**
- i18n context implemented (basic)
- Translations incomplete (some keys missing)
- RTL partially applied (some components still use physical properties)
- Logical properties not systematically used

**Target:** Full WCAG AA compliance + seamless RTL/LTR toggle

**Deadline:** Before production launch

---

## Key Decisions (Locked)

1. **i18n architecture:** Context-based, centralized translations.ts
2. **Supported languages:** Arabic (primary) + English (secondary) at launch
3. **RTL support:** Full; all logical properties used
4. **Font strategy:** Cairo (display) + Noto Kufi Arabic (body) for Arabic; Inter for English
5. **Bidirectional text:** Use `<bdi>` tags for isolated content
6. **Formatting:** Intl API for locale-aware currency, dates, numbers
7. **Admin expansion:** CMS-driven for future countries

---

**Status:** LOCKED for implementation  
**Last Updated:** Design Phase  
**Maintained by:** Frontend & i18n Team

