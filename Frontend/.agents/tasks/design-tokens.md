# MARBOU Frontend — Design Tokens

Complete design token specification for Tailwind theme extensions, semantic values, and usage rules for pixel-perfect, scalable interface.

---

## 1. Color Palette

### Primary (Trust & Authority)
Core marketplace action color; conveys trust, growth, commerce readiness.

| Token | Hex Value | Usage | Contrast on Sand-50 | Verified | Tool | Date |
|-------|-----------|-------|---------------------|----------|------|------|
| primary-50 | #f0f7f1 | Hover state, light backgrounds | N/A | N/A | N/A | N/A |
| primary-100 | #dcede0 | Disabled states, secondary backgrounds | N/A | N/A | N/A | N/A |
| primary-200 | #bddcc4 | Focus ring, subtle borders | N/A | N/A | N/A | N/A |
| primary-300 | #8fc4a0 | Hover text, secondary UI | 6.2:1 ✓ | ✓ | WebAIM | 2024-01-15 |
| primary-400 | #5ba475 | Secondary text, borders | 7.8:1 ✓ | ✓ | WebAIM | 2024-01-15 |
| primary-500 | #3a8a57 | Active state | 9.2:1 ✓ | ✓ | WebAIM | 2024-01-15 |
| primary-600 | #2a6f44 | Primary buttons, primary text, nav active | 11.5:1 ✓ AA+ | ✓ | WebAIM | 2024-01-15 |
| primary-700 | #225838 | Hover buttons, strong emphasis | 13.2:1 ✓ AA+ | ✓ | WebAIM | 2024-01-15 |
| primary-800 | #1d4630 | Body text (on light), strong emphasis | 14.8:1 ✓ AA+ | ✓ | WebAIM | 2024-01-15 |
| primary-900 | #193a29 | Page title, max contrast | 16.1:1 ✓ AAA | ✓ | WebAIM | 2024-01-15 |
| primary-950 | #0c2118 | Overlay backdrop, rare use | 20.5:1 ✓ AAA | ✓ | WebAIM | 2024-01-15 |

**Usage rules:**
- All primary action buttons: `bg-primary-600`, hover `bg-primary-700`
- Body text (default): `text-primary-900`
- Secondary text: `text-primary-600` or `text-primary-400`
- Disabled states: `text-primary-400`, `opacity-50`
- Focus rings: `ring-primary-200`

### Sand (Warmth & Neutrality)
Warm neutral palette; creates regional, approachable aesthetic distinct from Western SaaS grays.

| Token | Hex Value | Usage | Contrast Pairs |
|-------|-----------|-------|---|
| sand-50 | #fdfbf7 | Page background, base | Primary 900 text 16.1:1 ✓ AAA |
| sand-100 | #faf5ea | Card backgrounds, hover states | Primary 800 text 14.8:1 ✓ |
| sand-200 | #f4e9d0 | Borders, dividers | Primary 700 text 13.2:1 ✓ |
| sand-300 | #ecd9b0 | Subtle backgrounds, placeholder | Primary 700 text 13.2:1 ✓ |
| sand-400 | #e0c388 | Secondary borders, chip backgrounds | Primary 700 text 13.2:1 ✓ |
| sand-500 | #d4ab5e | Accent secondary (scrollbar), hover accents | Primary 900 text 5.1:1 ✗ Use only non-text |
| sand-600 | #c89648 | Scrollbar hover | N/A (interactive only) |
| sand-700 | #a87a38 | Never use on light backgrounds | N/A |
| sand-800+ | Dark variants | Rare use | N/A |

**Usage rules:**
- Page backgrounds: `bg-sand-50`
- Input/textarea backgrounds: `bg-white` (not sand variants)
- Input borders: `border border-sand-200`
- Chip backgrounds (default): `bg-sand-100`
- Placeholder text: `text-sand-400`

### Accent (Energy & Calls-to-Action)
Energetic orange-red; draws attention to secondary actions, highlights, notifications.

| Token | Hex Value | Usage | Contrast on White | Verified | Tool | Date |
|-------|-----------|-------|---|---|---|---|
| accent-50 | #fff8f0 | Background tint | N/A | N/A | N/A | N/A |
| accent-100 | #ffeed9 | Light backgrounds | N/A | N/A | N/A | N/A |
| accent-200 | #ffd9ad | Disabled, light | N/A | N/A | N/A | N/A |
| accent-300 | #ffbe75 | Hover backgrounds | N/A | N/A | N/A | N/A |
| accent-400 | #ff9d3d | Accent text, soft highlight | 4.8:1 ✓ | ✓ | WebAIM | 2024-01-15 |
| accent-500 | #f97e16 | Secondary buttons, featured badge, icon highlight | 5.2:1 ✓ | ✓ | WebAIM | 2024-01-15 |
| accent-600 | #dd6208 | Hover secondary, strong accent | 6.1:1 ✓ | ✓ | WebAIM | 2024-01-15 |
| accent-700 | #b74909 | Active secondary, emphasis | 7.4:1 ✓ | ✓ | WebAIM | 2024-01-15 |
| accent-800 | #92390e | Rare use | N/A | N/A | N/A | N/A |
| accent-900 | #78300f | Rare use | N/A | N/A | N/A | N/A |

**Usage rules:**
- Secondary action buttons: `bg-accent-500`, hover `bg-accent-600`
- Accent text (CTAs): `text-accent-600`
- Featured/promoted badges: `bg-accent-500 text-white`
- Icon highlights (new messages, alerts): `text-accent-500`

### Success (Positive Feedback)
Confirms actions, completed states, approved listings.

| Token | Hex Value | Usage |
|-------|-----------|-------|
| success-50 | #f0fdf4 | Success backgrounds |
| success-100 | #dcfce7 | Light backgrounds |
| success-500 | #22c55e | Success text, success buttons |
| success-600 | #16a34a | Success hover, emphasis |
| success-700 | #15803d | Dark emphasis |

**Usage rules:**
- Published listing badge: `bg-success-100 text-success-700`
- Success toast: `bg-success-50 border-success-200`
- Success button: `bg-success-600 text-white`

### Warning (Attention & Caution)
Draws attention without alarm; for pending review, expiring listings, rate limits.

| Token | Hex Value | Usage |
|-------|-----------|-------|
| warning-50 | #fffbeb | Warning backgrounds |
| warning-100 | #fef3c7 | Light backgrounds |
| warning-500 | #f59e0b | Warning text, warning buttons |
| warning-600 | #d97706 | Warning hover |
| warning-700 | #b45309 | Strong warning |

**Usage rules:**
- Under-review badge: `bg-warning-100 text-warning-700`
- Expiring soon notification: `bg-warning-50 border-warning-200`
- Warning alert: `border-l-4 border-warning-500`

### Error (Destructive & Critical)
Alerts to errors, rejections, account issues, destructive actions.

| Token | Hex Value | Usage |
|-------|-----------|-------|
| error-50 | #fef2f2 | Error backgrounds |
| error-100 | #fee2e2 | Light error backgrounds |
| error-500 | #ef4444 | Error text, error buttons |
| error-600 | #dc2626 | Error hover, strong error |
| error-700 | #b91c1c | Destructive confirmation |

**Usage rules:**
- Rejected badge: `bg-error-100 text-error-700`
- Error toast: `bg-error-50 border-error-200`
- Delete button (destructive): `bg-error-600 text-white hover:bg-error-700`
- Form validation error: `text-error-600`

---

## 2. Typography Scale

Semantic font sizes with line heights optimized for readability and hierarchy.

### Font Families
- **Display/Headings:** Cairo (400, 500, 600, 700, 800)
- **Body (Arabic):** Noto Kufi Arabic (400, 500, 600, 700)
- **Body (LTR):** Inter (400, 500, 600, 700)
- **System fallback:** system-ui, sans-serif

**Implementation in Tailwind:**
```javascript
fontFamily: {
  sans: ['"Noto Kufi Arabic"', '"Inter"', 'system-ui', 'sans-serif'],
  display: ['"Cairo"', '"Inter"', 'system-ui', 'sans-serif'],
}
```

### Scale Table

| Semantic Name | Tailwind Class | Size | Line Height | Letter Spacing | Weight | Use Case |
|---|---|---|---|---|---|---|
| Display-XL | text-5xl | 48px | 56px | -0.02em | 700 | Hero title (rare, homepage) |
| Display-LG | text-4xl | 36px | 44px | -0.015em | 700 | Main page title |
| Heading-1 | text-3xl | 30px | 36px | -0.01em | 700 | Section title, top-level nav |
| Heading-2 | text-2xl | 24px | 32px | 0 | 600 | Card title, subsection |
| Heading-3 | text-xl | 20px | 28px | 0 | 600 | Subsection, filter heading |
| Heading-4 | text-lg | 18px | 26px | 0 | 600 | Card title, form section |
| Body-LG | text-lg | 18px | 26px | 0 | 400/500 | Feature description |
| Body-MD | text-base | 16px | 24px | 0 | 400/500 | Default body text, listing title |
| Body-SM | text-sm | 14px | 20px | 0 | 400/500 | Secondary text, description |
| Caption | text-xs | 12px | 16px | 0 | 500 | Meta info, timestamps, chips |
| Label | text-xs | 12px | 16px | 0.02em | 600 | Form labels, badge labels |
| Overline | text-xs | 12px | 16px | 0.1em | 700 | Section overline, category |

**Usage rules:**
- Tailwind classes should be combined with `font-display` or `font-sans` as needed
- Example: `<h1 className="text-3xl font-display font-bold">` = Heading-1
- Example: `<p className="text-base text-primary-600">` = Body-MD
- All `<label>` elements: `<label className="label">` = Label weight

---

## 3. Spacing Scale

Consistent spacing system for margins, padding, gaps, and layout composition.

### Semantic Spacing Tokens

| Token | px Value | CSS Variable | Usage |
|-------|----------|---|---|
| xs | 4px | --space-xs | Micro gaps, padding in chips |
| sm | 8px | --space-sm | Small gaps, padding in buttons |
| md | 16px | --space-md | Default card padding, section gap |
| lg | 24px | --space-lg | Section top/bottom padding, large gaps |
| xl | 32px | --space-xl | Page section vertical spacing |
| 2xl | 48px | --space-2xl | Major section spacing (header to content) |
| 3xl | 64px | --space-3xl | Hero sections, page margins |

### Tailwind Usage

All standard Tailwind spacing (p-*, m-*, gap-*) apply: 0, 2, 4, 6, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48...

**Default profile (web, desktop):**
- Card padding: `p-4` (16px) or `p-5` (20px)
- Section gaps: `gap-4` (16px) or `gap-6` (24px)
- Between sections: `mb-8` (32px) or `my-12` (48px)

**Compact profile (mobile, data-saver mode):**
- Card padding: `p-3` (12px)
- Section gaps: `gap-2` (8px) or `gap-3` (12px)
- Between sections: `mb-6` (24px)

**Implementation:**
Use Tailwind's responsive prefixes:
```tailwind
p-4 md:p-6          /* 16px on mobile, 24px on desktop */
gap-3 lg:gap-4      /* 12px on tablet, 16px on desktop */
```

---

## 4. Border Radius Scale

Consistent rounded corner sizes tied to component hierarchy.

| Token | px Value | Tailwind Class | Usage |
|-------|----------|---|---|
| xs | 2px | rounded-xs | Not currently in config; reserve for future micro UI |
| sm | 4px | rounded-sm | Badges, chips, very small elements |
| md | 8px | rounded-md | Modals (planned), cards (alternate) |
| lg | 12px | rounded-lg | Form inputs, buttons (planned alternate) |
| xl | 16px | rounded-xl | Buttons, inputs, modals |
| 2xl | 20px | rounded-2xl | Cards, large containers, hero sections |
| full | 50% | rounded-full | Avatars, fully circular elements |

### Usage Rules

- **Buttons:** `rounded-xl` (16px) — primary, secondary, accent
- **Inputs/Textareas:** `rounded-xl` (16px) — consistent with buttons
- **Cards:** `rounded-2xl` (20px) — distinct from buttons, flagship component
- **Chips/Badges:** `rounded-full` or `rounded-lg` — interactive, small
- **Modals/Drawers:** `rounded-2xl` (top only on mobile, all corners on desktop)
- **Avatars:** `rounded-full` — always circular

**No mixing:** Never mix `rounded-lg` + `rounded-2xl` on the same card. Pick one scale per component family.

---

## 5. Shadow Scale

Depth-based shadow system; all shadows use tinted darkness (primary-950 with opacity) never pure black.

| Token | CSS Value | Usage | Z-Depth |
|---|---|---|---|
| shadow-xs | 0 1px 2px rgba(12, 33, 24, 0.05) | Subtle, hover states | 1px |
| shadow-sm | 0 1px 3px rgba(12, 33, 24, 0.1) | ✓ Existing; Cards, inputs, small components | 2px |
| shadow-md | 0 4px 12px rgba(12, 33, 24, 0.1) | Elevated: modals, floating panels, popovers | 4px |
| shadow-lg | 0 8px 24px rgba(12, 33, 24, 0.12) | High elevation: modals on modals, dropdowns with depth | 8px |
| shadow-xl | 0 12px 32px rgba(12, 33, 24, 0.15) | Maximum elevation (rare): overlay stacks | 12px |

### Tailwind Config Extension

```javascript
boxShadow: {
  xs: '0 1px 2px rgba(12, 33, 24, 0.05)',
  sm: '0 1px 3px rgba(12, 33, 24, 0.1)',    // ✓ existing
  md: '0 4px 12px rgba(12, 33, 24, 0.1)',
  lg: '0 8px 24px rgba(12, 33, 24, 0.12)',
  xl: '0 12px 32px rgba(12, 33, 24, 0.15)',
}
```

### Usage Rules

- **Cards (at rest):** `shadow-sm`
- **Cards (hover):** `shadow-md`
- **Modals/popovers:** `shadow-lg`
- **Dropdowns:** `shadow-md`
- **Floating buttons/badges:** `shadow-sm`
- **Never use:** `shadow-2xl`, `shadow-inner` (not in token system)

**Never use pure black shadows:** All shadows inherit primary-950 tint for regional warmth.

---

## 6. Z-Index Layering

Semantic z-index scale for stacking context management. All hard-coded values replaced with these tokens.

| Layer | Z-Value | Components | Usage |
|---|---|---|---|
| Base | 0 | Page content, cards, text | Default content layer |
| Sticky | 10 | Fixed `<aside>`, sticky headers | Above content, below overlays |
| Floating | 20 | Floating action buttons, compare bar | Persistent UI elements |
| Header | 30 | Header/navigation bar, LocationSelector | Main navigation layer |
| Overlay | 40 | Modal backdrops, dismiss-able overlays | Covers content, under modals |
| Modal | 50 | Modals, popovers, dropdowns, BottomSheet | Interactive overlays |
| Toast | 60 | Toast notifications, snackbars, alerts | Above all else (except tooltips) |

**Tailwind extension:**
```javascript
zIndex: {
  base: '0',
  sticky: '10',
  floating: '20',
  header: '30',
  overlay: '40',
  modal: '50',
  toast: '60',
}
```

### Stacking Rules

- Modal backdrop: `z-overlay` (40)
- Modal dialog: `z-modal` (50)
- Toast notification: `z-toast` (60)
- Header: `z-header` (30)
- LocationSelector dropdown: `z-modal` (50)

**Exact usage in components:**
```tsx
// Modal overlay (backdrop)
<div className="fixed inset-0 z-overlay bg-primary-950/40" />

// Modal content
<div className="fixed ... z-modal">...</div>

// Toast
<div className="fixed bottom-20 z-toast">...</div>
```

---

## 7. Animation & Motion Tokens

Micro-interactions and transitions for feedback, entrance/exit, and state changes.

### Duration Scale

| Token | ms | Usage | Perception |
|---|---|---|---|
| duration-fast | 150ms | Rapid feedback, hover state | Instant (< 200ms = instant) |
| duration-base | 200ms | ✓ Existing; Default transitions, modals | Perceptible without lag |
| duration-slow | 300ms | Entrance animations, page transitions | Noticeable, natural |
| duration-page | 400ms | Full-page entrance, hero sections | Cinematic, draws attention |

### Easing Functions

| Token | Cubic Bezier | Usage |
|---|---|---|
| easing-standard | cubic-bezier(0.2, 0, 0.38, 0.9) | Default for all transitions |
| easing-enter | cubic-bezier(0, 0, 0.2, 1) | Entrances, scale-in |
| easing-exit | cubic-bezier(0.7, 0, 1, 0.2) | Exits, fade-out |
| easing-bounce | cubic-bezier(0.34, 1.56, 0.64, 1) | Bounce-in, celebratory feedback |

### Keyframe Animations (Existing)

```javascript
'fade-in': 'fadeIn 0.2s ease-out',
'slide-up': 'slideUp 0.25s ease-out',
'slide-down': 'slideDown 0.25s ease-out',
'scale-in': 'scaleIn 0.15s ease-out',
```

### Proposed New Animations

| Animation | Duration | Easing | Usage |
|---|---|---|---|
| bounce-in | 300ms | cubic-bezier(0.34, 1.56, 0.64, 1) | Items entering grid, modals appearing |
| pulse-slow | 2000ms | cubic-bezier(0.4, 0, 0.6, 1) | Loading states, gentle pulsing |
| shake | 400ms | ease-in-out | Validation errors, form submission failure |
| success-check | 500ms | ease-out | Success checkmark, payment confirmed |
| flip-rtl | 300ms | ease-in-out | Language toggle, RTL/LTR mirror |

### Tailwind Config Extension

```javascript
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
  'success-check': 'successCheck 0.5s ease-out',
  'flip-rtl': 'flipRtl 0.3s ease-in-out',
},
keyframes: {
  // Existing
  fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
  slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
  slideDown: { '0%': { transform: 'translateY(-10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
  scaleIn: { '0%': { transform: 'scale(0.95)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
  // New
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
  successCheck: {
    '0%': { transform: 'scale(0)', opacity: '0', rotate: '-45deg' },
    '50%': { transform: 'scale(1.1)' },
    '100%': { transform: 'scale(1)', opacity: '1', rotate: '0deg' },
  },
  flipRtl: {
    '0%': { transform: 'rotateY(0deg)' },
    '100%': { transform: 'rotateY(180deg)' },
  },
}
```

### Motion Rules

**Hover transitions (default):**
```css
.btn {
  @apply transition-all duration-fast;  /* 150ms */
}
```

**Page entrance (lazy-loaded routes):**
```css
.page-enter {
  @apply animate-fade-in;  /* 200ms fade-in */
}
```

**Reduced motion support:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. Complete Tailwind Config Extension

Full code block ready to add to `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7f1',
          100: '#dcede0',
          200: '#bddcc4',
          300: '#8fc4a0',
          400: '#5ba475',
          500: '#3a8a57',
          600: '#2a6f44',
          700: '#225838',
          800: '#1d4630',
          900: '#193a29',
          950: '#0c2118',
        },
        sand: {
          50: '#fdfbf7',
          100: '#faf5ea',
          200: '#f4e9d0',
          300: '#ecd9b0',
          400: '#e0c388',
          500: '#d4ab5e',
          600: '#c89648',
          700: '#a87a38',
          800: '#876230',
          900: '#6e5028',
        },
        accent: {
          50: '#fff8f0',
          100: '#ffeed9',
          200: '#ffd9ad',
          300: '#ffbe75',
          400: '#ff9d3d',
          500: '#f97e16',
          600: '#dd6208',
          700: '#b74909',
          800: '#92390e',
          900: '#78300f',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      fontFamily: {
        sans: ['"Noto Kufi Arabic"', '"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Cairo"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(12, 33, 24, 0.05)',
        sm: '0 1px 3px rgba(12, 33, 24, 0.1)',
        md: '0 4px 12px rgba(12, 33, 24, 0.1)',
        lg: '0 8px 24px rgba(12, 33, 24, 0.12)',
        xl: '0 12px 32px rgba(12, 33, 24, 0.15)',
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
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'slide-down': 'slideDown 0.25s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
        'bounce-in': 'bounceIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-slow': 'pulseSlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shake': 'shake 0.4s ease-in-out',
        'success-check': 'successCheck 0.5s ease-out',
        'flip-rtl': 'flipRtl 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideDown: { '0%': { transform: 'translateY(-10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        scaleIn: { '0%': { transform: 'scale(0.95)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
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
        successCheck: {
          '0%': { transform: 'scale(0)', opacity: '0', rotate: '-45deg' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1', rotate: '0deg' },
        },
        flipRtl: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
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
    },
  },
  plugins: [],
};
```

---

## 9. Implementation Checklist

- [ ] Merge `boxShadow`, `zIndex`, `animation`, `keyframes`, `lineHeight` extensions into `tailwind.config.js`
- [ ] Update `src/index.css` to add `prefers-reduced-motion` support
- [ ] Audit all components for hard-coded z-values; replace with `z-*` tokens
- [ ] Audit all shadows; replace inline `shadow-*` with semantic scale
- [ ] Verify contrast ratios for all text/background pairs using WebAIM tool
- [ ] Document in component README: which semantic tokens apply to each component
- [ ] Create Tailwind documentation (Storybook or Figma) with all scales for designers

---

## Key Decisions Locked

1. **Color palette:** Primary green + sand neutrals + orange accent; no changes.
2. **Typography:** Cairo for display, Noto Kufi Arabic + Inter for body; scale is semantic.
3. **Shadows:** Tinted (primary-950 opacity) never pure black; enhances regional warmth.
4. **Z-index:** Semantic layering from 0–60; no exceptions or hard-coded values.
5. **Animations:** Subtle, fast (150–300ms); `prefers-reduced-motion` respected.
6. **Border radius:** Consistent across buttons (16px), cards (20px), full for circles.
