# Ultah ThreeUI Sketchbook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task-by-task.

**Goal:** Complete the birthday edition of the ThreeUI sketchbook website while retaining the untouched canonical page and all original interactions.

**Architecture:** Add a birthday copy helper that updates text inside the existing same-origin sketchbook iframe and observes the generated page index/captions. Add the missing birthday Svelte view, then extend the existing frame with optional document validation, cleanup, and an error fallback.

**Tech Stack:** Svelte 5, TypeScript, Vite, existing ThreeUI HTML/CSS/JavaScript source.

**Spec:** `docs/superpowers/specs/2026-10-29-ultah-threeui-sketchbook-design.md`

## Global Constraints

- Keep `public/landing-pages/meng-to-sketchbook.html` and all 16 registered binary assets byte-for-byte unchanged.
- Keep the original ThreeUI DOM, CSS, JavaScript, page turning, magnifier, zoom, responsive behavior, and relative asset paths.
- Birthday mode is the only user-facing view; no canonical-page toggle or link is shown. The canonical HTML remains the unchanged internal source for artwork and behavior.
- Use Indonesian generic copy with the greeting “Untukmu”; do not invent recipient details or replace the illustrations with photos.
- Add no runtime dependencies and no automated test suite.
- Verify the Vite build and manually check the rendered page and interactions in a browser.

## Review Focus

- Missing or invalid iframe content: verify that the birthday view presents the Indonesian error and retry action without exposing the original page.
- Rebuilt caption and index DOM after a page turn: verify the observer reapplies birthday labels without restoring English text.
- Iframe reloads: verify observer cleanup prevents duplicate callbacks and the birthday copy persists; confirm the page contains no original-page mode switch.
- All nine original pages: verify every birthday title and subtitle maps in the same page order.
- Narrow viewport and reduced-motion preference: verify original responsive/reduced-motion behavior remains usable after copy changes.

---

### Task 1: Complete the birthday sketchbook view

**Files:**
- Create: `src/lib/birthdaySketchbookCopy.ts`
- Create: `src/lib/BirthdaySketchbookView.svelte`
- Modify: `src/lib/LandingPageFrame.svelte`

**Interfaces:**
- Consumes: the existing `LandingPageFrame` props `sourceUrl`, `customization`, `applyScene`, `className`, and `style`; the wrapper's `onSwitchCanonical` callback.
- Produces: `applyBirthdaySketchbookCopy(frame: HTMLIFrameElement): () => void`; `BirthdaySketchbookView` props `{ className?: string; style?: string; customization?: LandingPageCustomization }`.
- Frame additions: optional `validateDocument(frame: HTMLIFrameElement): boolean`, `loadErrorMessage?: string`, and an `applyScene` cleanup return type `void | (() => void)`.

- [ ] **Step 1: Add the birthday copy map and DOM updater** in `src/lib/birthdaySketchbookCopy.ts`.

  Update the document language/title, masthead, three navigation labels, hero kicker, about label and paragraph, plate section label, footer, `#sbHint`, and control `aria-label`s. Remove the placeholder portfolio social-link row from the rendered birthday view. Keep the original source file and image references unchanged. Map each generated title and place in its current order:

  | Source title | Birthday title | Source place | Birthday subtitle |
  | --- | --- | --- | --- |
  | Marina Bay Sands | Harapan baru | Bayfront | Satu tahun penuh cerita |
  | Gardens by the Bay | Bahagia selalu | Supertree Grove | Tawa dan warna |
  | The Merlion | Berani bermimpi | Merlion Park | Langkah baru |
  | Buddha Tooth Relic Temple | Hati yang teduh | Chinatown | Damai dalam hati |
  | Joo Chiat Shophouses | Cerita yang hangat | Katong | Dikelilingi kasih |
  | Lau Pa Sat | Momen paling manis | Raffles Quay | Selalu ada alasan tersenyum |
  | Marina Bay Skyline | Cita-cita setinggi langit | The Bay | Terus bersinar |
  | Singapore River | Petualangan seru | Boat Quay | Langkah yang ringan |
  | Botanic Gardens | Terus bertumbuh | Tanglin | Mekar setiap hari |

  Use a `MutationObserver` on `#plateList`, `#sbCaptions`, and `#sbBook` so newly rendered labels and page-turn control labels stay in Indonesian. Return a cleanup function that disconnects the observer.

- [ ] **Step 2: Add optional document validation and failure state** to `LandingPageFrame.svelte`.

  Validate the loaded frame before applying customizations or birthday copy. When validation fails, show `loadErrorMessage` and a retry button; do not add an original-page link. Keep existing loading and ready states unchanged for callers without validation. Call and replace the previous scene cleanup before installing another scene, and run the active cleanup when the component is destroyed.

- [ ] **Step 3: Create `BirthdaySketchbookView.svelte`** using the same source URL, existing customization, birthday copy updater, and frame validation for `#sbWrap`.

  Remove the `mode` prop and canonical branch from `MengToSketchbookLandingPage.svelte`; render the birthday view directly. Do not add an original-page button or link.

- [ ] **Step 4: Run the production build.**

  Run: `npm run build`

  Expected: Vite exits successfully and no unresolved `BirthdaySketchbookView.svelte` import remains.

- [ ] **Step 5: Verify the birthday and canonical modes in a browser.**

  Run the app with `npm run dev`, then check the birthday copy and all nine labels, confirm no original-page mode or link is visible, turn through all pages, drag the magnifier, and use zoom in/out. Repeat at a narrow viewport and confirm the original motion behavior remains usable. Confirm a failed/invalid source document shows the retry action. Do not add automated tests.

**Commit note:** The workspace has no `.git` directory, so do not create a repository or attempt a commit as part of this task.
