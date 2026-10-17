# MARBOU Buyer Requirements Audit & Implementation Plan

**Audit Date**: 2024  
**Frontend Root**: `/Frontend`  
**Build Status**: ✅ Passing (35.2s, 1.33 MB gzip)  
**Test Framework**: Manual + TypeScript verification

---

## Audit Summary

### High-Level Status
- **Core Authentication**: ✅ WORKING (email+OTP register, Google/Facebook/Apple sign-in, social linking, password reset, mock-only)
- **Discovery (Home, Categories)**: ⚠️ PARTIAL (home page exists, category navigation incomplete)
- **Search & Filters**: ⚠️ PARTIAL (keyword search+autocomplete working, dynamic filters incomplete)
- **Listing Detail**: ⚠️ PARTIAL (gallery working, seller card partial, Market Price insight MISSING, similar listings working)
- **Contact Sellers**: ⚠️ PARTIAL (WhatsApp button missing, Call button missing, in-app chat UI exists but non-functional)
- **Chat & Negotiation**: ❌ MISSING (no real-time chat, no delivery receipts, no typing indicators, no offers UI)
- **Favorites & Compare**: ✅ WORKING (localStorage-backed, UI complete)
- **Saved Searches**: ✅ WORKING (localStorage-backed, basic UI exists)
- **Vertical Features**: ⚠️ PARTIAL (rental/appointment filters stubbed, no transaction-specific UX)
- **Wanted Listings**: ❌ MISSING (no UI for posting wanted ads)
- **Reviews & Trust**: ⚠️ PARTIAL (review form exists on listing detail, trust badges display, no moderation UI)
- **Notifications**: ❌ MISSING (no notification center, no push FCM, email placeholder only)
- **Profile & Settings**: ⚠️ PARTIAL (AccountPage exists, incomplete edit forms)
- **Privacy & Data Rights**: ❌ MISSING (no account deletion, data export, block/unblock UI)
- **Help & Support**: ✅ WORKING (Help page exists with mock content)

---

## Detailed Requirement Group Audit

### 1. **Access and Account** → PARTIAL

**What's Working:**
- ✅ Email + password registration with OTP verification (6-digit code, 10-min expiry, 5 attempts, 60s resend)
- ✅ Google/Facebook/Apple sign-in buttons on signin hub
- ✅ Social account email linking (prevents duplicates)
- ✅ Password reset via OTP
- ✅ Account suspension/ban UI (banners on listing detail)
- ✅ Language selector (Arabic RTL default, English LTR)
- ✅ Country/city location selection (stored in app context)
- ✅ Guest browsing without sign-in
- ✅ Demo users seeded (buyer@demo.com, seller@demo.com, business@demo.com / demo123)

**What's Missing:**
- ❌ GPS location auto-detection (choose country/city OR allow GPS → GPS code stub present but not wired)
- ❌ Phone OTP sign-in (AUTH-13, 14, 21 — stubbed, marked OFF at launch)
- ❌ Temporary lockout after failed attempts (AUTH-16, 17 — not implemented)
- ❌ Real email verification for social accounts with relay emails (AUTH-22 — marked as "todo")
- ❌ Unverified email gate on gated actions (unverified users should be sent to OTP screen, not fully gated)

**Recommendation**: Complete the unverified email gate flow; add GPS integration (optional for MVP); phone OTP is acceptable as OFF-at-launch.

---

### 2. **Discovery** → PARTIAL

**What's Working:**
- ✅ Home page with dynamic banners (promo banner visible)
- ✅ Category grid (7 top-level categories with subcategories)
- ✅ Nearby grid (placeholder, uses mock listings filtered by city)
- ✅ Recommended feed (based on recent searches + favorites)
- ✅ Recent listings (shows most recent)
- ✅ Popular listings (highest views)

**What's Missing:**
- ❌ Admin-controlled category order (order is hardcoded in mockData)
- ❌ Admin-controlled banner content (banners are static)
- ❌ Sponsored slots (marked as "hidden at launch")

**Recommendation**: Category and banner order control requires backend; acceptable for MVP.

---

### 3. **Search and Filters** → PARTIAL

**What's Working:**
- ✅ Keyword search across titles, descriptions, categories
- ✅ Search by listing ID (MARBOU-00123 format)
- ✅ Autocomplete suggestions + recent searches + category shortcuts
- ✅ Dynamic attribute filters (generated from category specs)
- ✅ Sort options: relevance, newest, price low→high, price high→low
- ✅ Distance sort (GPS-based, available when location granted)
- ✅ List, grid, and map view toggles
- ✅ Infinite scroll with zero-result suggestions
- ✅ Search query logging (anonymously via mock)

**What's Missing:**
- ❌ Arabic spelling variants (SRCH-02 — not implemented, typo tolerance)
- ❌ Range sliders for numeric attributes (UI shows select dropdowns, not sliders)
- ❌ Yes/no switch filters (dates, condition yes/no, etc. — implemented as selects)
- ❌ Dependent options (Make → Model, Region → City) (CAT-12 — stubbed)
- ❌ Map view functional integration (toggle exists, mock map present but not interactive)

**Recommendation**: Range sliders and dependent options add polish; acceptable for MVP. Arabic variants require NLP backend.

---

### 4. **Viewing a Listing** → PARTIAL

**What's Working:**
- ✅ Image gallery with zoom (click to lightbox)
- ✅ Optional video player (video URL supported in mock data)
- ✅ Price in SDG or USD (formatPrice handles currency)
- ✅ Converted price indicator (exchangeRate in i18n context)
- ✅ Specifications table (built from category attributes)
- ✅ Custom "Other" fields displayed
- ✅ Location map (Leaflet-ready, coordinates present)
- ✅ Seller card with verification badges, rating, response indicators
- ✅ Similar listings (filtered by category)
- ✅ Breadcrumbs, listing ID, posted date, view count
- ✅ Sold/Expired/Suspended status banners

**What's Missing:**
- ❌ Market Price insight (Below/Fair/Above market) (DET-06 — requires pricing analytics backend)
- ❌ Seller's response indicators (e.g., "responds within 2 hours") (DET-02 — mock data stub)
- ❌ Seller privacy setting respect for hidden numbers on Call button (DET-04 — not enforced)

**Recommendation**: Market Price insight is analytics-heavy; acceptable for MVP. Hidden number privacy should be added to Call button if it's implemented.

---

### 5. **Contacting a Seller** → MISSING

**What's Working:**
- ❌ WhatsApp button — NOT IMPLEMENTED (should be one-tap to wa.me with pre-filled message)
- ❌ Call button — NOT IMPLEMENTED (should respect privacy settings)
- ✅ In-app chat — UI EXISTS but non-functional (opens thread modal, no real-time)
- ⚠️ Guest contact buttons — UI exists but gating not fully enforced

**What's Missing Entirely:**
- ❌ WhatsApp pre-fill with title, listing ID, price (DET-03)
- ❌ Call privacy handling (DET-04)
- ❌ Lead event logging (DET-11)
- ❌ Guest contact daily cap enforcement (DET-13)
- ❌ Real-time chat backend (MSG-01, 12)

**Recommendation**: WhatsApp and Call buttons are CRITICAL for MVP. Implement immediately. In-app chat UI is complete but marked as "frontend phase only" (no real-time). Guest contact policy requires backend.

---

### 6. **Chat and Negotiation** → MISSING

**What's Working:**
- ✅ Chat UI scaffold (messages page with thread list, compose area)
- ✅ Message input with image attachment UI
- ✅ Structured offer UI (make offer, counter, accept/reject modals)

**What's Missing Entirely:**
- ❌ Real-time 1-to-1 chat (MSG-01, 12) — frontend only, no backend
- ❌ Delivery receipts (Sent/Delivered/Read) (MSG-02)
- ❌ Typing indicators (MSG-05)
- ❌ Unread counters
- ❌ Block/mute/report per conversation (MSG-08)
- ❌ Anti-spam throttling (MSG-07)
- ❌ Push notifications for away (MSG-06)
- ❌ System banners when listing sold/expired (MSG-09)
- ❌ Message retry logic (MSG-14)
- ❌ Open in WhatsApp shortcut (MSG-10)

**Note**: Chat is marked as "frontend phase only" — no real-time expectations. These features require a backend; acceptable for Phase 2+.

---

### 7. **Saving and Organizing** → WORKING

**What's Working:**
- ✅ Favorites: save/unsave listings, UI displays favorites with heart icon, price-drop notification stub
- ✅ Saved searches: save with name + filters, list view, remove option
- ✅ Compare: up to 3 listings (code says 3, but spec says 4) side-by-side for Automotive/Real Estate/Electronics
- ✅ User dashboard tabs: favorites, saved searches, favorites notifications section

**What's Missing:**
- ❌ Price-drop notifications (triggers exist but not sent)
- ❌ Saved search alert frequency (UI placeholder "alerts: false", no toggle)
- ❌ 4th listing in compare (code limits to 3 instead of 4)

**Recommendation**: Favorites and compare are solid. Alert frequencies require backend. Increase compare limit to 4.

---

### 8. **Buyer Actions by Vertical** → PARTIAL

#### **Automotive**
- ✅ Filter by make, model, year, mileage, transmission, fuel, displacement, body type, condition, price
- ❌ Duty-paid status filter (not in specs)
- ❌ Regional spec filter (not in specs)
- ✅ Spare parts by compatibility (browse only)
- ✅ Compare up to 3 vehicles
- ✅ Verified dealer profiles (seller card shows badges)
- ⚠️ Vehicle rental: filter UI exists, but no request submission logic
- ⚠️ Service appointments: filter UI exists, no booking logic

#### **Real Estate**
- ✅ For-sale/for-rent toggle (category selection)
- ⚠️ Furnished filter (in specs but UI incomplete)
- ✅ Area, price, condition filters
- ✅ Compare up to 3 listings
- ⚠️ Rental/appointment requests: UI stubbed, no backend

#### **Hotel**
- ❌ NOT IMPLEMENTED (category stub exists, no inquiry form)

#### **Equipment**
- ✅ Rental/purchase filter (category selection)
- ✅ Basic specs filtering

#### **Livestock**
- ✅ Basic category exists, breed/age/health filters stubbed

#### **Jobs**
- ✅ Job listing browse
- ✅ Job detail with apply button
- ⚠️ Application form exists but CV upload stubbed
- ⚠️ Application tracking exists in context (appliedJobs state)

**Recommendation**: Verticals have filter scaffolding but lack transaction-specific logic (rental requests, service appointments, hotel inquiries, job CV submissions). Acceptable for MVP if marked as "phase 2".

---

### 9. **Wanted Listings** → MISSING

**What's Working:**
- ❌ No wanted listing posting UI
- ❌ No wanted listing browsing UI

**Recommendation**: Wanted listings are a secondary feature. Can be deferred to Phase 2.

---

### 10. **Reviews, Reports and Trust** → PARTIAL

**What's Working:**
- ✅ Leave review form (rating stars + text + photos UI scaffold on listing detail)
- ✅ Review display (shows author, rating, text, date)
- ✅ Report conversation/listing UI (modals on listing detail + chat)
- ✅ Trust badges display (verified seller, business verified stars)

**What's Missing:**
- ❌ Moderation UI for reported conversations (reports visible to moderators — backend only)
- ❌ Review photos actual upload (UI present, but upload stubbed)
- ❌ User/conversation blocking UI (block button exists, no functional state)

**Recommendation**: Review + reporting UI is solid. Photo upload and moderation require backend.

---

### 11. **Notifications and Communication** → MISSING

**What's Working:**
- ❌ No in-app notification center (icon present, no popover/page)
- ❌ No push notifications (FCM not configured)
- ❌ No email notifications (mock placeholder only)

**Recommendation**: Notification infrastructure is backend-heavy. Icon placeholder exists; can show a "Coming Soon" popover for MVP.

---

### 12. **Profile, Settings and Preferences** → PARTIAL

**What's Working:**
- ✅ User profile page exists (/account)
- ✅ Edit name/phone/avatar form (UI present, localStorage-backed)
- ✅ Change password form
- ✅ Language preference toggle
- ✅ Active listings view
- ✅ History/recently viewed

**What's Missing:**
- ❌ Notification preferences detail (toggles UI placeholder)
- ❌ Linked accounts section (for social sign-in unlink)
- ❌ Privacy settings detail

**Recommendation**: Core profile is solid; notification preferences and linked accounts are secondary.

---

### 13. **Privacy and Data Rights** → MISSING

**What's Working:**
- ❌ Account deletion UI
- ❌ Data export feature
- ❌ Block/unblock user UI (buttons exist on seller card but not functional)
- ❌ Detailed privacy settings

**Recommendation**: Privacy features are backend-heavy. Create placeholder forms and wire to future backend.

---

### 14. **Help and Support** → WORKING

**What's Working:**
- ✅ Help Center page with sections (Getting Started, Safety, Contact)
- ✅ FAQ section (collapsible items)
- ✅ Trust & Safety tips (best practices, phishing, scam awareness)
- ✅ Contact support form (email capture)
- ✅ Legal pages links (Privacy, Terms)
- ✅ All pages i18n-ready (Arabic + English)

---

### 15. **What Buyers CANNOT Do** → PARTIAL

**What's Working:**
- ✅ Guest cannot post listings (add-listing route requires ProtectedRoute, but gate incomplete)
- ✅ Guest cannot favorite (gated via showAuthGate, but modal incomplete)
- ✅ Guest cannot chat (gated, but modal incomplete)
- ✅ Guest cannot offer (gated, but modal incomplete)
- ✅ Guest cannot apply (gated, but modal incomplete)

**What's Missing:**
- ❌ Unverified email cannot do gated actions (should gate to OTP verification screen, not just modal)
- ❌ Auth gate sheet completeness (AuthGateSheet.tsx exists but gating incomplete across pages)

**Recommendation**: Auth gate modal exists and is wired to several actions. Complete wiring across all gated actions (favorite, chat, offer, apply, post listing).

---

## Critical Gaps Summary

**BLOCKING (must fix before MVP launch):**
1. **WhatsApp button on listing detail** — DET-03, currently MISSING
2. **Call button on listing detail** — DET-04, currently MISSING
3. **Auth gate enforcement** — gatedAction modal wired but not complete across all flows

**HIGH PRIORITY (complete for better UX):**
1. Complete in-app chat UI (no real-time needed, UI only)
2. Finalize offer/negotiation UI flow
3. Unverified email gate redirect to OTP screen
4. Compare limit fix (3 → 4 listings)

**MEDIUM PRIORITY (polish):**
1. Notification center placeholder (show coming soon)
2. Privacy & data rights forms (mock backend calls)
3. Block/unblock user UI wiring
4. Vertical-specific transaction flows (rental requests, appointments, hotel inquiry)

**LOW PRIORITY (deferred to Phase 2):**
1. Wanted listings
2. Push notifications (FCM setup)
3. Market Price analytics
4. Arabic spelling variants
5. Real-time chat backend

---

## Implementation Plan

### Phase: Complete MVP Buyer Flow

This plan focuses on CRITICAL + HIGH priority items to make the buyer experience complete and functional.

- [ ] 1. **Add WhatsApp and Call buttons to listing detail**
      Implement DET-03 (WhatsApp with pre-filled message) and DET-04 (Call with privacy respect).
      Files: src/pages/ListingDetailPage.tsx, src/utils/formatting.ts
      Verification: `npm run typecheck` passes; dev server shows buttons on listing detail with proper links

- [ ] 2. **Complete Auth Gate modal and wire to all gated actions**
      Implement AuthGateSheet to display on gated actions (favorite, chat, offer, apply, post). Unverified emails redirect to OTP verification.
      Files: src/components/AuthGateSheet.tsx, src/pages/ListingDetailPage.tsx, src/pages/FavoritesCompareMessages.tsx, src/pages/AddListingPage.tsx, src/pages/JobsServicesBusiness.tsx
      Verification: `npm run build` passes; manually test each gated action as guest and unverified user

- [ ] 3. **Finalize in-app chat UI (non-real-time scaffold)**
      Complete MessagesPage with thread list, message display, compose area, and offer cards. Mark real-time as Phase 2.
      Files: src/pages/FavoritesCompareMessages.tsx (MessagesPage component), src/data/mockData.ts (conversation samples)
      Verification: `npm run typecheck` passes; manually navigate to /messages and verify UI completeness

- [ ] 4. **Increase compare limit to 4 listings and fix UI**
      Update AppContext limit and compare page layout to show 4 listings side-by-side.
      Files: src/context/AppContext.tsx, src/pages/FavoritesCompareMessages.tsx
      Verification: `npm run typecheck` passes; manually add 4 listings and compare

- [ ] 5. **Add unverified email gate with OTP redirect**
      Detect unverified email state and redirect gated actions to OTP verification screen instead of just showing modal.
      Files: src/context/AuthContext.tsx, src/pages/AuthPages.tsx (OTPPage), src/components/ProtectedRoute.tsx
      Verification: `npm run typecheck` passes; test with unverified account (register, don't verify OTP)

- [ ] 6. **Notification center placeholder**
      Add notification bell icon that opens a "Coming Soon" modal when clicked. Show sample notification mockups.
      Files: src/components/AppShell.tsx, src/pages/FavoritesCompareMessages.tsx (or new NotificationsPage.tsx)
      Verification: `npm run typecheck` passes; click notification bell in header

- [ ] 7. **Wire block/unblock user on seller card**
      Add local state to track blocked users; show "Blocked" badge and unblock option on seller card.
      Files: src/pages/ListingDetailPage.tsx, src/pages/SellerProfilePage.tsx, src/context/AppContext.tsx
      Verification: `npm run typecheck` passes; manually test block/unblock on listing detail seller card

- [ ] 8. **Mock backend calls for privacy features**
      Add placeholder forms for account deletion, data export, and privacy settings. Wire to mock "API" that confirms action (via toast).
      Files: src/pages/AccountPage.tsx, src/context/AppContext.tsx (add deletion/export state), src/data/mockData.ts
      Verification: `npm run typecheck` passes; manually test deletion + export forms

- [ ] 9. **Add rental/appointment request flows**
      For Automotive rental (AUTO-09-13) and Real Estate appointments (RE-15-17): implement request form, status tracking, and counter-offer UI.
      Files: src/pages/ListingDetailPage.tsx (modal triggers), src/components/ (RentalRequestForm.tsx, AppointmentRequestForm.tsx), src/context/AppContext.tsx (track requests)
      Verification: `npm run typecheck` passes; manually test request submission and status tracking

- [ ] 10. **Finalize vertical-specific filters and offer card UI**
       Complete offer/negotiation card UI (make offer, counter, accept/reject) for MessagesPage. Add hotel inquiry form stub.
       Files: src/pages/FavoritesCompareMessages.tsx (OfferCard component), src/pages/ListingDetailPage.tsx (hotel inquiry modal), src/data/mockData.ts
       Verification: `npm run typecheck` passes; manually test offer card interactions

- [ ] 11. **Build and verify full app**
       Run `npm run build` to ensure all changes compile to production bundle without errors.
       Files: All modified files above
       Verification: `npm run build` completes successfully, dist/ generated with no TypeScript errors

---

## Testing & Verification

**Manual Testing Checklist:**
- [ ] Guest browsing: access home, search, listing detail without login
- [ ] Register + OTP verification flow
- [ ] Email sign-in with demo accounts (buyer@demo.com, seller@demo.com, business@demo.com / demo123)
- [ ] Favorite + compare workflows
- [ ] Search with filters, saved searches
- [ ] Gated actions (favorite, chat, offer, apply) as guest → auth gate modal appears
- [ ] Gated actions as unverified email → OTP screen appears
- [ ] Gated actions as verified user → action proceeds
- [ ] Listing detail: WhatsApp button opens wa.me, Call button dials
- [ ] Messages page: thread list, compose, offer card interactions
- [ ] Account page: edit profile, change password, view activity
- [ ] Help page: FAQs, contact form, legal links
- [ ] RTL/LTR switching: Arabic → English, all text and layouts mirror correctly
- [ ] Mobile responsiveness: test on 375px, 768px, 1024px viewports

**Build Status:**
```
npm run build → dist/ generation (1.33 MB gzip, ~35s)
npm run typecheck → 0 TS errors
npm run dev → dev server on :5173
```

---

## Notes

- **Mock Auth**: Uses localStorage + PBKDF2 hashing. Real backend (Supabase) will replace in Phase 2.
- **No Real-Time Chat**: Chat UI is complete scaffold; real-time requires WebSocket backend.
- **No Real Payments**: Rental/appointment requests are UI-only; no payment processing.
- **Feature Flags**: Monetization, Jobs, Auctions, Barter toggles wired in AppContext.
- **Internationalization**: All text via i18n context; Arabic RTL & English LTR tested.
- **Responsive Design**: Mobile-first, Tailwind CSS breakpoints (sm/md/lg).

---

## Success Criteria

✅ **MVP Complete when:**
1. All CRITICAL items (WhatsApp, Call, Auth Gate) are implemented and tested
2. `npm run build` passes with 0 errors
3. Manual testing checklist is 100% complete
4. All 15 buyer requirement groups show WORKING or PARTIAL (no MISSING for critical UX paths)

