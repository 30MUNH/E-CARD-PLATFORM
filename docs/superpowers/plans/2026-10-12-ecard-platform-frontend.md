# E-Card Platform Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the single-customer E-Card recreation into a reusable, configuration-driven E-Card Platform frontend with an Admin Dashboard, responsive recipient experience, and clean integration contracts for Codex's backend.

**Architecture:** Separate the existing hardcoded data from presentation components by introducing a typed `EcardConfig` schema consumed through React Context. Create a service abstraction layer (`CardRepository`, `MediaService`, `CardAccessService`) backed by mock implementations. Build the Admin Dashboard as a distinct route tree (`/admin/*`) using a clean SaaS layout, while the recipient experience (`/ecd/game/:uuid`) keeps its existing romantic visual identity and gains genuine tablet/desktop responsive layouts (not phone-in-frame).

**Tech Stack:** React 18, TypeScript, Vite 6, Tailwind CSS 3.4, React Router 6, framer-motion 11, Howler.js, react-youtube, react-hot-toast, Playwright

**Spec:** This plan implements the user request from 2026-10-12 (Phase 1 — E-Card Platform Frontend Architecture & UI/UX Development).

## Global Constraints

- Do not delete or unnecessarily rewrite existing working components, animations, or assets.
- Do not implement backend logic, real database access, real authentication, or real URL generation.
- Do not store plaintext PINs in source code, localStorage, mock data, or VCS.
- Do not hardcode customer content into reusable components.
- Keep all work on branch `feat/ecard-platform-frontend`.
- Preserve existing Playwright E2E tests; all 10 must continue passing.
- Viewports: Mobile `390×844`, Tablet `768×1024`, Desktop `1440×900`.
- Production build (`npm run build`) must succeed with 0 errors throughout.

## Review Focus

1. **Mock data leaking as real auth:** Verify the mock `CardAccessService.verifyPin()` is clearly marked demo-only and never stores/returns real PINs. The recipient PIN screen must use an injectable callback, not import hardcoded hashes.
2. **Existing E2E test regression:** After refactoring `ecardData.ts` and component props, all 10 existing Playwright tests must still pass — the recipient experience route and DOM selectors must remain stable.
3. **Admin form state loss on preview:** Navigating to Live Preview and back must preserve unsaved admin form state. React state must not be destroyed by route changes.
4. **Template asset path assumptions:** Components must resolve images through `resolveImageUrl()` or equivalent, not assume `/user-media/` paths. The admin media upload UI must handle blob: URLs for preview before upload.
5. **Responsive breakpoint gaps:** Tablet layouts (768–1024px) must not fall through to either mobile or desktop styling — explicit `md:` breakpoint rules are required for the recipient experience.

---

### Task 1: Git Initialization & Branch Setup

**Files:**
- Create: `.gitignore`
- Modify: (none — git operations only)

**Interfaces:**
- Consumes: Nothing
- Produces: A clean git repository on branch `feat/ecard-platform-frontend` with the existing codebase as the initial commit on `main`.

- [ ] **Step 1: Initialize git repository**

```bash
cd /home/tts/Documents/LHA
git init
```

- [ ] **Step 2: Create `.gitignore`**

```
node_modules/
dist/
test-results/
playwright-report/
*.tsbuildinfo
.DS_Store
```

- [ ] **Step 3: Initial commit on main**

```bash
git add -A
git commit -m "chore: initial commit — existing E-Card recreation"
```

- [ ] **Step 4: Create feature branch**

```bash
git checkout -b feat/ecard-platform-frontend
```

- [ ] **Step 5: Verify branch**

Run: `git branch`
Expected: `* feat/ecard-platform-frontend` and `main`

---

### Task 2: Data Abstraction — EcardConfig Schema & Service Interfaces

**Files:**
- Create: `src/types/ecard.ts`
- Create: `src/services/CardRepository.ts`
- Create: `src/services/MediaService.ts`
- Create: `src/services/CardAccessService.ts`
- Create: `src/services/mock/MockCardRepository.ts`
- Create: `src/services/mock/MockMediaService.ts`
- Create: `src/services/mock/MockCardAccessService.ts`
- Create: `src/services/index.ts`
- Modify: `src/data/ecardData.ts` — extract types to `src/types/ecard.ts`, keep `PRELOADED_ECARD_DATA` as a backward-compatible re-export.

**Interfaces:**
- Consumes: Existing `EcardPreloadData`, `EcardMetadata`, `AlbumItem`, `LetterData`, `MusicItem`, `SlideDefinition` types from `src/data/ecardData.ts`.
- Produces:
  - `EcardConfig` — full typed configuration for rendering one E-Card (extends `EcardPreloadData` with admin metadata like `status`, `title`, `createdAt`).
  - `CardSummary` — lightweight list item type (`{ id, title, recipientName, senderName, status, templateId, createdAt, updatedAt }`).
  - `CardRepository` interface: `listCards(): Promise<CardSummary[]>`, `getCard(id: string): Promise<EcardConfig>`, `createCard(data: Partial<EcardConfig>): Promise<EcardConfig>`, `updateCard(id: string, data: Partial<EcardConfig>): Promise<EcardConfig>`, `publishCard(id: string): Promise<{ publicUrl: string }>`, `archiveCard(id: string): Promise<void>`.
  - `MediaService` interface: `uploadMedia(file: File): Promise<{ url: string; id: string }>`, `deleteMedia(id: string): Promise<void>`, `getMediaUrl(id: string): string`.
  - `CardAccessService` interface: `getPublicMetadata(uuid: string): Promise<{ title: string; hasPin: boolean; templateId: string }>`, `verifyPin(uuid: string, pin: string): Promise<{ authorized: boolean; cardData?: EcardConfig }>`.
  - Mock implementations for all three services using in-memory data seeded from `PRELOADED_ECARD_DATA`.

- [ ] **Step 1: Create `src/types/ecard.ts`**

Move all interface/type definitions (`EcardMetadata`, `HomepageData`, `AlbumItem`, `LetterData`, `MusicItem`, `EcardPreloadData`, `SlideDefinition`) from `ecardData.ts` into this file. Add:
- `EcardStatus = 'draft' | 'published' | 'archived'`
- `EcardConfig` extending `EcardPreloadData` with `{ title: string; status: EcardStatus; createdAt: string; updatedAt: string; publicUrl?: string }`
- `CardSummary = { id: string; title: string; recipientName: string; senderName: string; status: EcardStatus; templateId: string; createdAt: string; updatedAt: string }`

- [ ] **Step 2: Create service interfaces in `src/services/CardRepository.ts`, `src/services/MediaService.ts`, `src/services/CardAccessService.ts`**

Each file exports one TypeScript interface with the signatures listed in the Interfaces block above. No implementations.

- [ ] **Step 3: Create mock implementations**

`src/services/mock/MockCardRepository.ts` — stores an in-memory `Map<string, EcardConfig>` seeded with one card derived from `PRELOADED_ECARD_DATA`. `listCards()` returns `CardSummary[]` mapped from the map. `createCard()` generates a UUID via `crypto.randomUUID()`. `publishCard()` returns a fake `publicUrl` like `https://example.com/ecd/game/<id>` with a `console.info('[MOCK] publishCard — integration pending')` log.

`src/services/mock/MockMediaService.ts` — `uploadMedia()` creates a blob URL from the File and returns `{ url: URL.createObjectURL(file), id: crypto.randomUUID() }`. `deleteMedia()` calls `URL.revokeObjectURL()`.

`src/services/mock/MockCardAccessService.ts` — `verifyPin()` always returns `{ authorized: true, cardData: <seeded card> }` with a `console.info('[MOCK] verifyPin — server-side verification pending')` log. Never stores or compares real PINs.

- [ ] **Step 4: Create barrel export `src/services/index.ts`**

Re-exports all interfaces + factory functions: `createCardRepository(): CardRepository`, `createMediaService(): MediaService`, `createCardAccessService(): CardAccessService` that return mock instances.

- [ ] **Step 5: Update `src/data/ecardData.ts` to re-export types from `src/types/ecard.ts`**

Replace inline type declarations with `export { ... } from '../types/ecard'`. Keep `PRELOADED_ECARD_DATA`, `SLIDES`, `DEFAULT_ECARD_UUID`, `resolveImageUrl`, `verifyPinInput`, and `calculateLoveDays` in place so existing component imports remain valid.

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: Exit code 0, no type errors.

- [ ] **Step 7: Run existing E2E tests**

Run: `npx playwright test`
Expected: 10/10 passed — no regressions from type extraction.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: data abstraction — EcardConfig schema, service interfaces, and mock implementations"
```

---

### Task 3: EcardRenderer — Configuration-Driven Recipient Component

**Files:**
- Create: `src/renderer/EcardRenderer.tsx`
- Create: `src/renderer/EcardContext.tsx`
- Create: `src/renderer/slides/index.ts`
- Modify: `src/App.tsx:226-348` — refactor `CustomEcardCarouselWithGame` to wrap `EcardRenderer` with data from service layer or `PRELOADED_ECARD_DATA` fallback.

**Interfaces:**
- Consumes: `EcardConfig` from Task 2. All existing view components (`HomepageView`, `AlbumView`, etc.) and their props.
- Produces:
  - `EcardContext` — React Context providing `{ config: EcardConfig; activeSlideIndex: number; setActiveSlideIndex: (n) => void; navigateToSlide: (id: SlideDefinition['id']) => void }`.
  - `EcardRenderer` component: `({ config: EcardConfig }) => JSX.Element`. Renders the full recipient experience from a config object. Reuses all existing view components.
  - `useEcard()` hook exposing the context.

- [ ] **Step 1: Create `src/renderer/EcardContext.tsx`**

Define `EcardContextValue` with `config`, `activeSlideIndex`, `setActiveSlideIndex`, `navigateToSlide`, `visibleSlides` (filtered `SLIDES` array based on `config.hasVideo`). Export `EcardProvider` and `useEcard()`.

- [ ] **Step 2: Create `src/renderer/EcardRenderer.tsx`**

Accept `config: EcardConfig` prop. Wraps `EcardProvider`. Renders the existing 3-step flow (`welcome` → `pin` → `main`) using existing components. The `main` stage renders `SlideContentArea` (moved here) consuming config from context instead of prop-drilling `preloadedData`. Each view component receives only the data it needs, extracted from `config` within the renderer.

- [ ] **Step 3: Refactor `src/App.tsx` `CustomEcardCarouselWithGame`**

Replace the inline state machine with `<EcardRenderer config={preloadedData as EcardConfig} />`. Keep the existing route structure, `MediaProvider`, `ZaloBrowserModal`, `PhoneFrame` (for mobile/desktop switching), and `Toaster` wrapping unchanged.

- [ ] **Step 4: Verify build and E2E**

Run: `npm run build && npx playwright test`
Expected: Build succeeds, 10/10 tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: EcardRenderer — configuration-driven recipient experience"
```

---

### Task 4: Admin Layout Shell & Dashboard Overview

**Files:**
- Create: `src/admin/AdminLayout.tsx`
- Create: `src/admin/AdminSidebar.tsx`
- Create: `src/admin/pages/DashboardPage.tsx`
- Create: `src/admin/components/StatCard.tsx`
- Create: `src/admin/components/RecentCardsTable.tsx`
- Modify: `src/App.tsx` — add `/admin/*` route tree.

**Interfaces:**
- Consumes: `CardRepository.listCards()` from Task 2.
- Produces:
  - `AdminLayout` — sidebar + header + main content area shell.
  - `DashboardPage` — overview with stat cards (total, draft, published, archived) and recent cards table.
  - `StatCard({ label: string, value: number, icon: ReactNode, color: string })`.
  - `RecentCardsTable({ cards: CardSummary[], onEdit, onPreview, onPublish, onArchive })`.

- [ ] **Step 1: Create `src/admin/AdminLayout.tsx`**

Render a responsive admin shell: collapsible left sidebar (240px on desktop, drawer on mobile), top header bar with app title "By.Duni Admin" and user avatar placeholder, and a scrollable `<Outlet />` main area. Use Tailwind's `bg-gray-50` body, `bg-white` sidebar, clean sans-serif typography (`Inter`). Include a "Create New Card" primary action button in the header.

- [ ] **Step 2: Create `src/admin/AdminSidebar.tsx`**

Navigation links: Dashboard (`/admin`), Cards (`/admin/cards`), Create (`/admin/cards/new`). Use `lucide-react` icons: `LayoutDashboard`, `CreditCard`, `Plus`. Active state with left border accent `border-l-2 border-rose-500 bg-rose-50`.

- [ ] **Step 3: Create `src/admin/components/StatCard.tsx`**

Clean card component: icon circle (colored), label (text-sm text-gray-500), value (text-3xl font-bold), subtle border and shadow.

- [ ] **Step 4: Create `src/admin/pages/DashboardPage.tsx`**

Render 4 `StatCard` components in a responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`). Below, render `RecentCardsTable` showing the 5 most recent cards. Fetch data from `CardRepository.listCards()` using `useEffect` + loading/error states. Seed mock data with 5 demo cards (using generic placeholder names, not real customer data): e.g. "Valentine's Card", "Anniversary Gift", "Birthday Surprise", etc.

- [ ] **Step 5: Create `src/admin/components/RecentCardsTable.tsx`**

Responsive table with columns: Name, Template, Status (badge), Created, Actions (Edit / Preview / Publish / Archive buttons with `lucide-react` icons). Status badges: draft = `bg-amber-100 text-amber-700`, published = `bg-green-100 text-green-700`, archived = `bg-gray-100 text-gray-500`. On mobile, switch to a stacked card layout.

- [ ] **Step 6: Add admin routes to `src/App.tsx`**

```tsx
<Route path="/admin" element={<AdminLayout />}>
  <Route index element={<DashboardPage />} />
  {/* Cards management and editor routes added in later tasks */}
</Route>
```

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: Exit code 0.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: admin dashboard — layout shell, stat cards, recent cards table"
```

---

### Task 5: E-Card Management List & Card Editor (Create / Edit)

**Files:**
- Create: `src/admin/pages/CardListPage.tsx`
- Create: `src/admin/pages/CardEditorPage.tsx`
- Create: `src/admin/components/BasicInfoSection.tsx`
- Create: `src/admin/components/MediaUploadSection.tsx`
- Create: `src/admin/components/ContentEditorSection.tsx`
- Create: `src/admin/components/TemplateSettingsSection.tsx`
- Create: `src/admin/components/AccessSettingsSection.tsx`
- Create: `src/admin/components/PublishingControls.tsx`
- Modify: `src/App.tsx` — add routes `/admin/cards`, `/admin/cards/new`, `/admin/cards/:id/edit`.

**Interfaces:**
- Consumes: `CardRepository`, `MediaService` from Task 2. `EcardConfig`, `CardSummary` from Task 2. `AdminLayout` from Task 4.
- Produces:
  - `CardListPage` — searchable, filterable card management table with status filter tabs.
  - `CardEditorPage` — multi-section tabbed editor holding all 6 sections. Maintains a single `useReducer` form state of type `Partial<EcardConfig>`. Sections communicate via shared form state.
  - Section components accept `{ formState, dispatch }` props for consistent state management.

- [ ] **Step 1: Create `CardListPage.tsx`**

Search input + filter tabs (All, Draft, Published, Archived). Renders a table (desktop) or card grid (mobile) of all cards. Each row has actions: Edit, Preview, Publish/Unpublish, Archive. Uses `CardRepository.listCards()`.

- [ ] **Step 2: Create `CardEditorPage.tsx` with `useReducer` form state**

Define `CardFormState = Partial<EcardConfig>` and `CardFormAction` discriminated union. Render a tabbed interface with 6 tabs: Basic Info, Media, Content, Template, Access, Publishing. Each tab renders its section component. The page's form state is preserved in React state (not URL), so navigating to preview and back does not lose data.

- [ ] **Step 3: Create `BasicInfoSection.tsx`**

Form fields: Card Title (text), Recipient Name (text), Sender Name (text), Special Date (date picker), Description (textarea). All fields dispatch form actions on change. Use `<label>` elements and inline validation feedback (required fields show red border when empty on blur).

- [ ] **Step 4: Create `MediaUploadSection.tsx`**

Drag-and-drop image upload zone + file picker fallback. Display uploaded images as sortable thumbnails with reorder drag handles, remove buttons, and caption inputs. Accept image files (jpg, png, webp, max 10MB each). Show file size feedback. Use `MediaService.uploadMedia()` for blob URL generation. Support audio file upload (mp3, m4a) with a separate upload zone showing audio player preview.

- [ ] **Step 5: Create `ContentEditorSection.tsx`**

Per-photo caption editors (synced with media section's image list). Love letter paragraphs editor: a list of `<textarea>` rows with add/remove/reorder controls. Welcome message input. Each field maps to the appropriate `EcardConfig` property via dispatch.

- [ ] **Step 6: Create `TemplateSettingsSection.tsx`**

Template selection: show available templates as visual cards (currently only "Classic Romantic" — the existing template). Page visibility toggles (checkboxes for each slide type: Homepage, Album, Music, Letter, Game, Video). Page ordering via drag-and-drop reorder list. Changes dispatch to form state.

- [ ] **Step 7: Create `AccessSettingsSection.tsx`**

Two 4-digit PIN inputs (Enter PIN + Confirm PIN) with visual dot indicators matching the recipient PIN screen style. Masked display. Validation: PINs must match, must be exactly 4 digits. Clear "⚠️ Integration pending — PIN will be securely stored by the backend" notice. Never store the entered PIN in form state as plaintext — store only a `pinConfigured: boolean` flag. The actual PIN will be sent to the backend on save (Task 7 contract defines this).

- [ ] **Step 8: Create `PublishingControls.tsx`**

Action bar with buttons: "Save Draft" (always enabled), "Preview" (navigates to preview route), "Publish" (shows confirmation modal, then calls `CardRepository.publishCard()` which logs mock notice), "Archive" (confirmation + `CardRepository.archiveCard()`). For Publish, show a clear "🔧 Integration pending — real publishing requires backend" notice instead of pretending a real URL was generated.

- [ ] **Step 9: Add routes to `src/App.tsx`**

```tsx
<Route path="cards" element={<CardListPage />} />
<Route path="cards/new" element={<CardEditorPage />} />
<Route path="cards/:id/edit" element={<CardEditorPage />} />
```

- [ ] **Step 10: Verify build**

Run: `npm run build`
Expected: Exit code 0.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: card management — list page, multi-section card editor with all form sections"
```

---

### Task 6: Live Preview & Viewport Switcher

**Files:**
- Create: `src/admin/pages/PreviewPage.tsx`
- Create: `src/admin/components/ViewportSwitcher.tsx`
- Modify: `src/App.tsx` — add route `/admin/cards/:id/preview`.

**Interfaces:**
- Consumes: `EcardRenderer` from Task 3. `EcardConfig` from Task 2. `CardEditorPage` form state (passed via route state or a shared context).
- Produces:
  - `PreviewPage` — renders the actual `EcardRenderer` with the current editor form state, inside a resizable viewport frame.
  - `ViewportSwitcher` — toolbar buttons to switch between Mobile (`390×844`), Tablet (`768×1024`), and Desktop (`1440×900`) preview sizes. The selected viewport wraps the renderer in a scaled container.

- [ ] **Step 1: Create `ViewportSwitcher.tsx`**

Three buttons with device icons (`Smartphone`, `Tablet`, `Monitor` from `lucide-react`). Active button gets rose accent. Emits `onViewportChange(viewport: 'mobile' | 'tablet' | 'desktop')`.

- [ ] **Step 2: Create `PreviewPage.tsx`**

Top toolbar: "← Back to Editor" link (preserves form state via `navigate(-1)` or shared context), `ViewportSwitcher`, card title display. Main area: centers the preview container with the selected viewport dimensions, scaled to fit using `transform: scale()` if the viewport is larger than the available screen space. Renders `<EcardRenderer config={previewConfig} />` inside the container. The `previewConfig` is constructed from the editor's current form state (received via React Router `state` or a shared `EditorContext`).

- [ ] **Step 3: Create shared `EditorContext` to preserve form state across editor ↔ preview navigation**

Create `src/admin/context/EditorContext.tsx` with `EditorProvider` wrapping the admin card routes. Stores the current `CardFormState` in context so both `CardEditorPage` and `PreviewPage` share it without losing data on route transitions.

- [ ] **Step 4: Add preview route**

```tsx
<Route path="cards/:id/preview" element={<PreviewPage />} />
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: Exit code 0.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: live preview with viewport switcher and preserved editor state"
```

---

### Task 7: Recipient Experience — Responsive Redesign

**Files:**
- Modify: `src/App.tsx:313-348` — replace `PhoneFrame` desktop wrapping with genuine responsive layout.
- Modify: `src/components/HomepageView.tsx` — add tablet and desktop layouts.
- Modify: `src/components/AlbumView.tsx` — responsive gallery grid.
- Modify: `src/components/MusicView.tsx` — wider layout for tablet/desktop.
- Modify: `src/components/LetterView.tsx` — editorial desktop layout.
- Modify: `src/components/GameView.tsx` — centered desktop layout.
- Modify: `src/components/WelcomeScreen.tsx` — fullscreen responsive.
- Modify: `src/components/PinScreen.tsx` — responsive PIN entry.
- Modify: `src/components/FloatingNavButtons.tsx` — responsive positioning.
- Modify: `src/components/Sidebar.tsx` — responsive sidebar.
- Modify: `tailwind.config.js` — add custom breakpoint if needed.

**Interfaces:**
- Consumes: All existing view components and their props. `EcardConfig` from Task 2.
- Produces: The same components with added responsive Tailwind classes for three breakpoints: `<768px` (mobile), `768px–1023px` (tablet `md:`), `≥1024px` (desktop `lg:`). No new component APIs — only CSS/layout changes.

- [ ] **Step 1: Remove `PhoneFrame` wrapper from desktop recipient experience**

In `App.tsx` (`CustomEcardCarouselWithGame`), remove the `isMobile` branching that wraps desktop in `<PhoneFrame>`. Instead, render a single responsive container:
- Mobile (`<768px`): full-viewport fixed container (existing behavior).
- Tablet (`768px–1023px`): centered max-width `600px` container with soft shadow and rounded corners.
- Desktop (`≥1024px`): centered max-width `900px` container with elegant background, the romantic background image visible behind.

Keep `PhoneFrame.tsx` file intact (it's still used in admin preview).

- [ ] **Step 2: Responsive `HomepageView`**

- Mobile: existing layout (single column, shortcut cards below hero).
- Tablet (`md:`): hero image at `aspect-[4/3]` instead of square, shortcut cards in a row with more spacing.
- Desktop (`lg:`): two-column layout — hero image on the left (60%), couple info card + shortcuts on the right (40%). Couple footer bar spans full width.

- [ ] **Step 3: Responsive `AlbumView`**

- Mobile: existing 3-group asymmetric collage.
- Tablet (`md:`): wider grid, photos get more breathing room, lightbox image max-width increases.
- Desktop (`lg:`): masonry-style 3-column grid for all photos. Lightbox uses `max-w-2xl` with larger caption text.

- [ ] **Step 4: Responsive `MusicView`**

- Mobile: existing single-column card.
- Tablet/Desktop: horizontal layout — album art on the left (40%), track info + controls on the right (60%). Max-width `700px` centered.

- [ ] **Step 5: Responsive `LetterView`**

- Mobile: existing scrollable typewriter.
- Tablet: wider text column (`max-w-lg`), larger font.
- Desktop: editorial-style centered column (`max-w-2xl`), elegant padding, letter styled as a centered card with subtle paper texture background and wider line-height.

- [ ] **Step 6: Responsive `GameView`, `WelcomeScreen`, `PinScreen`, `FloatingNavButtons`, `Sidebar`**

- `GameView`: card image scales up to `w-96` on desktop, instructions card wider.
- `WelcomeScreen`: button positioned with responsive spacing, background covers all viewports.
- `PinScreen`: PIN dots and keypad scale up on tablet/desktop with more spacing.
- `FloatingNavButtons`: adjust positioning for wider viewports.
- `Sidebar`: wider on tablet (320px), overlay style consistent.

- [ ] **Step 7: Add `prefers-reduced-motion` support**

In `tailwind.config.js`, ensure `motion-reduce:` variants are enabled. Add `motion-reduce:animate-none` to key animated elements (spinning avatars, pulsing heart, wiggling nav buttons, bouncing cards). The experience remains usable without motion.

- [ ] **Step 8: Verify build and E2E**

Run: `npm run build && npx playwright test`
Expected: Build succeeds, 10/10 tests pass (mobile and desktop viewport tests still find correct selectors).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: responsive recipient experience — genuine tablet and desktop layouts"
```

---

### Task 8: PIN Screen — Injectable Auth & UX Refinements

**Files:**
- Modify: `src/components/PinScreen.tsx` — accept an `onVerifyPin` callback instead of importing `verifyPinInput`.
- Modify: `src/renderer/EcardRenderer.tsx` — pass the auth callback from the service layer.

**Interfaces:**
- Consumes: `CardAccessService.verifyPin()` from Task 2. Existing `PinScreen` component.
- Produces: Refactored `PinScreen` with `PinScreenProps.onVerifyPin: (pin: string) => Promise<boolean>` callback. No client-side hash comparison. No attempt counter. No UI lockout.

- [ ] **Step 1: Refactor `PinScreen` props**

Replace `verifyPinInput` import with a new prop: `onVerifyPin: (pin: string) => Promise<boolean>`. The component calls this callback when 4 digits are entered. On `true`, call `onSuccess()`. On `false`, show toast error and reset. Remove `isSubmitting` delay lock — allow immediate retry after toast dismisses.

- [ ] **Step 2: Update `EcardRenderer` to inject the auth callback**

The renderer receives a `CardAccessService` instance (or a verify function) and passes `onVerifyPin` to `PinScreen`. In the existing recipient route, wire this to `MockCardAccessService.verifyPin()`.

- [ ] **Step 3: Keep backward compatibility for existing tests**

The mock `verifyPin` in development still accepts the known PIN (using the existing hash check internally within the mock, not in the component). This keeps the 10 existing E2E tests passing.

- [ ] **Step 4: Verify build and E2E**

Run: `npm run build && npx playwright test`
Expected: Build succeeds, 10/10 tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: injectable PIN verification — PinScreen uses callback, no client-side hash"
```

---

### Task 9: Frontend Tests & Responsive Screenshots

**Files:**
- Modify: `tests/ecard.spec.ts` — add tablet viewport tests.
- Create: `tests/admin.spec.ts` — admin dashboard E2E tests.
- Create: `tests/responsive.spec.ts` — responsive screenshot capture tests.

**Interfaces:**
- Consumes: All pages and components from Tasks 3–8. Playwright config from existing setup.
- Produces: Expanded test suite. Screenshot artifacts in `test-results/`.

- [ ] **Step 1: Add tablet viewport tests to `tests/ecard.spec.ts`**

Add 2 tests at `768×1024`: (1) authentication + homepage renders without `PhoneFrame` and without horizontal overflow, (2) album view renders responsive grid layout.

- [ ] **Step 2: Create `tests/admin.spec.ts`**

Test 1: Dashboard loads at `/admin` with stat cards and recent cards table.
Test 2: Card list page loads at `/admin/cards` with search and filter tabs.
Test 3: Card editor loads at `/admin/cards/new` with all 6 section tabs.
Test 4: Navigate editor → preview → back preserves form state.

- [ ] **Step 3: Create `tests/responsive.spec.ts`**

Capture screenshots at all 3 viewports for: Welcome, PIN, Homepage, Album, Music, Letter, Game. Save to `test-results/screenshots/`. This test file is for visual regression documentation, not pixel comparison.

- [ ] **Step 4: Run full test suite**

Run: `npx playwright test`
Expected: All tests pass (original 10 + new tablet + admin + responsive tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: expanded E2E suite — admin dashboard, tablet viewport, responsive screenshots"
```

---

### Task 10: Documentation & Final QA

**Files:**
- Create: `docs/FRONTEND_ARCHITECTURE.md`
- Create: `docs/frontend-backend-contract.md`
- Create: `docs/UI_UX_IMPLEMENTATION_REPORT.md`

**Interfaces:**
- Consumes: All service interfaces from Task 2. All components and pages from Tasks 3–9. Test results from Task 9.
- Produces: Three documentation files as specified in the user requirements.

- [ ] **Step 1: Create `docs/frontend-backend-contract.md`**

Document all service interface operations with:
- TypeScript request/response types (copy from `src/types/ecard.ts` and `src/services/*.ts`).
- HTTP method and path suggestions (e.g. `GET /api/cards`, `POST /api/cards/:id/verify-pin`).
- Error response shapes (`{ error: string; code: string }`).
- Authentication requirements (admin routes require auth header, public card routes do not).
- Media upload: multipart/form-data, accepted MIME types, max file sizes.
- PIN verification: request `{ pin: string }`, response `{ authorized: boolean, cardData?: EcardConfig }`.
- Clear notes on what the frontend mock does vs. what the real backend must implement.

- [ ] **Step 2: Create `docs/FRONTEND_ARCHITECTURE.md`**

Document:
- Project structure and file organization.
- Data flow: service layer → context → components.
- Admin vs. Recipient experience separation.
- `EcardRenderer` configuration-driven rendering approach.
- Template extensibility design.
- State management approach (useReducer for admin editor, context for renderer).
- Mock service layer and how to swap in real API adapters.

- [ ] **Step 3: Create `docs/UI_UX_IMPLEMENTATION_REPORT.md`**

Document:
- What was implemented (all pages, components, responsive layouts).
- Which components were reused from the original recreation.
- Which components were refactored (PinScreen, HomepageView, etc.).
- Which UI features use mocks (publish, archive, media upload, PIN verification).
- Which backend integrations are pending.
- Responsive testing results (all viewports, test pass counts).
- Known limitations.
- Exact commands to run the frontend.
- Clear instructions for Codex integration.

- [ ] **Step 4: Final QA pass**

Run: `npm run build && npx playwright test`
Verify: 0 build errors, all tests pass, no console errors on page load at all 3 viewports.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "docs: frontend architecture, backend contract, and implementation report"
```
