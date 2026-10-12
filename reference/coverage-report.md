# Reference Exploration & Verification Coverage Report

## 1. Summary of Discovered Experience

- **Reference URL**: `https://byduni.com/ecd/game/8ae32098-4fc9-4787-9d79-557a03b08532`
- **Template Type**: `CustomEcardCarouselWithGame` (By.Duni "Thẻ Tình Yêu" Interactive Romantic E-Card with Love Drunk Card Game)
- **Authentication**: 4-digit PIN screen (`[REDACTED_PIN]`) following an initial `"Bắt đầu"` welcome screen.
- **Total Unique Stages / Sub-Pages**:
  - 2 Pre-Main Stages: `Welcome` (`welcome`), `PIN Authentication` (`pin`)
  - 5 Active Main Sub-Pages: `Trang chủ` (`homepage`), `Ảnh` (`album`), `Nhạc` (`music`), `Lá thư` (`letter`), `Game` (`game`)
  - 1 Conditional Sub-Page: `Video` (`video`, hidden for this e-card because `hasVideo: false`)
  - 1 Redirect Sub-Page & Route: `Cài đặt` (`setting` -> `/ecd/custom-edit/:uuid` -> `/ecd/signin/:uuid`)

---

## 2. Page & UI State Coverage Matrix

| State ID | Page / UI State | Desktop (`1440×900`) Tested? | Mobile (`390×844`) Tested? | Screenshot Evidence |
| :--- | :--- | :---: | :---: | :--- |
| `S1_WELCOME` | Welcome Screen (initial & button scrolled) | Yes | Yes | `01a-welcome-desktop.png`, `01b-welcome-button-visible-desktop.png`, `01a-welcome-mobile.png` |
| `S2_PIN_EMPTY` | PIN Screen (0 digits entered) | Yes | Yes | `02a-pin-empty-desktop.png`, `02a-pin-keypad-scrolled-desktop.png`, `02a-pin-empty-mobile.png` |
| `S2_PIN_PARTIAL` | PIN Screen (partial digits + `"Xóa"` tested) | Yes | Yes | `02b-pin-partial-desktop.png`, `02b-pin-partial-mobile.png` |
| `S2_PIN_ERROR` | PIN Screen (wrong PIN -> `"Sai mã PIN"` toast + auto-reset) | Yes | Yes | `02c-pin-wrong-error-desktop.png`, `02c-pin-wrong-error-mobile.png` |
| `S3_SIDEBAR_OPEN` | Sidebar Drawer Open + Overlay Dismissal | Yes | Yes | `03b-sidebar-open-desktop.png`, `03b-sidebar-open-mobile.png` |
| `S4_HOMEPAGE` | Homepage (`Trang chủ`) — Photo, Shortcuts, Avatars, Day Counter (`530`) | Yes | Yes | `03a-homepage-desktop.png`, `03a-homepage-top-desktop.png`, `03a-homepage-mobile.png` |
| `S5_ALBUM_GRID` | Photo Album (`Ảnh`) — Top & Scrolled Collage Grid (7 photos) | Yes | Yes | `04a-album-top-desktop.png`, `04b-album-scrolled-desktop.png`, `04a-album-top-mobile.png`, `04b-album-scrolled-mobile.png` |
| `S5_ALBUM_LIGHTBOX` | Photo Album Lightbox Modal (Photo 0 `"hẹ hẹ"`, Photo 1 `"chinh nhật zui zeee"`, backdrop close) | Yes | Yes | `04c-album-lightbox-0-desktop.png`, `04d-album-lightbox-1-desktop.png`, `04c-album-lightbox-0-mobile.png`, `04d-album-lightbox-1-mobile.png` |
| `S6_MUSIC` | Music Player (`Nhạc`) — `"Một Đời"` Cover, Progress Bar, Controls | Yes | Yes | `05a-music-page-desktop.png`, `05a-music-page-mobile.png` |
| `S7_LETTER_TYPING` | Love Letter (`Lá thư`) — Typewriter Animation in Progress | Yes | Yes | `06a-letter-typing-desktop.png`, `06a-letter-typing-mobile.png` |
| `S7_LETTER_COMPLETE` | Love Letter (`Lá thư`) — All 11 Paragraphs + 2 Heart-Clipped SVG Avatars | Yes | Yes | `06b-letter-complete-desktop.png`, `06c-letter-bottom-desktop.png`, `06b-letter-complete-mobile.png`, `06c-letter-bottom-mobile.png` |
| `S8_GAME_INTRO` | Card Game (`Game`) — `"Hướng dẫn chơi:"` Instructions + `"Bắt đầu"` Button | Yes | Yes | `07a-game-instructions-desktop.png`, `07a-game-instructions-scrolled-desktop.png`, `07a-game-instructions-mobile.png` |
| `S8_GAME_DECK` | Card Game (`Game`) — Initial `"love Drunk"` Deck (`/template/game/main.png`) | Yes | Yes | `07b-game-deck-desktop.png`, `07b-game-deck-mobile.png` |
| `S8_GAME_SHUFFLING` | Card Game (`Game`) — 3-Second `bounceY` Shuffle Interval | Yes | Yes | `07c-game-shuffling-desktop.png`, `07c-game-shuffling-mobile.png` |
| `S8_GAME_DRAWN` | Card Game (`Game`) — Drawn Prompt Cards (Multiple Consecutive Draws) | Yes | Yes | `07d-game-drawn-card-1-desktop.png`, `07e-game-drawn-card-2-desktop.png`, `07d-game-drawn-card-1-mobile.png`, `07e-game-drawn-card-2-mobile.png` |
| `S8_LOOP_HOME` | Loop Navigation from `Game` Next Button back to `Homepage` | Yes | Yes | `08-loop-back-homepage-desktop.png`, `08-loop-back-homepage-mobile.png` |
| `S10_SETTING` / `S11_SIGNIN` | Sidebar `"Cài đặt"` Redirect to `/ecd/custom-edit/:uuid` -> `/ecd/signin/:uuid` | Yes | Yes | `09-setting-custom-edit-desktop.png`, `09-setting-custom-edit-mobile.png` |

---

## 3. Video Recording Evidence

- `reference/recordings/full-exploration-desktop.webm` (`1440×900`, `6.2 MB`)
- `reference/recordings/full-exploration-mobile.webm` (`390×844`, `5.0 MB`)

---

## 4. Items Verified vs. Conditionally Inactive / Auth-Gated

1. **Fully Verified & Explored**:
   - All public and PIN-authenticated screens (`Welcome`, `PIN`, `Homepage`, `Album` + Lightbox, `Music`, `Letter`, `Game`, `Sidebar`, and `Sign-In`).
   - All client-side assets (`/template/*`, `/sounds/*`, and all 11 Google Drive user images).
2. **Conditionally Inactive for This E-Card UUID**:
   - **Voice Audio on Letter Page (`letterData.audio_url`)**: `null` (`hasVoice: false`) in this e-card's data payload; however, the voice player component code was inspected and documented.
   - **Video Sub-Page (`hasVideo`)**: `false` (`videoData.video_url: null`) in this e-card's data payload; hidden in Sidebar and skipped by Game's Next button, though supported in our code.
3. **Server-Side Owner Authentication Gate**:
   - **Authenticated Custom Edit Form (`/ecd/custom-edit/:uuid`)**: Requires an authenticated owner session via phone OTP (`/ecd/signin/:uuid`). We captured and documented the unauthenticated redirect target (`/ecd/signin/:uuid`) and recreated both the `"Đang chuyển hướng bạn đến trang cài đặt..."` state and the `/ecd/signin/:uuid` screen.
