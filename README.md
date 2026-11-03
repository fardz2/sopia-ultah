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

Jalankan `npm run test:date` untuk mengecek batas tengah malam WIB, preview, dan akses kenangan setelah pergantian tahun.

## Fitur

- Countdown tahunan menuju 7 November pukul 00.00 WIB.
- Sebelum 7 November 2026 pukul 00.00 WIB: portrait, pesan penantian, countdown, dan buku tertutup. Galeri, isi buku, surat, doa, lilin, dan penutup belum ditampilkan.
- Saat waktu tersebut tiba, hadiah terbuka tanpa perlu memuat ulang. Amplop muncul otomatis sekali per sesi pada hari ulang tahun; musik tetap melalui tombol putar.
- Sesudah hari H hadiah tetap terbuka sebagai kenangan, termasuk setelah berganti tahun. Surat dan perayaan bisa dibuka ulang dari hero.
- Galeri foto 3D, buku yang terbuka mengikuti scroll, dan buku Svelte dengan tujuh foto serta tiga video.
- Kamera melewati foto di sepanjang kurva, tepi foto melengkung seperti kertas, dan daun lama membingkai gerakan dari sudut layar.
- Segel F/S dari SolidCraft pada sampul. Model CAD, script pembuat, dan catatan sumber tersedia dalam `docs/reference/solidcraft/`, `scripts/solidcraft-fs-seal.json`, dan `docs/reference/kage-motion-adaptation.md`.
- Zoom, kaca pembesar, navigasi sentuh/keyboard, dan video yang baru dimuat ketika diputar.
- Amplop romantis, musik instrumental melalui tombol putar, lilin 3D interaktif, dan penutup tujuh foto berbentuk hati.
- Three.js dimuat mendekati adegannya. Mode kurangi gerakan dan fallback tanpa WebGL tetap menyediakan konten serta kontrol.

Untuk mencoba hari H sebelum tanggalnya, buka halaman dengan `?preview=birthday`. Setelah membaca surat, pilih **buat satu permohonan** untuk masuk ke lilin dan penutup foto. Preview memakai penanda sesi terpisah dari ulang tahun sebenarnya.

Tanggal rilis hadiah ditentukan oleh `GIFT_RELEASE_AT` dalam `src/lib/birthday/date.ts`, terpisah dari countdown tahunan. Penjadwalan mengikuti jam perangkat pengunjung. Ini pengaturan tampilan untuk kejutan; media dalam folder publik tetap dapat diakses langsung.

## Isi dan media

- Media asli: `public/`.
- Ucapan pada sepuluh halaman: `src/lib/birthday/memory-notes.json`.
- Perbarui tekstur halaman secara manual: `npm run book:notes`.
- Komponen dan pengontrol grafis: `src/lib/birthday/`.
- Catatan produk dan desain: `PRODUCT.md` dan `DESIGN.md`.
- Sumber ThreeUI asli disimpan sebagai referensi di `docs/reference/`.

Musik tidak diputar otomatis. Pemutar rekaman suara pribadi tidak ditambahkan.
