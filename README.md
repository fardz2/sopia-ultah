# Untuk Sopia, dari Faridz

Website ulang tahun untuk Sopia Nurfitria, dari Faridz. Dibuat dengan Svelte 5, TypeScript, Vite, dan Three.js, memakai foto serta video pribadi dalam buku interaktif.

## Jalankan lokal

```sh
npm ci
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

Hasil build berada di `dist/`. Sinkronisasi catatan buku dijalankan otomatis sebelum build.

## Fitur

- Countdown tahunan menuju 7 November pukul 00.00 WIB.
- Galeri foto 3D, buku yang terbuka mengikuti scroll, dan buku Svelte dengan tujuh foto serta tiga video.
- Zoom, kaca pembesar, navigasi sentuh/keyboard, dan video yang baru dimuat ketika diputar.
- Amplop romantis, musik instrumental melalui tombol putar, lilin 3D interaktif, dan penutup tujuh foto berbentuk hati.
- Three.js dimuat mendekati adegannya. Mode kurangi gerakan dan fallback tanpa WebGL tetap menyediakan konten serta kontrol.

Untuk mencoba hari H sebelum tanggalnya, buka halaman dengan `?preview=birthday`. Setelah membaca surat, pilih **buat satu permohonan** untuk masuk ke lilin dan penutup foto. Preview memakai penanda sesi terpisah dari ulang tahun sebenarnya.

## Isi dan media

- Media asli: `public/`.
- Ucapan pada sepuluh halaman: `src/lib/birthday/memory-notes.json`.
- Perbarui tekstur halaman secara manual: `npm run book:notes`.
- Komponen dan pengontrol grafis: `src/lib/birthday/`.
- Catatan produk dan desain: `PRODUCT.md` dan `DESIGN.md`.
- Sumber ThreeUI asli disimpan sebagai referensi di `docs/reference/`.

Musik tidak diputar otomatis. Pemutar rekaman suara pribadi tidak ditambahkan.
