# Reference Design System Specification

## 1. Typography

### Font Families
1. **Primary UI Sans-Serif (Tailwind Default Sans)**:
   - Stack: `ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`
   - Used on: Welcome button (`Bắt đầu`), PIN screen (`Mở khóa kỷ niệm`, `Bất ngờ cho cậu nà 😜`, digits `0–9`, `Xóa`), Sidebar menu items, Homepage day counter number (`530`) and notification badge (`1`), Music artist (`Duni`), subtitle (`Love you to the saturn and back`), and timestamps, Game instructions (`Hướng dẫn chơi:`) and button (`Bắt đầu`).
2. **Decorative Script / Handwritten Font**:
   - Declared inline via `style={{ fontFamily: 'Pacifico, cursive', fontWeight: '400' }}` (or `fontFamily: "'Pacifico', cursive"` on Album lightbox captions).
   - Note on Reference Font Loading: The reference HTML does not include a Google Fonts `<link>` tag for `Pacifico`, so browsers without `Pacifico` installed locally fall back to the system `cursive` font (or `Pacifico` if available). In our recreation, we preserve the exact inline `style={{ fontFamily: 'Pacifico, cursive', fontWeight: '400' }}` declarations to match the reference DOM and computed styles 1:1.
   - Used on:
     - Homepage couple names (`Ngọc Khánh`, `Lê Hoàng Anh`) and `"ngày"` label.
     - Album lightbox photo captions (`hẹ hẹ`, `chinh nhật zui zeee`, etc.).
     - Music song title (`Một Đời`).
     - All paragraphs in the Love Letter (`Lá thư`).

### Type Scale & Weights
| Element | Tailwind Classes / Inline Styles | Computed Size / Line Height | Weight |
| :--- | :--- | :--- | :--- |
| Welcome `"Bắt đầu"` Button | `text-xl font-semibold` | `20px` / `28px` (`1.25rem` / `1.75rem`) | `600` |
| PIN Title (`Mở khóa kỷ niệm`) | `text-2xl font-semibold` | `24px` / `32px` (`1.5rem` / `2rem`) | `600` |
| PIN Subtitle (`Bất ngờ cho cậu nà 😜`) | *(default body)* `mb-6` | `16px` / `24px` | `400` |
| PIN Keypad Digits (`0`–`9`) | `text-lg` | `18px` / `28px` | `400` |
| PIN Delete (`Xóa`) | `text-sm underline` | `14px` / `20px` | `400` |
| Sidebar Menu Items | `text-2xl font-bold` | `24px` / `32px` | `700` |
| Homepage Notification Badge (`1`) | `text-lg font-bold` | `18px` / `28px` | `700` |
| Homepage Couple Names | `text-lg font-bold` + inline `fontWeight: 400` | `18px` / `28px` | `400` |
| Homepage Love Days Number (`530`) | `text-3xl font-bold` | `30px` / `36px` | `700` |
| Homepage `"ngày"` Label | `text-sm font-medium` + inline `fontWeight: 400` | `14px` / `20px` | `400` |
| Album Lightbox Caption | `text-lg leading-snug` | `18px` / `1.375` | `400` |
| Music Artist & Subtitle | `text-sm` | `14px` / `20px` | `400` |
| Music Song Title (`Một Đời`) | `text-2xl` + `fontWeight: 400` | `24px` / `32px` | `400` |
| Music Timestamps | `text-sm` | `14px` / `20px` | `400` |
| Love Letter Paragraphs | `text-left sm:text-[15px]` + `Pacifico, cursive` | `16px` (mobile) / `15px` (`>=640px`) | `400` |
| Game Instructions Title | `text-lg font-extrabold italic` | `18px` / `28px` | `800` |
| Game Instructions Body | `text-sm font-bold italic leading-relaxed` | `14px` / `1.625` | `700` |
| Game Start Button (`Bắt đầu`) | `font-extrabold` | `16px` / `24px` | `800` |

---

## 2. Color Palette & Gradients

| Token / Usage | Hex / Value | Tailwind / CSS Representation |
| :--- | :--- | :--- |
| Primary Burgundy / Wine Red | `#A33149` | `bg-[#A33149]`, `text-[#A33149]`, `border-[#A33149]` |
| PIN Screen Crimson / Berry | `#BB254E` | `text-[#BB254E]`, `border-[#BB254E]`, `bg-[#BB254E]` |
| Theme Meta Color | `#8d2a2c` | `<meta name="theme-color" content="#8d2a2c">` |
| Sidebar Surface Cream | `#FFF9F5` | `bg-[#FFF9F5]` |
| Main Shell / Active Menu Blush | `#FFE4E4` | `bg-[#FFE4E4]` |
| Homepage Couple Card Gray | `#e4e3e4` | `bg-[#e4e3e4]`, heart SVG `stroke="#e4e3e4"` |
| Homepage Pulsing Heart Fill | `#FF0000` | `fill="#FF0000"` |
| Homepage Notification Badge / Game Text | `#DC2626` | `bg-red-600`, `text-red-600` |
| Music Player Card Mauve | `#8c5261` | `bg-[#8c5261]` |
| Music Player Muted Text | `#c4a5ab` | `text-[#c4a5ab]` |
| Music Progress Track | `#b18392` | `bg-[#b18392]` |
| Music Play Button Text | `#8c4b5d` | `text-[#8c4b5d]` |
| Letter Heart Avatar Dashed Border | `#C0302C` | `stroke="#C0302C"` |
| Game Instructions Gradient | `#fbe3e3` → `#f8dada` | `background: linear-gradient(to right, #fbe3e3, #f8dada)` |
| Game Start Button Fill | `#f8dada` | `bg-[#f8dada] text-red-600 hover:bg-red-600` |
| Desktop Phone Bezel | `#1F2937` | `bg-gray-800` |
| Desktop Home Bar / Disabled Button | `#D1D5DB` | `bg-gray-300` |
| Sidebar Backdrop Overlay | `rgba(0, 0, 0, 0.3)` | `bg-black bg-opacity-30` |
| Album Lightbox Overlay | `rgba(0, 0, 0, 0.8)` | `bg-black bg-opacity-80` |

---

## 3. Layout, Spacing, Containers & Responsive Breakpoints

### Breakpoints
- **JS Mobile Detection (`isMobile`)**: `window.innerWidth <= 768`
  - When `true` (`<= 768px`): Renders full-viewport fixed container (`w-full h-screen flex flex-col bg-transparent overflow-hidden fixed top-0 left-0`).
  - When `false` (`> 768px`): Renders inside the desktop phone mockup frame (`A`).
- **Tailwind CSS Breakpoints**:
  - `sm:` (`>= 640px`): Changes Homepage quick-action icons from `w-20 h-20` to `sm:w-28 sm:h-28`, Homepage container `sm:max-w-sm sm:mx-auto`, Album lightbox card `sm:w-[50%]`, and Letter font size `sm:text-[15px]`.
  - `md:` (`>= 768px`): Changes desktop phone frame outer wrapper from `w-[360px]` to `md:w-[400px]`.

### Container Dimensions & Positioning
- **Desktop Phone Frame (`A`)**:
  - Outer padding container: `w-[360px] md:w-[400px] max-w-full mx-auto snap-center shrink-0 p-[50px]` (effective frame width on desktop: `300px`).
  - Bezel: `relative rounded-[35px] bg-gray-800 p-3 shadow-xl z-[15] aspect-[9/16] pointer-events-none` (`300px × 533.33px`).
  - Notch: `absolute left-1/2 translate-x-[-50%] top-[15px] w-12 h-3.5 bg-gray-800 rounded-full z-[100]`.
  - Inner Screen: `relative bg-white rounded-[20px] overflow-hidden z-0 w-full h-full flex flex-col pointer-events-auto` (`276px × 509.33px`).
- **Floating Navigation Arrows (`back.png`, `next.png`)**:
  - Positioned with `fixed` positioning relative to the viewport:
    - On Homepage, Album, Letter, Video, and Game (active deck): `fixed bottom-[5vh] left-[10vw] transform -translate-x-1/2` (Back) and `fixed bottom-[5vh] right-0 transform -translate-x-1/2` (Next).
    - On Music and Game (instructions): `fixed bottom-[8vh] left-[10vw] transform -translate-x-1/2` (Back) and `fixed bottom-[8vh] right-0 transform -translate-x-1/2` (Next).
  - Icon size: `w-12 h-12 animate-wiggle-x` (`48px × 48px`).
- **Sidebar Toggle Button (`D`)**:
  - `absolute left-4 top-4 w-10 h-10 z-[100]` (`40px × 40px`).

---

## 4. Layering & Z-Index Hierarchy

| Layer / Component | Z-Index Class / Style | Effective Z-Index |
| :--- | :--- | :---: |
| Inner Phone Screen / Album Root | `z-0` | `0` |
| Desktop Phone Bezel | `z-[15]` | `15` |
| Sidebar Backdrop Overlay | `z-40` | `40` |
| Floating Prev/Next Buttons & Album Lightbox Backdrop | `z-50` | `50` |
| Desktop Notch Pill & Sidebar Toggle Button (`icon_sidebar.png`) | `z-[100]` | `100` |
| Sidebar Drawer (`O`) | `z-[120]` | `120` |
| Album Lightbox Card | `z-[130]` | `130` |
| Toast Notifications (`react-hot-toast`) | `zIndex: 9999` | `9999` |
