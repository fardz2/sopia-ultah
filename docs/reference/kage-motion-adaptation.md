# Kage motion reference and F/S seal

This is a motion adaptation within the existing Svelte birthday site. Personal media, cream/earth palette, book, letter, birthday release, and permanent keepsake access remain the product's own content.

## Reference

- Canonical URL: https://threeui.com/landing-pages/kage.html
- Registered bundle: https://threeui.com/source-code/kage-landing-page.json
- Retrieved on 3 November 2026.
- The bundle identifies its canonical source as 243,963 bytes, SHA-256 `c8e06b90397ac246baf0ab6f32f5f6b570acc6fe03c7009f711b579fb72d9f49`.
- The public HTML response retrieved here was 246,682 bytes, SHA-256 `da0df3a0f9245e369d1c25e452fbc959aaaee21cb98b08115027c4a040c9531c`, and includes an additional storage-image helper. These are distinct source artifacts; no byte-identical integration is claimed.

The reference contributes separate camera/aim curves with tall-frame fitting, foreground cutouts that dissolve before crossing the camera, and the physical idea of a photograph carried on bending paper. The implementation uses the existing Three.js renderer and native Svelte components. It does not load the upstream temple, fonts, navigation, cloth runtime, image assets, or React wrapper.

The paper centre stays flat; only exposed edges bend. The camera travels directly with native scroll. No new idle loop, scroll replacement, postprocessing, or runtime dependency was introduced. A smaller mobile route and early near-photo dissolve protect the next portrait. Static gallery/native book fallbacks remain available.

## SolidCraft asset

- Editable model: `solidcraft/fs-seal.sc`.
- Reproducible commands: `../../scripts/solidcraft-fs-seal.json`.
- Web mesh: `../../public/landing-pages/birthday-media/fs-seal.stl`.
- Units: mm; centred on X/Y, Z up.
- Radius: 12; height: 1.4; outer chamfer: 0.25.
- Recess radius: 10.4; recess depth: 0.35; letter relief: 0.28.
- Letter polygon areas: 13.09, 8.8 and 18.59 mm².
- Expected volumes after chamfer / recess / monogram: 631.00525 / 512.07712 / 523.41152 mm³.
- Measured: 630.96858 / 512.04922 / 523.38362 mm³, within 0.006% of the analytic values. Final body is closed with 35 faces and a 24 × 24 × 1.4 mm bounding box.
- Changing radius to 14 in an isolated probe produced 705.64000 mm³ versus 705.67992 mm³ expected; the default saved asset remains radius 12.
- Binary STL: 1,762 triangles, 88,184 bytes. It is loaded only with the deferred book scene. Vertex ink on the raised letters preserves contrast at small sizes.

Regenerate from the project root:

```sh
solidcraft-cli run scripts/solidcraft-fs-seal.json --save docs/reference/solidcraft/fs-seal.sc --out public/landing-pages/birthday-media/fs-seal.stl
```

The mesh follows the cover hinge. Failed mesh loading leaves the printed F/S monogram, and unavailable WebGL uses the static HTML cover. Before the release, the cover stays closed at progress zero; after 7 November 2026, the gift remains unlocked.
