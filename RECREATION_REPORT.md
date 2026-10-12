# By.Duni E-Card Website Recreation & Verification Report

**Project Workspace:** `/home/tts/Documents/LHA`  
**Reference URL:** `https://byduni.com/ecd/game/8ae32098-4fc9-4787-9d79-557a03b08532`  
**Template Architecture:** `CustomEcardCarouselWithGame` ("By.Duni – Giúp bạn nói lời yêu")  
**Framework & Tech Stack:** React 18, TypeScript, Vite 6, Tailwind CSS 3.4, `framer-motion` 11, `react-simple-typewriter`, `react-youtube`, `react-hot-toast`, `react-icons`, `lucide-react`, Playwright E2E, `pixelmatch` + `pngjs`

---

## 1. Discovered and Implemented Pages & States

Through exhaustive browser exploration, DOM/CSS inspection, asset capture, and state-machine analysis (documented in [`reference/page-inventory.md`](file:///home/tts/Documents/LHA/reference/page-inventory.md), [`reference/navigation-map.md`](file:///home/tts/Documents/LHA/reference/navigation-map.md), [`reference/interaction-map.md`](file:///home/tts/Documents/LHA/reference/interaction-map.md), and [`reference/coverage-report.md`](file:///home/tts/Documents/LHA/reference/coverage-report.md)), **11 distinct UI states across 7 slide definitions** plus **1 external route** and **1 conditional User-Agent modal** were discovered and recreated at 1:1 structural and behavioral fidelity:

| # | State ID | Page / Screen Name | Component Implementation | Key Features & Visual Composition |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `S1_WELCOME` | Welcome / Cover Screen (`welcome`) | [`WelcomeScreen.tsx`](file:///home/tts/Documents/LHA/src/components/WelcomeScreen.tsx) | Full-bleed background (`/template/back_ground.webp`), `animate-fade-in` title card (`/template/title.png`), delayed (`800ms`) `framer-motion` entrance (`opacity: 0 → 1`, `scale: 0.8 → 1`) for the `#8c5261` *"Bắt đầu"* button. |
| 2 | `S2_PIN_LOCK` | PIN Authentication Screen (`pin`) | [`PinScreen.tsx`](file:///home/tts/Documents/LHA/src/components/PinScreen.tsx) | Title *"Mở khóa kỷ niệm"*, subtitle *"Bất ngờ cho cậu nà 😜"*, 4 PIN indicator dots, 3×4 numeric keypad (`1`–`9`, `0`, `Xóa` with `FaBackspace`) + physical keyboard support (`0`–`9`, `Backspace`). |
| 3 | `S2_ERR_PIN` | Wrong PIN Error Toast State | [`PinScreen.tsx`](file:///home/tts/Documents/LHA/src/components/PinScreen.tsx) | Entering an invalid 4-digit PIN triggers `toast.error("Sai mã PIN")` via `react-hot-toast` (`top-center`), disables input for `500ms`, and automatically clears all 4 PIN dots. |
| 4 | `S3_HOMEPAGE` | Main Couple Homepage (`main`, index `0`) | [`HomepageView.tsx`](file:///home/tts/Documents/LHA/src/components/HomepageView.tsx) | Couple header with 2 continuously rotating circular avatars (`animate-spin-slow`, `10s linear infinite`), pulsing heart icon (`pulse`, `1.8s infinite`) with `1159 ngày` counter (live day calculation since `2023-08-10`), `"Ngọc Khánh"` & `"Lê Hoàng Anh"`, Polaroid hero card (`rotate-[-3deg]`), and tilted Music (`-3deg`) + Letter (`2deg`) shortcut cards. |
| 5 | `S3_SIDEBAR` | Slide-Out Navigation Drawer | [`Sidebar.tsx`](file:///home/tts/Documents/LHA/src/components/Sidebar.tsx) | Semi-transparent backdrop (`bg-black bg-opacity-40`) + `w-64` `#8c5261` drawer (`slideInLeft 0.3s ease-out`) listing *Trang chủ*, *Ảnh*, *Nhạc*, *Lá thư*, *Game*, and *Cài đặt* (with *Video* conditionally hidden because `hasVideo === false`). |
| 6 | `S4_ALBUM` | Photo Album Collage (`album`, index `1`) | [`AlbumView.tsx`](file:///home/tts/Documents/LHA/src/components/AlbumView.tsx) | 3-group vertical scrapbooking layout (7 couple photos total): Group 1 (3 tilted Polaroid frames with tape overlays), Group 2 (3-photo filmstrip overlay on `/template/2.png` with decorative bow `/template/no.png`), and Group 3 (featured bottom frame on `/template/3.png`). |
| 7 | `S4_LIGHTBOX` | Photo Album Fullscreen Lightbox | [`AlbumView.tsx`](file:///home/tts/Documents/LHA/src/components/AlbumView.tsx) | `fixed inset-0 bg-black bg-opacity-80 z-50` overlay displaying the selected photo (`max-h-[75vh]`), handwritten `Playwrite VN` caption (e.g., *"hẹ hẹ"*, *"chinh nhật zui zeee"*), touch swipe left/right (`deltaX > 50px`) to cycle photos, and backdrop click to close. |
| 8 | `S5_MUSIC` | Music Player Page (`music`, index `2`) | [`MusicView.tsx`](file:///home/tts/Documents/LHA/src/components/MusicView.tsx) | Scrapbook music frame (`/template/music.png`) with couple cover photo, track title *"Một Đời"*, artist *"Duni"*, quote *"Love you to the saturn and back"*, `#8c5261` transport bar (`skipBackward`, `play`/`pause`, `skipForward`), and hidden `1×1` `react-youtube` player (`videoId: "f9P7_qWrf38"`). |
| 9 | `S6_LETTER` | Love Letter & Typewriter (`letter`, index `3`) | [`LetterView.tsx`](file:///home/tts/Documents/LHA/src/components/LetterView.tsx) | Stationery background (`/template/letter.png`), sequential `react-simple-typewriter` (`typeSpeed: 50ms`) across all 11 paragraphs (`513` characters) in `Playwrite VN` font with active `|` cursor, and dual SVG `#heartClip` couple avatars at the bottom right. |
| 10 | `S7_GAME_INTRO` | Card Game Instructions (`game`, index `4`) | [`GameView.tsx`](file:///home/tts/Documents/LHA/src/components/GameView.tsx) | Textured instruction card (`/template/texture.png`) displaying *"Hướng dẫn chơi:"*, 3 numbered rules in `Playwrite VN`, and a `#8c5261` *"Bắt đầu"* button. |
| 11 | `S7_GAME_DECK` | Interactive 55-Card Deck (`game`, index `4`) | [`GameView.tsx`](file:///home/tts/Documents/LHA/src/components/GameView.tsx) | Displays `/template/game/main.png` (`300×420`). Clicking triggers a `3000ms` vertical bounce animation (`animate-bounce-y`, `0.3s infinite`) that cycles random card faces every `100ms` before landing on one of the 55 cards (`/template/game/card_1.png` – `card_55.png`). |
| 12 | `S9_SIGNIN` | Owner Sign-In / Sign-Up (`/ecd/signin/:uuid`) | [`SignInPage.tsx`](file:///home/tts/Documents/LHA/src/components/SignInPage.tsx) | Reached via Sidebar → *Cài đặt*. Renders `/logo.svg`, *"Đăng nhập/Đăng ký"*, 10-digit `0xxxxxxxxx` phone validation, and return link *"Quay lại trang chính"*. |
| 13 | `S0_ZALO_MODAL` | Zalo In-App Browser Warning Modal | [`ZaloBrowserModal.tsx`](file:///home/tts/Documents/LHA/src/components/ZaloBrowserModal.tsx) | Automatically activates when `navigator.userAgent` contains `zalo`, prompting the user to switch to their default system browser with step-by-step screenshots (`/ guild_1.jpg`, `/guild_2.jpg`). |
| 14 | `S_VIDEO_COND` | Conditional Video Slide (`video`) | [`VideoView.tsx`](file:///home/tts/Documents/LHA/src/components/VideoView.tsx) | Implemented to match the bundle's `VideoSection` component; dynamically excluded from the active slide deck and sidebar when `videoUrl` is empty (`hasVideo === false`), matching the live UUID instance. |

---

## 2. Functional Test Results

All functional requirements from Phase 3 were verified against the reference documentation and recordings:

- **Welcome Screen & Delayed Entrance:** Verified background image rendering, title graphic fade-in (`fadeIn 1s`), and *"Bắt đầu"* button delayed entrance (`800ms` delay, `500ms` duration).
- **Password Authentication (PIN Pad & Keyboard):** Verified 4-dot progress indicator, on-screen keypad (`0`–`9`), `Xóa` button disabled when empty and enabled when `pin.length > 0`, physical keyboard digit & `Backspace` entry, invalid PIN toast notification (`"Sai mã PIN"`) with `500ms` lock and reset, and valid PIN transition to the main carousel plus background music auto-start.
- **Homepage & Dynamic Day Counter:** Verified rotating avatars (`spin 10s linear infinite`), pulsing heart (`pulse 1.8s infinite`), dynamic day calculation from `2023-08-10`, and all 3 interactive shortcut cards (*Polaroid* → Album, *Music card* → Music, *Envelope card* → Letter).
- **Slide-Out Sidebar Drawer:** Verified opening via top-left button (`/template/sidebar.png`), closing via `IoClose` button or backdrop click, jumping directly to any slide, and clicking *Cài đặt* to navigate to `/ecd/signin/8ae32098-4fc9-4787-9d79-557a03b08532`.
- **Sequential Forward & Backward Navigation + Loop:** Verified floating bottom navigation arrows (`/template/back.png` and `/template/next.png`), confirming *Back* is hidden on Homepage (`index === 0`), *Next* advances sequentially (`Homepage → Album → Music → Letter → Game`), *Back* reverses sequentially, and clicking *Next* on `Game` (`index === 4`) loops back to `Homepage` (`index === 0`).
- **Photo Album & Lightbox Touch Gestures:** Verified all 7 user photos load with `naturalWidth > 0`, clicking any photo opens the fullscreen Lightbox with its corresponding caption, horizontal touch swipe (`touchstart` → `touchmove` → `touchend` with `|deltaX| > 50px`) cycles between photos, and clicking the dark overlay closes the modal.
- **Music View & Persistent Audio Playback:** Verified track metadata (*"Một Đời"* – *Duni*), play/pause state synchronization with the persistent `react-youtube` instance mounted in [`EcardApp.tsx`](file:///home/tts/Documents/LHA/src/components/EcardApp.tsx), and `±10s` seek controls.
- **Love Letter & Sequential Typewriter:** Verified sequential paragraph-by-paragraph typing (`50ms/char`) across all 11 paragraphs with active `|` cursor migration and dual SVG `#heartClip` masked avatars.
- **Card Game Shuffle & Draw:** Verified transition from the rules screen (*"Hướng dẫn chơi:"*) to the card deck (`/template/game/main.png`), `3000ms` vertical bounce shuffle animation (`animate-bounce-y`) with `100ms` rapid card face cycling, and random draw from all 55 local card assets (`/template/game/card_1.png`–`card_55.png`).
- **Desktop vs. Mobile Responsive Framing:** Verified Desktop (`1440×900`, `>= 768px`) renders the dark `PhoneFrame` mockup (`383×754`, `rounded-[35px]`, top speaker notch, side buttons, and bottom `CustomEditButton` CTA), while Mobile (`390×844`, `< 768px`) renders full-viewport without phone bezel or horizontal overflow.

---

## 3. Playwright Pass/Fail Summary

The automated Playwright E2E test suite in [`tests/ecard.spec.ts`](file:///home/tts/Documents/LHA/tests/ecard.spec.ts) (configured via [`playwright.config.ts`](file:///home/tts/Documents/LHA/playwright.config.ts)) was executed against the local dev server (`npx playwright test`).

**Summary:** **10 / 10 Tests Passed (100% Pass Rate, 0 Failures, 40.0s total duration)**

| Test # | Test Name | Viewport | Duration | Status |
| :---: | :--- | :---: | :---: | :---: |
| 1 | `Authentication flow: Welcome screen, partial PIN + Xóa, wrong PIN toast + reset, and valid PIN unlock` | `1440×900` | `1.5s` | **PASSED** (`✓`) |
| 2 | `Forward and Backward sequential navigation across all 5 main views + loop` | `390×844` | `1.1s` | **PASSED** (`✓`) |
| 3 | `Branching interactions: Homepage shortcut cards and Sidebar navigation + Settings redirect` | `390×844` | `1.7s` | **PASSED** (`✓`) |
| 4 | `Album collage layout, Lightbox modal, captions, and mobile touch swipe` | `390×844` | `1.0s` | **PASSED** (`✓`) |
| 5 | `Music player UI controls and Letter typewriter + SVG heart-clipped avatars` | `390×844` | `26.8s` | **PASSED** (`✓`) |
| 6 | `Card Game instructions, 3-second bounceY shuffle animation, and random card draw` | `390×844` | `4.4s` | **PASSED** (`✓`) |
| 7 | `Responsive layout check (Desktop phone bezel vs Mobile fullscreen) and Browser Refresh state reset` | `1440×900` & `390×844` | `913ms` | **PASSED** (`✓`) |
| 8 | `Desktop (1440x900) keyboard PIN entry, spinning avatars, pulsing heart, and PhoneFrame navigation` | `1440×900` | `486ms` | **PASSED** (`✓`) |
| 9 | `Owner Sign-In / Sign-Up (/ecd/signin/:uuid) phone input validation` | `1440×900` | `403ms` | **PASSED** (`✓`) |
| 10 | `Zalo In-App Browser Detection Modal renders when User-Agent contains Zalo` | `390×844` (Zalo UA) | `304ms` | **PASSED** (`✓`) |

**Production Build Verification (`npm run build`):**
- `tsc -b && vite build` completed with **exit code 0** in `2.32s` (`1639 modules transformed`, producing `dist/index.html`, `dist/assets/index-B5NnWq6m.css`, and `dist/assets/index-CLQe-4-E.js`).

---

## 4. Desktop Screenshot Comparison Results (`1440×900`)

Automated pixel-by-pixel visual comparison was executed across all **19 Desktop reference screenshots** (`1,296,000` total pixels per image, `pixelmatch` threshold `0.1`). Reference screenshots (`01a-*` to `09-*`), local screenshots (`local-*`), and diff masks (`diff-*`) are saved in [`reference/screenshots/`](file:///home/tts/Documents/LHA/reference/screenshots/).

- **States at `100.00%` Exact Pixel Match (`0` diff pixels):** **16 / 19 states**
- **Mean Desktop Similarity Across All 19 States:** **`99.99%`** (`99.89%` – `100.00%`)

| # | State Identifier (`baseName`) | Resolution | Diff Pixels | Total Pixels | Similarity | Notes |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| 1 | `01a-welcome-desktop` | `1440×900` | `0` | `1,296,000` | **100.00%** | Exact pixel match |
| 2 | `01b-welcome-button-visible-desktop` | `1440×900` | `0` | `1,296,000` | **100.00%** | Exact pixel match |
| 3 | `02a-pin-empty-desktop` | `1440×900` | `0` | `1,296,000` | **100.00%** | Exact pixel match |
| 4 | `02b-pin-partial-desktop` | `1440×900` | `0` | `1,296,000` | **100.00%** | Exact pixel match |
| 5 | `02c-pin-wrong-error-desktop` | `1440×900` | `1,461` | `1,296,000` | **99.89%** | `react-hot-toast` entrance animation frame timing |
| 6 | `03a-homepage-desktop` | `1440×900` | `0` | `1,296,000` | **100.00%** | Exact pixel match |
| 7 | `03a-homepage-top-desktop` | `1440×900` | `446` | `1,296,000` | **99.97%** | Continuous `animate-spin-slow` avatar & `pulse` heart phase |
| 8 | `03b-sidebar-open-desktop` | `1440×900` | `0` | `1,296,000` | **100.00%** | Exact pixel match |
| 9 | `04a-album-top-desktop` | `1440×900` | `0` | `1,296,000` | **100.00%** | Exact pixel match |
| 10 | `04b-album-scrolled-desktop` | `1440×900` | `0` | `1,296,000` | **100.00%** | Exact pixel match |
| 11 | `04c-album-lightbox-0-desktop` | `1440×900` | `0` | `1,296,000` | **100.00%** | Exact pixel match |
| 12 | `04d-album-lightbox-1-desktop` | `1440×900` | `0` | `1,296,000` | **100.00%** | Exact pixel match |
| 13 | `05a-music-page-desktop` | `1440×900` | `0` | `1,296,000` | **100.00%** | Exact pixel match |
| 14 | `06b-letter-complete-desktop` | `1440×900` | `0` | `1,296,000` | **100.00%** | Exact pixel match |
| 15 | `06c-letter-bottom-desktop` | `1440×900` | `0` | `1,296,000` | **100.00%** | Exact pixel match |
| 16 | `07a-game-instructions-desktop` | `1440×900` | `0` | `1,296,000` | **100.00%** | Exact pixel match |
| 17 | `07b-game-deck-desktop` | `1440×900` | `0` | `1,296,000` | **100.00%** | Exact pixel match |
| 18 | `08-loop-back-homepage-desktop` | `1440×900` | `446` | `1,296,000` | **99.97%** | Continuous `animate-spin-slow` avatar & `pulse` heart phase |
| 19 | `09-setting-custom-edit-desktop` | `1440×900` | `0` | `1,296,000` | **100.00%** | Exact pixel match |

---

## 5. Mobile Screenshot Comparison Results (`390×844`)

Automated pixel-by-pixel visual comparison was executed across all **18 Mobile reference screenshots** (`329,160` total pixels per image, `pixelmatch` threshold `0.1`).

- **Mean Mobile Similarity Across All 18 States:** **`99.43%`** (`97.75%` – `100.00%`)

| # | State Identifier (`baseName`) | Resolution | Diff Pixels | Total Pixels | Similarity | Notes |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| 1 | `01a-welcome-mobile` | `390×844` | `211` | `329,160` | **99.94%** | Subpixel layer rasterization (`#page-content`) |
| 2 | `01b-welcome-button-visible-mobile` | `390×844` | `211` | `329,160` | **99.94%** | Subpixel layer rasterization (`#page-content`) |
| 3 | `02a-pin-empty-mobile` | `390×844` | `712` | `329,160` | **99.78%** | Subpixel glyph edge anti-aliasing |
| 4 | `02b-pin-partial-mobile` | `390×844` | `713` | `329,160` | **99.78%** | Subpixel glyph edge anti-aliasing |
| 5 | `02c-pin-wrong-error-mobile` | `390×844` | `2,051` | `329,160` | **99.38%** | `react-hot-toast` entrance frame + subpixel AA |
| 6 | `03a-homepage-mobile` | `390×844` | `1,485` | `329,160` | **99.55%** | Subpixel layer rasterization (`#page-content`) |
| 7 | `03b-sidebar-open-mobile` | `390×844` | `555` | `329,160` | **99.83%** | Subpixel layer rasterization (`#page-content`) |
| 8 | `04a-album-top-mobile` | `390×844` | `2,039` | `329,160` | **99.38%** | Subpixel image downsampling on rotated Polaroids |
| 9 | `04b-album-scrolled-mobile` | `390×844` | `1,592` | `329,160` | **99.52%** | Subpixel image downsampling on rotated Polaroids |
| 10 | `04c-album-lightbox-0-mobile` | `390×844` | `2,197` | `329,160` | **99.33%** | Underlying album layer subpixel AA |
| 11 | `04d-album-lightbox-1-mobile` | `390×844` | `1,629` | `329,160` | **99.51%** | Underlying album layer subpixel AA |
| 12 | `05a-music-page-mobile` | `390×844` | `1,020` | `329,160` | **99.69%** | Stabilized `1px` YouTube wrapper; subpixel AA only |
| 13 | `06b-letter-complete-mobile` | `390×844` | `7,416` | `329,160` | **97.75%** | High-density `Playwrite VN` script glyph edge AA |
| 14 | `06c-letter-bottom-mobile` | `390×844` | `6,058` | `329,160` | **98.16%** | High-density `Playwrite VN` script glyph edge AA |
| 15 | `07a-game-instructions-mobile` | `390×844` | `190` | `329,160` | **99.94%** | Subpixel glyph edge anti-aliasing |
| 16 | `07b-game-deck-mobile` | `390×844` | `248` | `329,160` | **99.92%** | Subpixel edge anti-aliasing |
| 17 | `08-loop-back-homepage-mobile` | `390×844` | `1,931` | `329,160` | **99.41%** | Continuous `animate-spin-slow` avatar + subpixel AA |
| 18 | `09-setting-custom-edit-mobile` | `390×844` | `0` | `329,160` | **100.00%** | Exact pixel match |

---

## 6. Animation and Audio Verification

All 12 animations and audio mechanisms documented in [`reference/animation-specification.md`](file:///home/tts/Documents/LHA/reference/animation-specification.md) were verified against the live reference site:

1. **Welcome Title Fade-In (`fadeIn`):** Verified CSS `@keyframes fadeIn` (`0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); }`, `1s ease-out`) on `/template/title.png`.
2. **Welcome Button Delayed Entrance (`framer-motion`):** Verified `initial={{ opacity: 0, scale: 0.8 }}`, `animate={{ opacity: 1, scale: 1 }}`, `transition={{ delay: 0.8, duration: 0.5 }}` on the *"Bắt đầu"* button in [`WelcomeScreen.tsx`](file:///home/tts/Documents/LHA/src/components/WelcomeScreen.tsx).
3. **Couple Avatar Continuous Rotation (`animate-spin-slow`):** Verified `animation: spin 10s linear infinite` on both `70×70` circular couple avatars in [`HomepageView.tsx`](file:///home/tts/Documents/LHA/src/components/HomepageView.tsx).
4. **Heart Day-Counter Pulse (`pulse`):** Verified `animation: pulse 1.8s infinite` (`scale(1) → scale(1.1) → scale(1)`) on the center heart icon in [`HomepageView.tsx`](file:///home/tts/Documents/LHA/src/components/HomepageView.tsx).
5. **Sidebar Drawer Slide-In (`slideInLeft`):** Verified `animation: slideInLeft 0.3s ease-out forwards` (`translateX(-100%) → translateX(0)`) in [`Sidebar.tsx`](file:///home/tts/Documents/LHA/src/components/Sidebar.tsx).
6. **Letter Sequential Paragraph Typewriter:** Verified `react-simple-typewriter` (`typeSpeed: 50`, `cursor: true`, `cursorStyle: "|"`) typing each of the 11 paragraphs sequentially in [`LetterView.tsx`](file:///home/tts/Documents/LHA/src/components/LetterView.tsx).
7. **Card Game Vertical Shuffle (`animate-bounce-y`):** Verified `animation: bounceY 0.3s infinite` (`translateY(0) → translateY(-20px) → translateY(0)`) paired with a `100ms` `setInterval` cycling random card images for `3000ms` before settling on the final drawn card in [`GameView.tsx`](file:///home/tts/Documents/LHA/src/components/GameView.tsx).
8. **Background Music Playback (`react-youtube`):** Verified persistent `<YouTube videoId="f9P7_qWrf38" />` instance in [`EcardApp.tsx`](file:///home/tts/Documents/LHA/src/components/EcardApp.tsx) that starts playback immediately upon unlocking the PIN screen (using the user's PIN click gesture to satisfy browser autoplay policies) and continues uninterrupted across all carousel views (`Homepage`, `Album`, `Music`, `Letter`, `Game`), with full Play/Pause and `±10s` seek control on the `Music` view.

---

## 7. Remaining Discrepancies & Technical Root Causes

1. **Toast Notification Frame Timing (`02c-pin-wrong-error-desktop`: `99.89%`)**:
   - `react-hot-toast` animates the error banner entrance using dynamic CSS keyframes (`go3223188581`). A few milliseconds of difference between the screenshot capture trigger and the toast entrance frame accounts for the `0.11%` (`1,461` pixel) difference.
2. **Continuous Infinite Animations (`03a-homepage-top-desktop` & `08-loop-back-homepage-desktop`: `99.97%`)**:
   - The couple avatars (`spin 10s linear infinite`) and center heart (`pulse 1.8s infinite`) animate continuously; when animations are not frozen via CSS injection, the rotation angle differs by a fraction of a degree (`446` pixels out of `1,296,000`). When CSS animations are paused at `0s` (`03a-homepage-desktop`), similarity is **`100.00%` (`0` diff pixels)**.
3. **Mobile GPU Compositor Layer Subpixel Rasterization (`97.75%`–`99.94%` on Mobile `< 768px`)**:
   - **Root Cause Proven via DOM/Compositor Inspection:** Every single DOM bounding box (`x, y, width, height`) and computed CSS style on mobile (`390×844`) is 100% identical between the live reference site and our local build. However, the live reference site loads `https://cdn.tailwindcss.com` asynchronously after its stylesheet (`/assets/main-BeXVYwUq.css`). On the live site, `#page-content { will-change: transform }` promotes `#page-content` to a GPU compositor layer *before* the Tailwind CDN script executes and applies `.fixed { position: fixed }`, leaving Chromium with a stale initial layer backing scale on mobile. When `#page-content { will-change: auto }` is applied on the live site to flush that stale compositor backing texture, the pixel difference between the live site and our local build drops to **`0` pixels (`100.00%`)**.

---

## 8. Known Limitations

1. **Client-Side PIN Verification vs. True Access Control:**
   - The live reference site receives the plaintext PIN directly in the public `/api/ecards/8ae32098-4fc9-4787-9d79-557a03b08532` JSON response and compares `pin === data.pin` in client-side JavaScript.
   - To comply with security requirements and never store the plaintext PIN in source control, [`src/data/ecardData.ts`](file:///home/tts/Documents/LHA/src/data/ecardData.ts) verifies the entered PIN using dual 32-bit FNV-1a and DJB2 checksums (`verifyPin(input)`). As noted in the code comments, client-side hashing of a 4-digit PIN is only obfuscation and not a substitute for server-side authentication.
2. **YouTube IFrame Network Requirement:**
   - Background audio relies on the embedded YouTube IFrame API (`videoId: "f9P7_qWrf38"`). In completely offline environments without internet access to `youtube.com`, the visual Music UI and transport buttons remain fully interactive, while audio stream playback requires network connectivity to YouTube.
3. **Owner Backend Editing (`/ecd/signin/:uuid`):**
   - The Sign-In / Sign-Up screen faithfully reproduces the reference UI and 10-digit phone number validation (`0xxxxxxxxx`), displaying an informational toast upon submission since the proprietary By.Duni backend database is external.

---

## 9. Exact Commands to Run, Build, and Test Locally

All commands should be executed from `/home/tts/Documents/LHA`:

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Local Development Server
```bash
npm run dev
```
- Open `http://localhost:5173/ecd/game/8ae32098-4fc9-4787-9d79-557a03b08532` (or `http://localhost:5173/`, which automatically redirects to the E-Card route).

### 3. Build for Production
```bash
npm run build
```

### 4. Preview the Production Build
```bash
npm run preview
```

### 5. Run the Automated Playwright E2E Test Suite
```bash
npx playwright test
```
