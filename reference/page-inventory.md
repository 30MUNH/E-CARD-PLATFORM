# Reference Page & UI State Inventory

**Reference URL:** `https://byduni.com/ecd/game/8ae32098-4fc9-4787-9d79-557a03b08532`  
**Document Title:** `By.Duni – Giúp bạn nói lời yêu`  
**Template ID:** `8fa6d2b3-ba30-4290-9ac7-7a830c23bc7a` (`CustomEcardCarouselWithGame`)  
**Couple Names:** `Ngọc Khánh` & `Lê Hoàng Anh`  
**Love Start Date:** `2025-04-29T17:00:00.000Z`

---

## Architectural Shell & Responsive Framing

The reference application uses a responsive shell (`CustomEcardCarouselWithGame`) with a breakpoint at `window.innerWidth <= 768`:

1. **Desktop Viewport (`> 768px`, tested at `1440×900`)**:
   - Full-viewport outer wrapper (`min-h-screen flex flex-col items-center bg-cover bg-center`) with background image switching dynamically based on the active screen (`/template/background-template.jpg` on Welcome, PIN, Album, Letter; `/template/background-template-2.png` on Homepage, Music, Game, Video).
   - Centered phone frame wrapper: `w-[360px] md:w-[400px] max-w-full mx-auto snap-center shrink-0 p-[50px]`.
   - Phone bezel: `relative rounded-[35px] bg-gray-800 p-3 shadow-xl z-[15] aspect-[9/16] pointer-events-none`.
   - Top speaker/notch pill: `absolute left-1/2 translate-x-[-50%] top-[15px] w-12 h-3.5 bg-gray-800 rounded-full z-[100]`.
   - Inner phone screen: `relative bg-white rounded-[20px] overflow-hidden z-0 w-full h-full flex flex-col pointer-events-auto`.
   - Scrollable screen viewport: `flex-1 overflow-auto relative bg-[url('/template/background-template.jpg')] bg-cover bg-center`.
   - Bottom home indicator bar: `w-1/2 h-1 mx-auto my-2 bg-gray-300 rounded-full`.

2. **Mobile Viewport (`<= 768px`, tested at `390×844`)**:
   - Renders without the gray phone bezel directly inside a full-screen fixed container: `w-full h-screen flex flex-col bg-transparent overflow-hidden fixed top-0 left-0`.

3. **In-App Browser Detection Modal (`Ce` in `useTapSound`)**:
   - Conditionally renders a Radix Dialog (`Chuyển trình duyệt` / `Để có trải nghiệm tốt nhất, vui lòng mở trang web này trong trình duyệt mặc định của bạn.`) only when `navigator.userAgent.toLowerCase().includes('zalo')` is true.

---

## Complete Inventory of Discovered Pages & UI States

### 1. Loading & Error States (Pre-Authentication)
| State ID | Stage / Route | Condition | Visible Content |
| :--- | :--- | :--- | :--- |
| `S0_LOADING` | `/ecd/game/:uuid` | `isLoading === true` while fetching preload JSON | Centered spinner (`animate-spin rounded-full h-12 w-12 border-b-2 border-[#A33149]`) |
| `S0_ERROR` | `/ecd/game/:uuid` | Preload fetch fails or returns null | Centered error message (`Không thể tải dữ liệu thiệp.` in `text-red-500`) |

### 2. Stage 1: Welcome Screen (`currentStep === 'welcome'`)
| State ID | Screen Name | Evidence | Visible Content & Layout |
| :--- | :--- | :--- | :--- |
| `S1_WELCOME` | Welcome Screen | `01a-welcome-desktop.png`, `01b-welcome-button-visible-desktop.png`, `01a-welcome-mobile.png` | Background `/template/background-welcome.png` (featuring the red "Thẻ Tình Yêu" logo inside a dashed heart outline and soft 3D pink hearts). Contains a single primary pill button `"Bắt đầu"` (`bg-[#A33149] text-white rounded-full px-12 py-3 text-xl font-semibold shadow-md active:scale-95 transition mb-10 mt-[75vh]`). |

### 3. Stage 2: Password / PIN Screen (`currentStep === 'pin'`)
| State ID | Screen Name | Evidence | Visible Content & Layout |
| :--- | :--- | :--- | :--- |
| `S2_PIN_LOADING` | PIN Check Loading | DOM inspection | Displays `"Đang tải..."` in `text-lg text-[#BB254E]` while checking `hasPin(ecardId)`. |
| `S2_PIN_EMPTY` | PIN Entry (0 digits) | `02a-pin-empty-desktop.png`, `02a-pin-empty-mobile.png` | Heading `"Mở khóa kỷ niệm"` (`text-2xl font-semibold mb-2 text-[#BB254E]`), subtitle `"Bất ngờ cho cậu nà 😜"` (`mb-6`), 4 empty indicator circles (`w-4 h-4 rounded-full border-2 border-[#BB254E]`), 3×4 numeric keypad grid (`1`–`9`, empty cell, `0`, `"Xóa"`). |
| `S2_PIN_PARTIAL` | PIN Entry (1–3 digits) | `02b-pin-partial-desktop.png`, `02b-pin-partial-mobile.png` | First `N` indicator circles filled with `bg-[#BB254E]`; `"Xóa"` button enabled. |
| `S2_PIN_ERROR` | PIN Verification Failed | `02c-pin-wrong-error-desktop.png`, `02c-pin-wrong-error-mobile.png` | All 4 indicator circles filled (`bg-[#BB254E]`), keypad disabled for 500ms, `react-hot-toast` error toast `"Sai mã PIN"` appears at `top-center`, then PIN resets to empty. |

### 4. Stage 3: Main Experience (`currentStep === 'main'`)

Once unlocked with the valid 4-digit PIN (`[REDACTED_PIN]`), the app enters `main` mode (`j` component), which provides:
- A persistent top-left hamburger/sidebar button (`D`: `absolute left-4 top-4 w-10 h-10 z-[100]` with `/template/icon_sidebar.png`).
- A slide-over Sidebar drawer (`O`) and backdrop overlay (`absolute inset-0 bg-black bg-opacity-30 z-40`).
- An active sub-page determined by `activeIndex` (`0` through `6` in the `E` slides array).

#### 4.1 Global Sidebar Drawer States
| State ID | Screen Name | Evidence | Visible Content & Layout |
| :--- | :--- | :--- | :--- |
| `S3_SIDEBAR_OPEN` | Sidebar Drawer Open | `03b-sidebar-open-desktop.png`, `03b-sidebar-open-mobile.png` | Left drawer (`w-2/3 h-full bg-[#FFF9F5] z-[120]`) over `bg-black bg-opacity-30` overlay. Lists menu items in `text-2xl text-[#A33149] font-bold`: `Trang chủ`, `Ảnh`, `Nhạc`, `Lá thư`, `Game`, `Cài đặt` (note: `Video` is hidden because `hasVideo === false`). Active item highlighted with `bg-[#FFE4E4]`. Bottom displays `/template/logo-font.png` (`w-1/3 mx-auto mt-auto mb-[25vh]`). |

#### 4.2 Sub-Page 0: Homepage (`activeIndex === 0`, `id: 'homepage'`, Title: `Trang chủ`)
| State ID | Screen Name | Evidence | Visible Content & Layout |
| :--- | :--- | :--- | :--- |
| `S4_HOMEPAGE` | Homepage (`Trang chủ`) | `03a-homepage-desktop.png`, `03a-homepage-top-desktop.png`, `03a-homepage-mobile.png` | Background `/template/background-template-2.png`. Top square photo button (`aspect-square rounded-xl`) displaying `homepage_image`. Middle row of quick-nav icon buttons: Music (`/template/icon_music.png`) and Letter (`/template/icon_letter.png` with red notification badge `1`). Bottom gray card (`bg-[#e4e3e4] rounded-2xl py-3 px-4`) showing spinning female avatar (`animate-spin-slow`) + `"Ngọc Khánh"` (`Pacifico`), pulsing red heart (`animate-[pulse_1s_ease-in-out_infinite]`) + dynamic day counter (`530` on 2026-10-12, calculated from `2025-04-29`) + `"ngày"`, and spinning male avatar (`animate-spin-slow`) + `"Lê Hoàng Anh"`. Bottom-right floating Next button (`/template/next.png`, `animate-wiggle-x`). |

#### 4.3 Sub-Page 1: Photo Album (`activeIndex === 1`, `id: 'album'`, Title: `Ảnh`)
| State ID | Screen Name | Evidence | Visible Content & Layout |
| :--- | :--- | :--- | :--- |
| `S5_ALBUM_GRID` | Photo Album Grid | `04a-album-top-desktop.png`, `04b-album-scrolled-desktop.png`, `04a-album-top-mobile.png`, `04b-album-scrolled-mobile.png` | Background `/template/background-template.jpg`. Scrollable collage (`max-h-[75vh] overflow-y-auto`) of 7 couple photos grouped in chunks of 3: Group 1 (1 large 58% left + 2 stacked 40% right), Group 2 (2 stacked 40% left + 1 large 58% right), Group 3 (1 centered 1/3 width photo). Floating Back (`left-[10vw]`) and Next (`right-0`) arrow buttons at `bottom-[5vh]`. |
| `S5_ALBUM_LIGHTBOX` | Photo Lightbox Modal (`u = 0..6`) | `04c-album-lightbox-0-desktop.png`, `04d-album-lightbox-1-desktop.png`, `04c-album-lightbox-0-mobile.png`, `04d-album-lightbox-1-mobile.png` | Fullscreen dark overlay (`fixed inset-0 bg-black bg-opacity-80 z-50`) with white polaroid-style card (`bg-white p-2 rounded-md shadow-2xl`), displaying the selected image and its `Pacifico` cursive caption below (`"hẹ hẹ"`, `"chinh nhật zui zeee"`, `"tỏ tình đồ đó"`, `"=)))"`, `"đi bỉn cùng nhau"`, `"ngại điên"`, `"ptbbb"`). Supports touch-swipe left/right on mobile to switch photos and backdrop click to close. |

#### 4.4 Sub-Page 2: Music Player (`activeIndex === 2`, `id: 'music'`, Title: `Nhạc`)
| State ID | Screen Name | Evidence | Visible Content & Layout |
| :--- | :--- | :--- | :--- |
| `S6_MUSIC_LOADING` | Music Player (YouTube IFrame Loading) | `05a-music-page-desktop.png`, `05a-music-page-mobile.png` | Background `/template/background-template-2.png`. Mauve card (`bg-[#8c5261] rounded-xl p-4`) with square album cover image, artist `"Duni"`, song title `"Một Đời"` (`Pacifico`), subtitle `"Love you to the saturn and back"`, progress bar (`0:00` / `0:00`), skip backward (`-5s`), center button showing spinning loader while YouTube iframe initializes, skip forward (`+5s`). |
| `S6_MUSIC_READY_PAUSED` | Music Player (Ready / Paused) | DOM & code inspection | Center button becomes active (`bg-white text-[#8c4b5d]`) with Play icon (`FaPlay`). |
| `S6_MUSIC_PLAYING` | Music Player (Playing) | Code & interaction inspection | Hidden 1×1 YouTube player (`videoId: 'JgTZvDbaTtg'`) plays audio; background soundtrack pauses automatically; progress bar & elapsed/remaining timers update every 500ms; center button shows Pause icon (`FaPause`). |

#### 4.5 Sub-Page 3: Love Letter (`activeIndex === 3`, `id: 'letter'`, Title: `Lá thư`)
| State ID | Screen Name | Evidence | Visible Content & Layout |
| :--- | :--- | :--- | :--- |
| `S7_LETTER_TYPING` | Love Letter (Typewriter in Progress) | `06a-letter-typing-desktop.png`, `06a-letter-typing-mobile.png` | Background `/template/background-template.jpg`. Scrollable container (`h-[80vh] overflow-y-auto px-2 mt-10`) typing 11 paragraphs character-by-character (`40ms` per character) in `Pacifico, cursive` font (`text-[#A33149]`). |
| `S7_LETTER_COMPLETE` | Love Letter (Completed + Heart Avatars) | `06b-letter-complete-desktop.png`, `06c-letter-bottom-desktop.png`, `06b-letter-complete-mobile.png`, `06c-letter-bottom-mobile.png` | All 11 paragraphs rendered, followed by two custom SVG heart-clipped avatars (`size: 100`, rotated `-10deg` with dashed border `stroke="#C0302C"` `strokeDasharray="500,20"`). Floating Back and Next arrow buttons at `bottom-[5vh]`. |

#### 4.6 Sub-Page 4: Card Game (`activeIndex === 4`, `id: 'game'`, Title: `Game`)
| State ID | Screen Name | Evidence | Visible Content & Layout |
| :--- | :--- | :--- | :--- |
| `S8_GAME_INTRO` | Game Instructions (`started === false`) | `07a-game-instructions-desktop.png`, `07a-game-instructions-scrolled-desktop.png`, `07a-game-instructions-mobile.png` | Background `/template/background-template-2.png`. Translucent pink instruction box (`linear-gradient(to right, #fbe3e3, #f8dada)`, `backdropFilter: blur(4px)`) with heading `"Hướng dẫn chơi:"` and 3 numbered rules in bold italic red (`text-red-600`), followed by `"Bắt đầu"` pill button (`bg-[#f8dada] text-red-600 px-6 py-2 font-extrabold rounded-full shadow hover:bg-red-600 transition`). Floating Back and Next arrows at `bottom-[8vh]`. |
| `S8_GAME_DECK` | Card Game Initial Deck (`started === true`) | `07b-game-deck-desktop.png`, `07b-game-deck-mobile.png` | Displays `/template/game/main.png` ("love Drunk" card back, `w-72 h-auto object-cover rounded-lg cursor-pointer transition-transform duration-300 hover:scale-105`). Floating Back and Next arrows at `bottom-[5vh]`. |
| `S8_GAME_SHUFFLING` | Card Game Shuffling (`shuffling === true`) | `07c-game-shuffling-desktop.png`, `07c-game-shuffling-mobile.png` | Triggered by clicking the card. Cycles through random cards (`card_1.png` to `card_55.png`, never repeating the immediately preceding card) every `300ms` for `3000ms` while vertical bounce animation (`bounceY 0.6s ease-in-out infinite`) and `/sounds/tap.mp3` play on each card flip. |
| `S8_GAME_DRAWN` | Card Game Drawn Card (`shuffling === false`) | `07d-game-drawn-card-1-desktop.png`, `07e-game-drawn-card-2-desktop.png`, `07d-game-drawn-card-1-mobile.png`, `07e-game-drawn-card-2-mobile.png` | Displays the randomly selected truth/dare/drinking prompt card (`card_1.png`..`card_55.png`). Clicking the card again starts a new 3-second shuffle. |

#### 4.7 Sub-Page 5: Video (`activeIndex === 5`, `id: 'video'`, Title: `Video`) — Conditional
| State ID | Screen Name | Evidence | Visible Content & Layout |
| :--- | :--- | :--- | :--- |
| `S9_VIDEO` | Video Page (Conditional) | Code inspection (`VideoCard-Ble7K4c6.js`) | Filtered out of Sidebar and skipped by Game's `Next` button when `hasVideo === false` (which is the case for this e-card). If reached, displays `"Không có video"` when `video_url` is `null`. |

#### 4.8 Sub-Page 6 & External Route: Settings / Custom Edit (`activeIndex === 6`, `id: 'setting'`, Title: `Cài đặt`)
| State ID | Screen Name | Evidence | Visible Content & Layout |
| :--- | :--- | :--- | :--- |
| `S10_SETTING_REDIRECT` | Settings Redirect Spinner | Code inspection (`CustomEcardCarouselWithGame`) | Displays `"Đang chuyển hướng bạn đến trang cài đặt..."` with a gray spinner and sets `window.location.href = '/ecd/custom-edit/8ae32098-4fc9-4787-9d79-557a03b08532'`. |
| `S11_SIGNIN_PAGE` | Owner Sign-In / Sign-Up (`/ecd/signin/:uuid`) | `09-setting-custom-edit-desktop.png`, `09-setting-custom-edit-mobile.png` | Navigating to `/ecd/custom-edit/:uuid` without an active owner token redirects to `/ecd/signin/:uuid?redirect=...`, which renders a centered white card (`bg-white rounded-xl shadow-lg p-8` on `bg-[#FFF9F5]`) with heading `"Đăng nhập/Đăng ký"`, helper text, phone number input (`placeholder="Nhập số điện thoại"`, `maxLength=10`), and submit button. |
