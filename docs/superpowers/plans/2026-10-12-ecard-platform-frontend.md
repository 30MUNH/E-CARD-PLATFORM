# E-Card Platform Frontend Implementation Plan (Updated with Approved Adjustments)

> **For agentic workers:** Executing via `superpowers:executing-plans` (Native Execution) in dependency order with build and Playwright E2E verification at every milestone.

**Goal:** Transform the single-customer E-Card recreation into a reusable, configuration-driven E-Card Platform frontend with a SaaS Admin Dashboard, responsive recipient experience (preserving mobile fidelity while adding native tablet & desktop layouts), unlimited PIN retry UX, and clean integration contracts for OpenAI Codex's backend.

**Architecture:** Separate static customer data from presentation components via a versioned `EcardConfig` schema (`v1.0.0`) and React Context (`EcardContext`). Define frontend service interfaces (`CardRepository`, `MediaService`, `CardAccessService`) and `docs/frontend-backend-contract.md` in Task 2 prior to building the Admin UI. Build the Admin Dashboard under `/admin/*` and evolve the Recipient Experience under `/ecd/game/:uuid` so mobile (`390×844`) preserves its exact visual identity while tablet (`768×1024`) and desktop (`1440×900`) render genuine responsive editorial/gallery layouts without a phone bezel wrapper.

**Tech Stack:** React 18, TypeScript, Vite 6, Tailwind CSS 3.4, React Router 6, framer-motion 11, Howler.js, react-youtube, react-hot-toast, Playwright

## Global Constraints & Approved Adjustments

1. **Git Initialization & Branching:** Local Git repository initialized at `/home/tts/Documents/LHA`, comprehensive `.gitignore` (excluding `.env`, secrets, build artifacts, logs, `reference/screenshots/`, `reference/recordings/`, and `public/user-media/`), baseline committed on `main`, and all platform work committed on `feat/ecard-platform-frontend`. Do not push or merge.
2. **Frontend / Backend Contract First (Task 2):** Create `docs/frontend-backend-contract.md` in Task 2 before building the Admin UI. Use a configurable, versioned E-Card schema (`v1.0.0`). All backend-dependent operations use clearly labeled mock adapters.
3. **Preserve Existing Mobile Experience:** Keep mobile (`390×844`) appearance, animations, transitions, and interactions intact. Create genuine responsive layouts for tablet (`768×1024`) and desktop (`1440×900`) instead of wrapping the mobile view inside `PhoneFrame` (`PhoneFrame` remains available for the Admin Live Preview device frame).
4. **PIN Experience:** Unlimited manual retries in the UI — no attempt counters, no lockouts, no forced waiting delays, and no disabled input after a failed attempt. Injectable verification callback via `CardAccessService`. No production PINs or hashes embedded in reusable components.
5. **Admin UI/UX Quality:** Multi-section editor (Basic Info, Media Upload & ordering, Per-photo Captions & Letter & Special Dates, Template & Page Ordering/Visibility, Access PIN with confirmation, and Publishing Controls with explicit integration-pending banners) + Live Preview reusing the real `EcardRenderer` with Mobile/Tablet/Desktop viewport switcher and preserved unsaved form state.

---

### Task Breakdown

- [x] **Task 1: Git Initialization & Branch Setup** (`.gitignore`, `main` baseline commit, `feat/ecard-platform-frontend` branch)
- [ ] **Task 2: Frontend/Backend Contract (`docs/frontend-backend-contract.md`), Versioned `EcardConfig` Schema & Service Interfaces/Mocks**
- [ ] **Task 3: `EcardRenderer` — Configuration-Driven Recipient Experience & Special Dates / Timeline View**
- [ ] **Task 4: PIN Screen — Unlimited Immediate Retries & Injectable Verification Service**
- [ ] **Task 5: Recipient Experience — Responsive Tablet (`768×1024`) & Desktop (`1440×900`) Redesign (Preserving Mobile `390×844`)**
- [ ] **Task 6: Admin Layout Shell & Dashboard Overview (`/admin`)**
- [ ] **Task 7: E-Card Management List (`/admin/cards`) & Multi-Section Card Editor (`/admin/cards/new`, `/admin/cards/:id/edit`)**
- [ ] **Task 8: Interactive Live Preview (`/admin/cards/:id/preview`) with Viewport Switcher & Preserved Form State**
- [ ] **Task 9: Automated Playwright E2E Suite Expansion & Multi-Viewport Screenshot Capture**
- [ ] **Task 10: Final Documentation (`docs/FRONTEND_ARCHITECTURE.md`, `docs/UI_UX_IMPLEMENTATION_REPORT.md`) & Full QA Verification**
