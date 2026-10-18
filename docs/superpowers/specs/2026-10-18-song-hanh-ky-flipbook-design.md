# SONG HÀNH KÝ brand and PDF flipbook design

**Date:** 2026-10-18  
**Status:** Draft for user review  
**Project:** `/home/tts/Documents/LHA`

## Goal

Replace By.Duni identity in the product with **SONG HÀNH KÝ** and replace the customer-facing photo album with a PDF-powered page-flip book. An administrator uploads a PDF to a card; the preview and the customer-facing card render that document as an interactive book, based on the supplied Heyzine example.

The supplied example presents a centered book on a light canvas, with table-of-contents, zoom, fullscreen and sound controls above it and page navigation below. The product will reproduce this interaction pattern without embedding Heyzine or showing its logo.

## Current project constraints

- The current album model stores a list of image URLs in `albumData`; `AlbumView` renders a photo layout and lightbox.
- The media service accepts image, audio and video files only. Its mock implementation produces session-local Blob URLs.
- The card repository and access service currently resolve to mock adapters. The repository has no production API or cloud-storage implementation.
- Published recipient content is loaded through `CardAccessService`, with a separate PIN verification boundary for protected cards.

Consequently, a local PDF preview can work with the mock service, but a customer link that continues to work after publishing or in another browser requires persistent PDF storage and backend card-content support. The frontend contract in this repository can define that requirement; this repository alone cannot make the mock Blob URL durable.

## Product behavior

### Administration and upload

1. Rename the current album media section to **Sách lật PDF** and replace multi-image album upload/reorder controls with a single-PDF upload control.
2. Accept PDF files only. Validate the extension and MIME type before upload. Use a shared, configurable maximum-size limit, with server-side validation authoritative; the initial frontend default is 100 MB unless backend constraints require a different value.
3. Show selected filename, upload progress/feedback, replace and remove actions, and a flipbook preview in the editor.
4. Store the uploaded asset descriptor in the card draft and save/publish payload. Do not convert the PDF into a list of image URLs in card data.
5. Retain the existing `albumData` field for backward-compatible data reads during rollout, but new and updated cards use the PDF asset. The PDF is the displayed album when present; legacy cards without a PDF show an empty state and do not silently pretend their old photo grid is a flipbook.

### Recipient experience

1. The existing album slide becomes the book reader. It loads the PDF from the persisted asset URL in the authorized card content.
2. Desktop uses a two-page spread where the aspect ratio permits; narrow screens use a single page. Keep the book centered on a light canvas with responsive sizing.
3. Support page turning by visible previous/next controls, dragging/clicking the page edge, touch swipe, and keyboard arrow keys. Display current page and total pages with a seek control.
4. Provide controls matching the reference: contents/navigation panel, zoom, fullscreen and page-turn sound toggle. When PDF outline/bookmark data exists, use it for contents navigation; otherwise expose page numbers so the control remains useful.
5. Show a clear loading state while the PDF is fetched/rendered, an empty state if no PDF is configured, and an inline error with retry for invalid or unavailable PDFs.
6. Preserve the existing card navigation and PIN flow. A protected card must not expose its PDF URL or document before successful PIN verification.

### Brand replacement

1. Use the exact brand text **SONG HÀNH KÝ** in product-visible locations: admin navigation and dashboard copy, recipient-facing identity, browser title, description/author metadata, template names/descriptions, and any bundled image/SVG text used in the interface.
2. Choose typography and weight that fit the existing romantic/editorial design; the brand string itself must remain exact, including Vietnamese diacritics.
3. Do not include a Heyzine logo or attribution in the product reader because the reader is rendered locally.
4. Historical implementation reports and archived source descriptions are documentation, not product identity; they need not be rewritten unless they are surfaced in the running app.

## Technical design

- Extend the media upload category and validation flow with `pdf`.
- Add a dedicated optional PDF asset field to the shared card model and save payload, containing at minimum asset ID, URL, filename and MIME type. Keep image album data readable for legacy records.
- Render PDF pages with Mozilla PDF.js and place the rendered pages in a React page-flip component. This keeps the customer's reader inside the card URL and avoids a third-party flipbook account/link. Candidate packages are `pdfjs-dist` and `react-pageflip`; verify package compatibility, worker configuration, mobile behavior and licensing during implementation planning.
- Keep media storage behind `MediaService`; keep card persistence behind `CardRepository` and public access behind `CardAccessService`. Do not fetch private content through a public unauthenticated path. The HTTP backend contract must accept PDF uploads and persist the PDF descriptor in card content.
- Configure worker loading and page rendering for the existing Vite/React 18 stack. Render pages lazily or at bounded resolution, release PDF/render resources when the reader unmounts, and avoid rendering the full document at print resolution up front.
- Update the integration contract with PDF MIME/size requirements, upload behavior, card schema and protected-content rules. A future/remote backend implementation must store the object durably and return a stable URL, or provide an authorized access route where needed.

## Scope

Included:

- Brand text replacement in active product UI and metadata.
- Admin PDF upload, validation, preview and replacement/removal behavior.
- PDF flipbook on the recipient album slide and preview route.
- Shared model/service contract and integration documentation updates needed to describe durable PDF support.
- Responsive controls and loading, empty and failure states.

Not included:

- Building or deploying a backend/cloud storage implementation, because no backend source exists in this repository.
- Converting legacy image albums into PDFs.
- Replicating Heyzine's branding, analytics, hosted publishing, or account features.
- Editing historical reports that are not displayed in the product.

## Acceptance criteria

1. The active product UI and browser metadata identify the product as **SONG HÀNH KÝ**, with no visible By.Duni branding.
2. The editor accepts one valid PDF for the card, rejects non-PDF/oversized files with an actionable message, shows its filename and preview, and allows replacement/removal.
3. The editor preview and recipient card show the PDF in an animated page-flip reader, with responsive single/double-page layout, page count/navigation, zoom, fullscreen, contents navigation and optional sound control.
4. PDF load, empty, malformed-file and unavailable-asset states are handled without breaking other card slides.
5. PIN-protected cards reveal neither the PDF descriptor nor PDF content before successful unlock.
6. The adapter contract carries the PDF descriptor through save/publish and authorized card loading. Demo mode clearly identifies Blob-backed previews as local only; it does not claim that a local upload is a durable customer URL.
7. No Heyzine logo or Heyzine-hosted reader is required in the deployed product.

## Rollout dependency and limitation

Frontend implementation can provide a working same-session preview with the existing mock adapter. The requested persistent customer link is end-to-end complete only after the production backend implements PDF upload/storage, persists the card PDF descriptor and includes it in authorized public-card responses. Because that backend is absent here, its implementation is a separate integration task; this specification includes the contract it must satisfy.

## Review checklist

- [x] Matches the approved intent: SONG HÀNH KÝ identity, PDF upload and a Heyzine-like in-app book reader.
- [x] Calls out that current Blob URLs are session-local and not suitable for customer publishing.
- [x] Preserves the existing PIN access boundary.
- [x] Keeps legacy photo data readable while making PDF the new album experience.
- [x] Defines actionable behavior and states without binding the product to Heyzine hosting.
- [ ] User review of this written specification.
