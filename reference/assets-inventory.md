# Reference Client-Side Assets Inventory

All client-side assets discovered via Chrome network monitoring, DOM inspection, and preload JSON analysis are cataloged below.

---

## 1. Template Visual Assets (`/template/*`)

| Asset Path | Content-Type | Size (Bytes) | Usage in Application |
| :--- | :--- | :---: | :--- |
| `/template/background-template.jpg` | `image/jpeg` | `214,203` | Outer desktop background & inner screen background for Welcome, PIN, Album (`Ảnh`), and Letter (`Lá thư`) pages (cream background with 3D soft pink hearts) |
| `/template/background-template-2.png` | `image/png` | `298,282` | Background for Homepage (`Trang chủ`), Music (`Nhạc`), Game (`Game`), and Video (`Video`) pages (blush pink background with 3D soft pink hearts) |
| `/template/background-welcome.png` | `image/png` | `392,087` | Welcome screen illustration featuring the "Thẻ Tình Yêu" logo inside a dashed heart outline |
| `/template/icon_sidebar.png` | `image/png` | `13,542` | Top-left hamburger menu button (`w-10 h-10`) on all `main` sub-pages |
| `/template/logo-font.png` | `image/png` | `19,193` | "Thẻ Tình Yêu" mini logo at the bottom of the Sidebar drawer (`w-1/3 mx-auto mt-auto mb-[25vh]`) |
| `/template/icon_music.png` | `image/png` | `30,318` | Music quick-navigation icon button on `Homepage` |
| `/template/icon_letter.png` | `image/png` | `47,227` | Love Letter quick-navigation icon button on `Homepage` (with red `1` badge) |
| `/template/icon_video.png` | `image/png` | `43,343` | Video quick-navigation icon button on `Homepage` (rendered only when `hasVideo === true`) |
| `/template/back.png` | `image/png` | `29,041` | Floating bottom-left hand-drawn pink left arrow button (`w-12 h-12`) |
| `/template/next.png` | `image/png` | `28,550` | Floating bottom-right hand-drawn pink right arrow button (`w-12 h-12`) |
| `/template/soundwave.png` | `image/png` | `16,687` | Soundwave background image for voice letter player (when `letterData.audio_url` is present) |
| `/template/game/main.png` | `image/png` | `124,761` | "love Drunk" card back image displayed when starting the Card Game |
| `/template/game/card_1.png` – `/template/game/card_55.png` | `image/png` | `~110KB–135KB` each | 55 truth/dare/drinking prompt cards preloaded and randomly drawn in the Card Game |

---

## 2. E-Card User Media Assets (from Preload API)

The reference app converts Google Drive URLs (`https://drive.google.com/uc?id=<ID>`) via `uploadService` into `https://lh3.googleusercontent.com/d/<ID>=w1000`:

| Role / Field | Original Drive ID | Resolved Asset URL (`lh3.googleusercontent.com`) | Caption / Metadata |
| :--- | :--- | :--- | :--- |
| `homepageData.homepage_image` | `1z6ofBa1YdNURsFq73UPwmb9bcwVZA1ls` | `https://lh3.googleusercontent.com/d/1z6ofBa1YdNURsFq73UPwmb9bcwVZA1ls=w1000` | Main square photo on `Trang chủ` |
| `homepageData.avatar_female` | `1BEdeZA8OBSv3Any5rq7JZmgJD7c_arnl` | `https://lh3.googleusercontent.com/d/1BEdeZA8OBSv3Any5rq7JZmgJD7c_arnl=w1000` | Female avatar (`Ngọc Khánh`) on `Trang chủ` & `Lá thư` heart SVG 0 |
| `homepageData.avatar_male` | `142XEByqWVgC3OC8WHGoNTIJhML1t-FMP` | `https://lh3.googleusercontent.com/d/142XEByqWVgC3OC8WHGoNTIJhML1t-FMP=w1000` | Male avatar (`Lê Hoàng Anh`) on `Trang chủ` & `Lá thư` heart SVG 1 |
| `albumData[0]` | `1IqbZqD5GrPsq3Qnsr7ZqvjFlNWp6y2QD` | `https://lh3.googleusercontent.com/d/1IqbZqD5GrPsq3Qnsr7ZqvjFlNWp6y2QD=w1000` | Caption: `"hẹ hẹ"` (Group 1, Image 0 — 58% left) |
| `albumData[1]` | `1dwQgYqSEueMl5HRq3jnbhQ6F6r6bEiIc` | `https://lh3.googleusercontent.com/d/1dwQgYqSEueMl5HRq3jnbhQ6F6r6bEiIc=w1000` | Caption: `"chinh nhật zui zeee"` (Group 1, Image 1 — 40% top-right) |
| `albumData[2]` | `1nZvJXukYC2_Ump_N0bZQNqZ39xbNqt1F` | `https://lh3.googleusercontent.com/d/1nZvJXukYC2_Ump_N0bZQNqZ39xbNqt1F=w1000` | Caption: `"tỏ tình đồ đó"` (Group 1, Image 2 — 40% bottom-right) |
| `albumData[3]` | `1VSO78oJUn9H_gnCWOnzTs_kyACPVEzcg` | `https://lh3.googleusercontent.com/d/1VSO78oJUn9H_gnCWOnzTs_kyACPVEzcg=w1000` | Caption: `"=)))"` (Group 2, Image 0 — 58% right) |
| `albumData[4]` | `1_GmZ2-rByWRBlkB5vZ0uN21pEbu_e5Cn` | `https://lh3.googleusercontent.com/d/1_GmZ2-rByWRBlkB5vZ0uN21pEbu_e5Cn=w1000` | Caption: `"đi bỉn cùng nhau"` (Group 2, Image 1 — 40% top-left) |
| `albumData[5]` | `1iPnb8FjJ3jMD7gLpYui8ffr5MCjWkSnw` | `https://lh3.googleusercontent.com/d/1iPnb8FjJ3jMD7gLpYui8ffr5MCjWkSnw=w1000` | Caption: `"ngại điên"` (Group 2, Image 2 — 40% bottom-left) |
| `albumData[6]` | `1wfKAuAXqMZX8-KxuMpn6NVDrDI89VLmj` | `https://lh3.googleusercontent.com/d/1wfKAuAXqMZX8-KxuMpn6NVDrDI89VLmj=w1000` | Caption: `"ptbbb"` (Group 3, Image 0 — 1/3 center) |
| `musicData[0].image_url` | `1Bg038w05bthwBWtlOAUOTGY9sjWOl5HU` | `https://lh3.googleusercontent.com/d/1Bg038w05bthwBWtlOAUOTGY9sjWOl5HU=w1000` | Cover image on `Nhạc` (`Một Đời`) |

*(Note: All template assets and user media assets are downloaded and stored locally in our implementation's `public/` directory so the recreated experience works reliably without external Google Drive latency or rate-limiting, while preserving identical visual fidelity.)*

---

## 3. Audio & Media Resources

| Resource | Type / Source | Size / ID | Playback Configuration |
| :--- | :--- | :---: | :--- |
| `/sounds/soundtrack.mp3` | `audio/mpeg` (Howler.js) | `3,241,728` bytes | Looping background music (`loop: true, volume: 0.3, preload: true`), starts upon user interaction or entering `main` stage; pauses when `Nhạc` YouTube track plays |
| `/sounds/tap.mp3` | `audio/mpeg` (Howler.js & `HTMLAudioElement`) | `5,015` bytes | UI tap sound effect (`volume: 0.5`, `300ms` throttle in `useTapSound`) and card flip sound effect (`every 300ms` during `Game` card shuffle) |
| YouTube Song (`Một Đời`) | YouTube IFrame API (`react-youtube`) | `videoId: "JgTZvDbaTtg"` | Hidden `1×1` iframe player (`playerVars: { autoplay: 0, playsinline: 1, controls: 0, modestbranding: 1, rel: 0, showinfo: 0, mute: 0, start: 1 }`) controlled by custom UI on `Nhạc` page |

---

## 4. Inline SVGs & Icons

| Icon / SVG | Library / Source | Usage |
| :--- | :--- | :--- |
| `Heart` | `lucide-react` (`viewBox="0 0 24 24"`) | Pulsing red heart (`fill="#FF0000"`, `stroke="#e4e3e4"`) above day count on `Trang chủ` |
| `FaPlay`, `FaPause`, `FaBackward`, `FaForward` | `react-icons/fa` (`viewBox="0 0 448 512"` / `"0 0 512 512"`) | Playback and ±5s seek controls on `Nhạc` page |
| `HeartClippedImage` (`E`) | Custom inline `<svg viewBox="0 0 3000 3000">` | Clips the two bottom avatars on `Lá thư` into rotated (`-10deg`) heart shapes with dashed borders (`stroke="#C0302C"`, `strokeWidth="20"`, `strokeDasharray="500,20"`) |
| `LoaderCircle` / Spinner SVG | `lucide-react` & custom inline `<svg>` | Loading state on Music player button |
