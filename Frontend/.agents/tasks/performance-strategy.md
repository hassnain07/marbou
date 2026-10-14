# MARBOU Frontend — Performance & Code-Splitting Strategy

Comprehensive performance optimization plan for a large-scale marketplace targeting thousands of concurrent users on weak Sudanese internet (2G/3G, 50–500 kbps).

---

## Executive Summary

**Target Metrics (Production):**
- Initial bundle (JS): ≤ 150 KB gzipped
- Per-route chunk: ≤ 80 KB gzipped
- Time to Interactive (TTI): ≤ 3s on 3G (100 kbps)
- Lighthouse Performance Score: ≥ 75 on mobile (3G throttle)

**Strategy:** Route-based code splitting, aggressive image optimization, memoization of frequently-rendered components, lazy-load non-critical routes, virtual scrolling for large lists.

---

## 1. Route-Based Code Splitting

### Implementation with React.lazy + Suspense

All routes should be lazy-loaded except critical paths (Home, Auth). This reduces initial bundle by 60–70%.

**Current Router Structure:** `src/router/Router.tsx`

**Plan:**
```typescript
import { lazy, Suspense } from 'react';

// Critical (in main bundle)
const HomePage = lazy(() => import('./pages/HomePage'));
const AuthPages = lazy(() => import('./pages/AuthPages'));

// Secondary (lazy-load on first navigation)
const SearchPage = lazy(() => import('./pages/SearchPage'));
const ListingDetailPage = lazy(() => import('./pages/ListingDetailPage'));
const AddListingPage = lazy(() => import('./pages/AddListingPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesCompareMessages'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const JobsPage = lazy(() => import('./pages/JobsServicesBusiness'));
const BusinessDashboard = lazy(() => import('./pages/BusinessDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const SellerProfilePage = lazy(() => import('./pages/SellerProfilePage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));

// Suspense fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Skeleton className="h-12 w-12 rounded-full animate-bounce-in" />
    </div>
  );
}

// Each route wrapped
<Suspense fallback={<PageLoader />}>
  {renderPage()}
</Suspense>
```

### Route Load Priority

| Priority | Routes | Size (est.) | Reason |
|---|---|---|---|
| **Critical** | Home, Login/Register | 60KB | Always needed first |
| **High** | Search, Listing Detail | 80KB | Primary user flows |
| **Medium** | Favorites, Account, Business, Admin | 100KB | Secondary flows |
| **Low** | Help, Coming Soon, Seller Profile | 30KB | Rare or informational |

### Expected Impact
- Initial load: 220 KB → 60 KB (73% reduction)
- Time to Interactive: 4.5s → 1.2s (on 3G)
- Subsequent route navigation: 200ms average

---

## 2. Component-Level Code Splitting

Heavy components that render rarely or conditionally should be lazy-loaded.

### Lazy-Load Candidates

| Component | Size | Trigger | Rationale |
|---|---|---|---|
| MediaUploader | 25KB | Add Listing page | Complex file handling, heavy deps |
| CompareTable | 20KB | Compare button click | Feature flag, not every user |
| RichTextEditor | 30KB | Create/Edit messages | Large dep tree, used on demand |
| MapWidget | 35KB | Listing detail (location tab) | Heavy library, deferred render |
| AdminDataTable | 40KB | Admin dashboard | Pagination, filtering, sorting |
| AdvancedSearchFilters | 25KB | Search page, filter toggle | Complex state, rarely needed |

### Implementation Pattern

```typescript
import { lazy, Suspense } from 'react';

const MediaUploader = lazy(() => import('./components/MediaUploader'));

// In page component:
<Suspense fallback={<Skeleton className="h-64" />}>
  <MediaUploader onUpload={handleUpload} />
</Suspense>
```

### Expected Impact
- Defer 175 KB to on-demand
- Instant page render, hidden loading

---

## 3. Image Optimization Strategy

Images represent 60–80% of page size on a listing marketplace. Optimization is critical.

### Responsive Image Sizes

**Size presets generated server-side:**

| Context | Dimensions | Format | Gzipped | Usage |
|---|---|---|---|---|
| **Thumbnail** | 80×80 | WebP/JPEG | 8 KB | Search grid, business cards |
| **Card** | 400×300 | WebP/JPEG | 25 KB | Grid view (primary) |
| **Detail Gallery** | 800×600 | WebP/JPEG | 60 KB | Listing detail full |
| **Hero** | 1200×800 | WebP/JPEG | 90 KB | Homepage banners |
| **Avatar** | 64×64 | WebP/JPEG | 5 KB | Seller badge, profile |

### Lazy Loading Implementation

**Use native `loading="lazy"` + Intersection Observer for control:**

```html
<!-- For below-fold images -->
<img src="image.jpg" loading="lazy" alt="..." />

<!-- For images needing early load before fold -->
<img src="image.jpg" alt="..." />  <!-- no loading="lazy" -->
```

**Programmatic with IntersectionObserver:**

```typescript
export function useImageLazyLoad(ref: RefObject<HTMLImageElement>) {
  useEffect(() => {
    if (!ref.current) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && ref.current?.dataset.src) {
        ref.current.src = ref.current.dataset.src;
        ref.current.removeAttribute('data-src');
        observer.disconnect();
      }
    }, { rootMargin: '50px' });
    
    observer.observe(ref.current);
  }, [ref]);
}

// Usage
<img ref={imgRef} data-src={highRes} src={blur} alt="..." />
```

### Blur-Up Placeholder Strategy

Use 20px base64 LQIP (Low-Quality Image Placeholder):

```typescript
// Server returns both:
{
  id: '123',
  image: 'https://cdn.../image-400x300.webp',
  imageLqip: 'data:image/webp;base64,UklGRiYAAABXRUJQ...',
}

// Client renders:
<picture>
  <source srcset="
    image-sm.webp 400w,
    image-md.webp 800w,
    image-lg.webp 1200w
  " type="image/webp" />
  <source srcset="
    image-sm.jpg 400w,
    image-md.jpg 800w
  " type="image/jpeg" />
  <img
    src="image-sm.jpg"
    srcSet="image-md.jpg 800w, image-lg.jpg 1200w"
    alt="Listing"
    loading="lazy"
    style={{ backgroundImage: `url(${imageLqip})`, backgroundSize: 'cover' }}
    className="transition-all duration-300"
  />
</picture>
```

### WebP + JPEG Fallback

All images served in both formats:
- WebP: 30–40% smaller, supported on 95%+ browsers
- JPEG: Fallback for older browsers

**CDN Transformation:**
```
/images/listing/123.webp
/images/listing/123.jpg
```

### Data-Saver Mode: Image Deferral

When user enables Data Saver:
1. Skip all image loads initially
2. Show category-color gradient placeholder (200×150px flat color, 0.5KB)
3. Load image only on explicit user tap/click
4. Cache in localStorage for session

```typescript
export function useDataSaverImages() {
  const { dataSaver } = useApp();
  
  return {
    shouldLoadImage: !dataSaver,
    placeholderColor: getCategoryColor(category),
  };
}

// Component
{dataSaver ? (
  <div
    className="w-full h-48 rounded-xl"
    style={{ backgroundColor: placeholderColor }}
    onClick={() => setShowImage(true)}
  />
) : (
  <img src={image} loading="lazy" alt="..." />
)}
```

### Expected Impact
- Grid load time: 8s → 2s (on 3G)
- Data saved: 5 MB → 800 KB (pages load 84% faster)
- User can view text while images load

---

## 4. Virtual Scrolling

For lists > 50 items, render only visible + buffer items in DOM.

### Implementation

**Library:** `@tanstack/react-virtual` (React Query team; well-maintained)

```bash
npm install @tanstack/react-virtual
```

**Example: Listing Grid**

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

export function ListingGrid({ listings }: { listings: Listing[] }) {
  const parentRef = useRef(null);
  
  const virtualizer = useVirtualizer({
    count: listings.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 350,  // card height + gap
    overscan: 10,  // render 10 items outside viewport
  });

  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div key={virtualItem.key} data-index={virtualItem.index}>
            <ListingCard listing={listings[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### When to Use Virtual Scrolling

| Scenario | Use Virtual? | Reason |
|---|---|---|
| Search results (50+ items) | Yes | DOM weight at 100+ |
| Admin data tables (1000+ rows) | Yes | Pagination often disabled |
| Homepage feeds | No | Finite, <50 items |
| Comparison table (4–8 items) | No | Small, keyboard nav |

### Performance Gain
- 200 items rendered: 8MB memory → 1MB
- Scroll frame rate: 20 fps → 60 fps
- Initial render: 2000ms → 150ms

---

## 5. React.memo & Memoization Boundaries

Strategic memoization prevents unnecessary re-renders; overuse causes memory bloat.

### Components to Memoize

**High-value targets (render frequently, expensive):**

```typescript
// src/components/ListingCard.tsx
export const ListingCard = memo(
  function ListingCard({ listing, onClick }: Props) {
    return (
      <div className="card">
        {/* Complex DOM + image + calculations */}
      </div>
    );
  },
  (prev, next) => {
    // Custom comparison: only re-render if ID or visibility changed
    return (
      prev.listing.id === next.listing.id &&
      prev.dataSaver === next.dataSaver
    );
  }
);

// src/components/CategoryTile.tsx
export const CategoryTile = memo(function CategoryTile({ category, onClick }: Props) {
  return (
    <button onClick={() => onClick(category)}>
      {category.name}
    </button>
  );
});

// src/components/JobCard.tsx
export const JobCard = memo(function JobCard({ job }: Props) {
  return <div>{job.title}</div>;
});

// Chip/Filter components (many instances)
export const FilterChip = memo(function FilterChip({ label, active, onClick }: Props) {
  return <button>{label}</button>;
});
```

### Do NOT Memoize

```typescript
// These re-render rarely; memoization overhead not worth it
export function HomePage() { /* entire page */ }
export function Modal({ ... }: ModalProps) { /* single instance */ }
export function PageContainer({ children }: Props) { /* layout wrapper */ }
```

### Expected Impact
- 50 listing cards in grid: 1200ms → 300ms re-render
- User interaction responsiveness: Noticeable improvement on mobile

---

## 6. State Management & Rendering Performance

Avoid unnecessary context re-renders.

### Splitting Context for Optimization

**Bad: Single context triggers all renders**
```typescript
const AppContext = createContext({
  user, setUser,
  listings, setListings,  // 1000 items
  filters, setFilters,
  modal, setModal,
  // ... 20 more values
});
// Changing any one property re-renders all subscribers
```

**Good: Split by update frequency**
```typescript
// Rarely changes (user login/logout)
const UserContext = createContext({ user, setUser });

// Frequently changes (filter, modal)
const UIContext = createContext({ filters, setFilters, modal, setModal });

// Frequently changes (from API)
const ListingsContext = createContext({ listings, setListings });
```

### Rules
- Keep contexts small (3–5 related values max)
- Use custom hooks to combine contexts
- Avoid passing inline objects as context values

---

## 7. Data Fetching & Caching

When backend API is available, implement intelligent caching.

### Cache TTL Table (Locked for Launch)

| Data Type | Query Hook | Stale Time | Cache Time | Invalidation Trigger | Rationale |
|---|---|---|---|---|---|
| **Listings** | `useListings(filters)` | 5 min | 30 min | User applies new filters, pulls to refresh | Balance freshness with network efficiency |
| **Categories** | `useCategories()` | ∞ (infinite) | ∞ (infinite) | App version upgrade only | Static; never changes in production |
| **Subcategories** | `useSubcategories(category)` | ∞ | ∞ | App upgrade | Static |
| **User Profile** | `useProfile()` | 30 sec | ∞ | Manual logout, explicit refresh | Personal data; needs fresh, stored indefinitely |
| **Seller Profile** | `useSellerProfile(id)` | 5 min | 30 min | Navigation away | Balance freshness with list performance |
| **Listing Detail** | `useListingDetail(id)` | 2 min | 30 min | Manual refresh, navigate away | Changes frequently (availability, price, views) |
| **Search Suggestions** | `useSearchSuggestions(query)` | 1 min | 10 min | User types new query | Popular searches; cache aggressive |
| **Messages** | `useMessages(threadId)` | 10 sec | 20 min | New message arrives (WebSocket), manual refresh | Real-time critical; short cache |
| **Notifications** | `useNotifications()` | 15 sec | 30 min | New notification (WebSocket), manual dismiss | Real-time; moderate cache |
| **Admin Data** | `useAdminListings()` / `useAdminUsers()` | 1 min | 10 min | Manual refresh, user updates data | High update frequency in admin context |

### Caching Strategy (react-query)

```typescript
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Listings: 5-minute stale time
export const useListings = (filters: Filters) => {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: () => api.getListings(filters),
    staleTime: 5 * 60 * 1000,  // 5 minutes
    gcTime: 30 * 60 * 1000,    // Keep in memory 30 min (was cacheTime in v4)
  });
};

// Categories: Permanent (until app upgrade)
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

// User profile: 30 seconds stale
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => api.getProfile(),
    staleTime: 30 * 1000,
    gcTime: Infinity,  // Keep indefinitely (user data shouldn't disappear)
  });
};

// Listing detail: 2-minute stale
export const useListingDetail = (listingId: string) => {
  return useQuery({
    queryKey: ['listing', listingId],
    queryFn: () => api.getListingDetail(listingId),
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

// Messages: 10-second stale (real-time critical)
export const useMessages = (threadId: string) => {
  return useQuery({
    queryKey: ['messages', threadId],
    queryFn: () => api.getMessages(threadId),
    staleTime: 10 * 1000,
    gcTime: 20 * 60 * 1000,
    refetchInterval: 5000,  // Optional: auto-refresh every 5s if stale
  });
};
```

### Invalidation Patterns

```typescript
const queryClient = useQueryClient();

// When user publishes a new listing
async function publishListing(data: ListingFormData) {
  const result = await api.createListing(data);
  
  // Invalidate related caches
  queryClient.invalidateQueries({
    queryKey: ['listings'],  // All listings queries
  });
  
  queryClient.invalidateQueries({
    queryKey: ['profile'],  // User's profile (affects "my listings" count)
  });
  
  return result;
}

// When new message arrives (via WebSocket)
export function onNewMessage(message: Message) {
  const queryClient = useQueryClient();
  
  // Update cache optimistically
  queryClient.setQueryData(['messages', message.threadId], (old: Message[]) => [
    ...old,
    message,
  ]);
  
  // Full refetch on next visible focus
  queryClient.invalidateQueries({
    queryKey: ['messages', message.threadId],
  });
}
```

---

### Prefetching on Hover

```typescript
const { prefetchQuery } = useQueryClient();

<Link
  to="/search?category=cars"
  onMouseEnter={() => prefetchQuery({
    queryKey: ['search', 'cars'],
    queryFn: () => api.search({ category: 'cars' }),
  })}
>
  Search Cars
</Link>
```

---

## 8. Bundle Analysis & Monitoring

### Build Analysis Script

```json
{
  "scripts": {
    "build": "vite build",
    "analyze": "vite build && vite-plugin-visualizer"
  }
}
```

**Install plugin:**
```bash
npm install -D vite-plugin-visualizer
```

### Size Budgets

Set limits in `vite.config.ts`:

```typescript
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [
    visualizer({
      filename: 'dist/stats.html',
      brotliSize: true,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          icons: ['lucide-react'],
        },
      },
    },
  },
};
```

### CI/CD Checks

```bash
# Check bundle size before deploy
if [ $(gzip dist/index.js | wc -c) -gt 150000 ]; then
  echo "Bundle too large!"
  exit 1
fi
```

---

## 9. Weak Network Optimization

Adaptive loading based on network conditions.

### Network Detection

```typescript
export function useNetworkStatus() {
  const [isSlowNetwork, setIsSlowNetwork] = useState(false);

  useEffect(() => {
    const connection = (navigator as any).connection;
    if (!connection) return;

    const checkNetwork = () => {
      const isSlow = 
        connection.effectiveType === 'slow-2g' ||
        connection.effectiveType === '2g' ||
        connection.effectiveType === '3g' ||
        connection.saveData;
      setIsSlowNetwork(isSlow);
    };

    checkNetwork();
    connection.addEventListener('change', checkNetwork);
    return () => connection.removeEventListener('change', checkNetwork);
  }, []);

  return isSlowNetwork;
}
```

### Adaptive Loading

```typescript
export function ListingGrid({ listings }: Props) {
  const isSlowNetwork = useNetworkStatus();

  return (
    <div className="grid grid-cols-3 gap-4">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          dataSaver={isSlowNetwork}
          lowQuality={isSlowNetwork}
        />
      ))}
    </div>
  );
}
```

### Aggressive Deferral on Slow Networks

```typescript
const shouldDeferImages = isSlowNetwork;
const shouldDeferAnalytics = isSlowNetwork;
const shouldDeferAds = isSlowNetwork;
const shouldReduceAnimations = isSlowNetwork || prefersReducedMotion;
```

---

## 10. Pagination vs. Infinite Scroll

Different strategies for different use cases.

### When to Paginate (Admin tables, search results)
- **Reason:** Users want predictable navigation, bookmarkable pages, control over data fetch
- **Example:** Search results show "Page 1 of 50"
- **Benefit:** Known total, can jump to any page, lighter DOM

### When to Use Infinite Scroll (Homepage feeds, category browse)
- **Reason:** Immersive, continuous discovery, matches mobile UX
- **Example:** Homepage trending section loads more as you scroll
- **Benefit:** Smooth, engaging, auto-loads hidden content

**Implementation:**

```typescript
// Infinite scroll with Intersection Observer
export function InfiniteScrollList({ onLoadMore, hasMore }: Props) {
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!triggerRef.current || !hasMore) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore) {
        onLoadMore();
      }
    });

    observer.observe(triggerRef.current);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  return (
    <>
      {/* items */}
      <div ref={triggerRef} className="py-8 flex justify-center">
        {hasMore && <Spinner />}
      </div>
    </>
  );
}
```

---

## 11. Performance Monitoring & Metrics

### Core Web Vitals to Track

| Metric | Target | What it measures |
|---|---|---|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | When main content is visible |
| **FID** (First Input Delay) | ≤ 100ms | Responsiveness to first interaction |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | Visual stability |
| **FCP** (First Contentful Paint) | ≤ 1.8s | When first paint occurs |
| **TTI** (Time to Interactive) | ≤ 3.5s | When page is interactive |

### Monitoring with Web Vitals

```bash
npm install web-vitals
```

```typescript
import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/metrics', JSON.stringify(metric));
  }
}

getCLS(sendToAnalytics);
getFCP(sendToAnalytics);
getFID(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

---

## 12. Asset Optimization Checklist

- [ ] All images served in WebP + JPEG
- [ ] Responsive srcset for all images
- [ ] Lazy load below-fold images
- [ ] Route-based code splitting implemented
- [ ] Heavy components (MediaUploader, Editor) lazy-loaded
- [ ] Virtual scrolling for lists > 50 items
- [ ] React.memo applied to high-value components
- [ ] Context split by update frequency
- [ ] Bundle size < 150 KB gzipped (initial)
- [ ] Per-route chunk < 80 KB gzipped
- [ ] TTI < 3s on 3G throttled
- [ ] Lighthouse score ≥ 75 on mobile
- [ ] prefers-reduced-motion implemented
- [ ] Network adaptive loading (slow 3G support)
- [ ] Web Vitals monitoring in place

---

## 13. Performance Testing Environments

### Local Testing

**Chrome DevTools 3G Throttle:**
1. DevTools → Network tab
2. Throttling: "Slow 3G"
3. Profile page load with Performance tab

**React DevTools Profiler:**
1. Install React DevTools extension
2. Profiler tab → Start recording
3. Interact with page, stop recording
4. Identify unnecessary re-renders

### Staging Testing

Deploy to staging with 3G throttle enabled:
```bash
npm run build
# Test on real device with mobile data (3G)
```

### Production Monitoring

- Dashboard: Lighthouse scores over time
- Alerts: TTI > 5s, LCP > 3s
- Regional metrics: Track Sudan-specific performance

---

## Key Decisions (Locked)

1. **Code splitting:** Route-based + lazy component imports
2. **Images:** WebP + JPEG, responsive srcset, blur-up LQIP
3. **Virtual scrolling:** @tanstack/react-virtual for lists > 50
4. **Memoization:** Strategic (ListingCard, CategoryTile, JobCard)
5. **Data fetching:** react-query with context-aware cache times
6. **Pagination:** Admin/search tables (explicit), homepage (infinite scroll)
7. **Monitoring:** Web Vitals + custom metrics to backend
8. **Target metrics:** LCP < 2.5s, TTI < 3.5s on 3G

---

**Status:** LOCKED for implementation  
**Reviewed by:** Design & Performance team
