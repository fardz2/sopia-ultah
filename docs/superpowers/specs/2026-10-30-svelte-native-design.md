# Svelte 5 native migration

User intent: replace the current Svelte wrapper around an iframe with a native Svelte 5 page. Preserve the approved visual design and behavior, including warm paper, leaf rigs, cursor spotlight, letter clips, scroll stories, physical media book, annual WIB countdown, birthday greeting and optional music.

All active markup belongs to `.svelte` components. Application state uses `$state`, `$derived`, `$props` and bindings. There is no iframe, React/JSX/TSX, raw HTML injection, DOM-copy observer, or external self-bootstrapping scene script in the active path. Canvas/WebGL, media and Web Audio may use scoped TypeScript controllers with explicit lifecycle cleanup.

Split into page orchestration, hero, text reveal, background, book, star field and celebration components. Store the ten existing media entries in typed data. Native controls share the selected book index. All old fonts and image/video assets remain local. Preserve the canonical upstream source as reference, and retire the legacy served document only after native regression checks pass.

Verification covers zero iframes, Svelte diagnostics and production build, visual parity on desktop/mobile, all ten book pages, drag/keyboard/zoom/loupe/video, leaf and text motion, reduced motion, scroll progress, exact birthday rollover, greeting/music controls, keyboard focus and lifecycle cleanup.
