# Halaman Foto dan Video di Buku Ultah

## Intent

Masukkan tujuh foto dan tiga video yang ada di `public/` langsung ke buku 3D yang terlihat pada hero, bukan di galeri terpisah. Setelah implementasi awal, pengguna meminta isi dummy buku dihapus. Arahan terbaru ini menggantikan persetujuan awal 19 halaman: buku ulang tahun sekarang hanya berisi sepuluh kenangan pribadi.

## Aset yang tersedia

- Tujuh JPEG dari `WhatsApp Image 2026-10-29 ...` (enam potret dan satu lanskap).
- Tiga MP4 dari `WhatsApp Video 2026-10-29 ...`, berdurasi sekitar 50, 85, dan 103 detik.
- Ilustrasi contoh ThreeUI tidak lagi menjadi halaman isi pada buku ulang tahun. Aset dan sumber ThreeUI tetap disimpan utuh untuk menjaga source reference serta desain/interaksi buku.

Urutan sepuluh kenangan mengikuti waktu pada nama file; jika waktunya sama, urutkan berdasarkan nama file. Beri judul “Kenangan 01” sampai “Kenangan 10” sesuai urutan tersebut, dengan label jenis “Foto” atau “Video”. Tidak mengarang nama atau cerita untuk orang di media.

## Pendekatan

1. Menambahkan sepuluh halaman media di belakang ilustrasi contoh — desain awal yang kemudian diganti oleh instruksi terbaru.
2. **Arahan terbaru pengguna:** hapus sembilan spread ilustrasi contoh dari isi birthday book dan tampilkan hanya tujuh foto serta tiga video; pertahankan buku dan interaksi ThreeUI.
3. Membuat galeri terpisah — ditolak karena media harus berada di dalam buku.

## Desain

Setiap foto mendapat spread buku bernuansa kertas hangat dengan foto berbingkai, menggunakan rasio foto asli agar wajah dan isi foto tidak terpotong. Spread video memakai poster statis dan tombol putar. Saat tombol diketuk, halaman menampilkan pemutar video native dengan kontrol, `playsinline`, dan tanpa autoplay. MP4 memakai `preload="none"`; halaman awal tidak mengunduh video sampai pemutaran diminta. Keluar dari halaman video menghentikan pemutaran.

Sepuluh halaman kenangan mengisi buku, berurutan berdasarkan waktu pada nama file. Kenangan 01 menjadi halaman pertama; indeks, caption, hitungan halaman, dan navigasi melingkar pada halaman ke-10. Desain halaman buku, kontrol membalik, zoom, dan kaca pembesar ThreeUI tetap dipakai. Kaca pembesar disembunyikan hanya pada halaman video agar tidak menutupi kontrol pemutar.

Sumber ThreeUI yang telah diverifikasi dipertahankan byte-identik sebagai referensi lokal yang tidak disajikan sebagai halaman publik. Versi birthday khusus menjadi satu-satunya dokumen yang dimuat oleh halaman aplikasi dan memuat ekstensi data/render media. Tidak ada kontrol untuk membuka halaman asli. Aset gambar dan font ThreeUI yang sudah ada tetap berada di lokasi relatif yang diperlukan.

## Batasan dan error handling

- Tidak mengubah isi JPEG atau MP4 pengguna; hanya membuat poster video dan layout spread untuk presentasi.
- Tidak menambah dependency eksternal.
- Jika poster atau foto gagal dimuat, halaman tetap menampilkan spread kertas dengan label media.
- Jika MP4 gagal diputar, tampilkan pesan singkat berbahasa Indonesia dan pertahankan navigasi buku.
- Kontrol video tidak boleh mengambil alih navigasi page-turn selain saat pengguna memakai kontrol pemutar.
- Social links tetap dihapus dari DOM birthday view.

## Verifikasi

- Build produksi berhasil.
- Browser: 10 indeks/caption sinkron; kelilingi semua halaman dengan tombol dan page-turn; foto tidak terpotong; poster video tampil; setiap video mulai hanya setelah diketuk dan berhenti saat berpindah halaman.
- Browser mobile: navigasi halaman, frame foto, kontrol video, dan tidak ada video yang autoplay.
- Browser: tidak ada mode/link halaman asli atau social links, dan tidak ada error runtime.

## Batas lingkup

Perubahan hanya mencakup integrasi media pribadi ke buku ultah, penghapusan spread contoh dari `PAGES` birthday, turunan birthday dari sumber ThreeUI, dan verifikasi alur media. Tidak menghapus aset atau salinan sumber ThreeUI, menambah galeri terpisah, mengubah isi foto/video, atau menambahkan narasi personal yang belum diberikan pengguna.

Dokumen ini memperluas dan menggantikan bagian lingkup pada spec awal `2026-10-29-ultah-threeui-sketchbook-design.md` yang sebelumnya mengecualikan media pribadi.
