# MARBOU Frontend Design Plan

**Project Phase:** Design Documentation  
**Scope:** Audit of existing frontend, identification of gaps, and design standardization for a large-scale, scalable, Arabic-first marketplace targeting Sudan.  
**Target Users:** 1000s of concurrent users across Web, iOS, Android  
**Design Philosophy:** Pixel-perfect, modern, professional; optimized for weak internet; RTL-safe; performance-conscious  

---

## 1. Design Tokens (Tailwind Config Extensions)

### Current State
- **Colors:** Core palettes exist (primary, sand, accent, success, warning, error)
- **Typography:** Cairo + Noto Kufi Arabic + Inter; weights 400, 500, 600, 700
- **Spacing:** Using default Tailwind scale
- **Shadows:** Minimal (only `shadow-sm`, `shadow-md`, implicit `shadow-lg`)
- **Border Radius:** Implicit utility usage; no named scale
- **Z-index:** Hard-coded values scattered (z-30, z-40, z-50, z-[90], z-[100])
- **Animations:** 4 keyframes (fade-in, slide-up, slide-down, scale-in); missing entrance/exit micro-interactions

### Findings & Recommendations

#### Gap 1: Border Radius Inconsistency
**Finding:** Rounded corners applied ad-hoc (xl, 2xl, lg, md, full). No semantic scale tied to component sizes.  
**Recommendation:** Define 5-tier radius scale:
- `rounded-xs` (2px) — small interactive elements, inputs
- `rounded-sm` (4px) — badges, chips  
- `rounded-md` (8px) — modals, cards (planned)
- `rounded-lg` (12px) — cards, large surfaces ✅ *already used as `.card { rounded-2xl }`*
- `rounded-xl` (16px) — primary buttons, form inputs ✅ *already used*
- `rounded-2xl` (20px) — hero sections, large containers ✅ *already used*

**Action:** Keep the 16px/20px usage; standardize buttons/inputs to explicit `rounded-xl`. Document that `.card` always uses `rounded-2xl`.

#### Gap 2: Shadow Scale Incomplete
**Finding:** Only `shadow-sm` and `shadow-md` defined in config; hard-coded `shadow-lg`, `shadow-xl`, `shadow-2xl` used inline in HomePage.tsx and other files. No depth semantics.  
**Recommendation:** Define 4-tier shadow depth scale:
- `shadow-xs` (0 1px 2px rgba(0,0,0,0.05)) — subtle, small elements
- `shadow-sm` (0 1px 3px rgba(0,0,0,0.1)) — cards, dropdowns ✅ *in use*
- `shadow-md` (0 4px 12px rgba(0,0,0,0.1)) — elevated modals, popovers
- `shadow-lg` (0 8px 24px rgba(0,0,0,0.12)) — z-stacking overlays

**Action:** Add these to Tailwind config; replace all inline `shadow-*` with semantic scale.

#### Gap 3: Z-Index Layering Strategy Missing
**Finding:** Z-indices scattered: z-30 (header), z-40 (overlays), z-50 (modal overlay), z-[90] (modal), z-[100] (toast). No documented stacking order.  
**Recommendation:** Define 6-layer z-index scale:
```
z-0    | Base content
z-10   | Sticky elements (LocationSelector dropdown)
z-20   | Floating elements (compare bar in BottomNav)
z-30   | Header / Nav bar
z-40   | Modal overlays / backdrops
z-50   | Modals, popovers, dropdowns
z-60   | Toast, notifications
```

**Action:** Add to tailwind.config.js; replace all hard-coded z-values with semantic tokens. Update AppShell and ui.tsx components.

#### Gap 4: Animation Library Too Sparse
**Finding:** Only 4 keyframes defined. Heavy use of `transition-all duration-200` for hover states but no standardized micro-interactions for:
- Loading state pulsing (already has `.skeleton` with `animate-pulse` but not themed)
- Success feedback bounce
- Error shake
- Empty state entrance

**Recommendation:** Add 6 new animations:
```
animate-bounce-in      | Subtle scale+fade entrance (items, modals)
animate-pulse-slow     | Gentle pulse for loading states
animate-shake          | X-axis shake for validation errors
animate-success-check  | Brief scale+rotate for checkmarks
animate-skeleton       | Themed gradient shimmer for data-saver mode
animate-flip-rtl       | Icon rotation for language switch
```

**Action:** Add keyframes to config. Update component library to use named animations instead of inline transforms.

#### Gap 5: Spacing Scale Incomplete for Dense Layouts
**Finding:** Standard Tailwind spacing (0, 2px, 4px, 6px, 8px...) used. For a marketplace with 1000+ items per view, no clear compact vs. spacious modes documented.  
**Recommendation:** Document 2 spacing profiles:
- **Default (Web):** Use Tailwind defaults (gap-3, gap-4, p-4)
- **Compact (Mobile, Data-Saver):** Tighter gaps (gap-2, gap-3, p-3) for dense grids

**Action:** Create CSS custom properties for responsive spacing; use Tailwind's `@apply` in compact media query.

#### Gap 6: Typography Scale Incomplete
**Finding:** Font sizes used ad-hoc (text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-4xl). Line height not defined per size.  
**Recommendation:** Define semantic typography scale with line-height:
```
text-xs  | 12px, line-height 16px  | Labels, captions
text-sm  | 14px, line-height 20px  | Body copy, chips
text-base| 16px, line-height 24px  | Standard body
text-lg  | 18px, line-height 26px  | Card titles
text-xl  | 20px, line-height 28px  | Section headers
text-2xl | 24px, line-height 32px  | Page titles
text-3xl | 30px, line-height 36px  | Hero titles
```

**Action:** Add `lineHeight` scale to Tailwind config; document in this plan under "Typography Scale."

#### Gap 7: Color Token Opacity Missing
**Finding:** Colors defined at 50-950 levels but no opacity variants documented for hover/disabled states.  
**Recommendation:** Define opacity modifier convention:
- Primary action hover: `bg-primary-700` (darker)
- Primary action disabled: `bg-primary-600/50` (muted)
- Overlay: `bg-primary-950/40` (with transparency)

**Action:** Document in this plan. Use Tailwind's `/` opacity syntax consistently.

### Deliverable: Tailwind Config Extensions

**File:** `tailwind.config.js`

Add to `theme.extend`:
```javascript
spacing: {
  // Compact profile (data-saver mode)
  'compact': {
    card: '0.75rem',    // 12px
    grid: '0.5rem',     // 8px
  },
},
borderRadius: {
  xs: '2px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  // Keep defaults for backward compat
},
boxShadow: {
  xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px rgba(0, 0, 0, 0.1)',    // ✓ existing
  md: '0 4px 12px rgba(0, 0, 0, 0.1)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
  // Keep defaults
},
zIndex: {
  base: '0',
  sticky: '10',
  floating: '20',
  header: '30',
  overlay: '40',
  modal: '50',
  toast: '60',
},
animation: {
  // Existing
  'fade-in': 'fadeIn 0.2s ease-out',
  'slide-up': 'slideUp 0.25s ease-out',
  'slide-down': 'slideDown 0.25s ease-out',
  'scale-in': 'scaleIn 0.15s ease-out',
  // New
  'bounce-in': 'bounceIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  'pulse-slow': 'pulseSlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  'shake': 'shake 0.4s ease-in-out',
},
keyframes: {
  // Existing + new
  bounceIn: {
    '0%': { transform: 'scale(0.95)', opacity: '0' },
    '50%': { transform: 'scale(1.02)' },
    '100%': { transform: 'scale(1)', opacity: '1' },
  },
  pulseSlow: {
    '0%, 100%': { opacity: '1' },
    '50%': { opacity: '0.7' },
  },
  shake: {
    '0%, 100%': { transform: 'translateX(0)' },
    '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
    '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
  },
},
lineHeight: {
  xs: '16px',
  sm: '20px',
  base: '24px',
  lg: '26px',
  xl: '28px',
  '2xl': '32px',
  '3xl': '36px',
},
```

---

## 2. Component API Documentation

### Current State
- 8 UI components exist (Toast, Modal, Badge, EmptyState, Skeleton, StatusBadge, RatingStars, TrustBadge, Breadcrumbs, ComingSoon)
- 2 major layout components (Header, BottomNav in AppShell)
- 2 listing display components (ListingCard, ListingCardGrid)
- Page-level components for Home, Search, Detail, Auth, Dashboards

### Findings & Recommendations

#### Gap 1: Missing High-Order Composition Patterns
**Finding:** Each page manually handles its own grid/list layouts, filtering, loading, empty states. No reusable "container" patterns.  
**Recommendation:** Create 3 higher-order component patterns:
1. **`<PageContainer />`** — wraps main content with max-width, responsive padding, SEO metadata
2. **`<GridContainer />`** — dynamic grid layout (2-5 cols) based on screen + data-saver mode, auto-adjusts column count
3. **`<DataContainer />`** — handles loading/empty/error states with unified skeleton and empty state UI

#### Gap 2: Form Component Set Incomplete
**Finding:** Only text `input` defined in `.input` class. Add/edit listing forms need:
- Textarea with character count
- Select with search (for categories, vehicle models)
- Checkbox group
- Radio group
- File uploader with preview
- Date/time picker
- Price input with currency selector
- Multi-select (for features, amenities)

**Recommendation:** Build form component library:
```typescript
<TextInput />          // Single-line with counter
<TextArea />           // Multi-line with character limit, live count
<Select />             // Dropdown with optional search
<SelectMulti />        // Multi-select with tags
<Checkbox />           // Accessible checkbox
<CheckboxGroup />      // Group of checkboxes
<Radio />              // Single radio
<RadioGroup />         // Group of radios
<FileUpload />         // With drag-drop, preview, progress
<DatePicker />         // Mobile-friendly date selector
<PriceInput />         // With currency picker & formatting
```

#### Gap 3: Dialog/Modal Types Not Differentiated
**Finding:** Single `<Modal />` component used for all overlays. Different interactions need different semantics:
- Confirmation dialogs (alert-like, with action buttons)
- Forms in modals (scrollable, can have footer buttons)
- Bottom sheets on mobile (slide-up modals)
- Popovers (anchored, click-to-close)
- Toast notifications (auto-close)

**Recommendation:** Create 4 specialized modal variants:
```typescript
<Modal />              // Generic, existing
<ConfirmDialog />      // Title + message + 2 buttons (OK/Cancel)
<BottomSheet />        // Mobile-first slide-up panel
<Popover />            // Anchored floating panel (dropdowns)
// Toast already exists
```

#### Gap 4: Card Component Variants Missing
**Finding:** `.card` class exists but only basic usage. For marketplace, need:
- Product card (image + price + seller info)
- Business/store card (logo + name + rating)
- Job card (company + title + salary)
- Review card (author + rating + comment)
- Message thread card
- Filter chip card (faceted navigation)

**Recommendation:** Create Card variants:
```typescript
<Card />               // Base
<Card.Header />        // Title bar with actions
<Card.Image />         // Image container with fallback
<Card.Content />       // Scrollable body
<Card.Footer />        // Fixed bottom actions
// + specialized: ProductCard, BusinessCard, JobCard (compose from base)
```

#### Gap 5: Badge/Label/Tag Confusion
**Finding:** `Badge`, `TrustBadge`, and `chip-*` classes do similar things. No clear hierarchy:
- Badges: small labels (status, categories)
- Chips: interactive tags (filters)
- Labels: field labels
- Badges with icons: trust markers

**Recommendation:** Standardize taxonomy:
```
Badge       → Status, metadata (not interactive, semantic color)
Chip        → Interactive filter, selectable (toggle-able)
Label       → Form field label (semantic color tied to field)
TrustBadge  → Seller/business credibility marker (icon + label)
Tag         → Removable label (has X button)
```

#### Gap 6: Accessibility Missing from Component Specs
**Finding:** Components lack ARIA labels, role attributes, focus management. No visible focus states.  
**Recommendation:** Add to every component:
- `aria-label` for icon-only buttons
- `role` attributes (button, tab, navigation)
- `:focus-visible` outline (not removed)
- Keyboard navigation support (Tab, Enter, Esc)
- Color contrast verified (AA minimum)
- Touch target size ≥ 44x44px on mobile

#### Gap 7: Loading & Error State Patterns
**Finding:** Skeletons exist but error states scattered. No unified error boundary or retry pattern.  
**Recommendation:** Create:
```typescript
<Skeleton />            // Existing, use in lists
<SkeletonGroup count={N} />  // Multiple skeletons
<ErrorBoundary />       // Wrapper with fallback UI
<ErrorState />          // "Something went wrong" card with retry
<Retry />               // Retry button + countdown (weak net)
<SyncStatus />          // "Syncing...", "Failed", "✓ Synced" indicator
```

### Deliverable: Component API Reference

**File:** `src/components/README.md` (new)

Create comprehensive component docs with:
- Component name, purpose, props table
- Usage examples (code snippets)
- Variants and states (interactive)
- Accessibility notes
- Performance tips (memoization, lazy-loading triggers)

Example structure:
```markdown
## Badge

**Purpose:** Display small, non-interactive metadata labels (status, category, trust marker).

**Props:**
| Prop      | Type                                           | Default | Notes |
|-----------|------------------------------------------------|---------|-------|
| children  | ReactNode                                      | —       | Content to display |
| variant   | 'default' \| 'success' \| 'error' \| 'accent' | 'default' | Color scheme |

**Accessibility:**
- Uses `<span role="status">` if aria-live updates expected
- Color not the only differentiator; includes icon or text label

**Examples:**
```tsx
<Badge variant="success">Listed</Badge>
<Badge variant="error">Rejected</Badge>
```

---

## 3. Performance & Code-Splitting Strategy

### Current State
- Single-page app (Vite + React 18)
- No explicit code-splitting; all routes bundled together
- Images loaded with `loading="lazy"` but no size optimization
- ListingCard has `dataSaver` prop but images still full-res

### Findings & Recommendations

#### Gap 1: Route-Based Code Splitting Missing
**Finding:** All pages (HomePage, SearchPage, DetailPage, etc.) imported in App.tsx, bundled together. Large marketplace = large bundle.  
**Recommendation:** Implement route-based code-splitting with React.lazy + Suspense:
```typescript
// Router.tsx
const HomePage = lazy(() => import('./pages/HomePage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const ListingDetailPage = lazy(() => import('./pages/ListingDetailPage'));
// ... etc

// Wrap routes with <Suspense fallback={<PageSkeleton />}>
```

**Expected Impact:** Each route bundle reduced by 60-70% on initial load. Cold start time for secondary pages ≤ 200ms on 3G.

#### Gap 2: Image Optimization Strategy Incomplete
**Finding:** ListingCard uses `loading="lazy"` but:
- No srcset for responsive sizes
- No WebP/AVIF format detection
- No thumbnail/placeholder strategy
- Data-saver mode just applies gradient (doesn't skip images)

**Recommendation:** Implement image optimization layer:
1. **Server-side:** Generate thumbnails (100x75px for grid, 40x40px for thumbnails)
2. **Client-side:** Use picture element with srcset:
   ```html
   <picture>
     <source srcset="img-sm.webp 400w, img-md.webp 800w" type="image/webp" />
     <source srcset="img-sm.jpg 400w, img-md.jpg 800w" type="image/jpeg" />
     <img src="img.jpg" alt="..." loading="lazy" />
   </picture>
   ```
3. **Data-saver mode:** Load thumbnail + low-quality blur instead of full image
4. **Placeholder:** Use blurhash or LQIP (low-quality image placeholder) while loading

#### Gap 3: Virtual Scrolling Not Implemented
**Finding:** Grids with 50+ items all rendered in DOM. Mobile performance degrades with >100 items visible.  
**Recommendation:** Use `react-window` for long lists:
```typescript
import { FixedSizeGrid } from 'react-window';

<FixedSizeGrid
  columnCount={3}
  columnWidth={120}
  height={600}
  rowCount={Math.ceil(items.length / 3)}
  rowHeight={180}
  width={width}
>
  {({ columnIndex, rowIndex, style }) => (
    <ListingCard listing={items[rowIndex * 3 + columnIndex]} style={style} />
  )}
</FixedSizeGrid>
```

**Expected Impact:** Render 50 items in 8ms instead of 200ms. Smooth scrolling at 60fps.

#### Gap 4: Component Memoization Incomplete
**Finding:** No React.memo used. Parent re-render causes all child ListingCards to re-render unnecessarily.  
**Recommendation:** Wrap expensive components with memo:
```typescript
export const ListingCard = memo(function ListingCard({ listing, layout }) {
  // ... component code
}, (prev, next) => prev.listing.id === next.listing.id && prev.layout === next.layout);
```

Apply to:
- `ListingCard` (expensive image + DOM)
- `BusinessCard` (network request for rating)
- `JobCard` (complex data transforms)
- Chip/filter components (many instances)

**Expected Impact:** Re-renders reduced by 70% during user interactions.

#### Gap 5: Data Fetching & Caching Not Optimized
**Finding:** Mock data; no caching strategy documented. Real API calls will need:
- Request deduplication (same query twice = one API call)
- Cache invalidation strategy
- Stale-while-revalidate pattern
- Background sync for offline drafts

**Recommendation:** Document caching layer:
- **Listings:** Cache with 5-minute TTL, refresh on search filters change
- **Categories/Cities:** Cache permanently (refresh on app upgrade)
- **User data:** Cache with 30-second TTL, invalidate on logout
- **Search results:** Cache keyed by query+filters

**Action:** Implement with `react-query` or custom hook pattern when backend is ready.

#### Gap 6: Bundle Size Analysis Missing
**Finding:** No metrics for JS bundle size, CSS size, gzip overhead.  
**Recommendation:** Add build analysis:
1. Use `vite-plugin-visualizer` to inspect bundle
2. Set size budgets:
   - Initial bundle: ≤ 200KB gzip
   - Vendor (React, router, i18n): ≤ 120KB
   - Per route: ≤ 80KB
3. Monitor with CI/CD

**Action:** Add to package.json scripts:
```json
"analyze": "vite build && vite-plugin-visualizer"
```

#### Gap 7: Weak Internet Optimization Incomplete
**Finding:** Data-saver mode exists but doesn't affect bundle size or delivery strategy.  
**Recommendation:** Implement adaptive loading:
```typescript
const useAdaptiveLoad = () => {
  const connection = navigator.connection;
  const isSlowNetwork = connection?.effectiveType === '3g' || connection?.saveData;
  return {
    skipImages: isSlowNetwork,
    lowQuality: isSlowNetwork,
    reducedAnimations: isSlowNetwork,
  };
};
```

Use this to:
- Skip image loading in grid (show placeholder)
- Reduce animation frame rate (use `prefers-reduced-motion`)
- Defer non-critical renders (search suggestions, trending)

### Deliverable: Performance Budget & Optimization Roadmap

**File:** `docs/performance-roadmap.md` (new)

Document:
- Bundle size targets (by route)
- Image optimization strategy (formats, sizes, placeholders)
- Code-splitting plan (which routes load when)
- Memoization checklist (which components to memo)
- Weak internet UX patterns (covered in Section 7)

---

## 4. Accessibility Checklist (WCAG AA)

### Current State
- Basic semantic HTML (buttons, inputs, nav)
- No ARIA labels on icon-only elements
- Focus states not visible
- Color contrast not verified
- Touch targets vary (some < 44x44px)
- Keyboard navigation incomplete

### Findings & Recommendations

#### Gap 1: Icon-Only Buttons Missing ARIA Labels
**Finding:** NetworkStatusControl, LangSwitch, favorite heart buttons lack `aria-label`.  
**Recommendation:** Add to all icon-only buttons:
```tsx
<button aria-label={t('switchLanguage')} title={t('switchLanguage')}>
  <Globe className="w-4 h-4" />
</button>
```

#### Gap 2: Focus States Invisible or Missing
**Finding:** `:focus` not visible on buttons, inputs. Tab navigation hard to follow.  
**Recommendation:** Add visible focus outlines:
```css
@layer components {
  .focus-ring {
    @apply focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2;
  }
  button, input, [role="button"] {
    @apply focus-ring;
  }
}
```

#### Gap 3: Color Contrast Not Verified
**Finding:** Assumed good contrast; no testing done. Text-sand-300 on sand-50 background may fail.  
**Recommendation:** Audit all text/background combinations:
| Text Color | Background | Contrast | AA Pass? |
|---|---|---|---|
| primary-700 | sand-50 | ? | Check |
| primary-400 | white | ? | Check |
| sand-300 | sand-100 | ? | ❌ Likely fails |

**Action:** Use WebAIM contrast checker. Ensure ≥ 4.5:1 for normal text, ≥ 3:1 for large text.

#### Gap 4: Touch Target Sizes Inconsistent
**Finding:** 
- Bottom nav icons: ≥ 44x44px ✓
- Header icons: ~40x40px (close, acceptable)
- Chip buttons: ~32x32px ❌ Too small

**Recommendation:** Set minimum:
```css
@layer components {
  button, [role="button"], input {
    @apply min-h-[44px] min-w-[44px] sm:min-h-10 sm:min-w-10;
  }
}
```

#### Gap 5: Form Accessibility Gaps
**Finding:**
- No `<label>` associated with inputs
- Placeholder used as label (disappears on focus)
- Error messages not tied to inputs via `aria-describedby`

**Recommendation:** Implement accessible form pattern:
```tsx
<div>
  <label htmlFor="search" className="...">Search</label>
  <input id="search" aria-describedby="search-error" />
  <span id="search-error" role="alert">{error}</span>
</div>
```

#### Gap 6: Modal Accessibility
**Finding:** Modal has dialog structure but:
- No `role="dialog"` or `role="alertdialog"`
- Focus not trapped (can Tab out)
- No announcement of open state

**Recommendation:** Update Modal:
```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  onKeyDown={(e) => e.key === 'Escape' && onClose()}
>
  <h3 id="modal-title">{title}</h3>
  {children}
</div>
```

#### Gap 7: Semantic HTML Not Used Fully
**Finding:**
- Dropdowns using divs + click handlers instead of `<select>`
- Tabs not using `role="tab"` pattern
- Lists using divs instead of `<ul>/<li>`

**Recommendation:** Use semantic HTML:
- Lists: `<ul><li>` with proper nesting
- Tabs: `role="tab"`, `role="tablist"`, `aria-selected`
- Disclosure: `<details>/<summary>`
- Buttons: `<button>` not `<div role="button">`

#### Gap 8: Language Switching Missing ARIA
**Finding:** Changing language doesn't announce to screen readers.  
**Recommendation:** Add ARIA live region:
```tsx
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {lang === 'ar' ? 'اللغة: العربية' : 'Language: English'}
</div>
```

#### Gap 9: Reduced Motion Not Respected
**Finding:** Animations run for all users. Those with `prefers-reduced-motion` may experience discomfort.  
**Recommendation:** Add media query support:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### Gap 10: Search Results Not Announced
**Finding:** Filtering/sorting updates results but screen readers don't announce changes.  
**Recommendation:** Use `aria-live` region:
```tsx
<div aria-live="polite" aria-atomic="true">
  {results.length} listings found
</div>
```

### Deliverable: Accessibility Implementation Guide

**File:** `docs/accessibility.md` (new)

Create checklist for each component:
- Icon-only buttons: Must have aria-label
- Form inputs: Must have <label> or aria-label
- Modals: Must trap focus, have aria-modal
- Lists: Use semantic <ul>/<li>
- Color: Minimum 4.5:1 contrast for normal text
- Touch: Minimum 44x44px (mobile)

Add automated testing:
```
npm install --save-dev axe-core @axe-core/react
// Run in dev mode to catch violations
```

---

## 5. RTL & i18n Implementation Guide

### Current State
- i18n hook implemented (I18nContext.tsx)
- Language toggle works (ar/en)
- RTL applied globally (`document.documentElement.dir`)
- Some Tailwind logical properties used (`start-`, `end-`)
- Arabic fonts included (Noto Kufi Arabic, Cairo)

### Findings & Recommendations

#### Gap 1: Logical CSS Properties Inconsistently Applied
**Finding:** Search across components found:
- `start-0`, `end-0`, `inset-0` used in some places
- Hard-coded `left`, `right` used in others (LocationSelector dropdown, modals)
- Mixed: `ps-10` (padding-start) next to `pl-4` (padding-left)

**Examples of issues:**
```tsx
// ❌ BAD (hardcoded left)
<div className="absolute start-0 top-1/2 -translate-y-1/2 w-48 ...">
// This will be on the right side in RTL but width still extends wrong direction

// ✅ GOOD
<div className="absolute inset-0 ..."> // all sides
<div className="absolute top-0 start-0 end-auto w-48 ..."> // explicit start
```

**Recommendation:** Audit all components and replace:
| Old | New | When |
|---|---|---|
| left | start | positioning |
| right | end | positioning |
| ml | ms | margin |
| mr | me | margin |
| pl | ps | padding |
| pr | pe | padding |
| border-l | border-s | borders |
| border-r | border-e | borders |

**Action:** Create a "RTL Audit" task to scan all components and fix.

#### Gap 2: Transform Directions Not RTL-Aware
**Finding:** 
- `translate-x-1/2 rtl:-translate-x-1/2` used in some places (AppShell.tsx) — good
- But focus ring offsets, modal animations, slider positions don't flip in RTL

**Recommendation:** For any `translateX`, `scaleX`, or `rotateY`:
```tsx
// Always include RTL variant
<div className="translate-x-5 rtl:-translate-x-5">
// Or use CSS variable
style={{ '--translate-x': 'rtl' === 'rtl' ? '-5px' : '5px' }}
```

#### Gap 3: Text Alignment Automatic but Directional Content Not
**Finding:** Text inherits `[dir="rtl"]` body alignment. But:
- Numbers in mixed text (prices) may need explicit direction
- URLs in Arabic text need `<bdi>` tag
- Icons next to Arabic text need reordering

**Recommendation:** Use `<bdi>` for bidirectional text:
```tsx
<span>السعر: <bdi>500,000 EGP</bdi></span>
```

#### Gap 4: Icon Positioning Reverses Without Explicit Declaration
**Finding:** Gap between icon and text:
```tsx
<button className="flex items-center gap-2">
  <Icon className="w-4 h-4" />
  <span>Label</span>
</button>
```
In RTL, this becomes: `Label Icon` (reversed). But if text is important and icon decorative, this might be undesired. Need explicit control.

**Recommendation:** Use Flex direction with RTL awareness:
```tsx
// Icon on the left (both LTR and RTL)
<button className="flex items-center gap-2">
  <Icon /> <span>Label</span>
</button>

// Icon on the right (both LTR and RTL)
<button className="flex items-center gap-2 flex-row-reverse rtl:flex-row">
  <Icon /> <span>Label</span>
</button>
```

#### Gap 5: Category Icons & Emojis May Not Be Culturally Appropriate
**Finding:** Icons use Lucide React (Western design). Emoji icons in HomePage (🚗, 🏠, etc.) may not resize well in RTL.  
**Recommendation:**
1. Use consistent icon set (Lucide is fine for interface; avoid emoji in UI)
2. For category icons, ensure they work equally well mirrored

#### Gap 6: Numeric Formats & Localization Incomplete
**Finding:** Prices formatted correctly using Intl.toLocaleString. But:
- Phone numbers format: `+249123456789` vs. `249 123 456 789` (no formatting)
- Dates: Full names in Arabic ("يناير") vs. English ("January")

**Recommendation:** Extend i18n formatter:
```typescript
const formatPhone = (phone: string, country: 'SD' | 'EG' | 'AE') => {
  const formats = { SD: '+249 XX XXX XXXX', EG: '+20 XX XXXX XXXX' };
  // Implement with libphonenumber-js
};

const formatDate = (date: Date, format: 'long' | 'short') => {
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: format === 'long' ? 'long' : 'numeric',
    day: 'numeric',
  }).format(date);
};
```

#### Gap 7: Copy Direction Assumption in Modals
**Finding:** Modals center content. But RTL text with LTR numbers (prices) may look misaligned.  
**Recommendation:** Use `text-start` for body text (respects dir attribute):
```tsx
<Modal>
  <p className="text-start">{description}</p>
</Modal>
```

#### Gap 8: Arrow Indicators & Chevrons Don't Flip
**Finding:** ChevronDown, ChevronLeft, ArrowRight rotate but don't flip for RTL.  
**Recommendation:** Create RTL-aware icon wrapper:
```tsx
const RTLIcon = ({ icon: Icon, rtlRotate = 0 }) => {
  const { dir } = useI18n();
  return <Icon style={{ transform: dir === 'rtl' ? `rotateY(180deg) ${rtlRotate}` : '' }} />;
};
```

### Deliverable: RTL Implementation Checklist

**File:** `docs/rtl-guide.md` (new)

Document:
1. **Position:** Use `start-*`, `end-*`, never `left-*`, `right-*`
2. **Transform:** Add `rtl:` variants for `translateX`, `scaleX`
3. **Text:** Use `text-start`/`text-end` for body copy
4. **Flex:** Reverse icon+label with `flex-row-reverse rtl:flex-row`
5. **Numbers:** Wrap with `<bdi>` in mixed-direction text
6. **Dates/Prices:** Format with locale-aware formatters
7. **Icons:** Use Lucide (no emoji); ensure work equally mirrored
8. **Audit:** Run automated check: grep for hardcoded `left:|right:|ml-|mr-` patterns

---

## 6. Image Optimization & Lazy Loading Strategy

### Current State
- Images loaded with `loading="lazy"`
- No srcset or size optimization
- Data-saver mode shows gradient, doesn't skip images
- Mock images (50x50px placeholder URLs)

### Findings & Recommendations

#### Gap 1: Image Sizes Not Optimized for Device
**Finding:** Single image URL served to all devices. Mobile gets 1920x1440px when 400x300px would suffice.  
**Recommendation:** Generate multiple sizes and use srcset:

| Context | Dimensions | Format | Max KB |
|---|---|---|---|
| Grid thumbnail | 300x225px | WebP | 25 |
| List view | 400x300px | WebP | 40 |
| Detail full | 1200x900px | WebP+JPEG | 120 |
| Mobile detail | 600x450px | WebP | 60 |

**Action:** Document server-side image generation requirements for backend team.

#### Gap 2: No Lazy Loading Threshold Defined
**Finding:** `loading="lazy"` uses browser default (often too late). Images load when viewport = within 1 screen-height.  
**Recommendation:** Use Intersection Observer for earlier loading:
```typescript
const useImageLazyLoad = () => {
  const ref = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setImageSrc(entry.target.dataset.src);
        observer.unobserve(entry.target);
      }
    }, { rootMargin: '50px' }); // Load 50px before viewport
    
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, imageSrc];
};
```

#### Gap 3: Placeholder Strategy Weak
**Finding:** Blank space or gradient while loading. For marketplace, placeholder matters (shows user something is loading).  
**Recommendation:** Implement progressive image loading:
1. **LQIP (Low-Quality Image Placeholder):** Inline 4x3 thumbnail, blurred
   ```html
   <img src="data:image/svg+xml,%3Csvg..." alt="..." />
   ```
2. **Blurhash:** More compact than LQIP
   ```typescript
   import { decode } from 'blurhash';
   const blurHash = "UNQvV#M{OfIU00oJodS3" // from server
   const pixels = decode(blurHash, 4, 3); // 4x3 placeholder
   ```
3. **Canvas:** Draw blurhash on canvas, show as placeholder

**Recommendation:** Use blurhash for marketplace:
- Backend generates blurhash for each image
- Frontend shows blurhash placeholder while image loads
- Real image fades in on top

#### Gap 4: WebP Support Not Detected
**Finding:** No feature detection for modern formats (WebP, AVIF). Older browsers get JPEG.  
**Recommendation:** Use picture element with fallbacks:
```tsx
<picture>
  <source srcSet="image.avif" type="image/avif" />
  <source srcSet="image-sm.webp, image-md.webp 2x" type="image/webp" />
  <source srcSet="image-sm.jpg, image-md.jpg 2x" type="image/jpeg" />
  <img src="image.jpg" alt="..." loading="lazy" />
</picture>
```

#### Gap 5: Responsive Image Display Not Planned
**Finding:** Same image used for 1x and 2x displays. No art direction for mobile.  
**Recommendation:** Define responsive breakpoints:
```
Mobile (<640px):   300x225px
Tablet (640-1024): 400x300px
Desktop (>1024):   600x450px
```

Use `srcset` with sizes attribute:
```html
<img
  srcset="image-sm.jpg 300px, image-md.jpg 600px, image-lg.jpg 900px"
  sizes="(max-width: 640px) 300px, (max-width: 1024px) 400px, 600px"
  src="image.jpg"
  alt="..."
  loading="lazy"
/>
```

#### Gap 6: Video Optimization Missing
**Finding:** SRS mentions video support (30s max, 15 MB) but no compression strategy.  
**Recommendation:** Create video optimization guide:
- **Codec:** VP9 (Chromium) + H.264 (iOS)
- **Resolution:** 1920x1080 max (reduces to 720p on mobile)
- **Bitrate:** 2-5 Mbps (adjust by connection)
- **Compression:** Server-side with FFmpeg

Backend must:
```bash
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 output.webm
ffmpeg -i input.mp4 -c:v libx264 -crf 23 output.mp4
```

#### Gap 7: Image Caching Strategy Undefined
**Finding:** No cache headers or service-worker caching strategy.  
**Recommendation:** Implement caching:
- **Static images (avatars, logos):** Cache-Control: max-age=31536000 (1 year)
- **Listing images:** Cache-Control: max-age=2592000 (30 days)
- **Thumbnails:** Cache-Control: max-age=86400 (1 day)

Use service worker:
```typescript
// service-worker.ts
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/images/')) {
    event.respondWith(
      caches.open('images-v1').then((cache) =>
        cache.match(event.request).then((response) =>
          response || fetch(event.request).then((resp) => {
            cache.put(event.request, resp.clone());
            return resp;
          })
        )
      )
    );
  }
});
```

#### Gap 8: Data-Saver Mode Not Implemented for Images
**Finding:** Data-saver flag exists but only applies gradient overlay.  
**Recommendation:** When data-saver enabled:
1. Load 25% of images by default (hero + above fold)
2. Load others on scroll (with user permission)
3. Serve thumbnail quality only (150x112px)
4. Skip video thumbnails entirely

#### Gap 9: CDN Strategy Missing
**Finding:** Images served from same origin. For 1000+ concurrent users, need CDN.  
**Recommendation:** Plan CDN implementation:
- **Service:** Cloudflare, AWS CloudFront, or Bunny
- **Image transformation:** Use CDN's image API (Cloudflare Polish, Imgix)
- **Fallback:** Origin server if CDN unavailable

### Deliverable: Image Optimization Implementation Plan

**File:** `docs/image-optimization.md` (new)

Document:
1. **Image sizes:** Table of dimensions/formats for each context
2. **Formats:** WebP primary, JPEG fallback, AVIF for future
3. **Placeholders:** Implement blurhash-based progressive loading
4. **Responsive:** srcset + sizes attributes for all images
5. **Lazy loading:** Intersection Observer with 50px margin
6. **Video:** VP9+H.264, 2-5 Mbps bitrate, 30s max, server-side compression
7. **Caching:** Cache-Control headers + service worker strategy
8. **Data-saver:** Thumbnail quality, skip videos, load on-scroll
9. **CDN:** Plan integration (service, image transformation API)

---

## 7. Weak Internet UX Patterns Document

### Current State
- Network state toggle exists (connected, slow, offline)
- Data-saver mode flag exists
- No offline support, no sync queue, no retry logic

### Findings & Recommendations

#### Gap 1: Offline Drafts Not Persisted
**Finding:** User creates listing but connection drops. Data lost. No local draft.  
**Recommendation:** Implement draft persistence with IndexedDB:
```typescript
interface Draft {
  id: string;
  type: 'listing' | 'message' | 'application';
  data: any;
  status: 'draft' | 'pending' | 'failed';
  syncedAt: number;
  createdAt: number;
  images: Blob[];
}

const useDraft = (id: string) => {
  const [draft, setDraft] = useState<Draft | null>(null);

  const saveDraft = async (data: any, images: Blob[]) => {
    const db = await openDB('marbou', 1, {
      upgrade(db) { db.createObjectStore('drafts', { keyPath: 'id' }); },
    });
    const draftRecord = { id, type: 'listing', data, images, status: 'draft', createdAt: Date.now() };
    await db.put('drafts', draftRecord);
    setDraft(draftRecord);
  };

  return { draft, saveDraft };
};
```

#### Gap 2: Sync Status Not Communicated
**Finding:** User doesn't know if message was sent. Shows checkmarks but might be optimistic.  
**Recommendation:** Implement visual sync status indicator:
```
UNSENT       → Gray X (red outline, user can retry)
SENDING      → Gray spinner
SENT         → Single checkmark (on server)
DELIVERED    → Double checkmark (recipient got it)
READ         → Blue checkmark
FAILED       → Red X (tap to retry)
```

Show inline in messages:
```tsx
<message>
  <span>{text}</span>
  <SyncStatus status={syncStatus} />
</message>
```

#### Gap 3: Retry Logic Not Implemented
**Finding:** Failed uploads have no retry mechanism. User must re-submit.  
**Recommendation:** Implement exponential backoff retry:
```typescript
const retryWithBackoff = async (fn: () => Promise<any>, maxRetries = 5) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const delay = Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30s
      await new Promise((resolve) => setTimeout(resolve, delay));
      if (attempt === maxRetries - 1) throw error;
    }
  }
};
```

Wrap API calls:
```typescript
const sendMessage = async (msg) => {
  try {
    await retryWithBackoff(() => api.messages.send(msg));
    setSyncStatus('delivered');
  } catch {
    setSyncStatus('failed');
    showRetryButton();
  }
};
```

#### Gap 4: Connection Change Not Detected
**Finding:** User loses connection, app doesn't react. Still shows "Sending...".  
**Recommendation:** Monitor connection with Navigator.connection API:
```typescript
const useNetworkStatus = () => {
  const [status, setStatus] = useState<'connected' | 'slow' | 'offline'>('connected');

  useEffect(() => {
    const connection = navigator.connection || (navigator as any).mozConnection;
    if (!connection) return;

    const updateStatus = () => {
      if (!navigator.onLine) {
        setStatus('offline');
      } else if (connection.effectiveType === '4g') {
        setStatus('connected');
      } else {
        setStatus('slow');
      }
    };

    updateStatus();
    connection.addEventListener('change', updateStatus);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    return () => {
      connection.removeEventListener('change', updateStatus);
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  return status;
};
```

#### Gap 5: Form Validation Deferred on Slow Net
**Finding:** User waits for category auto-complete to load on 3G. UX blocked.  
**Recommendation:** Implement optimistic UI:
1. Show local category list immediately (cached)
2. Fetch fresh list in background
3. Only update if new data differs

```typescript
const [categories, setCategories] = useState(cachedCategories);

useEffect(() => {
  fetchCategories().then((fresh) => {
    if (JSON.stringify(fresh) !== JSON.stringify(cached)) {
      setCategories(fresh);
    }
  });
}, []);
```

#### Gap 6: Large Uploads Not Chunked
**Finding:** Uploading 15 MB video on weak net times out. No resume capability.  
**Recommendation:** Implement chunked upload with resume:
```typescript
const uploadChunked = async (file: File, chunkSize = 1024 * 1024) => {
  const chunks = Math.ceil(file.size / chunkSize);
  const uploadId = Math.random().toString(36);

  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    await api.uploads.chunk(uploadId, i, chunks, chunk);
    onProgress(((i + 1) / chunks) * 100);
  }

  return api.uploads.finalize(uploadId);
};
```

#### Gap 7: Search Results Not Cached
**Finding:** User searches, finds result, goes back, searches again. Re-fetches. Wasted data.  
**Recommendation:** Implement search cache with stale-while-revalidate:
```typescript
const cachedSearch = new Map(); // or IndexedDB for persistence

const search = async (query: string) => {
  const key = JSON.stringify(query);
  const cached = cachedSearch.get(key);

  if (cached && Date.now() - cached.time < 5 * 60 * 1000) {
    // Return cached, refresh in background
    fetchSearch(query).then((fresh) => {
      cachedSearch.set(key, { results: fresh, time: Date.now() });
    });
    return cached.results;
  }

  return await fetchSearch(query);
};
```

#### Gap 8: Pagination Doesn't Work Offline
**Finding:** User loads page 1, goes offline, page 2 button does nothing. No error shown.  
**Recommendation:** Implement offline-aware pagination:
```typescript
const nextPage = async () => {
  if (!navigator.onLine) {
    showAlert(t('offlineCannotLoadMore'));
    return;
  }
  setLoading(true);
  try {
    const nextResults = await fetchResults(page + 1);
    setResults([...results, ...nextResults]);
    setPage(page + 1);
  } catch (error) {
    if (!navigator.onLine) {
      showAlert(t('connectionLost'));
    } else {
      showRetry();
    }
  }
};
```

#### Gap 9: Service Worker Not Implemented
**Finding:** No offline cache, no background sync.  
**Recommendation:** Create service worker for offline support:
```typescript
// sw.ts
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('marbou-v1').then((cache) =>
      cache.addAll(['/index.html', '/app.js', '/app.css'])
    )
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then((response) =>
        response || fetch(event.request).catch(() => new Response('Offline'))
      )
    );
  }
});

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncPendingMessages());
  }
});
```

#### Gap 10: Idempotency Not Implemented
**Finding:** User taps "Send" twice. Message sent twice (duplicate). Network retry causes duplication.  
**Recommendation:** Add idempotency keys:
```typescript
const sendMessage = async (msg: Message) => {
  const idempotencyKey = `msg-${msg.id}-${Date.now()}`;
  
  try {
    await api.messages.send(msg, {
      headers: { 'Idempotency-Key': idempotencyKey },
    });
  } catch (error) {
    // Backend deduplicates on retry
    if (error.response?.status === 409) {
      // Already sent
      return;
    }
    throw error;
  }
};
```

Backend must:
1. Store idempotency key + response
2. Return cached response if key seen again
3. Expire cache after 24 hours

#### Gap 11: Bandwidth Throttling Not Tested
**Finding:** Assumed 3G works, but behavior untested. May break at 1G speeds.  
**Recommendation:** Test and document behavior at speeds:
- **WiFi (50+ Mbps):** Full quality, all images
- **4G (10 Mbps):** Standard quality, lazy-load below fold
- **3G (2 Mbps):** Low quality, minimal images, skip video
- **2G (0.5 Mbps):** Text-only mode, no images

### Deliverable: Weak Internet UX Patterns Guide

**File:** `docs/weak-internet-ux.md` (new)

Document:
1. **Offline drafts:** IndexedDB persistence, draft recovery UI
2. **Sync status:** Visual indicators (unsent, sending, sent, delivered, failed)
3. **Retry logic:** Exponential backoff, max 5 attempts, 30s cap
4. **Network detection:** Monitor navigator.connection + online/offline events
5. **Optimistic UI:** Show cached data, refresh in background
6. **Chunked uploads:** Resume capability, progress tracking
7. **Search caching:** Stale-while-revalidate pattern
8. **Offline pagination:** Show error, disable next button
9. **Service worker:** Offline cache, background sync
10. **Idempotency:** Keys + server-side deduplication
11. **Test plan:** Document behavior at WiFi, 4G, 3G, 2G speeds

---

## Implementation Priorities

### Phase 1: Design System Stability (Week 1)
1. Add design tokens (border-radius, shadows, z-index scale)
2. Create component API reference
3. Audit RTL usage, fix hard-coded left/right

### Phase 2: Accessibility Baseline (Week 1-2)
1. Add aria-labels to icon buttons
2. Fix focus states (visible outlines)
3. Verify color contrast, fix failures
4. Ensure 44x44px touch targets

### Phase 3: Performance Foundations (Week 2-3)
1. Implement route-based code-splitting
2. Set up image optimization (blurhash, srcset)
3. Add React.memo to expensive components
4. Implement virtual scrolling for long lists

### Phase 4: Offline & Weak Internet (Week 3-4)
1. Implement IndexedDB draft persistence
2. Add sync status indicators
3. Implement exponential backoff retry
4. Add service worker for offline cache

### Phase 5: Documentation & QA (Week 4)
1. Write component API docs
2. Create accessibility checklist
3. Document RTL implementation
4. Test weak internet scenarios (3G, 2G simulation)

---

## Success Metrics

- **Performance:** First contentful paint ≤ 1.5s on 3G
- **Bundle size:** ≤ 200KB gzip (initial)
- **Accessibility:** WCAG AA for all pages (tested with axe-core)
- **RTL:** No hard-coded left/right; 100% logical properties
- **Weak internet:** App functional on 2G, offline drafts persist
- **Scalability:** 50+ items render in <100ms (memoization + virtual scroll)

---

## Appendices

### A. File Structure for Design Documentation
```
docs/
├── design-tokens.md         # Color, typography, spacing scale
├── component-api.md         # Every component's props, examples, a11y
├── performance-roadmap.md   # Code-splitting, image optimization
├── accessibility.md         # WCAG AA checklist, testing steps
├── rtl-guide.md            # Logical properties, text direction, localization
├── image-optimization.md   # Sizes, formats, lazy-loading, CDN strategy
├── weak-internet-ux.md     # Offline drafts, sync, retry, SW patterns
```

### B. Resources & Tools
- **Design tokens:** Tailwind config, style-dictionary for sync
- **Accessibility testing:** axe-core, WebAIM contrast checker
- **Image optimization:** Blurhash, sharp (Node image processor)
- **Performance testing:** Lighthouse, WebPageTest
- **Weak internet simulation:** Chrome DevTools network throttling
- **RTL testing:** Fire browser (RTL support), or toggle LTR manually

### C. Questions for Backend/Product Teams
1. What image dimensions does the server generate? (Define srcset strategy)
2. Does API support idempotency keys for deduplication?
3. Can admin configure image/video size limits without app rebuild?
4. Will there be a CDN? If so, which service?
5. Are there existing analytics for weak internet user behavior?

