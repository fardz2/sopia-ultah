# Full 3D Birthday World Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the approved full 3D romantic birthday experience from Faridz to Sopia, with one renderer and complete native controls/fallbacks.

**Architecture:** One native Svelte host owns one deferred Three.js engine. Story and ritual groups share its renderer, resource owner, camera rig, and typed snapshot; Svelte owns calendar/session, book transactions, readable text, focus, and native video. Existing media and HTML/CSS components supply the accessible fallback.

**Tech Stack:** Svelte 5, TypeScript, Vite, installed Three.js, SolidCraft CLI, existing Node assertions and Python Playwright; no React, iframe, or new product runtime dependency.

**Spec:** `docs/superpowers/specs/2026-11-03-full-3d-birthday-world-design.md` (approved 3 November 2026).

**Execution method:** Native/inline in this chat, preserving the user's existing choice. Use executing-plans after plan approval, with one final fresh whole-change review.

## Global Constraints

- Preserve cream `#ece7dc`, ink `#2b2721`, secondary ink `#514c43`, earth `#78532f`, existing fonts, Indonesian copy, all seven photos/three lazy videos, and Faridz as Sopia's boyfriend/sender.
- First release remains 7 November 2026, 00.00 WIB; after release the keepsake never locks again on later dates/year changes. `date.ts` remains authoritative; preview/session markers remain separate.
- Objects and scene travel use Three.js; text, buttons, focus, and video controls remain native Svelte/HTML. No invented personal facts, social links, dummy pages, or voice recording.
- One main WebGL context. No competing old leaf/gallery/book/candle renderers when world mode is active. Static fallbacks remain complete.
- Native scroll and touch scrolling; no wheel replacement, orbit control, gyro/microphone permissions, or background audio.
- Book turn approximately 280 ms; drag cancellation approximately 180 ms; ordinary feedback 100–300 ms; composition changes 300–500 ms; candle 850 ms; finale finishes around two seconds.
- DPR at most 1.35 desktop/1 phone. Initial visible-geometry budget 80,000 triangles, 60 desktop/40 phone draw calls. No dynamic shadow maps or heavy postprocessing.
- Decorative asset deadline five seconds, with a usable substitute. Stop rendering while idle/hidden; dispose late results, listeners, timers, and GPU resources.
- Test 1440×900, 768×1024, 390×844, and 320×568; distinguish viewport emulation from physical-device testing.
- Use RTK for CLI commands and mandatory Svelte skills/autofixer for edited components/modules. No unrelated cleanup or publishing.

## Review Focus

- Hidden tab during midnight intro, page turn, or envelope opening: resume valid state once, and never reopen dismissed content. Covered by Tasks 1, 6, 7.
- Rapid page changes/index seeks while an earlier MP4 play promise is pending: only the latest page/play request may win. Covered by Task 5.
- Orientation/resize during reading, dragging, magnification, or native video: recompute projection and retain usable controls/state. Covered by Tasks 3, 5, 7.
- Context loss or late texture/STL completion after dispose/remount: no stale callback, additional renderer, or leaked resource. Covered by Tasks 2, 3, 7.
- Deep-anchor visits, future-year archive, and preview in a separate session: correct chapter/release/accessibility with no accidental birthday replay. Covered by Tasks 1, 7.

## File Map and Shared Interfaces

Create under `src/lib/birthday/world/`:

- `types.ts`: `StoryChapter = 'opening' | 'teaser' | 'frame' | 'iris' | 'gallery' | 'book' | 'wishes' | 'closing'`; `RitualPhase = 'sealed' | 'opening' | 'letter' | 'candle' | 'finale'`; `WorldStatus = 'idle' | 'loading' | 'ready' | 'failed'`.
- `types.ts`: `ScreenRect { x, y, width, height }`; `WorldLayout { width, height, dpr, mobile, portrait, targets }`, where targets are partial rectangles for portrait/book/letter/candle/finale.
- `types.ts`: `WorldSnapshot { unlocked, hidden, story:{chapter,progress}, ritual:{open,phase,revision,blow,replay}, book:{index,turn,zoom,loupe:{on,u,v},videoPlaying} }`. Progress/blow/UV values are normalized; no wall-clock timestamp or Three.js objects in snapshots.
- `types.ts`: `WorldCallbacks { onStatus(status), onBookTurnEnd(id), onBookProjection({spread,video}) }`, nullable projected rectangles; `WorldDriver { update(snapshot), resize(layout), destroy() }`.
- `bookState.ts`: pure `BookState { index, turn, nextId }`, `BookTurn { id, from, to, direction, progress, animation }`, and `animation = {from,to:0|1,start,duration} | null`.
- `bookState.ts`: `reduceBook(state, command, count): BookState`; commands `step`, `drag-start`, `drag`, `release`, `seek`, `complete`, `settle`; `sampleBookTurn(turn, now): {progress,done}`. Step/release commands carry monotonic `at`; completion carries transaction `id`.
- `bookState.ts`: direction is `'next' | 'prev'`; `step` carries `{direction,at}`, `drag-start` carries `{direction}`, `drag` carries `{progress}`, `release` carries `{commit,at}`, `seek` carries `{index}`, `complete` carries `{id}`, and `settle` has no payload. `drag-start` allocates the transaction id; `seek` is immediate after settling.
- `access.ts`: `canShowChapter(unlocked, chapter): boolean`; `resolveRitual(unlocked, open, phase): RitualPhase | null`.
- `experience.svelte.ts`: `BirthdayExperience` instance with reactive `book`, `zoom`, `loupe`, `videoPlaying`, `greetingOpen`, `phase`, `blow`, `replay`, `worldStatus`; dispatches the pure book reducer. Created per root, never global.
- `assets.ts`, `resources.ts`, `engine.ts`, `layout.ts`, `cameraRig.ts`, `pageCurl.ts`, `scenes/{table,opening,photos,book,wishes,ritual}.ts`: scoped graphics responsibilities, no DOM-copy observers.

Create `BirthdayWorld.svelte` as lifecycle host and `WorldBookControls.svelte` for native book controls/video. Modify the existing root, hero, greeting, candle/finale views, and their styles. Keep `MemoryBook.svelte` as fallback until parity is proven.

Tests: `scripts/check-world.mjs --case state|assets|projection|curl`; `scripts/check-world-browser.py --case engine|photos|book|ritual|page|fallback|production`. Add `tests/fixtures/world-harness.html`, `.ts`, and `WorldHarness.svelte` for isolated browser checks; fixtures are outside public/build inputs and never become a product route. Capture review screenshots only in Task 8.

Node checks follow the existing TypeScript-transpile/Node-assert pattern in `scripts/check-birthday-date.mjs`, testing the pure contracts/math without mounting Svelte. Use the installed Three.js STL parser for asset geometry. No new test-framework product dependency is needed.

## Task 1: Shared State and Access Contracts

**Files:** Create `world/types.ts`, `world/access.ts`, `world/bookState.ts`, `world/experience.svelte.ts`, `scripts/check-world.mjs`; modify `package.json` for `test:world`.

**Interfaces:** Produces the types/reducer/access methods above. Svelte state contains serializable experience values; engine animation uses `performance.now()`, calendar continues to use `Date.now()`.

- [ ] Record the current dirty-file list. Checkpoint only the known prior Kage/FS-seal changes in a local commit; preserve all other user changes and do not reset the workspace. Read the approved spec and current `date.ts`.
- [ ] Write failing Node assertions: `canShowChapter(false,'gallery') === false`, `canShowChapter(false,'teaser') === true`, `resolveRitual(false,true,'letter') === null`; sample a next turn at 280 ms, complete its id, and assert index 1/turn null. Rapid next/next must end at 2; prev from 0 wraps to 9; a cancelled drag retains its source; stale completion ids are ignored.
- [ ] Run `rtk proxy node scripts/check-world.mjs --case state`; expect failure before the modules exist. Implement the contracts/reducer and `BirthdayExperience` wrapper. `settle` uses the pending target, or the drag threshold 0.42, without replaying callbacks.
- [ ] Rerun state assertions and existing `rtk proxy npm.cmd run test:date`; expect all pass. Autofix the Svelte module and run Svelte diagnostics. Preserve preview/session keys; do not change the release constant.
- [ ] Commit only Task 1 files: `feat(world): add experience state contracts`.

## Task 2: Reproducible SolidCraft Models and Asset Ownership

**Files:** Create `scripts/solidcraft-gift-box.json`, `solidcraft-envelope.json`, `solidcraft-photo-frame.json`; model/source notes in `docs/reference/solidcraft/`; exported parts in `public/landing-pages/birthday-media/world/`; create `world/assets.ts`, `world/resources.ts`; extend `check-world.mjs` assets case.

**Interfaces:** `loadWorldAssets(resources, signal): Promise<WorldAssets>` returns named optional model parts; `WorldResources` owns geometry/material/texture, supports `loadTexture(url,signal)`, `loadGeometry(url,signal)`, and idempotent `dispose()`. Reuse the existing resource-owner disposal semantics and existing F/S STL.

- [ ] Add failing asset assertions for declared dimensions, separate moving parts, one mm→world conversion, abort cleanup, and missing optional models. Use STL parsing without a renderer for geometry bounds; run the assets case and confirm the missing-file failure.
- [ ] Model in mm/Z-up: gift box 140×110×70, wall 1.5, lid 4, two 12-wide/0.8-thick paper ribbon strips and two simple bow loops; envelope 160×112, paper 0.5 with separate back/pocket/flap/letter; photo frame outer 108×228, window 96×216, depth 3, stand base 70×50×4. Keep moving parts separate and record pivot transforms.
- [ ] Use SolidCraft CLI scripts, check closed solids/analytic volumes/bounds and one changed parameter, save `.sc`, export named STL parts. Use standard export quality; reuse seal at radius 12. Convert mm by 0.01 and Z-up to Y-up once in `assets.ts`; record part transforms in the manifest.
- [ ] Implement a five-second decorative deadline, optional mesh substitutes, and abort-safe late-result disposal. Rerun the assets case; inspect one combined CAD render and measure results. No new stock or generated photographic assets.
- [ ] Commit Task 2 files: `feat(world): add SolidCraft gift models`.

## Task 3: One Engine, Camera Fitting, and the Opening Table

**Files:** Create `world/engine.ts`, `world/layout.ts`, `world/cameraRig.ts`, `world/scenes/table.ts`, `world/scenes/opening.ts`, `BirthdayWorld.svelte`, browser-check script and the three fixture files; extend the projection Node case.

**Interfaces:** `createBirthdayWorld(canvas:HTMLCanvasElement, callbacks:WorldCallbacks, signal:AbortSignal): Promise<WorldDriver>`. `fitCameraToRect(corners, target:ScreenRect, layout:WorldLayout)` and `projectRect(corners,camera,layout):ScreenRect` are the geometry/HTML bridge. Scene builders return `{root, apply(snapshot,layout), dispose()}`; only cameraRig positions the camera.

- [ ] Add failing fixture checks: exactly one context; readable opening before models finish; failed optional model still reaches ready; `destroy()` twice is safe; late STL/texture completions dispose once; hidden/idle state produces no draws. Projection assertions cover 1440×900 and 390×844, with errors at most 2 CSS px.
- [ ] Run browser `--case engine` and Node `--case projection`; confirm failures. Build one renderer/resource owner, deferred initialization, a demand scheduler, and separate story/ritual roots. Render only the root in use; one scheduler runs all finite transitions.
- [ ] Build cream paper tabletop, CAD gift/frame/envelope, existing closed book/seal, and curved leaf meshes using existing textures. Fit the portrait to the measured native figure slot. Before unlock, only opening/teaser objects may appear; no hidden gift meshes/textures in active groups.
- [ ] Implement cached viewport/target measurements, mobile DPR/portrait layout, camera pose/quaternion interpolation, and hidden/context-loss cleanup. Measure stable semantic slots, not the projected overlays themselves, to avoid layout feedback. `onBookProjection` emits only changed rectangles. Rerun engine/projection checks and Svelte diagnostics/autofixer; expect pass with no extra contexts or delayed stale status callback after remount.
- [ ] Commit Task 3 files: `feat(world): render the 3D gift table`.

## Task 4: Continuous Photo, Book-Approach, and Wish Route

**Files:** Create `world/scenes/photos.ts`, `world/scenes/wishes.ts`; modify `world/cameraRig.ts`, `world/layout.ts`, `world/engine.ts`; reuse `cinema/paperGeometry.ts` and the watercolor cutouts; extend browser photos case.

**Interfaces:** `createPhotoScene(ctx):WorldPart` and `createWishScene(ctx):WorldPart`, consuming the shared builder context `{resources,assets,camera,callbacks}`. `resolveStoryPose(snapshot,layout)` reads chapter/progress and supplies camera pose; it does not mutate Svelte or scroll position.

- [ ] Write failing route checks: forward/reverse scroll, a direct gallery entry, tablet portrait resize, leaf bounds outside the reading area, and zero idle draws. Assert locked snapshots cannot activate photo/wish groups.
- [ ] Run `--case photos`; confirm failure. Arrange the opening table around world Z=12; photo route Z=0 through −20; reading book at Z=−26; wishes at Z=−36; closing at Z=−44. Reuse the current normalized photo camera/aim curves, connecting chapter endpoints without camera roll or jumps.
- [ ] Add the two story-photo scenes, physical photo edges, near-plane dissolves, and foreground leaves anchored beyond the frame. On phones, use earlier photo dissolve and smaller horizontal movement. Opening copy clears before the close portrait; final gallery copy returns beside its last photo.
- [ ] Add five cumulative wish states and a real Three.js star group. Closing uses the same book/prop assets in a quiet composition; leave native copy readable. Rerun photos checks, projection cases, and production compilation; no screenshots/polish loop yet.
- [ ] Commit Task 4 files: `feat(world): connect the 3D story route`.

## Task 5: Mesh Book, Native Video, Zoom, and Magnifier

**Files:** Create `world/scenes/book.ts`, `world/pageCurl.ts`, `WorldBookControls.svelte`, `styles/world-book.css`; modify `world/engine.ts`, `world/layout.ts`, `world/experience.svelte.ts`; extend curl/projection/browser book cases.

**Interfaces:** `createWorldBook(ctx)` returns the shared part contract plus page-corner access for projection. `WorldBookControls` consumes the experience instance, current spread/video rectangles, reduced/hidden flags, and callbacks for book commands/playback. Engine samples `sampleBookTurn` and reports `onBookTurnEnd(id)` exactly once; Svelte commits the matching transaction.

- [ ] Add failing curl/projection checks: flat t=0, correct side at t=1, shared hinge without gaps, and every note remains on its page texture. For a spread rect, native video rect uses fractions `{x:.584,y:.103,width:.3375,height:.794}`. Assert projected video bounds after zoom/resize differ by at most 2 CSS px.
- [ ] Run Node curl/projection and browser book cases; confirm failures. Build real cover/spine/page-stack meshes and a subdivided turning leaf. Use the existing 1760×1240 spread textures split at u=0.5. Lift the book from table pose to a stable face-on reading pose; stop automatic parallax there.
- [ ] Implement controls against the pure reducer: arrows/keyboard, horizontal drag, vertical pan, rapid clicks, cancellation, direct seek, .9–1.5 zoom, 2.3× loupe, and reset on video navigation. Offer native `baca catatan halaman ini` text so small-screen users can read the left note without relying on tiny texture text.
- [ ] Add lazy native video on the projected right-page rectangle, `playsinline`/controls, and a playback-generation guard. Test next/next→Kenangan 03 video, prev during pending play, seek to another video, hide, index jump, orientation while playing, and return from dialog. Only the selected request can change playback; all old audio stops.
- [ ] Rerun book/state/curl/projection checks and Svelte autofixer/diagnostics; expect correct state/focus/projection at all four viewports. Commit: `feat(world): add the interactive mesh book`.

## Task 6: 3D Envelope, Candle, and Seven-Photo Finale

**Files:** Create `world/scenes/ritual.ts`; modify `CelebrationDialog.svelte`, `BirthdayCandle.svelte`, `BirthdayFinale.svelte`, `world/experience.svelte.ts`, `world/engine.ts`, `styles/celebration.css`, `styles/ritual.css`; extend browser ritual case.

**Interfaces:** `createRitualScene(ctx):WorldPart` uses `snapshot.ritual`. Dialog owns native focus/audio and sends phase/state commands to the experience instance. Candle/finale views render controls/native labels in world mode and their existing static visuals in fallback; no local Three.js renderer in world mode.

- [ ] Write failing checks for open→close mid-flap, close while blowing, reopening after date rollover, hidden tab during entrance, replay, Escape, return focus, and zero AudioContext before the play button. Record page scroll before opening and assert it is unchanged after closing.
- [ ] Run `--case ritual`; confirm failures. Build CAD envelope with a real flap pivot, F/S seal, lifted letter, and finite opening. Transition into the local ritual root in 300–500 ms without flying across the long story route; save/restore the story pose on close.
- [ ] Extract the existing candle's geometry/material transforms and 850 ms extinguish/smoke sequence into the shared graph; its old camera writes must not enter the new builder. Move seven real photo planes into the heart arrangement on entry/replay; finish by two seconds. Native heading/signature keep the existing text/clip animation.
- [ ] Connect one persistent dialog/phase state, native focus trap/Escape, readable panel layout, music play/stop/volume, and cancellation tokens. Stop music on close, video, hidden tab, or ritual entry. Preserve the pending birthday-intro behavior and keep the letter usable if world assets are slow.
- [ ] Rerun ritual checks and Svelte diagnostics/autofixer; expect pass with no orphan callbacks, extra contexts, or automatic sound. Commit: `feat(world): add the 3D birthday ritual`.

## Task 7: Main-Page Migration and Complete Fallback

**Files:** Modify `BirthdaySketchbookView.svelte`, `BirthdayHero.svelte`, `BackgroundGarden.svelte`, `WishSky.svelte`, `CinematicScene.svelte`, `MemoryBook.svelte`, related styles; create `styles/world.css`; finalize `BirthdayWorld.svelte` and shared state bindings. Update `PRODUCT.md`, `DESIGN.md`, `README.md`.

**Interfaces:** Main page creates one experience instance and snapshot from authoritative date state, story anchors, UI state, and visibility. `BirthdayWorld` receives that snapshot/layout and reports callbacks. World-ready/native-fallback branches share the same book index and ritual phase.

- [ ] Add failing page/fallback tests for live midnight unlock while scrolled, hidden pending intro, November 8, January 1, isolated preview session, direct book/plate anchors, and native keyboard focus. Include reduced-motion changes, forced WebGL failure/context loss, optional asset timeout, and late completion after unmount.
- [ ] Run browser `--case page` and `--case fallback`; confirm failures against the unmigrated root. Mount the world host as main scene; retain Svelte copy/slots and only the permitted sections before release. Replace overlapping photo DOM visuals only when world is ready, preserving descriptions and native anchors.
- [ ] Connect the mesh book/control layer and dialog. Layer the world above fallback paper and below native copy; switch overlapping legacy photo/background surfaces off only when ready, and restore them on fallback. Do not mount old gallery/book/candle/leaf/star renderers in world mode. In fallback, use the existing media book and static ritual, preserving page/phase; settle a pending turn and pause video safely when mode changes.
- [ ] Handle resize/orientation, pageshow/pagehide, live reduced-motion changes, focus and scroll restoration. Interrupted instances cannot report into a newer engine. Rerun page/fallback cases and date tests; expect no second renderer, relock after release, hidden ghost content, or missed controls.
- [ ] Document the new architecture, CAD regeneration, fallback behavior, and measured bundles. Remove only runtime imports/files proven unused by both branches; retain reference artifacts. Commit: `feat(world): migrate the birthday experience`.

## Task 8: Combined Production Verification and Final Review

**Files:** Finalize `scripts/check-world-browser.py`, `scripts/check-world.mjs`, documentation, and implementation files only for material defects found in this pass.

**Interfaces:** Browser checks accept `--case production --screenshots`; include fixed calendar times, real pointer/keyboard actions, audio/video guards, WebGL draw/resource instrumentation, and the four required viewport sizes.

- [ ] Run one production build and the full Node/date/Svelte checks: `rtk npm run build`, `rtk proxy npm.cmd run test:world`, `rtk proxy npm.cmd run test:date`, and `rtk proxy npx.cmd --yes --package=svelte-check --package=typescript svelte-check --tsconfig ./tsconfig.json`. Expect passing checks and no Svelte warnings; retain/report any meaningful bundle advisory.
- [ ] Run one combined browser round: `rtk proxy python scripts/check-world-browser.py --case production --screenshots`. Inspect all main chapters and ritual phases on desktop/tablet/phones together. Check contrast, face cropping, fit, actual photo visibility, paper/letter legibility, controls, focal motion, one context, idle/hidden draws, and the triangle/draw-call budget. Label any unavailable physical-device verification honestly.
- [ ] Fix the material findings in one batch; simplify decoration if rendering budgets are exceeded. Rebuild/retest only affected checks, then at most one combined visual confirmation. Do not enter a cosmetic edit loop after confirmation passes.
- [ ] Obtain one fresh whole-change review against this plan/spec, focused on untested state transitions, calendar guards, video races, projection/focus, and resource cleanup. Address material findings and run the checks they affect; no additional visual-polish cycle.
- [ ] Record measured output, run `rtk proxy git diff --check`, and commit the verified implementation/docs with explicit file lists. Report the local preview and limitations. Push/publish only when the user requests it.

## Plan Self-Review

- Spec coverage: scene/story scope → Tasks 2–4; real mesh book and native media → Task 5; letter/candle/finale/music → Task 6; calendar/session/native fallback/one context → Tasks 1, 3, 7; performance/accessibility/bounded visual QA → Tasks 3–8.
- Interfaces: common signatures and snapshot keys are declared above; scene builders do not own separate cameras/renderers. Book completion ids and playback-generation guards are distinct.
- Review Focus: each of the five conditions is pinned to named checks in its owning task. No new fixture is part of the public product build.
- Execution review remains required before Task 1. The user's inline method is preserved; this document does not itself approve implementation.
