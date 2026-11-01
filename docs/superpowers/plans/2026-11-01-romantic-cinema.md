# Romantic Cinema Implementation Plan

> **For agentic workers:** Use executing-plans inline, with one final whole-change review. Track steps with checkboxes.

**Goal:** Deliver the approved three treatments as a romantic birthday gift from Faridz to Sopia.

**Architecture:** One native Svelte cinematic section owns lazy loading, visibility, scroll progress and the book handoff snippet. A scoped Three.js engine coordinates separate book and gallery scene builders. Existing native book, date and greeting remain authoritative.

**Tech Stack:** Svelte 5, TypeScript, Vite, Three.js; existing local media.

**Spec:** `docs/superpowers/specs/2026-11-01-romantic-cinema-design.md`

## Global constraints

Keep cream/ink palette, actual seven photos and three lazy videos, annual 7 November 00:00 WIB, native Svelte UI, keyboard/touch functionality and reduced-motion fallback. Use Faridz as the boyfriend/sender; invent no personal history. Three.js loads near a scene and renders on demand.

## Review focus

- Rapid/reverse scrolling must not hide or strand the native book.
- Direct index links must land on the interactive book, not the closed cover.
- Import/texture failure or context loss must leave useful content and no leaked renderer.
- Greeting, hidden tab and book gestures must pause competing graphics.
- Reduced-motion changes and resize must preserve controls, focus and readable content.

## Tasks

- [x] 1. Add romantic copy and actual photo metadata in `media.ts`, `memory-notes.json`, hero, letter and page sections. Regenerate page textures. Check sender in hero, ten book notes and letter; preserve asset count/order.
- [x] 2. Add Three.js plus development types, and `cinema/types.ts`, `resources.ts`, `bookScene.ts`, `galleryScene.ts`, `engine.ts`. Scene factories return `update(progress, aspect)` and `dispose()`. Engine exposes `update(progress)`, `resize()`, `setPaused(boolean)`, `destroy()`. Check 3D meshes/textures actually render and GPU calls stop at idle/offscreen.
- [x] 3. Add `CinematicScene.svelte` and local cinema styles. Props: `mode`, `id`, `reduced`, `paused`, `onactive`, optional `Snippet<[boolean]>` children for interactive handoff. Integrate gallery and pinned book wrapper in native root. Update direct book navigation. Check forward/reverse handoff, index, keyboard, touch and fallback.
- [x] 4. Run bounded desktop/mobile browser inspection, forced WebGL/reduced-motion cases, Svelte diagnostics/autofixers and production build. Obtain one final fresh-context review, fix material findings and complete records.

No git repository is present; work in the existing authorized workspace without creating commits or deleting user files.
