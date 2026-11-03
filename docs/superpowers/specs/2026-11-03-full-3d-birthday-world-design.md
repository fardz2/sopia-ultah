# Sopia — satu dunia hadiah 3D

Tanggal: 3 November 2026. Status: untuk ditinjau sebelum rencana implementasi.

## Tujuan dan keputusan

Pengguna memilih **seluruh pengalaman 3D**, dengan kamera menjelajahi semua adegan hadiah. Situs menjadi hadiah romantis dari Faridz untuk Sopia Nurfitria: sebuah meja hadiah yang mengantar pengunjung ke foto, buku, surat, doa, lilin, dan penutup tujuh foto berbentuk hati.

Foto dan video pribadi, palet krem/cokelat, tipografi yang ada, bahasa Indonesia, dan jadwal buka hadiah tetap menjadi dasar. Seluruh objek serta perpindahan adegan utama dirender dalam Three.js. Teks yang dibaca, tombol, fokus keyboard, dan kontrol media tetap native Svelte 5/HTML. Dengan demikian tampilan memiliki kedalaman 3D tanpa menjadikan tulisan atau kontrol sebagai gambar yang sulit digunakan.

Pekerjaan mencakup visual dunia, renderer bersama, aset SolidCraft, kamera, buku WebGL, dan penghubung interaksi Svelte. Tidak menambah backend, akun, tautan sosial, halaman dummy, atau rekaman suara. Nama dan hubungan pengirim tetap Faridz, pacar Sopia; tidak mengarang umur, tahun lahir, tanggal jadian, lokasi, atau riwayat hubungan.

## Dunia visual

- Permukaan kertas krem menggunakan tekstur lokal yang sudah ada; tinta cokelat dan aksen kuningan mengikuti palet situs.
- Meja hadiah berisi bingkai potret Sopia, kotak berpita, amplop dengan segel F/S, dan buku. Daun monstera/fern lama menjadi bidang bertekstur yang benar-benar melengkung dalam ruang 3D.
- Lampu lembut memperjelas tebal kertas, bevel bingkai, lipatan amplop, dan segel. Wajah dalam foto mempertahankan warna serta detail aslinya.
- Kamera bergerak di jalur terarah saat scroll. Tidak memakai orbit bebas, pointer lock, pengambilalihan wheel/touch, putaran layar, atau input sensor perangkat.
- Susunan ponsel mengutamakan objek utama di tengah, gerak lateral kecil, dan bidang teks yang lapang. Objek dekoratif tidak menutupi wajah, tulisan, atau tombol.

Kamera melewati satu rangkaian objek yang terasa berhubungan. Setiap bagian tidak mengulang animasi masuk yang sama. Gerak kecil mendukung satu perjalanan; tidak menambah efek berkelap-kelip di setiap sudut.

## Alur pengunjung

| Bagian | Adegan 3D | Konten dan tindakan |
| --- | --- | --- |
| Pembuka | Potret dalam bingkai di meja hadiah; buku dan kotak tertutup | Nama Sopia, countdown/pesan hari H, pengirim Faridz. Susunan tetap terbaca sejak pemuatan awal. |
| Cerita foto | Foto utama terangkat dari meja, diikuti potret alam; kamera bergerak di antara lapisan daun | Teks cerita yang sudah ada tetap memakai animasi huruf turun dengan clip. |
| Galeri | Kamera melewati foto-foto pada lembar kertas melengkung | Aset foto yang sudah ada; teks penutup muncul saat foto terakhir mendapat fokus. |
| Buku | Kamera mendekati buku, sampul bersegel F/S membuka, lalu berhenti pada sudut baca | Sepuluh bentangan: tujuh foto dan tiga video, dengan deskripsi kiri yang sudah ada. Navigasi, zoom, dan kaca pembesar tersedia. |
| Lima doa | Gugus titik dan lembar doa dalam ruang yang sama menyala sesuai progres | Seluruh lima doa dari Faridz tetap hadir sebagai teks native. |
| Catatan dan daftar isi | Kamera kembali tenang pada meja/buku terbuka | Catatan pribadi, daftar sepuluh kenangan, dan tautan kembali ke halaman buku yang dipilih. |
| Surat | Amplop 3D, segel, dan lembar surat yang terangkat | Amplop dibuka lewat tombol; surat lengkap, tanda tangan Faridz, musik opt-in, dan tindakan ritual tetap tersedia. |
| Permohonan | Kamera berfokus pada lilin 3D | Tombol tiup, api mengecil, asap terbatas, pesan doa, dan lanjut ke penutup. |
| Penutup | Tujuh foto asli berkumpul pada kedalaman berbeda membentuk hati | Dedikasi dan tanda tangan Faridz, ulangi animasi, kembali ke surat, atau buka buku. |

Surat, lilin, dan penutup merupakan interlude di renderer yang sama. Saat dibuka dari posisi scroll mana pun, dunia beralih dengan transisi singkat ke komposisi lokal. Kamera tidak terbang cepat melintasi seluruh jalur untuk mencapai amplop. Menutup interlude mengembalikan adegan dan posisi baca sebelumnya tanpa lompatan scroll.

## Aturan tanggal

Sumber kebenaran tetap `birthday/date.ts`, terpisah dari state kamera.

1. Sebelum **7 November 2026, 00.00 WIB**: hanya pembuka, potret, countdown, pesan penantian, dan hadiah tertutup. Galeri lengkap, isi buku, surat, doa, lilin ritual, serta penutup belum dirender atau dapat diaktifkan. Objek dekoratif bukan jalan pintas untuk membukanya.
2. Pada batas waktu tersebut: hadiah terbuka tanpa reload. Intro singkat dan amplop otomatis tetap sekali per sesi/tahun; pembukaan surat membutuhkan tindakan pengunjung. Tab tersembunyi menunda intro.
3. Mulai 8 November: hadiah tetap terbuka, termasuk setelah berganti tahun. Pesan penantian tidak kembali. Countdown tahunan dapat tetap berjalan; surat dan ritual dibuka manual.
4. Pergantian hari tidak menutup surat yang sedang dibaca. Menutup dan membukanya kembali tidak mengulang intro otomatis.
5. `?preview=birthday` tetap menjadi simulasi terpisah dengan label dan penanda sesi sendiri. Simulasi tidak menandai ulang tahun sebenarnya sebagai sudah dilihat.

Penjadwalan tetap mengikuti jam perangkat pengunjung dalam zona Asia/Jakarta. Ini pengaturan presentasi untuk kejutan, bukan proteksi terhadap akses langsung ke media publik.

## Satu renderer, state native

`BirthdayWorld.svelte` memiliki satu canvas dekoratif dan lifecycle engine. Satu `WebGLRenderer`, satu kamera aktif, dan satu pemilik resource melayani dunia cerita serta interlude. Scene graph dibagi menjadi kelompok cerita dan ritual; hanya kelompok yang sedang dipakai yang terlihat. Elemen canvas tidak mengambil alih fokus atau menggantikan kontrol native.

State per halaman dibagi jelas:

- **Kalender/sesi:** waktu, preview, unlocked, intro yang sudah dilihat; mempertahankan aturan saat ini.
- **Pengalaman:** bagian aktif, progres scroll, indeks buku, turn yang sedang berjalan, zoom, kaca pembesar, status video, fase surat, status lilin, dan replay penutup.
- **Grafis:** kamera, mesh, material, texture, readiness, dan status pemuatan. Objek Three.js tidak masuk proxy reaktif Svelte.

State pengalaman dimiliki instance root, bukan singleton global. Kontrol Svelte mengirim perintah; engine melaporkan kesiapan, hasil turn, dan batas layar objek yang diperlukan. Fallback memakai state yang sama sehingga kegagalan grafis tidak mengembalikan pengunjung ke halaman buku pertama atau amplop tertutup.

Scroll memakai tinggi bagian dan anchor native. Ukuran serta anchor di-cache, diukur ulang saat resize, orientasi berubah, font siap, atau konten bertambah. Jalur kamera memakai kurva posisi dan target pandang terpisah. Kamera menyesuaikan frustum dengan aspek layar, bukan sekadar memotong komposisi desktop.

Galeri, buku, dan lilin tidak lagi membuat renderer sendiri dalam mode dunia penuh. Rig daun raw WebGL dan canvas bintang lama tidak dipasang bersamaan dengan world. Implementasi HTML/CSS lama tetap menjadi dasar fallback, dengan pengayaan WebGL-nya dinonaktifkan saat world gagal.

## Buku dan video

- Bentangan menggunakan texture SVG dan catatan dari `memory-notes.json` yang sudah ada. Nomor, urutan, dan deskripsinya dipertahankan.
- Sampul, ketebalan halaman, dan lembar yang dibalik berupa mesh Three.js. Geometri turn menggunakan prinsip lengkung buku saat ini, dengan turn sekitar 280 ms dan pembatalan drag sekitar 180 ms.
- Tombol sebelumnya/berikutnya, keyboard, dan gesture horizontal memberi hasil yang sama. Gesture vertikal tetap menggulir halaman. Tindakan berulang menyelesaikan turn sebelumnya dengan konsisten.
- Setelah kamera masuk sudut baca, bidang halaman dibuat tegak lurus pandangan dan berhenti pada komposisi yang stabil. Gerak kamera/parallax otomatis berhenti saat membaca atau memutar video. Zoom dan kaca pembesar dibatasi pada fase ini; kaca pembesar mengikuti UV bentangan aktif dan berhenti saat drag turn/video berlangsung.
- Video tetap elemen HTML dengan kontrol native, `playsinline`, dan pemuatan setelah tombol putar diketuk. Pada sudut baca yang stabil, elemen dipasang pada batas proyeksi halaman kanan; tidak membutuhkan render ulang WebGL untuk setiap frame video.
- Membalik halaman, meninggalkan bagian buku, membuka surat, atau menyembunyikan tab menghentikan video. Error play lama tidak boleh mengubah halaman yang baru dipilih.
- Daftar isi dan tindakan dari surat mencari bagian buku yang benar dan memindahkan fokus ke kontrol buku setelah perjalanan selesai.

## Surat, musik, dan penutup

Dialog native mempertahankan judul, Escape, focus containment, tombol tutup, dan pengembalian fokus. Canvas dunia dapat terlihat melalui backdrop yang ringan; panel teks tetap memiliki kontras dan ukuran baca yang jelas. Fallback memakai kertas HTML yang utuh, sehingga surat tidak menunggu aset 3D.

Kotak hadiah, amplop, segel, dan lembar surat memiliki bagian mesh yang dapat digerakkan terpisah. Membuka surat menuntun pandangan dari segel ke lembar, lalu berhenti saat orang membaca. Intro tidak diputar ulang hanya karena model selesai dimuat. Menutup di tengah animasi membatalkan frame, callback, dan timer yang tertunda.

Musik kotak musik yang sudah ada tetap dimulai melalui tombol putar, dengan volume dan berhenti. Musik berhenti saat surat ditutup, ritual dimulai, video diputar, atau tab tersembunyi. Tidak ada audio otomatis atau pemutar rekaman suara.

Lilin mempertahankan aksi tiup sekitar 850 ms dan pesan doa saat padam. Setelahnya, tujuh foto asli membentuk hati dalam ruang 3D; keseluruhan kedatangan foto dan tanda tangan selesai sekitar dua detik. Replay eksplisit tersedia. State padam tetap konsisten jika mode grafis berubah saat ritual berlangsung.

## Aset SolidCraft

Gunakan SolidCraft CLI untuk pembuatan headless yang tidak mengubah dokumen terbuka pengguna. Setiap aset memiliki script parameter, model `.sc`, dan mesh web yang dapat diregenerasi. Bagian bergerak diekspor terpisah dengan pivot/transform yang tercatat.

| Aset | Bagian yang dimodelkan | Pemakaian |
| --- | --- | --- |
| Kotak hadiah | Dasar, tutup, dua pita, dan simpul sederhana | Meja pembuka dan momen hadiah terbuka. |
| Amplop | Punggung, kantong depan, flap atas, dan lembar surat | Interlude surat dengan engsel flap yang nyata. |
| Bingkai foto | Bingkai tipis dan penyangga | Potret pembuka di meja. |
| Segel F/S | Model yang sudah dibuat | Sampul buku dan amplop. |

Buku, lembar foto, lilin, gugus bintang, dan deformasi daun memakai geometri Three.js yang cocok untuk animasi; tidak perlu memaksa semua bentuk dinamis menjadi CAD. Foto/video, tekstur kertas, dan cutout daun tetap memakai file lokal pengguna. Tidak mengimpor aset kuil Kage atau stock photo baru.

SolidCraft memakai mm/Z-up, sedangkan world memakai unit bersama/Y-up. Loader mengubah sumbu dan skala sekali, bukan membalik objek secara ad hoc di tiap adegan. Volume, bounding box, status solid, dan satu variasi parameter diverifikasi sebelum ekspor. Aset dekoratif yang gagal dimuat memakai bentuk pengganti sederhana atau dihilangkan tanpa menahan isi hadiah.

## Anggaran gerak dan perangkat

- Renderer berjalan saat scroll, resize, perubahan state yang tampak, parallax desktop yang belum selesai, turn buku, atau animasi ritual terbatas. Tidak ada loop GPU tanpa akhir saat halaman diam atau tersembunyi.
- Scroll mengikuti posisi input langsung; tidak menambahkan lerp panjang yang terasa terlambat. Target kontrol biasa 100–300 ms; perpindahan komposisi 300–500 ms. Ponsel memakai jarak/rotasi lebih kecil.
- DPR dibatasi sekitar 1.35 desktop dan 1 ponsel. Target awal maksimal 80 ribu segitiga yang terlihat, 60 draw calls desktop/40 ponsel, dan maksimal dua texture foto beresolusi tinggi yang dominan pada satu saat.
- Geometri dan texture dipakai ulang; foto jauh dapat memakai resolusi lebih kecil. Muat model dekoratif dan texture bab berikutnya secara bertahap. MP4 tidak dipreload.
- Three.js tetap chunk deferred, dimulai setelah konten pembuka mendapat kesempatan tampil. Aset dekoratif yang belum siap dalam lima detik memakai bentuk pengganti dan tidak menahan isi hadiah. Gagal import atau context loss langsung menyediakan tampilan HTML/CSS; tidak menghasilkan layar kosong.
- Tanpa postprocessing berat, shadow map dinamis, atau penambahan runtime framework. Kedalaman datang dari mesh, susunan kamera, material, dan cahaya yang terarah.

Anggaran di atas adalah batas desain yang diukur pada implementasi; kualitas dekorasi dikurangi jika budget terlampaui. Isi hadiah dan keterbacaan didahulukan.

## Fallback dan aksesibilitas

`prefers-reduced-motion`, tidak adanya WebGL2, atau context loss menampilkan pengalaman HTML/CSS lengkap dengan foto, buku, surat, video, dan ritual statis yang tetap berfungsi. Mengurangi gerakan tidak menghapus isi atau tombol.

Fallback mempertahankan indeks buku dan fase surat/ritual. Video dihentikan aman jika mode grafis berubah dan dapat diputar lagi pada halaman yang sama. Tidak mencoba membuat renderer lain terus-menerus setelah kegagalan. Semua resource, observer, timer, listener, requestAnimationFrame, dan hasil pemuatan yang terlambat dibersihkan melalui lifecycle/AbortSignal.

Semua gambar bermakna tetap mempunyai deskripsi native. Teks utama memakai elemen heading/paragraf Svelte yang nyata; penggandaan visual untuk texture tidak membacakan teks dua kali. Fokus selalu terlihat, target sentuh nyaman, dan kontras teks minimal 4.5:1 untuk isi/3:1 untuk teks besar.

## Susunan modul yang dituju

- `BirthdaySketchbookView.svelte`: kalender, anchor, dan orkestrasi pengalaman.
- `birthday/BirthdayWorld.svelte`: canvas tunggal, lifecycle, dan sinkronisasi state.
- `birthday/world/`: engine, state/types, resource owner, camera rig, layout, asset loader, dan pembangun kelompok adegan.
- Komponen Svelte pembuka, kontrol buku, dialog, dan penutup: teks, kontrol native, fallback, serta fokus.
- `media.ts`, `memory-notes.json`, dan `date.ts`: tetap sumber kebenaran konten dan kalender.
- `scripts/solidcraft-*.json`, `docs/reference/solidcraft/`, dan folder media publik: sumber dan ekspor model.

Renderer terpisah yang sudah tidak dipakai dapat dikeluarkan setelah jalur dunia/fallback lengkap. Tidak menyisipkan React/TSX, iframe, atau salinan HTML yang berjalan sendiri.

## Kriteria penerimaan

1. Pembuka, cerita foto, galeri, buku, doa, surat, lilin, penutup, dan latar catatan memiliki visual 3D dalam world yang sama. Hanya satu context renderer utama aktif.
2. Sebelum waktu rilis, tidak ada isi hadiah yang dapat dibuka lewat objek, anchor, keyboard, atau state kamera. Batas tengah malam membuka hadiah tanpa reload; setelah hari H dan pergantian tahun, pesan penantian tidak kembali.
3. Semua tujuh foto dan tiga video tetap tersedia pada urutan bukunya, dengan deskripsi kiri. Turn, pembatalan drag, klik cepat, navigasi keyboard, zoom, kaca pembesar, dan daftar isi berfungsi.
4. Amplop sekali per sesi, surat, musik opt-in, tutup di tengah animasi, tiup lilin, replay penutup, dan tindakan kembali ke buku bekerja pada semua fase tanggal yang sesuai.
5. Uji browser dengan 1440×900, 768×1024, 390×844, dan 320×568: tidak ada overflow horizontal, teks tertutup dekorasi, tombol di luar jangkauan, atau wajah terpotong oleh layout. Uji perangkat fisik jika tersedia; laporan membedakan emulasi viewport dari pengujian perangkat nyata.
6. Mode kurangi gerakan, WebGL tidak tersedia, kehilangan context, kegagalan model dekoratif, dan tab tersembunyi tetap memberi konten serta kontrol yang bisa digunakan.
7. Rendering berhenti saat diam/tersembunyi; resource lepas saat unmount. Progres scroll dapat dijalankan maju-mundur dan resize/orientasi tidak mengubah state buku atau membuka ulang surat.
8. Build produksi, pemeriksaan Svelte 5, tes tanggal yang sudah ada, dan pemeriksaan interaksi/performa yang relevan lolos. Verifikasi visual dilakukan pada desktop dan ponsel dalam satu putaran gabungan, satu batch perbaikan, dan paling banyak satu putaran konfirmasi.

## Urutan pelaksanaan setelah persetujuan

Rencana implementasi ditulis setelah spesifikasi ini disetujui. Rencana membagi pekerjaan menjadi aset CAD; engine dan pembuka; perjalanan cerita/galeri; buku dan media; surat/ritual/penutup; lalu fallback, aksesibilitas, dan verifikasi. Hasil akhir menggantikan jalur utama situs, dengan fallback yang berfungsi, bukan halaman demo tambahan.
