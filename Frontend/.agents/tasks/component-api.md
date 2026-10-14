# MARBOU Frontend — Component API Reference

Complete specification for all UI components, including existing, planned, and specialized marketplace components. Each component documented with props, states, accessibility, RTL behavior, and usage examples.

---

## UI Component Library

### Base Components

#### Badge
**File:** `src/components/ui.tsx`

**Purpose:** Display small, non-interactive metadata labels (status, category, trust marker).

**Props:**
| Prop | Type | Default | Required | Description |
|---|---|---|---|---|
| children | ReactNode | — | Yes | Badge text content |
| variant | 'default' \| 'success' \| 'warning' \| 'error' \| 'primary' \| 'accent' \| 'info' | 'default' | No | Color semantic tied to meaning |

**States:**
- **Default:** `bg-sand-100 text-primary-600` — neutral metadata
- **Success:** `bg-success-100 text-success-700` — positive (published, verified)
- **Warning:** `bg-warning-100 text-warning-700` — attention (pending, expiring)
- **Error:** `bg-error-100 text-error-700` — negative (rejected, failed)
- **Primary:** `bg-primary-100 text-primary-700` — important
- **Accent:** `bg-accent-100 text-accent-700` — featured, highlighted
- **Info:** `bg-blue-100 text-blue-700` — informational (inactive, reserved)

**Accessibility:**
- Uses semantic HTML `<span>`
- If updating in real-time, wrap parent in `aria-live="polite"`
- Color not the only differentiator; includes text label
- Minimum contrast: 4.5:1 ✓ AA

**RTL Behavior:**
- Text automatically right-aligned in RTL via `dir="rtl"`
- No directional icons

**Example:**
```tsx
<Badge variant="success">Listed</Badge>
<Badge variant="warning">Under Review</Badge>
<Badge variant="error">Rejected</Badge>
```

---

#### Modal
**File:** `src/components/ui.tsx`

**Purpose:** Overlay dialog for focused interactions; confirms actions, displays forms, multi-step flows.

**Props:**
| Prop | Type | Default | Required | Description |
|---|---|---|---|---|
| open | boolean | — | Yes | Controls modal visibility |
| onClose | () => void | — | Yes | Callback when user dismisses (Escape, backdrop click) |
| children | ReactNode | — | Yes | Modal content |
| title | string | undefined | No | Header title; if omitted, no header bar |
| size | 'sm' \| 'md' \| 'lg' \| 'xl' | 'md' | No | Modal width breakpoint |

**States:**
- **Open:** Animated entrance with `animate-scale-in`, backdrop with `backdrop-blur-sm`
- **Closed:** Returns null (not rendered)
- **Overflow:** Content scrolls if `max-h-[90vh]` exceeded

**Sizes:**
| Size | Max Width | Tablet | Mobile |
|---|---|---|---|
| sm | 448px | 90% | 90% |
| md | 512px | 90% | 90% |
| lg | 896px | 90% | 90% |
| xl | 1280px | 90% | 90% |

**Accessibility:**
- Root: `role="dialog" aria-modal="true" aria-labelledby="title-id"`
- Close button: `aria-label="Close"`
- Focus trap (planned): prevent Tab outside modal, restore focus on close
- ESC key: closes modal

**RTL Behavior:**
- Close button positioned with `end-6` (not `right`)
- Text direction inherited from `document.dir`

**Example:**
```tsx
const [open, setOpen] = useState(false);
<>
  <button onClick={() => setOpen(true)}>Open Modal</button>
  <Modal open={open} onClose={() => setOpen(false)} title="Confirm Action">
    <p>Are you sure?</p>
    <div className="flex gap-3 mt-6">
      <button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
      <button className="btn-primary" onClick={() => { /* action */ setOpen(false); }}>Confirm</button>
    </div>
  </Modal>
</>
```

---

#### Toast
**File:** `src/components/ui.tsx`

**Purpose:** Non-blocking notification; auto-dismisses. For success, error, info feedback.

**Props:** Controlled by `AppContext`:
| Property | Type | Description |
|---|---|---|
| toast.type | 'success' \| 'error' \| 'info' | Icon and semantic color |
| toast.message | string | Toast text |
| duration | number (ms) | Auto-close delay (default: 3000ms) |

**States:**
- **Success:** Green checkmark icon, success-500 color
- **Error:** Red X icon, error-500 color
- **Info:** Blue info icon, primary-500 color

**Position:** Fixed bottom-20 (mobile), bottom-6 (desktop), horizontal center

**Accessibility:**
- Uses `aria-live="polite"` on parent (implicit in context)
- Auto-announces to screen readers
- No focus required; doesn't interrupt keyboard flow

**Example:**
```tsx
import { useApp } from '@/context/AppContext';

function MyComponent() {
  const { showToast } = useApp();
  
  const handleAction = () => {
    // ... action
    showToast({ type: 'success', message: 'Listing published!' });
  };
  
  return <button onClick={handleAction}>Publish</button>;
}
```

---

#### EmptyState
**File:** `src/components/ui.tsx`

**Purpose:** Display when no data available (zero search results, no favorites, no messages).

**Props:**
| Prop | Type | Required | Description |
|---|---|---|---|
| icon | ReactNode | Yes | Large icon (Lucide React or custom SVG) |
| title | string | Yes | Heading (e.g., "No listings found") |
| description | string | No | Subtitle for context |
| action | ReactNode | No | Call-to-action button/link |

**Layout:**
- Icon in circle (40px icon in 80px bg-sand-100 circle)
- Title below (heading-3, text-primary-700)
- Description below (body-sm, text-primary-400)
- Action button below (optional)

**Accessibility:**
- Icon is decorative; real content is text
- Title semantic: `<h3>` or captured in context

**Example:**
```tsx
<EmptyState
  icon={<Heart className="w-10 h-10" />}
  title="No favorites yet"
  description="Save listings to view them later"
  action={<Link to="/search" className="btn-primary">Start browsing</Link>}
/>
```

---

#### Skeleton
**File:** `src/components/ui.tsx`

**Purpose:** Placeholder while loading. Uses `animate-pulse` to indicate loading.

**Props:**
| Prop | Type | Default | Description |
|---|---|---|---|
| className | string | '' | Additional Tailwind classes (height, width) |

**Style:** `bg-sand-200/60 rounded-lg animate-pulse`

**Example:**
```tsx
{loading ? (
  <Skeleton className="h-48 w-full rounded-2xl" />
) : (
  <img src={image} />
)}
```

**Accessibility:**
- Decorative; no ARIA needed
- Typically not announced to screen readers (not interactive)

---

#### Breadcrumbs
**File:** `src/components/ui.tsx`

**Purpose:** Navigation context; shows hierarchy of current page within app structure.

**Props:**
| Prop | Type | Description |
|---|---|---|
| items | Array<{ label: string; onClick?: () => void }> | Breadcrumb path |

**Example:**
```tsx
<Breadcrumbs items={[
  { label: 'Home', onClick: () => navigate('/') },
  { label: 'Vehicles', onClick: () => navigate('/category/vehicles') },
  { label: 'Cars' }, // Current (no onClick)
]} />
```

**Output:** `Home / Vehicles / Cars` (with `/` as visual separator)

**Accessibility:**
- Root: `role="navigation"` (implicit in `<nav>`)
- Last item not a link (current page)

**RTL:** Gap direction reversed automatically

---

### Status & Rating Components

#### StatusBadge
**File:** `src/components/ui.tsx`

**Purpose:** Display listing status with localized label and semantic color.

**Props:**
| Prop | Type | Description |
|---|---|---|
| status | 'published' \| 'underReview' \| 'sold' \| 'rented' \| 'expired' \| 'archived' \| 'draft' \| 'pending' \| 'approved' \| 'rejected' | Listing status |

**Variants:**
- published → success (green)
- underReview, pending → warning (yellow)
- sold, rented, rejected → error/info (red/blue)
- expired, archived, draft → default (gray)

**Example:**
```tsx
<StatusBadge status="published" />  // Renders: "Published" in green
```

---

#### RatingStars
**File:** `src/components/ui.tsx`

**Purpose:** Display numeric rating (0–5) as star visualization.

**Props:**
| Prop | Type | Default | Description |
|---|---|---|---|
| rating | number | — | Rating value 0–5 (can be decimal) |
| size | 'sm' \| 'md' \| 'lg' | 'sm' | Star size: 14px, 16px, 20px |

**Styling:**
- Filled stars: `text-accent-400`
- Empty stars: `text-sand-200`

**Example:**
```tsx
<RatingStars rating={4.5} size="md" />  // 4.5 / 5 stars
```

---

#### TrustBadge
**File:** `src/components/ui.tsx`

**Purpose:** Indicate seller/business credibility: verified, top-rated, responsive, sponsored.

**Props:**
| Prop | Type | Description |
|---|---|---|
| type | 'verified' \| 'topRated' \| 'responsive' \| 'sponsored' | Badge type |

**Variants:**
- verified: Primary badge with checkmark
- topRated: Accent badge with star
- responsive: Success badge with info icon
- sponsored: Accent badge (no icon)

**Example:**
```tsx
<TrustBadge type="verified" />
<TrustBadge type="topRated" />
```

---

### Layout Components

#### AppShell (Header + BottomNav + Navigation)
**File:** `src/components/AppShell.tsx`

**Purpose:** Global layout wrapper; persistent header, bottom navigation (mobile), sidebar (desktop/admin).

**Structure:**
```
┌─────────────────────────────────────┐
│ Header (Logo, Search, Location)     │  z-header (30)
├─────────────────────────────────────┤
│                                     │
│  Page Content                       │
│  (RouteProvider renders here)       │
│                                     │
├─────────────────────────────────────┤
│ BottomNav (Mobile only)             │  z-sticky (10)
└─────────────────────────────────────┘
```

**Sub-components:**

**Logo:** Links to home, SVG icon + "MARBOU" text

**LocationSelector:** Dropdown showing Sudan cities/areas
- Current selection shown as: `Khartoum - Jabrein`
- On click: dropdown with city groups and areas
- Selection persists in `AppContext.location`
- Z-level: `z-modal` (50) when open

**LangSwitch:** Button to toggle language AR ↔ EN
- Display: Shows "EN" or "ع" (Arabic glyph)
- On click: toggles i18n context, re-renders page

**DemoRoleSwitcher:** Dropdown to switch demo roles (buyer/business/admin) — for prototyping only, not in production

**Header Search:** Search input with location/category filters

**BottomNav (Mobile):** 
- Icons: Home, Search, + Add Listing, Messages, Account
- Active tab highlighted in primary-600
- Always visible, sticky

---

## Marketplace-Specific Components (Existing + Planned)

### ListingCard
**File:** `src/components/ListingCard.tsx`

**Purpose:** Display single listing in grid/list view with image, price, seller info.

**Props:**
| Prop | Type | Required | Description |
|---|---|---|---|
| listing | Listing | Yes | Listing data object |
| layout | 'grid' \| 'list' | 'grid' | Display layout |
| dataSaver | boolean | false | Skip images, show placeholder |
| onClick | () => void | No | Callback on card click |

**States:**
- **Default:** Shows image, price, title, seller name
- **Hover:** Shadow elevation, subtle scale
- **Data-Saver:** Gradient placeholder (category color) instead of image
- **Loading:** Skeleton card

**Image Handling:**
- Grid: 300×225px aspect ratio
- List: 80×80px thumbnail on left
- Lazy loading with `loading="lazy"`
- Error state: Sand-200 placeholder

**Accessibility:**
- Card is clickable; implement as `<button role="link">` or `<a>`
- Image has alt text: "Listing: {title}"
- Price announced: `{price} SDG`

**RTL:** Price alignment right-justified in RTL; "From {seller}" reordered

**Example:**
```tsx
<ListingCard listing={listing} layout="grid" onClick={() => navigate(`/listing/${listing.id}`)} />
```

---

### CategoryTile (Planned)
**Purpose:** Display category option in category grid; on homepage, search filters.

**Props:**
| Prop | Type | Description |
|---|---|---|
| category | Category | Category data (name, icon, ID) |
| featured | boolean | Highlight as featured (accent border) |
| onClick | () => void | Navigate to category |

**States:**
- Default: Icon + label, `bg-sand-100` background
- Featured: Accent border, slight shadow
- Hover: `bg-sand-200`, shadow elevation

---

### SearchBar (Planned)
**Purpose:** Keyword search with suggestion dropdown and filters.

**Props:**
| Prop | Type | Description |
|---|---|---|
| onSearch | (query: string) => void | Callback on search submit |
| suggestions | string[] | Autocomplete suggestions |
| showFilters | boolean | Show filter toggle button |

**Features:**
- Text input with debounced suggestions
- Keyboard: Enter to search, Esc to close suggestions
- Accessibility: Combobox pattern (`role="combobox"`, `aria-expanded`, `aria-controls`)

---

### FilterPanel (Planned)
**Purpose:** Dynamic filters for search results (price range, location, category-specific fields).

**Props:**
| Prop | Type | Description |
|---|---|---|
| filters | FilterDefinition[] | Available filters to display |
| values | Record<string, any> | Current selected values |
| onChange | (values: Record<string, any>) => void | Callback on filter change |

**Components:**
- PriceRangeSlider
- CheckboxGroup (multi-select)
- RadioGroup (single-select)
- LocationPicker (city/area cascade)

---

### PriceInput (Planned)
**Purpose:** Numeric input for prices with currency selector and formatting.

**Props:**
| Prop | Type | Description |
|---|---|---|
| value | number | Price value |
| onChange | (value: number) => void | Callback on change |
| currency | string | Currency code (default: SDG) |
| onCurrencyChange | (currency: string) => void | On currency select |
| min | number | Minimum price |
| max | number | Maximum price |

**Features:**
- Thousands separator (1,500,000 SDG)
- Currency dropdown (SDG, EGP, AED)
- Validation: non-negative, <= max

---

### PhoneInput (Planned)
**Purpose:** Phone number input with Sudan country code (+249) prefix and validation.

**Props:**
| Prop | Type | Description |
|---|---|---|
| value | string | Phone number (stored as +249XXX...) |
| onChange | (value: string) => void | Callback |
| country | string | Country code (default: SD) |
| onCountryChange | (country: string) => void | On country select |

**Features:**
- Shows +249 prefix
- Formats as: +249 XX XXX XXXX
- Validates Sudanese phone format

---

### LocationPicker (Planned)
**Purpose:** Cascade dropdown for Sudan cities and areas.

**Props:**
| Prop | Type | Description |
|---|---|---|
| value | { cityId: string; areaId: string } | Selected city/area |
| onChange | (value: ...) => void | On selection |

**UI:**
- City dropdown → Area dropdown
- Both required
- Shows full path: "Khartoum - Jabrein"

---

### MediaUploader (Planned)
**Purpose:** Upload images/videos with drag-drop, preview, progress, and retry.

**Props:**
| Prop | Type | Description |
|---|---|---|
| onUpload | (files: File[]) => void | Files selected |
| maxFiles | number | Max concurrent uploads |
| maxSize | number | Max file size (bytes) |
| accept | string | Accepted MIME types |
| progress | Record<string, number> | Upload progress per file ID (0–100) |
| errors | Record<string, string> | Error messages per file |

**States:**
- Idle: Drag-drop zone with icon + text
- Uploading: Progress bars with percentage
- Success: Checkmark + file preview
- Error: Error message + retry button

**Features:**
- Drag-drop support
- Thumbnail preview
- Progress indication
- Retry on failure
- Image compression on client (optional)

---

### ListingQualityMeter (Planned)
**Purpose:** Show listing completeness percentage; visual indicator + breakdown.

**Props:**
| Prop | Type | Description |
|---|---|---|
| listing | Listing | Listing to analyze |
| detailed | boolean | Show breakdown modal |

**Display:**
- Progress bar: 0–100%
- Label: "Your listing is 85% complete"
- Missing fields: Title, Description, Price, Location...

---

### SyncStatusBar (Planned)
**Purpose:** Show upload/sync state for offline drafts and slow connections.

**States:**
- Saved Locally: "Saved locally" + clock icon
- Waiting for Connection: "Waiting for connection..." + spinner
- Uploading: "Uploading..." + progress bar
- Saved: "Saved" + checkmark (auto-dismiss)
- Upload Failed: "Upload failed" + retry button

**Position:** Fixed top-20 (below header), auto-dismiss on success

---

### NegotiationThread (Planned)
**Purpose:** Display negotiation messages: offer, counter-offer, accept/reject.

**Props:**
| Prop | Type | Description |
|---|---|---|
| negotiation | Negotiation | Negotiation data |
| onRespond | (action: 'accept' \| 'reject' \| 'counter', amount?: number) => void | Callback |

---

### BusinessProfileHeader (Planned)
**Purpose:** Display business/seller banner: logo, cover, name, rating, info.

**Props:**
| Prop | Type | Description |
|---|---|---|
| business | Business | Business data |
| onFollow | () => void | Follow button callback |
| onContact | () => void | Message/call callback |

---

### JobCard (Planned)
**Purpose:** Job listing card showing employer, title, salary, location, type.

**Props:**
| Prop | Type | Description |
|---|---|---|
| job | Job | Job listing data |
| onClick | () => void | Navigate to detail |

---

### ServiceCard (Planned)
**Purpose:** Service listing card; similar to JobCard.

---

### ReviewStars (Planned)
**Purpose:** Interactive star rating input for reviews (unlike RatingStars which is read-only).

**Props:**
| Prop | Type | Description |
|---|---|---|
| value | number | Current rating |
| onChange | (rating: number) => void | On star click |
| size | 'sm' \| 'md' \| 'lg' | Star size |

---

### CompareTable (Planned)
**Purpose:** Side-by-side vehicle/real estate/electronics comparison.

**Props:**
| Prop | Type | Description |
|---|---|---|
| items | Item[] | Items to compare (max 4) |
| fields | string[] | Fields to show |
| onRemove | (itemId: string) => void | Remove item |

**Features:**
- Horizontal scroll on mobile
- Highlight differences
- Star favorite items
- Share comparison

---

### InfiniteScrollList (Planned)
**Purpose:** List that loads more items as user scrolls near bottom.

**Props:**
| Prop | Type | Description |
|---|---|---|
| items | T[] | Current items |
| onLoadMore | () => Promise<void> | Fetch next batch |
| hasMore | boolean | More items available |
| isLoading | boolean | Currently loading |

**Features:**
- Intersection Observer for scroll detection
- Loading spinner at bottom
- Auto-loads when near bottom

---

### PaginatedList (Planned)
**Purpose:** Paginated list; explicit page navigation (preferred for searchable tables/admin).

**Props:**
| Prop | Type | Description |
|---|---|---|
| items | T[] | Current page items |
| page | number | Current page |
| totalPages | number | Total page count |
| onPageChange | (page: number) => void | Navigate page |

---

### NotificationBell (Planned)
**Purpose:** Bell icon with unread count badge in header.

**Props:**
| Prop | Type | Description |
|---|---|---|
| unreadCount | number | Unread notification count |
| onClick | () => void | Navigate to notifications |

---

### ConfirmDialog (Planned)
**Purpose:** Specialized modal for confirmations; title + message + OK/Cancel buttons.

**Props:**
| Prop | Type | Description |
|---|---|---|
| open | boolean | Visibility |
| title | string | Confirmation title |
| message | string | Body text |
| confirmLabel | string | OK button text |
| cancelLabel | string | Cancel button text |
| onConfirm | () => void | OK callback |
| onCancel | () => void | Cancel callback |
| variant | 'default' \| 'danger' | Confirm button color |

---

### BottomSheet (Planned)
**Purpose:** Mobile-focused slide-up modal from bottom; not full-screen, sticky footer actions.

**Props:**
| Prop | Type | Description |
|---|---|---|
| open | boolean | Visibility |
| onClose | () => void | Dismiss callback |
| title | string | Optional header |
| children | ReactNode | Content |
| actions | ReactNode | Sticky footer buttons |

**Example:** Filter panel, sort options, media picker on mobile

---

### Drawer (Planned)
**Purpose:** Desktop sidebar; animated slide-in from left (or right in RTL).

**Props:**
| Prop | Type | Description |
|---|---|---|
| open | boolean | Visibility |
| onClose | () => void | Dismiss callback |
| side | 'left' \| 'right' | Slide direction |
| children | ReactNode | Drawer content |

**Usage:** Admin sidebar, user menu, advanced filters

---

## Form Components (Planned)

### TextInput
Input with label, error state, character counter.

### TextArea
Multi-line input with character limit, live counter, auto-resize.

### Select
Dropdown with optional search, keyboard navigation, accessibility.

### SelectMulti
Multi-select with tags, remove buttons, search.

### Checkbox & CheckboxGroup
Accessible checkboxes, group container.

### Radio & RadioGroup
Radio buttons in group, single-select pattern.

### FileUpload
Drag-drop, file preview, size validation.

### DatePicker
Mobile-friendly date selector; calendar or native input.

---

## Implementation Checklist

### Existing Components
- [ ] AppShell: Ensure all sub-components follow token system
- [ ] ListingCard: Add `dataSaver` prop behavior
- [ ] Toast/Modal: Add focus trap and keyboard handling
- [ ] StatusBadge: Verify all status variants are covered

### Planned Components
- [ ] Create Base form component library (TextInput, TextArea, Select, etc.)
- [ ] Create CategoryTile, SearchBar, FilterPanel
- [ ] Create MediaUploader with progress and retry
- [ ] Create Comparison and detail-view components
- [ ] Create specialized modals (ConfirmDialog, BottomSheet)
- [ ] Add @radix-ui/react-dialog or headless-ui for accessible dialog primitives
- [ ] Document all components in Storybook or Figma

---

## Memoization Boundaries

Components that should be wrapped with `React.memo`:
- ListingCard (expensive DOM, many instances)
- CategoryTile (many in grid)
- JobCard, ServiceCard
- Chip/Filter components
- Breadcrumbs (stable props typically)

Components that should NOT be memoized (premature optimization):
- Layout wrappers (AppShell, Page containers)
- Text-heavy cards (rare re-renders benefit from fresh content)
- Single-instance modals (no render frequency gain)

---

## Accessibility Standards

Every component must meet:
- **WCAG AA:** Minimum 4.5:1 contrast for text
- **Touch targets:** 44×44px on mobile
- **Keyboard:** Tab, Enter, Esc, arrow keys where applicable
- **ARIA:** Proper roles, labels, and live regions
- **Focus:** Visible `:focus-visible` outline, not removed

---

## RTL Implementation

Every component must:
- Use logical properties (`start`/`end` not `left`/`right`)
- Support `lang` attribute for font switching
- Announce direction changes to screen readers
- Test with `dir="rtl"` and Arabic content

---

**Last Updated:** Design Phase  
**Status:** LOCKED for implementation
