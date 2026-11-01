# Svelte Native Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the approved birthday site a native Svelte 5 application with zero iframes and preserved behavior.

**Architecture:** Svelte components own the DOM and reactive state. Typed helpers own date calculations, WebGL rendering and Web Audio scheduling. Component lifecycle controls subscriptions, observers, animation frames and audio resources.

**Tech Stack:** Existing Svelte 5, TypeScript and Vite; no React or new runtime dependency.

**Spec:** `docs/superpowers/specs/2026-10-30-svelte-native-design.md`

- [x] Extract typed media/date data and local styles; preserve source artwork and legacy reference.
- [x] Implement native animated text, hero, scroll state, watercolor background and star field components.
- [x] Implement native media book controls, spreads, curved page animation, drag, magnifier and lazy video.
- [x] Implement native countdown/day state and birthday dialog, petals and gesture-started music.
- [x] Switch App to native rendering; remove frame/copy bridges and retire legacy served documents.
- [x] Run Svelte diagnostics/build and bounded desktop/mobile/native interaction regression checks. Update product/design records with final architecture.

November 1 follow-up: restored text entrances using Svelte transitions, shortened book turns, and moved supported-browser scroll animation to native CSS timelines. Cached geometry and scoped fallback variables avoid per-frame whole-page invalidation. Ambient drawing yields during scrolling and resumes after idle. Native/fallback resizing, reduced motion, playback races and vertical touch scrolling verified.
