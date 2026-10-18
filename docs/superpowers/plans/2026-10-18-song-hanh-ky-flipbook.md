# SONG HÀNH KÝ PDF Flipbook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace product-facing By.Duni branding with SONG HÀNH KÝ and replace the photo album experience with an uploaded-PDF book flip reader.

**Architecture:** Extend the existing card and media service contracts with one optional PDF asset, render it through PDF.js inside a React page-flip reader, and reuse that reader in editor preview and recipient views. Keep storage and access behind current services; the mock adapter remains session-local, while the updated integration contract specifies the backend work required for durable customer links.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS 3, `pdfjs-dist`, `react-pageflip`.

**Spec:** `docs/superpowers/specs/2026-10-18-song-hanh-ky-flipbook-design.md`

## Global Constraints

- The exact brand string is **SONG HÀNH KÝ**, including diacritics.
- A card contains at most one PDF album asset.
- The initial PDF limit is 100 MB; server-side validation remains authoritative.
- Keep legacy `albumData` readable, but new drafts start without placeholder photo albums and PDF is the only new album experience.
- PIN-protected content, including its PDF descriptor, remains behind the existing authorized-card boundary.
- Mock Blob URLs are local previews and must not be represented as durable published media.
- Do not add or run tests unless requested; use `npm run build` as the compile check.
- No backend implementation exists in this repo; document the required production API/storage contract without claiming durable publishing works through the mock adapter.

## Review Focus

- MIME type and filename disagree for a selected PDF — validation must reject anything that is not actually a PDF.
- PDF exceeds the 100 MB limit — upload must be rejected before object URL creation and with a clear message.
- PDF loading fails or the file is malformed — reader must show a retryable error and keep other card navigation usable.
- PDF is absent on a legacy card or new draft — show a branded empty state; do not render old photo tiles as the new album.
- A PIN-protected card is opened before verification — public metadata must not contain the PDF asset URL or content.

---

### Task 1: Extend card schema and media upload contract for PDF

**Files:**
- Modify: `src/types/ecard.ts`
- Modify: `src/services/MediaService.ts`
- Modify: `src/services/mock/MockMediaService.ts`
- Modify: `src/data/ecardData.ts`
- Modify: `src/admin/context/EditorContext.tsx`
- Modify: `src/services/mock/MockCardRepository.ts`

**Interfaces:**
- Produce `PdfAssetDescriptor` with `id`, `url`, `filename`, literal `mimeType: 'application/pdf'`, `sizeBytes`, and `isLocalPreview`.
- Add optional nullable `albumPdf: PdfAssetDescriptor | null` to `EcardConfig`, `EcardPreloadData`, and `SaveCardDraftPayload`.
- Add optional `albumPdfFilename?: string` to admin-only `CardSummary` data for the card list.
- Extend `MediaAsset.mediaType` and `UploadMediaCategory` with `'pdf'`.
- Extend `MockMediaService` to validate PDF MIME/extension and enforce `100 * 1024 * 1024` bytes.

- [x] Add `albumPdf` and PDF media types to the shared interfaces; initialize default card config with `albumPdf: null`.
- [x] Update empty editor drafts to set `albumPdf: null` and `albumData: []`; map `albumPdf` in `cardConfigToDraftPayload` and `toPreviewConfig`.
- [x] Add PDF MIME/extension validation and the 100 MB maximum to `MockMediaService`; preserve the existing Blob URL preview behavior and `mediaType: 'pdf'`.
- [x] Carry `albumPdf` through mock card creation, save, retrieval and authorized-content responses without dropping legacy `albumData`.
- [x] Include `albumPdfFilename` in mock card summaries while preserving `photoCount` for legacy records.
- [x] Run `npm run build`; expected result: TypeScript and Vite build complete successfully.

### Task 2: Build the reusable responsive PDF flipbook reader

**Files:**
- Create: `src/components/PdfFlipbook.tsx`
- Create: `src/components/PdfFlipbook.css`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consume `PdfAssetDescriptor | null` and optional `mode: 'reader' | 'preview'`.
- Produce `PdfFlipbook` with loading, empty, ready and retryable error states.

- [x] Add compatible `pdfjs-dist` and `react-pageflip` dependencies and configure the PDF.js worker URL for Vite.
- [x] Implement bounded-resolution page rendering and place pages into the page-flip component; clean up document/render resources on URL changes and unmount.
- [x] Add single-page mobile and double-page desktop layouts, page count/seeking, previous/next controls, touch/page-edge navigation and keyboard arrows.
- [x] Add a contents panel using PDF outlines when present and page navigation when no outline is available; add zoom, fullscreen and sound-toggle controls matching the reference.
- [x] Style the reader on a light canvas with SONG HÀNH KÝ identity and accessible labels/focus states; verify loading, empty and invalid/unavailable asset handling in code review.
- [x] Run `npm run build`; expected result: TypeScript and Vite build complete successfully.

### Task 3: Replace admin photo album controls with one PDF upload and preview

**Files:**
- Modify: `src/admin/components/MediaUploadSection.tsx`
- Modify: `src/admin/components/ContentEditorSection.tsx`
- Modify: `src/admin/pages/CardEditorPage.tsx`

**Interfaces:**
- Consume `getMediaService().validateFile(file, 'pdf')` and `.uploadMedia(file, 'pdf')`.
- Store a `PdfAssetDescriptor` on `draft.albumPdf`.

- [x] Replace multi-image album upload, ordering and caption controls with a single PDF picker labeled **Sách lật PDF**, filename/size display, replace and remove actions.
- [x] On selection, validate before upload, show actionable validation/upload errors, then store the descriptor in `draft.albumPdf`.
- [x] Render `PdfFlipbook` in preview mode for the selected draft PDF and show a SONG HÀNH KÝ empty state when no PDF is selected.
- [x] Remove the legacy album caption editor from the content tab and replace card-editor photo counts with PDF status text.
- [x] Run `npm run build`; expected result: TypeScript and Vite build complete successfully.

### Task 4: Integrate the reader in recipient cards and retain access boundaries

**Files:**
- Modify: `src/renderer/EcardRenderer.tsx`
- Modify: `src/data/ecardData.ts`
- Modify: `src/admin/components/TemplateSettingsSection.tsx`

**Interfaces:**
- Consume `config.albumPdf` from `EcardRenderer` and pass it to `PdfFlipbook` on the existing album slide.
- Preserve existing slide navigation and `CardAccessService` PIN unlock flow.

- [x] Replace `AlbumView` rendering with `PdfFlipbook` and remove old photo-grid fallback from the active recipient path.
- [x] Rename the visible album slide and admin slide description to **Sách lật PDF**; preserve slide ID `album` for saved card compatibility.
- [x] Ensure preview mode and the authorized recipient renderer receive the same PDF descriptor and reader component.
- [x] Load public metadata before private content, keep a sanitized shell behind PIN, and fetch full content only after PIN verification; public metadata remains unchanged.
- [x] Run `npm run build`; TypeScript and Vite build complete successfully.

### Task 5: Replace product branding and update the integration contract

**Files:**
- Modify: `src/admin/AdminSidebar.tsx`
- Modify: `src/admin/pages/DashboardPage.tsx`
- Modify: `src/admin/components/TemplateSettingsSection.tsx`
- Modify: `src/data/ecardData.ts`
- Modify: `src/services/mock/MockCardRepository.ts`
- Modify: `src/admin/components/RecentCardsTable.tsx`
- Modify: `index.html`
- Modify: `public/template/placeholder-couple-1.svg`
- Modify: `docs/frontend-backend-contract.md`

- [x] Replace all active UI template/admin copy and visible bundled SVG branding with **SONG HÀNH KÝ**; set browser title, description, keywords and author metadata to the new brand.
- [x] Update the admin card list to show the PDF filename/status for new cards and label retained photo counts as legacy data.
- [x] Update the frontend/backend contract with PDF media type, MIME validation, 100 MB limit, `albumPdf` card field, durable upload/storage requirement, and PIN-protected URL handling.
- [x] Keep current mock/demo publishing copy explicit that Blob-backed PDF previews are not persistent customer assets.
- [x] Search active source, public assets and HTML metadata for remaining By.Duni brand strings; historical reports and reference files retain source-context names only.
- [x] Run `npm run build`; TypeScript and Vite build complete successfully.

### Task 6: Final compile and integration-boundary review

**Files:**
- Review: changes from Tasks 1–5

- [x] Run `npm run build`; successful TypeScript/Vite production build confirmed.
- [x] Review the diff against every acceptance criterion in the spec, especially the local-only mock URL disclosure and backend dependency for durable customer links.
- [x] Record the production backend work that remains outside this repository; do not describe mock publication links as durable PDF links.

## Self-review

- **Spec coverage:** Brand replacement (Task 5); upload, validation, descriptor and mock handling (Tasks 1 and 3); flipbook controls and responsive layout (Task 2); recipient/preview and PIN boundary (Task 4); backend contract and publishing limitation (Task 5); compile and acceptance review (Task 6).
- **Step scan:** Each checkbox is a single edit or compile/review action; all data fields and category names are defined above.
- **Type consistency:** `albumPdf` is a nullable `PdfAssetDescriptor` in card config, preload data, save payload, editor draft and reader props. The general `MediaAsset` remains the upload result and gains `mediaType: 'pdf'`.
- **Review focus:** Five specified cases are mapped to Tasks 1, 2, 3 and 4; validation and protected-content handling are included in those owning tasks.
- **Proportion:** Six tasks separate schema, renderer, editor, recipient integration and branding/contract work while keeping the shared interfaces explicit.
