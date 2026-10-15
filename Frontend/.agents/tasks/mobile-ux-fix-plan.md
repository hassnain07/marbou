# Mobile UX Fix Implementation Plan

**Scope:** Fix 7 critical UX/responsiveness issues on mobile (375px), tablet (768px), and desktop (1024px+) viewports.

---

## 1. Header Overflow & Mobile Navigation Restructuring

**What to do:**
Refactor `AppShell.tsx` header to eliminate horizontal scroll on mobile (375px). On mobile: show only Logo + Search icon + Notifications icon + Account icon (if logged in). Move all duplicate functionality to sticky bottom nav (Search, Messages, Home, Account, Add Listing). Remove crowding and apply strict overflow-hiding styles. Desktop header (md:) keeps full navigation intact.

**Files to modify:**
- `src/components/AppShell.tsx`

**Detailed changes:**

### Header Component (mobile-first):
1. **Logo:** Keep but reduce size on mobile (w-7 h-7 instead of w-9 h-9). Hide text on mobile (`hidden sm:block`).
2. **Hide on mobile, show on desktop:**
   - LocationSelector: `hidden md:block`
   - CategoryMenu: `hidden lg:block` (move to compact mobile icon-only version if needed)
   - Full search bar: Replace with `Search` icon button on mobile that opens a modal/temporary expanded search; keep full search on md+
   - LangSwitch: Compress to `hidden sm:flex`
   - DemoRoleSwitcher: `hidden sm:block` (show simplified version or hide entirely on mobile)
   - NetworkStatusControl: `hidden sm:block`
   - Login button: `hidden sm:flex`

3. **Mobile optimized actions (always visible):**
   - Search icon (opens modal or expands inline) instead of full search bar
   - Notifications icon (Bell) with badge
   - Messages icon (MessageSquare) with badge — move to bottom nav instead; hide from header on mobile
   - Account icon (User) - link to /account (if logged in, show avatar; if not, show login link)

4. **Header wrapper CSS:**
   - Add `overflow-x-hidden` to header and main flex container
   - Apply `whitespace-nowrap` only to absolutely necessary elements
   - Ensure all flex gaps are responsive: `gap-1 sm:gap-2 lg:gap-4`
   - Use `shrink-0` on logo and action icons to prevent flex shrinking
   - Apply `max-w-full` to search input and prevent it from expanding beyond container

5. **Remove/fix overflow-causing elements:**
   - Ensure no child element has `flex-grow` that isn't constrained
   - Set all dropdowns to `position: absolute` with `z-50` and overflow handling
   - Apply `no-scrollbar` class to any overflow-x-auto sections

### BottomNav Adjustments (mobile only, md:hidden):
- Keep existing structure: Home, Search, Add Listing (+), Messages, Account
- Ensure all 5 items fit without scrolling at 375px width
- Each icon should be sized: `w-5 h-5` or `w-6 h-6` for the center FAB
- Add bottom-safe-area padding if on devices with notches/home indicators

**Verification:**
```bash
# Visual inspection at these breakpoints:
# 375px (mobile), 768px (tablet), 1024px (desktop)
# Check: no horizontal scroll on any viewport
# Check: all header items visible and clickable on mobile
# Check: sticky bottom nav works, all 5 items fit without scroll
# Check: desktop header shows full nav including Categories, Location, full Search
npm run dev  # or build command
# Open DevTools, test responsive mode at 375px
```

---

## 2. Header Styling & Professional Layout

**What to do:**
Clean up header CSS and spacing. Ensure professional appearance: proper icon sizing consistency, clear visual hierarchy, no wrapping, proper alignment on all viewports. Use the Marbou color palette (Primary Green #214E3D, Light Green #00B85A, etc.). Apply consistent padding and gaps.

**Files to modify:**
- `src/components/AppShell.tsx` (Header, LocationSelector, LangSwitch, DemoRoleSwitcher, NetworkStatusControl, CategoryMenu functions)
- Possibly add/update Tailwind custom classes in global CSS if needed

**Detailed changes:**

1. **Header container:**
   - Add `px-3 sm:px-4 lg:px-6` for responsive padding
   - Set `h-14 sm:h-16` for responsive height (was `h-14 sm:h-16` — keep as is)
   - Ensure `flex items-center` with proper vertical centering
   - Ensure `overflow-x-hidden` and `overflow-y-visible`

2. **Logo section:**
   - Keep as first flex item with `shrink-0`
   - Icon size: `w-8 h-8` (was `w-9 h-9`)
   - Brand text: only show on `sm:` breakpoint

3. **Search bar (desktop only md:):**
   - Keep `max-w-xl` and `flex-1` on md+
   - On mobile: replace with icon-only Search button (no full input)

4. **Icon sizes and spacing:**
   - All standalone icons: `w-5 h-5` (consistent)
   - FAB icon (Add Listing): `w-6 h-6`
   - Dropdown icons (ChevronDown): `w-3.5 h-3.5`
   - Apply `p-2 rounded-lg` or `p-1.5 rounded-lg` for button padding (not flex gaps)

5. **Action buttons area (right side):**
   - Use `flex items-center gap-1 sm:gap-2 lg:gap-3 shrink-0` for the actions container
   - Apply `hidden sm:flex` or similar breakpoint hiding per item
   - Ensure all buttons have consistent hover states: `hover:bg-primary-50 transition-colors`

6. **Dropdown styling:**
   - Ensure dropdowns have `position: absolute`, `z-50`, `top-full mt-1`
   - Add rounded corners: `rounded-xl`
   - Add borders: `border border-sand-100`
   - Add shadows: `shadow-xl`
   - Add animations: `animate-slide-down` (ensure this exists in Tailwind config)
   - Overlay behind: `fixed inset-0 z-40` with click handler to close

7. **Color consistency:**
   - Primary text: `text-primary-700` or `text-primary-600`
   - Hover effects: `hover:text-primary-800` or `hover:bg-primary-50`
   - Icons: `text-primary-400` default, `text-primary-600` on hover
   - Badges/badges: use accent or success colors as per design

**Verification:**
```bash
# Visual inspection:
# 1. Open at 375px: header items do not wrap or overflow
# 2. Open at 768px: some items may be hidden, others visible
# 3. Open at 1024px+: full header visible with all controls
# 4. Check all hover states work
# 5. Check all dropdowns open/close smoothly
npm run dev
# Test in DevTools at each breakpoint
```

---

## 3. Account Pages Responsiveness

**What to do:**
Fix AccountPage.tsx to be fully responsive on mobile (375px). Sidebar should become a horizontal scrollable tab bar or select dropdown on mobile. Tabs should wrap or scroll. Forms should go full-width. Content should stack vertically with proper spacing. Test at 375px, 768px, 1024px.

**Files to modify:**
- `src/pages/AccountPage.tsx`

**Detailed changes:**

1. **Sidebar on mobile (hidden md:block):**
   - Current: `hidden md:block w-56 shrink-0` — this is correct, sidebar hidden on mobile
   - On mobile: replace with a `md:hidden` select dropdown or horizontal tab bar

2. **Mobile tab selector (currently exists, refactor it):**
   - Current has: `<select>` for mobile — keep this but improve styling
   - Apply full-width: `w-full` or `w-full max-w-md`
   - Make it look better with custom styling or replace with horizontal scrollable tabs
   - Option A (keep select): add better spacing and styling
   - Option B (replace with tabs): create a horizontal scrollable tab bar with left/right arrows on mobile

   **Recommendation: Use horizontal scrollable chip-style tabs on mobile**
   - Create a `flex gap-2 overflow-x-auto no-scrollbar` container
   - Each tab: `chip-active` or `chip-default` classes
   - This is more visual and consistent with the design

3. **Layout grid:**
   - Change `flex gap-6` to responsive: `flex flex-col md:flex-row gap-4 md:gap-6`
   - This stacks sidebar and content on mobile

4. **Content area:**
   - Already has `flex-1 min-w-0` — this is good
   - Ensure all forms and cards inside are `w-full` (they likely are)
   - Check that no card or form has fixed width on mobile

5. **Grid inside content sections:**
   - Example: `grid grid-cols-2 sm:grid-cols-4 gap-3` in overview — keep as is, it's already responsive
   - Check all other grids for similar responsive design

6. **Profile card / form sections:**
   - Check `card p-6` — on mobile should be `card p-4 sm:p-6`
   - Max-width: `max-w-2xl` should be full on mobile, constrained on desktop — add responsive: `w-full max-w-2xl`

7. **My listings section:**
   - Flex buttons at top: check they're responsive with `flex flex-wrap md:flex-nowrap` or similar
   - Listing items in grid/list: ensure responsive

8. **Specific fixes for known issues:**
   - Tabs area: Make it horizontally scrollable with `overflow-x-auto no-scrollbar` (already exists)
   - Forms: ensure inputs are `w-full`
   - Action buttons: stack on mobile or wrap, e.g., `flex flex-col sm:flex-row gap-2`

**Verification:**
```bash
# Test at exactly these viewports:
# 375px (iPhone SE): no overflow, all tabs/forms visible and usable
# 768px (iPad): sidebar hidden, content full width, responsive
# 1024px (desktop): sidebar visible, layout correct
npm run dev
# Use DevTools responsive mode
# Test: AccountPage tab switching, form filling, scrolling on small screens
```

---

## 4. Auto-Translate Titles (Bidirectional)

**What to do:**
In AddListingPage.tsx (or DynamicForm if it's used), when user types in English title, auto-populate Arabic title with a simple mock translation/transliteration. Vice versa for Arabic → English. Use debounce to avoid performance issues. Add visual indicator like "(auto)" suffix or light text note. Bidirectional: if user clears one, clear the other (or let them edit manually).

**Files to modify:**
- `src/pages/AddListingPage.tsx`

**Detailed changes:**

1. **English title input (Step 2):**
   - Current: `<input value={title} onChange={(e) => setTitle(e.target.value)} />`
   - Wrap onChange with debounced auto-translate logic
   - When title changes (and is not empty), call `translateToArabic(title)` and set `titleAr`

2. **Arabic title input (Step 2):**
   - Current: `<input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} />`
   - Similar debounced logic: when titleAr changes, call `translateToEnglish(titleAr)` and set `title`

3. **Create translation functions:**
   ```typescript
   // Mock implementation - can be enhanced later
   const translateToArabic = (english: string): string => {
     // Simple mock: just add "(auto)" suffix or use a word-map
     // For now, just prefix/suffix to indicate auto-translation
     // In production, this would call a real API or use a library
     const mockMap: Record<string, string> = {
       'car': 'سيارة',
       'house': 'بيت',
       'phone': 'هاتف',
       'laptop': 'كمبيوتر',
       // ... add more as needed
     };
     const words = english.toLowerCase().split(' ');
     const translated = words.map(w => mockMap[w] || w).join(' ');
     return translated + ' (تلقائي)'; // "(auto)" in Arabic
   };

   const translateToEnglish = (arabic: string): string => {
     // Remove "(auto)" marker if present
     let text = arabic.replace(' (تلقائي)', '').trim();
     // Add reverse mock map if needed
     return text + ' (auto)';
   };
   ```

4. **Debounce implementation:**
   - Use a simple `useEffect` with `setTimeout` for debounce
   - Or import `useCallback` and implement manual debounce
   - Debounce delay: 300-500ms

   ```typescript
   const [titleDebounce, setTitleDebounce] = useState<NodeJS.Timeout | null>(null);

   const handleTitleChange = (value: string) => {
     setTitle(value);
     if (titleDebounce) clearTimeout(titleDebounce);
     setTitleDebounce(
       setTimeout(() => {
         if (value && !titleAr.includes('(')) { // Don't override manual edits
           setTitleAr(translateToArabic(value));
         }
       }, 300)
     );
   };
   ```

5. **UI/UX indicators:**
   - Add help text below each input: "Auto-translated from [other language]"
   - Or add a small info icon with tooltip
   - Styling: `text-[11px] text-primary-300` for the helper text

6. **Allow manual override:**
   - If user manually edits an auto-translated field, disable further auto-translation for that field
   - Track state: `titleArManuallyEdited` boolean
   - Only auto-translate if the field is still marked as auto

**Verification:**
```bash
# Test flow:
# 1. Go to /add-listing, proceed to Step 2 (enter details)
# 2. Type "laptop" in English title
# 3. Wait 300ms, Arabic title should populate with mock translation
# 4. Clear English title, Arabic should clear or show a note
# 5. Type in Arabic title, English should auto-populate
# 6. User can manually override and edit either field
npm run dev
# Open add-listing page, test title auto-translation
```

---

## 5. Draggable Images in Media Uploader

**What to do:**
Make images in the upload grid draggable to reorder using HTML5 Drag and Drop API (no new libraries). Show a GripVertical drag handle on each image. Provide visual feedback: opacity change during drag, highlight drop target. Update array order on drop.

**Files to modify:**
- `src/components/MediaUploader.tsx`

**Detailed changes:**

1. **Add drag-and-drop state:**
   ```typescript
   const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
   const [dropTarget, setDropTarget] = useState<number | null>(null);
   ```

2. **Implement drag handlers for each image:**
   - `onDragStart`: Set `draggedIndex`, store dataTransfer info
   - `onDragOver`: Show drop target highlight, `preventDefault()` to allow drop
   - `onDragLeave`: Clear drop target highlight
   - `onDrop`: Reorder array, update state
   - `onDragEnd`: Clear dragged/drop states

   ```typescript
   const handleImageDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
     setDraggedIndex(index);
     e.dataTransfer.effectAllowed = 'move';
     e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
   };

   const handleImageDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
     e.preventDefault();
     e.dataTransfer.dropEffect = 'move';
     setDropTarget(index);
   };

   const handleImageDragLeave = () => {
     setDropTarget(null);
   };

   const handleImageDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
     e.preventDefault();
     e.stopPropagation();
     if (draggedIndex !== null && draggedIndex !== dropIndex) {
       const newPhotos = [...photos];
       const [draggedPhoto] = newPhotos.splice(draggedIndex, 1);
       newPhotos.splice(dropIndex, 0, draggedPhoto);
       onPhotosChange(newPhotos);
       // If cover was the dragged photo, update cover index
       if (coverIndex === draggedIndex) {
         onCoverChange(dropIndex);
       } else if (coverIndex > draggedIndex && coverIndex <= dropIndex) {
         onCoverChange(coverIndex - 1);
       } else if (coverIndex < draggedIndex && coverIndex >= dropIndex) {
         onCoverChange(coverIndex + 1);
       }
     }
     setDraggedIndex(null);
     setDropTarget(null);
   };

   const handleImageDragEnd = () => {
     setDraggedIndex(null);
     setDropTarget(null);
   };
   ```

3. **Apply draggable and styling to image cards:**
   - Add `draggable={true}` to the image div
   - Add `onDragStart`, `onDragOver`, `onDragLeave`, `onDrop`, `onDragEnd` handlers
   - Add CSS classes for visual feedback:
     - `opacity-50` if `draggedIndex === i`
     - `ring-2 ring-primary-400 ring-dashed` if `dropTarget === i`
     - `cursor-grab` on hover, `cursor-grabbing` during drag

   ```typescript
   <div
     key={i}
     draggable={true}
     onDragStart={(e) => handleImageDragStart(e, i)}
     onDragOver={(e) => handleImageDragOver(e, i)}
     onDragLeave={handleImageDragLeave}
     onDrop={(e) => handleImageDrop(e, i)}
     onDragEnd={handleImageDragEnd}
     className={`relative aspect-square rounded-xl overflow-hidden border border-sand-100 group ${
       draggedIndex === i ? 'opacity-50' : ''
     } ${dropTarget === i ? 'ring-2 ring-primary-400 ring-dashed' : ''} cursor-grab active:cursor-grabbing transition-all`}
   >
   ```

4. **Visual feedback for drag handle:**
   - The `GripVertical` icon is already there (hidden on hover)
   - Make it visible during drag: `opacity-100 group-hover:opacity-100`
   - Change color on drag: `text-white drop-shadow` during drag state
   - Add subtle animation: `animate-pulse` if needed

5. **Alert/hint text:**
   - The blue alert box saying "Drag to reorder" already exists
   - Ensure it's visible when photos are present

**Verification:**
```bash
# Test flow:
# 1. Go to /add-listing, proceed to Step 3 (add photos)
# 2. Add 3+ images
# 3. Hover over an image, see GripVertical icon
# 4. Click and drag image to a new position
# 5. Visual feedback: dragged image becomes semi-transparent, target shows ring
# 6. Drop the image, array reorders
# 7. Cover image index updates correctly if cover was moved
npm run dev
# Go to add-listing, test image dragging
```

---

## 6. Uniform Recently Viewed Cards

**What to do:**
Fix image sizing in recently viewed and similar listing cards (ListingDetailPage.tsx, HomePage.tsx, AccountPage.tsx) to have fixed aspect-ratio. All cards must use `aspect-ratio: 4/3` or `aspect-ratio: 1/1` with `object-fit: cover` so different source image sizes never cause different card heights. This ensures uniform card appearance.

**Files to modify:**
- `src/components/marketplace/ListingCard.tsx` (main file, likely already correct)
- `src/pages/ListingDetailPage.tsx` (recently viewed and similar listings sections)
- `src/pages/HomePage.tsx` (various listing card grids)
- `src/pages/AccountPage.tsx` (recently viewed section)

**Detailed changes:**

1. **ListingCard.tsx (primary component):**
   - Check current: `aspect-[4/3]` — this is correct
   - Ensure all images have `object-fit: cover` — already present
   - Verify this is used everywhere

2. **ListingDetailPage.tsx:**
   - Line with recently viewed section:
     ```typescript
     <Link key={l.id} to={`/listing/${l.id}`} className="min-w-[180px] sm:min-w-[220px]">
       <ListingCard listing={l} />
     </Link>
     ```
     — This uses ListingCard, so should be correct
   - Similar listings: same pattern
   - **Check:** In the "Similar listings" and "Recently viewed" sections, ensure all image containers have fixed aspect-ratio

3. **HomePage.tsx:**
   - All sections use `<ListingCard listing={l} />` — should be correct
   - Double-check the hero section and any other custom image rendering
   - All should already be using ListingCard

4. **AccountPage.tsx:**
   - Overview section: recently viewed cards
     ```typescript
     <div className="aspect-[4/3] bg-sand-100">
       {l.images[0] && <img src={l.images[0]} alt="" className="w-full h-full object-cover" loading="lazy" />}
     </div>
     ```
     — This is correct, has aspect ratio and object-fit
   - Ensure consistency across all image containers in account page

5. **Verification of aspect ratio consistency:**
   - ListingCard grid view: `aspect-[4/3]` ✓
   - ListingCard list view: `w-40 sm:w-56 h-40` — check this matches 4/3 ratio (56/40 = 1.4, 4/3 = 1.33) — **slightly off, should be `h-42` for 56px width**
   - Recently viewed horizontal scrolls: check aspect ratio
   - Hero images: check aspect ratio

6. **Fix list layout image size if needed:**
   - Current: `w-40 sm:w-56 h-40`
   - For 4/3 ratio:
     - w-40 (160px) → h should be 120px (160 * 3/4)
     - sm:w-56 (224px) → h should be 168px (224 * 3/4)
   - Change to: `w-40 h-30 sm:w-56 sm:h-42` or use `aspect-[4/3]`

**Verification:**
```bash
# Visual inspection:
# 1. Go to HomePage, scroll through all sections
# 2. Check all listing cards have uniform height despite different image sizes
# 3. Go to ListingDetailPage, check "Recently viewed" and "Similar listings" sections
# 4. Go to AccountPage, check overview's recently viewed cards
# 5. All cards should be same size, images should fill cards with crop (no distortion)
npm run dev
# Check at different viewports
```

---

## 7. Create Footer Component

**What to do:**
Create a new `Footer.tsx` component with: Marbou logo/brand, navigation links (Terms of Service, Privacy Policy, Help Center, About Us, Contact Us), copyright line (© 2024 Marbou. All rights reserved.), social icons (placeholder), language switcher. Responsive: vertical stack on mobile, horizontal on desktop. Background: Primary Green #214E3D, text: white. Integrate in App.tsx so it appears on all non-auth, non-dashboard pages inside the AppShell.

**Files to create:**
- `src/components/Footer.tsx`

**Files to modify:**
- `src/components/AppShell.tsx` (integrate Footer)
- `src/App.tsx` (ensure Footer renders on correct pages)

**Detailed changes:**

### Create src/components/Footer.tsx:

```typescript
import { useI18n } from '@/i18n/I18nContext';
import { useRouter } from '@/router/Router';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

export function Footer() {
  const { t, lang, toggleLang } = useI18n();
  const { navigate } = useRouter();

  const footerLinks = [
    { key: 'termsOfService', href: '/help/terms' },
    { key: 'privacyPolicy', href: '/help/privacy' },
    { key: 'helpCenter', href: '/help' },
    { key: 'aboutUs', href: '/help/about' },
    { key: 'contactUs', href: '/help/contact' },
  ];

  const socialIcons = [
    { icon: Facebook, label: 'Facebook', href: 'https://facebook.com' },
    { icon: Twitter, label: 'Twitter', href: 'https://twitter.com' },
    { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
    { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com' },
  ];

  return (
    <footer className="bg-primary-800 text-white border-t border-primary-700 mt-8 sm:mt-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
          {/* Brand */}
          <div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-5 h-5">
                  <path
                    d="M28 70 L28 30 L50 30 L50 70"
                    stroke="#fdfbf7"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="72" cy="50" r="14" stroke="#f97e16" strokeWidth="6" fill="none" />
                  <circle cx="72" cy="50" r="4" fill="#fdfbf7" />
                </svg>
              </div>
              <span className="text-lg font-extrabold tracking-tight">{t('brandName')}</span>
            </button>
            <p className="text-sm text-primary-200">
              {lang === 'ar'
                ? 'منصة موثوقة للبيع والشراء في السودان'
                : 'A trusted platform for buying and selling in Sudan'}
            </p>
          </div>

          {/* Footer Links */}
          <div className="sm:col-span-1">
            <h3 className="font-bold text-white mb-3">{t('quickLinks')}</h3>
            <ul className="space-y-2">
              {footerLinks.slice(0, 3).map((link) => (
                <li key={link.key}>
                  <button
                    onClick={() => navigate(link.href)}
                    className="text-sm text-primary-200 hover:text-white transition-colors"
                  >
                    {t(link.key as TranslationKey)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="sm:col-span-1">
            <h3 className="font-bold text-white mb-3">{t('company')}</h3>
            <ul className="space-y-2">
              {footerLinks.slice(3).map((link) => (
                <li key={link.key}>
                  <button
                    onClick={() => navigate(link.href)}
                    className="text-sm text-primary-200 hover:text-white transition-colors"
                  >
                    {t(link.key as TranslationKey)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Language */}
          <div>
            <h3 className="font-bold text-white mb-3">{t('followUs')}</h3>
            <div className="flex items-center gap-2 mb-4">
              {socialIcons.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-primary-700 hover:bg-primary-600 transition-colors flex items-center justify-center"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
            <button
              onClick={toggleLang}
              className="text-xs bg-primary-700 hover:bg-primary-600 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              {lang === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-primary-700 my-6 sm:my-8" />

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-primary-200">
          <p>© 2024 {t('brandName')}. {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
          <p>
            {lang === 'ar'
              ? 'صنع بـ ❤️ في السودان'
              : 'Made with ❤️ in Sudan'}
          </p>
        </div>
      </div>
    </footer>
  );
}
```

### Integrate Footer in AppShell.tsx:

1. **Import Footer at top:**
   ```typescript
   import { Footer } from '@/components/Footer';
   ```

2. **Update AppShell component:**
   ```typescript
   export function AppShell({ children }: { children: ReactNode }) {
     const { path } = useRouter();
     const isDashboard = path.startsWith('/business') || path.startsWith('/admin');

     return (
       <div className="min-h-screen bg-sand-50 flex flex-col">
         <Header />
         <main className={`${isDashboard ? '' : 'max-w-7xl mx-auto px-3 sm:px-4 py-4'} pb-20 md:pb-8 flex-1`}>
           {children}
         </main>
         <BottomNav />
         {!isDashboard && <Footer />}
       </div>
     );
   }
   ```

   **Key changes:**
   - Add `flex flex-col` to outer div
   - Add `flex-1` to main so it grows and pushes footer down
   - Add `{!isDashboard && <Footer />}` before closing div (don't show Footer on business/admin dashboard pages)

### Update App.tsx:

1. **Footer should NOT appear on:**
   - Auth pages (register, login, signin, otp, forgot-password, reset-password, add-email)
   - Dashboard pages (business, admin)

2. **Footer SHOULD appear on:**
   - HomePage, SearchPage, CategoryPage, ListingDetailPage, AddListingPage, AccountPage, etc.

3. **Current logic already handles this:** In App.tsx, when `isDashboard || isAuth`, it doesn't wrap in `AppShell` (and thus no Footer). For all other pages, it wraps in AppShell (and Footer is included).

**Verification:**
```bash
# Test flow:
# 1. Go to HomePage: Footer visible at bottom
# 2. Go to ListingDetailPage: Footer visible
# 3. Go to AccountPage: Footer visible
# 4. Go to /business: Footer NOT visible (dashboard)
# 5. Go to /login: Footer NOT visible (auth page)
# 6. Test Footer links work (navigate)
# 7. Test social icons (should open in new tabs)
# 8. Test language switcher in Footer
# 9. Check responsive: Footer vertical on mobile (375px), horizontal on desktop (1024px)
npm run dev
# Test across different pages and breakpoints
```

---

## Summary of Changes

| Issue | File(s) | Type | Priority |
|-------|---------|------|----------|
| Header overflow & nav duplication | `AppShell.tsx` | Refactor | Critical |
| Header styling & professional look | `AppShell.tsx` | Style | High |
| Account pages responsiveness | `AccountPage.tsx` | Responsive | High |
| Auto-translate titles | `AddListingPage.tsx` | Feature | Medium |
| Draggable images | `MediaUploader.tsx` | Feature | Medium |
| Uniform card heights | `ListingCard.tsx` (+ verify others) | Style | High |
| Footer | NEW `Footer.tsx`, `AppShell.tsx`, `App.tsx` | Feature | High |

---

## Testing Checklist

- [ ] Mobile (375px): No horizontal scroll on any page
- [ ] Mobile (375px): All header items visible and clickable
- [ ] Mobile (375px): Bottom nav functional, all 5 items visible
- [ ] Tablet (768px): Header/layout responsive
- [ ] Desktop (1024px+): Full layout visible, sidebar on account page
- [ ] AccountPage: Sidebar/tabs responsive at all breakpoints
- [ ] AddListingPage: Title auto-translation works bidirectionally
- [ ] AddListingPage: Image dragging reorders correctly
- [ ] ListingDetailPage: Recently viewed cards uniform height
- [ ] HomePage: All listing cards uniform height
- [ ] Footer: Present on non-auth, non-dashboard pages
- [ ] Footer: Responsive stack on mobile, horizontal on desktop
- [ ] Footer: Links navigate correctly
- [ ] Footer: Language switcher works
- [ ] All color palette used correctly (Primary Green, etc.)
- [ ] No visual regressions on existing functionality
