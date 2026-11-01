# Edisi Ulang Tahun ThreeUI Sketchbook

## Intent

Complete the existing birthday website in the Svelte 5/Vite app by using the exact Meng To sketchbook source as its visual and interaction foundation. The birthday edition is the only user-facing view and uses Indonesian birthday copy. The original ThreeUI document remains an internal source for its artwork and interactions, with no original-page mode or link exposed in the site.

No recipient name, personal photos, or personal story were provided. The birthday copy will use the general greeting “Untukmu” and generic wishes.

## Current state

- `src/App.svelte` already passes the requested font and typography props to the Svelte `MengToSketchbookLandingPage` wrapper.
- `src/lib/MengToSketchbookLandingPage.svelte` currently makes birthday mode the default and exposes a switch to a canonical view; the switch and view branch will be removed.
- Birthday mode imports `src/lib/BirthdaySketchbookView.svelte`, which is missing and causes Vite's unresolved-import error.
- The registered ThreeUI source bundle was fetched from its canonical URL. All six registered source files, the canonical HTML document, and all 16 local binary assets match the SHA-256 values in the supplied instructions.
- The project is not currently a Git repository.

## Design

Add the missing `BirthdaySketchbookView.svelte` as a thin birthday-mode wrapper around the existing `LandingPageFrame.svelte`. It loads the unchanged `/landing-pages/meng-to-sketchbook.html` source URL, receives the existing typography customization, and passes a birthday-copy callback through the frame's existing `applyScene` hook.

The callback changes visible copy inside the same-origin iframe: the document language/title, masthead, navigation labels, hero kicker, about text, section labels, footer, page hint, and control labels. It removes the source portfolio's placeholder social links from the rendered birthday view. It maps the original nine page titles and locations to nine generic birthday wishes. A `MutationObserver` on the generated index, captions, and page controls reapplies those mapped labels when the original script rebuilds them during page turns. The source's authored HTML file, CSS, JavaScript, page-turn effect, magnifier, zoom, responsive rules, and relative asset paths remain intact. The wrapper renders only the birthday edition; it does not offer a canonical mode or source link.

The page-frame loading state remains in use. If the canonical HTML request fails, the birthday view shows a concise Indonesian error and a retry button. It does not replace the verified source with an approximation or expose the original page as an alternate view.

## Verification

After implementation, run the Vite production build and open the app in a browser. Verify the birthday copy and all nine labels, confirm the UI does not expose an original-page mode, turn pages, drag the magnifier, and use zoom controls. Do not add a test suite for this change.

## Scope

This change does not replace the Singapore illustrations with personal photos, add external runtime dependencies, edit registered ThreeUI source files, or alter the canonical HTML or asset bytes. The original HTML remains available as an internal local source file because the birthday view uses it to preserve ThreeUI behavior.
