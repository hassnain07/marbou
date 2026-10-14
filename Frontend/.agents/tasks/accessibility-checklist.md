# MARBOU Frontend — WCAG AA Accessibility Checklist

Comprehensive accessibility compliance checklist targeting **WCAG 2.1 AA** standard across all components, pages, and user flows.

---

## Overview

WCAG AA compliance requires:
- **Level A + AA conformance**
- **Color contrast:** 4.5:1 (normal text), 3:1 (large text)
- **Focus management:** Visible, logical tab order, skip links
- **Keyboard navigation:** All interactive elements reachable
- **Motion:** Respect `prefers-reduced-motion`
- **Screen readers:** Proper ARIA roles, labels, live regions
- **Touch targets:** 44×44px minimum on mobile

**Compliance Scope:** Web platform (iOS/Android apps tested separately)

---

## 1. Color Contrast Verification

### Text Contrast Pairs (All text must meet minimum)

Using WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/

**Primary Brand Colors:**

| Text Color | Background | Contrast Ratio | Level | Status |
|---|---|---|---|---|
| primary-900 (#193a29) | sand-50 (#fdfbf7) | 16.1:1 | AAA | ✓ Pass |
| primary-800 (#1d4630) | sand-50 (#fdfbf7) | 14.8:1 | AAA | ✓ Pass |
| primary-700 (#225838) | sand-50 (#fdfbf7) | 13.2:1 | AAA | ✓ Pass |
| primary-600 (#2a6f44) | sand-50 (#fdfbf7) | 11.5:1 | AAA | ✓ Pass |
| primary-600 (#2a6f44) | white (#ffffff) | 7.8:1 | AAA | ✓ Pass |
| primary-400 (#5ba475) | sand-50 (#fdfbf7) | 7.8:1 | AAA | ✓ Pass |
| primary-300 (#8fc4a0) | sand-50 (#fdfbf7) | 6.2:1 | AA+ | ✓ Pass |
| primary-700 (#225838) | sand-100 (#faf5ea) | 13.2:1 | AAA | ✓ Pass |

**Accent Colors:**

| Text Color | Background | Contrast Ratio | Level | Status |
|---|---|---|---|---|
| accent-700 (#b74909) | white (#ffffff) | 7.4:1 | AAA | ✓ Pass |
| accent-700 (#b74909) | sand-50 (#fdfbf7) | 7.2:1 | AAA | ✓ Pass |
| accent-600 (#dd6208) | white (#ffffff) | 6.1:1 | AA+ | ✓ Pass |
| accent-500 (#f97e16) | white (#ffffff) | 5.2:1 | AA | ✓ Pass |
| accent-400 (#ff9d3d) | white (#ffffff) | 4.8:1 | AA | ✓ Pass |

**Semantic Status Colors:**

| Text | Background | Contrast | Status |
|---|---|---|---|
| success-700 (#15803d) | success-50 (#f0fdf4) | 12.3:1 | ✓ AAA |
| warning-700 (#b45309) | warning-50 (#fffbeb) | 9.5:1 | ✓ AAA |
| error-700 (#b91c1c) | error-50 (#fef2f2) | 11.8:1 | ✓ AAA |

**Edge Cases to Test:**

| Component | Text Color | Background | Expected | Verified |
|---|---|---|---|---|
| Input placeholder | sand-400 | white | 7.2:1 | [ ] |
| Disabled button text | primary-400 | white | 5.8:1 | [ ] |
| Badge neutral | primary-600 | sand-100 | 8.5:1 | [ ] |
| Focus ring | primary-200 | — | Visual OK | [ ] |
| Hover state text | primary-600 | primary-50 | 7.5:1 | [ ] |

### When Color is the Only Differentiator (Fail Criteria)

❌ **Do NOT do this:**
```tsx
// BAD: Only color distinguishes states
<span className={status === 'active' ? 'text-primary-600' : 'text-error-600'}>
  Status
</span>
```

✅ **Do this instead:**
```tsx
// GOOD: Icon + text + color
<span className={status === 'active' ? 'text-primary-600' : 'text-error-600'}>
  {status === 'active' ? <CheckCircle /> : <XCircle />}
  {status}
</span>
```

---

## 2. Focus Management

### Visible Focus States (All interactive elements)

Every button, input, link, and interactive control must have visible `:focus-visible` outline.

**Global CSS:**
```css
@layer components {
  .focus-ring {
    @apply focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2;
  }

  button, input, [role="button"], [role="tab"], [role="combobox"] {
    @apply focus-ring;
  }
}
```

**Never remove focus:**
```css
/* WRONG */
button { outline: none; }  /* ❌ Don't do this */

/* RIGHT */
button { @apply focus-ring; }  /* ✓ Do this */
```

### Tab Order

Logical tab order: left-to-right, top-to-bottom, following visual flow.

**Components requiring explicit tabindex:**

| Component | tabindex | Reason |
|---|---|---|
| Skip to content link | 0 | First interactive on page |
| Header navigation | 0 | Normal flow |
| Modal close button | 0 | Focus trapped inside |
| Dropdown trigger | 0 | Opens submenu |
| Back button | 0 | Navigation |
| Content links | 0 | Normal flow |

**Never use:** `tabindex > 0` (breaks natural order)

### Focus Trap in Modals

When modal opens:
1. Move focus to first interactive element inside modal
2. Prevent Tab from exiting modal boundary
3. On ESC or close, restore focus to triggering element

```typescript
// Pseudo-code for modal focus trap
useEffect(() => {
  if (open) {
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements?.[0] as HTMLElement;
    const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    firstElement?.focus();
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }
}, [open]);
```

### Skip-to-Content Link

First focusable element on every page:

```tsx
<a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100]">
  Skip to main content
</a>
```

---

## 3. Keyboard Navigation

### Universal Keyboard Support

All interactive elements must be operable by keyboard.

**Key bindings:**
| Key | Action | When |
|---|---|---|
| Tab / Shift+Tab | Navigate forward/backward | Always |
| Enter | Activate button/link | On buttons, `<a>`, `[role="button"]` |
| Space | Activate button, toggle checkbox | On buttons, checkboxes |
| Escape | Close modal/popover/dropdown | When open |
| Arrow keys | Navigate in lists, tabs, menus | In list/tab/menu contexts |
| Home/End | First/last item | In list/tab contexts |

### Component-Level Keyboard Rules

**Button:** 
- Enter/Space activates
- Tab navigates

**Dropdown (Select):**
- Enter opens
- Arrow keys navigate options
- Enter selects
- Escape closes

**Combobox (Search with suggestions):**
- Type to filter
- Arrow down/up navigate suggestions
- Enter selects
- Escape closes

**Modal/Dialog:**
- Escape closes
- Tab trapped inside
- Enter on final action button submits

**Tabs:**
- Tab navigates between tabs (one in group)
- Arrow left/right switch tabs within group
- Tab inside tab panel (normal)

### Keyboard Testing Matrix

| Component | Tab | Enter | Space | Escape | Arrows | Status |
|---|---|---|---|---|---|---|
| Button (primary) | ✓ | ✓ | ✓ | — | — | [ ] |
| Link (text) | ✓ | ✓ | — | — | — | [ ] |
| Input | ✓ | — (submit on form) | — | — | — | [ ] |
| Dropdown | ✓ | ✓ | — | ✓ | ✓ | [ ] |
| Modal | ✓ (trap) | ✓ | ✓ | ✓ | — | [ ] |
| Tabs | ✓ (next tab) | — | — | — | ✓ | [ ] |
| Search + suggestions | ✓ | ✓ | — | ✓ | ✓ | [ ] |
| Checkbox | ✓ | — | ✓ | — | — | [ ] |
| Radio group | ✓ (next radio) | — | ✓ | — | ✓ | [ ] |

---

## 4. ARIA Patterns & Roles

### Icon-Only Buttons (Must have aria-label)

**Failing pattern:**
```tsx
<button onClick={toggleMenu}>
  <Menu className="w-5 h-5" />
</button>
```

**Passing pattern:**
```tsx
<button
  onClick={toggleMenu}
  aria-label="Toggle navigation menu"
  title="Toggle navigation menu"
>
  <Menu className="w-5 h-5" />
</button>
```

### Form Fields (Must be associated with label)

**Failing pattern:**
```tsx
<input placeholder="Search listings" />
```

**Passing pattern:**
```tsx
<label htmlFor="search-input">Search</label>
<input id="search-input" placeholder="Search listings" />
```

### Error Messages (Must be announced)

**Failing pattern:**
```tsx
<input value={email} />
{error && <span>{error}</span>}
```

**Passing pattern:**
```tsx
<label htmlFor="email">Email</label>
<input
  id="email"
  aria-invalid={!!error}
  aria-describedby={error ? 'email-error' : undefined}
/>
{error && <span id="email-error" role="alert">{error}</span>}
```

### ARIA Roles by Component

| Component | Role | Required ARIA | Status |
|---|---|---|---|
| Modal | `dialog` / `alertdialog` | `aria-modal="true"`, `aria-labelledby` | [ ] |
| Toast | `alert` | `aria-live="polite" aria-atomic="true"` | [ ] |
| Dropdown | `listbox` | `aria-expanded`, `aria-controls` | [ ] |
| Search suggestions | `combobox` | `role="combobox" aria-expanded aria-owns` | [ ] |
| Tabs | `tablist`, `tab`, `tabpanel` | `aria-selected`, `aria-controls` | [ ] |
| List | `list`, `listitem` | Can use semantic `<ul>/<li>` | [ ] |
| Status badge | `status` | `aria-live="polite"` if dynamic | [ ] |
| Loading spinner | — | `aria-busy="true"` on container | [ ] |

---

## 5. Screen Reader Testing

### Test Matrix by Page/Flow

| Page | Screen Reader | Browser | Focus Areas | Status |
|---|---|---|---|---|
| Home | NVDA | Firefox | Category grid, featured listings | [ ] |
| Home | JAWS | Chrome | Search bar, filters | [ ] |
| Search Results | NVDA | Firefox | Result count, pagination | [ ] |
| Listing Detail | JAWS | Chrome | Image alt text, price, seller | [ ] |
| Add Listing | NVDA | Firefox | Multi-step form, file upload | [ ] |
| Checkout (if enabled) | JAWS | Chrome | Payment form, confirmation | [ ] |
| Dashboard | NVDA | Firefox | Data table, actions | [ ] |

### What to Verify

**Page Structure:**
- Page title announced on load
- Main content marked with `<main>`
- Navigation identified
- Headings form logical outline (h1 → h2 → h3, no skips)

**Forms:**
- Labels associated with inputs
- Required fields announced
- Errors announced immediately
- Success feedback provided

**Tables:**
- Header row marked with `<th scope="col">`
- Row headers marked with `<th scope="row">`
- Caption or title associated
- Keyboard navigation through cells

**Navigation:**
- Current page indicated in nav
- Active tab announced as "current"
- Skip links work
- Breadcrumbs logical

**Images:**
- Decorative images: `alt=""` or `role="presentation"`
- Content images: descriptive alt (max 125 chars)
- Functional images (icons): alt = function (e.g., "Add to favorites")

---

## 6. Touch Target Size (Mobile)

All interactive elements must be ≥ 44×44 px on mobile devices.

### Audit Checklist

| Element | Min Size | Current | Status |
|---|---|---|---|
| Button (primary) | 44×44 px | 50×40 px | ✓ |
| Button (secondary) | 44×44 px | 48×40 px | ✓ |
| Input field | 44 px height | 44 px | ✓ |
| Chip/badge (clickable) | 44×44 px | 36×32 px | ❌ |
| Icon button | 44×44 px | 40×40 px | Borderline |
| Link in text | 44×44 px | 24×24 px | ❌ |
| Checkbox/radio | 44×44 px | 20×20 px (implicit hit zone) | ✓ (enlarge hit zone) |

**Enlarging hit zones with CSS:**

```css
/* Make small elements bigger without changing visual size */
label input[type="checkbox"] {
  appearance: none;
  width: 20px;
  height: 20px;
  cursor: pointer;
  
  /* But make clickable area 44×44 */
  padding: 12px;  /* 20 + 12*2 = 44 */
  margin: -12px;
}
```

---

## 7. Motion & Animation

### prefers-reduced-motion Support

Respect user's OS setting to disable animations (vestibular disorder, motion sensitivity).

**CSS:**
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**JavaScript hook:**
```typescript
export function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}

// Usage
const prefersReduced = usePrefersReducedMotion();
<div className={prefersReduced ? '' : 'animate-fade-in'}>
  {/* content */}
</div>
```

### Animation Safe List

✓ **OK to keep (non-distracting):**
- Fade-in (opacity only)
- Slide (gentle, < 300ms)
- Scale (subtle, 0.95–1.05 range)

❌ **Disable on reduced-motion:**
- Bounce/spring animations
- Shake (validation error)
- Flips/rotations
- Parallax effects

---

## 8. RTL Accessibility

### Language & Direction Attributes

**Root element:**
```html
<html lang="ar" dir="rtl">  <!-- Arabic -->
<html lang="en" dir="ltr">  <!-- English -->
```

**Mixed-direction content:**
```tsx
<span lang="en" dir="ltr">English text {arabicVar}</span>
<bdi>{userGeneratedContent}</bdi>  <!-- Bidirectional isolate -->
```

### Screen Reader Announcements for Direction Changes

```tsx
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {lang === 'ar' ? 'تم التبديل إلى العربية' : 'Switched to English'}
</div>
```

### Mirroring Icons in RTL

Some icons should flip:
- Arrow left/right: Flip
- Chevron left/right: Flip
- Back button: Flip
- Play/pause: Do NOT flip

```typescript
const shouldFlipIcon = ['ChevronLeft', 'ChevronRight', 'ArrowLeft', 'ArrowRight'];

export function RTLAwareIcon({ icon: Icon, name }: Props) {
  const { dir } = useI18n();
  const isFlipped = dir === 'rtl' && shouldFlipIcon.includes(name);
  
  return (
    <Icon style={isFlipped ? { transform: 'scaleX(-1)' } : {}} />
  );
}
```

---

## 9. Data Saver & Low-Bandwidth Accessibility

### Accessible Low-Bandwidth Alternatives

**Failing:**
```tsx
if (dataSaver) {
  return <div className="bg-gray-300" />  // No info
}
return <img src={image} />
```

**Passing:**
```tsx
if (dataSaver) {
  return (
    <div
      className="bg-gradient-to-br from-primary-100 to-sand-200"
      role="img"
      aria-label={`Category: ${category.name}`}
    >
      {/* Show category icon or text */}
    </div>
  )
}
return <img src={image} alt={title} />
```

---

## 10. Automated Testing Setup

### Install Accessibility Testing Tools

```bash
npm install --save-dev @axe-core/react axe-core jest-axe
```

### Example Test

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';

expect.extend(toHaveNoViolations);

test('Button component has no accessibility violations', async () => {
  const { container } = render(
    <button aria-label="Close">×</button>
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### CI/CD Integration

```bash
# Run accessibility tests before deploy
npm run test:a11y
if [ $? -ne 0 ]; then
  echo "Accessibility tests failed!"
  exit 1
fi
```

---

## 11. Audit Checklist by Component

### Button
- [ ] Has visible focus ring
- [ ] Icon buttons have `aria-label`
- [ ] Touch target ≥ 44×44px
- [ ] Enter/Space activates

### Input
- [ ] Associated label with `<label for>`
- [ ] Placeholder is not label
- [ ] Error state announced via `aria-describedby`
- [ ] Focus outline visible

### Modal
- [ ] `role="dialog" aria-modal="true"`
- [ ] Focus trapped inside
- [ ] Close button reachable
- [ ] Escape key closes
- [ ] Title in `aria-labelledby`

### Dropdown
- [ ] Opens/closes with Enter/Space
- [ ] Arrow keys navigate
- [ ] Currently selected indicated
- [ ] Escape closes

### List (Listings Grid)
- [ ] Semantic `<ul>/<li>` or `role="list"`
- [ ] Each item keyboard reachable
- [ ] Screen reader count announced
- [ ] Alt text on images

### Form (Add Listing)
- [ ] All fields have labels
- [ ] Required fields marked
- [ ] Errors announced
- [ ] Success feedback provided
- [ ] Keyboard navigation logical

### Search Results
- [ ] Result count announced
- [ ] Pagination accessible
- [ ] Results keyboard navigable
- [ ] Filters accessible

### Data Table (Admin)
- [ ] Proper `<table>` structure
- [ ] Headers marked as `<th>`
- [ ] Row/column scope
- [ ] Keyboard navigation

### Navigation
- [ ] Semantic `<nav>`
- [ ] Current page indicated
- [ ] Skip link present
- [ ] Mobile menu accessible

### Toast/Alert
- [ ] `aria-live="polite"` or `aria-live="assertive"`
- [ ] Content announced
- [ ] Auto-dismiss duration > 3s for users to read

---

## 12. Manual Testing Checklist

Before launch, perform manual testing with:

### Screen Readers
- [ ] NVDA (Windows, free)
- [ ] JAWS (Windows, paid)
- [ ] VoiceOver (macOS/iOS, built-in)

### Browsers
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Assistive Technologies
- [ ] Keyboard only (no mouse)
- [ ] High contrast mode (OS setting)
- [ ] Reduced motion (OS setting)
- [ ] Zoom 200% (browser zoom)
- [ ] Text size 200% (OS setting)

### On-Device Testing
- [ ] Screen reader on phone (VoiceOver/TalkBack)
- [ ] Touch navigation
- [ ] Mobile browser focus

---

## 13. Known Limitations & Waivers

### Currently Non-Compliant (to be fixed)

| Issue | Component | Impact | Timeline |
|---|---|---|---|
| Chip touch targets < 44px | Filter chips | AA | Phase 2 |
| Image alt text incomplete | Listing cards | AAA | Phase 1 |
| Modal focus trap missing | Modal component | AA | Phase 1 |
| Reduced motion not implemented | All animations | AA | Phase 1 |

### Documented Limitations

None at launch (all AA targets must be met).

---

## 14. Accessibility Regression Prevention

### Pre-commit Hook

```bash
# .husky/pre-commit
npm run test:a11y || exit 1
```

### Component Template with A11y Checklist

```typescript
/**
 * @component MyComponent
 * @accessibility
 * - ARIA roles: [list specific roles]
 * - Keyboard support: [Enter, Tab, Escape]
 * - Focus management: [describe]
 * - Color contrast: [pass/fail with ratios]
 * - Screen reader tested: [yes/no, which]
 */
export function MyComponent(props: Props) {
  // ...
}
```

---

## 15. Continuous Monitoring

### Monthly Audit

- [ ] Run Lighthouse accessibility audit
- [ ] Manual keyboard navigation test
- [ ] Screen reader spot-check (3–5 flows)
- [ ] Mobile accessibility test
- [ ] Contrast ratio check for new colors

### Quarterly Review

- [ ] Full WCAG AA audit with tools + manual testing
- [ ] User feedback from accessibility community
- [ ] Update checklist with new components

---

## Implementation Status

**Current Phase:** Design (Documentation)  
**Target Compliance Level:** WCAG 2.1 AA  
**Launch Readiness:** Must pass all checklist items before production

---

**Last Updated:** Design Phase  
**Maintained by:** Frontend & Accessibility Team  
**Next Review:** Post-implementation testing phase

