# MARBOU Phase 2 Implementation Plan

**Generated:** 2024
**Task:** Complete Phase 2 of MARBOU marketplace frontend (all screens and components per scope)
**Project:** React 18 + TypeScript + Tailwind CSS SPA with Vite

---

## Overview

Phase 2 delivers **5 major feature groups** totaling **30+ screens and 15+ reusable components**, built in **5 sequential features** (FEAT-001 through FEAT-005). Each feature is independently testable and builds on Phase 1 foundation (design tokens, form components, marketplace widgets, i18n/RTL, performance utilities).

The plan decomposes work into separable features because:
1. Different concerns can be built/tested independently (auth ≠ listings ≠ jobs)
2. Each feature leaves the codebase in a buildable state
3. Integration happens incrementally via shared context/components
4. Parallel review/verification is possible

**Build Command:** `npm run typecheck` + `npm run dev`
**Test:** Manual testing in dev server + visual verification

---

## Feature Breakdown

### FEAT-001: Complete Authentication Flow (AUTH-01 through AUTH-07)

**Screens:** Sign-in hub, Register, Login, OTP verification, Password reset (request + new password), Add email (for social users)

**Key Changes:**
- Enhance `src/pages/AuthPages.tsx`: replace stubs with full screen implementations
- Update `src/context/AuthContext.ts`: add auth step state machine (signin/register/login/otp/forgot/reset/add-email)
- Add i18n keys: signInHub, otpTitle, passwordStrength, resetPassword, addEmail, etc.
- Social button placeholders (Google/Facebook/Apple) with mock toast responses
- OTP 6-digit input fields with auto-focus and 60-sec countdown timer
- Password strength meter (0-100%) with validation rules display

**Files to Create/Modify:**
- `src/pages/AuthPages.tsx` (enhance existing)
- `src/context/AuthContext.ts` (extend state machine)
- `src/i18n/translations.ts` (add auth keys)

**Verification:**
- `npm run typecheck` — no TS errors
- `npm run dev` → /register, /login, OTP flow, password reset, AR/EN switching
- Form validation catches errors; keyboard Enter submits forms
- OTP countdown timer works; resend button enabled after 60s

**Acceptance Criteria:**
- All 7 auth screens render error-free
- Form validation (required fields, email, password match, length)
- OTP auto-focus between fields; 60-sec countdown + resend
- Social buttons mock-toast response (no real auth backend)
- AR/EN: text translates, RTL layout mirrors
- Loading state on submit buttons; localStorage does NOT persist auth forms (security)

---

### FEAT-002: Enhance Listing Detail Page (DET-01, DET-02)

**Screens:** Full listing detail with gallery, status ribbons, fullscreen modal, market price insights, specs table, seller card, carousels, reviews, safety tips, breadcrumb

**Key Changes:**
- Enhance `src/pages/ListingDetailPage.tsx` with:
  - Status ribbon overlay (Sold/Rented/Expired) on cover image
  - Fullscreen lightbox modal: click image counter → modal opens, arrow keys navigate, zoom buttons (100%→150%→200%), video play button (placeholder), close button
  - Breadcrumb with clickable links (Home > Category > Title)
  - Specs table: 2-column grid on desktop, single column on mobile
  - Market price insights: lowest/average/highest price range with gradient bar + marker
  - Complete location section: mock map with marker icon + label overlay (non-interactive)
  - Seller card: avatar, name (clickable to /seller/:name), rating + count, verified badge, member-since, View Details button, View Business button (if businessId exists), Call/Message/WhatsApp/Block buttons
  - Similar listings carousel: horizontal scroll, max 5, filter by category
  - Recently viewed carousel: from localStorage 'marbou-recent'
  - Reviews section: business rating + count, review list with author/avatar/rating/text/date/reply, Write Review button → modal with star picker + textarea
  - Safety tips: bullet points on meeting/inspecting/paying
  - Mobile sticky footer: Contact bar (Call/Message) at bottom-16

**Files to Create/Modify:**
- `src/pages/ListingDetailPage.tsx` (enhance existing)

**Verification:**
- `npm run typecheck` — no TS errors
- `npm run dev` → /listing/lst-001 → verify all sections render
- Click image counter → fullscreen modal opens; arrow keys navigate; zoom/video/close work
- Status ribbon visible on cover; breadcrumb navigates via router
- Specs table 2-column desktop, 1-column mobile
- Seller card all fields; Follow/Message/Business buttons functional
- Carousels scroll (no snap on mobile if < 3 items)
- Reviews: click Write Review → modal → star picker + textarea
- AR/EN: all text translates, RTL layout (flexbox, icon direction)
- Mobile: sticky footer at bottom-16 with Call/Message buttons

**Acceptance Criteria:**
- Fullscreen lightbox: image count click opens modal; arrows navigate; counter updates; zoom/close work
- Status ribbons on cover image and detail header
- Specs table: 2 columns desktop, 1 mobile; all EAV attributes render
- Market price insights: lowest/average/highest with gradient bar
- Seller card: avatar, name (clickable), rating + count, verified badge, member since, View Details + Business buttons, Call/Message/WhatsApp/Block
- Similar/recent carousels: horizontal scroll, max 5 each
- Reviews: business rating (if exists), review list with replies, Write Review modal
- Safety tips: visible with icon + bullets
- Breadcrumb navigates; long titles truncate with ellipsis
- Mobile contact bar sticks to bottom; desktop in sidebar

---

### FEAT-003: Complete Add/Edit Listing Wizard (ADD-01 through ADD-07)

**Screens:** Category selector (searchable tree), Listing type (For Sale/For Rent/Wanted), Details with DynamicForm, Media uploader (drag-drop, reorder, cover), Price/Location/Contact, Review + quality score meter, Published confirmation + share buttons

**Key Changes:**
- Enhance `src/pages/AddListingPage.tsx` with:
  - Improved category selector: searchable input, category tree (13 categories + subcategories), expandable, 'Other' option, selected chips
  - Listing type selector: For Sale / For Rent / Wanted (radio or chips); affects pricing UI (rent shows perMonth toggle)
  - DynamicForm component: renders fields based on category schema from `getFields()`; field types (text, number, select, checkbox, date); required fields marked with *; validation on blur
  - **New MediaUploader component** (reusable): drag-drop zone + file picker, image preview grid (3-4 columns), drag-to-reorder (GripVertical icon), delete (X) per image, star icon to set cover, cover badge overlay, progress bar (mock), max 8 images, video toggle (URL input, placeholder for video)
  - Price/Location: PriceInput + negotiable toggle, LocationPicker (city → area dropdowns), optional phone field
  - Review page: full preview card (cover, title, price, location, description), quality score meter (0-100%), terms checkbox, publish/save draft buttons
  - Confirmation screen: success card with listing ref, share buttons (Facebook/WhatsApp/Twitter/Copy Link), 'View Listing' button → /listing/:id, 'Add Another' button → reset
  - **State persistence:** auto-save on field change (debounced 500ms), localStorage key 'marbou-addlisting-draft', includes all steps 0-6, sync status indicator (Saved Locally/Waiting/Uploading/Saved)
  - **Offline support:** show 'Waiting for Connection' if networkState === 'offline', disable publish, alert bar below photo step
  - Step navigation: forward/back buttons, disable next if required fields missing, validate before advancing
  - Completeness score: calculate from required fields (title, description, price, location, photos, category specs), display progress bar, show missing field hints

**Components to Create:**
- `src/components/MediaUploader.tsx` (drag-drop, reorder, cover selection)
- `src/components/DynamicForm.tsx` (category-driven field rendering)
- Enhance `src/pages/AddListingPage.tsx` with all 7 steps

**Files to Modify:**
- `src/pages/AddListingPage.tsx`
- `src/data/mockData.ts` (ensure categories have proper schema)

**Verification:**
- `npm run typecheck` — no TS errors
- `npm run dev` → /add-listing → step through all 7 steps
- Category search filters; listing type selector works; DynamicForm renders vehicle/real-estate/electronics fields
- MediaUploader: drag image to zone, file picker, preview grid, drag-to-reorder, delete, set cover, cover badge
- Completeness meter updates on field changes; hints show missing fields
- Step navigation: back/next buttons, disable next if required missing
- Publish button creates listing; confirmation screen shows success + share buttons
- Refresh page → draft loads from localStorage; all form data persists
- Offline mode: alert bar appears, publish disabled
- AR/EN: all text translates, layout mirrors

**Acceptance Criteria:**
- Category tree searchable; listing type selector functional
- DynamicForm renders category-specific fields (vehicles, real-estate, electronics)
- MediaUploader: drag/drop zone, file picker, grid preview, drag-to-reorder, delete, cover badge
- Price field validates; negotiable toggle works; LocationPicker filters by city/area; phone field +249 format
- Review preview shows all entered data; quality meter 0-100%; publish/save draft buttons
- Confirmation: success card, share buttons (mock), View Listing/Add Another buttons
- Draft persists: refresh → form data loads from localStorage
- Offline bar appears when offline; publish disabled
- Completeness meter 0-100%; shows missing field hints
- Step indicator shows 7 steps; current highlighted, completed show checkmark+green

---

### FEAT-004: Complete User Profile Ecosystem (PRF-01, MY-01, MY-02, PRF-20, PRF-03, PRF-04)

**Screens:** Profile menu (sections + logout), My Listings (tabs: Active/Drafts/Expired/Sold/Hidden, with actions), Edit Listing (pre-filled wizard), Public Seller Profile (cover, avatar, rating, badges, listings, reviews, staff, report), Favorites (with price-at-save indicator), Saved Searches (list + delete)

**Key Changes:**
- Refactor `src/pages/AccountPage.tsx`:
  - Simplify sidebar: organize tabs into sections (Profile, My Activity, Preferences, Support)
  - User info card at top (avatar, name, email)
  - Tab routing via /account/:tab (overview, profile, my-listings, favorites, saved-searches, etc.)
- Implement My Listings tab:
  - Status tabs: Active / Drafts / Expired / Sold / Hidden
  - Grid of listing cards with status badge + 3-dot action menu
  - Actions: Edit → /edit-listing/:id (pre-filled wizard), Boost (modal with duration/cost), Mark Sold (confirm), Delete (confirm), Relist (copy draft)
  - Empty state if no listings in tab
- Create Edit Listing page: `/edit-listing/:id` or route within AddListingPage
  - Reuse AddListingPage wizard but pre-populate all fields from listing
  - All 7 steps pre-filled
  - Save button updates listing in myListings
  - Cancel returns to /account/my-listings
- **New SellerProfilePage** (`src/pages/SellerProfilePage.tsx`):
  - Header: cover image (or gradient if missing)
  - Seller avatar (larger, centered)
  - Seller name, rating stars + count, member since year, trust badges (Verified Seller, Fast Responder, etc.)
  - Follow button (toggle state in AppContext)
  - Description (if available)
  - Sections: Listings (grid), Reviews (from sampleReviews filtered by seller), Staff (mocked list with avatars + names)
  - Report button → modal with reason select
- Enhance Favorites page (PRF-03):
  - Show ListingCardGrid of favorite listings
  - Each card: price-at-save vs current price indicator (green if down, red if up), status badges
  - Empty state with 'Browse Listings' link
- Enhance Saved Searches page (PRF-04):
  - List of saved searches: title, filter summary, alert frequency badge, date saved, delete button
  - Each row clickable to re-run search
  - Empty state with 'Start Searching' link
- Add mock data:
  - `myListings` array: 5-10 listings in various statuses (active, draft, expired, sold, hidden)
  - `savedSearches` array: 3-5 searches (e.g., 'Toyota Cars in Khartoum', 'Apartments Under 1M')

**Files to Create/Modify:**
- `src/pages/AccountPage.tsx` (refactor existing)
- `src/pages/SellerProfilePage.tsx` (create new)
- `src/pages/FavoritesCompareMessages.tsx` (enhance Favorites/Saved Searches)
- `src/data/mockData.ts` (add myListings, savedSearches)

**Verification:**
- `npm run typecheck` — no TS errors
- `npm run dev` → /account → sidebar shows sections, tabs functional
- My Listings: tabs filter correctly (Active/Drafts/Expired/Sold/Hidden), 3-dot menu works (Edit, Boost, Mark Sold, Delete, Relist)
- Click Edit → pre-filled wizard opens, form shows saved data, publish updates listing, cancel returns to /account
- /seller/Demo%20User → seller profile loads, cover + avatar + name + rating + badges, listings grid, reviews, staff, follow + report buttons functional
- /account/favorites → favorite listings grid with price indicator, empty state if none
- /account/saved-searches → saved searches list, delete button works, empty state if none
- Boost modal: 3 duration options, select → success toast
- AR/EN: text translates, layout mirrors (flex, text-align)

**Acceptance Criteria:**
- AccountPage sidebar organized by sections; tab routing works
- My Listings: tabs filter correctly, 3-dot action menu (Edit, Boost, Mark Sold, Delete, Relist) all functional
- Edit Listing: form pre-filled, publish updates, cancel returns
- Seller profile: cover, avatar, name, rating + count, member since, badges, Follow button (toggles), Listings/Reviews/Staff sections, Report button
- Favorites: ListingCardGrid with price indicator, empty state with link
- Saved Searches: list of searches, clickable to re-run, delete button, empty state with link
- All pages AR/EN responsive, loading states, proper error handling

---

### FEAT-005: Jobs Flow, Business Storefront, Compare Enhancements, Global Polish (JOB-01 through JOB-03, BIZ-01, plus G1–G14)

**Screens:** Jobs list (filters), Job detail, Apply modal (Quick Apply / Full Profile), Business profile, Enhanced Compare page, global shared components, empty states, feature flags, offline/suspension notices

**Key Changes:**
- Enhance JobsPage (JOB-01):
  - Job list with search bar, filters (category, location, salary range, job type)
  - Job cards: company logo, title, location, salary, posted date, type badge, save job heart
  - Filter by job type: government / private / freelance / remote
  - Empty state if no results
  - Each card: 'Apply Now' button → opens apply modal, 'View Details' button → job detail page
- Create/Enhance JobDetailPage (JOB-02):
  - Company header: logo, name, website
  - Job title, full description, requirements list, benefits list
  - 'Apply Now' button (opens apply modal), 'Save Job' button (heart toggle)
  - Applicant count, posted/deadline dates, company info section
- Implement ApplyModal (JOB-03):
  - Two options: 'Quick Apply' (name + phone + message) or 'Full Profile' (CV file upload + cover letter)
  - Radio toggle between options
  - Form validation, submit button
  - Success toast after submission
- **New BusinessProfilePage** (`src/pages/BusinessDashboard.tsx` enhancement or `/business/:id`):
  - Header: cover image (or gradient), logo, business name, verified badge (if exists)
  - Description, categories served (chip list), contact info (phone, email, address)
  - Listings section: grid of latest listings
  - Reviews section: list format
  - Staff section: mocked list with avatars + name + role (3-5 staff cards)
  - Follow button (toggle), Message button
- Enhance ComparePage:
  - Sticky header showing selected listings (image + title + price per column)
  - Scrollable table below: rows for Price, Location, Condition, + all unique specs
  - Highlight differences (bold + background color)
  - 'Remove from Compare' button per column, 'Clear All' button
  - Responsive: horizontal scroll on mobile for columns
- **Create new shared components:**
  - `AuthGateSheet.tsx` (bottom sheet modal): triggered on gated actions (message, offer, chat without login); shows sign-in options (Email/Google/Facebook/Apple), 'Sign up' link, cancel button; non-dismissible except via button
  - `ConfirmDialog.tsx` (reusable modal): title, message, confirm button, cancel button; danger variant (red confirm button); used for delete/mark sold/report confirmations
- **Add global features:**
  - Empty states on all list pages (Favorites, Saved Searches, My Listings, Jobs, etc.): EmptyState component with icon + title + description + optional action button
  - Feature flags in AppContext: ENABLE_MONETIZATION, ENABLE_JOBS, ENABLE_AUCTIONS, ENABLE_BARTER (all true for Phase 2 but flag-gated)
  - Suspended account notice: full-screen overlay if user.status === 'suspended' (from mock AuthContext); message + support link, no escape
  - Maintenance/Force Update screen: variant of ComingSoonPage; triggers if version mismatch (mock check); blocks all navigation except logout
  - Offline draft notice: bar at top of AddListingPage if networkState === 'offline'; alert icon + 'Offline mode: changes saved locally'; auto-hide after 5s
  - Deep link support: ensure /listing/:id, /seller/:name, /jobs/:id, /business/:id all work and pre-load correct data
  - Toast enhancements: position at top-right (ltr) / top-left (rtl), auto-hide after 3s, stack multiple toasts

**Files to Create/Modify:**
- `src/pages/JobsServicesBusiness.tsx` (enhance/create Jobs + Business)
- `src/pages/FavoritesCompareMessages.tsx` (enhance Compare)
- `src/components/AuthGateSheet.tsx` (create new)
- `src/components/ConfirmDialog.tsx` (create new)
- `src/context/AppContext.ts` (add feature flags, suspended status)
- `src/components/ui.tsx` (enhance Toast, add empty state logic)

**Verification:**
- `npm run typecheck` — no TS errors
- `npm run dev` → /jobs → job list loads, filters work (type, location, salary), empty state if no results
- Click job card → /jobs/:id detail page loads, full details + apply button → apply modal opens
- Apply modal: Quick Apply form validates, Full Profile CV upload field, submit success toast
- /business/biz-001 → business profile loads, cover + logo + name + badges, listings grid, reviews, staff, follow + message buttons functional
- /compare with 2-3 listings pre-selected → compare page shows sticky header, scrollable table with specs, differences highlighted
- Logout + try to message/offer → AuthGateSheet appears with sign-in options
- Delete action → ConfirmDialog appears; confirm → success, cancel → no-op
- /favorites if empty → EmptyState with icon + title + 'Browse Listings' button
- ENABLE_JOBS flag false → jobs page hidden (or redirects to home)
- Suspended account → full-screen notice overlay
- /add-listing offline → offline draft notice bar appears
- /listing/lst-001, /seller/Demo%20User, /jobs/job-001, /business/biz-001 all work (deep links)
- Toast: multiple toasts stack at top-right (ltr) / top-left (rtl), auto-hide after 3s

**Acceptance Criteria:**
- Jobs list: filters work, empty state renders, Apply/Save/View buttons functional
- Job detail: full info + company header + apply modal (Quick Apply + Full Profile options)
- Business profile: cover, logo, name, verified badge, description, categories, listings, reviews, staff, follow + message buttons
- Compare: sticky header, scrollable specs table, differences highlighted, remove/clear buttons
- AuthGateSheet: appears on gated action, shows sign-in options, non-dismissible except via button
- ConfirmDialog: shows on delete/mark sold/report, confirm/cancel buttons work
- Empty states: all list pages show proper empty state with action button when empty
- Feature flags: ENABLE_JOBS controls visibility (flag-gated pages)
- Suspended account: full-screen notice, no escape
- Offline notice: bar appears on /add-listing when offline
- Deep links: /listing/:id, /seller/:name, /jobs/:id, /business/:id all pre-load correct data
- Toast: stacked, positioned correctly (RTL/LTR), auto-hide after 3s

---

## Sequencing & Dependencies

```
FEAT-001 (Auth)
  ↓ (AuthContext updated, login/logout works)
FEAT-002 (Listing Detail)
  ↓ (full detail page with gallery works)
FEAT-003 (Add/Edit Listing)
  ↓ (wizard + publish create listings; ListingDetailPage shows them)
FEAT-004 (User Profile)
  ↓ (My Listings, Favorites, Saved Searches tabs functional; all build on FEAT-003 wizard for Edit)
FEAT-005 (Jobs, Business, Global)
  ↓ (integration: Jobs page works, Business profile works, Compare works, all shared components available)
  
[Convergence Loop: Fixer + Reviewer × 3 max iterations]
  ↓ (all FEATs verified integrated, no conflicts)
  
[Finalize: Documentation + Merge]
```

**Why sequential (not parallel):**
- Shared worktree: concurrent coders would race on git index, staging area, build artifacts
- Shared components: FEAT-002 needs ui.tsx enhancements, FEAT-004 builds on FEAT-003 wizard logic, FEAT-005 adds AuthGateSheet used by earlier pages
- Each step verifies build + typecheck before next coder starts

**Verification per feature:**
- `npm run typecheck` — no TS errors
- `npm run dev` — all screens load, no runtime errors
- Manual testing: AR/EN switching, form validation, offline mode, responsive

---

## Mock Data Additions

**src/data/mockData.ts:**
- Add `myListings: Listing[]` (5-10 listings in various statuses: active, draft, expired, sold, hidden)
- Add `savedSearches: SavedSearch[]` (3-5 searches with filter objects and dates)
- Ensure `categories` has proper schema for DynamicForm getFields() (vehicles, real-estate, electronics)
- Ensure `jobs` and `businesses` have all required fields (logo, description, staff, etc.)
- Add `sampleReviews` (if not present) for seller reviews

**New Types (src/types.ts or inline in files):**
```typescript
interface SavedSearch {
  id: string;
  title: string;
  filters: Record<string, any>;
  alertFrequency: 'daily' | 'weekly' | 'never';
  dateSaved: string;
}
interface AuthStep = 'signin' | 'register' | 'login' | 'otp' | 'forgot' | 'reset' | 'add-email';
interface FeatureFlags {
  ENABLE_MONETIZATION: boolean;
  ENABLE_JOBS: boolean;
  ENABLE_AUCTIONS: boolean;
  ENABLE_BARTER: boolean;
}
```

---

## Shared Components Created/Enhanced

1. **MediaUploader.tsx** — drag-drop, file picker, preview grid, reorder, cover selection, max 8 images
2. **DynamicForm.tsx** — category-driven field rendering (text, number, select, checkbox, date)
3. **AuthGateSheet.tsx** — bottom sheet modal for sign-in without login
4. **ConfirmDialog.tsx** — reusable confirmation modal with danger variant
5. **Enhance src/components/ui.tsx** — EmptyState logic, Toast positioning, Toast stacking, Skeleton variations
6. Enhance **AppContext.ts** — feature flags, suspended account status, deep link support

---

## i18n & Accessibility Requirements

**AR/EN Support (per screen):**
- All text keys translatable in src/i18n/translations.ts
- RTL layout: flex direction, text-align, icon direction (rtl:rotate-180 on Lucide icons)
- Breadcrumb reversed in RTL
- Form labels and error messages bilingual
- Toast position: top-right (en) / top-left (ar)
- Modals: RTL text direction preserved

**Accessibility:**
- Semantic HTML: `<button>`, `<form>`, `<label>`, `<input>`, `<nav>` tags
- ARIA labels on icon-only buttons
- Focus states visible on all interactive elements (`:focus-visible` + ring)
- Keyboard navigation: Tab between fields, Enter to submit, Esc to close modals
- Loading states announced (aria-busy or aria-label)
- Error messages associated with inputs via `aria-describedby`
- Alt text on images (or empty `alt=""` if decorative)

---

## Responsive Design Checkpoints

- **Mobile (base, sm < 640px):** single column, full-width cards, touch-friendly buttons (48px min), modals full-screen or bottom-sheet
- **Tablet (md 768px):** 2-column grids, sidebar navigation, modals center-screen
- **Desktop (lg 1024px):** 3-column grids, fixed sidebars, full-featured layouts
- **Sticky footer on mobile:** contact bar at bottom-16 above navigation
- **Horizontal scroll on mobile:** carousels, compare table

---

## Testing Checklist (Manual Verification)

```
[ ] npm run typecheck — no errors
[ ] npm run dev — dev server starts, no console errors
[ ] /login → login form loads, submit works, redirects to /account
[ ] /register → register form loads, account type selector, submit → success
[ ] /add-listing → step through all 7 steps, completeness meter updates, publish creates listing
[ ] /listing/lst-001 → detail page loads, gallery works, status ribbon visible, click image count → lightbox
[ ] Lightbox: arrow keys navigate, zoom buttons work, close button returns
[ ] /account → sidebar sections visible, tabs functional (my-listings, favorites, etc.)
[ ] My Listings → status tabs filter correctly, edit/boost/mark sold/delete buttons work
[ ] /seller/Demo%20User → seller profile loads, follow button toggles, message button functional
[ ] /jobs → job list + filters work, apply modal opens, save job heart toggles
[ ] /jobs/job-001 → job detail page loads, apply modal has Quick Apply + Full Profile options
[ ] /business/biz-001 → business profile loads, cover + logo + listings + reviews + staff visible
[ ] /compare → compare table shows 2+ listings, differences highlighted, remove/clear buttons work
[ ] Logout + message attempt → AuthGateSheet appears with sign-in options
[ ] Delete action → ConfirmDialog appears, confirm/cancel buttons work
[ ] /add-listing (offline mode via DevTools) → offline notice bar appears
[ ] /favorites (empty) → EmptyState with 'Browse Listings' button
[ ] AR/EN switching: all text translates, layout mirrors (flex, text-align, icon direction)
[ ] Responsive: test on mobile (375px), tablet (768px), desktop (1024px) breakpoints
[ ] Keyboard navigation: Tab through all interactive elements, Enter submits, Esc closes modals
[ ] Form persistence: /add-listing → fill form → refresh page → draft loads from localStorage
[ ] Toast: multiple toasts stack at top-right (en) / top-left (ar), auto-hide after 3s
```

---

## Known Limitations & Phase 3 Backlog

- No real backend APIs (all mock data in Phase 2)
- No payment processing (Boost costs not charged)
- No real video uploads (video toggle placeholder only)
- No real notifications (mock data only)
- No real search (category/location filtering only, no full-text search)
- No real deep links (client-side routing only, no server-side URL rewriting)
- No analytics (events not tracked)

**Phase 3 candidates:**
- Backend API integration (real auth, listings API, jobs API)
- Payment processing (Stripe/PayPal for boosts)
- Real notifications (push, email, SMS)
- Full-text search (Algolia or Elasticsearch)
- Analytics & tracking (Mixpanel, Google Analytics)
- Admin dashboard (user/listing moderation, analytics)
- Performance optimizations (code splitting, lazy images, service workers)

---

## Files Summary

**Pages Created/Enhanced (12 total):**
1. `AuthPages.tsx` — enhance (all 7 auth screens)
2. `ListingDetailPage.tsx` — enhance (gallery, modal, breadcrumb, seller, carousels, reviews, etc.)
3. `AddListingPage.tsx` — enhance (category search, listing type, DynamicForm, MediaUploader, review, confirmation)
4. `AccountPage.tsx` — refactor (sidebar sections, tabs, my-listings, favorites, saved-searches)
5. `SellerProfilePage.tsx` — create new (public seller profile)
6. `JobsServicesBusiness.tsx` — enhance (jobs list + detail, business profile)
7. `FavoritesCompareMessages.tsx` — enhance (favorites + price indicator, saved searches, compare table)
8. `BusinessDashboard.tsx` — enhance or replace with business profile view
9–12. Minor tweaks to other existing pages (HelpPage, AdminDashboard, etc.)

**Components Created/Enhanced (15+ total):**
1. `MediaUploader.tsx` — create new (drag-drop, reorder, cover)
2. `DynamicForm.tsx` — create new (category-driven fields)
3. `AuthGateSheet.tsx` — create new (sign-in bottom sheet)
4. `ConfirmDialog.tsx` — create new (reusable confirmation modal)
5. `ui.tsx` — enhance (EmptyState, Toast, Skeleton variations, etc.)
6. Form components (TextInput, Select, PhoneInput, PriceInput, etc.) — minor tweaks
7. Marketplace components (ListingCard, SearchBar, etc.) — minor tweaks

**Context/Utilities Updated (3 total):**
1. `AuthContext.ts` — add auth step state machine, OTP countdown, password reset
2. `AppContext.ts` — add feature flags, suspended status, deep link support
3. `i18n/translations.ts` — add auth, jobs, business, global polish keys

**Data Updated (1 total):**
1. `mockData.ts` — add myListings, savedSearches, ensure categories + jobs + businesses complete

---

## Deliverables

By end of Phase 2:
✅ All 5 FEATs implemented and verified  
✅ 30+ screens pixel-perfect, AR/EN/RTL, mobile-responsive  
✅ 15+ reusable components (form, UI, wizard, etc.)  
✅ Full auth flow (7 screens, state machine, validation)  
✅ Listing detail with fullscreen gallery + modals  
✅ Add/Edit Listing wizard with draft persistence + offline support  
✅ User profile ecosystem (My Listings, Favorites, Saved Searches)  
✅ Jobs flow (list, detail, apply modal)  
✅ Business storefront  
✅ Enhanced compare page  
✅ Global shared components (AuthGate, ConfirmDialog)  
✅ Empty states on all list pages  
✅ Feature flags  
✅ Deep link support  
✅ Offline draft notice + suspension screen  
✅ Full AR/EN/RTL support throughout  
✅ Mobile-first responsive design  
✅ Form validation + error states  
✅ Keyboard navigation + ARIA labels  
✅ TypeScript strict compliance  
✅ Zero console errors or warnings  

---

**Next Steps (for Coder Agents):**
1. Read FEAT-001.json through FEAT-005.json in order
2. Implement each FEAT sequentially, running typecheck + dev server verification
3. Update FEAT status to 'completed' and record findings
4. Commit locally (no push)
5. Fixer verifies integration, Reviewer writes verdict
6. If CHANGES_REQUESTED, fixer runs iteration 2+ to fix findings
7. Once verdict='APPROVED', finalize with documentation

---

**Questions/Issues:**
- If any step is unclear or requires user input, call `send_message` with severity 'warning'
- If a finding requires user-visible behavior change, call `send_message` with severity 'warning' to request approval
- On completion, call `send_message` with severity 'success' to summarize accomplishments
