# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Product Purpose

Website ulang tahun pribadi untuk Sopia Nurfitria, dirayakan setiap 7 November. Sebelum hadiah dirilis, pengunjung melihat hitung mundur dan buku tertutup. Setelahnya, foto serta video dapat dijelajahi melalui buku interaktif.

Hadiah romantis dari Faridz, pacar Sopia. Hubungan dan nama pengirim diberikan langsung oleh pengguna pada 1 November 2026. Ucapan memakai suara Faridz, dengan tanda tangan yang jelas, tanpa mengarang riwayat hubungan atau tanggal khusus.

## Users

Sopia dan orang yang membagikan hadiah ulang tahun ini, melalui desktop atau ponsel.

## Capabilities and Constraints

- Hitung mundur tahunan menuju 7 November pukul 00.00 WIB.
- Hadiah pertama terbuka pada 7 November 2026 pukul 00.00 WIB. Sebelumnya hanya portrait, pesan penantian dari Faridz, countdown dan buku tertutup; galeri, surat, isi buku, doa, lilin dan finale belum dirender.
- Hadiah tetap terbuka setelah hari H dan pergantian tahun. Tombol surat dapat dipakai kapan saja setelah rilis; hanya pembukaan amplop otomatis yang khusus hari ulang tahun. Tanggal rilis hadiah terpisah dari countdown tahunan dan mengikuti jam perangkat.
- Pada hari ulang tahun, amplop pribadi muncul sekali per sesi/tahun. Ketukan membuka lipatan amplop lalu mengangkat surat dengan kelopak bunga. Musik instrumental memiliki tombol putar, volume dan berhenti sendiri.
- Saat hari H tiba, countdown terlipat, muncul ucapan khusus dan potret berwarna, lalu amplop terbuka setelah intro singkat. Tab tersembunyi menunda pembukaan dengan aman.
- Setelah surat, Sopia dapat membuat permohonan dan mengetuk lilin 3D sampai padam, lalu melihat tujuh foto membentuk hati dengan nama Faridz muncul seperti tinta. Kedua bagian opsional dan tetap bisa dipakai tanpa WebGL atau dengan gerakan dikurangi.
- Buku dengan 7 foto dan 3 video dari `public/`, tanpa halaman dummy.
- Sepuluh ucapan berbeda pada halaman kiri buku; teks ikut melengkung saat halaman dibalik dan dapat diperbesar dengan kaca pembesar.
- Pembuka singkat dengan nama turun per huruf dan potret tersingkap seperti menarik lembar kertas. Tidak menghalangi akses halaman.
- Galeri foto berlapis dalam ruang 3D dan buku Three.js yang terbuka mengikuti scroll, lalu menyatu dengan buku Svelte interaktif. Tombol langsung buka buku tersedia.
- Kamera mengikuti jalur di antara foto, dengan lengkungan di tepi kertas dan daun lama yang membingkai sudut layar. Jalur ponsel memakai gerak lebih kecil; mode kurangi gerakan memakai galeri statis.
- Segel F/S pada sampul dimodelkan melalui SolidCraft dan ikut bergerak bersama engsel. Buku tetap terbuka jika aset dekoratif ini gagal dimuat.
- Three.js dimuat mendekati bagian 3D dan berhenti render saat diam/offscreen. Tanpa WebGL2 atau dalam mode kurangi gerakan, galeri statis dan buku native tetap bisa dipakai.
- Rangkaian foto mengikuti scroll, dilanjutkan lima doa ulang tahun; mode kurangi gerakan menampilkan urutan statis.
- Video dimuat saat diputar; halaman asli dan tautan sosial sudah dihapus.
- Implementasi native Svelte 5/Vite: seluruh halaman, buku, countdown, dialog dan kontrol dirender oleh komponen `.svelte`.
- State aplikasi memakai rune Svelte 5. WebGL dan Web Audio memakai modul TypeScript dengan lifecycle komponen. Runtime iframe dan sumber React/TSX dikeluarkan dari proyek.

## Brand Commitments

Bahasa Indonesia; nama Sopia Nurfitria; warna krem, tinta cokelat, tekstur kertas dan buku yang ada dipertahankan. Referensi editorial baru digabungkan dengan situs lama, sesuai koreksi pengguna pada 30 Oktober 2026.

## Evidence on Hand

7 foto dan 3 video pengguna di `public/`; sumber ThreeUI dipertahankan sebagai arsip lokal. Faridz adalah pacar/pengirim hadiah. Tidak ada tahun lahir, umur, tanggal jadian atau riwayat hubungan yang diberikan.
