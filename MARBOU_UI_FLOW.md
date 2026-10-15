# MARBOU — Complete UI Flow Specification

**For:** coding agent (React Native mobile app, Next.js web portal, Next.js admin dashboard)
**Source of truth:** MARBOU-PRD-2026-V3 (requirement IDs such as `AUTH-05` refer to it). If this document and the PRD differ, the PRD prevails; report the difference instead of guessing.
**Scope of this document:** screens, navigation, per-role interaction flows, screen states, and rules that change what the user sees. It is **not** a visual design: colours, typography and spacing come from the Milestone 2 design system.

---

## 0. How to read and use this document

### 0.1 Notation

- **Screen ID** `PREFIX-NN` is stable. Use it as the route/screen name key in code (for example `ADD-03` → `AddListing.Details`).
- **Platform tags:** `[M]` mobile app, `[W]` web portal, `[A]` admin dashboard. No tag = mobile and web share the same logic; web may render the same screen as a page rather than a sheet.
- **Flow arrows:** `→` navigates forward, `↩` returns to the previous screen, `⤴` resumes an interrupted action after sign-in.
- **API:** endpoint groups from PRD §10.2. Names here are hints; the Swagger spec is authoritative.
- **Req:** PRD requirement IDs the screen satisfies.
- **Flag:** screen or element only visible when the named feature flag is ON.

### 0.2 Global rules every screen must follow

| # | Rule |
|---|---|
| G1 | **Arabic-first, RTL.** Layout direction follows the selected language (AR = RTL, EN = LTR). All icons that imply direction (back arrows, chevrons, progress) mirror in RTL. Switching language reloads the UI layer once automatically (LOC-01). All strings come from translation keys, never literals (LOC-02). |
| G2 | **Every screen has four states:** loading (skeleton, not spinner, for lists), empty (illustration + message + a next action), error (message + Retry), and populated. Messages are localized (NFR-UX-04). |
| G3 | **Guests can browse.** Sign-in is required only to post, chat, favorite, save search, apply, request, review, report (AUTH-18). Tapping a gated action opens the **Auth Gate sheet** (AUTH-00); after successful sign-in the user returns to the same screen and the action resumes (⤴). |
| G4 | **Verified-email gate.** An account with unverified email can browse only. Post, chat, apply, request and review route to the OTP screen (AUTH-04) first (AUTH-01, AUTH-22). |
| G5 | **Feature flags decide visibility.** Fetch `GET /flags` and `GET /config` on launch and every 60 seconds while foregrounded (SYS-01). A flag OFF removes the entry points from navigation entirely; it never shows a disabled or "coming soon" state. Monetization UI (prices, paywalls, promotion badges, boost buttons) must not render anywhere when `ENABLE_MONETIZATION` is false (MON-01). |
| G6 | **Schema-driven forms.** Any form for a category (add listing, edit listing, filters, compare table) is rendered from the category schema JSON (`GET /categories/{id}/schema`, ETag cached), not hard-coded (CAT-07, CAT-08). See §2.1. |
| G7 | **Weak-network behaviour.** Compress photos and videos on device before upload; show per-file progress with retry; Data Saver Mode (Settings) loads small thumbnails only and shows heavy media on tap (MED-01, MED-05, MED-12). Never block navigation on image loading. |
| G8 | **Idempotent actions.** Send message, upload chunk, submit payment, submit application, create listing: attach a client-generated `Idempotency-Key`; retries must not create duplicates (MSG-14, NFR-REL-03). Disable the submit button while in flight. |
| G9 | **Suspended / banned account.** Any API response with account status SUSPENDED shows a full-screen blocking notice with the reason and a Contact Support link; the session is cleared (AUTH-19). |
| G10 | **Maintenance and force-update.** Remote config may return `maintenance` or `minVersion` > installed; show the blocking screens SYS-02 / SYS-03 on any screen (ADM-15, ADM-16). |
| G11 | **Accessibility.** Screen-reader labels on all controls, minimum 44×44 pt touch targets, dynamic type support (NFR-UX-03). |
| G12 | **Form data preservation.** Never lose input on validation errors; the add-listing form also autosaves locally on every step (LST-19, NFR-UX-05). |
| G13 | **Private data.** Phone/WhatsApp numbers are never in list payloads; they are fetched via the contact-reveal call when the user taps (DET-13). Private documents (CVs, certificates, receipts, verification files) open only through short-lived signed URLs (MED-10). |
| G14 | **Reviews and report sheets are reusable.** Report sheet REP-01 and Review composer REV-02 are shared components, opened from many screens. |

### 0.3 User types in this document

| Code | Who | How they get the capability |
|---|---|---|
| GST | Guest (no account) | Default |
| USR | Registered user (Buyer / Individual Seller) | Register and verify email |
| BUS | Dealer / Business owner (and staff: Manager, Editor, Support) | Upgrade flow PRF-12 |
| EMP | Employer | Upgrade flow PRF-13 |
| SVC | Service Provider (workshop, towing, diagnostics) | Upgrade flow PRF-14 |
| CAN | Candidate (job seeker) | Any user; becomes "Candidate" when they apply or build a profile |
| HOST | Property / hotel host | Any user posting accommodation listings |
| ADM roles | Super Admin (SA), Content Moderator (MOD), Support Agent (SUP), Financial Auditor (FIN) | Created by Super Admin; separate admin login |

A single account can hold several of USR/BUS/EMP/SVC/CAN at once. The profile menu (PRF-01) shows the sections for all capabilities held, never a role switcher that logs the user out (PROF-01).

---

## 1. App shell and navigation

### 1.1 Mobile app structure `[M]`

Bottom tab bar, always visible on top-level screens, hidden on full-screen flows (add listing, chat thread, gallery, camera):

```
[ Home ]  [ Search ]  [ ＋ Add Listing ]  [ Messages ]  [ Profile ]
   HOME-01   SRCH-01      ADD-01             CHAT-01        PRF-01
```

- Tab order mirrors in RTL.
- Add Listing is the centre tab with a distinct button style. For a guest it opens the Auth Gate; for a verified user it opens ADD-01 as a full-screen modal stack.
- Messages tab shows an unread badge (MSG-05). Profile tab shows a dot if there are unread notifications or pending actions (CV delivered, application update).
- Each tab keeps its own navigation stack; tapping an already-active tab pops to its root.
- Header (all tabs): notification bell → NTF-01 (with unread count), and on Home a location chip → GEO-01.

### 1.2 Web portal structure `[W]`

| Area | Content |
|---|---|
| Header (sticky) | Logo, search bar with autocomplete, category menu, Add Listing button, Messages icon, Notifications icon, language toggle (AR/EN), Sign in / avatar menu |
| Footer | Help Center, Trust & Safety, Terms, Privacy, Trading Rules, Contact, app-store badges, Delete-account info page (CMS-09) |
| Pages | Same screens as mobile, rendered as server-side pages with canonical URLs and Open Graph tags (CMS-03). Sheets become modals; bottom tabs become header items. |
| Responsive | Fully responsive from 320 px; below 768 px the header collapses to a hamburger and a bottom action bar mirrors the mobile tabs (NFR-CMP-03). |

### 1.3 Route map and deep links

All listing, business, job and category links open in the installed app via Universal Links / App Links and fall back to the web (DET-09, CMS-05).

| Web route | Mobile screen | Screen ID |
|---|---|---|
| `/` | Home | HOME-01 |
| `/c/{slug}` | Category landing | CAT-01 |
| `/search?q=&filters=` | Search results | SRCH-02 |
| `/l/{publicId}` (e.g. `/l/MARBOU-00123`) | Listing details | DET-01 |
| `/u/{id}` | Public seller profile | PRF-20 |
| `/b/{slug}` | Business storefront | BIZ-01 |
| `/jobs`, `/jobs/{id}` | Job list, job details | JOB-01, JOB-02 |
| `/compare?ids=` | Compare | CMP-01 |
| `/help`, `/help/{slug}` | Help Center, article | HELP-01, HELP-02 |
| `/legal/{terms\|privacy\|trading-rules}` | Legal page | HELP-05 |
| `/account-deletion` | Public deletion info and request page | HELP-07 |
| `/messages`, `/messages/{threadId}` | Inbox, thread | CHAT-01, CHAT-02 |
| `/notifications` | Notification feed | NTF-01 |
| `/me/...` | Dashboard sections | PRF-* |
| `/admin/...` | Admin dashboard (separate app and login) | AD-* |

Unknown or removed listing deep link → show DET-01 in the **removed state** (banner, similar listings), never a blank error.

### 1.4 Guest gating table

| Action | Guest | Registered, email unverified | Verified |
|---|---|---|---|
| Browse, search, view details, view seller profile, compare | Yes | Yes | Yes |
| WhatsApp / Call buttons | Per contact-reveal policy: default allowed with daily cap, optional sign-in-only (DET-13) | Same | Same |
| Favorite, save search, report | Auth Gate | Yes (report requires verified in production policy; default Yes) | Yes |
| Post listing, chat, offer, rental request, appointment, apply, review | Auth Gate | OTP screen first | Yes |

---

## 2. Shared components (build once, reuse everywhere)

### 2.1 Schema-driven form renderer (`DynamicForm`)

Input: category schema JSON `{ version, attributes[] }` plus mode (`create`, `edit`, `filter`, `compare`). Output: values object and Zod validator compiled from `validationRules` (same rules as the server).

| `dataType` | Create / edit control | Filter control | Compare table cell |
|---|---|---|---|
| TEXT | Text field (multiline if `maxLength` > 120) | Keyword field (only if `isSearchable`) | Text |
| NUMBER | Numeric field with unit label, min/max inline validation | Min–Max inputs + slider | Number with unit |
| BOOLEAN | Switch | Tri-state chip (Any / Yes / No) | Check / dash |
| SINGLE_SELECT | Dropdown (bottom sheet with search) | Single-select chips or sheet | Label |
| MULTI_SELECT | Multi-select chips sheet | Multi-select checklist | Comma list |
| DATE | Date picker (localized calendar) | Date range | Formatted date |
| RANGE | Two linked numeric fields or range slider | Range slider | "min – max" |
| FILE_URL | File picker (image/PDF) via MED upload | Not filterable | Link/icon |

Rules:
- Fields appear in `displayOrder`. Required fields carry a required marker; validate inline on blur and on submit (NFR-UX-05).
- **Dependent options** (Make → Model, Region → City): the child dropdown is disabled until the parent is chosen, then shows only matching options (CAT-12).
- **Other option** is appended to every category/subcategory picker and every select with `allowOther`. Choosing it reveals a text input "Type the item / vehicle / service name" (`customOtherText`); required once Other is chosen (CAT-02, CAT-03, LST-18).
- **Archived attributes** are not shown in create/filter, but remain visible in the specs table of existing listings (CAT-10).
- If the schema contains an unknown `dataType`, hide that field and show a one-time "Update the app for all options" notice (Section 4.1 of PRD).
- Schema fetch: send `If-None-Match`; on 304 use cache; cache in MMKV/IndexedDB (CAT-07, NFR-NET-04).

### 2.2 Other shared components

| ID | Component | Behaviour |
|---|---|---|
| CMP-A | **Auth Gate sheet** (AUTH-00) | Bottom sheet: "Sign in to continue". Buttons: Continue with Google, Facebook, Apple (iOS only for Apple), Email. On success, close and resume the interrupted action. |
| CMP-B | **Media picker / uploader** | Camera or gallery, multi-select up to photo limit from config (default 10). Compress to max 1920×1080. Thumbnail grid with drag-to-reorder, tap-star to set cover, ✕ to remove. Per-file progress ring, failed files show Retry. Video: duration and size limits from config, on-device compression, chunked upload with resume within session, shows resulting size. |
| CMP-C | **Location picker** (GEO-02) | Tabs: Use my location / Search address / Choose city. Map with draggable pin (OpenStreetMap tiles). Address autocomplete uses the Google-backed proxy; if the daily cap is hit, the search tab is replaced by city + pin only with a short notice. If GPS permission is denied, Choose city works fully (GEO-07). Toggle "Show approximate area only" with radius choice for privacy (GEO-09, RE-07). |
| CMP-D | **Price field** | Amount + currency toggle SDG / USD; shows converted indicator beneath when a fresh rate exists; "Negotiable" switch; for Wanted listings shows Budget min / max instead (LST-02, LST-16). |
| CMP-E | **Report sheet** (REP-01) | Reason radio list: Fraud, Incorrect Price, Sold, Duplicate, Inappropriate Content, Other (+ free text). Submit → toast "Thanks, we'll review" → sheet closes (TRS-02). |
| CMP-F | **Review composer** (REV-02) | 1–5 stars, optional text, submit. Only opened when eligible (TRS-08). |
| CMP-G | **Listing card** | Cover photo (thumbnail per Data Saver), price + currency, title, location, posted time, badges (Verified, Negotiable), favorite heart, status ribbon (Sold/Expired only visible to owner lists). Promotion badge only if monetization ON. |
| CMP-H | **Offer card** (in chat) | Shows amount, currency, status; buttons depend on role and status (see CHAT-02). |
| CMP-I | **Empty-state** | Illustration, one-line explanation, primary action (e.g., "Clear filters", "Post your first listing"). |
| CMP-J | **Confirm dialog** | Destructive actions (delete listing, withdraw application, revoke session, delete account) always confirm. |
| CMP-K | **Toast / snackbar** | Non-blocking success and error messages, localized. |
| CMP-L | **Signed-URL document viewer** | Opens private PDFs/images in an in-app viewer with zoom/pan; fetches a fresh signed URL on each open; on expiry (≤5 min) transparently refetches. |
| CMP-M | **Language switcher** | AR / EN; persists server-side so it follows the user across devices (PROF-09). |

---

## 3. Launch, onboarding and authentication

### 3.1 Launch sequence `[M]`

```
App start
 → SYS-01 Splash (logo; fetch /config, /flags, schema cache check)
     ├─ maintenance ON            → SYS-02 Maintenance (localized banner, retry)
     ├─ installed < minVersion    → SYS-03 Force update (store link, no skip)
     └─ OK
         ├─ first launch          → ONB-01 Language → ONB-02 Country/City → HOME-01 (as guest)
         └─ returning             → HOME-01 (session restored silently via refresh token)
```

| Screen | Content and actions | States / rules | Req |
|---|---|---|---|
| SYS-01 Splash | Logo only. Runs config/flag fetch, session restore, schema ETag revalidation in parallel. Max wait 2 s before moving on with cached values. | Offline: continue with cached config. | SYS-02 |
| SYS-02 Maintenance | Localized message, scheduled end time if provided, Retry button. | Blocks all screens until config says maintenance OFF. | ADM-16 |
| SYS-03 Force update | "Update required" + Update button (store URL). | No back navigation. | ADM-15 |
| ONB-01 Language | Two large buttons: العربية (default highlighted) / English. Selecting applies direction and reloads UI layer once. | Stored locally; synced to account after sign-in. | LOC-01 |
| ONB-02 Country & city | Country (Sudan preselected), then State → City list with search; "Use my location" optional. Skip allowed. | If location denied, manual selection only. Selected city sets Nearby default. | GEO-07 |
| ONB-03 Permissions (just-in-time, not on launch) | Location, notifications and photos permissions are requested **at the moment of first need** with a one-line rationale sheet first. | Denied → feature degrades, never blocks. | — |

### 3.2 Registration, sign-in and recovery

```
AUTH-00 Auth Gate / AUTH-01 Sign-in hub
   ├─ Continue with Google / Facebook / Apple → provider → (email present?) 
   │      ├─ yes, email matches existing verified account → account linked (AUTH-08) → ⤴
   │      ├─ yes, new → account created, email considered verified by provider → ⤴
   │      └─ no email / Apple relay → AUTH-07 Add email → AUTH-04 OTP → ⤴
   └─ Email
        ├─ New user → AUTH-02 Register → AUTH-04 OTP verify → ⤴ (or HOME-01)
        └─ Existing → AUTH-03 Login → ⤴
AUTH-03 → "Forgot password" → AUTH-05 Reset request → AUTH-04 OTP (purpose=reset) → AUTH-06 New password → sessions revoked → AUTH-03
```

| Screen | Elements | Actions → next | States / rules | Req |
|---|---|---|---|---|
| AUTH-01 Sign-in hub | Social buttons (Apple only on iOS), "Continue with email", Terms/Privacy links, language toggle, "Browse as guest". | Each button as above. | Provider cancel → stay on screen with no error. Provider failure → toast. | AUTH-02/03/04 |
| AUTH-02 Register | Full name, email, password (show/hide, strength hint), accept Terms & Privacy checkbox (links open legal pages; records accepted version). Optional phone with +249 prefix default (stored as contact field, shown "unverified"). | Submit → AUTH-04. | Inline validation. Email already exists → inline message "Sign in instead" linking AUTH-03. | AUTH-01, AUTH-12 |
| AUTH-03 Login | Email, password, Forgot password link, social buttons. | Success → resume action or HOME-01. | Wrong credentials: generic message. Locked (progressive delay): show remaining wait time, disable submit (AUTH-16). Suspended: G9 notice with reason (AUTH-19). | AUTH-16/17/19 |
| AUTH-04 OTP verify | 6 single-digit boxes (auto-advance, paste support, autofill), countdown for resend (60 s), "Change email". Purpose label (register / reset / change email). | Correct code → success tick → continue. | Max 5 attempts → "Too many attempts, request a new code". Expired (10 min) → prompt resend. Channel selector shown **only** if SMS/WhatsApp OTP flags are ON (Flag: `OTP_SMS`, `OTP_WHATSAPP`). | AUTH-05, AUTH-15 |
| AUTH-05 Reset request | Email field. | Submit → AUTH-04 (purpose=reset). | Always shows "If the email exists, a code was sent" (no account enumeration). | AUTH-07 |
| AUTH-06 New password | New password + confirm. | Submit → toast "Password changed, other devices signed out" → AUTH-03. | Strength validation. | AUTH-07 |
| AUTH-07 Add email (social, no email) | Explanation, email field. | Submit → AUTH-04. | Until verified, account is browse-only (G4). | AUTH-22 |
| AUTH-08 Verify phone (Flag `OTP_SMS` or `OTP_WHATSAPP`) | Phone field, send code, 6-digit entry. | Success → "Verified Phone" badge on profile. | Hidden entirely when flags OFF. | AUTH-21 |

After first successful registration show **ONB-04 Welcome** (optional one-screen, skippable): three tiles — "Find something", "Post a listing", "Find a job" — which route to Search, ADD-01, JOB-01.

---
## 4. Discovery: Home, Categories, Search, Details (Guest, Buyer — everyone)

### 4.1 Home `[M][W]`

**HOME-01 Home** — Req SRCH-10, SRCH-14, CMS-06
Layout top to bottom (each block independently loading, independently hidden if empty):
1. Header: location chip (tap → CMP-C city chooser), search bar (tap → SRCH-01), bell.
2. Banner carousel (admin-managed, scheduled, targeted by language and country; tap → internal link or external URL).
3. Announcement banner (static, dismissible) if configured.
4. Category grid (admin-ordered featured categories, icon + AR/EN name; "All categories" tile → CAT-00).
5. "Nearby" horizontal grid (needs location or chosen city; otherwise a prompt card "Choose your city").
6. "Recommended for you" (based on recent searches and favorites; hidden for new users).
7. "Recently added" and "Popular" lists using CMP-G cards, infinite scroll via cursor pagination.
8. Sponsored slots: **not rendered** unless `ENABLE_MONETIZATION` ON.
Pull-to-refresh refreshes all blocks. Offline: show cached last feed with a "You're offline" bar.

**CAT-00 All categories** — full tree browser: main categories list; tapping expands/open subcategories (unlimited depth, each level has an **Other** row). Leaf selection → CAT-01.

**CAT-01 Category landing** — Req CAT-14
Breadcrumbs, subcategory shortcut chips (incl. Other), top filters generated from filterable attributes (3–5 shown), listings grid/list toggle, "Filters" button → SRCH-03, "Post in this category" floating button (hidden and replaced by notice if posting is restricted for the category, CAT-11).

### 4.2 Search and results

```
HOME-01 / CAT-01 / header search
 → SRCH-01 Search entry (recent searches, suggestions, category shortcuts)
 → SRCH-02 Results (list/grid/map toggle)
     ├─ SRCH-03 Filters sheet → apply → results update in place (no full reload)
     ├─ Sort sheet (Relevance, Newest, Price ↑, Price ↓, Distance*)  *only with location
     ├─ "Save search" → SRCH-05 (gated)
     ├─ Map toggle → SRCH-04 Map results
     └─ tap card → DET-01
```

| Screen | Elements | Rules | Req |
|---|---|---|---|
| SRCH-01 Search entry | Autofocused field; recent searches (clearable); live autocomplete suggestions (listings, categories); category shortcuts; entering a listing ID like `MARBOU-00123` jumps straight to DET-01. | Debounce 250 ms; Arabic input normalized server-side. | SRCH-07, SRCH-08 |
| SRCH-02 Results | Query chip row (active filters as removable chips), result count where cheap, results list, infinite scroll (cursor), sort button, filter button, map toggle, "Save search" bar. | Empty state: "No results" + suggestions (remove a filter, broaden radius, popular categories) + Save search offer. Hidden/suspended/sold/expired listings never appear. Zero-result and query events are logged. | SRCH-05, SRCH-15, SRCH-17, SRCH-18 |
| SRCH-03 Filters | Header "Filters / Reset / Apply (N results)". Section 1: category (change), Section 2: price range + currency, Section 3: location (city + radius slider if location available), Section 4: **dynamic filters** from `DynamicForm` mode `filter`, Section 5: seller type (Individual / Dealer / Verified only), posted within. Apply button live-updates count. | Dependent filters (Make→Model). Filters persist when navigating back. | SRCH-03, AUTO-06, RE-08, HOT-07, EQP-07 |
| SRCH-04 Map results | Map (OpenStreetMap) with clustered pins; tapping a pin shows a mini card; list/map toggle. Approximate-location listings show a circle, not a pin. | Moving the map re-queries within bounds, throttled. | GEO-01, GEO-09 |
| SRCH-05 Save search sheet | Search name (prefilled), alert frequency (Instant / Daily / Off), notify on price drops toggle. Save → toast, appears in PRF-04. | Gated (Auth Gate). | SRCH-09, DASH-03 |

### 4.3 Listing details

**DET-01 Listing details** `[M][W]` — Req DET-01 … DET-13, SRCH-12, SRCH-13

Top to bottom:
1. Gallery with pinch-zoom, swipe, counter; video first-frame with play (poster); tap → full-screen viewer (DET-02).
2. Title, price + currency (converted indicator if rate fresh), Negotiable tag, listing ID `MARBOU-NNNNN` (tap to copy), posted date, view count, location name, breadcrumbs.
3. Status banner: **Sold**, **Expired**, **Suspended/Hidden** (only owner sees Hidden/Suspended with reason). When the listing is not Active, contact buttons are disabled and Similar Listings are emphasized.
4. Specs table generated from dynamic attributes (labels in current language, archived attributes still shown). "Other" custom text is displayed as the item name.
5. Description (expandable).
6. Map (approximate circle if seller chose privacy) with "Open in maps".
7. **Market Price indicator**: range bar, historical average, label Below / Fair / Above market; shown only when the minimum comparable count exists (SRCH-13).
8. Seller card: avatar, name, badges, rating, response indicators, member since, "View profile" → PRF-20, "More from this seller".
9. Similar listings carousel.
10. Safety tips strip with link to Trust & Safety Center (HELP-06).
11. **Sticky bottom action bar:**
    - **Chat on WhatsApp** (prominent) → reveal call, then open `wa.me` with prefilled localized template (title, ID, price). 
    - **Call** (respects seller contact options; hidden if seller chose chat-only).
    - **Chat** → in-app thread anchored to this listing (gated).
    - Owner viewing their own listing sees instead: Edit, Share, Mark sold, Renew (if expiring), Stats; no contact buttons.
12. Top-bar actions: Favorite ♥ (gated), Share (system share sheet with the web link), Compare (+) (only for categories supporting compare: Automotive, Real Estate, Electronics), ⋯ menu → Report (CMP-E).

Behaviours:
- Tapping WhatsApp/Call/Chat first calls the **contact-reveal** endpoint, which logs a lead event (DET-11) and enforces guest caps; if capped, show "Sign in to contact the seller" Auth Gate. Never embed numbers in the page.
- Entering the page increments the unique-viewer counter (owner excluded).
- Vertical-specific blocks appear below the specs (see §7): **Rental** pricing + "Request rental" (AUTO-11/12), **Service provider** services + "Book appointment" (AUTO-15), **Hotel** amenities + availability + "Send inquiry" (HOT-04), **Job** → separate JOB-02 screen, **Project** brochure download (RE-06), **Towing** emergency number + area (AUTO-19).
- Removed/expired deep link shows "This listing is no longer available" plus Similar Listings.

**DET-02 Fullscreen gallery** — swipe, pinch zoom, video player controls, close.

### 4.4 Compare

**CMP-01 Compare** — Req SRCH-12, AUTO-07, RE-11
- Entry: "Compare" on cards/details adds to a tray (max 4, categories must match among Automotive, Real Estate, Electronics). A floating tray at the bottom shows thumbnails with ✕ and a **Compare (N)** button once N ≥ 2.
- Screen: horizontally scrollable table; first column fixed with attribute labels; columns are listings with photo, price, seller verification badge; rows are generated from the schema (specs, mileage, transmission, features…). "Highlight differences" toggle. Each column header has Remove and "Open".
- Mixed categories → toast "Choose listings from the same category". RTL: first column on the right.

### 4.5 Favorites and saved searches (gated)

| Screen | Content | Req |
|---|---|---|
| PRF-03 Favorites | Grid/list of favorited listings with price-at-save vs current (price drop badge), status ribbons for Sold/Expired/Removed; swipe to remove; sort. | DASH-02 |
| PRF-04 Saved searches | List with filters summary, alert frequency, toggle on/off, tap → results, swipe to delete. | DASH-03 |

---

## 5. Seller flows (USR, BUS, HOST, SVC)

### 5.1 Post a listing (full-screen modal stack)

```
Tap ＋ → [guest: Auth Gate] → [unverified: OTP] → [posting restricted category: notice]
ADD-01 Choose category (tree, Other at each level, search box)
 → ADD-02 Listing type (only when category supports: For Sale / For Rent / Wanted)
 → ADD-03 Details (DynamicForm: common + category fields)
 → ADD-04 Media (photos, optional video)
 → ADD-05 Price & location & contact options
 → ADD-06 Review & publish (quality score, preview)
 → ADD-07 Published confirmation (share link)
Progress bar on top (6 steps). Back keeps data. Close ✕ → "Save draft?" dialog.
```

| Screen | Elements | Rules | Req |
|---|---|---|---|
| ADD-01 Category | Search box, tree list, breadcrumb. Every level includes **Other**. Restricted categories show a lock with the admin message and cannot proceed. | Choosing Other → reveals text input "Type the name" before continuing. Recently used categories on top. | CAT-02, CAT-03, CAT-11 |
| ADD-02 Type | Radio cards: For Sale / For Rent / Wanted (Real Estate adds Wanted to Buy / Wanted to Rent). Skipped when the category has a single type. | Wanted switches ADD-05 price into Budget range and removes the price requirement. | LST-12, RE-02 |
| ADD-03 Details | Title, description, condition (where relevant), then `DynamicForm` fields, "Negotiable" is on price step. Live **Quality Score** ring in the header with a tap-to-expand checklist ("Add 2 more photos: +10%"). | Required fields enforced client + server. Dependent selects. Every field change autosaves locally (MMKV) and server draft saves when online. | LST-01, LST-06, LST-19 |
| ADD-04 Media | CMP-B uploader. Cover selection, reorder, delete. Video section visible only if video is enabled for this category (remote config). Shows limits ("max 30 s, 15 MB"). | Photo count limit from config. Perceptual hash is computed server-side; no user-visible effect. Cannot proceed while uploads are in progress; failed uploads offer Retry or Remove. | MED-01…MED-08 |
| ADD-05 Price, location, contact | CMP-D price, CMP-C location, **Contact options**: checkboxes Phone call, WhatsApp number, In-app chat (at least one; defaults from profile PROF-06), phone/WhatsApp numbers editable. Rent listings: period (daily/monthly/annual) per vertical. | Numeric range validated per category. Selecting "chat only" hides numbers entirely. | LST-02, LST-16, PROF-06 |
| ADD-06 Review | Read-only preview exactly as DET-01 will look, quality score, "Edit" links per section, Terms reminder, **Publish** button. | On Publish: disabled + progress; success → ADD-07. Server error keeps all data. Rate limit hit ("You've reached the hourly limit") shows time to retry. Active-listing cap hit shows "Renew or remove a listing" with link to MY-01. | LST-03, LST-13 |
| ADD-07 Published | Success animation, listing ID, **Share** (system sheet with link), "View listing" → DET-01, "Post another", "Copy link". | Listing is already live. If delayed-visibility mode is enabled for the category, show "Your listing will appear after a quick safety check" instead (TRS-15). | LST-03, TRS-15 |

Draft behaviours: closing mid-flow prompts **Save draft / Discard**. Drafts appear in MY-02 and sync across devices when online (LST-05). After an app kill the flow reopens at the last step with data restored (LST-19).

### 5.2 Manage my listings `[M][W]` (Profile → My listings)

**MY-01 My listings** — tabs: **Active · Drafts · Expired · Sold · Hidden/Suspended** (counts on tabs). Each row: CMP-G card plus status chip, views/favorites/chats/WhatsApp-tap mini stats, expiry countdown, overflow menu.
Overflow / swipe actions by status:

| Status | Actions |
|---|---|
| Active | Edit, Share, Mark sold, Duplicate as template, Renew (shown within 7 days of expiry), Delete (confirm; soft delete) |
| Draft | Continue, Delete |
| Expired | Renew / Repost (one tap, keeps content and media), Delete |
| Sold | Reactivate? (not offered), Duplicate, Delete |
| Hidden / Auto-hidden / Suspended | View reason, **Appeal** → MY-04, Edit (to fix), Delete |

Business accounts get multi-select mode with bulk **Renew, Hide, Mark sold, Delete** (BIZ-07, LST-15).

**MY-02 Edit listing** — reuses ADD-03…ADD-05 as a single scrolling form pre-filled; Save → re-scan notice "Changes saved"; edit recorded in history. Required-attribute prompts for newly required fields only on edit (CAT-16).

**MY-03 Listing stats** — views, unique viewers, favorites, chats started, WhatsApp/call taps over 7/30 days (DASH-08).

**MY-04 Appeal** — shows moderation reason, text box "Why should this be restored?", submit → "Appeal sent"; status shown on the listing; outcome pushed (TRS-07).

**Expiry reminder flow:** push at 7 days and 1 day → deep link to MY-01 with Renew highlighted (LST-10, LST-11).

### 5.3 Wanted listings

Posted through ADD-01…ADD-06 with type Wanted. Displayed in search with a "Wanted" ribbon; DET-01 shows the budget range instead of a price and the primary action is Chat / WhatsApp to the poster.

---

## 6. Messaging and negotiation (USR, BUS staff)

### 6.1 Inbox and thread

```
Messages tab → CHAT-01 Inbox ──tap──→ CHAT-02 Thread
DET-01 [Chat] → (find or create thread for listing+buyer+seller) → CHAT-02
```

| Screen | Elements | Rules | Req |
|---|---|---|---|
| CHAT-01 Inbox | Segmented control **All · Buying · Selling** (+ **Business inbox** for BUS staff). Thread rows: listing thumbnail, other party name + badge, last message preview, time, unread count. Search by name/listing. Swipe: Mute, Archive. | Empty: "No conversations yet" + "Browse listings". Muted threads show an icon and no push. | MSG-05, MSG-08, MSG-11 |
| CHAT-02 Thread | Top bar: other party (tap → PRF-20), listing mini card (tap → DET-01), ⋯ menu: Open in WhatsApp, Mute, Block, Report conversation. Message list with date separators; status ticks: Sent ✓, Delivered ✓✓, Read ✓✓ (colour). Typing indicator. Composer: text field, image attach (size/type limits), **Make offer** button (buyer), quick replies button (sellers/business). | Reconnect indicator when socket drops; auto-fallback to polling. Failed sends show a retry icon (same idempotency key). System banner when listing is sold, expired or removed: input stays enabled for text but offers are disabled. Blocked: composer replaced by "You can't message this user". | MSG-01…MSG-14 |

### 6.2 Structured offers

```
Buyer: [Make offer] → amount + currency sheet → send → Offer card (Pending) in both feeds
Seller on the card:  [Accept] → card shows "Accepted: price" on both sides, listing optionally flagged "Offer accepted"
                     [Reject] → card "Rejected"
                     [Counter] → amount sheet → new Offer card (counter), roles swap
Buyer on a counter:   Accept / Reject / Counter again
```
- Each state change posts a system line in the thread and pushes to the other party.
- Offer card buttons exist only for the party who must act and only while status is Pending.
- Accepted price shown identically on both sides (MSG-04 acceptance).

### 6.3 Thread actions

| Action | Flow |
|---|---|
| Open in WhatsApp | Reveal → `wa.me` link with listing context (MSG-10) |
| Block user | Confirm dialog → thread locked; user appears in Settings → Blocked users (PRF-18); public listings stay visible to the blocked user but they cannot chat or offer (PROF-07) |
| Mute thread | Toggle; no push while muted |
| Report conversation | CMP-E with target = conversation; marks it visible to moderators only (MSG-08) |
| Quick replies (seller/business) | Manage templates in Settings → Quick replies (PRF-19); tapping one in the composer inserts text |

### 6.4 Push and deep links
New message push (when not in the thread) → opens CHAT-02. Offer push → opens CHAT-02 scrolled to the card.

---
## 7. Vertical-specific flows

Every vertical uses the same engine: ADD-* to post, SRCH-* to search, DET-01 to view. This section lists only what differs.

### 7.1 Automotive

**Cars, trucks, rickshaws, motorcycles, parts (AUTO-01…08)**
- ADD-03 fields come from the schema (make → model dependent, year, mileage, transmission, fuel, displacement, body, duty-paid, regional spec, condition; trucks: axles, payload, hours; rickshaws: cc, passengers, permit; parts: part number, OEM/aftermarket, compatibility make/model/year-range).
- Optional **Vehicle ID and ownership document** section in ADD-03: upload goes to the private bucket, labelled "Visible to MARBOU only, never public" (AUTO-21).
- SRCH-03 for vehicles shows the Multi-Attribute Filter Matrix; spare parts search includes a "Fits my vehicle" selector (make/model/year).
- DET-01 adds a **Compare** button and a dealer badge (AUTO-07, AUTO-08).
- **Dealer profile** is a business storefront (BIZ-01): inventory counter, showroom map, registration badge, contact channels.

**Vehicle rental**

```
Renter: SRCH (Vehicle Rentals filters: type, price/day-month, mileage cap, driver option, location)
 → DET-01 (Rental block: daily/weekly/monthly rates, deposit, mileage cap, conditions)
 → [Request rental] (gated + verified)
 → RENT-01 Request form → RENT-02 Review → submit → RENT-03 Request status
Owner:  push + email → RENT-10 Incoming requests → RENT-11 Request detail → Accept / Decline / Counter
Renter: sees status change → (Countered) accepts or cancels → Completed → Review prompt
```

| Screen | Content | Rules | Req |
|---|---|---|---|
| RENT-01 Request form | Start and end date pickers (blocked dates if owner set availability notes), driver option (with/without driver), pickup preference (owner location / delivery if offered), notes. Terms summary card (deposit, mileage cap, conditions) read-only. | Terms shown are those on the listing now and stored as a snapshot on submit. No payment step. | AUTO-09…12 |
| RENT-02 Confirm | Summary, price estimate by period, Submit. | Success → RENT-03 + toast; owner notified instantly. Target: under 2 minutes end to end. | AUTO-12 |
| RENT-03 Request status (renter: PRF-06) | Timeline: Requested → Accepted / Declined / Countered → Completed / Cancelled. Buttons depend on status: Cancel (Requested/Accepted), Accept counter / Decline counter, Chat with owner, Mark completed. | Status changes push to both parties. | AUTO-13 |
| RENT-10 Incoming requests (owner) | List filtered by status; badge count. | — | AUTO-13 |
| RENT-11 Request detail (owner) | Renter name/rating, dates, driver option, notes. Buttons: **Accept**, **Decline** (optional reason), **Counter** (edit dates/price/notes → sends counter), Chat. | — | AUTO-13 |

**Service appointment**

```
Customer: DET-01 of a service provider listing / provider profile
 → APPT-01 Choose service type → APPT-02 Vehicle & issue (make/model/year, description, diagnostic images)
 → APPT-03 Pick date & time slot → APPT-04 Confirm → APPT-05 Appointment status
Provider: push → APPT-10 Appointments list (Day/Week calendar + list) → APPT-11 Detail → Confirm / Decline / Propose new time / Complete / No-show
Reminders: 24 h and 2 h before (push; email fallback)
After completion: user confirms (or 72 h lapse) → REV-02 review prompt
```

| Screen | Content | Rules | Req |
|---|---|---|---|
| APPT-01 | Services offered by this provider with rates; pick one. | — | AUTO-14, AUTO-15 |
| APPT-02 | Vehicle details, issue description, up to N images via CMP-B. | — | AUTO-15 |
| APPT-03 | Calendar → available slots list per day. Full slots are not shown (capacity reached). | Past times and fully booked slots hidden. | AUTO-14 |
| APPT-04 | Summary and confirm. | Slot is re-checked server-side; if taken, return to APPT-03 with message. | AUTO-15 |
| APPT-05 (also PRF-07) | Status: Requested → Confirmed / Declined / Rescheduled → Completed / No-show / Cancelled. Actions: Cancel, Reschedule (within provider rules), Accept proposed time, Chat. | After Completed: banner "Confirm the service was completed" (Confirm / Dispute). | AUTO-16 |
| APPT-10/11 (provider) | Calendar and list; detail with customer, vehicle, issue, images; actions as above. | Mark Completed → customer asked to confirm. | AUTO-16 |
| SVC-01 Provider profile setup | See PRF-14: services, rates, working hours, slot duration, capacity per slot. | — | AUTO-14 |

**Towing & Recovery** — DET-01 shows truck type (flatbed/hook), emergency phone as a prominent **Call now** button, operating area/radius, and a "Live location" chip only when the provider has chosen to share (AUTO-19). **Computer Diagnostics** — shows inspection type, "Mobile diagnostics" chip, verified-certificate badge (AUTO-20).

### 7.2 Real estate

- ADD-01: Real Estate → property type (12 types incl. Other) → ADD-02 transaction type (For Sale, For Rent, Wanted to Buy, Wanted to Rent).
- ADD-03 extras: area with unit selector (sq ft / sq m / acres), bedrooms, bathrooms, floor, year built, furnishing, power backup, security, parking, payment terms. For Rent: rent period (daily / monthly / annual) with amount per period (RE-03).
- Projects & Investments: developer, stage, expected completion, unit types, starting price, **brochure PDF upload** (RE-06).
- ADD-04: photos, optional video, **floor plan images** as a separate upload group (RE-12).
- ADD-05: location pin with the privacy radius toggle on by default for residential types (RE-07).
- DET-01 shows area in the **viewer's preferred unit** with price per m², floor plans tab, map circle (RE-05). Projects show a "Download brochure" button.
- Wanted to Buy / Rent: budget range, desired area, preferred locations (multiple) (RE-09).
- Agents/agencies are business storefronts with Verified badge and active-listing counters (RE-10). Compare up to 4 properties (RE-11).

### 7.3 Hotels and furnished accommodation

```
Guest: DET-01 (nightly/monthly price, amenities icons, gallery, map, availability notes, ratings)
 → [Send inquiry] (gated) → HOT-01 Inquiry sheet (dates, number of guests, message) → sent → thread opens (CHAT-02) with an inquiry card
Host: push → HOT-10 Inquiries inbox → Reply in chat / WhatsApp → after stay: [Mark Confirmed Stay] → guest may review
Host: HOT-11 Availability calendar → mark date ranges unavailable
(Flag `HOTEL_RESERVATIONS` ON) → "Request to book" replaces inquiry; reservation states Requested/Confirmed/Cancelled/Completed with date-overlap prevention
```

| Screen | Content | Rules | Req |
|---|---|---|---|
| HOT-01 Inquiry sheet | Check-in/out, guests, message, Send. Two taps from DET-01 for a prefilled default. | Not a binding reservation; copy states it. | HOT-04 |
| HOT-10 Host inquiries | List with dates, guest, status (New, Replied, Confirmed Stay, Closed). Row actions: Reply, WhatsApp, Mark Confirmed Stay. | Guest can dispute Confirmed Stay within the window. | HOT-04, HOT-06 |
| HOT-11 Availability | Month calendar; select range → "Mark unavailable" / clear. Listing shows "Not available on…" notes. | — | HOT-05 |
| Review | Only guests whose inquiry has Confirmed Stay see "Write a review" on the listing. | — | HOT-06 |

### 7.4 Equipment, solar and power

Standard flow. ADD-03 shows category-specific fields (panels: wattage/cell type/warranty; inverters: KVA/pure sine/hybrid-off-grid; batteries: type/Ah/voltage/warranty; generators: KVA/fuel/soundproof/hours) plus **Installation included, Delivery option, Warranty available** switches (EQP-08). SRCH-03 shows promoted filters: inverter KVA, battery chemistry, panel wattage, Installation Included (EQP-07).

### 7.5 Livestock, agriculture, general goods

Standard flow. Livestock ADD-03: type, breed, age, weight, health/vaccination tags, head count, bulk quantity. Crops: quantity in tons, grade, harvest date, delivery options. DET-01 and cards show breed, weight and health tags as chips (GEN-01). Arabic names are primary with English equivalents (e.g., جلابية / Jellabiya). Wholesale pricing UI (MOQ, tiers) renders only if `WHOLESALE` flag is ON (GEN-11).

---

## 8. Jobs

### 8.1 Candidate flows (CAN — any registered user; Quick Apply also for new accounts)

```
Jobs entry points: Home banner/category "Jobs", Search with category Jobs, Profile → Jobs
JOB-01 Jobs list (filters: category, employment type, location, salary) → JOB-02 Job details
 → [Apply]
    ├─ Quick Apply  → JOB-03 → (OTP gate if email unverified) → submitted → JOB-06 Status
    └─ Full Profile → JOB-04 Candidate profile builder (steps) → JOB-05 CV choice → submit → JOB-06 Status
Anytime: PRF-05 My applications → JOB-06 detail
Alerts: JOB-07 Job alerts (category + location + keywords)
```

| Screen | Elements | Rules | Req |
|---|---|---|---|
| JOB-01 Jobs list | Search, filter chips, job cards (title, employer + Verified Employer badge, location, type, salary if given, deadline, "Applied" tag). "Create alert" bar. | Expired jobs not shown. | JOB-01, JOB-20 |
| JOB-02 Job details | Description, requirements, benefits, deadline, screening questions preview, employer card, **Apply** button, Share, Report, Save. | Applied → button becomes "View application". Expired → disabled with banner. Scam-pattern flagged jobs may be hidden by moderation. | JOB-01, JOB-21 |
| JOB-03 Quick Apply | Single scroll form: full name, phone (+249 default), email, city (prefilled from profile), optional photo, short summary, optional PDF CV upload, answers to employer's screening questions. **Submit**. | Completion target under 60 seconds. Daily application limit and duplicate-application check (message "You already applied" / "Daily limit reached"). | JOB-02, JOB-17 |
| JOB-04 Full profile builder | Stepper: 1 Personal (name, photo, DOB, nationality, city, phone, email, marital status) → 2 Driving & transport → 3 Education (add multiple) → 4 Work experience (add multiple, "current employer" switch) → 5 Skills (tags) & Languages (Native/Fluent/Intermediate/Basic) → 6 Certificates (PDF/JPG/PNG, multiple). Save and continue at any step; Save & exit. | Autosave per step. All documents private. | JOB-03…JOB-08, JOB-13 |
| JOB-05 CV choice | Two cards: **Upload my PDF CV** (file picker) or **"I don't have a CV – Create one for me for free"** → CV-01. If a CV exists, show it with Replace/Delete. | Candidates can delete uploaded documents at any time. | JOB-09 |
| JOB-06 Application status | Timeline: Submitted → Viewed → Shortlisted → Interview → Rejected / Hired; **Withdraw** (confirm). Shows exactly which documents the employer can see. | Push on every status change. | JOB-15, JOB-16 |
| JOB-07 Job alerts | List of alerts; create/edit with category, location, keywords; toggle. | Matching new jobs → push. | JOB-18 |

**Create-CV-for-me flow**

```
CV-01 Intro ("A professional CV prepared for you, free") → CV-02 Step form (same data as profile; prefilled) → CV-03 Submitted (status Pending)
Support prepares → push "Your CV is ready" → CV-04 CV review (PDF viewer, layout selector if in-app builder, Approve / Request revision with notes)
Statuses shown as a chip: Pending → In Progress → Delivered → (Revision Requested → In Progress → Delivered) → Approved
Approved CV is attached to future applications; candidate may still apply earlier with Quick Apply.
```
In-app CV builder variant: selectable layouts, in-app edit and **Export PDF** (JOB-12).

### 8.2 Employer flows (EMP)

```
PRF-13 Become an employer (company name, logo, description, optional verification docs) → Employer dashboard
EMP-01 Employer dashboard (tabs: Jobs · Applicants · Company)
 ├─ [＋ Post job] → EMP-02 Job form → EMP-03 Preview → Publish (live instantly)
 ├─ EMP-04 My jobs (Active/Expired/Closed; Renew, Edit, Close, Delete)
 └─ EMP-05 Applicants (per job or all) → EMP-06 Applicant detail
```

| Screen | Content | Rules | Req |
|---|---|---|---|
| EMP-02 Job form | Title, category, employment type, salary range (optional) + currency, location, requirements, benefits, deadline, **screening questions** builder (add/reorder text questions, required toggle). | Scam-pattern warning if text contains fee requests/off-platform payment words. | JOB-01, JOB-21 |
| EMP-04 My jobs | Cards with applicant counts, deadline, status; Renew extends the period. | Expired after deadline or configured period. | JOB-19 |
| EMP-05 Applicants | Kanban-like tabs or filter chips by status: Submitted, Viewed, Shortlisted, Interview, Rejected, Hired; search; notes column. | Only people who applied are visible; no candidate search anywhere. | JOB-15 |
| EMP-06 Applicant detail | Candidate summary, screening answers, **documents** (CV, certificates) opened via CMP-L (short-lived signed URL scoped to this application), notes field, status buttons, Chat? (not offered; contact via shared phone/email on the application). | Opening a document marks Viewed. | JOB-13, JOB-14 |
| Verified Employer | Request in PRF-10; badge shown on job cards and employer card. | — | JOB-20 |

### 8.3 Support Agent side (CV requests) — see admin AD-41.

---

## 9. Business / Dealer flows (BUS)

```
PRF-12 Become a business: business name, logo, cover, description, hours, location, contact channels, type (Dealer / Shop / Agency / Company)
 → BIZ-10 Business dashboard
     ├─ Overview (views, unique viewers, leads: chat/WhatsApp/calls, conversion; range selector 7/30/90 days; top listings; search impressions; audience location summary)
     ├─ Listings (catalog with bulk actions)
     ├─ Inbox (shared business inbox)
     ├─ Staff (invite, role Manager / Editor / Support, remove)
     ├─ Storefront settings (edit profile, preview, copy share link)
     └─ Export CSV
```

| Screen | Content | Rules | Req |
|---|---|---|---|
| BIZ-01 Public storefront | Cover, logo, name, verified badge, description, hours, map, contact buttons, catalog with filters and total count, share link. | SEO page on web. | BIZ-01, BIZ-02, BIZ-09 |
| BIZ-10 Dashboard | Charts and KPI tiles; aggregates only, no viewer personal data. | — | BIZ-04, BIZ-05 |
| BIZ-11 Listings (bulk) | Multi-select with Renew, Hide, Mark sold, Delete; filters by status/category. | Confirm dialog on destructive actions. | BIZ-07 |
| BIZ-12 Staff | Invite by email → pending invitation → accepted. Role picker. Permissions: Manager (everything within the business), Editor (create/edit listings), Support (inbox only). | Staff never see data of other businesses. | BIZ-03 |
| BIZ-13 Inbox | Same as CHAT-01 filtered to business threads; assign/reply as staff; quick replies. | — | MSG-11, MSG-13 |
| BIZ-14 Export | Choose date range → CSV download/share. | — | BIZ-06 |
| Verification | PRF-10 with business registration documents → badge "Verified Business/Dealer". | — | BIZ-08 |

---

## 10. Profile, account and settings (all signed-in users)

### 10.1 Profile hub

**PRF-01 Profile hub** — avatar/name/badges at top (tap → PRF-09), **Verification status card** (if not verified: "Get verified"), then sections that appear according to capabilities held:

| Section | Entries |
|---|---|
| My activity | My listings (MY-01) · Favorites (PRF-03) · Saved searches (PRF-04) · My applications (PRF-05) · My rental requests (PRF-06) · My appointments (PRF-07) · My reviews (PRF-08) · Notifications (NTF-01) |
| Grow | Become a Dealer / Business (PRF-12) · Become an Employer (PRF-13) · Become a Service Provider (PRF-14) — hidden once held |
| If BUS | Business dashboard (BIZ-10) |
| If EMP | Employer dashboard (EMP-01) |
| If SVC | Service dashboard (APPT-10, services, availability) |
| If CAN | My candidate profile (JOB-04) · My CV (CV-04) · Job alerts (JOB-07) |
| Account | Settings (PRF-11) · Help Center (HELP-01) · Trust & Safety (HELP-06) · Terms & Privacy (HELP-05) · Sign out |

### 10.2 Screens

| Screen | Content and actions | Req |
|---|---|---|
| PRF-09 Edit profile | Avatar and cover upload (media pipeline, safe-content checks), full name, city, short bio, languages, preferred contact methods. Phone shows "Unverified" chip (or Verified if OTP enabled). | PROF-02, PROF-12 |
| PRF-10 Verification request | Choose type (Verified Seller / Dealer / Business / Employer / Service Provider); upload ID or business registration docs (private); submit → status chip Pending → Approved / Rejected (reason shown) / More info requested (reply with extra docs). | PROF-04, PROF-05 |
| PRF-12 / 13 / 14 Upgrade flows | Short guided forms (see §8.2, §9, §10.3). On completion the new section appears in PRF-01 immediately. | PROF-10 |
| PRF-20 Public seller profile `[W][M]` | Avatar, name, badges, join date, rating summary + reviews list, response rate/time, total active listings, tabs: Listings · Reviews. Actions: Chat, Share, Report user, Block. Cover image and business info if BUS. | PROF-03, PROF-11 |
| PRF-05 My applications | List with status chips → JOB-06. | JOB-16 |
| PRF-06 My rental requests | List (as renter) and incoming (as owner) tabs → RENT-03 / RENT-11. | AUTO-13 |
| PRF-07 My appointments | Upcoming/Past tabs; as provider: calendar → APPT-10. | AUTO-16 |
| PRF-08 My reviews | Given and Received tabs; reply to received (sellers/businesses), report abusive reviews. | TRS-08, TRS-09 |

### 10.3 Service provider setup (PRF-14 → SVC-01)

Steps: business/workshop name and type (workshop, towing, diagnostics, freelancer), photos, location → services list (name, hourly or fixed rate) → working hours per day → slot duration and **capacity per slot** → publish service profile (also creates a listing in Automotive Services). Dashboard: APPT-10 calendar, services editor, availability, reviews.

### 10.4 Settings

**PRF-11 Settings** (list):

| Entry | Screen | Behaviour | Req |
|---|---|---|---|
| Language | CMP-M | AR/EN; reload once; saved to account | PROF-09 |
| Notifications | PRF-15 | Toggle matrix: categories (messages, offers, listing status, saved search & price drops, job status, rentals, appointments, verification, reports) × channels (push, email). Admin broadcasts can be muted per category only where allowed. | NTF-05 |
| Contact preferences | PRF-23 | Choose which contact options appear on new listings: Call, WhatsApp, Chat only; default numbers | PROF-06 |
| Data Saver Mode | PRF-22 | Switch; when ON: thumbnails only, no auto-play, no auto-load of heavy media | MED-12 |
| Security Center | PRF-16 | Active sessions list (device, OS, approximate location, last active) with Revoke / Revoke all others; last 20 login events (time, device, outcome); change password; change email (OTP re-verify); manage phone number | AUTH-09…AUTH-11, TRS-13 |
| Blocked users | PRF-18 | List with Unblock | PROF-07 |
| Quick replies | PRF-19 | CRUD templates | MSG-13 |
| Privacy & data | PRF-17 | **Export my data** (request → "We'll notify you when ready" → download JSON), **Pause account** (deactivate/reactivate), **Delete account** (re-authenticate → email confirmation → grace-period notice with Cancel option) | DASH-04…DASH-07 |
| About | — | Version, Terms, Privacy, Licenses | — |

Account deletion flow:
```
PRF-17 [Delete account] → explanation of what is erased/anonymized → CMP-J confirm → re-enter password (or provider re-auth) → email OTP → "Deletion scheduled in 30 days" screen (Cancel deletion button) → status Pending Deletion; any sign-in within the grace period shows the cancel prompt
```

### 10.5 Notifications

**NTF-01 Notification feed** — grouped by day, unread highlighted, tap marks read and deep-links (table in §14.2). "Mark all read". Empty state. Pull to refresh. Broadcasts from admin appear here too (NTF-02, NTF-06).

### 10.6 Help, legal, support

| Screen | Content | Req |
|---|---|---|
| HELP-01 Help Center | Search + topic cards (safe trading, payments, account, jobs, rentals, appointments, platform rules) | CMS-01 |
| HELP-02 Article | Content in current language; "Was this helpful?"; Contact support | CMS-01 |
| HELP-03 Contact support | Subject, message, attachments → creates ticket; confirmation with ticket number | CMS-08 |
| HELP-04 My tickets | List and thread view with agent replies | CMS-08 |
| HELP-05 Legal page | Terms / Privacy / Trading Rules with version and effective date; on new version requiring acceptance, a blocking **Accept updated terms** sheet appears at next launch | CMS-02 |
| HELP-06 Trust & Safety Center | Safe-trading tips, my reports with status, blocked users shortcut | TRS-10 |
| HELP-07 Account deletion info `[W]` | Public page describing deletion and how to request it; Sign in to request | CMS-09 |

### 10.7 Reviews and reports

- **REV-01 Reviews list** (on profile/storefront/provider): average, distribution, entries, seller reply, Report.
- **REV-02 Review composer** (CMP-F): appears as a prompt after a qualifying interaction — a two-way chat meeting the minimum, completed rental, completed and confirmed appointment, or Confirmed Stay. One review per interaction; shown as a card in the thread/status screen ("Rate your experience").
- Sellers reply once to a review; reviews are reportable via CMP-E.
- **REP-01 Report sheet** is available on listings, users, reviews and conversations (⋯ menu). After submit the report appears in Trust & Safety Center with status Received → Reviewed → Action taken / No action (push on outcome) (NTF-04).

### 10.8 Payments (hidden at launch) — Flag `BANKAK_PAYMENTS` and monetization flags

Visible only when the flag is ON (Staging for UAT):

```
Feature purchase screen (e.g., plan/boost; only with ENABLE_MONETIZATION) → PAYU-01 Payment instructions (Bankak account details, amount, currency, order summary)
 → PAYU-02 Submit receipt (transaction reference field, amount, receipt photo via CMP-B) → PAYU-03 Pending (status screen; appears in PRF-06 area "Payments")
 → push: Approved → service activated + invoice downloadable (PAYU-04) | Rejected → reason shown, "Submit again"
```
Monetization surfaces (Plans, Boost, Credits, Auction, Barter, Cart/Checkout, Delivery tracking, Ads) each live behind their own flag and must be entirely absent from navigation and screens when OFF (MON-01, MON-12).

---
## 11. Admin dashboard `[A]` (Next.js, separate app and login)

### 11.1 Admin shell and sign-in

```
AD-00 Admin login (email + password) 
 ├─ first login        → AD-01 2FA enrollment (QR code + backup codes) → AD-02
 └─ subsequent         → AD-02 2FA code (TOTP) → AD-10 Home
IP logged on every sign-in; optional IP allow-list for Super Admin (blocked IP → "Access not allowed from this network").
Session timeout 30 minutes idle (configurable); Super Admin can revoke any admin session (AD-91).
```
Every admin route is guarded by RBAC and a 2FA-verified session (ADM-17, ADM-18). A role without access sees no menu item and gets a 403 page if the URL is typed.

**Layout:** collapsible left sidebar (modules by role), top bar (global search by user email / listing ID / ticket, environment badge Staging/Production, language toggle AR/EN, profile menu → change password, sign out), content area with breadcrumbs. Tables share one pattern: filters row, saved views, server-side pagination, bulk actions, CSV export where noted.

**Mandatory admin behaviours**
- Every destructive or configuration action asks for a **reason code** (moderation) and a confirm dialog; before/after values are written to the audit log (TRS-12, ADM-19).
- Configuration screens show a **change history** drawer (who, when, before/after).
- Flag and config changes display "Takes effect within 60 seconds" after saving (SYS-01).

### 11.2 Screens

| ID | Screen | Who | Layout and actions | Req |
|---|---|---|---|---|
| AD-10 | **Home / KPIs** | All roles (tiles filtered by role) | Live tiles: new users, new listings, active chats, open reports, pending verifications, pending payments, pending CV requests. Charts last 24 h/7 d. Click a tile → its queue. | ADM-01 |
| AD-11 | **Users** | SA, MOD (suspend/ban), SUP (read-only context) | Search by name, email, phone, ID; filters by status, capability, badge, city. Row → AD-12. | ADM-02 |
| AD-12 | **User detail** | same | Tabs: Overview (profile, capabilities, status), Listings, Reports (made/received), Sessions (revoke one/all), Activity, Badges (grant/revoke with reason), Notes. Actions: Suspend (reason, duration), Ban, Restore, Edit profile fields, Revoke sessions. **No impersonation**; support sees a read-only "user context" view (ADM-21). | ADM-02, ADM-21 |
| AD-20 | **Listings** | SA, MOD | Search any listing by ID/title/owner/status/category/city. Bulk hide. | ADM-03 |
| AD-21 | **Listing detail** | SA, MOD | Full listing, media, attributes, edit history, scan results (keyword hits, duplicates, image classification, fraud score), reports. Actions: Edit, Hide, Suspend, Delete permanently, Restore; each requires reason code and notifies the owner with reason. | ADM-03, TRS-04 |
| AD-30 | **Post-Moderation Audit Center** | SA, MOD | Split view: live stream of new listings (auto-refresh via socket), flagged listings queue, content editing portal, account suspension tools. Keyboard shortcuts for next/approve/hide. | ADM-05 |
| AD-31 | **Reports queue** | SA, MOD | Priority-sorted (report count, reporter reliability, fraud score). Row opens evidence panel: reported item, reporter notes, history. Actions: Dismiss, Hide, Suspend, Delete, Warn user, Ban. Reported conversations open read-only for that thread only. | TRS-03, MSG-08 |
| AD-32 | **Appeals queue** | SA, MOD | Appeal text vs original action; Uphold / Reverse (restores listing); outcome notification sent. | TRS-07 |
| AD-33 | **Blacklists** | SA, MOD | Tabs: phone numbers, emails, devices, keywords, image hashes. Add (with reason), remove, import CSV. | TRS-11, TRS-17 |
| AD-34 | **Moderation settings** | SA | Auto-hide thresholds, fraud alert/rate-limit thresholds, delayed-visibility mode per category and trust tier (default OFF), banned phrases, throttling thresholds. | TRS-14, TRS-15 |
| AD-40 | **Verification queue** | SA, MOD | Requests by type with docs viewer (private, signed URLs, zoom/pan/rotate). Actions: Approve (grants badge), Reject (reason required), Request more info. | ADM-06 |
| AD-41 | **CV processing portal** | SA, SUP | Queue of Create-CV requests by status (Pending, In Progress, Delivered, Revision Requested, Approved). Detail: structured data view (JSON rendered as readable form), upload/generate the CV (document generator integration), preview, **Deliver in app** (sets Delivered, pushes to candidate), handle revision notes. Assign to self. | ADM-07, JOB-10, JOB-11 |
| AD-42 | **Support tickets** | SA, SUP | Inbox of tickets, status, assignment, internal notes, reply to user (delivered in-app and email). | CMS-08, ADM-21 |
| AD-43 | **Rental & appointment lookup** | SA, SUP | Search by listing ID/user; read-only records and timelines for disputes. | ADM-21 |
| AD-50 | **Payment verification console** | SA, FIN | Tabs Pending / Approved / Rejected with filters and CSV export. Detail: receipt image in a modal with **zoom, pan, rotate**, user profile data beside it, reference/amount/timestamp, duplicate-reference and reused-image warnings (receipt fraud flag). **Approve** (one click, activates service and issues invoice) or **Reject** (reason required: Illegible receipt, Incorrect amount, Duplicate reference, Other). Audit trail panel. | ADM-08, PAY-04…PAY-07 |
| AD-60 | **EAV Schema Builder** | SA only | Left: category tree (drag to reorder, add child, archive/restore, posting-restriction switch + message, expiry days). Right: attribute list for selected category (drag ordering) with editor: key (immutable after save), labels EN/AR, type, required, filterable, searchable, **promote to index**, validation rules (min, max, regex), options list editor (dependencies for Make→Model, Region→City), archive. **Preview** tab renders the generated listing form (`DynamicForm` create mode) and filter panel before **Publish schema change**. Publishing bumps schema version. | ADM-04, CAT-05…CAT-13 |
| AD-61 | **"Other" entries** | SA | Table of custom entries by category with counts; **Promote** (to subcategory or attribute value) with optional "migrate matching listings". | CAT-04, ANL-03 |
| AD-62 | **Option lists** | SA | Vehicle makes/models, body types, regional specs, property types, finishing levels, area units, amenity list. | AUTO-*, RE-* |
| AD-63 | **Geography** | SA | State → City → Neighborhood tree with AR/EN names; add/edit/archive. | GEO-06 |
| AD-70 | **Feature Flag Control Center** | SA only | List of flags with toggles and per-country overrides: `OTP_EMAIL`, `OTP_SMS`, `OTP_WHATSAPP` (cannot disable the last enabled channel — inline error), video uploads (global/per-category), `ENABLE_MONETIZATION` and each engine, `HOTEL_RESERVATIONS`, `WHOLESALE`, `BANKAK_PAYMENTS`, AdMob, category posting restrictions. Change history. | ADM-09, AUTH-15, MON-12 |
| AD-71 | **Media limits** | SA | Global video toggle, per-category toggle, max duration, max file size, photos per listing. | ADM-10 |
| AD-72 | **Configurable defaults** | SA | Editable table of Appendix C defaults (listing caps, rate limits, expiry, quality weights, duplicate thresholds, price-insight minimum/bands, staleness limits, contact-reveal policy and caps, lockout steps, message throttling). | ADM-23 |
| AD-73 | **App versions & remote config** | SA | Minimum supported version per platform (force update), store URLs, other remote-config keys. | ADM-15 |
| AD-74 | **Maintenance mode** | SA | Schedule start/end, localized banner texts AR/EN, preview, enable now. | ADM-16 |
| AD-75 | **Country settings matrix** | SA | Per country: visible categories, attribute overrides, payment methods, languages, legal pages, flags. | ADM-14, CAT-15, LOC-07 |
| AD-76 | **Exchange rates** | SA | SDG/USD rate with effective date, history, staleness indicator (alert after 72 h). | LOC-04 |
| AD-77 | **Maps usage monitor** | SA | Google Maps request counts today/this month, daily cap setting, alert thresholds $10/$25/$50, alert log. | ADM-11, GEO-05 |
| AD-80 | **Content management** | SA (Content Moderator for help/FAQ text) | Tabs: Home banners (schedule, language/country targeting, link), Announcement banners, Static pages, Help Center articles (AR/EN), Legal pages (versioning, effective date, require re-acceptance), Translation manager (key search, missing keys highlighted, EN fallback), WhatsApp message template per language, search synonyms (AR/EN), featured category order. | ADM-12, CMS-*, DET-03 |
| AD-81 | **Broadcast composer** | SA | Audience (all / role / city / category interest), message AR+EN, schedule, preview, send; delivery stats after. | ADM-13, NTF-06 |
| AD-90 | **Admin users & roles** | SA only | Create admin (email, role: Super Admin / Content Moderator / Support Agent / Financial Auditor), deactivate, reset 2FA, permission matrix view. | ADM-17 |
| AD-91 | **Admin sessions** | SA | Active admin sessions with IP, revoke; sign-in IP log. | ADM-18, AUTH-20 |
| AD-92 | **Audit log viewer** | SA, FIN (read-only) | Filter by actor, entity, action, date; expandable before/after; verify chain integrity button. Never editable. | ADM-19 |
| AD-93 | **Analytics & reports** | SA (FIN: finance-related only) | Retention, active users, listings by category, search trends, zero-result queries, listing conversion, posting funnel with drop-off per step, sign-up funnel (AUTH-23), Other-entry analytics. CSV export and scheduled reports. | ADM-20, ANL-* |
| AD-94 | **System health** | SA | Uptime, error rate, queue depth (scan, notification, media, transcoding), DB and cache metrics, last backup and restore-test status, retention job runs. | ADM-22 |

### 11.3 Core admin flows (step by step)

**Moderate a reported listing**
```
AD-10 "Open reports" tile → AD-31 → select report → evidence panel (listing, other reports, owner history)
 → choose action: Dismiss | Hide | Suspend | Delete | Warn | Ban owner → choose reason code → Confirm
 → owner is notified with reason (push + in-app) → listing status changes → audit log entry → report marked resolved
 → if owner appeals: AD-32 → Uphold or Reverse → both parties notified
```

**Add an attribute without a release**
```
AD-60 → select category → [＋ Attribute] → fill form → Preview tab (see generated form & filter) → Publish schema change
 → confirmation "Visible in apps at next fetch" → audit entry with before/after → schema version +1
```

**Verify a business**
```
AD-40 → open request → view documents (zoom/rotate) → Approve → badge granted → user notified; or Reject with reason / Request more info
```

**Deliver a CV**
```
AD-41 → pick Pending request → Assign to me (In Progress) → read structured data → create/upload CV → Preview → Deliver in app (Delivered) → candidate pushed
 → if candidate requests revision: status Revision Requested → back to In Progress
```

**Approve a Bankak receipt (when enabled)**
```
AD-50 Pending → open → inspect receipt (zoom/pan/rotate), compare reference/amount, check fraud warnings → Approve (activates service, invoice) or Reject (reason) → user notified
```

**Turn a capability on**
```
AD-70 → toggle flag → confirm dialog with effect description → Save → "Live within 60 seconds" → apps show/hide the feature on next flag refresh
```

---

## 12. Cross-cutting screen states (implement for every screen)

| Situation | UI behaviour |
|---|---|
| Loading list | Skeleton cards matching final layout |
| Loading detail | Skeleton header + progressive image load |
| Empty list | CMP-I with specific next action |
| Offline | Top bar "No connection"; cached data where available; write actions show "Will not work offline, try again" (no offline queue); chat shows reconnecting |
| API error | Inline error with Retry; 5xx never wipes already displayed data |
| Rate limited (429) | Message with time remaining; disable the control until then |
| Validation error (422) | Field-level messages; scroll to the first error; keep all input |
| Unauthorized (401) | Silent refresh; if refresh fails → AUTH-03 and ⤴ |
| Forbidden / not allowed | Friendly "You don't have access" page with a safe back action |
| Listing sold / expired / suspended | Banner on DET-01, disabled contact actions, similar listings |
| Upload failure | Per-file Retry; chunked video resumes within the session |
| Schema fetch failure | Use cached schema; if none, blocking error on add-listing only |
| Third-party outage (maps/FCM/email/classifier) | Core browsing and posting continue; location search falls back to city + pin |
| Terms updated | Blocking Accept sheet on next launch (HELP-05) |
| Account status Pending Deletion | Sign-in prompt: "Deletion scheduled on {date} — Cancel deletion / Continue to sign out" |

---

## 13. Feature-flag to UI map

| Flag | UI affected when ON | When OFF |
|---|---|---|
| `OTP_EMAIL` | Email OTP option | Cannot be OFF if it is the only channel |
| `OTP_SMS`, `OTP_WHATSAPP` | Channel chooser in AUTH-04; AUTH-08 phone verification; "Verified Phone" badge; Quick Apply phone verification | None of these appear |
| Video uploads (global / per category) | Video section in ADD-04, video player in DET-01 | Section hidden for that category |
| Category posting restriction | Lock message in ADD-01/CAT-01 | Normal |
| Delayed visibility (per category/tier) | ADD-07 "after a quick safety check" message | Instant publish |
| Contact-reveal policy | Guest allowed vs Auth Gate on contact | — |
| `HOTEL_RESERVATIONS` | "Request to book", reservation states | Inquiry only |
| `WHOLESALE` | MOQ and tiered price fields and display | Hidden |
| `BANKAK_PAYMENTS` | PAYU-01…04 | Hidden (admin queue still exists) |
| `ENABLE_MONETIZATION` + engine flags | Plans, boosts, featured badges, credits, auctions, barter, cart, delivery tracking, sponsored slots, AdMob frames | Nothing monetization-related renders |

---

## 14. Notifications and deep links

### 14.1 Rules
Push goes through FCM; tapping a push or a feed item deep-links to the target below. If the user is signed out the Auth Gate runs first, then ⤴. Text is localized (NTF-09). Notifications are deduplicated and batched (NTF-07).

### 14.2 Trigger → destination map

| Trigger | Recipient | Destination |
|---|---|---|
| New message | Other party | CHAT-02 |
| New offer / counter / accept / reject | Other party | CHAT-02 (scrolled to card) |
| Listing published | Owner | DET-01 |
| Listing expiring (7 d, 1 d) | Owner | MY-01 (Renew highlighted) |
| Listing hidden / suspended / auto-hidden | Owner | MY-01 → listing reason |
| Appeal outcome | Owner | MY-04 |
| Saved search match | Searcher | SRCH-02 with saved filters |
| Price drop on favorite | Favoriter | DET-01 |
| Application status change | Candidate | JOB-06 |
| New applicant | Employer | EMP-06 |
| CV delivered / revision / approved | Candidate (and Support on revision) | CV-04 (AD-41 for staff) |
| Rental request / counter / decision | Owner / renter | RENT-11 / RENT-03 |
| Appointment booked / confirmed / rescheduled / reminder (24 h, 2 h) | Customer / provider | APPT-05 / APPT-11 |
| Hotel inquiry | Host | HOT-10 |
| Verification outcome | Requester | PRF-10 |
| Report outcome | Reporter | HELP-06 |
| Payment approved / rejected (flag) | User | PAYU-03/04 |
| Data export ready | User | PRF-17 |
| Admin broadcast | Audience | NTF-01 / linked screen |
| New CV request, new report, new payment, new verification | Admin roles | AD-41 / AD-31 / AD-50 / AD-40 (in-dashboard badges, optional email) |

---

## 15. Role × screen access summary

| Screen group | GST | USR | BUS | EMP | SVC | MOD | SUP | FIN | SA |
|---|---|---|---|---|---|---|---|---|---|
| HOME, CAT, SRCH, DET, CMP, PRF-20, BIZ-01, JOB-01/02, HELP | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | — | — |
| ADD-*, MY-*, CHAT-*, PRF-03…PRF-19, NTF-01, REV, RENT, APPT (as customer), HOT-01, JOB-03…07, CV-* | Gate | ✓ | ✓ | ✓ | ✓ | — | — | — | — |
| BIZ-10…14 | — | — | ✓ | — | — | — | — | — | — |
| EMP-01…06 | — | — | — | ✓ | — | — | — | — | — |
| APPT-10/11, SVC-01 | — | — | — | — | ✓ | — | — | — | — |
| AD-10 (filtered tiles) | — | — | — | — | — | ✓ | ✓ | ✓ | ✓ |
| AD-11/12, AD-20/21, AD-30…33, AD-40 | — | — | — | — | — | ✓ | read-only context (AD-11/12) | — | ✓ |
| AD-41, AD-42, AD-43 | — | — | — | — | — | — | ✓ | — | ✓ |
| AD-50 | — | — | — | — | — | — | — | ✓ | ✓ |
| AD-92 | — | — | — | — | — | — | — | read-only | ✓ |
| AD-34, AD-60…63, AD-70…77, AD-80, AD-81, AD-90, AD-91, AD-93, AD-94 | — | — | — | — | — | — | — | — | ✓ |

Acceptance checks for the access model: a Moderator cannot open AD-50, AD-70 or AD-60; a Financial Auditor can read AD-92 but cannot change roles; a user without the Employer capability never sees EMP-* entries.

---

## 16. Suggested build order for the coding agent

1. **Foundation:** design tokens, RTL/i18n layer, API client with auth refresh and idempotency, remote config/flags, `DynamicForm`, shared components (§2).
2. **Auth and shell:** SYS, ONB, AUTH-*, tabs, Auth Gate, profile hub skeleton.
3. **Core marketplace loop:** CAT, SRCH, DET, favorites, ADD-* (with autosave and media pipeline), MY-*, CHAT-* with offers.
4. **Admin essentials in parallel:** AD-00…AD-02, AD-10, AD-60 (EAV builder), AD-30/31 (moderation), AD-70/71/72.
5. **Verticals:** automotive (rental + appointments), real estate, hotels inquiry, equipment, livestock.
6. **Jobs and CV:** JOB-*, CV-*, EMP-*, AD-41.
7. **Business:** BIZ-*, staff, analytics, CSV.
8. **Account, trust, content:** PRF-*, PRF-16/17, REV, REP, HELP, AD-40, AD-42, AD-80, AD-81.
9. **Flag-OFF surfaces:** PAYU-*, AD-50, monetization engines to the PRD Appendix B bar.
10. **Hardening:** weak-network behaviour, a11y, RTL audit, deep links, store compliance items (report/block, delete-account page).

---

## 17. Screen index (for generating navigation and route files)

| Prefix | Screens |
|---|---|
| SYS | 01 Splash · 02 Maintenance · 03 Force update |
| ONB | 01 Language · 02 Country/city · 03 Permissions (just-in-time) · 04 Welcome |
| AUTH | 00 Auth Gate · 01 Hub · 02 Register · 03 Login · 04 OTP · 05 Reset request · 06 New password · 07 Add email · 08 Verify phone |
| HOME / CAT | HOME-01 · CAT-00 All categories · CAT-01 Category landing |
| SRCH | 01 Entry · 02 Results · 03 Filters · 04 Map results · 05 Save search |
| DET / CMP | DET-01 Details · DET-02 Fullscreen gallery · CMP-01 Compare (CMP-A…M are shared components) |
| ADD | 01 Category · 02 Type · 03 Details · 04 Media · 05 Price/location/contact · 06 Review · 07 Published |
| MY | 01 My listings · 02 Edit · 03 Stats · 04 Appeal |
| CHAT | 01 Inbox · 02 Thread |
| RENT | 01 Form · 02 Confirm · 03 Status · 10 Incoming · 11 Detail |
| APPT / SVC | APPT-01…05 customer · APPT-10/11 provider · SVC-01 Provider setup |
| HOT | 01 Inquiry · 10 Host inquiries · 11 Availability |
| JOB / CV | JOB-01 List · 02 Details · 03 Quick Apply · 04 Profile builder · 05 CV choice · 06 Status · 07 Alerts · CV-01…04 |
| EMP | 01 Dashboard · 02 Job form · 03 Preview · 04 My jobs · 05 Applicants · 06 Applicant detail |
| BIZ | 01 Storefront · 10 Dashboard · 11 Listings · 12 Staff · 13 Inbox · 14 Export |
| PRF | 01 Hub · 03 Favorites · 04 Saved searches · 05 Applications · 06 Rental requests · 07 Appointments · 08 Reviews · 09 Edit profile · 10 Verification · 11 Settings · 12 Become business · 13 Become employer · 14 Become service provider · 15 Notification prefs · 16 Security center · 17 Privacy & data · 18 Blocked users · 19 Quick replies · 20 Public profile · 22 Data saver · 23 Contact prefs |
| NTF / HELP / REV / REP | NTF-01 · HELP-01…07 · REV-01/02 · REP-01 |
| PAYU | 01 Instructions · 02 Submit receipt · 03 Pending · 04 Invoice (flag) |
| AD | 00…02 auth · 10 · 11/12 · 20/21 · 30…34 · 40…43 · 50 · 60…63 · 70…77 · 80/81 · 90…94 |

*End of UI flow specification.*
