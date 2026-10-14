# MARBOU Frontend Phase 1 - Implementation Plan

**Design Phase: Pixel-Perfect, Optimized, Professional Frontend**
**Target:** Scalable, high-performance React 18.3 + TypeScript + Tailwind CSS frontend for thousands of users.

---

## Phase 1 Deliverables Summary

This plan decomposes Phase 1 work into 7 interconnected features, executed sequentially to maintain a stable, buildable codebase. Each feature builds on design tokens, performance utilities, and component infrastructure. Dependencies flow: A → B → C → D → E → F → G.

---

## A. Design Tokens & Tailwind Config Extension

**What to do:**  
Extend the Tailwind config with missing design system tokens: boxShadow (xs, sm with tinted primary shadows, md, lg, xl), zIndex layers (base, sticky, floating, header, overlay, modal, toast), animation keyframes (bounceIn, pulseSlow, shake, successCheck, flipRtl), and confirm borderRadius. This locks in the visual language for all subsequent components and pages.

**Files:**  
- `Frontend/tailwind.config.js` (modify)

**Verify:**  
```bash
cd Frontend
npm run typecheck
```
Should pass with no errors. Manually confirm new classes are available via `@apply shadow-xs`, `z-toast`, `animate-bounce-in`, etc., in any component.

---

## B. Global Styles & Utilities (index.css)

**What to do:**  
Add `@media (prefers-reduced-motion: reduce)` rule to disable all animations for accessibility. Confirm `.no-scrollbar` utility is present. Verify Google Fonts imports (Cairo, Noto Kufi Arabic, Inter) are present and correct.

**Files:**  
- `Frontend/src/index.css` (modify)

**Verify:**  
```bash
npm run build
```
Build should complete without errors. CSS can be served and animations should be disabled when prefers-reduced-motion is set in browser DevTools.

---

## C. Performance Utilities Library

**What to do:**  
Create 4 utility modules under `Frontend/src/utils/` to support lazy loading, image optimization, cache configuration, and weak internet handling. These utilities will be imported by pages and form components in later steps.

1. **code-splitting.ts** — `lazyPage()` function wrapping React.lazy for page loading.
2. **image-optimization.ts** — `IMAGE_PRESETS`, `getResponsiveImage()`, `getSrcSet()` for CDN-ready image URL generation.
3. **cache-strategy.ts** — `CACHE_CONFIG` object with stale/gc times for listings, categories, profile, search.
4. **weak-internet.ts** — `NetworkState` type, `useNetworkState()`, `useDataSaver()` hooks, `getRetryDelay()` exponential backoff function.

**Files:**  
- `Frontend/src/utils/code-splitting.ts` (create)
- `Frontend/src/utils/image-optimization.ts` (create)
- `Frontend/src/utils/cache-strategy.ts` (create)
- `Frontend/src/utils/weak-internet.ts` (create)

**Verify:**  
```bash
npm run typecheck
```
Should pass. All exports are typed and importable.

---

## D. Form Component Library

**What to do:**  
Create 8 reusable form components in `Frontend/src/components/form/` following WCAG AA accessibility standards, RTL support, and Tailwind design tokens. Each component is typed, memoized where applicable, and has error/disabled states.

### Components to create:

1. **TextInput.tsx**  
   Props: id, name, label, value, onChange, placeholder, error, helperText, disabled, required, type (text|email|tel|url|password), maxLength, showCount  
   States: default, focus (ring-primary-200), error (border-error-500), disabled (opacity-50)  
   RTL: logical padding (ps-) for icons  
   ARIA: aria-invalid, aria-describedby  
   Styling: rounded-xl, border-sand-200, focus:ring-primary-100

2. **TextArea.tsx**  
   Props: id, name, label, value, onChange, placeholder, error, helperText, disabled, required, rows, autoResize  
   Auto-resize via onInput listener adjusting height  
   Character count display  
   Same accessibility & RTL as TextInput

3. **Select.tsx**  
   Props: id, name, label, value, onChange, options ([{value,label}]), placeholder, error, disabled, required, searchable  
   RTL: ChevronDown arrow flips via scale-x-[-1] in RTL  
   Keyboard: arrows, Enter, Esc  
   ARIA: role='listbox', aria-selected

4. **PhoneInput.tsx**  
   Props: value, onChange, error, label, disabled, required  
   Fixed '+249' prefix (Sudan code) in read-only box  
   Format on blur: +249 XX XXX XXXX  
   Validation: /^(09|01)[0-9]{8}$/ for Sudanese mobile  
   RTL: prefix on start (inline, not input)

5. **PriceInput.tsx**  
   Props: value, onChange, currency (SDG|EGP|AED), onCurrencyChange, min, max, error, label, disabled  
   Thousand separators via toLocaleString  
   Currency selector dropdown inline  
   Default: SDG

6. **DatePicker.tsx**  
   Props: value (ISO string), onChange, label, error, disabled, required, min, max  
   Use native `<input type='date'>` (mobile-friendly, accessible)  
   Wrap with MARBOU styling  
   Future Hijri note in comment

7. **FileUpload.tsx**  
   Props: onUpload, maxFiles (default 10), maxSizeMB (default 5), accept (default 'image/*'), files (UploadFile[]), onRemove  
   UploadFile type: {id, file, preview, progress (0-100), error?, status (idle|uploading|done|error)}  
   UI: drag-drop zone + click to browse  
   Per-file: thumbnail, progress bar, error message, remove button  
   Drag state: dashed border primary-300, bg-primary-50

8. **index.ts** (barrel export)  
   ```ts
   export * from './TextInput';
   export * from './TextArea';
   export * from './Select';
   export * from './PhoneInput';
   export * from './PriceInput';
   export * from './DatePicker';
   export * from './FileUpload';
   ```

**Files:**  
- `Frontend/src/components/form/TextInput.tsx` (create)
- `Frontend/src/components/form/TextArea.tsx` (create)
- `Frontend/src/components/form/Select.tsx` (create)
- `Frontend/src/components/form/PhoneInput.tsx` (create)
- `Frontend/src/components/form/PriceInput.tsx` (create)
- `Frontend/src/components/form/DatePicker.tsx` (create)
- `Frontend/src/components/form/FileUpload.tsx` (create)
- `Frontend/src/components/form/index.ts` (create)

**Verify:**  
```bash
npm run typecheck
```
Should pass. All form components compile and are importable via `import { TextInput, Select, ... } from '@/components/form'`.

---

## E. Marketplace Component Library

**What to do:**  
Create/refactor 5 marketplace components in `Frontend/src/components/marketplace/` for listings, categories, search, filters, and location selection. Optimize for performance with React.memo and lazy image loading.

### Components:

1. **ListingCard.tsx** (refactor from existing)  
   - Wrap ListingCard and ListingCardGrid exports in React.memo  
   - Add `dataSaver` prop for gradient placeholder  
   - Add `loading` prop that renders Skeleton structure  
   - Add LQIP blur-up: blurDataURL placeholder with CSS filter blur(8px) + transition  
   - Keep existing grid + list layouts

2. **CategoryTile.tsx** (extract from HomePage)  
   Props: category ({id, nameAr, name, icon}), onClick, featured (bool), size (sm|md)  
   Design: rounded-2xl card, icon top (emoji/SVG), label bottom  
   RTL: centered icon (agnostic)  
   Hover: shadow-md + scale(1.02) via transition  
   Featured: ring-2 ring-accent-500  
   React.memo wrapped

3. **SearchBar.tsx** (extract from Header/Hero)  
   Props: value, onChange, onSubmit, placeholder, suggestions (string[]), showFilters (bool), onFilterToggle  
   Combobox pattern: role='combobox', aria-expanded, aria-controls, aria-activedescendant  
   Suggestions dropdown (max 6 items)  
   RTL: search icon on end in RTL  
   Keyboard: Enter=search, Esc=close, ArrowUp/Down navigate  
   Debounced: 300ms debounce on onChange

4. **FilterPanel.tsx** (extract from SearchPage)  
   Props: filters (FilterState), onChange, onReset, resultCount  
   FilterState: {category, subcategory, city, minPrice, maxPrice, condition}  
   Desktop: card sidebar; Mobile: BottomSheet  
   Collapsible filter groups via disclosure pattern  
   Apply + Reset buttons  
   React.memo on pure sections

5. **LocationPicker.tsx** (new)  
   Props: cityId, areaId, onChange ({cityId,areaId}), label, error, required  
   Two cascading selects: City → Area  
   City change clears area selection  
   Shows full label: e.g. 'Khartoum - Jabrein'  
   Uses sudanCities from mockData  
   RTL: logical padding

6. **index.ts** (barrel export)

**Files:**  
- `Frontend/src/components/marketplace/ListingCard.tsx` (refactor from existing)
- `Frontend/src/components/marketplace/CategoryTile.tsx` (create)
- `Frontend/src/components/marketplace/SearchBar.tsx` (create)
- `Frontend/src/components/marketplace/FilterPanel.tsx` (create)
- `Frontend/src/components/marketplace/LocationPicker.tsx` (create)
- `Frontend/src/components/marketplace/index.ts` (create)

**Verify:**  
```bash
npm run typecheck
```
Should pass. All marketplace components are importable and used in pages without breaking.

---

## F. i18n Expansion

**What to do:**

1. Fix `formatPrice` in `Frontend/src/i18n/I18nContext.tsx`: Replace 'egp' key with 'sdg' and update to use `t('sdg')` — Marbou is Sudan-based, currency is SDG (Sudanese Pound). Ensure 'sdg' translation key exists in translations.ts.

2. Create `Frontend/src/i18n/translations/` subdirectory with 3 JSON files organized by domain:
   - `ui.json` — ~60 keys: navigation, buttons, labels, placeholders (nav links, button text, form labels)
   - `marketplace.json` — ~60 keys: listing fields, categories, search, filters (product fields, category names, filter labels)
   - `errors.json` — ~40 keys: validation messages, network errors (required field, invalid email, offline message)

   Each JSON shape: `{ "ar": { ... }, "en": { ... } }`

3. Keep `translations.ts` working — it can import and merge the JSON files, or remain standalone. Do not break existing `t()` usage.

**Files:**  
- `Frontend/src/i18n/I18nContext.tsx` (modify: fix formatPrice, update egp to sdg)
- `Frontend/src/i18n/translations.ts` (verify: add 'sdg' key if missing)
- `Frontend/src/i18n/translations/ui.json` (create)
- `Frontend/src/i18n/translations/marketplace.json` (create)
- `Frontend/src/i18n/translations/errors.json` (create)

**Verify:**  
```bash
npm run typecheck
```
Should pass. All translation keys resolve correctly. Format price displays 'SDG' (or الدينار السوداني in Arabic).

---

## G. Core Pages Polish & Performance Optimization

**What to do:**

### HomePage.tsx:
- Wrap in React.lazy boundary at route level (add Suspense in App.tsx with fallback skeleton)
- Replace inline CategoryTile with new `marketplace/CategoryTile`
- Ensure SearchBar is using new marketplace component
- Add React.memo to SectionHeader, PromoBanner
- Verify key stability: use listing.id, not index, in loops
- Remove hardcoded color values; use design tokens only
- Ensure all images use lazy loading via new ListingCard optimization

### SearchPage.tsx:
- Replace inline FilterPanel with imported `marketplace/FilterPanel`
- Virtual scrolling (optional): when results.length > 50 AND layout === 'list', check if @tanstack/react-virtual is available; if not, fall back to normal grid
- Add URL sync: on filter/sort change, update URL params via navigate
- Add pagination: page state, slice results to 20 per page, show pagination controls
- Use new marketplace components: SearchBar, FilterPanel

**Files:**  
- `Frontend/src/pages/HomePage.tsx` (modify)
- `Frontend/src/pages/SearchPage.tsx` (modify)
- `Frontend/src/App.tsx` (modify: add Suspense wrapper)

**Verify:**  
```bash
npm run build
npm run typecheck
```
Build succeeds. HomePage and SearchPage render without errors. Lazy loading and code splitting work as expected.

---

## Implementation Order (Strict Sequential Dependency Chain)

1. **A. Tailwind Config** — Must complete first; all components depend on design tokens.
2. **B. Global Styles** — Must follow A; uses same design tokens.
3. **C. Performance Utils** — Standalone; used by components in D & E.
4. **D. Form Components** — Depends on A, B; used by pages and future AddListingPage.
5. **E. Marketplace Components** — Depends on A, B, C; used by pages in G.
6. **F. i18n Expansion** — Depends on existing i18n structure; can run in parallel with D-E but sequenced for clarity.
7. **G. Pages Polish** — Depends on D, E, F; integrates all new components into HomePage & SearchPage.

---

## Notes for Implementation

- **Styling:** All components use Tailwind utilities + design tokens from A. No hardcoded colors, no inline styles.
- **Accessibility:** WCAG AA: 4.5:1 contrast, 44px touch targets, semantic HTML, ARIA labels.
- **RTL:** All components use logical CSS properties (ps-, pe-, start, end). Test in RTL mode.
- **Performance:** React.memo on pure components, lazy image loading, code splitting for pages, debounced search.
- **Testing:** After each feature, run `npm run typecheck` and verify components can be imported and used.
- **Currency:** All price displays use SDG, not EGP.
- **Weak Internet:** Use weak-internet utilities to detect slow connections and adapt image quality/caching.

---

## Success Criteria

✅ All new files created per spec.  
✅ TypeScript strict mode passes with zero errors.  
✅ All components are memoized where appropriate.  
✅ RTL mode tested and verified.  
✅ Form components handle validation, error states, and accessibility.  
✅ Marketplace components integrate cleanly into existing pages.  
✅ SearchPage and HomePage use new optimized components.  
✅ i18n expanded with SDG currency, translated strings.  
✅ Build completes successfully.  
✅ No console errors or warnings on dev/prod builds.
