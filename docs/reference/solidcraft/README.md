# Aset 3D hadiah untuk Sopia

Tampilan dan transisi website kembali ke versi sebelum migrasi full 3D, sesuai arahan Faridz pada 3 November 2026. Buku interaktif Svelte, foto, video, transisi galeri, segel F/S, dan lilin memakai implementasi sebelumnya.

Pilihan yang dipakai adalah background meja hadiah krem, bukan seluruh pengalaman 3D. Kotak berpita, amplop F/S, dan daun mengisi tepi layar. Kamera background bergerak sedikit mengikuti scroll; buku, isi halaman, serta transisi galeri dan surat tetap memakai implementasi sebelumnya. Bingkai foto tambahan disimpan sebagai pustaka aset.

| Model | Ukuran CAD | Bagian STL |
| --- | --- | --- |
| Kotak hadiah | 140 × 110 × 70 mm; dinding 1,5 mm; tutup 4 mm | alas, tutup, dua pita, dua simpul |
| Amplop | 160 × 112 mm; kertas 0,5 mm | belakang, kantong, lipatan, surat |
| Bingkai foto | 108 × 228 × 3 mm; bukaan 96 × 216 mm | bingkai dan penyangga |

Sumber yang dapat diedit: `gift-box.sc`, `envelope.sc`, dan `photo-frame.sc` di folder ini. Ekspor web berada di `public/landing-pages/birthday-media/world/`. Segel F/S sebelumnya tetap berada di `public/landing-pages/birthday-media/fs-seal.stl`.

Untuk membuat ulang model dan ekspor dengan SolidCraft CLI terpasang:

```sh
python scripts/build-world-assets.py
```

Resep per model berada di `scripts/solidcraft-{gift-box,envelope,photo-frame}.json`. Hasil STL memakai mm dan sumbu Z ke atas. Simpan transformasi ini saat memasang aset ke komponen: skala `0.01`, rotasi X `-Math.PI / 2` untuk dunia dengan sumbu Y ke atas. Tutup dan pita bergerak bersama di atas Z = 70 mm; engsel lipatan amplop berada di `(0, 56, 1.7)` mm sepanjang sumbu X. Jangan menerapkan konversi koordinat dua kali.
