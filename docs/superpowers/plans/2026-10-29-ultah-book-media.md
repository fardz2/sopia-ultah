# Birthday Book Media Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the user's seven personal photos and three videos as the only ten content pages in the ThreeUI birthday flipbook; remove the nine demo illustration spreads from the birthday book.

**Architecture:** Keep a byte-identical, unserved copy of the verified ThreeUI HTML as a local source reference and serve a birthday-specific derivative instead of the canonical public page. The birthday derivative's `PAGES` data contains only ten user-media spreads; static SVG scrapbook spreads provide photo/video posters, and video pages create a native player only after an explicit play-button click.

**Tech Stack:** Svelte 5, Vite, vanilla DOM/HTML/CSS/JavaScript in the same-origin iframe, SVG for media spreads, FFmpeg for poster extraction, Playwright browser verification.

**Spec:** `docs/superpowers/specs/2026-10-29-ultah-book-media-design.md`

## Global Constraints

- Keep the ThreeUI book design and its page-turn, zoom, and magnifier interactions; remove its nine demo spreads from the birthday book contents.
- Add seven photos and three videos as ten indexed pages total; do not include the demo illustrations in the birthday `PAGES` array.
- Sort the ten media pages by timestamp in each filename; sort same-timestamp items lexicographically.
- Keep the verified canonical source byte-identical in a non-public local reference path; load only the birthday-specific document in the app.
- Use the uploaded JPEG/MP4 files in `public/`; do not change their content or add external dependencies.
- Do not autoplay videos. Set `preload="none"`; set the video source only after the play button is activated.
- Keep all added page labels and visible errors in Indonesian; no social links or original-page mode.
- Do not create an automated test suite; verify with `npm run build` and the browser checks in this plan.
- The project has no `.git` repository, so no Git commits or worktree operations are available.

## File Structure

- `src/lib/threeui/meng-to-sketchbook-source.html` — exact, unserved ThreeUI source reference moved from the public route.
- `public/landing-pages/birthday-sketchbook.html` — birthday-specific derivative with ten media-only page entries and media playback behavior.
- `public/landing-pages/birthday-media/kenangan-01.svg` through `kenangan-10.svg` — ten landscape SVG media spreads that embed an original photo or poster in a paper frame with a short Indonesian heading.
- `public/landing-pages/birthday-media/video-03.jpg`, `video-04.jpg`, `video-07.jpg` — representative frames extracted from the three MP4 files for the video-page spreads.
- `src/lib/BirthdaySketchbookView.svelte` — points the iframe to the birthday-specific document.
- `src/lib/birthdaySketchbookCopy.ts` — updates the book-index heading and ensures all ten generated captions/index rows remain localized and synchronized.

## Review Focus

- Same-timestamp files and filenames containing spaces or parentheses resolve to the correct public media — Task 2 checks all 10 spread image URLs.
- Portrait photos remain fully visible on a landscape book spread, with no face cropping — Task 2 browser-checks all seven photo pages on desktop and mobile.
- The page index and caption stay aligned across all ten pages, including the wrap from page 10 to page 1 — Task 4 verifies first, last, wrap, and direct-index navigation.
- Videos make no request before activation and do not autoplay — Task 3 verifies the source is unset before activation and only starts after a play click.
- A playing video stops when the reader turns away, while video controls do not accidentally turn the page — Task 3 verifies both interactions.

---

### Task 1: Serve a Birthday-Specific Book Document

**Files:**
- Create: `src/lib/threeui/meng-to-sketchbook-source.html`
- Create: `public/landing-pages/birthday-sketchbook.html`
- Modify: `src/lib/BirthdaySketchbookView.svelte`
- Remove public route: `public/landing-pages/meng-to-sketchbook.html`

**Interfaces:**
- Consumes: the currently verified `public/landing-pages/meng-to-sketchbook.html` and its relative ThreeUI assets.
- Produces: `/landing-pages/birthday-sketchbook.html` as the iframe URL, while `src/lib/threeui/meng-to-sketchbook-source.html` preserves the exact original document bytes.

- [x] Copy the exact current HTML to `src/lib/threeui/meng-to-sketchbook-source.html` and make a birthday-specific working copy at `public/landing-pages/birthday-sketchbook.html`.
- [x] Update `BirthdaySketchbookView.svelte` to load `/landing-pages/birthday-sketchbook.html`; keep the existing `#sbWrap` validation and Indonesian load error.
- [x] Remove the old public canonical HTML path so only the birthday document is served as a page; retain the existing ThreeUI asset directory unchanged.
- [x] Verify the source reference SHA-256 equals the pre-change canonical document hash and that the app iframe loads the birthday document.
- [x] Run `npm run build` and confirm it passes.

### Task 2: Add Ten Media Spread Assets

**Files:**
- Create: `public/landing-pages/birthday-media/kenangan-01.svg` through `kenangan-10.svg`
- Create: `public/landing-pages/birthday-media/video-03.jpg`, `video-04.jpg`, `video-07.jpg`

**Interfaces:**
- Consumes: all seven JPEG and three MP4 files from the project `public/` root.
- Produces: ten landscape SVG spreads with natural-ratio media mats; the three video spreads reference their matching poster JPEGs.

- [x] Map the media in filename-time order, assigning “Kenangan 01” through “Kenangan 10”; same-timestamp items are sorted by filename.
- [x] Use FFmpeg to extract a representative frame at 3 seconds from each video as its poster JPEG; do not modify the MP4 files.
- [x] Create each 1760×1240 SVG spread with a warm paper background, a photo/poster frame using `preserveAspectRatio="xMidYMid meet"`, and its Indonesian heading. Embed the source media as a `data:` URI so it renders when the SVG is loaded as an image.
- [x] Confirm all ten SVGs and three posters return HTTP 200 from the Vite dev server; verify their embedded image references render without network requests to filenames containing spaces or parentheses.
- [x] Visually inspect the ten spreads at desktop and mobile book aspect ratios; keep portrait photos uncropped and legible.

### Task 3: Extend Page Data and Lazy Video Playback

**Files:**
- Modify: `public/landing-pages/birthday-sketchbook.html`

**Interfaces:**
- Consumes: the existing `PAGES` entries, ten SVG spread assets, poster JPEGs, and uploaded MP4 URLs.
- Produces: a ten-entry media-only `PAGES` list. Each entry has `file`, `title`, and `place`; entries also have `mediaType: 'photo' | 'video'` and `typeLabel: 'Foto' | 'Video'`; video entries also have a separate encoded `videoUrl`.

- [x] Use only the ten media entries in birthday `PAGES`; keep titles “Kenangan 01” through “Kenangan 10”, set `mediaType` to `photo` or `video`, and set `typeLabel` to “Foto” or “Video”.
- [x] Keep the page index, `M` page count, modulo navigation, book paint, curl animation, and captions derived from the same ten-entry `PAGES` list; begin at “Kenangan 01”.
- [x] On a selected video page, show an accessible play button over its poster. On activation, create `<video controls playsinline preload="none">`, assign `src` then call `play()` from the same click handler.
- [x] Keep native playback controls inside the book, stop propagation of their pointer events without preventing native control behavior, and stop/remove the video when `paint()` replaces the selected page.
- [x] On media load or playback error, retain book navigation and show a short Indonesian error on the affected page.
- [x] Browser-check that no MP4 request starts before clicking play, each video plays after activation, controls work, and turning away pauses it.

### Task 4: Localize the 10-Page Index and Verify the Book

**Files:**
- Modify: `src/lib/birthdaySketchbookCopy.ts`
- Modify: `public/landing-pages/birthday-sketchbook.html`

**Interfaces:**
- Consumes: the ten page titles and type labels emitted by the birthday document.
- Produces: synchronized Indonesian section heading, index rows, captions, accessible control labels, and page navigation.

- [x] Change the section heading to “Isi buku” and update the meta description to describe ten memory pages.
- [x] Localize all ten “Kenangan 01”–“Kenangan 10” titles and their “Foto” / “Video” index labels.
- [x] Confirm all ten captions and index rows match; clicking index row 10 and wrapping forward returns to page 1 without an out-of-range index.
- [x] Browser-check all ten spreads, page-turn in both directions, index navigation, caption updates, zoom/magnifier, responsive layout, and reduced motion.
- [x] Confirm only user media appears in the birthday book, all seven user photos are uncropped, three posters display, videos are click-to-play, social links and original-page UI are absent, and the browser console has no runtime errors.
- [x] Run `npm run build`; confirm a successful production build. Record any non-fatal existing font warning without treating it as a failure.

## Self-Review

- **Spec coverage:** source preservation and route removal are in Task 1; 10 spread/poster assets and filename encoding in Task 2; the ten media-only pages and lazy video controls are in Task 3; localized index/captions and browser/build verification are in Task 4.
- **Step clarity:** every step names its file/output or a concrete browser assertion. No open TODOs remain.
- **Type/field consistency:** birthday `PAGES` entries carry `file`, `title`, and `place`; media entries add `mediaType` and `typeLabel`, video entries add `videoUrl`; rendering uses computed `url`, playback uses `videoUrl`; the page count derives from `PAGES.length`.
- **Review focus:** all five likely input/failure classes map to explicit manual checks in Tasks 2–4; SVG image restrictions are covered by the embedded-data-URI assertion in Task 2.
- **Proportion:** four tasks separate source routing, media assets, playback/page rendering, and localized end-to-end verification.

## Execution Note

The user previously chose inline implementation in this chat. Keep the implementation in this workspace. Because the workspace has no Git repository, skip commit steps and preserve the verified source reference as the rollback point.
