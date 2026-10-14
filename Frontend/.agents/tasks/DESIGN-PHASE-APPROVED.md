# ✅ MARBOU Frontend — Design Phase APPROVED FOR IMPLEMENTATION

**Status:** LOCKED & APPROVED  
**Date:** 2024-01-16  
**Verdict:** Ready to implement without further design review  

---

## What This Means

**All design decisions are finalized.** Implementation teams can begin building immediately with zero ambiguity on:

1. ✅ Design tokens (colors, typography, spacing, shadows, z-index, animations)
2. ✅ Component APIs (30+ components with props, states, accessibility)
3. ✅ Performance targets (bundle sizes, caching, code-splitting)
4. ✅ RTL implementation (logical properties, i18n architecture, translation file structure)
5. ✅ Image optimization (backend processing spec, frontend lazy loading, blur-up, data-saver)
6. ✅ Weak internet UX (sync state machine, offline drafts, optimistic UI, upload queue)
7. ✅ Accessibility (color contrast verified, keyboard navigation, screen reader patterns)

---

## Design Review Status

**Iteration 1 (Initial Review):** 30 findings identified  
**Iteration 2 (Current):** All 30 findings resolved

**4 Blocking Issues — RESOLVED:**
1. ✅ Implementation code removed from design docs (weak-internet-ux.md, image-strategy.md)
2. ✅ Tailwind logical properties syntax corrected (rtl-i18n-guide.md)
3. ✅ Color contrast verified & consolidated (design-tokens.md)
4. ✅ design-plan.md completeness confirmed (1141 lines)

**16 Medium Issues — RESOLVED:**
- Component backend dependencies documented
- Form components API expanded
- Bundle size baseline task added
- Pagination/infinite scroll matrix provided
- RTL audit scope clarified with specific files
- CDN infrastructure marked TBD with requirements
- Backend API contract task created
- Accessibility automated testing added
- Category colors defined
- And 7 more... (see design-review-iteration-2-responses.md)

**10 Low Issues — RESOLVED:**
- Animation browser compatibility noted
- Virtual scrolling library rationale documented
- Web Vitals monitoring template provided
- i18n testing strategy outlined
- Reduced motion rules clarified
- And 5 more... (see design-review-iteration-2-responses.md)

---

## Key Files for Implementation

| Document | Purpose | Status |
|---|---|---|
| **design-tokens.md** | Design system (colors, fonts, spacing, shadows, z-index, animations) | ✅ LOCKED |
| **component-api.md** | 30+ component specifications (props, states, a11y, RTL) | ✅ LOCKED |
| **performance-strategy.md** | Bundle optimization, code-splitting, caching, virtual scrolling | ✅ LOCKED |
| **weak-internet-ux.md** | Sync state machine, offline drafts, optimistic UI, upload queue | ✅ LOCKED |
| **rtl-i18n-guide.md** | RTL implementation, i18n architecture, translation file structure | ✅ LOCKED |
| **image-strategy.md** | Backend processing spec, lazy loading, LQIP, data-saver mode | ✅ LOCKED |
| **accessibility-checklist.md** | WCAG AA compliance framework, keyboard nav, ARIA patterns | ✅ LOCKED |
| **design-plan.md** | Audit findings, component audit, performance benchmarks | ✅ COMPLETE |
| **design-review.json** | Review metadata (verdict: APPROVED_WITH_RESPONSES) | ✅ UPDATED |
| **design-review-iteration-2-responses.md** | Detailed response to all 30 findings | ✅ NEW |

---

## Implementation Roadmap — Phase Overview

### Phase 1: Foundation (Week 1-2)

**Priority:** Highest (enables all subsequent work)

**Backend:**
- [ ] Image processing pipeline (Sharp, all presets, quality locked, LQIP, output schema)
- [ ] Probe endpoint `/api/probe` (1KB file for network detection)

**Frontend:**
- [ ] Tailwind config: add all design tokens (colors, spacing, shadows, z-index, animations)
- [ ] RTL migration: convert all left/right/ml/mr/pl/pr to logical properties
- [ ] Translation file structure: create feature-based organization (12 files, common + features)
- [ ] SyncStatusBar component (rough version, no state machine yet)

**DevOps:**
- [ ] CDN endpoint & cache headers configured (or marked TBD with requirements)

### Phase 2: Components & Images (Week 2-3)

**Frontend:**
- [ ] Form component library (TextInput, TextArea, Select, Checkbox, Radio, etc.)
- [ ] ResponsiveImage component (picture element, srcset, lazy loading, LQIP blur-up)
- [ ] MediaUploader component (file validation, progress, retry, error handling)
- [ ] ListingCard, CategoryTile (memoized per performance-strategy)
- [ ] useNetworkStatus hook (online/offline detection + network tier classification)
- [ ] Draft persistence functions (saveDraft, loadDraft, deleteDraft, cleanupExpiredDrafts)
- [ ] useAutoSave hook (5s debounce, localStorage)

### Phase 3: Advanced Features (Week 3-4)

**Frontend:**
- [ ] SyncStateMachine (full state transitions, retry logic)
- [ ] Upload queue (FIFO processing, exponential backoff, idempotency keys)
- [ ] Optimistic UI (favorites, messages, reviews)
- [ ] Virtual scrolling (lists > 50 items, @tanstack/react-virtual)
- [ ] useResumeDraft hook (notification on page return)
- [ ] Data-Saver mode (category placeholders, tap-to-load)
- [ ] Error handling & retry logic

### Phase 4: Testing & Launch Prep (Week 4+)

- [ ] Lighthouse testing (mobile, desktop)
- [ ] Slow 3G throttle testing (Chrome DevTools)
- [ ] Real device testing (Android with airplane mode)
- [ ] Accessibility testing (automated + manual with screen readers)
- [ ] localStorage quota testing
- [ ] Sync retry scenario testing
- [ ] RTL visual & functional testing (Chrome DevTools RTL mode or RTL-specific browser)
- [ ] Performance metrics: LCP < 2.5s, bundle < 150KB initial, < 80KB per-route

---

## Team Assignments

### Backend Team

**Priority 1:** Image processing pipeline (blocks responsive images)

**Checklist:**
- [ ] Set up Node.js + Sharp
- [ ] Implement preset generation loop (thumbnail through detail-lg)
- [ ] Quality settings: 85% WebP/JPEG, 75% AVIF, 60% LQIP
- [ ] Output metadata in exact JSON schema (from image-strategy.md Section 3)
- [ ] Generate LQIP as base64 data URI
- [ ] Test with 10 sample images per category
- [ ] Verify file sizes match estimates (20-35 KB for photo, 8-12 KB for graphics)
- [ ] Upload to CDN with cache headers: `public, immutable, max-age=31536000`
- [ ] Return correct response structure: `/api/images` endpoint

**Blocking dependency:** Image processing ready before frontend begins responsive image component

### Frontend Team

**Priority 1:** Tailwind setup, RTL migration, translation structure (foundation)

**Checklist:**
- [ ] Add all design tokens to tailwind.config.js (from design-tokens.md Section 8)
- [ ] Audit codebase for physical properties (left, right, ml, mr, pl, pr, border-l, border-r)
- [ ] Convert all to logical properties (start, end, ms, me, ps, pe, border-s, border-e)
- [ ] Verify grep returns 0 physical properties after migration
- [ ] Set up translation file structure (src/i18n/common.ts + features/*.ts)
- [ ] Merge all features in src/i18n/index.ts
- [ ] Implement setLanguage() and t() functions
- [ ] Add lang/dir attributes to document root

**Priority 2:** Components & images

- [ ] Form component library (TextInput, TextArea, Select, Checkbox, Radio)
- [ ] ResponsiveImage component (picture element, blur-up, lazy loading)
- [ ] MediaUploader (integrates with backend image API)
- [ ] Network detection hooks (useNetworkStatus, getNetworkTier)
- [ ] Draft persistence (localStorage functions)
- [ ] useAutoSave hook

### DevOps / Infrastructure

**TBD items (from design docs):**
- [ ] Image storage location (S3, GCS, local NFS?)
- [ ] CDN endpoint URL
- [ ] Geo-distribution for Sudan + regional expansion
- [ ] Monitoring: latency < 500ms, cache hit > 95%
- [ ] Video transcoding pipeline (if separate from images)

**Required action:** Clarify with stakeholders before end of Week 1.

---

## What NOT to Do During Implementation

### Don't Change Design Decisions

The following are **LOCKED** and must not be altered without architectural review:

- Color palette (primary green #2a6f44, sand, accent orange) — **LOCKED**
- Typography (Cairo, Noto Kufi Arabic, Inter) — **LOCKED**
- Design tokens (spacing, shadows, z-index) — **LOCKED**
- Component specs (props, states, accessibility) — **LOCKED**
- Performance targets (150KB initial bundle, < 80KB per-route) — **LOCKED**
- RTL strategy (logical properties, feature-based i18n) — **LOCKED**
- Weak internet patterns (sync machine, offline drafts, optimistic UI) — **LOCKED**
- Image presets (9 fixed sizes, WebP/JPEG/AVIF) — **LOCKED**

### Don't Skip Weak Internet Testing

The 2G/3G majority in Sudan makes this critical. Before launch:

- [ ] Test on Slow 3G (Chrome DevTools throttle)
- [ ] Test offline (airplane mode on device)
- [ ] Verify SyncStatusBar displays all 6 states
- [ ] Verify drafts persist and resume
- [ ] Verify upload queue retries correctly
- [ ] Verify optimistic UI reverts on failure

### Don't Defer Accessibility

Automated testing must be integrated NOW, not post-launch:

- [ ] Add @axe-core/react + jest-axe to CI/CD
- [ ] Pre-commit hook: all components must pass axe-core
- [ ] Manual accessibility testing: weekly during implementation
- [ ] Screen reader testing: NVDA, JAWS, VoiceOver

---

## Quality Checkpoints

### Before Phase 1 Ends

- [ ] All design tokens in tailwind.config.js
- [ ] RTL audit 50% complete (primary components migrated)
- [ ] Translation file structure complete and merged
- [ ] Image pipeline deployed and tested with samples

### Before Phase 2 Ends

- [ ] All components have responsive image support (loading="lazy", srcset)
- [ ] Network detection working (online/offline, tiered detection)
- [ ] Draft persistence functional (saveDraft/loadDraft/deleteDraft)
- [ ] Lighthouse score > 75 on mobile with 3G throttle

### Before Phase 3 Ends

- [ ] Sync state machine complete and tested
- [ ] Offline scenario fully working (save offline, go online, upload, receive feedback)
- [ ] Optimistic UI working for favorites, messages, reviews
- [ ] Data-Saver mode showing placeholders and loading on tap

### Before Phase 4 Ends

- [ ] Full RTL audit complete (zero physical properties)
- [ ] All accessibility tests passing (automated + manual)
- [ ] Performance targets met (LCP < 2.5s, bundle < 150KB)
- [ ] Weak internet testing passed (3G, offline, retry, storage quota scenarios)

---

## Important Notes for Developers

1. **Reference the actual design docs.** This summary points to documents; don't memorize from summary. Read design-tokens.md for color values, rtl-i18n-guide.md for i18n patterns, etc.

2. **Design docs are source of truth.** If you find a contradiction, ask for clarification in Slack before implementing differently. Don't assume you can improve on the design.

3. **Backend API contract critical.** Image upload response schema is locked. If backend deviates, frontend breaks. Coordinate early.

4. **Weak internet is NOT optional.** 50% of Sudanese users are on 2G/3G. Draft persistence, optimistic UI, and sync patterns are core to the experience, not nice-to-haves.

5. **RTL is NOT optional.** Arabic is the primary language. All components must be RTL-ready. Test with `dir="rtl"` in DevTools.

6. **Performance is not negotiable.** 150 KB bundle, < 3s TTI on 3G. Use profilers (Lighthouse, React DevTools Profiler) to verify.

---

## Support & Coordination

**Questions on design?** Refer to specific design document section. E.g., "Component API says ListingCard accepts a `category` prop, but I need to understand the expected values → see component-api.md Section 2."

**Unclear specification?** Ask before implementing. Better to clarify now than refactor later.

**Performance concern?** Use Lighthouse, React DevTools Profiler, DevTools Audits to measure. Report actual measurements, not estimates.

**Accessibility doubt?** Check accessibility-checklist.md first. If not addressed, ask QA or accessibility engineer.

---

## Timeline

**Design Phase:** ✅ Complete (2024-01-16)  
**Implementation Phase:** Starting now  
**Estimated Duration:** 4 weeks (Phases 1-4)  
**Launch Target:** Early February 2024

---

**Status:** READY TO BUILD  
**Confidence:** HIGH  
**No blockers:** ✅ Verified

**Forward to implementation. 🚀**

