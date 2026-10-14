# MARBOU Frontend — Image Optimization & Lazy Loading Strategy

Complete specification for image pipeline, responsive sizing, lazy loading, blur-up placeholders, and data-saver mode enabling fast performance on weak Sudanese internet.

---

## 1. Image Pipeline Architecture

### End-to-End Flow

```
User Uploads Image
       ↓
Frontend Validation (type, size)
       ↓
Send to Backend API
       ↓
Backend: Security Scan
       ↓
Backend: Image Processing
  ├─ Resize to presets (80×80, 400×300, 800×600, 1200×800)
  ├─ Compress (85% quality)
  ├─ Generate WebP + JPEG variants
  ├─ Generate 20px LQIP (blur-up placeholder)
  ├─ Optional: AVIF for modern browsers
       ↓
CDN Upload (with cache headers)
       ↓
Return Metadata
  ├─ Original URL
  ├─ LQIP (base64 data URI)
  ├─ Srcset JSON
       ↓
Frontend: Cache in localStorage
       ↓
Frontend: Lazy Load on User Request
       ↓
Display with Picture Element + Srcset
```

---

## 2. Size Presets & Specifications

### Standard Presets

Generated server-side; CDN serves both WebP and JPEG.

| Preset | Dimensions | Aspect | Max Size (WebP) | Use Case |
|---|---|---|---|---|
| **thumbnail** | 80×80 | 1:1 | 5 KB | Seller avatars, business cards |
| **small** | 200×150 | 4:3 | 12 KB | Admin thumbnails, related items |
| **card** | 400×300 | 4:3 | 25 KB | Grid listings, category tiles |
| **card-lg** | 600×450 | 4:3 | 45 KB | List view, featured listings |
| **detail** | 800×600 | 4:3 | 60 KB | Listing detail main image |
| **detail-lg** | 1200×900 | 4:3 | 100 KB | Hero sections, full-width gallery |
| **avatar** | 64×64 | 1:1 | 3 KB | Profile pictures, badges |
| **cover** | 1200×300 | 4:1 | 80 KB | Business profile header |
| **video-thumb** | 400×300 | 4:3 | 20 KB | Video preview thumbnail |

### Optimization Parameters

| Format | Quality | Max KB | Browser Support |
|---|---|---|---|
| **WebP** | 85% | As above | 95%+ (2023+) |
| **JPEG** | 85% | 30–50% larger | 100% (fallback) |
| **AVIF** | 75% | 20–30% smaller | 60%+ (future) |

### Size Estimation Methodology

**Note:** Size estimates above (e.g., "card: 400×300 = 25 KB WebP") are based on 85% quality compression applied to typical Sudanese marketplace images (vehicles, real estate, fashion items). Actual compressed file sizes vary by image content:
- **Photography** (vehicles, real estate, fashion): 20–35 KB for 400×300
- **Graphics** (logos, icons): 8–12 KB for 400×300
- **Mixed content** (screenshots, mixed): 15–30 KB for 400×300

**Verification:** Compress sample images from each category using the backend settings to confirm sizes in your environment.

### Responsive Srcset Breakpoints

For grid/list views (adapts to screen width):

```
Desktop (1200px+): 400×300 (card preset) or 600×450 (card-lg)
Tablet (640px+):   400×300 (card preset)
Mobile (<640px):   200×150 (small preset)
```

**Typical srcset:**
```
/images/listing-123-small.webp 200w,
/images/listing-123-card.webp 400w,
/images/listing-123-detail.webp 800w
```

---

## 3. Backend Image Processing Specification

### Technology Stack (Locked)

- **Language:** Node.js
- **Library:** Sharp (recommended for performance, Docker-friendly)
- **Installation:** `npm install sharp`

### Quality Settings (Locked for Launch)

- **WebP:** 85% quality (imperceptible loss on marketplace photography, good size/quality balance)
- **JPEG:** 85% quality (fallback for older browsers)
- **AVIF:** 75% quality (lower needed due to better compression; visual parity with 85% WebP)
- **LQIP:** 60% quality, 1.5 blur radius, 20px width (maintains readability at tiny size)

**Rationale:**
- 85% JPEG/WebP achieves imperceptible quality loss for typical marketplace photography (vehicles, real estate, fashion)
- AVIF compresses significantly better; 75% AVIF ≈ 85% WebP visually
- LQIP blur preserves enough detail to hint at image content while staying tiny

### Output JSON Schema (Locked)

Each image upload **must** return this exact structure:

```json
{
  "id": "listing-123",
  "filename": "car-front-view.jpg",
  "originalSize": 4521024,
  "uploadedAt": "2024-01-15T10:30:00Z",
  "images": {
    "thumbnail": {
      "url": "/api/images/listing-123-thumbnail.webp",
      "width": 80,
      "height": 80,
      "size": 3456,
      "formats": {
        "webp": "/api/images/listing-123-thumbnail.webp",
        "jpeg": "/api/images/listing-123-thumbnail.jpg",
        "avif": "/api/images/listing-123-thumbnail.avif"
      }
    },
    "small": {
      "url": "/api/images/listing-123-small.webp",
      "width": 200,
      "height": 150,
      "size": 9876,
      "formats": {
        "webp": "/api/images/listing-123-small.webp",
        "jpeg": "/api/images/listing-123-small.jpg"
      }
    },
    "card": {
      "url": "/api/images/listing-123-card.webp",
      "width": 400,
      "height": 300,
      "size": 21456,
      "formats": {
        "webp": "/api/images/listing-123-card.webp",
        "jpeg": "/api/images/listing-123-card.jpg",
        "avif": "/api/images/listing-123-card.avif"
      }
    },
    "detail": {
      "url": "/api/images/listing-123-detail.webp",
      "width": 800,
      "height": 600,
      "size": 54321,
      "formats": {
        "webp": "/api/images/listing-123-detail.webp",
        "jpeg": "/api/images/listing-123-detail.jpg"
      }
    },
    "detail-lg": {
      "url": "/api/images/listing-123-detail-lg.webp",
      "width": 1200,
      "height": 900,
      "size": 98765,
      "formats": {
        "webp": "/api/images/listing-123-detail-lg.webp",
        "jpeg": "/api/images/listing-123-detail-lg.jpg"
      }
    }
  },
  "lqip": "data:image/webp;base64,UklGRiYAAABXRUJQVlA4IBYAAAAwAQCdAS...",
  "srcset": {
    "webp": "/api/images/listing-123-small.webp 200w, /api/images/listing-123-card.webp 400w, /api/images/listing-123-detail.webp 800w",
    "jpeg": "/api/images/listing-123-small.jpg 200w, /api/images/listing-123-card.jpg 400w, /api/images/listing-123-detail.jpg 800w"
  }
}
```

**Required behavior:**
1. Loop through all PRESETS (thumbnail, small, card, card-lg, detail, detail-lg)
2. For each preset, generate WebP (quality 85), JPEG (quality 85), and AVIF (quality 75, only for presets ≥ 400px wide)
3. Generate LQIP: resize to 20px width, blur 1.5, WebP quality 60, encode as base64 data URI
4. Return metadata in exact JSON schema above
5. Set cache headers: `Cache-Control: public, immutable, max-age=31536000`

---

## 4. Lazy Loading Implementation

### Native HTML5 `loading="lazy"`

Use native attribute for below-fold images:

```html
<img
  src="/images/listing-123-card.webp"
  alt="Listed property"
  loading="lazy"
  width="400"
  height="300"
/>
```

**Browser behavior:**
- Waits until image enters viewport (or 50px before on most browsers)
- No JavaScript required
- ~1KB savings vs. IntersectionObserver

### Programmatic IntersectionObserver

For fine control, analytics, or debugging:

- Use `IntersectionObserver` API with `rootMargin: '50px'` to start loading 50px before viewport
- Log lazy-load events to analytics (optional)
- Disconnect observer after image loads

### Prefetch High-Priority Images

For above-fold hero images:
- Use `loading="eager"` (skip lazy loading)
- Load immediately on page load
- No blur-up delay

---

## 5. Blur-Up Placeholder (LQIP)

### Low-Quality Image Placeholder Strategy

Show 20px blurred thumbnail while full image loads.

**Behavior:**
1. Backend generates LQIP: resize to 20px, blur 1.5, encode as base64 data URI
2. Include LQIP in metadata response
3. Frontend displays blur-up background until full image loads
4. Fade out blur-up background when full image loaded (CSS opacity transition)

**Visual effect:**
- User sees tiny blurred version immediately (responsive feel)
- As real image loads, blur fades out to reveal sharp image
- Smooth transition, no layout shift

### Implementation Pattern

Backend sends LQIP as `data:image/webp;base64,...` in metadata.

Frontend component:
- Display placeholder container with LQIP as background blur
- Render full image on top with opacity 0
- On image load, transition opacity to 1 (fade in)
- Duration: 300ms ease-in-out

---

## 6. Picture Element + Srcset

### Multi-Format, Multi-Size Delivery

Use HTML `<picture>` element for optimal format selection and responsive sizing:

**Structure:**
```
<picture>
  <!-- Modern: WebP first (smallest) -->
  <source srcset="..." type="image/webp" />
  
  <!-- Fallback: JPEG for older browsers -->
  <source srcset="..." type="image/jpeg" />
  
  <!-- Final fallback: <img> -->
  <img src="..." alt="..." loading="lazy" />
</picture>
```

**Srcset includes multiple sizes:**
- `200w` (small preset, mobile)
- `400w` (card preset, tablet)
- `800w` (detail preset, desktop)

**Browser automatically selects:**
1. Most modern format it supports (WebP > JPEG)
2. Optimal size for device/screen (via CSS media queries)

---

## 7. Data-Saver Mode: Image Deferral

When user or browser has Data Saver enabled (`navigator.connection.saveData`):

**Behavior:**
1. Detect `navigator.connection.saveData` flag
2. For all images: Show category-color placeholder instead of loading
3. Display "Tap to load image" text
4. On user tap: Load and display actual image

**Category-color palette:**
- Vehicles: Primary green (#2a6f44)
- Real Estate: Sand (#d4ab5e)
- Electronics: Accent orange (#f97e16)
- Fashion: Dark (#1f2937)
- Furniture: Gray (#6b7280)
- Jobs: Blue (#3b82f6)
- Services: Green (#22c55e)
- Default fallback

**Benefit:** Dramatic data savings on slow networks; user controls when images load.

---

## 8. Error Handling & Fallbacks

### Broken Image Fallback

When image fails to load:
- Display placeholder box with broken-image icon
- Show error message: "Unable to load"
- Do not retry automatically (only on user action if desired)

### Network Error Retry Logic

For transient network failures:
- Implement exponential backoff: 1s, 2s, 4s delay between retries
- Max 3 retry attempts (configurable)
- Use cache-busting query param on retry to force fresh fetch
- Show "Retry" button if all attempts fail

---

## 9. Video Strategy

### Thumbnail-First Approach

Videos are **not** embedded directly; instead:
1. Show thumbnail image (same as image preset: 400×300)
2. Display play button overlay
3. On user tap: Load and play video in modal or native player

**Behavior:**
- Thumbnail loads like any image (srcset, lazy, blur-up)
- Video file only loads when user clicks play
- Significant data savings (don't download video unless viewed)

### Video Constraints

Per SRS requirement, admin-configurable (no app rebuild):
- **Default max duration:** 30 seconds
- **Default max file size:** 15 MB
- **Compression codec:** H.264 @ 2 Mbps (server-side encoding)
- **Delivery:** Progressive MP4 via HTTP byte-range requests (native `<video>` element)

**Admin panel** allows changing limits without code changes.

---

## 10. CDN & Cache Strategy

### Cache Headers (Locked)

```
/images/listing-123-v2.webp
Cache-Control: public, immutable, max-age=31536000
# Versioned images are forever cacheable; version changes if listing updated
```

### Cache Busting

When listing image updated:
1. Increment version: `listing-123-v2` → `listing-123-v3`
2. Upload new image file with new version
3. Update API metadata to reference new version URL
4. CDN serves new version immediately; old version expires naturally

**No CDN purge API needed** — version in URL handles cache busting.

### CDN Infrastructure Dependencies (TBD)

- **Image storage location:** TBD (S3, GCS, local NFS)
- **CDN endpoint:** TBD (e.g., https://cdn.marbou.sd or AWS CloudFront)
- **Geo-distribution:** Required for Sudan + regional expansion
- **Monitoring targets:** Latency < 500ms, cache hit ratio > 95%

**Backend team to specify during implementation.**

---

## 11. Frontend Responsive Image Component

### Component Specification

**ResponsiveImage** component accepts:
- `baseUrl`: Base image URL (e.g., `/images/listing-123`)
- `alt`: Alt text
- `lqip`: Base64 LQIP from backend metadata
- `category`: Category ID (for Data Saver color placeholder)
- `width`, `height`: Dimensions for aspect-ratio
- `priority`: Boolean (true = eager load, false = lazy load)

**Component behavior:**
- If Data Saver enabled and category provided: show category-color placeholder
- Otherwise: render `<picture>` with WebP/JPEG sources
- Use `loading="lazy"` for below-fold images
- Apply LQIP as background blur, fade-in real image on load
- Handle load/error states gracefully

**Accessibility:**
- `alt` text always provided
- Picture element semantic HTML
- Tab-focusable if clickable (photo gallery)

---

## 12. Performance Metrics & Monitoring

### Web Vitals Targets

| Metric | Target | Notes |
|---|---|---|
| **LCP** (Largest Contentful Paint) | < 2.5s | Above-fold image load time |
| **FCP** (First Contentful Paint) | < 1.8s | Initial placeholder render |
| **CLS** (Cumulative Layout Shift) | < 0.1 | No layout shift as image loads |

**Monitoring:** Use web-vitals library or Lighthouse CI; alert if breached.

### Custom Metrics

Track to analytics:
- Image lazy-load events (time from viewport entry to load)
- Data-Saver mode activation rate
- Image load errors and retry count
- Network connection type for each image (geolocation for Sudan-specific tuning)

---

## 13. Implementation Roadmap

### Phase 1: Backend Image Processing (Priority 1, longest lead time)
- [ ] Implement Sharp pipeline for all presets
- [ ] Quality settings locked (85% WebP/JPEG, 75% AVIF)
- [ ] LQIP generation (20px blur)
- [ ] Output JSON schema validation
- [ ] Cache header configuration
- [ ] Test with 10 sample images per category; verify file sizes

### Phase 2: Frontend Image Component
- [ ] ResponsiveImage component skeleton
- [ ] Picture element + srcset implementation
- [ ] Lazy loading with `loading="lazy"` + IntersectionObserver
- [ ] LQIP blur-up CSS transition

### Phase 3: Data-Saver & Error Handling
- [ ] useDataSaverMode hook
- [ ] Category-color placeholders
- [ ] Error fallback UI
- [ ] Retry logic with exponential backoff

### Phase 4: Integration & Testing
- [ ] MediaUploader component integration
- [ ] Video thumbnail + play button
- [ ] Performance testing (Lighthouse)
- [ ] Network throttling test (Slow 3G)
- [ ] Data-Saver test (Chrome DevTools)

---

## 14. Key Decisions (Locked)

1. **Presets:** Fixed 9 sizes (thumbnail through detail-lg) to avoid O(n) image generation
2. **Lazy loading:** Native HTML5 `loading="lazy"` (no JS overhead)
3. **Formats:** WebP primary, JPEG fallback, AVIF future
4. **LQIP:** 20px blurred WebP, base64 embedded (fast, no extra request)
5. **Picture element:** Semantic HTML, no custom image component library
6. **Data-Saver:** Category color placeholder, tap-to-load (user choice, maximum data savings)
7. **Cache:** Versioned URLs (listing-123-v2.webp), immutable headers
8. **Video:** Thumbnail + play button (no auto-embed)

---

**Status:** DESIGN LOCKED  
**Last Updated:** Design Phase  
**Critical for:** Fast, responsive images on weak Sudanese internet
