# Reference Animation Specification

This document details every CSS animation, keyframe sequence, transition, and JavaScript-driven motion behavior observed on the reference website.

---

## 1. CSS Keyframe & Utility Animations

### A. Homepage Pulsing Heart (`animate-[pulse_1s_ease-in-out_infinite]`)
- **Target Element**: Lucide `Heart` SVG icon (`w-10 h-10`, `fill="#FF0000"`, `stroke="#e4e3e4"`, `strokeWidth: 2`) on `Trang chủ`.
- **Trigger**: Automatic on mount of `Homepage` (`x`).
- **Keyframes (`@keyframes pulse`)**:
  - `0%, 100%`: `opacity: 1;`
  - `50%`: `opacity: .5;`
- **Duration**: `1s`
- **Easing**: `ease-in-out`
- **Direction & Looping**: Normal, `infinite`.

### B. Card Game Vertical Bounce (`bounceY`)
- **Target Element**: Card image (`img[alt="card-game"]`) on `Game` screen (`T`).
- **Trigger**: Active while `shuffling === true` (`i === true`, for `3000ms` after clicking the card).
- **Inline `<style>` Keyframes**:
  ```css
  @keyframes bounceY {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  ```
- **Inline Style Application**: `style={{ animation: shuffling ? 'bounceY 0.6s ease-in-out infinite' : 'none' }}`
- **Duration**: `0.6s`
- **Easing**: `ease-in-out`
- **Looping**: `infinite` while `shuffling` is `true` (5 full cycles over the `3000ms` shuffle window), then resets to `none`.

### C. Loading Spinners (`animate-spin`)
- **Target Elements**:
  1. Initial preload spinner (`h-12 w-12 border-b-2 border-[#A33149]`).
  2. Music player button initial loading SVG (`animate-spin h-5 w-5`).
  3. Settings redirect spinner (`h-8 w-8 border-b-2 border-gray-700`).
- **Keyframes (`@keyframes spin`)**:
  - `from`: `transform: rotate(0deg);`
  - `to`: `transform: rotate(360deg);`
- **Duration**: `1s`
- **Easing**: `linear`
- **Looping**: `infinite`.

### D. Music Player Ready Button Pulse (`animate-pulse`)
- **Target Element**: Music play/pause button before YouTube iframe fires `onReady` (`bg-gray-300 text-gray-500 animate-pulse`).
- **Duration**: `2s`, `cubic-bezier(0.4, 0, 0.6, 1)`, `infinite`.

### E. Custom Class Names Present in DOM (`animate-spin-slow`, `animate-wiggle-x`)
- **Target Elements**:
  - `animate-spin-slow`: Applied to female and male circular avatars on `Homepage` (`w-20 h-20 rounded-full object-cover mb-1 animate-spin-slow`).
  - `animate-wiggle-x`: Applied to floating Back/Next arrow images (`w-12 h-12 animate-wiggle-x`).
- **Observed Reference Behavior**: In the reference site, `<script id="tailwind-cdn" src="https://cdn.tailwindcss.com"></script>` is loaded with default Tailwind configuration (without custom `spin-slow` or `wiggle-x` keyframes defined in `main-BeXVYwUq.css`), so the class names exist on the DOM elements while their computed `animation-name` evaluates to `none`. Our implementation preserves the exact class names on the DOM nodes to maintain both DOM and visual fidelity.

---

## 2. CSS Transitions (Hover, Active, & Layout)

| Element | Classes | Property | Duration | Easing | Start → End State |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Welcome `"Bắt đầu"` Button | `active:scale-95 transition` | `transform, color, background-color, ...` | `150ms` | `cubic-bezier(0.4, 0, 0.2, 1)` | `scale(1)` → `scale(0.95)` on `:active` |
| Slide Container (`k`) | `transition-all duration-500` | `all` | `500ms` | `cubic-bezier(0.4, 0, 0.2, 1)` | Smooth layout/background transitions on `activeIndex` change |
| Floating Back / Next Buttons | `transition active:scale-95` | `transform, ...` | `150ms` | `cubic-bezier(0.4, 0, 0.2, 1)` | `scale(1)` → `scale(0.95)` on `:active` |
| Album Collage Thumbnails | `scale-[0.9] hover:scale-105 transition-transform` | `transform` | `150ms` | `cubic-bezier(0.4, 0, 0.2, 1)` | `scale(0.9)` → `scale(1.05)` on `:hover` |
| Album Lightbox Card | `transition-transform duration-300` | `transform` | `300ms` | `cubic-bezier(0.4, 0, 0.2, 1)` | `scale(0.75)` (portrait `h/w >= 1.5`) or `scale(0.95)` (landscape/square) |
| Game Start Button | `hover:bg-red-600 transition` | `background-color, ...` | `150ms` | `cubic-bezier(0.4, 0, 0.2, 1)` | `bg-[#f8dada]` → `bg-[#dc2626]` on `:hover` |
| Game Card Image | `transition-transform duration-300 hover:scale-105` | `transform` | `300ms` | `cubic-bezier(0.4, 0, 0.2, 1)` | `scale(1)` → `scale(1.05)` on `:hover` |

---

## 3. JavaScript-Driven & Timed Animations

### A. Love Letter Typewriter Animation (`k` in `VideoCard-Ble7K4c6.js`)
- **Trigger**: Mounting the `Letter` sub-page (`activeIndex === 3`).
- **State Variables**:
  - `completedLines` (`t`): `string[]` (initially `[]`)
  - `currentLineIndex` (`r`): `number` (initially `0`)
  - `currentText` (`a`): `string` (initially `""`)
  - `charIndexRef` (`s`): `useRef(0)`
- **Step Timing**: `setTimeout(..., 40)` (`40ms` per character).
- **Sequence Logic**:
  1. While `currentLineIndex < letters.length` (11 paragraphs total):
  2. Every `40ms`, slices `letters[currentLineIndex].slice(0, charIndexRef.current + 1)` into `currentText` and increments `charIndexRef.current`.
  3. When `charIndexRef.current === letters[currentLineIndex].length`, the next `40ms` tick appends the finished paragraph to `completedLines`, increments `currentLineIndex`, resets `currentText = ""`, and resets `charIndexRef.current = 0`.
  4. Continues until all 11 paragraphs are in `completedLines`.

### B. Card Game Random Shuffle Sequence (`T` in `CustomEcardCarouselWithGame-CEXcAGN0.js`)
- **Trigger**: Clicking `img[alt="card-game"]` when `shuffling === false`.
- **Interval (`S`)**: `300ms` (`setInterval`).
- **Total Duration (`C`)**: `3000ms` (`setTimeout`).
- **Sequence Logic**:
  1. Sets `shuffling = true` (`a(!0)`), activating `bounceY 0.6s ease-in-out infinite`.
  2. Every `300ms`:
     - Picks a random integer `e` in `[1, 55]`, re-rolling while `e === lastCardRef.current` so consecutive flips never show the same card.
     - Preloads `/template/game/card_${e}.png` via `new Image()`, updates `cardSrc`, resets `tapAudio.currentTime = 0`, and plays `/sounds/tap.mp3`.
  3. At `3000ms`, clears the interval and sets `shuffling = false`, leaving the final drawn card displayed on screen.

### C. Toast Notification Enter/Exit Animations (`react-hot-toast` / `_goober`)
- **Trigger**: Entering an invalid 4-digit PIN (`toast.error("Sai mã PIN")`).
- **Enter Animation**: `0.35s cubic-bezier(.21, 1.02, .73, 1) forwards` (`translate3d(0, -200%, 0) scale(0.6) opacity: 0.5` → `translate3d(0, 0, 0) scale(1) opacity: 1`).
- **Error Icon Animation**: Red circle (`#ff4b4b`, `20px × 20px`) scales in with `0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)` (`100ms` delay) and white `X` bars animate in at `150ms` and `180ms` delays.
- **Auto-Dismiss**: `4000ms` duration, followed by `0.4s forwards cubic-bezier(.06, .71, .55, 1)` exit animation.
