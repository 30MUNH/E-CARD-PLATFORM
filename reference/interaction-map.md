# Reference Interaction Map

This document maps every interactive control, event handler, audio side-effect, and conditional state transition in the reference website.

---

## 1. Global Interactions

| Trigger / Event | Target Element | Behavior & State Change | Audio Side-Effect |
| :--- | :--- | :--- | :--- |
| First click anywhere on app shell | Outer `.min-h-screen` wrapper | Sets `hasInteracted = true`, invokes `handleUserInteraction()` in `MediaContext` | Starts looping `/sounds/soundtrack.mp3` at `volume: 0.3` if not already playing |
| `onTouchStart` on content area / buttons | `.flex-grow` slide wrapper, Sidebar buttons, PIN buttons | Invokes `useTapSound()` (`Te`) | Plays `/sounds/tap.mp3` at `volume: 0.5` (throttled with a `300ms` cooldown between plays) |
| Window `resize` event | `window` | Updates `isMobile` (`window.innerWidth <= 768`), toggling between the Desktop phone bezel (`A`) and Mobile full-screen container | None |
| Document `visibilitychange` | `document` | When tab becomes hidden (`document.hidden === true`), pauses background soundtrack (and YouTube music if playing); when tab becomes visible again, resumes playback after `300ms` | Pauses / resumes `/sounds/soundtrack.mp3` or YouTube player |

---

## 2. Welcome Screen (`currentStep === 'welcome'`)

| Control | Selector / Classes | Action | Resulting State | Audio Side-Effect |
| :--- | :--- | :--- | :--- | :--- |
| `"Bắt đầu"` Button | `button.bg-[#A33149].rounded-full` | Click (guarded by 1000ms ref lock `n.current`) | Calls `useTapSound()`, checks `preloadedData.ecardData.pin`: since PIN is configured, sets `currentStep = 'pin'` | Plays `/sounds/tap.mp3`; unlocks iOS Safari audio if applicable |

---

## 3. Password / PIN Screen (`currentStep === 'pin'`)

| Control | Selector / Classes | Action | Resulting State | Audio Side-Effect |
| :--- | :--- | :--- | :--- | :--- |
| Digit Buttons (`1`–`9`, `0`) | `button.w-16.h-16.rounded-full.border-[#BB254E]` | Click when `pin.length < 4` and `!isSubmitting` | Appends digit to `pin` state. Fills next indicator dot (`bg-[#BB254E]`). When `pin.length === 4`: sets `isSubmitting = true` and verifies PIN. | `onTouchStart` triggers `/sounds/tap.mp3` |
| 4th Digit Entered (Incorrect) | Keypad auto-submit | `pin !== [REDACTED_PIN]` | Displays `react-hot-toast` error toast `"Sai mã PIN"` at `top-center` (`duration: 4000ms`). After `500ms` timeout, resets `pin = ""` and `isSubmitting = false`. | None |
| 4th Digit Entered (Correct) | Keypad auto-submit | `pin === [REDACTED_PIN]` | Calls `onSuccess()`, transitioning `currentStep` from `'pin'` to `'main'` (`activeIndex = 0`). | Entering `'main'` triggers `handleUserInteraction()` -> starts `/sounds/soundtrack.mp3` (loop, volume `0.3`) |
| `"Xóa"` Button | `button.text-sm.underline.text-[#BB254E]` | Click when `pin.length > 0` and `!isSubmitting` | Removes last character from `pin` (`pin.slice(0, -1)`). Disabled when `pin.length === 0` or `isSubmitting === true`. | `onTouchStart` triggers `/sounds/tap.mp3` |

---

## 4. Main Experience — Sidebar Navigation (`O` & `D`)

| Control | Selector / Classes | Action | Resulting State | Audio Side-Effect |
| :--- | :--- | :--- | :--- | :--- |
| Hamburger Toggle Button | `button.absolute.left-4.top-4.w-10.h-10` (`/template/icon_sidebar.png`) | Click | Toggles `isSidebarOpen` (`!isOpen`) | `onTouchStart` triggers `/sounds/tap.mp3` |
| Sidebar Backdrop Overlay | `div.absolute.inset-0.bg-black.bg-opacity-30.z-40` | Click | Closes sidebar (`setIsOpen(false)`) | None |
| Sidebar Menu Item (`Trang chủ`, `Ảnh`, `Nhạc`, `Lá thư`, `Game`, `Cài đặt`) | `button.w-full.text-left.py-4.px-4.text-[#A33149].font-bold` | Click | Sets `activeIndex` to the clicked item's index in `E`, and closes sidebar (`setIsOpen(false)`) | `onTouchStart` triggers `/sounds/tap.mp3` |

---

## 5. Sub-Page 0: Homepage (`Trang chủ`)

| Control | Selector / Classes | Action | Resulting State | Audio Side-Effect |
| :--- | :--- | :--- | :--- | :--- |
| Big Square Couple Image | `button.w-full.aspect-square.rounded-xl` | Click | Calls `handleCardChange('album')` -> sets `activeIndex = 1` (`Ảnh`) | Plays `/sounds/tap.mp3` via `handleCardChange` |
| Music Icon Button | `button` with `/template/icon_music.png` | Click | Calls `handleCardChange('music')` -> sets `activeIndex = 2` (`Nhạc`) | Plays `/sounds/tap.mp3` via `handleCardChange` |
| Letter Icon Button (with badge `1`) | `button` with `/template/icon_letter.png` | Click | Calls `handleCardChange('letter')` -> sets `activeIndex = 3` (`Lá thư`) | Plays `/sounds/tap.mp3` via `handleCardChange` |
| Floating Next Arrow | `button.fixed.bottom-[5vh].right-0` (`/template/next.png`) | Click | Calls `onNext()` -> `setActiveIndex(1)` (`Ảnh`) | `onTouchStart` on parent triggers `/sounds/tap.mp3` |

---

## 6. Sub-Page 1: Photo Album (`Ảnh`)

| Control | Selector / Classes | Action | Resulting State | Audio Side-Effect |
| :--- | :--- | :--- | :--- | :--- |
| Collage Photo (`0` to `6`) | `img.aspect-square.object-cover` | Click | Sets `selectedIndex = index` (`0..6`), opening the Lightbox modal. Evaluates `naturalHeight / naturalWidth >= 1.5` to set `isPortrait` (`scale-[0.75]` vs `scale-[0.95]`). | `onTouchStart` triggers `/sounds/tap.mp3` |
| Lightbox Modal Card | `div.bg-white.p-2.rounded-md.shadow-2xl` | Click | Calls `e.stopPropagation()` so clicking the photo/caption does not close the modal | None |
| Lightbox Dark Backdrop | `div.fixed.inset-0.bg-black.bg-opacity-80.z-50` | Click | Sets `selectedIndex = null`, closing the modal | None |
| Lightbox Touch Swipe | `div.fixed.inset-0.bg-black.bg-opacity-80.z-50` | `onTouchStart` + `onTouchMove` + `onTouchEnd` with `Math.abs(startX - endX) > 50` | Swipe left (`startX > endX`) advances to `min(selectedIndex + 1, 6)`. Swipe right (`startX < endX`) goes to `max(selectedIndex - 1, 0)`. | None |
| Floating Back Arrow | `button.fixed.bottom-[5vh].left-[10vw]` (`/template/back.png`) | Click | Sets `activeIndex = 0` (`Trang chủ`) | `onTouchStart` triggers `/sounds/tap.mp3` |
| Floating Next Arrow | `button.fixed.bottom-[5vh].right-0` (`/template/next.png`) | Click | Sets `activeIndex = 2` (`Nhạc`) | `onTouchStart` triggers `/sounds/tap.mp3` |

---

## 7. Sub-Page 2: Music Player (`Nhạc`)

| Control | Selector / Classes | Action | Resulting State | Audio Side-Effect |
| :--- | :--- | :--- | :--- | :--- |
| Play / Pause Button | `button.w-10.h-10.rounded-full` | Click (enabled once YouTube player `onReady` fires) | Toggles YouTube player (`videoId: 'JgTZvDbaTtg'`) between play and pause | When playing: pauses `/sounds/soundtrack.mp3`. When paused/ended/unmounted: resumes `/sounds/soundtrack.mp3` after `300ms`. |
| Skip Backward Button (`FaBackward`) | Left icon button | Click | Seeks YouTube player backward by 5 seconds (`Math.max(currentTime - 5, 0)`) | Seeks song audio |
| Skip Forward Button (`FaForward`) | Right icon button | Click | Seeks YouTube player forward by 5 seconds (`Math.min(currentTime + 5, duration)`) | Seeks song audio |
| Progress Bar Track | `div.relative.w-full.h-2.bg-[#b18392]` | Click | Calculates click X ratio `(clientX - rect.left) / rect.width * duration` and seeks YouTube player | Seeks song audio |
| Floating Back Arrow | `button.fixed.bottom-[8vh].left-[10vw]` | Click | Sets `activeIndex = 1` (`Ảnh`) | Unmounts Music page -> resumes background soundtrack |
| Floating Next Arrow | `button.fixed.bottom-[8vh].right-0` | Click | Sets `activeIndex = 3` (`Lá thư`) | Unmounts Music page -> resumes background soundtrack |

---

## 8. Sub-Page 3: Love Letter (`Lá thư`)

| Control | Selector / Classes | Action | Resulting State | Audio Side-Effect |
| :--- | :--- | :--- | :--- | :--- |
| Letter Scroll Container | `div.h-[80vh].overflow-y-auto.px-2.mt-10` | Scroll | Scrolls vertically through the 11 typed paragraphs and 2 SVG heart-clipped avatars | None |
| Floating Back Arrow | `button.fixed.bottom-[5vh].left-[10vw]` | Click | Sets `activeIndex = 2` (`Nhạc`) | `onTouchStart` triggers `/sounds/tap.mp3` |
| Floating Next Arrow | `button.fixed.bottom-[5vh].right-0` | Click | Sets `activeIndex = 4` (`Game`) | `onTouchStart` triggers `/sounds/tap.mp3` |

---

## 9. Sub-Page 4: Card Game (`Game`)

| Control | Selector / Classes | Action | Resulting State | Audio Side-Effect |
| :--- | :--- | :--- | :--- | :--- |
| `"Bắt đầu"` Button (Instructions state) | `button.mt-4.bg-[#f8dada].text-red-600` | Click | Sets `started = true` (`s(!0)`), replacing instructions with the card image (`/template/game/main.png`) | `onTouchStart` triggers `/sounds/tap.mp3` |
| Card Image (`card-game`) | `img.w-72.h-auto.object-cover.rounded-lg.cursor-pointer` | Click (ignored while `shuffling === true`) | Sets `shuffling = true`. Starts `300ms` interval picking random `card_1.png`..`card_55.png` (excluding previous card). After `3000ms`, clears interval and sets `shuffling = false`, landing on the final drawn card. | Plays `new Audio('/sounds/tap.mp3')` (`currentTime = 0; play()`) on every `300ms` card flip (~10 flips per draw) |
| Floating Back Arrow | `button.fixed.bottom-[8vh/5vh].left-[10vw]` | Click | Sets `activeIndex = 3` (`Lá thư`) | `onTouchStart` triggers `/sounds/tap.mp3` |
| Floating Next Arrow | `button.fixed.bottom-[8vh/5vh].right-0` | Click | Since `hasVideo === false`, wraps around to `activeIndex = 0` (`Trang chủ`) | `onTouchStart` triggers `/sounds/tap.mp3` |
