# MARBOU Frontend — Weak Internet UX Patterns

Complete design specification for offline-first patterns, sync state management, draft persistence, and optimistic UI enabling seamless experience on slow 2G/3G connections (50–500 kbps) and temporary network loss.

---

## Executive Summary

Sudanese internet: **2G/3G majority, frequent interruptions, high latency, data limits**.

**Strategy:**
1. Detect network speed/reliability (navigator.onLine + actual fetch probe)
2. Cache-first architecture (localStorage for drafts, React-Query for server data)
3. Offline draft auto-save (listing, message, review)
4. Smart sync queue (idempotent uploads, exponential backoff retry)
5. Visual sync state indicator (SyncStatusBar)
6. Optimistic UI for user-initiated actions (favorites, messages, reviews)
7. Progressive disclosure (critical content first, ads/banners deferred)

---

## 1. Network Detection

### Design Specification

The application must detect two network conditions:

1. **Online/Offline Status**: Monitor `window.online` and `window.offline` events. Additionally, implement an actual fetch probe to a small endpoint (`/api/probe`, 1KB file) to measure real connectivity. If a fetch to 1KB takes > 2000ms, classify as "slow connection" (2G/3G). If fetch fails or times out, classify as "offline."

2. **Connection Metadata**: Access `navigator.connection` API where available to detect:
   - `effectiveType`: '4g' | '3g' | '2g' | 'slow-2g'
   - `downlink`: Estimated Mbps
   - `rtt`: Round-trip time in ms
   - `saveData`: Boolean flag indicating user enabled Data Saver mode

3. **Tiered Response**: Categorize network into three tiers:
   - **Fast**: 4G or 3G with good signal
   - **Slow**: 2G, slow-2G, or probe > 2000ms
   - **Offline**: No connectivity, probe failed

### Implementation Details

Create `useNetworkStatus()` React hook that:
- Listens to `window.online`/`window.offline` events
- Periodically updates from `navigator.connection` (if available)
- Returns current status object: `{ online: boolean, effectiveType: string, downlink: number, rtt: number, saveData: boolean }`

Create `getNetworkTier()` helper that returns 'fast' | 'slow' | 'offline' based on effective type and probe results.

Create `probeNetworkSpeed()` async function that:
- Fetches 1KB probe from `/api/probe` (no-cache to force real request)
- Measures response time
- Returns 'fast' if < 2000ms, 'slow' if >= 2000ms, 'offline' if fetch fails

---

## 2. Sync State Machine

### States & Transitions

The sync machine must model 6 distinct states for upload lifecycle:

**States:**
- `saved`: Successfully synced to server (✓)
- `saved_locally`: Offline, saved locally only (💾)
- `uploading`: Currently uploading to server (⏳)
- `waiting_for_connection`: Offline, waiting for network to reconnect (⏳)
- `upload_failed`: Upload failed, show retry button (❌)
- `retrying`: Auto-retrying after failure (🔄)

**Transitions:**
```
User Save Action
    ↓
    ├─ Online? → [Uploading] → Success? → [Saved]
    │                            ↓ Fail
    │                         [Upload Failed] → Retry?
    │                            ↓ Auto/Manual
    │                         [Retrying]
    │
    └─ Offline? → [Saved Locally] → Network Available? → [Uploading]
                                       ↓ Timeout
                                   [Waiting for Connection]
```

### State Machine Interface

The sync machine must expose these methods:
- `save(data: T)`: Initiate save (upload if online, local if offline)
- `uploadStart()`: Mark transition to uploading state
- `uploadSuccess()`: Mark upload as successful, reset retry count
- `uploadFail(error)`: Mark upload as failed, decide retry or abort
- `networkAvailable()`: Trigger resume of uploads when network returns
- `networkLost()`: Handle interruption during upload
- `retryManual()`: User manually clicked retry button
- Current state readable as `state: SyncState`
- Current error readable as `error: string | null`

### Transition Rules

1. **User saves while online**: Transition immediately to `uploading`, then to `saved` or `upload_failed`
2. **User saves while offline**: Transition to `saved_locally`, persist to localStorage, mark for sync
3. **Upload fails**: If still offline, transition to `waiting_for_connection`; if online, transition to `upload_failed` (show retry button)
4. **Network returns**: If any drafts exist in `saved_locally` or `waiting_for_connection` state, automatically transition to `uploading` and retry
5. **Manual retry**: User clicks retry button; transition to `uploading`
6. **Auto-retry**: After failure, use exponential backoff (1s, 2s, 4s, 8s, max 30s) to retry automatically

### Persistence

The state machine state does **not** persist to localStorage (it's runtime only). However, any data being synced **does** persist (see Section 4: Offline Draft Persistence).

---

## 3. SyncStatusBar Component

### Component Specification

**SyncStatusBar** is a fixed-position bar displayed below the page header. It shows the current sync state with appropriate icon, message, and action.

**Requirements:**
- Fixed position: `position: fixed; top: <header-height>`
- Z-index: High (60, see design-tokens.md)
- Width: Responsive, with max-width and centered on desktop
- Auto-dismiss: On `saved` state, auto-dismiss after 2000ms
- Accessibility: Use `role="status"` with `aria-live="polite"` for screen readers
- Icon: Animated spinner during `uploading`/`retrying`, check icon for `saved`, wifi-off for connection loss
- Error message: Show error details if available

**Visual States:**
| State | Icon | Background | Message | Auto-Dismiss | Action |
|---|---|---|---|---|---|
| `saved` | ✓ Check (success-500) | success-50 / border-success-200 | "Saved" | 2000ms | None |
| `saved_locally` | 💾 Disk (primary-500) | primary-50 / border-primary-200 | "Saved locally" | None | None |
| `uploading` | ⏳ Spinner (primary-500, animating) | primary-50 / border-primary-200 | "Uploading..." | None | None |
| `waiting_for_connection` | 🌐 WiFi-Off (warning-500) | warning-50 / border-warning-200 | "Waiting for connection..." | None | None |
| `upload_failed` | ⚠️ Alert (error-500) | error-50 / border-error-200 | Error message or "Upload failed" | None | Retry button |
| `retrying` | 🔄 Spinner (warning-500, animating) | warning-50 / border-warning-200 | "Retrying..." | None | None |

**Internationalization:** All messages should be translated keys (e.g., `syncStatus_saved`, `syncStatus_uploadFailed`, `retry`)

### Implementation Details

Component accepts props:
- `state: SyncState` — Current state
- `error?: string` — Error message to display
- `onRetry?: () => void` — Callback for retry button

Component should:
- Render nothing if state is `saved` and timer hasn't fired yet (it auto-dismisses after 2000ms)
- Use Tailwind classes for layout and colors (no inline styles)
- Use animation token for spinner (see design-tokens.md: `animate-spin`)
- Announce to screen readers via aria-live
- Use flexbox for layout: icon | message-flex-1 | action-optional

---

## 4. Offline Draft Persistence

### localStorage Schema

Drafts are stored in localStorage with a structured key format and metadata for lifecycle management.

**Key Format:** `draft:{type}:{id}`  
Example: `draft:listing:123`, `draft:message:456`

**Data Structure** (per draft):
```
{
  id: string (UUID)
  type: 'listing' | 'message' | 'review' | 'profile'
  data: { /* user-entered data */ }
  createdAt: number (timestamp ms)
  updatedAt: number (timestamp ms)
  expiresAt: number (timestamp ms) — TTL 7 days from creation
  size: number (bytes) — JSON.stringify(data).length for quota tracking
  synced: boolean — Has this draft been synced to server?
  syncError?: string — Last sync error message
}
```

**Constraints:**
- Max TTL: 7 days (expiration cleanup on next app load)
- Max draft size: 5 MB total (localStorage limit)
- Overflow handling: If localStorage is full, run cleanup of expired drafts; if still full, fail gracefully with user notification

### Lifecycle

1. **Create/Update**: User modifies a form field → `saveDraft()` persists to localStorage immediately (see Section 5 for debouncing)
2. **Auto-Cleanup**: On app load, call `cleanupExpiredDrafts()` to remove stale entries
3. **Resume**: When user returns to a page with unsaved draft, show notification: "You have an unsaved [type] draft from [date]. Resume?" with action buttons
4. **Delete**: After successful sync, call `deleteDraft(type, id)` to clear localStorage entry

### API Methods

Required methods:
- `saveDraft<T>(type, id, data): OfflineDraft<T>` — Save or update draft
- `loadDraft<T>(type, id): OfflineDraft<T> | null` — Load draft (returns null if expired)
- `deleteDraft(type, id): void` — Remove draft
- `cleanupExpiredDrafts(): void` — Run cleanup (loop localStorage, check expiry, delete expired)

### Size Management

- Before saving, check `JSON.stringify(data).length` fits in remaining 5 MB quota
- If quota exceeded, run cleanup; if still exceeded, notify user and fail save gracefully (show toast: "Storage full, cannot save draft")
- After successful server sync, automatically delete draft to free space

---

## 5. Auto-Save on Input

### Design Specification

When user modifies a form field, the application should:
1. Debounce saves to prevent excessive localStorage writes (min 5 seconds between saves)
2. Automatically persist form data as draft
3. Continue saving even if network is unavailable
4. Provide no UI feedback during auto-save (silent, in background)

### Debounce Behavior

- On form field change, schedule a save for 5000ms in the future
- If another field changes before 5s elapses, clear timer and reschedule
- After 5s of inactivity, save draft to localStorage
- No "saving..." indicator needed (it's background work)

### Hook: `useAutoSave<T>(data: T, key: string, delay?: number)`

Accepts:
- `data`: Current form state object (to be persisted)
- `key`: Unique identifier for this draft (e.g., listing ID or 'new' for new listing)
- `delay`: Debounce delay in ms (default: 5000)

Behavior:
- On mount, load existing draft if available and populate form
- On data change, debounce and save to localStorage
- On unmount, ensure any pending save is flushed
- No return value needed (side effect only)

### Usage Pattern

In `AddListingPage`:
```
1. Initialize form state from loaded draft (or empty)
2. Call useAutoSave(formData, 'new', 5000)
3. User edits fields → auto-saved every 5s of inactivity
4. User navigates away → draft persists
5. User returns → draft loaded and form repopulated
6. User publishes → draft deleted after successful sync
```

---

## 6. Resume on Reconnect

### Design Specification

When a user returns to the application (or reconnects after network outage), the system must:
1. Detect if an unsaved draft exists from previous session
2. Notify the user: "You have an unsaved [type] from [date]. Resume?"
3. Provide "Resume" and "Discard" actions
4. If resumed, restore form data and continue editing
5. If discarded, delete draft and start fresh

### Hook: `useResumeDraft<T>(type: string, id: string)`

Behavior:
- On mount, call `loadDraft(type, id)` to check for existing draft
- If draft exists and is not expired:
  - Show notification with resume/discard options
  - If user clicks resume: emit event or callback to restore form state
  - If user clicks discard: call `deleteDraft()` and proceed fresh
- Return draft data or null so component can use it

### Notification Format

Example: "📋 You have an unsaved listing from 2 hours ago. \[Resume\] \[Discard\]"

---

## 7. Upload Queue & Retry Strategy

### Queue Design

The upload queue manages outgoing requests that failed or are pending sync. It ensures:
1. **Idempotency**: Each upload attempt includes a unique `X-Idempotency-Key` header so server can deduplicate
2. **Exponential Backoff**: Retry delays: 1s, 2s, 4s, 8s, 16s, max 30s
3. **Background Processing**: Queue processes in background; user can continue working
4. **Status Visibility**: SyncStatusBar shows queue status

### Queue Data Structure

Each queued item tracks:
- `id`: Unique identifier (UUID)
- `type`: 'listing' | 'message' | 'review'
- `data`: Payload to upload
- `attempt`: Retry count (0, 1, 2, ...)
- `createdAt`: When item was queued
- `nextRetryAt`: When to next attempt (used for backoff)
- `idempotencyKey`: Unique identifier for deduplication (UUID, same across all retries)

### Queue Behavior

1. **Enqueue**: When user saves offline or upload fails, add item to queue with `idempotencyKey = UUID`
2. **Process**: When online, process queue in FIFO order
3. **Upload**: Send POST to `/api/{type}/` with header `X-Idempotency-Key: {idempotencyKey}`
4. **Success**: Remove from queue, delete draft, show success sync state
5. **Failure**: Increment attempt, calculate next retry time using exponential backoff, keep in queue
6. **Auto-Resume**: When network comes back online (window.online event), call queue.resume() to start processing

### Idempotency Key Strategy

- Generate `idempotencyKey = crypto.randomUUID()` when first enqueueing
- Send same key in all retries
- Server must check: if this key was seen before, return cached success response (don't process again)
- Prevents duplicate entries on retry

### Exponential Backoff Formula

```
next_retry_ms = min(1000 * pow(2, attempt), 30000)
For attempt 0: 1000ms
For attempt 1: 2000ms
For attempt 2: 4000ms
For attempt 3: 8000ms
For attempt 4: 16000ms
For attempt 5+: 30000ms (capped)
```

### Class/API Specification

Queue object (global singleton) exposes:
- `enqueue(type: string, data: any, idempotencyKey?: string): string` — Returns item ID
- `processQueue(): Promise<void>` — Process all ready items
- `resume()`: Manually trigger processing (called on window.online)
- `getQueueSize(): number` — Current item count
- `getQueuedItems(): QueuedUpload[]` — For UI to inspect queue

### Network Recovery Integration

Listen to `window.online` event and call `uploadQueue.resume()` to restart processing when network recovers.

---

## 8. Optimistic UI Patterns

### Decision Matrix

Which actions should be optimistic (update UI immediately before server confirms) vs. pessimistic (wait for server response)?

| Action | Strategy | Why |
|---|---|---|
| **Toggle favorite** | Optimistic | Instant feedback; easy to revert if fails |
| **Send message** | Optimistic | Chat feels real-time; can retry if fails |
| **Post review** | Optimistic | Feedback immediate; low destructive risk |
| **Publish listing** | Pessimistic | Complex validation server-side; high stakes if wrong |
| **Delete listing** | Pessimistic | Destructive; must confirm first |
| **Payment** | Pessimistic | Financial transaction; must succeed first |
| **Update profile** | Pessimistic | Identity data; server must validate |

### Optimistic Favorite Pattern

Component should:
1. On favorite button click, immediately toggle local state (heart becomes filled)
2. In background, fire async request to `/api/favorite/{listingId}`
3. If request succeeds, keep state as toggled
4. If request fails, revert state to original and show error toast

Error handling: "Failed to update favorite. Try again?"

### Optimistic Message Send Pattern

Component should:
1. On send, create optimistic message object with temp ID (UUID)
2. Add to message list immediately, mark with visual indicator (e.g., status="sending", opacity reduced)
3. In background, POST message to server
4. On success, replace temp ID with server-assigned ID, remove opacity, mark status="sent"
5. On failure, mark status="failed", show retry button inline on message

Error handling: User can manually retry failed message or discard.

### Revert on Failure

If optimistic action fails:
- Revert state to before-action
- Show error toast with retry option
- For favorite: revert heart icon; for message: show retry button

---

## 9. Skeleton Loading & Progressive Disclosure

### Progressive Content Loading Strategy

Load page in priority order to show something immediately:

**Priority 1 (Always):**
- Page header (navigation, search bar)
- Main content skeleton matching layout

**Priority 2 (Load after critical content visible):**
- Listing details (title, price, description)
- Sidebar filters (if applicable)

**Priority 3 (Load after main content):**
- Related/recommended listings
- User reviews
- Q&A section

**Priority 4 (Lowest priority, defer on slow networks):**
- Ads and banners
- Analytics pixels
- Social widgets

### Implementation Approach

Use React `<Suspense>` boundary:
- Main content: `<Suspense fallback={<Skeleton />}><Content /></Suspense>`
- Secondary: `<Suspense fallback={null}><Secondary /></Suspense>` (hide fallback)
- Tertiary: Only load if viewport near (Intersection Observer)

### Skeleton Animation

**Pulse animation** (not shimmer):
- Pulse is a simple opacity animation (1 → 0.7 → 1) repeating every 2s
- Much lighter CPU than shimmer effect
- Works well on mobile
- On `prefers-reduced-motion: reduce`, stop animation (static placeholder)

### Skeleton CSS

```
.skeleton {
  background-color: sand-200 (see design-tokens)
  animation: pulse 2s ease-in-out infinite
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; opacity: 0.6; }
}
```

---

## 10. Testing Weak Network

### Browser DevTools Simulation

1. Open Chrome DevTools
2. Network tab
3. Throttling dropdown: Select "Slow 3G"
4. For offline: Check "Offline" checkbox

### Real Device Testing (Android)

```
# Simulate offline (airplane mode)
adb shell settings put global airplane_mode_on 1

# Turn back on
adb shell settings put global airplane_mode_on 0
```

### Testing Checklist

**Network Detection:**
- [ ] Load on Slow 3G throttle; verify content loads with skeleton
- [ ] Toggle offline; verify SyncStatusBar shows "offline" state
- [ ] Toggle back online; verify automatic sync resume

**Auto-Save:**
- [ ] Edit form field; wait 5s; inspect localStorage to confirm draft saved
- [ ] Refresh page; form repopulates from draft
- [ ] Continue editing; verify updates to draft on next 5s debounce

**Optimistic Actions:**
- [ ] Toggle favorite; icon updates immediately
- [ ] Disable network; confirm icon state persists locally
- [ ] Send message on offline; message appears in list with "sending" state
- [ ] Re-enable network; message sends and state updates to "sent"

**Upload Queue:**
- [ ] Save listing while offline; add to queue
- [ ] Go online; verify SyncStatusBar transitions to "uploading" → "saved"
- [ ] Simulate upload failure; verify "upload failed" state and retry button
- [ ] Click retry; verify upload resumes

**Error Recovery:**
- [ ] Abort upload in DevTools; verify state → "upload_failed"
- [ ] Manually click retry; upload resumes
- [ ] Leave network off; verify auto-retry triggers on window.online event

**localStorage Limits:**
- [ ] Create many drafts until localStorage ~full (4.5 MB of 5 MB limit)
- [ ] Create new draft; verify cleanup runs and new draft saves
- [ ] Verify old expired drafts removed

---

## 11. Implementation Roadmap

### Phase 1: Foundation
- [ ] Implement `useNetworkStatus()` hook
- [ ] Implement `SyncStateMachine` (state transitions only, no persistence)
- [ ] Implement `SyncStatusBar` component
- [ ] Implement draft persistence functions (`saveDraft`, `loadDraft`, `deleteDraft`, `cleanupExpiredDrafts`)
- [ ] Implement `useAutoSave()` hook with 5s debounce

### Phase 2: Integration
- [ ] Integrate auto-save into AddListingPage form
- [ ] Integrate auto-save into MessagePage
- [ ] Implement `useResumeDraft()` and show resume notifications
- [ ] Implement upload queue with exponential backoff
- [ ] Wire SyncStatusBar to sync machine state

### Phase 3: Optimistic UI
- [ ] Implement optimistic favorite toggle
- [ ] Implement optimistic message send (temp ID → real ID)
- [ ] Add status indicators to messages (sending, sent, failed)
- [ ] Implement retry buttons for failed messages/uploads

### Phase 4: Testing & Optimization
- [ ] Browser DevTools testing on Slow 3G
- [ ] Real device testing on Android with airplane mode
- [ ] localStorage quota testing
- [ ] Monitor metrics: queue size, retry counts, sync success rate

---

## 12. Key Decisions (Locked)

1. **Draft storage:** localStorage (not IndexedDB; simpler, no quota issues at 5 MB)
2. **Auto-save debounce:** 5 seconds of inactivity (balance: frequent enough to not lose data, rare enough to not thrash localStorage)
3. **Retry strategy:** Exponential backoff 1s → 30s max (standard; balances battery/network with eventual success)
4. **Idempotency:** Per-upload UUID sent as `X-Idempotency-Key` header (server caches results)
5. **Optimistic vs. Pessimistic:** Favorites/messages optimistic; listing publish/payment pessimistic (risk-based)
6. **Sync indicator:** Fixed bar below header (visible but not intrusive; auto-dismisses on success)
7. **Skeleton animation:** Pulse, not shimmer (CPU-efficient for mobile)
8. **Draft TTL:** 7 days (balance between user expectation and storage limits)
9. **Network probe:** 1 KB fetch to `/api/probe` (quick, representative of real network)
10. **Data Saver support:** If `saveData` flag set, defer all non-critical images (see image-strategy.md)

---

**Status:** DESIGN LOCKED  
**Implementation Phase:** Ready  
**Critical for:** Sudan market launch (offline scenarios common)
