# Reference Navigation Map & State Machine

## High-Level State Machine

```mermaid
stateDiagram-v2
    [*] --> S0_LOADING: Open /ecd/game/:uuid
    S0_LOADING --> S1_WELCOME: Preload API succeeds
    S0_LOADING --> S0_ERROR: Preload API fails
    S1_WELCOME --> S2_PIN_EMPTY: Click "Bắt đầu" (pin exists)
    S2_PIN_EMPTY --> S2_PIN_PARTIAL: Click digit (0-9), length 1..3
    S2_PIN_PARTIAL --> S2_PIN_EMPTY: Click "Xóa" until empty
    S2_PIN_PARTIAL --> S2_PIN_ERROR: 4th digit != [REDACTED_PIN]
    S2_PIN_ERROR --> S2_PIN_EMPTY: Auto-reset after 500ms + Toast "Sai mã PIN"
    S2_PIN_PARTIAL --> S4_HOMEPAGE: 4th digit == [REDACTED_PIN]

    state "Main Experience (currentStep = 'main')" as MAIN {
        S4_HOMEPAGE --> S5_ALBUM_GRID: Click Next arrow / Click big photo / Sidebar "Ảnh"
        S4_HOMEPAGE --> S6_MUSIC_LOADING: Click Music icon / Sidebar "Nhạc"
        S4_HOMEPAGE --> S7_LETTER_TYPING: Click Letter icon / Sidebar "Lá thư"
        S4_HOMEPAGE --> S8_GAME_INTRO: Sidebar "Game"

        S5_ALBUM_GRID --> S4_HOMEPAGE: Click Back arrow / Sidebar "Trang chủ"
        S5_ALBUM_GRID --> S5_ALBUM_LIGHTBOX: Click any photo (0..6)
        S5_ALBUM_LIGHTBOX --> S5_ALBUM_LIGHTBOX: Touch swipe left/right (>50px)
        S5_ALBUM_LIGHTBOX --> S5_ALBUM_GRID: Click dark backdrop
        S5_ALBUM_GRID --> S6_MUSIC_LOADING: Click Next arrow

        S6_MUSIC_LOADING --> S5_ALBUM_GRID: Click Back arrow
        S6_MUSIC_LOADING --> S7_LETTER_TYPING: Click Next arrow

        S7_LETTER_TYPING --> S7_LETTER_COMPLETE: Typewriter completes all 11 lines
        S7_LETTER_TYPING --> S6_MUSIC_LOADING: Click Back arrow
        S7_LETTER_COMPLETE --> S6_MUSIC_LOADING: Click Back arrow
        S7_LETTER_TYPING --> S8_GAME_INTRO: Click Next arrow
        S7_LETTER_COMPLETE --> S8_GAME_INTRO: Click Next arrow

        S8_GAME_INTRO --> S7_LETTER_TYPING: Click Back arrow
        S8_GAME_INTRO --> S8_GAME_DECK: Click "Bắt đầu"
        S8_GAME_DECK --> S8_GAME_SHUFFLING: Click card image
        S8_GAME_SHUFFLING --> S8_GAME_DRAWN: After 3000ms (10 flips @ 300ms)
        S8_GAME_DRAWN --> S8_GAME_SHUFFLING: Click card image again
        S8_GAME_INTRO --> S4_HOMEPAGE: Click Next arrow (hasVideo = false)
        S8_GAME_DECK --> S4_HOMEPAGE: Click Next arrow (hasVideo = false)
        S8_GAME_DRAWN --> S4_HOMEPAGE: Click Next arrow (hasVideo = false)
        S8_GAME_DECK --> S7_LETTER_TYPING: Click Back arrow
        S8_GAME_DRAWN --> S7_LETTER_TYPING: Click Back arrow
    }

    MAIN --> S10_SETTING_REDIRECT: Click Sidebar "Cài đặt"
    S10_SETTING_REDIRECT --> S11_SIGNIN_PAGE: Redirects to /ecd/custom-edit/:uuid -> /ecd/signin/:uuid
```

---

## Slide Index & Navigation Destination Table

The `main` experience manages navigation via an integer state `activeIndex` indexing into the 7-element slides array `E`:

| `activeIndex` | `id` | Sidebar Title | Visible in Sidebar? | `onBack` Destination | `onNext` Destination | Direct Shortcut From Homepage? |
| :---: | :--- | :--- | :---: | :--- | :--- | :--- |
| `0` | `homepage` | `Trang chủ` | Yes | *(No Back button)* | `1` (`album`) | N/A (Initial main screen) |
| `1` | `album` | `Ảnh` | Yes | `0` (`homepage`) | `2` (`music`) | Yes — clicking the large square `homepage_image` |
| `2` | `music` | `Nhạc` | Yes | `1` (`album`) | `3` (`letter`) | Yes — clicking `/template/icon_music.png` |
| `3` | `letter` | `Lá thư` | Yes | `2` (`music`) | `4` (`game`) | Yes — clicking `/template/icon_letter.png` (with badge `1`) |
| `4` | `game` | `Game` | Yes | `3` (`letter`) | `0` (`homepage`) when `hasVideo === false` (or `5` if `hasVideo === true`) | Via Sidebar or Next from Letter |
| `5` | `video` | `Video` | No (`hasVideo === false`) | `4` (`game`) | `0` (`homepage`) | Hidden when `hasVideo === false` |
| `6` | `setting` | `Cài đặt` | Yes | *(Redirects immediately)* | *(Redirects immediately)* | Via Sidebar `"Cài đặt"` |

---

## Important Navigation Nuances Observed

1. **Non-Linear Jump vs. Linear Prev/Next**:
   - From `homepage` (`index 0`), clicking the Letter icon (`icon_letter.png`) jumps directly to `letter` (`index 3`).
   - Once on `letter` (`index 3`), clicking the bottom-left Back button (`back.png`) executes `setActiveIndex(activeIndex - 1)`, which navigates to `music` (`index 2`), NOT back to `homepage` (`index 0`).
   - Similarly, jumping from `homepage` (`index 0`) to `music` (`index 2`) and clicking Back navigates to `album` (`index 1`).
2. **Component Remounting on Slide Change**:
   - Because each sub-page is rendered inside a `switch (currentCard.id)` statement, navigating away from a sub-page unmounts that component and resets its internal state:
     - Leaving `letter` and returning restarts the typewriter animation from paragraph 0, character 0.
     - Leaving `game` (after clicking `"Bắt đầu"` and drawing cards) and returning resets `started` (`o`) to `false`, showing the `"Hướng dẫn chơi:"` instructions screen again.
     - Leaving `music` while the YouTube song is playing unmounts the `MusicCard` component, triggering its cleanup effect (`resumeBackgroundMusic()` after 300ms), so the global `/sounds/soundtrack.mp3` resumes playing.
3. **Browser Refresh Behavior**:
   - Authentication state (`currentStep`) and `activeIndex` are stored in React component state (`useState`), not `localStorage` or URL query parameters. Refreshing the browser returns the user to `S1_WELCOME` (`"Bắt đầu"`).
