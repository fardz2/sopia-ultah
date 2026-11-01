# Romantic cinema for Sopia, from Faridz

The user explicitly requested implementation of all three proposed treatments: Three.js book, depth gallery and cinematic transitions. They supplied the relationship: Faridz is Sopia's boyfriend. This authorizes warm first-person romantic copy and a Faridz signature, without inventing an anniversary, shared events, age or future promises presented as facts.

Preserve native Svelte 5, the existing cream/ink watercolor palette, animated leaves, annual November 7 WIB countdown, ten-page physical media book, seven photos/three lazy videos, loupe, zoom, touch/keyboard controls and birthday envelope/music. Add no React or iframe.

## Experience

1. Opening dedication identifies this as a gift from Faridz. Existing name clip and paper photo reveal stay.
2. A pinned depth gallery uses actual personal photographs on paper-backed planes. Scrolling moves the camera through a restrained composition while a short romantic dedication transitions from anticipation to intimacy. Native fallback photographs and all copy remain accessible.
3. A real Three.js book arrives closed at an angle, settles toward a front-facing view and opens its hinged cover. At the end it crossfades into the existing native interactive book in the same pinned area. Controls become active only after handoff. Direct index/letter links jump to that interactive phase.
4. Existing full-photo/iris transitions remain part of the narrative. No scroll interception or smooth-scroll replacement. Stage distances shorten on phones.
5. All ten notes, five wishes and the birthday letter use Faridz's voice; final signature explicitly says Faridz. Music remains opt-in and no video autoplays.

## Rendering and resilience

Three.js is dynamically imported near a scene, not in the initial application bundle. The Svelte component owns its canvas, headings, captions, controls and lifecycle. Typed scene controllers own only graphics. Render on demand after scroll, resize or texture readiness; no idle 3D loop, shadows/postprocessing or unbounded particles. Cap pixel density at 1.35 desktop / 1 phone. Pause graphics and background work when hidden, the greeting is open, the native book turns, or a relevant scene is offscreen.

Missing WebGL2, texture failure, rejected import and context loss preserve a readable static gallery/native book. Reduced motion skips the 3D choreography and shows the native book immediately. Dispose renderers, geometries, materials, textures, observers and pending work on teardown, including late texture loads.

## Verification

Check actual scene pixels at closed/mid/open phases, depth-camera movement, correct native handoff, reverse scrolling, direct index navigation, keyboard/touch controls, video/loupe/zoom, romantic copy/signature, envelope/music, reduced motion and forced WebGL failure. Inspect desktop and mobile together, make one batched correction and confirm. Run Svelte diagnostics/autofixers, production build, source audit and final fresh-context whole-change review.
