# Product Admin Dashboard

A full-featured product management admin built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, and **Axios**.

Live API: [DummyJSON](https://dummyjson.com)

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open browser
http://localhost:3000
```

Login credentials (pre-filled on the login page):
- **Username:** `emilys`
- **Password:** `emilyspass`

---

## Features Completed

| Feature | Status |
|---------|--------|
| Login with DummyJSON auth + error messages | ✅ |
| Route protection (middleware + client-side guard) | ✅ |
| Logout button | ✅ |
| Product list — table on desktop, cards on mobile | ✅ |
| Pagination (page numbers, prev/next, page size 10/20/50, showing X–Y of N) | ✅ |
| Search with 450ms debounce, resets to page 1 | ✅ |
| Race condition guard (AbortController, stale request ignored) | ✅ |
| Filter by category | ✅ |
| Sort by price / rating / title (asc/desc) | ✅ |
| URL state sync (page, q, category, sortBy, order, pageSize) | ✅ |
| Invalid URL params handled gracefully | ✅ |
| Product detail page with image gallery, reviews, 404 for bad IDs | ✅ |
| Add product form with validation | ✅ |
| Edit product form with validation | ✅ |
| Delete with confirm dialog, optimistic UI removal | ✅ |
| Loading skeletons | ✅ |
| Empty state | ✅ |
| Error state + Retry button | ✅ |
| Charcoal + cream white design system, no purple/violet | ✅ |
| Button hover effects + transitions | ✅ |
| Glassmorphism cards with glitter shimmer on hover | ✅ |
| Smooth page entrance animations | ✅ |
| Shared Axios instance with auth interceptor | ✅ |
| No React Query / SWR / table libraries | ✅ |
| API calls in separate files (lib/) | ✅ |

---

## Technical Choices

### Search vs Category filter
DummyJSON has no endpoint that simultaneously searches by text *and* filters by category. My approach: **search takes priority**. When a search query is active, I call `/products/search?q=` and show an info badge that explains why the category dropdown is disabled. When no search query is present and a category is selected, I use `/products/category/:slug`. This keeps the UX clear and honest — the user always knows what mode they're in.

### Add / Edit / Delete optimistic updates
DummyJSON's CRUD endpoints return a valid-looking response (they accept the request) but changes are never persisted server-side. My approach: I call the API to get a real success/failure response, then immediately update local React state regardless — optimistic UI. A new product is prepended to the list; an edited product replaces its entry in-place; a deleted product is filtered out. The user sees the change instantly.

### Race condition guard
`useProducts` holds an `AbortController` ref. Every new fetch aborts the previous in-flight request. Even if a stale response somehow resolves, we check `controller.signal.aborted` before updating state — so fast typing never shows old results over new ones.

### URL state
All filter/pagination values live in the URL query string via `router.replace`. This means refreshing the page or sharing the link always reproduces the same view. Invalid values (e.g. `?page=abc`) are sanitised by `safeInt`/`safePageSize` helpers that fall back to sensible defaults without crashing.

### Debounce guard on submit
Login and product form save use a `useRef(false)` flag alongside `isSubmitting` state to prevent double-submits when the button is clicked rapidly — works even if React batches the state update slightly late.

---

## Where AI Helped

AI (Kiro) was used to scaffold this entire project. I understand every line — the architecture, the interceptors, the URL sync pattern, the AbortController race guard, the optimistic update flow, and the CSS design tokens. I can walk through any part of the code and make live changes.

---

## Problem Faced

**Problem:** The category filter and search cannot work together via DummyJSON — there's no combined endpoint.  
**Fix:** Prioritise search over category. When search is active, disable the category dropdown and show a small informational badge. This is a UI compromise that is honest and doesn't silently return wrong data.
