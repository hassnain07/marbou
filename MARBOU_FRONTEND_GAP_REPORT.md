# MARBOU Frontend — Gap Analysis & Fix Instructions

**Audience:** AI coding agent that will complete the frontend.
**Reviewed:** `marbou-main/Frontend` (Vite + React 18 + TypeScript + Tailwind) against `MARBOU_PRD_V3.md` and `MARBOU_UI_FLOW.md` (both are in the repo root).
**Method:** static code review of every file under `Frontend/src` (about 14,000 lines). The environment had no `node_modules` and no network, so **the app was not built, linted or run**. Every finding below comes from reading the code and carries a file and line reference. Your first job is to confirm them (§0.2).
**Severity key:** **P0** blocks a working product or contradicts a hard PRD rule · **P1** a core user flow is incomplete · **P2** a vertical or secondary flow is missing · **P3** polish.

---

## 0. Read this first

### 0.1 Ground rules for the agent

1. **Do not rewrite the visual design.** The Tailwind tokens, palette, Cairo / Noto Kufi / Inter fonts and card/button classes in `index.css` and `tailwind.config.js` are good. Reuse them.
2. **Arabic-first, RTL-safe.** Use logical utilities (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`). The codebase mostly does; keep it that way. Never add `left-/right-/ml-/mr-/text-left` for layout.
3. **No hard-coded user-visible strings.** Every string goes through `t()`. Add keys to **both** `ar` and `en` in `src/i18n/translations.ts`. Do not write `lang === 'ar' ? '…' : '…'` inline (169 occurrences exist today; see §6.1).
4. **Put a service layer between pages and mock data.** Pages must not import `@/data/mockData` directly. Create `src/services/*` (listings, auth, chat, jobs, admin, config) that today read mock data/localStorage and later call the REST API in PRD §10. Return the same shapes the API will return (cursor pagination, error envelope). This is what makes the frontend "ready for backend".
5. **Use the shared components that already exist but are unused** (list in §6.4) instead of writing new inline forms.
6. **Never leave a button that only shows a toast.** If a feature is out of scope or flagged OFF, remove the entry point (PRD G5). If it is in scope, implement the real state change.
7. After every task run `npm run typecheck`, `npm run lint` and `npm run build`, then the matching QA script in §9.

### 0.2 Verify before fixing (10 minutes)

```bash
cd Frontend && npm ci
npm run typecheck && npm run lint && npm run build
```
Record failures. Then open the app and confirm the five blocking bugs in §2 (B-01 … B-05) by hand. If a finding does not reproduce, note it in `docs/gap-notes.md` and skip it.

### 0.3 Decisions the owner must confirm (defaults given so work can proceed)

| ID | Question | Default the agent should assume |
|---|---|---|
| D-1 | PRD §3 specifies **Next.js App Router** (SSR/SEO, deep links) for web and **React Native** for mobile. This repo is a **Vite SPA with hash routing**. Migrate now? | **Do not migrate yet.** Finish the UX in this codebase, keep all page logic in components that are framework-agnostic, and replace hash routing with path routing (FE-A-02). Record SSR/SEO as a blocking item before launch (FE-X-01). |
| D-2 | PRD §1.2 says the **Admin Dashboard is a separate app** with its own login. Here it is a route inside the public SPA. | Keep it in this repo under `src/admin/` for now, behind its own login and role guard (FE-ADM-01), lazy-loaded so it never ships to normal users. |
| D-3 | There is **no React Native app** in the repo. | Out of scope for this task. Make shared logic (services, schemas, zod validators, i18n keys) portable. |
| D-4 | Mock data vs real API | Mock behind the service layer (rule 4). |
| D-5 | Monetization UI | **Hidden everywhere** (flag OFF) per PRD MON-01 (see B-17). |

---

## 1. Executive summary

### 1.1 What exists and is good

- A coherent, attractive Arabic-first design system, responsive layouts, and RTL handled mostly with logical classes.
- A full page skeleton: home, category, search, listing detail, add listing, favorites, compare, messages, account, jobs, business storefront, business dashboard, admin dashboard, help.
- 675 translation keys with exact Arabic/English parity (no missing or duplicate keys).
- Good building blocks: listing card (grid/list), search bar with combobox ARIA, dynamic-form, media uploader, location picker, form inputs, weak-internet utilities.

### 1.2 What is wrong, in one paragraph

The frontend is a **clickable prototype, not a working product**. Most actions only show a toast. Registration does not save the password, so registered users cannot sign in. Nothing is gated behind sign-in (the auth-gate component is never rendered). A newly posted listing never appears anywhere. The listing flow still uses **pre-moderation ("submitted for review")**, which contradicts the PRD's instant-publication rule. Monetization (plans, promotions, sponsored badges) is visible and ON by default, the opposite of the PRD. The phone layout has **no language switch and no sign-in link**. The admin and business dashboards are open to anyone. A large share of the code (shared form library, dynamic form, media uploader, location picker, confirm dialog, auth-gate sheet and all four performance utilities) is **written but never used**.

### 1.3 Coverage against the UI flow document

Counts are screens/flows from `MARBOU_UI_FLOW.md`. "Partial" means the screen exists but misses required behaviour.

| Area | Done | Partial | Missing |
|---|---|---|---|
| Launch (SYS, ONB) | 0 | 0 | 7 |
| Auth (AUTH-00…08) | 0 | 8 | 1 |
| Discovery (HOME, CAT, SRCH, DET, CMP) | 0 | 9 | 2 |
| Seller (ADD, MY) | 0 | 7 | 4 |
| Chat (CHAT-01/02) | 0 | 2 | 0 |
| Verticals (RENT, APPT, SVC, HOT) | 0 | 0 | 16 |
| Jobs, CV, Employer | 0 | 4 | 13 |
| Business (BIZ) | 0 | 2 | 4 |
| Profile, notifications, help, reviews, reports, payments | 0 | 21 | 13 |
| Admin (AD-*) | 0 | 14 | 23 |

No screen is fully compliant. The detailed per-screen status is in §7.

### 1.4 Top 12 blockers (do these first)

| # | ID | Blocker |
|---|---|---|
| 1 | B-01 | Registration drops the password; login for registered users is impossible; passwords stored in plaintext |
| 2 | B-03 | No sign-in gating anywhere (guest can post, chat, offer, apply, favorite, review) |
| 3 | B-10 | Posting a listing does not create a listing; nothing appears in "My listings" |
| 4 | B-20 | Pre-moderation ("under review", approve/reject queue) contradicts instant publication |
| 5 | B-17 | Monetization visible and ON; feature flags not wired to the UI |
| 6 | B-42 | Phones have no language switch and no sign-in/notification access |
| 7 | B-22 | `/admin` and `/business` open to everyone, with a public "demo role" switcher |
| 8 | B-02 | UI never shows the signed-in user; no logout; account page shows hard-coded "Demo User" |
| 9 | B-26 | Data Saver does not save data (image still loads); network state is a manual toggle |
| 10 | B-05/B-06 | Filters unreachable on tablets; search URL/state desync; header search broken on search page |
| 11 | B-32 | Filters are static (category/price/condition); no dynamic attribute filters |
| 12 | B-25 | Hash routing, no SEO/meta, no path URLs, `document.title` never set |

---

## 2. Confirmed bugs (fix list)

Each item: **Where** → **What happens** → **Fix** → **Done when**.

### P0

**B-01 — Password is never saved; plaintext storage**
- **Where:** `pages/AuthPages.tsx:150` (`...(password ? {} : {})` removes the password from the `register()` call), `context/AuthContext.tsx:68` and `:79`, `:39` (users array with passwords in `localStorage`).
- **What happens:** `register` stores `password: ''`. `login` compares the typed password to `''`, so every login for a newly registered user fails. Passwords would also sit in plaintext if it worked.
- **Fix:** Pass `password` through `register`. Because there is no backend yet, store only a **salted hash** (use `crypto.subtle` PBKDF2) in the mock auth service, never the raw string, and add a code comment that real auth replaces it. Move all of this into `services/auth.ts` (access token + refresh token pair, mock-issued; expiry 15 min; refresh rotation simulated) so the UI code does not change when the real API arrives.
- **Done when:** register → logout → login with the same credentials succeeds; localStorage contains no raw password.

**B-02 — Signed-in state is invisible; no logout**
- **Where:** `components/AppShell.tsx` Header (always renders Login + Create account), `pages/AccountPage.tsx` (hard-coded "Demo User", `demo@marbou.sd`; `LogOut` imported, never used); `useAuth` used only by login/register pages.
- **Fix:** Header shows avatar menu when `user` exists (name, My listings, Messages, Settings, Language, Sign out) and Login/Register when not. AccountPage and profile forms read from `useAuth().user`. Add **Sign out** (clears session, returns to home, toast). Add `useRequireAuth()` hook (see B-03).
- **Done when:** after sign-in the header shows the user's name, account pages show the real profile, Sign out works and protected pages redirect.

**B-03 — No sign-in gating; `AuthGateSheet` is dead code**
- **Where:** `components/AuthGateSheet.tsx` is never imported; `AppContext` exposes `showAuthGate`/`gatedAction` but nothing calls or renders them.
- **What happens:** guests can favorite, post, message, send offers, apply to jobs, review, report and block.
- **Fix:** Render `<AuthGateSheet>` once in `AppShell`, driven by `gatedAction`. Implement `requireAuth(action, run)` in a `useGate()` hook: if no session → store a **pending action** (route + callback id) and open the sheet; after login/register/OTP resume the action and return to the originating route (UI flow rule G3 "⤴"). Gate: favorite, save search, report, add-listing (route guard), chat/offer, rental/appointment/inquiry, apply, review. Extend `GatedActionType` to cover all of them. Add the verified-email rule (G4): unverified users are sent to OTP before post/chat/apply/request/review.
- **Done when:** as a guest, every gated action opens the sheet; after signing in the user lands back on the same screen and the action completes.

**B-10 — A posted listing never appears**
- **Where:** `pages/AddListingPage.tsx:223` (`addMyListing(newId)` stores only an id string), `context/AppContext.tsx:72` (default `['lst-030']`), `pages/AccountPage.tsx:40` (`listings.filter(l => myListings.includes(l.id))`).
- **What happens:** the id is not in `mockData.listings`, so My listings and search never show the new listing. "Save draft" only toasts and navigates.
- **Fix:** Create `services/listings.ts` with `create`, `saveDraft`, `update`, `list`, `get`, persisted in an IndexedDB/localStorage-backed mock store merged with seed data. `create` returns a full `Listing` (readable ID `MARBOU-NNNNN`, status `active`, `publishedAt`, `expiresAt`). Search, Home, Category, Seller, Business and Admin all read from this service so a new listing is immediately visible everywhere (PRD acceptance: visible in search within 10 s).
- **Done when:** post a listing → it shows in My listings, in search, on Home "Latest", and opens at its detail URL.

**B-20 — Pre-moderation instead of instant publication**
- **Where:** `AddListingPage.tsx:508` ("placed under review before publishing"), `:514` (`submitForReview` button), `components/ui.tsx:98` (`underReview` status), `data/mockData.ts:460, 1572-1593`, `AccountPage.tsx:195` (filter "underReview"), `AdminDashboard.tsx:90-91` and the whole "Listings moderation" tab (Approve / Reject / Request changes).
- **PRD:** LST-03, TRS-01 — listings publish instantly; moderation is **post-publication**. Statuses are `draft, active, hidden, auto_hidden, suspended, sold, expired, archived` (+ soft delete).
- **Fix:** Rename status type and badges to the PRD set. Replace the review step text with "Your listing will go live immediately" and the button with **Publish**. Remove `underReview`/`pendingReview`/`submitForReview` strings and the Approve/Reject-before-publication UI. Admin listings tab becomes the **Post-Moderation Audit Center** (AD-30): live stream of new listings + Hide / Suspend / Delete / Restore with reason code. Show "after a quick safety check" text **only** when the Admin has enabled delayed-visibility for that category (default OFF).
- **Done when:** no string or status named "review/under review/pending" remains for listings; publishing is one click and instant.

**B-17 — Monetization is visible and ON; flags are not wired**
- **Where:** `AppContext.tsx:77` (`ENABLE_MONETIZATION: true`; `featureFlags` is read by **no page**), `AdminDashboard.tsx:67-70` (separate local flag state, `bankak/subscriptions/promotions` ON, resets on reload), `HomePage.tsx` `PromoBanner` ("Promote your listing…"), sponsored badges in `ListingCard` and `ui.tsx` `TrustBadge sponsored`, `AccountPage.tsx` "Payments & subscriptions" tab, `BusinessDashboard.tsx` "Plan & subscriptions" tab + promote buttons + plan prices in `egp`, `AdminDashboard.tsx` "Subscriptions & promotions" tab, routes `/auctions /barter /cart /delivery /booking` rendering "Coming soon" (`App.tsx:123-127`).
- **PRD:** MON-01 — with the flag false, **no** pricing UI, paywalls or promotion badges anywhere; flag-OFF features have **no entry points** (UI flow G5).
- **Fix:** One flag store (`services/config.ts` + `useFlags()`), loaded from `GET /flags` (mock), refreshed every 60 s, persisted. Defaults: all monetization/engine flags **false**. Guard every item listed above with `useFlags()`. Delete the "Coming soon" routes and their translation keys; unknown routes show a real 404 (B-47). Admin feature-flag screen writes to the **same** store and records an audit entry.
- **Done when:** with defaults, a search of the UI for "plan", "promote", "sponsored", "subscription", "boost" finds nothing visible to users; toggling a flag in admin shows/hides the surface without reload within 60 s.

**B-42 — Phones cannot change language or sign in**
- **Where:** `AppShell.tsx:266` (bell `hidden sm:flex`), `:272` (`LangSwitch` `hidden sm:block`), Login link `hidden sm:flex`, Create-account label `hidden sm:inline` (icon only on phones); `AccountPage` settings "Language" links to `/` (no-op).
- **What happens:** below 640 px there is no language toggle, no bell, no login link; the only auth entry is an unlabeled "+" button.
- **Fix:** Implement the mobile header from the UI flow: logo, city chip, bell, and an overflow/profile button. Put **language switcher** in Profile → Settings (working, `CMP-M`) and in the guest menu. Show **Sign in** text button for guests on mobile. Bell visible at all sizes with unread count.
- **Done when:** at 360 px width a guest can switch language, sign in, and open notifications.

**B-22 — Admin and business dashboards are public; demo role switcher**
- **Where:** `App.tsx:101-102, 106` (no guard), `AppShell.tsx` `DemoRoleSwitcher` (anyone can open `/admin`), `AdminDashboard.tsx:63` (role `<select>` with **9** roles).
- **PRD:** ADM-17/18, AUTH-20 — separate admin accounts, mandatory TOTP 2FA, exactly four roles (Super Admin, Content Moderator, Support Agent, Financial Auditor), RBAC per screen.
- **Fix:** See §5. Remove `DemoRoleSwitcher` from production builds (keep behind `import.meta.env.DEV && VITE_DEMO=1`). `/business/*` requires a signed-in user with the Dealer/Business capability; `/admin/*` requires an admin session (AD-00…02).
- **Done when:** a guest opening `/admin` or `/business` is redirected to the right login; a Moderator cannot open Payments/Flags/EAV (PRD acceptance).

### P1

**B-05 — Filters unreachable on tablets (768–1023 px)**
- **Where:** `SearchPage.tsx:214` desktop aside `hidden lg:block`; `FilterPanel.tsx:262` panel `hidden md:block`; `:235` mobile sheet `md:hidden`.
- **What happens:** between `md` and `lg` both are hidden; the filter button does nothing.
- **Fix:** Make the sheet visible `lg:hidden` and the aside `hidden lg:block` (single breakpoint), and remove the extra `hidden md:block` on the inline panel.

**B-06 — Search URL/state desync, history spam, broken header search**
- **Where:** `SearchPage.tsx:26` (state initialised once from URL), `:47-58` (effect pushes a new hash for every state change), header form in `AppShell.tsx` navigates to `/search?q=…`, category chips in `CategoryPage` navigate to `/search?category=…`.
- **What happens:** while already on `/search`, a header search or category click changes the URL but not the state; the effect then navigates back to the old URL. Each filter change adds a history entry, so Back steps through filters.
- **Fix:** Make the URL the single source of truth: derive `query/filters/sort/page` from the URL (`useSearchParams`-style helper on top of the new router), update with `replace` for filter edits and `push` for submitted searches. Also fix: `PaginationControls` is declared with `memo` **inside** the component (`:147`, remounts every render) and the desktop filter count uses `paginatedResults.length` (`:219`) instead of total results.

**B-04 — Raw translation keys shown as labels**
- **Where:** `AccountPage.tsx` sidebar/tab labels call `t(tab.id as TranslationKey)` with ids `my-listings`, `saved-searches`, `recently-viewed`, `job-applications`, `payments`, `security`; none exist (keys are `myListings`, `savedSearches`, …). Same pattern in `AdminDashboard.tsx` header `t(tabId)` (`jobs-services`, `feature-flags`, `cms`, `roles`) and `BusinessDashboard.tsx` header.
- **Fix:** Give each tab a `labelKey` field instead of casting ids. Remove all `as TranslationKey` casts on dynamic strings; type the helper so the compiler catches missing keys.

**B-07 — Seller profile route uses the display name**
- **Where:** `SellerProfilePage.tsx:20` (`/seller/{name}` matched against the name in the **current language**), `ListingDetailPage.tsx` links with `encodeURIComponent(sellerName)`.
- **What happens:** switching language on that page, or two sellers with the same name, gives an empty state.
- **Fix:** Use a stable `sellerId`: `/u/{id}` (PRD route map). Add `sellerId` to listings and a `users` seed.

**B-08 — Fragile business routing**
- **Where:** `App.tsx:104` treats `/business/{x}` as a public storefront only if `x` starts with `biz-`.
- **Fix:** Separate routes: public storefront `/b/{slug}`; dashboard `/business/*` (auth required).

**B-11 — Offers and chat are not functional**
- **Where:** `FavoritesCompareMessages.tsx:171` (`sendOffer` only toasts; no card created), counter-offer opens the same modal, accept/reject mutate local copies, "Message" button on listings goes to the generic `/messages` (no thread for that listing), image button is a no-op, `Flag`/`Ban` only toast (`:194`).
- **Fix:** Implement the thread model (UI flow §6): create/find thread by `(listingId, buyerId, sellerId)`, route `/messages/{threadId}`, offer cards created on send, counter creates a new card and swaps who must act, system lines on state change, image attach via the media component, block with confirm dialog + effect, report via `ReportSheet`, delivery ticks Sent/Delivered/Read distinct, typing indicator (simulated), unread counters that clear on open, idempotency key on send.

**B-12 / B-13 / B-14 — Fake share, WhatsApp, contact, block**
- **Where:** `ListingDetailPage.tsx:55` (Share toasts "Link copied" but copies nothing), `:350` (WhatsApp toasts "Opening WhatsApp"), `:418` (every listing shows the same **fictional** number `+249 91 234 5678`), `:355` (Block toasts, no effect). Same on seller and business pages.
- **Fix:** Share → `navigator.share` with fallback to `navigator.clipboard.writeText(permalink)`. WhatsApp → real `https://wa.me/{number}?text={encodeURIComponent(template)}` using the admin-editable per-language template (title, `MARBOU-NNNNN`, price). Contact numbers come from the listing owner's contact options and are fetched through a `revealContact(listingId)` service call (logs a lead event, enforces the guest cap, returns nothing if the seller chose chat-only). Remove all "fictional account" copy.

**B-15 — Market price insight is fabricated**
- **Where:** `ListingDetailPage.tsx:206-220` shows lowest = price×0.85, highest = price×1.15 and always says "within the expected range".
- **Fix:** Compute from comparable listings in the same leaf category (same make/model/year band where applicable, normalised currency). Show only when ≥ 8 comparables (PRD Appendix C); label Below/Fair/Above (±15% of median). Otherwise hide the whole block.

**B-16 — Compare**
- **Where:** `AppContext.tsx:98` and `ListingDetailPage.tsx:170` cap at **3** (PRD: 4); `FavoritesCompareMessages.tsx` spec rows use raw `key` strings (not localised), `isDifferent` is computed but unused, no seller-verification row, any categories can be mixed; the card button silently ignores the 4th add (no toast).
- **Fix:** Cap 4; block mixing categories with a toast; localise rows; add "Highlight differences" toggle (use `isDifferent`); add seller verification and key attributes; show the compare tray on desktop too (today it is mobile-only inside `BottomNav`).

**B-18 — Currency model**
- **Where:** `i18n/I18nContext.tsx:41-44` always formats as SDG; `translations.ts:590` Arabic label is the long phrase "الدينار السوداني" printed after every price; `egp` key is used for Sudanese plan prices (`BusinessDashboard.tsx:340`); no USD anywhere in `mockData.ts`.
- **Fix:** `formatPrice(amount, currency, opts)` with `SDG | USD`; short symbols (`ج.س` / `SDG`, `$`); listing has `currency`; converted indicator from an exchange-rate service with effective date and staleness rule (PRD LOC-04); price input has a currency toggle. Rename `egp` → remove.

**B-19 — Listing ID format and search by ID**
- `mockData.ts` uses `MB-2401-001`; PRD requires `MARBOU-NNNNN`, shown on details, used in WhatsApp text and searchable. Update seed data, display, deep link `/l/{publicId}` and search-by-ID.

**B-21 — Auth flow is a mock**
- **Where:** `AuthPages.tsx:156` (register jumps straight to `/account` or `/business`, no OTP), `:562` (OTP accepts any 6 digits, `// Mock: success`, route `/login/otp` is not reachable from anywhere), `:402` (login always → `/account`; "remember me" unused), `:897` (add-email → account, no OTP), forgot-password says "reset **link**" (PRD: OTP), social buttons navigate to `/login?provider=…` and do nothing, register asks "Buyer/Seller vs Business" (PRD: one account, capabilities added later), no Terms/Privacy acceptance, no lockout, no per-purpose OTP, auth screens have no language switch (UI flow AUTH-01).
- **Fix:** See §3.1.

**B-26 — Data Saver and network state are fake**
- **Where:** `marketplace/ListingCard.tsx:80,148` applies a gradient `style` to the `<img>` but still sets `src`, so the full image downloads; `AppShell.tsx` `NetworkStatusControl` is a **manual** demo switch (`networkState` persisted in localStorage); `utils/weak-internet.ts`, `image-optimization.ts`, `cache-strategy.ts`, `code-splitting.ts` are imported by nothing.
- **Fix:** Data Saver ON → render a placeholder and load a thumbnail variant only on tap (or `<img loading="lazy" srcSet>` with a 160 px variant); never request the original. Replace the manual network control with real detection via `useNetworkState()` (offline bar, "slow" banner, automatic retry with `getRetryDelay`); keep the manual simulator only in dev. Use `image-optimization` presets for `srcSet`/`sizes` on every listing image. Auto-enable Data Saver suggestion on `slow` (prompt, not silent).

**B-27 — Location**
- Header/location chip is a city→area dropdown only; Home "Nearby" is `listings.slice(4,12)`; "nearby" sort sorts by **views**; map views (Search `showMap`, listing detail) are gradient placeholders with fixed pin positions; no GPS, no radius, no approximate-location privacy.
- **Fix:** Real `LocationPicker` (GPS → city fallback), store `lat/lng` on listings, compute distance client-side from seed coordinates (until PostGIS), radius slider, "Nearby" feed uses it, sort `distance` only enabled when location is known. Use Leaflet + OSM-compatible tiles for map views (list/map toggle) with clustered pins; privacy radius circle where `isApproxLocation`.

**B-31 / B-32 / B-30 — Search quality and filters**
- No Arabic normalization (alef/hamza, ya/alef-maqsura, ta-marbuta, diacritics) and no typo tolerance in `SearchPage.tsx` (plain `includes`), no search by listing ID, no synonyms; autocomplete only suggests category names; no recent searches; saved search stores only the text query, shows `t('saveSearch')` as the success message, has no alert frequency and is not gated; filters are only category (4 hard-coded options), price, condition; pagination is page-number based, PRD wants cursor + infinite scroll; sort options differ from PRD (relevance, newest, price ↑/↓, distance).
- **Fix:** `utils/arabic.ts` normaliser applied to both index text and query (and trigram-style fuzzy match); ID search; synonyms from the admin config; recent searches in storage; suggestions from listing titles + categories; saved search stores `{query, filters, frequency, notifyPriceDrops}`; filters rendered from the category schema (§4.2); infinite scroll with `IntersectionObserver` and an opaque cursor from the service; empty state with suggestions + Save search.

### P2 / P3 (bugs)

| ID | Where | Problem | Fix |
|---|---|---|---|
| B-09 | `AddListingPage.tsx:27-45` + step 2 | Fake English↔Arabic "auto-translate" with a 16-word dictionary; labels are **swapped in the Arabic UI** (first field labelled Arabic but treated as English). | Remove. One title and one description in the seller's language; optional translation is out of scope. |
| B-23 | `components/ui.tsx` Modal, `AuthGateSheet`, `FilterPanel` sheet, `HomePage` category tiles wrapped in `<div onClick>`, Search map pins | No `role="dialog"`, `aria-modal`, Esc to close, focus trap/return, body scroll lock; toast has no `role="status"`; clickable `div`s. | Build one accessible `Dialog`/`Sheet` primitive, reuse everywhere; make tiles real links/buttons. |
| B-24 | 169 inline ternaries | See rule 3. | Move to translation keys. |
| B-25 | `index.html`, `Router.tsx` | Hash routing (`#/listing/…`), `og:image` is the bolt.new default, no description, no canonical, `document.title` never changes, unknown routes render Home. | FE-A-02, FE-X-01, B-47. |
| B-28 | `data/mockData.ts` | Seed statuses `pending/read/underReview`; no USD; 33 listings, category tree depth 2 only. | Update seed to new model; add enough seed for pagination (200+). |
| B-29 | `package.json` | Package name `vite-react-typescript-starter`; `@supabase/supabase-js` unused; `phase2.diff` (1.1 MB) and `.bolt/` committed; no tests. | Remove unused deps and artefacts; add Vitest + Testing Library and Playwright smoke tests (§9). |
| B-33 | `CategoryPage` | Subcategory chips all navigate to the same `/search?category=` (subcategory ignored); no filters; no `Other` row; no breadcrumbs by level. | Real category landing (CAT-01). |
| B-34 | Jobs | See §4.6. | |
| B-41 | `ListingDetailPage.tsx` | Anyone can write a review; the same `sampleReviews` appear on every listing; reviews only render when the listing has a business. | Gate by qualifying interaction (TRS-08); reviews belong to the seller/provider. |
| B-43 | `AccountPage` / `AdminDashboard` | Notification-pref and 2FA toggles do nothing; devices list static; export/delete modals say "this is a prototype". | Implement per §4.8. |
| B-44 | `AppContext.tsx:56` | `JSON.parse` of localStorage unguarded (corrupt value → white screen); no error boundary. | try/catch + `ErrorBoundary`. |
| B-45 | `AppContext.tsx:87` | Single toast, timer never cleared, no `aria-live`. | Toast queue with cleanup and `role="status"`. |
| B-46 | `ui.tsx` `StatusBadge` | Unknown status silently falls back to "published". | Exhaustive map, TypeScript `never` check. |
| B-47 | `App.tsx:129` | Any unknown URL renders Home. | Proper 404 page with search and categories. |
| B-48 | `HomePage.tsx:221` | "Trusted stores → View all" links to `/search?type=business`, unsupported. | Dedicated stores listing route. |

---

## 3. Core user flows — what must change

For each flow: the required behaviour (from the UI flow document), the current gap, and numbered tasks. Task IDs are stable; commit messages should reference them.

### 3.1 Launch, onboarding, authentication (FE-AUTH, FE-ONB)

**Required:** UI flow §3. **Current:** no launch sequence; auth pages exist but are mocked (B-01, B-21).

| ID | Task | Files | Acceptance |
|---|---|---|---|
| FE-ONB-01 | **First-run onboarding:** language choice (AR default) → country/city (Sudan preselected, "Use my location" optional, skippable) → Home. Persist choice; sync to account after sign-in. | new `pages/Onboarding.tsx`, `services/config.ts` | First visit shows it once; revisit does not. |
| FE-ONB-02 | **Remote config gate:** on load fetch `/config`+`/flags`; if `maintenance` show maintenance screen (localized text, retry); if `minVersion` > build show force-update screen (web: "refresh to update"). Refresh flags every 60 s. | `App.tsx`, `services/config.ts` | Toggling the mock config flips the screen without code change. |
| FE-ONB-03 | **Just-in-time permissions:** location and notification prompts appear only when first needed, with a one-line rationale; denial degrades gracefully. | `LocationPicker`, notifications | No permission prompt on load. |
| FE-AUTH-01 | **Single account, capabilities:** remove the "Buyer/Seller vs Business" choice from registration. Register = name, email, password (+strength meter), optional phone (+249 default, stored as *unverified contact field*), accept Terms & Privacy (checkbox with links, store accepted version). Business/Employer/Provider are upgrades later (FE-PRF-02). | `AuthPages.tsx RegisterPage`, `AuthContext` | A new account has no business flag. |
| FE-AUTH-02 | **Real OTP flow:** Register → OTP (purpose `register`) → verified → resume pending action or Home. OTP: 6 digits, 10-min expiry, max 5 attempts, resend after 60 s, paste/auto-fill support, "change email". Mock service generates the code and exposes it in dev console only. Purposes: register, reset, change-email. | `AuthPages.tsx OTPPage`, `services/auth.ts` | Wrong code ×5 locks the code; expired code prompts resend; correct code verifies. |
| FE-AUTH-03 | **Login:** return-to (⤴) instead of always `/account`; progressive lockout after 5 failures (1, 5, 15, 60 min) with visible countdown; "remember me" either implemented (persist vs session storage) or removed; suspended account → full-screen notice with reason. | `LoginPage`, `AuthContext` | Logging in from a gated action returns to it. |
| FE-AUTH-04 | **Forgot password via OTP** (not "link"): email → OTP (purpose `reset`) → new password (min length + strength) → all other sessions revoked → login. Generic response (no account enumeration). | `ForgotPasswordPage`, `ResetPasswordPage` | Reset changes the mock credential. |
| FE-AUTH-05 | **Social sign-in:** Google, Facebook, Apple buttons produce a mock provider profile; link to an existing verified email instead of duplicating; if no email or relay email → Add-email → OTP before posting/messaging/applying (browse-only until verified). Apple button only on iOS user agents. | `AuthPages`, `AuthGateSheet` | Social user without email cannot post until verified. |
| FE-AUTH-06 | **Add-email → OTP** (today jumps to `/account`). | `AddEmailPage` | |
| FE-AUTH-07 | **Auth gate sheet** wired app-wide (B-03) and the same sheet reused inside the sign-in hub. Add language toggle to every auth screen. | `AppShell`, `AuthGateSheet` | |
| FE-AUTH-08 | **Phone OTP (flag-gated):** `OTP_SMS`/`OTP_WHATSAPP` OFF by default → no channel chooser and no verify-phone screen; when ON show channel picker and "Verified phone" badge. At least one channel always enabled (admin rule, §5). | `OTPPage`, new `VerifyPhonePage` | Flags OFF → UI shows email only. |
| FE-AUTH-09 | **Session security:** access token 15 min + rotating refresh in the mock service; Security Center lists real sessions (device, OS, location, last active), revoke one/all others, last 20 login events. | `services/auth.ts`, Account → Security | Revoking a session logs that "device" out. |

### 3.2 Discovery: Home, categories, search, details, compare (FE-DISC)

| ID | Task | Files | Acceptance |
|---|---|---|---|
| FE-DISC-01 | **Home:** banners from config (scheduled, language/country targeted), category grid (admin order), **real Nearby** (location-based), Recommended (based on recent searches + favorites; hide for new users), Recent, Popular; remove `PromoBanner` and sponsored slots unless flag ON; each block loads independently (skeleton) and hides when empty; pull-to-refresh on mobile. | `HomePage.tsx` | No block is a static `slice()` of the seed. |
| FE-DISC-02 | **All-categories screen** `CAT-00` (tree browser, every level has **Other**) and real **Category landing** `CAT-01` (breadcrumbs by level, subcategory chips that actually filter, top filters from schema, "Post in this category" hidden with message if posting restricted). | new `pages/Categories.tsx`, `SearchPage.tsx CategoryPage` | Clicking "Cars" chip lists only cars. |
| FE-DISC-03 | **Search entry screen** `SRCH-01`: recent searches (clearable), live suggestions from listings + categories (+ synonyms), category shortcuts; typing a `MARBOU-NNNNN` jumps to that listing. | `SearchBar`, new `SearchEntry` | |
| FE-DISC-04 | **Results:** URL-driven state (B-06), sort set = relevance / newest / price ↑ / price ↓ / distance (only when location known), grid/list/**map** toggle, infinite scroll with cursor, empty state with suggestions (remove filter, widen radius, popular categories) + Save search. | `SearchPage.tsx` | Back button leaves search, not the last filter. |
| FE-DISC-05 | **Filters** generated from the category schema (§4.2): single/multi-select, range slider, boolean, date; dependent options (Make→Model); location + radius; seller type (Individual/Dealer/Verified); posted-within. Live result count on Apply. | `FilterPanel.tsx` | Vehicles show make/model/year/mileage/…; Real estate shows beds/baths/area. |
| FE-DISC-06 | **Save search sheet:** name, frequency (instant/daily/off), price-drop toggle; stores filters; shown in Profile → Saved searches; gated. | `SearchPage`, `AccountPage` | |
| FE-DISC-07 | **Listing details:** order and content per UI flow §4.3: gallery with swipe/pinch zoom + fullscreen viewer, video player with poster, ID `MARBOU-NNNNN` (tap to copy), banners for Sold/Expired/Suspended (owner sees Hidden with reason), specs table from schema (archived attributes still shown), approximate-location circle, **real** market price (B-15), seller card, Similar listings, safety tips linking to Trust & Safety, sticky action bar (WhatsApp prominent / Call / Chat). Owner view shows Edit / Share / Mark sold / Renew / Stats instead of contact buttons. Removed/expired deep link shows a "no longer available" page with similar listings. | `ListingDetailPage.tsx` | |
| FE-DISC-08 | **Contact reveal** (B-14): server-style `revealContact`, guest daily cap (default 20) → Auth Gate when exceeded; seller privacy options (call / WhatsApp / chat-only) respected; lead events logged. | `services/listings.ts` | Chat-only seller shows no number anywhere in DOM. |
| FE-DISC-09 | **Compare** (B-16) and compare tray visible on desktop. | `FavoritesCompareMessages.tsx`, `AppContext` | |
| FE-DISC-10 | **Favorites:** price-at-save vs current with price-drop badge, Sold/Expired/Removed ribbons, gated, sortable, swipe/button remove with undo toast. | `FavoritesPage` | |
| FE-DISC-11 | **Report sheet** (shared): reasons per PRD TRS-02 — Fraud, Incorrect price, Sold, Duplicate, Inappropriate content, Other (+text); creates a report record (visible in admin queue); toast; appears in Trust & Safety → My reports with status. Today's list ("Misleading images", "Spam"…) differs from the PRD. | new `components/ReportSheet.tsx` | Admin queue shows the report. |

### 3.3 Seller flows: add listing and manage (FE-SELL)

**Required:** UI flow §5. **Current gap:** hard-coded 7-step wizard with intent step, three hard-coded field sets, fake photos, SDG-only price, city/area dropdown, no contact options, pre-moderation, no published confirmation.

| ID | Task | Files | Acceptance |
|---|---|---|---|
| FE-SELL-01 | **Gate + verify:** route guard (guest → Auth Gate; unverified → OTP; restricted category → locked message). | `AddListingPage`, `useGate` | |
| FE-SELL-02 | **Rebuild the wizard to 6 steps** exactly as the UI flow: ① Category tree (every level has **Other** → reveals "type the name") ② Listing type (Sale / Rent / Wanted — only when the category supports it; Real estate adds Wanted to Buy/Rent) ③ Details (`DynamicForm` from schema + title + description + condition) ④ Media ⑤ Price/location/contact ⑥ Review & publish → ⑦ Published screen. Drop the separate "intent" step (offer service / post job move to their own flows §4.3 and §4.6). | `AddListingPage.tsx` | |
| FE-SELL-03 | **Quality score** weighted per PRD Appendix C (title+description 25, photos 25, required attrs 20, optional attrs 10, location 10, video 5, price 5) with an expandable "what to improve" checklist; recalculates live. | `AddListingPage` | Adding 2 photos raises the score visibly. |
| FE-SELL-04 | **Media step** uses `MediaUploader` with real `<input type=file accept>`: client compression to max 1920×1080 (canvas), per-file progress, retry, drag-to-reorder (the grip icon exists today but does nothing), cover selection, limit from config (default 10, not 8), video section only if enabled for the category with duration/size limits shown, on-device video size check. Remove the Pexels sample injection. | `MediaUploader.tsx` | A phone photo > 3 MB is compressed before "upload". |
| FE-SELL-05 | **Price/location/contact step:** currency toggle SDG/USD + converted hint, Negotiable; Wanted → budget min/max; Rent → period (daily/monthly/annual); `LocationPicker` (GPS / address / city + map pin, approximate-location toggle with radius); contact options (call / WhatsApp / chat) with at least one required and defaults from profile. Price optional when the category says so (jobs, some services). | step 5 | |
| FE-SELL-06 | **Autosave:** every field change writes the in-progress form to storage (resume after refresh/kill); server-style draft via `listings.saveDraft` when online; closing shows "Save draft / Discard"; show sync indicator from **real** network state. Remove the local-only "draft saved" toast that creates nothing. | `AddListingPage` | Refresh mid-form restores the step and data. |
| FE-SELL-07 | **Review step:** exact preview of the detail page, edit links per section, Terms reminder, **Publish**; handle rate-limit ("5 per hour / 20 per day") and active-listing cap errors with the next-allowed time and a link to renew/remove. | step 6 | |
| FE-SELL-08 | **Published screen `ADD-07`:** success state, listing ID, Share (system share + copy link), View listing, Post another. | new | |
| FE-SELL-09 | **My listings** (`MY-01`): tabs Active / Drafts / Expired / Sold / Hidden-Suspended with counts; real actions — Edit, Share, Mark sold, Duplicate, Renew (one tap, preserves content), Archive, Delete (confirm → soft delete, undo within the session); expiry countdown; per-listing stats (views, favorites, chats, WhatsApp taps); reason + **Appeal** for hidden/suspended. Today every action is `showToast`. | `AccountPage` → new `pages/account/MyListings.tsx` | |
| FE-SELL-10 | **Edit listing** (`MY-02`) reusing steps 3–5 in one scrolling form; edits recorded; newly-required attributes prompted only on edit. | new | |
| FE-SELL-11 | **Appeal** (`MY-04`) and **Stats** (`MY-03`) screens. | new | |
| FE-SELL-12 | **Expiry:** default 30 days per category; banner + notification at 7 days and 1 day; renew restores listing. | `services/listings.ts` | |
| FE-SELL-13 | **Wanted listings:** ribbon on cards, budget range on details, contact action primary. | cards/details | |

### 3.4 Messaging and negotiation (FE-CHAT)

| ID | Task | Acceptance |
|---|---|---|
| FE-CHAT-01 | Routes `/messages` (inbox) and `/messages/{threadId}`; inbox tabs **All / Buying / Selling** (+ Business inbox for staff); rows with listing thumbnail, party, last message, unread; search; swipe/menu Mute / Archive. | Thread deep link works after refresh. |
| FE-CHAT-02 | Thread header (party → profile, listing mini-card → details), ⋯ menu: Open in WhatsApp, Mute, Block (confirm), Report conversation. | Block prevents sending and shows the locked composer. |
| FE-CHAT-03 | Messages: statuses Sent ✓ / Delivered ✓✓ / Read ✓✓(coloured) as **distinct** states (today delivered and read render identically), typing indicator, image attach (type/size limits), idempotent retry on failure, system banner when listing sold/expired/removed, auto-scroll and unread reset. | |
| FE-CHAT-04 | Structured offers: Make offer sheet (amount + currency) → Offer card; Accept / Reject / Counter shown only to the party who must act and only while Pending; accepted price shown identically on both sides; system lines; counter creates a new card. | The state machine in UI flow §6.2 passes. |
| FE-CHAT-05 | Quick replies (sellers/business): manage templates in Settings, insert from composer. | |
| FE-CHAT-06 | Message throttling feedback (rate-limited send shows a clear message) and banned-phrase handling stub. | |

---

## 4. Missing features by area

### 4.1 Foundation (FE-A) — do before feature work

| ID | Task | Acceptance |
|---|---|---|
| FE-A-01 | **Service layer** (`src/services/`): `auth`, `listings`, `search`, `chat`, `jobs`, `business`, `reviews`, `reports`, `notifications`, `config`, `admin`. Each exports async functions with API-shaped results (`{ data, nextCursor }`, error envelope `{ code, message, details, traceId }`), latency simulation behind a dev flag, persistence in IndexedDB/localStorage. Pages import services only. | `grep -r "data/mockData" src/pages src/components` returns nothing. |
| FE-A-02 | **Path routing** replacing hash routing: clean URLs from the UI flow route map (`/l/MARBOU-00123`, `/c/{slug}`, `/search`, `/u/{id}`, `/b/{slug}`, `/jobs/{id}`, `/messages/{id}`, `/me/*`, `/admin/*`), `history.pushState`, scroll restoration, `<Link>` with real `href`, route params, guards, nested layouts, proper 404. A small `react-router-dom` dependency is acceptable here (the original brief said "no extra packages unless necessary"; this is necessary). | Deep links survive refresh; `document.title` updates per page. |
| FE-A-03 | **Data fetching layer:** TanStack Query (PRD §3.2) for server-state: caching, retries (`getRetryDelay`), optimistic favorites/messages, stale-while-revalidate for weak networks. Use `cache-strategy.ts` TTLs. | Offline: cached feeds still render. |
| FE-A-04 | **Validation:** add Zod; one validator per form generated from schema `validationRules`; same rules reused in services. | Required/min/max/regex enforced client and service. |
| FE-A-05 | **Single flag/config store** (B-17) with 60-s refresh, `useFlag('KEY')`, typed keys. | |
| FE-A-06 | **Error boundary + 404 + offline bar + global toast queue.** | |
| FE-A-07 | **Dialog/Sheet/Toast primitives** (a11y, B-23) and **ConfirmDialog** actually used for destructive actions (delete listing, withdraw application, revoke session, delete account, block user). | |
| FE-A-08 | **Currency/number/date utilities** (SDG/USD, Arabic-Indic vs Latin digits setting, relative time "منذ ٣ ساعات"). Today listings show absolute dates only. | |
| FE-A-09 | Remove dead dependencies/artefacts (B-29) and rename the package to `marbou-web`. | |

### 4.2 Schema-driven forms and filters (FE-EAV) — the core of the PRD

**Current:** `DynamicForm.tsx` renders a hard-coded `FormField[]` and is not used; `AddListingPage.getFields()` hard-codes vehicles / real-estate / electronics and falls back to "Condition" for everything else; filters are static. The PRD (CAT-06…09) requires forms and filters generated from a category schema fetched with an ETag.

| ID | Task | Acceptance |
|---|---|---|
| FE-EAV-01 | Define `CategorySchema` types: `{ version, attributes: [{ key, labelEn, labelAr, dataType, isRequired, isFilterable, isSearchable, promoteToIndex, isArchived, validationRules{min,max,regex}, options[{value,labelEn,labelAr,dependsOn?}], unit?, displayOrder }] }` with the 8 data types TEXT, NUMBER, BOOLEAN, SINGLE_SELECT, MULTI_SELECT, DATE, RANGE, FILE_URL. | Matches PRD §4.1. |
| FE-EAV-02 | `services/schema.ts`: `getSchema(categoryId)` with `If-None-Match`/ETag simulation and cache; unknown data types hidden with a one-time "update the app" notice. | Changing the seed schema version refetches. |
| FE-EAV-03 | Rewrite `DynamicForm` to take a schema and `mode: 'create' \| 'edit' \| 'filter' \| 'compare'`; component map per UI flow §2.1; dependent options (Make→Model, Region→City); **Other** option on every category/select with required custom text; archived attributes hidden in create/filter but shown in specs; compile Zod from `validationRules`. Wire it into AddListing, Edit, FilterPanel, Compare. | The same schema renders form, filters and compare rows. |
| FE-EAV-04 | **Seed full schemas** for every PRD vertical (AUTO-02…05, 09, 19, 20; RE-04, 06, 09; HOT-02; EQP-02…06; GEN-01…03; jobs in §4.6). | Each category's post form shows its PRD attributes. |
| FE-EAV-05 | Category tree supports **unlimited depth**, order, active/archived, per-category posting restriction + message, expiry days; every level has **Other**. Seed data restructured accordingly. | |
| FE-EAV-06 | Admin edits (AD-60) change the schema in the service; the app picks it up on next fetch without a code change. | Demo: add "Colour" attribute in admin → appears in the post form. |

### 4.3 Automotive (FE-AUTO)

| ID | Task | Acceptance |
|---|---|---|
| FE-AUTO-01 | Post forms for Cars (New/Certified/Used), Trucks & Heavy, Rickshaws/Tuk-Tuks, Motorcycles, Spare Parts (part no., OEM/aftermarket, **compatibility make/model/year-range**), Services, Towing (flatbed/hook, **emergency number, radius/area**, optional live-location chip), Computer Diagnostics (inspection type, mobile capability, certificate). Optional **vehicle ID + ownership doc** upload to a private area ("visible to MARBOU only"). | |
| FE-AUTO-02 | Vehicle filter matrix on search (make→model, year, mileage, transmission, fuel, displacement, body, duty-paid, regional spec, condition, price) and "Fits my vehicle" for parts. | |
| FE-AUTO-03 | **Vehicle rental** — screens `RENT-01…03`, `RENT-10/11`: rental listing fields (daily/weekly/monthly rates, deposit, mileage cap, driver option, conditions, pickup); details page pricing + deposit/terms; **Request rental** form (dates, driver option, pickup, notes) with terms **snapshot**; status timeline Requested → Accepted/Declined/Countered → Completed/Cancelled; owner inbox with Accept / Decline / Counter; notifications; Profile → My rental requests. **No payment.** | Completes in < 2 min; owner sees it at once. |
| FE-AUTO-04 | **Service provider & appointments** — `SVC-01`, `APPT-01…05`, `APPT-10/11`: provider profile (services, rates, working hours, slot duration, **capacity per slot**); customer flow service → vehicle & issue (+ diagnostic images) → date/slot → confirm; fully booked slots hidden; provider calendar with Confirm / Decline / Propose new time / Completed / No-show; user Cancel/Reschedule; customer confirms completion (or 72 h lapse) → review prompt; reminders 24 h and 2 h (notification entries). | A slot at capacity disappears. |
| FE-AUTO-05 | Dealer storefront: inventory counter, showroom map, registration badge. Today `/booking` is a "Coming soon" page — remove it. | |

### 4.4 Real estate and hotels (FE-RE, FE-HOT)

| ID | Task | Acceptance |
|---|---|---|
| FE-RE-01 | 12 property types (+ Other) × 4 transactions (For Sale, For Rent, Wanted to Buy, Wanted to Rent) via schema; rent period (daily/monthly/annual); area unit selector and viewer-preferred display with **price per m²**; Projects & Investments (developer, stage, completion date, unit types, starting price, brochure PDF); floor-plan upload; privacy radius default ON for residential. | A Villa For Sale and a Wanted-to-Rent flat both post, search and compare. |
| FE-RE-02 | Real-estate filters (type, transaction, price, area, beds, baths, furnishing, finishing, city/neighbourhood, power backup); agent/agency storefront with verified badge and active counter; compare up to 4. | |
| FE-HOT-01 | Hotels/guest houses/furnished/long-stay with nightly + monthly price, rooms/beds/capacity, amenity icons (Wi-Fi, generator/solar, security, AC, parking, breakfast, kitchen…). | |
| FE-HOT-02 | **Inquiry** (`HOT-01`, ≤ 2 taps from details): dates, guests, message → opens a chat thread with an inquiry card; host **Inquiries inbox** (`HOT-10`) with New/Replied/Confirmed-Stay/Closed; host **availability calendar** (`HOT-11`) marks unavailable ranges; **Confirmed Stay** action enables the guest's review (and guest can dispute). Reservation UI only when `HOTEL_RESERVATIONS` is ON. | Review button absent until Confirmed Stay. |

### 4.5 Equipment, livestock, general goods (FE-GEN)

| ID | Task |
|---|---|
| FE-GEN-01 | Solar & Power under Tractors & Equipment: panels (wattage, cell type, warranty), inverters (KVA, pure sine, hybrid/off-grid), batteries (type, Ah, voltage, warranty), generators (KVA, fuel, soundproof, hours); installation/delivery/warranty switches; promoted filters KVA, battery chemistry, panel wattage, Installation Included. |
| FE-GEN-02 | Livestock (type, breed, age, weight, health/vaccination tags, head count, bulk quantity) and crops (tons, grade, harvest date, delivery) with chips on cards/details; Arabic-first names (e.g. جلابية) with English equivalent; Fashion, Children, Home, Food, General Marketplace schemas with Other. Wholesale MOQ/tier fields only when `WHOLESALE` ON. |

### 4.6 Jobs, CV and employers (FE-JOB)

**Current:** a list, a detail page and a modal "apply" form (name/email/phone/cover letter) that marks the job "sent" in localStorage (`status: 'new'` forever). Filters are `government / private / freelance / remote` (not the PRD employment types). Business dashboard "Job posts" is an empty state whose button toasts. Nothing for employers.

| ID | Task | Acceptance |
|---|---|---|
| FE-JOB-01 | Employment types: Full-time, Part-time, Contract, Daily. List filters: category, type, location, salary; Verified Employer badge; applied tag; expired jobs hidden; **Create alert** bar. | |
| FE-JOB-02 | **Quick Apply** page (`JOB-03`): name, phone (+249), email, city (prefilled), optional photo, summary, PDF CV, **screening-question answers**; < 60 s; duplicate and daily-limit (20) errors; OTP gate if email unverified. | |
| FE-JOB-03 | **Full Profile builder** (`JOB-04`) 6 steps with autosave: personal, driving & transport, education (multi), work experience (multi, current-employer switch), skills tags + languages (Native/Fluent/Intermediate/Basic), certificates (PDF/JPG/PNG). All documents private; candidate can delete anytime. | |
| FE-JOB-04 | **CV choice** (`JOB-05`) and **Create-CV-for-me** (`CV-01…04`): upload PDF or "I don't have a CV – create one for me for free"; submission status chip Pending → In Progress → Delivered → Revision Requested → Approved; in-app PDF review with Approve / Request revision (note). Optional in-app builder with layouts + PDF export. | |
| FE-JOB-05 | **Application status** (`JOB-06`): timeline Submitted → Viewed → Shortlisted → Interview → Rejected/Hired, withdraw (confirm), shows exactly which documents the employer can see; Profile → My applications. | |
| FE-JOB-06 | **Job alerts** (`JOB-07`): category + location + keywords, toggles. | |
| FE-JOB-07 | **Employer area** (`EMP-01…06`): become an employer (company, logo, optional verification docs); Job form with **screening-question builder** and scam-pattern warning; My jobs (renew/edit/close); **Applicants** with status filters, notes, applicant detail with documents opened via short-lived signed viewer; employers never see candidates who did not apply. | |
| FE-JOB-08 | Remove "government/private/freelance/remote" types and the saved-jobs heart unless the product owner wants them; keep "Save job" only if added to the PRD. | |

### 4.7 Business / dealer (FE-BIZ)

**Current:** the dashboard always uses `businesses[0]`, shows fixed numbers and bar charts, and has no staff invite, bulk actions, CSV export, inbox, verification request or share link; plans are priced in `egp`.

| ID | Task | Acceptance |
|---|---|---|
| FE-BIZ-01 | Become-a-business flow (`PRF-12`: name, logo, cover, description, hours, location, contact channels, type) creating a `BusinessProfile` owned by the signed-in user; dashboard reads *their* business. | |
| FE-BIZ-02 | Public storefront `/b/{slug}`: verified badge, hours, map, contact buttons, catalogue with filters + total count, share link, reviews. | |
| FE-BIZ-03 | Dashboard Overview from real service data: views, unique viewers, leads (chat / WhatsApp / call), conversion, ranges 7/30/90 d, top listings, search impressions, audience location (aggregates only); **CSV export**. | Numbers change when listings are viewed. |
| FE-BIZ-04 | Listings with **bulk actions** (Renew, Hide, Mark sold, Delete) and multi-select; confirm dialogs. | |
| FE-BIZ-05 | **Staff:** invite by email, roles Manager / Editor / Support with enforced permissions, remove; scope limited to the business. Shared **business inbox** with quick replies. | An Editor cannot open Staff or Analytics. |
| FE-BIZ-06 | **Verification request** with document upload (private) and statuses Pending / Approved / Rejected(reason) / More info. Remove the hard-coded "Approved" documents. | |
| FE-BIZ-07 | Remove plan/subscription/promote surfaces unless flags ON (B-17). | |

### 4.8 Account, settings, trust (FE-PRF)

| ID | Task |
|---|---|
| FE-PRF-01 | Profile hub with sections per held capability (UI flow §10.1); **remove the 12-tab sidebar clone** and the "Demo User" identity. Add missing destinations: My rental requests, My appointments, My reviews, Verification, Blocked users, Quick replies, Help. |
| FE-PRF-02 | Upgrade flows: Become Dealer/Business, Employer, Service Provider — short guided forms; sections appear immediately after completion; a user can hold several. |
| FE-PRF-03 | Edit profile: avatar/cover (media pipeline, safe-content stub), name, city, bio, languages, preferred contact methods; phone shows Unverified/Verified. |
| FE-PRF-04 | **Verification request** (Seller / Dealer / Business / Employer / Service Provider) with private document upload and status chip. |
| FE-PRF-05 | **Public seller profile** `/u/{id}`: badges, join date, rating history, response rate/time, active listings, tabs Listings/Reviews; actions Chat, Share, Report, Block. |
| FE-PRF-06 | **Reviews:** qualifying-interaction gate (two-way chat ≥ 2 msgs each / completed rental / confirmed appointment / Confirmed Stay), one review per interaction, seller reply once, report review. Remove "write review" from listing pages for non-eligible users. |
| FE-PRF-07 | **Notification preferences** that persist: categories × channels (push, email); SMS row only when SMS flag ON (today SMS is listed and toggles are inert). |
| FE-PRF-08 | **Notifications feed** from a real store (read/unread, grouped by day, deep links per UI flow §14.2), bell badge at all sizes; today it is a static `sampleNotifications` list. |
| FE-PRF-09 | **Security Center:** sessions, login history, change password, change email (OTP), manage phone, 2FA row removed for customers (TOTP is admin-only). Replace the hard-coded iPhone/MacBook rows. |
| FE-PRF-10 | **Privacy & data:** Export my data (request → ready → JSON download), Pause account, **Delete account** (re-auth → email OTP → 30-day grace, cancel option, Pending-Deletion sign-in prompt). Remove the "this is a prototype" modals. |
| FE-PRF-11 | Blocked users list with Unblock; effect: blocked user cannot start chat/offer on the blocker's listings; listings remain public. |
| FE-PRF-12 | Data Saver, Language, Contact preferences as real settings (language syncs to account; fix the `/` no-op link). |
| FE-PRF-13 | **Trust & Safety Center:** safe-trading tips, my reports with status, blocklist shortcut. |

### 4.9 Help, legal, support (FE-HELP)

**Current:** 19 pages, all lorem-style placeholders ("sample page within the interactive prototype"). No versioning, tickets or deletion info page.

| ID | Task |
|---|---|
| FE-HELP-01 | Help Center with search + topic cards (safe trading, payments, account, jobs, rentals, appointments, rules) and **real article content** loaded from `services/content` (editable in admin AD-80). Separate legal documents from help topics. |
| FE-HELP-02 | Legal pages (Terms, Privacy, Trading Rules) show **version and effective date**; when a new version requires acceptance show a blocking **Accept updated terms** sheet on next load. |
| FE-HELP-03 | Contact support → ticket form (subject, message, attachments) → ticket number; **My tickets** with agent replies. |
| FE-HELP-04 | Public `/account-deletion` page (Play/App Store requirement): what is deleted, grace period, how to request, sign-in link. |

### 4.10 Payments UI (flag-gated, FE-PAY)

**Current:** the Bankak flow lives inside the Business "Plan" tab modal (fake receipt "upload" button, fictional account naming "Bank of Sudan", fixed reference placeholder). The PRD names **Bank of Khartoum (Bankak)** and the flow is a manual receipt queue.
- FE-PAY-01 Move to a standalone `PAYU-01…04` flow shown only when `BANKAK_PAYMENTS` (and a purchasable item) exist: instructions, reference + amount + **real receipt image upload** (media component), Pending status screen, approved/rejected push with reason, invoice download.
- FE-PAY-02 Staging must default this flag ON so the admin queue can be tested; Production OFF.

---

## 5. Admin dashboard (FE-ADM)

**Current:** one 569-line page with 14 tabs, **no login/2FA/RBAC**, 9-role dropdown, static numbers, and almost every control a toast. The "listings" tab is a pre-publication approval queue (contradicts PRD).

### 5.1 Security and shell

| ID | Task | Acceptance |
|---|---|---|
| FE-ADM-01 | Own entry `/admin/login` (email+password) → **TOTP 2FA** (enrol with QR + backup codes mock; then code entry) → dashboard. Session timeout; IP-allow-list message; sign-out. Lazy-load the whole admin bundle. | Direct URL without session redirects to login. |
| FE-ADM-02 | **Exactly four roles:** Super Admin, Content Moderator, Support Agent, Financial Auditor; permission matrix from PRD §5; sidebar and routes filtered by role; 403 page; remove the 9-role dropdown and the header `DemoRoleSwitcher`. | A Moderator cannot open payments, flags or schema builder. |
| FE-ADM-03 | Standard table component (filters row, saved views, server-style pagination, bulk actions, CSV export) and **reason-code dialog** + **change history drawer** for every destructive/config action; all actions write to a real audit store. | Each action appears in the audit log with before/after. |

### 5.2 Screens (target IDs from the UI flow) — status

| Screen | Status | Gap |
|---|---|---|
| AD-10 KPIs | Partial | Hard-coded numbers; make role-filtered, live from services; tiles link to queues. |
| AD-11/12 Users | Partial | Static 4-row table; need search, filters, detail page (profile, capabilities, listings, reports, sessions revoke, badges grant/revoke with reason, suspend/ban/restore with reason + duration, notes). No impersonation. |
| AD-20/21 Listings | Wrong model | Replace approve/reject with search + detail + Edit / Hide / Suspend / Delete / Restore, edit history, scan results. |
| AD-30 Post-Moderation Audit Center | Missing | Live stream of new listings, flagged queue, content editing, suspension tools. |
| AD-31 Reports queue | Partial | Static 3 rows; need priority sort, evidence panel, actions with reason codes, reported-conversation read-only view. |
| AD-32 Appeals | Missing | Uphold / Reverse with notifications. |
| AD-33 Blacklists | Missing | Phones, emails, devices, keywords, image hashes. |
| AD-34 Moderation settings | Missing | Auto-hide threshold (5 reports/24 h), fraud thresholds, **delayed-visibility per category/tier (default OFF)**, throttling, banned phrases. |
| AD-40 Verification queue | Missing | Docs viewer with zoom/pan/rotate; Approve (grants badge) / Reject (reason) / More info. |
| AD-41 CV processing portal | Missing | Queue by status, structured data view, upload/deliver CV, revisions. |
| AD-42/43 Tickets, rental/appointment lookup | Missing | |
| AD-50 Payments console | Partial | Modal is a placeholder icon; need receipt viewer with **zoom/pan/rotate**, profile beside it, duplicate-reference/reused-image warnings, Approve, Reject with required reason, audit trail, CSV. Only Finance Auditor and Super Admin. |
| AD-60 EAV Schema Builder | Partial | Static single-field form; need category tree (drag order, archive/restore, posting restriction, expiry), attribute editor (key immutable, labels EN/AR, 8 types, required/filterable/searchable/**promote**, validation, option lists with dependencies), **Preview**, **Publish schema change** bumping version. |
| AD-61 Other entries | Missing | Counts + one-click promote with optional migrate. |
| AD-62/63 Option lists, geography | Missing | Makes/models, body types, property types, amenities; state→city→neighbourhood tree. |
| AD-70 Feature flags | Partial | Local state, wrong flag set (single `otp`, `sms`, `push`…). Need per-channel `OTP_EMAIL/SMS/WHATSAPP` with the **last-channel-cannot-be-disabled** rule, video (global/per category), monetization engines, hotel reservations, wholesale, Bankak, AdMob, category restrictions; writes to the shared store; change history; per-country override. |
| AD-71 Media limits | Missing | Video toggle, duration, size, photo count. |
| AD-72 Configurable defaults | Missing | Editable Appendix C table. |
| AD-73/74 App versions, maintenance | Missing | Drives FE-ONB-02. |
| AD-75/76/77 Country matrix, exchange rates, maps usage | Partial/Missing | Country page is static inputs; add rates with effective date + staleness, Maps usage monitor. |
| AD-80 Content | Partial | Banners (schedule/targeting), announcements, static pages, help articles AR/EN, **legal versions**, translation manager with missing-key view, WhatsApp template, synonyms, featured category order. Currently a list of links to the placeholder help pages. |
| AD-81 Broadcast | Partial | Audience (all / role / city / category interest), AR+EN text, schedule, preview, delivery stats. |
| AD-90/91 Admin users & sessions | Partial/Missing | Create admin, deactivate, reset 2FA; session revoke; IP log. |
| AD-92 Audit log | Missing | Filter by actor/entity/date, before/after, chain verify; read-only for Auditor. |
| AD-93 Analytics | Partial | Static bars; add funnels (posting drop-off, sign-up OTP funnel), retention, zero-result queries, Other-entry analytics, CSV + scheduled. |
| AD-94 System health | Missing | Uptime, errors, queues, backups, retention-job runs (mock). |

---

## 6. Cross-cutting findings

### 6.1 Internationalisation and hard-coded strings
- **169** inline `lang === 'ar' ? … : …` ternaries (most in `JobsServicesBusiness` 26, `ListingDetailPage` 20, `AddListingPage` 20, `HomePage` 17, `BusinessDashboard` 16, `FavoritesCompareMessages` 15). Move all to keys.
- English-only literals in the UI: `Demo User`, `demo@marbou.sd`, plan names `Free/Basic/Premium`, admin table rows, report reasons, `Commercial Registration`, device names, `Khartoum · Active now`, compare spec keys, `Notification title`/`Message content` placeholders, "Fraud or scam" lists.
- Three JSON translation files under `i18n/translations/` (`ui.json`, `marketplace.json`, `errors.json`) are **unused**; delete or adopt one structure (the design docs plan 12 feature files). Keep one source of truth.
- Fix the `as TranslationKey` casts (B-04) and make `t()` fail loudly in dev when a key is missing.
- Arabic digits: choose and implement one policy (`ar-EG` currently forces Arabic-Indic digits for prices and dates; PRD does not say). Add a setting.
- Relative dates ("2 hours ago") must be localised; admin/business mocks use literal `2h ago`.

### 6.2 Accessibility (WCAG 2.1 AA target, NFR-UX-03)
Accessible dialogs/sheets, focus management, `aria-live` toasts, keyboard-operable tiles and map pins, `aria-label` on icon-only buttons (several have none), visible focus rings, 44×44 px targets (header icon buttons are ~36 px), form errors linked with `aria-describedby`, contrast check for `text-primary-300/400` on sand backgrounds, reduced-motion respected (exists in CSS; keep). Run `eslint-plugin-jsx-a11y` and axe in the Playwright suite.

### 6.3 Performance and weak network
Use real `srcSet`/`sizes` thumbnails (`image-optimization.ts` presets), lazy images with intrinsic size to prevent layout shift, virtualised long lists only if needed, route-level code splitting already exists (`React.lazy`) — keep and **verify the manual chunk config in `vite.config.ts` still matches file names** (it names chunk groups by page files; check the build output for oversized `page-utils`/`page-business`). Remove Google Fonts `@import` from CSS in favour of `<link rel="preconnect">` + `display=swap` in `index.html` (or self-host) to avoid render-blocking. Show an offline bar from real detection; auto-retry with backoff; skeletons that match final layouts (home skeleton exists; add for detail, chat).

### 6.4 Dead code (written, never used) — adopt or delete
| File | Status | Action |
|---|---|---|
| `components/AuthGateSheet.tsx` | not rendered | Adopt (B-03). |
| `components/ConfirmDialog.tsx` | not imported | Adopt (FE-A-07). |
| `components/DynamicForm.tsx` | not imported | Rewrite (FE-EAV-03). |
| `components/MediaUploader.tsx` | not imported; injects Pexels sample photos | Rewrite (FE-SELL-04). |
| `components/marketplace/LocationPicker.tsx` | not imported | Adopt (FE-SELL-05, B-27). |
| `components/form/*` (TextInput, TextArea, PhoneInput, PriceInput, DatePicker, FileUpload, Select, index) | pages use raw `<input class="input">` | Adopt everywhere (register, login, jobs, profile, admin, business). |
| `utils/weak-internet.ts`, `cache-strategy.ts`, `image-optimization.ts`, `code-splitting.ts` | not imported | Adopt (B-26, FE-A-03). |
| `i18n/translations/*.json` | not imported | Delete or adopt. |
| `components/ListingCard.tsx` | 2-line re-export of the marketplace one | Delete the shim; import from one place. |
| `AppContext` flags, `gatedAction`, `showAuthGate`, `recentlyViewed` UI | declared, unused or partially used | Rewire (B-03, B-17). |
| Logo SVG duplicated 7× (AppShell, AuthPages ×6, dashboards) | | Extract `<Logo />`. |

### 6.5 SEO, sharing, deep links (FE-X-01)
Until the Next.js migration (D-1) the SPA must at least: set `document.title` and meta description per route, ship real Open Graph defaults (replace the bolt.new image), generate a sitemap/robots at build, provide canonical URLs, and mark `index.html` for prerendering of `/`, `/c/*`, `/l/*` (e.g., `vite-plugin-ssr`/prerender step) **or** record the Next.js migration as a pre-launch blocker with an owner and date. Universal-link files (`apple-app-site-association`, `assetlinks.json`) belong in `public/.well-known/`.

### 6.6 Security hygiene (front-end side)
No tokens or passwords in `localStorage` in plaintext; sanitize any HTML shown from admin content; avoid exposing contact numbers in markup or listing payloads (DET-13); private documents only via short-lived signed viewer; CSP-friendly (no inline `dangerouslySetInnerHTML`); client-side rate-limit UX (lockout timers).

---

## 7. Per-screen status against `MARBOU_UI_FLOW.md`

Legend: ✅ meets spec · 🟡 exists but incomplete or wrong · ❌ missing. (No screen is ✅ today.)

| Screen | Status | Note |
|---|---|---|
| SYS-01/02/03 splash, maintenance, force-update | ❌ | FE-ONB-02 |
| ONB-01…04 language, country/city, permissions, welcome | ❌ | Header toggles only |
| AUTH-00 auth gate | 🟡 | Component exists, not wired |
| AUTH-01 hub | 🟡 | Social = mock; no language toggle |
| AUTH-02 register | 🟡 | Wrong model; no terms; no OTP; password lost |
| AUTH-03 login | 🟡 | No return-to; no lockout |
| AUTH-04 OTP | 🟡 | Accepts any code; unreachable |
| AUTH-05/06 reset | 🟡 | Link not OTP; no effect |
| AUTH-07 add email | 🟡 | No OTP |
| AUTH-08 verify phone | ❌ | Flag-gated, absent |
| HOME-01 | 🟡 | Static slices; promo banner; no real nearby/recommended |
| CAT-00 all categories | ❌ | Dropdown menu only |
| CAT-01 category landing | 🟡 | Subcategory chips broken |
| SRCH-01 search entry | ❌ | Inline only |
| SRCH-02 results | 🟡 | B-05, B-06, B-30…32 |
| SRCH-03 filters | 🟡 | 3 static groups |
| SRCH-04 map results | 🟡 | Fake pins |
| SRCH-05 save search | 🟡 | Query only; not gated |
| DET-01 details | 🟡 | B-12…B-15; missing owner view, banners, video, ID format |
| DET-02 fullscreen gallery | 🟡 | No swipe/zoom |
| CMP-01 compare | 🟡 | B-16 |
| ADD-01…06 wizard | 🟡 | 7 steps, hard-coded, fake media, pre-moderation |
| ADD-07 published | ❌ | |
| MY-01 my listings | 🟡 | Toast-only actions |
| MY-02 edit / MY-03 stats / MY-04 appeal | ❌ | |
| CHAT-01 inbox | 🟡 | No tabs, no thread routes |
| CHAT-02 thread | 🟡 | Offers/attach/block/report not functional |
| RENT-01…03, 10, 11 | ❌ | |
| APPT-01…05, 10, 11 / SVC-01 | ❌ | `/booking` is "Coming soon" |
| HOT-01, 10, 11 | ❌ | |
| JOB-01/02 list/detail | 🟡 | Wrong types; no screening/alerts |
| JOB-03 quick apply | 🟡 | Modal; missing CV, OTP, limits |
| JOB-04 profile builder, JOB-05 CV choice, CV-01…04 | ❌ | |
| JOB-06 status | 🟡 | Static `new`; no timeline/withdraw |
| JOB-07 alerts | ❌ | |
| EMP-01…06 | ❌ | |
| BIZ-01 storefront | 🟡 | |
| BIZ-10 dashboard | 🟡 | Hard-coded business/metrics |
| BIZ-11…14 | 🟡/❌ | No bulk, staff invite, inbox, export |
| PRF-01 hub | 🟡 | Tab clone; fake identity |
| PRF-03/04/05 | 🟡 | Work for local state only |
| PRF-06/07/08 | ❌ | |
| PRF-09 edit profile | 🟡 | Static `defaultValue` |
| PRF-10 verification | ❌ | |
| PRF-11 settings | 🟡 | Inert toggles |
| PRF-12/13/14 upgrades | ❌ | Business only at register |
| PRF-15 notification prefs | 🟡 | Inert |
| PRF-16 security center | 🟡 | Static devices |
| PRF-17 privacy & data | 🟡 | "Prototype" modals |
| PRF-18/19 blocked, quick replies | ❌ | |
| PRF-20 public profile | 🟡 | Name-keyed route |
| NTF-01 | 🟡 | Static sample |
| HELP-01/02/05 | 🟡 | Placeholder text |
| HELP-03/04/06/07 | ❌ | |
| REV-01/02, REP-01 | 🟡 | Ungated; wrong reasons |
| PAYU-01…04 | 🟡 | Inside business modal |
| AD-00…02 login/2FA | ❌ | |
| AD-10, 11/12, 31, 50, 60, 70, 75, 80, 81, 90, 93 | 🟡 | See §5.2 |
| AD-20/21 | 🟡 | Wrong (pre-moderation) |
| AD-30, 32…34, 40…43, 61…63, 71…74, 76, 77, 91, 92, 94 | ❌ | |

---

## 8. Execution plan (order matters)

**Phase 0 — Stabilise (½–1 day).** §0.2 verification; fix B-04, B-05, B-47; delete dead shims/artefacts (B-29); extract `<Logo/>`; add ErrorBoundary and safe `JSON.parse`.

**Phase 1 — Foundation (2–3 days).** FE-A-01 service layer + seed migration, FE-A-02 path routing, FE-A-03 TanStack Query, FE-A-04 Zod, FE-A-05 flags/config, FE-A-06/07 primitives, FE-A-08 currency utils.

**Phase 2 — Identity and gating (2 days).** B-01, B-02, B-03, FE-AUTH-01…09, FE-ONB-01…03, B-42 mobile header, B-22 route guards (customer side).

**Phase 3 — Marketplace core (5–7 days).** FE-EAV-01…06, FE-SELL-01…13 (fix B-10, B-20), FE-DISC-01…11 (fix B-06, B-12…B-16, B-26, B-27, B-30…B-33), FE-CHAT-01…06.

**Phase 4 — Admin core (3–4 days, can run in parallel with Phase 3).** FE-ADM-01…03; AD-10, AD-20/21, AD-30…34, AD-60/61, AD-70…72, AD-92 (the screens that make Phases 3's data controllable).

**Phase 5 — Verticals (4–6 days).** FE-AUTO-01…05, FE-RE-01/02, FE-HOT-01/02, FE-GEN-01/02.

**Phase 6 — Jobs and business (4–5 days).** FE-JOB-01…08, FE-BIZ-01…07, AD-40/41.

**Phase 7 — Account, trust, content (3–4 days).** FE-PRF-01…13, FE-HELP-01…04, AD-42, 43, 80, 81, 90, 91, 93, 94.

**Phase 8 — Flag-OFF and hardening (3 days).** FE-PAY-01/02 behind flags, A11y pass, weak-network pass, RTL audit at 320/360/768/1024/1440, Lighthouse, Playwright suite, remove demo tooling from production build.

Do **not** start Phase 5+ before Phases 1–3 pass their QA scripts: every vertical depends on the schema renderer, services and gating.

---

## 9. QA scripts — verify every user flow

Run these manually in **both Arabic (RTL) and English**, at **360 px, 768 px and 1280 px**, and automate the starred ones in Playwright. Each line is *do → expect*. "Today" shows the current result from code review so the agent knows what must change.

### 9.1 Guest
1. ★ Open `/` → hero search, categories, banners, Nearby uses chosen city. *Today: Nearby is a static slice.*
2. ★ Switch language on a 360 px screen → layout flips, text changes, choice persists. *Today: impossible on phones (B-42).*
3. ★ Tap Favorite on a card → Auth Gate sheet; sign in → returns and the heart is filled. *Today: favorites without sign-in.*
4. Tap WhatsApp on a listing → opens `wa.me/…` with prefilled "title, MARBOU-ID, price". *Today: toast only.*
5. Tap Call on a chat-only seller's listing → no number in the UI or DOM. *Today: fixed fictional number.*
6. ★ Search `سيارة` / `سياره` / `ﺳﻴﺎرة` (hamza/ta-marbuta variants) → same results. *Today: raw `includes`.*
7. ★ Search `MARBOU-00012` → opens that listing. *Today: IDs are `MB-2401-…`.*
8. Open a deleted/expired listing link → "no longer available" + similar. *Today: generic no-results.*
9. ★ Open `/admin` and `/business` as guest → redirected to login. *Today: both open.*
10. Visit `/does-not-exist` → 404 page. *Today: Home.*

### 9.2 Registration and sign-in
11. ★ Register with email+password+terms → OTP screen → wrong code ×5 → locked; correct code → verified → resumes the gated action. *Today: straight to /account; any OTP accepted.*
12. ★ Register, sign out, sign in with same credentials. *Today: fails (B-01).*
13. Forgot password → OTP → new password → old password no longer works; other sessions revoked.
14. Social sign-in with no email → Add email → OTP; until verified, Post/Chat/Apply are blocked.
15. Fail login 5× → lockout countdown; suspended account → reason screen.
16. Header after sign-in shows name/avatar; Sign out clears session and protected routes redirect. *Today: header never changes (B-02).*

### 9.3 Buyer
17. ★ Category → subcategory chip filters results; breadcrumb correct; **Other** present at every level.
18. ★ Vehicles filters: make → model dependent, year range, mileage range → count updates live; Back returns to previous page, not previous filter (B-06).
19. ★ On the search page, use the header search → results update (B-06).
20. At 768–1023 px open filters → panel appears (B-05).
21. Map toggle shows real OSM map, clustered pins, approximate-area circle for private listings.
22. Infinite scroll loads next cursor page; empty state shows suggestions and Save search.
23. Save search with filters and frequency → appears in Profile with filters summary; deleting works.
24. Compare 4 vehicles (RTL and LTR render correctly); 5th blocked with message; mixed categories blocked; differences highlight.
25. Price insight shows only with ≥ 8 comparables and label Below/Fair/Above. *Today: fabricated.*
26. Data Saver ON → network panel shows only small thumbnails; original images are **not** requested (check DevTools). *Today: still downloaded.*

### 9.4 Seller
27. ★ Post a Car: category → type → details (schema) → media → price/location/contact → review → **Publish**. Listing is live at once, has `MARBOU-NNNNN`, appears in My listings, Home and search. *Today: never appears; "submit for review".*
28. Refresh at step 4 → restored. Kill tab, return → restored.
29. Choose **Other** → type custom name → stored and searchable.
30. Post exceeding hourly limit → clear message with time; active-listing cap message.
31. Post a Wanted listing (budget range, no price). Post USD-priced listing → converted hint.
32. My listings: Edit, Mark sold, Duplicate, Renew an expired listing (one tap), Delete (confirm, soft), Appeal on a hidden listing.
33. Photos: add from device, compress (>3 MB → smaller), reorder by drag, change cover, remove; limit 10; video over limit → clear error.

### 9.5 Chat
34. ★ From a listing tap Chat → thread anchored to that listing; second tap reuses the thread.
35. Send text/image; offline → retry icon; retry creates exactly one message.
36. Make offer → card → seller Accept/Reject/Counter → buyer sees the result; accepted price identical both sides.
37. Block (confirm) → composer locked; report conversation → visible in admin queue.
38. Open `/messages/{id}` directly after refresh → thread loads.

### 9.6 Verticals
39. Rental: request with dates/driver/notes → owner sees → Counter → renter Accepts → Completed → review prompt. Terms snapshot stored.
40. Appointment: book slot → slot at capacity disappears → provider Confirm → reminders appear → Completed → customer Confirm → review.
41. Hotel: inquiry in two taps → host Confirms stay → guest can review (not before).
42. Real estate: Villa For Sale + Wanted-to-Rent flat post, search, compare; area unit conversion; price per m².
43. Livestock listing shows breed/weight/health chips on card and detail.

### 9.7 Jobs
44. Quick Apply in < 60 s; second apply to same job blocked; 21st application of the day blocked.
45. Full profile builder, autosave per step; delete a certificate.
46. "Create CV for me" → status Pending → admin delivers → candidate Approve / Request revision.
47. Employer: post job with screening questions → applicants list → status changes push to candidate → employer cannot open documents of non-applicants.

### 9.8 Business
48. Become business → storefront `/b/{slug}` → invite staff (Editor) → Editor cannot see Staff/Analytics → bulk Renew/Hide/Delete → CSV export opens.
49. Verification request upload → admin approves → badge appears on listings and storefront.

### 9.9 Account and privacy
50. Settings: language, data saver, notification prefs, contact prefs all persist and take effect.
51. Security: revoke a session; change email requires OTP.
52. Export data → JSON file downloads. Delete account → re-auth → OTP → "scheduled in 30 days" → cancel works.

### 9.10 Admin
53. ★ Login with 2FA; Moderator sees only moderation screens; Finance sees payments + audit (read-only); Support sees tickets/CV/users (read-only); Super Admin sees all.
54. Hide a listing with reason → disappears from search, owner notified, audit entry with before/after.
55. Report → priority queue → evidence → action → reporter notified.
56. Schema builder: add attribute → Preview → Publish → appears in post form and filters at next fetch.
57. Promote an "Other" entry to a subcategory (optionally migrate listings).
58. Flags: toggle monetization ON → plans/promote/sponsored appear; OFF → vanish within 60 s. Try disabling the last OTP channel → blocked with message.
59. Payments: receipt zoom/pan/rotate; reject requires reason; duplicate reference flagged.
60. Maintenance mode ON → user app shows maintenance screen; OFF restores.

### 9.11 Cross-cutting
61. ★ Lighthouse (mobile): Performance ≥ 85, Accessibility ≥ 95, SEO ≥ 90 on `/`, a category page and a listing page.
62. ★ axe-core: zero critical/serious violations on Home, Search, Detail, Add listing, Chat, Login.
63. Throttle to "Slow 3G": home interactive < 6 s, detail < 4 s, nothing breaks; Offline: cached pages open, write actions explain they need a connection.
64. RTL audit: no overlapping/mirroring bugs at 320 px; icons that indicate direction mirror.
65. Search the built bundle/DOM for the strings "fictional", "prototype", "demo", "coming soon", "Demo User" → none in production.

---

## 10. Definition of done for this task

- All **P0** items (B-01, B-02, B-03, B-10, B-17, B-20, B-22, B-42) fixed and covered by Playwright tests.
- Every flow in §9 passes in AR and EN at 360/768/1280 px.
- `npm run typecheck`, `lint`, `build` clean; no `any` introduced; no unused exports from §6.4.
- No user-visible string outside `translations.ts`; no `lang === 'ar'` ternaries for copy.
- No button that only shows a toast; features that are flagged OFF have no entry points.
- `docs/frontend-status.md` updated with a per-screen table (use the §7 format) and the list of mock services to replace by real endpoints (PRD §10.2 names).
- Owner decisions D-1…D-5 recorded with the choice taken.

---

## Appendix A — Where each PRD rule is currently violated (quick index)

| PRD rule | Violation | Item |
|---|---|---|
| LST-03 instant publish | "Submit for review", approval queue | B-20 |
| MON-01 no monetization UI when OFF | Promo banner, sponsored badges, plans, EGP prices | B-17 |
| AUTH-18 / G3 gate on gated actions | Nothing gated | B-03 |
| AUTH-01/05 OTP rules | No OTP; any code accepted | B-21 |
| AUTH-12 phone unverified contact field | OK as a field; no unverified marker | FE-AUTH-01 |
| LST-09 `MARBOU-NNNNN` | `MB-2401-001` | B-19 |
| LST-16 SDG and USD | SDG only | B-18 |
| SRCH-02 Arabic normalization | Absent | B-31 |
| SRCH-12 compare up to 4 | 3 | B-16 |
| SRCH-13 price insight | Fabricated | B-15 |
| SRCH-15 cursor + infinite scroll | Page numbers | B-30 |
| DET-03 wa.me template | Toast | B-14 |
| DET-13 contact reveal policy | Fixed fake number | B-14 |
| MSG-04 offers | Not created | B-11 |
| TRS-08 verified reviews | Anyone can review | B-41 |
| ADM-17/18 four roles + 2FA | 9 roles, no login | B-22 |
| CAT-06…09 schema-driven forms | Hard-coded | FE-EAV |
| MED-01…08 media pipeline | Fake samples, limit 8 | FE-SELL-04 |
| MED-12 Data Saver | Image still loads | B-26 |
| GEO-01 OSM/Leaflet | Gradient placeholders | B-27 |
| CMS-03 SSR/SEO | Hash routing SPA | B-25 |
| CMS-09 deletion info page | Missing | FE-HELP-04 |
| DASH-04/05 export & delete | "Prototype" modals | FE-PRF-10 |
| LOC-01 runtime RTL switch | Works on desktop; absent on phones | B-42 |

*End of document.*
