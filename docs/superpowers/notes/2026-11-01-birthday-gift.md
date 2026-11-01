# Birthday gift refinement

Approved in chat: preserve the cream watercolor world and native Svelte 5; add a short cinematic opening, ten distinct left-page notes and a tap-to-open birthday envelope. This is a bounded refinement of the existing hero, book and greeting.

## Delivered

- Local Svelte paper-curtain out-transition reveals the loaded portrait in 720ms, independent of the scroll timeline and cursor mask. Existing letter stagger remains visible. Reduced motion bypasses the curtain.
- Ten Indonesian notes share one JSON copy source with accessible media descriptions and the retained SVG page textures. Copy follows the physical page curl and magnifier. No personal history, age or relationship invented. Prebuild synchronizes textures; unchanged files are not rewritten.
- Native greeting dialog starts with a sealed paper envelope. Tap/Enter opens its flap and raises the card, then reveals the letter and finite petals. Music still requires its own play button. Focus moves to the letter; closing or interruption cancels pending work. Reduced motion reveals immediately.

## Verification

- Svelte diagnostics: zero errors/warnings. Autofixers: zero issues; remaining effect/binding suggestions apply to intentional native dialog, focus, graphics and audio integration.
- Production build passes. No new runtime dependencies, React/TSX, iframe or per-frame animation loop added.
- Browser checks at 1440×900, 390×844 and 320×568: visible curtain and letter stagger, ten accessible notes, envelope/letter composition, music opt-in, interruption cleanup, keyboard focus/Escape and reduced motion. Desktop/mobile screenshots reviewed in one batch.
- Mobile touch/calendar test: exact midnight opens the sealed envelope, tap reveals the letter, reload does not auto-open twice in the session, and November 8 closes the greeting and returns to the next annual countdown.
- All ten SVGs retain one embedded photo/poster and one synchronized note group. Re-running the note generator preserves identical hashes.
- Impeccable detector reports zero findings in changed native components/styles. No detector exceptions added.
