# Implementation Plan: 7 P0 Blockers

## Sequencing Notes

**Critical Dependency: B-25 must be done FIRST or LAST**

B-25 (Path routing) fundamentally changes how Router.tsx works: from hash-based `window.location.hash` navigation to HTML5 history API `window.location.pathname`. This affects:
- How `navigate()` works and its signature (may add a `{replace: true}` option)
- How URL parameters are parsed (from hash to query string format stays the same)
- How all route guards and redirects behave in B-22, B-03, etc.

**Decision: Implement B-25 FIRST** so all other blockers build on the correct routing foundation.

**Recommended Sequence:**
1. **B-25** — Path routing & SEO (hash → pathname) — changes Router.tsx
2. **B-22** — Auth gating (uses updated Router.tsx)
3. **B-02** — Signed-in user state (uses Auth context)
4. **B-42** — Mobile header (uses AppShell, independent)
5. **B-05/B-06** — Tablet filters & URL sync (uses updated navigate())
6. **B-26** — Data Saver & network detection (uses AppContext, independent)
7. **B-32** — Dynamic category filters (uses FilterPanel, independent)

---

## Plan Items

### B-25 — Path Routing & SEO (Hash → HTML5 History API)

**Decision Rationale:**  
Current hash-based routing (`#/path`) is not SEO-friendly and does not work well with server-side rendering or direct URL access. HTML5 history API (`/path`) is standard for modern SPAs and required for proper 404 handling and document title/meta updates.

---

- [ ] **1. Update Router.tsx to use pathname + add replaceState support**
  
  - Add a `replace` option to the `navigate()` function
  - Replace hash tracking with pathname tracking
  - Add listener for `popstate` (back/forward button support)
  - Add a new `navigate(path, {replace?: boolean})` overload
  - Ensure `Link` component also supports the replace option when needed
  
  Files to modify:
  - `src/router/Router.tsx`
  
  Changes:
  - Replace `window.location.hash.slice(1)` with `window.location.pathname`
  - Replace `hashchange` event listener with `popstate` event listener
  - Use `window.history.pushState()` for normal navigation (default)
  - Use `window.history.replaceState()` when `navigate(path, {replace: true})` is called
  - Keep params extraction logic but adapt to pathname parsing (already query-string ready)
  
  Verify: 
  ```
  npm run dev
  # Manually navigate by clicking links and verify URLs change from #/path to /path
  # Use browser back/forward buttons and confirm they work
  ```

---

- [ ] **2. Update vite.config.ts to enable historyApiFallback**
  
  - Add `server.middlewares` or `server.historyApiFallback` for dev server
  - Add `preview.historyApiFallback` for preview mode
  
  Files to modify:
  - `vite.config.ts`
  
  Changes:
  - Add `server: { historyApiFallback: true }` to handle direct URL access during development
  - Add `preview: { historyApiFallback: true }` for preview mode
  
  Verify:
  ```
  npm run dev
  # Navigate to /search directly in the address bar
  # Should load the search page (not 404)
  ```

---

- [ ] **3. Update index.html to add historyApiFallback catch-all**
  
  - Ensure `index.html` is the fallback for all routes in production
  
  Files to modify:
  - `index.html`
  
  Changes:
  - The SPA already routes in React; ensure vite.config handles the server redirect
  
  Verify:
  ```
  npm run build
  npm run preview
  # Navigate to /search directly
  # Should load the page correctly
  ```

---

- [ ] **4. Update App.tsx to add document.title and meta description updates per route**
  
  - Create a `usePageMeta` hook or add a `useEffect` in Routes component
  - Set `document.title` based on the current route
  - Update meta description tag in the head
  - Create a route metadata map (path → title + description)
  
  Files to modify:
  - `src/App.tsx`
  - Optionally: `src/router/Router.tsx` (add metadata support)
  
  Changes:
  - Add a side effect in the Routes component to update document.title based on path
  - Example: if path === '/search' set title to 'Search | Marbou'
  - Update meta description for each route
  - Create a const mapping: `const routeMeta = { '/': { title: 'Home | Marbou', desc: '...' }, '/search': { ... } }`
  
  Verify:
  ```
  npm run dev
  # Navigate to different pages and check browser tab title
  # View page source and confirm meta description is updated
  ```

---

- [ ] **5. Create a 404 NotFound page component**
  
  - Create new component for unmatched routes
  - Show a friendly message with links back to home or search
  
  Files to create:
  - `src/pages/NotFoundPage.tsx`
  
  Content:
  - React component with icon, message, and navigation buttons
  - Use existing EmptyState pattern
  - Add links to home and search pages
  
  Files to modify:
  - `src/App.tsx` — add a fallback route at the end of Routes component that renders NotFoundPage
  
  Verify:
  ```
  npm run dev
  # Navigate to /non-existent-route
  # Should render the 404 page
  ```

---

### B-22 — Auth Gating for Admin/Business Routes

**Decision Rationale:**  
Admin and business dashboard routes must require authentication. Unauthenticated users should be redirected to `/signin`. This uses the AuthContext.user to check authentication status.

---

- [ ] **6. Create a ProtectedRoute wrapper component**
  
  - Check if `useAuth().user` exists
  - If not authenticated, redirect to `/signin`
  - If authenticated, render the page
  - If user account type is `'business'` and route is `/admin`, also block (account type check)
  
  Files to create:
  - `src/components/ProtectedRoute.tsx`
  
  Content:
  - Functional component that accepts a page component as a child
  - Check `useAuth().user` and `user.accountType`
  - Redirect using `navigate()` if needed
  - Pass children through if authenticated
  
  Verify:
  ```
  npm run dev
  # Verify not logged in (localStorage is empty)
  # Click on account → "business" demo role
  # Try to navigate to /business or /admin
  # Should redirect to /signin
  ```

---

- [ ] **7. Update App.tsx Routes function to guard /admin/* and /business/* routes**
  
  - Wrap AdminDashboard and BusinessDashboard with ProtectedRoute
  - Pass the component as a child
  
  Files to modify:
  - `src/App.tsx` — in the Routes function where AdminDashboard and BusinessDashboard are rendered
  
  Changes:
  - Replace direct `<AdminDashboard />` with `<ProtectedRoute><AdminDashboard /></ProtectedRoute>`
  - Same for BusinessDashboard
  - Optional: for more granular control, could check `user.accountType` and redirect business users trying to access `/admin`
  
  Verify:
  ```
  npm run dev
  # Log in with a test account
  # Try to access /business and /admin
  # Should work if authenticated
  # Log out, try again
  # Should redirect to /signin
  ```

---

- [ ] **8. Move DemoRoleSwitcher behind import.meta.env.DEV in Header**
  
  - Only render DemoRoleSwitcher in development
  - In production, hide it completely
  
  Files to modify:
  - `src/components/AppShell.tsx` — Header function
  
  Changes:
  - Wrap the DemoRoleSwitcher render (line with `<div className="hidden lg:block">...DemoRoleSwitcher`) with:
    ```tsx
    {import.meta.env.DEV && (
      <div className="hidden lg:block">
        <DemoRoleSwitcher />
      </div>
    )}
    ```
  
  Verify:
  ```
  npm run dev
  # Should see demo role switcher in header (top right)
  npm run build && npm run preview
  # Should NOT see demo role switcher in production build
  ```

---

### B-02 — Signed-in User State & Logout

**Decision Rationale:**  
Show real user information from `useAuth().user` instead of hardcoded "Demo User". Add a sign-out button in the header user dropdown. Only show DemoRoleSwitcher when user is NOT authenticated.

---

- [ ] **9. Update Header to show user avatar/name from AuthContext + add logout dropdown**
  
  - Replace hardcoded location selector with user menu dropdown
  - Show user's `displayName` and avatar
  - Add a logout button in the dropdown
  - Show location selector and language toggle inside the same dropdown on mobile
  
  Files to modify:
  - `src/components/AppShell.tsx` — Header function
  
  Changes:
  - Add `useAuth()` hook to Header
  - Create a new `UserMenu` component (similar to LocationSelector, NetworkStatusControl)
  - In Header's right actions, replace a placeholder or add a new button that shows user icon
  - If authenticated (`user !== null`), show user's displayName and avatar
  - If not authenticated, show a "Sign In" button linking to `/signin`
  - UserMenu dropdown includes: user name, email, "Account" link, "Logout" button
  - On logout, call `useAuth().logout()` which also navigates to home
  
  Verify:
  ```
  npm run dev
  # Not logged in: should see "Sign In" button in header
  # After login: should see user name and avatar
  # Click avatar → dropdown
  # Click "Logout" → should return to home and sign-in state
  ```

---

- [ ] **10. Update AccountPage to show real user name instead of hardcoded "Demo User"**
  
  - Replace two instances of hardcoded "Demo User" with `useAuth().user.displayName`
  - Show user email from `useAuth().user.email`
  - Add loading state if user is null (not authenticated)
  
  Files to modify:
  - `src/pages/AccountPage.tsx`
  
  Changes:
  - Add `useAuth()` hook
  - Replace "Demo User" text with `user?.displayName || 'User'`
  - Replace hardcoded "demo@marbou.sd" email with `user?.email || ''`
  - Add a check: if `user === null`, show a message like "Please log in to access your account" with a link to signin
  
  Verify:
  ```
  npm run dev
  # Not logged in → /account should redirect or show sign-in prompt
  # Log in with test account
  # /account should show real user name and email
  ```

---

### B-42 — Mobile Header Language & Login Menu

**Decision Rationale:**  
On mobile screens (< 640px / sm breakpoint), users cannot access language switcher, user menu, or location selector because they're hidden. Create a hamburger mobile menu (slide-over or bottom sheet) on mobile that contains: language switcher, sign-in/sign-out button, notifications bell (if needed), and location selector.

---

- [ ] **11. Create a MobileMenu component (hamburger slide-over)**
  
  - Hamburger button visible only on mobile (hidden sm:)
  - Clicking it opens a slide-over menu from the right or a bottom sheet
  - Menu includes: language toggle, location selector, notifications link, user menu (login/logout)
  - Styled with Tailwind, follows existing design patterns
  
  Files to create:
  - `src/components/MobileMenu.tsx`
  
  Content:
  - Functional component with state for open/close
  - Hamburger icon button in header
  - Slide-over panel with menu items
  - Reuse LangSwitch, LocationSelector, and UserMenu components or inline their logic
  
  Verify (after integrating in Header):
  ```
  npm run dev
  # On mobile viewport (< 640px)
  # Should see hamburger icon in header right
  # Click it → should open menu
  # Menu should show language, location, notifications, user menu
  # Click outside or X button → should close
  ```

---

- [ ] **12. Update Header to show MobileMenu on mobile, keep desktop layout for md+**
  
  - Hide current location, language, and notifications on mobile (already hidden with utility classes)
  - Add MobileMenu component on mobile only (visible on md:hidden)
  - Keep UserMenu visible on mobile (for sign-in/out)
  - Update layout to work with mobile-first approach
  
  Files to modify:
  - `src/components/AppShell.tsx` — Header function
  
  Changes:
  - Add MobileMenu component and import it
  - In Header's right actions, wrap current items with responsive visibility:
    - `hidden sm:flex` for location, language, demo role switcher (desktop only)
    - `md:hidden` for MobileMenu (mobile only)
  - Ensure user menu is visible on all sizes or duplicate it (one for mobile, one for desktop)
  
  Verify:
  ```
  npm run dev
  # Test on mobile: hamburger menu visible, desktop items hidden
  # Test on tablet/desktop: hamburger menu hidden, desktop items visible
  # Menu items should work on both
  ```

---

### B-05 / B-06 — Tablet Filters & Search URL Sync

**Decision Rationale:**  
FilterPanel shows on md breakpoint (768px) not just lg (1024px). URL sync uses `replaceState` for filter changes (no history spam) but `pushState` for new searches.

---

- [ ] **13. Fix FilterPanel visibility: show at md breakpoint (768px), not just lg**
  
  - Update Tailwind class on FilterPanel in SearchPage layout
  - Sidebar should be `md:block hidden` not `lg:block hidden`
  
  Files to modify:
  - `src/pages/SearchPage.tsx` — the layout/grid where FilterPanel is rendered
  
  Changes:
  - Change `hidden lg:block` to `hidden md:block` on the FilterPanel wrapper
  - Adjust grid layout if needed to accommodate tablet sizes
  - Ensure FilterPanel doesn't overflow on tablet
  
  Verify:
  ```
  npm run dev
  # Resize to 768px (tablet) → FilterPanel should appear
  # Resize to 1024px (desktop) → FilterPanel should still appear
  # Resize to 640px (mobile) → FilterPanel should hide, mobile filter modal should work
  ```

---

- [ ] **14. Implement replaceState for filter changes; pushState for new searches in SearchPage**
  
  - Modify the URL sync effect in SearchPage
  - When filters change (minPrice, maxPrice, condition, category, etc.), use `navigate(newPath, {replace: true})`
  - When user submits a new search query, use `navigate(newPath)` (default pushState)
  - Distinguish: filter changes are refinements; new queries are new searches
  
  Files to modify:
  - `src/router/Router.tsx` — ensure navigate() supports the `{replace: true}` option (from B-25)
  - `src/pages/SearchPage.tsx` — the URL sync effect and query submission logic
  
  Changes:
  - In SearchPage, track whether the change was a filter refinement or a new query
  - In the useEffect that syncs filters to URL:
    ```tsx
    const newPath = `/search${params.toString() ? `?${params.toString()}` : ''}`;
    const isNewSearch = query !== initialQuery;
    if (newPath !== path) {
      navigate(newPath, { replace: !isNewSearch });  // replaceState for filters, pushState for new queries
    }
    ```
  - Or simpler: only use replace for price/condition/category changes, not for query changes
  
  Verify:
  ```
  npm run dev
  # Search for "cars"
  # Change price filter → URL updates with replaceState (browser back button doesn't show previous filter state)
  # Search for "trucks" (new query) → URL updates with pushState (browser back button shows "cars" result)
  # Back button should go to "cars" search, not previous filter state
  ```

---

### B-26 — Data Saver & Real Network Detection

**Decision Rationale:**  
Use `navigator.onLine` API to detect real network status. Show a banner when offline. When dataSaver is ON, lazy-load images. Add online/offline event listeners to AppContext.

---

- [ ] **15. Add real network detection (navigator.onLine) to AppContext**
  
  - Add event listeners for 'online' and 'offline' events
  - Initialize networkState from `navigator.onLine`
  - Keep manual toggles for demo/testing purposes
  - Sync real network state to AppContext
  
  Files to modify:
  - `src/context/AppContext.tsx`
  
  Changes:
  - In AppProvider useEffect, add:
    ```tsx
    useEffect(() => {
      const handleOnline = () => setNetworkState('connected');
      const handleOffline = () => setNetworkState('offline');
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      // Initialize from navigator.onLine
      setNetworkState(navigator.onLine ? 'connected' : 'offline');
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }, []);
    ```
  - Keep manual NetworkStatusControl for demo purposes
  
  Verify:
  ```
  npm run dev
  # Open browser DevTools → Network tab
  # Throttle to "Offline"
  # Should see networkState change to 'offline'
  # Go back to "Online"
  # Should see networkState change to 'connected'
  ```

---

- [ ] **16. Add offline/data-saver banner to AppShell**
  
  - Show a thin banner at the top or bottom when:
    - `networkState === 'offline'` → red banner "You are offline"
    - `dataSaver === true` → blue banner "Data Saver is ON"
  - Banner can be dismissible or permanent
  - Use existing Toast or create a simple Alert component
  
  Files to modify:
  - `src/components/AppShell.tsx`
  
  Changes:
  - Add a condition before or after Header to render a banner
  - Check `useApp().networkState` and `useApp().dataSaver`
  - Render a simple div with appropriate message and styling
  
  Verify:
  ```
  npm run dev
  # Toggle networkState to 'offline' → banner appears
  # Toggle dataSaver to true → banner appears
  # Both toggled on → both banners visible
  ```

---

- [ ] **17. Add image lazy-loading support when dataSaver is ON**
  
  - Modify ListingCard and any component that renders images
  - When `dataSaver === true`, set `loading="lazy"` on images or use IntersectionObserver
  - Otherwise use `loading="eager"` or no loading attribute
  - Update AccountPage images, SearchPage images, ListingCard, etc.
  
  Files to modify:
  - `src/components/ListingCard.tsx` (primary component)
  - `src/pages/AccountPage.tsx` (profile images)
  - `src/pages/ListingDetailPage.tsx` (detail images)
  - Other components with images
  
  Changes:
  - Add `useApp()` hook in image-rendering components
  - Set `loading={dataSaver ? 'lazy' : 'eager'}` on img elements
  - Or use a custom LazyImage component that checks `dataSaver` context
  
  Verify:
  ```
  npm run dev
  # Toggle dataSaver ON
  # Load /search page
  # Inspect img elements → should have loading="lazy" attribute
  # Scroll through images → should load as they come into view
  # Toggle dataSaver OFF
  # Reload → images should have loading="eager" or no attribute
  ```

---

### B-32 — Dynamic Category Filters

**Decision Rationale:**  
When a category is selected (e.g., vehicles), show category-specific sub-filters based on the category's specs. Pull distinct values from mockData listings for each spec key. Use dynamic options instead of static ones.

---

- [ ] **18. Extract distinct spec values from mockData listings by category**
  
  - Create a service function `getSpecOptionsForCategory(categoryId: string)`
  - Loop through listings, filter by category, extract all unique spec values
  - Return a mapping: `{ specKey: ['value1', 'value2', ...] }`
  - Example: vehicles category → `{ make: ['Toyota', 'Nissan', ...], model: [...], year: [...], mileage: [...] }`
  
  Files to create:
  - `src/services/filters.ts`
  
  Content:
  - Function `getSpecOptionsForCategory(categoryId: string): Record<string, string[]>`
  - Use listings from mockData
  - Extract specs.key and specs.value for each listing matching the category
  - Use Set to get unique values
  - Return sorted arrays
  
  Verify:
  ```
  npm run dev
  # Import and call getSpecOptionsForCategory('vehicles')
  # Console.log the result
  # Should see {make: ['Nissan', 'Toyota'], model: [...], ...}
  ```

---

- [ ] **19. Extend FilterState interface to include category-specific specs filters**
  
  - Update FilterState in FilterPanel.tsx to support dynamic specs
  - Add a `specs?: Record<string, string>` field
  - This allows storing filters like `{ specs: { make: 'Toyota', model: 'Camry' } }`
  
  Files to modify:
  - `src/components/marketplace/FilterPanel.tsx`
  
  Changes:
  ```tsx
  export interface FilterState {
    category?: string;
    subcategory?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    specs?: Record<string, string>;  // NEW: dynamic spec filters
  }
  ```
  
  Verify:
  ```
  npm run dev
  # Compile should succeed
  # No TypeScript errors
  ```

---

- [ ] **20. Update FilterPanel to show dynamic spec filters when category is selected**
  
  - When `filters.category` changes, call `getSpecOptionsForCategory()` to get available specs
  - Add filter groups dynamically based on available specs
  - For each spec, create a select or checkbox group
  - Store selections in `filters.specs`
  
  Files to modify:
  - `src/components/marketplace/FilterPanel.tsx`
  
  Changes:
  - Import `getSpecOptionsForCategory` from services
  - Add a `useMemo` to compute dynamic filter groups based on `filters.category`
  - Add spec filter groups to the `filterGroups` array dynamically
  - Map spec selections to URL params and back
  - Handle onChange for spec filters like other filters
  
  Example structure in FilterPanel:
  ```tsx
  const specOptions = useMemo(() => {
    if (!filters.category) return {};
    return getSpecOptionsForCategory(filters.category);
  }, [filters.category]);

  const dynamicSpecGroups = useMemo(() => {
    return Object.entries(specOptions).map(([specKey, values]) => ({
      id: `spec-${specKey}`,
      label: specKey,  // TODO: translate
      type: 'select' as const,
      options: values.map(v => ({ value: v, label: v })),
    }));
  }, [specOptions]);

  const allFilterGroups = [...filterGroups, ...dynamicSpecGroups];
  ```
  
  Verify:
  ```
  npm run dev
  # Go to /search
  # Select "vehicles" category in filter
  # Below category filter, new filters should appear: Make, Model, Year, Mileage, etc.
  # Select a make (e.g., Toyota)
  # URL should include &specs[make]=Toyota
  # List should filter to Toyota vehicles only
  ```

---

- [ ] **21. Update SearchPage to filter listings by specs and sync specs to URL**
  
  - In the search results filtering logic, add a check for `filters.specs`
  - Filter listings by matching specs
  - Sync specs to URL query params (e.g., `?specs[make]=Toyota&specs[model]=Camry`)
  
  Files to modify:
  - `src/pages/SearchPage.tsx` — the filtering/results calculation
  
  Changes:
  - In the `results` useMemo, after category/price/condition filters, add:
    ```tsx
    if (filters.specs) {
      Object.entries(filters.specs).forEach(([specKey, specValue]) => {
        filtered = filtered.filter(l =>
          l.specs.some(s => s.key === specKey && s.value === specValue)
        );
      });
    }
    ```
  - In the URL sync effect, serialize specs:
    ```tsx
    if (filters.specs) {
      Object.entries(filters.specs).forEach(([k, v]) => {
        params.set(`specs[${k}]`, v);
      });
    }
    ```
  - Add deserialization to load specs from URL on mount
  
  Verify:
  ```
  npm run dev
  # Select category "vehicles"
  # Select make "Toyota"
  # URL should show ?category=vehicles&specs[make]=Toyota
  # Results should show only Toyota vehicles
  # Reload page → specs should persist
  ```

---

## Summary Table

| Blocker | Files Modified | Files Created | Dependencies | Estimated Complexity |
|---------|----------------|---------------|-------------|----------------------|
| B-25 | vite.config.ts, src/router/Router.tsx, src/App.tsx, index.html | src/pages/NotFoundPage.tsx | None | High |
| B-22 | src/App.tsx | src/components/ProtectedRoute.tsx | B-25 (updated Router) | Medium |
| B-02 | src/components/AppShell.tsx, src/pages/AccountPage.tsx | — | B-25 (for proper routing) | Medium |
| B-42 | src/components/AppShell.tsx | src/components/MobileMenu.tsx | B-25, B-02 | Medium |
| B-05/B-06 | src/pages/SearchPage.tsx, src/router/Router.tsx | — | B-25 (replaceState support) | Medium |
| B-26 | src/context/AppContext.tsx, src/components/AppShell.tsx | — | None (independent) | Low |
| B-32 | src/components/marketplace/FilterPanel.tsx, src/pages/SearchPage.tsx | src/services/filters.ts | None (independent) | Medium |

---

## Testing Strategy

After each blocker implementation:
1. Run `npm run dev` and manually test all affected routes
2. For B-25, test browser back/forward buttons and direct URL access
3. For B-22, test routing without authentication
4. For B-02, test with and without logged-in user
5. For B-42, test on multiple viewport sizes
6. For B-05/B-06, test filter URL sync and browser history
7. For B-26, test offline state and data saver images
8. For B-32, test dynamic filters for vehicles, real-estate, and electronics categories

---

## Post-Implementation Notes

- All URLs should follow `/path?param=value` format (no hash)
- DemoRoleSwitcher is hidden in production but available in dev for testing
- All auth checks should use `useAuth().user` from AuthContext
- All images should respect dataSaver mode with lazy loading
- Category-specific filters should auto-populate from listings specs
- No custom CSS; use only Tailwind utility classes
