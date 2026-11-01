# Birthday ritual refinement

Approved: implement all three proposed day-H enhancements. User then explicitly declined a voice message; no recording, placeholder or voice player is added.

Keep the current cream watercolor world, native Svelte UI, Three.js scenes, annual November 7 WIB timing, once-per-session greeting, optional music and ten-page book.

- Fold the waiting counter away, reveal "hari ini tentang kamu, sayang", return the portrait to color, then open the existing envelope after 1.1 seconds. Reduced motion opens immediately; hidden tabs retain a pending greeting safely.
- After reading the letter, an optional wish opens a real single 3D candle. Tap/keyboard extinguishes its flame and raises finite smoke. Completion displays the agreed birthday wish, then offers the photo finale. No microphone or typed private wish is requested. Missing WebGL/reduced motion keep the same native action usable.
- The finale assembles seven actual photos around a heart outline, then reveals Faridz's name like ink. It finishes in a few seconds, can replay, and has direct return-to-letter/book controls. All new sound remains opt-in through the existing music button; entering ritual views stops the previous music so no hidden player continues.

Verification: exact midnight and November 8 rollover, hidden/pending intro, previews, touch/keyboard, reduced motion, candle rendering/extinguish/fallback/cancellation, finite finale/replay, focus and original book/music controls. Batch desktop/mobile visual review, Svelte diagnostics/autofixers and production build.

## Completed and verified

- Native counter fold: 240ms; greeting letter stagger begins after 220ms; envelope queue: 1.1s. Reduced motion bypasses the queue. A pending greeting is retained across a hidden tab and cancelled when the date changes or the user opens it manually.
- Single Three.js candle shares the lazy engine/resource owner. Tap/Enter runs an 850ms extinguish and finite smoke sequence, followed by the promised wish. Renderer pauses at idle/offscreen/hidden and aborts on exit. Static fallback uses identical native controls.
- Finale uses all seven existing photos, a geometric heart outline and a simulated ink reveal of Faridz's name. Photo arrivals finish within 1.24s; signature within 1.95s. Replay affects only this small composition. Global Svelte in-transitions are intentional: a regression initially showed local transitions being skipped inside nested keyed/each blocks, and the browser test now proves animation on first open and replay.
- Entering candle/finale stops the previous music. Closing mid-animation cancels pending work; no sound starts automatically. No voice player or recording integration was added, per the user's correction.
- Passed browser tests at 1440×900, 390×844 and 320×568: exact midnight, delayed envelope, real 3D pixels, idle draw cessation, extinguish, completion focus, seven complete photos, replay, return to letter, direct native book handoff, music stop, interruption and November 8 rollover. Hidden-tab intro resumes; reduced-motion and missing-WebGL paths remain usable. No uncaught app errors.
- Desktop/mobile screenshot batch inspected; one layout correction keeps primary finale actions visible on a normal desktop viewport and clips scattered photos inside their composition. Production preview checks passed on desktop/mobile, including the deferred candle shader and native book link; temporary preview server stopped afterward.
- Final Svelte diagnostics: zero errors/warnings. All edited native components' autofixers report zero issues; DOM/graphics/dialog bridge suggestions are intentional. Design detector reports zero findings, with no new ignores.
- Build passes. App JS: 124.04 kB / 46.57 kB gzip; lazy engine: 547.54 kB / 138.20 kB gzip. The existing 500kB advisory for the deferred Three.js chunk remains visible; no threshold was raised and no runtime dependency was added.
