# NQ Code — Android Source Editor 1.0.0-alpha.1

Aplikasi editor kode Android asli (native WebView shell + HTML/CSS/JavaScript UI) dengan antarmuka ala VS Code. Tampilan dirancang untuk **layar sentuh maupun tablet**, **offline**, dan **tanpa akun**.

**Status: kandidat alpha untuk pengujian, bukan rilis stabil atau salinan lengkap VS Code.**

## Fitur yang sudah diimplementasikan

- Explorer folder dan subfolder; pilih folder menggunakan pemilih folder Android.
- Buka, baca, edit, dan simpan file teks dari penyimpanan dengan Android **Storage Access Framework (SAF)**.
- Buat file/folder dalam folder yang dipilih; ganti nama dan hapus file melalui menu Explorer dengan konfirmasi.
- Simpan Sebagai (Save As), beberapa tab, indikator perubahan belum disimpan (termasuk perubahan yang terjadi saat penulisan asynchronous); pertahankan BOM UTF-8 dan akhiran baris CRLF ketika menyimpan.
- Syntax highlighting ringan: Kotlin, Java, JavaScript, TypeScript, Python, Rust, HTML, CSS, JSON, dan lain-lain (token sederhana, bukan parser lengkap).
- Nomor baris, posisi kursor, font monospace, simbol cepat untuk keyboard sentuh.
- Cari, cari berikutnya, ganti semua, command palette (Ctrl+P), pintasan Ctrl+S/O/F/N.
- Tema terang/gelap, ukuran font, pilihan word wrap.
- Mode **demo browser** yang langsung dapat dibuka dari `app/src/main/assets/index.html` tanpa menginstal APK (file demo disimpan di localStorage/browser, bukan folder Android).
- Dukungan penggunaan tanpa internet; tidak memerlukan permission `MANAGE_EXTERNAL_STORAGE` atau `INTERNET`.

### Batasan versi MVP

Ini **editor kode**, bukan salinan lengkap VS Code. Belum ada terminal, compiler Android bawaan, debugging, Git engine, plugin/extension marketplace, Language Server Protocol (LSP), IntelliSense, atau editor untuk file biner. Ukuran file maksimal **2 MiB**, dan harus berupa UTF-8 valid. Highlight bersifat heuristik, bukan parser tingkat IDE. Saat word wrap aktif, gutter line number bisa tidak sejajar untuk baris yang terbungkus. Penyimpanan otomatis belum tersedia; tekan tombol Save.

## Push perubahan alpha melalui Git lokal

Setelah ZIP diekstrak, jalankan `bash push-alpha.sh` dari folder proyek. Skrip menggunakan Git/`gh` yang sudah diautentikasi untuk meng-clone `main`, membuat branch `release/1.0.0-alpha.1`, menyalin perubahan alpha, menghapus workflow lama `android.yml`, commit, lalu `git push` tanpa `--force`. **`main` tidak berubah** sampai perubahan di-merge. CI debug akan berjalan saat branch `release/**` dipush.

## Cara mendapatkan APK tanpa PC (GitHub Actions)

1. Unggah seluruh isi folder proyek ini ke sebuah repository GitHub milik Anda, termasuk folder tersembunyi `.github`.
2. Buka tab **Actions** di repository, kemudian pilih workflow **NQ Code Android CI** dan **Run workflow**.
3. Setelah job selesai sukses, buka halaman run dan unduh artifact **NQ-Code-1.0.0-alpha.1-debug-APK**.
4. Ekstrak ZIP artifact dan instal `app-debug.apk` pada Android. Jangan gunakan APK dari pihak tak dikenal.

Workflow di `.github/workflows/android-apk.yml` menyiapkan Java 17, Android SDK 36, Gradle 9.5, membangun APK debug, lalu mengunggah hasilnya. **Repo versi 0.1.0 telah berhasil membangun APK debug di GitHub Actions**; perubahan alpha ini masih perlu CI dan uji perangkat sebelum didistribusikan.

## Rilis alpha bertanda tangan

Rilis publik membutuhkan **APK release bertanda tangan**, bukan sekadar APK debug. Workflow `NQ Code Signed Alpha` sudah disiapkan, tetapi membutuhkan secret signing yang hanya boleh diatur oleh pemilik repository. Petunjuk detail dan pengujian: [docs/RELEASE.md](docs/RELEASE.md), [docs/QA.md](docs/QA.md). APK release tidak boleh diklaim siap sebelum CI, pengujian perangkat, dan penandatanganan lolos.

## Cara build di PC

1. Install Android Studio terbaru dengan Android SDK Platform API 36, SDK Build Tools 36, JDK 17 dan Gradle 9.5.
2. Buka folder root `NQ-Code-Android` di Android Studio.
3. Sinkronkan Gradle. Jika Android Studio mengeluhkan wrapper JAR tidak tersedia, jalankan `gradle wrapper --gradle-version 9.5.0` dengan Gradle terpasang terlebih dahulu, kemudian sinkronkan ulang.
4. Jalankan `gradle :app:assembleDebug` dari terminal proyek (atau menu **Build APK(s)** di Android Studio).
5. APK berada di `app/build/outputs/apk/debug/app-debug.apk`.

Catatan: Folder `gradle/wrapper/` menyediakan konfigurasi distribusi Gradle, namun tidak menyertakan `gradle-wrapper.jar` dan skrip `gradlew` standar. Workflow GitHub Actions tidak memerlukan kedua berkas itu.

## Preview di Android tanpa APK

Salin folder `app/src/main/assets/` (berisi `index.html`, `style.css`, `app.js`) ke ponsel, lalu buka `index.html` di browser yang mengizinkan file lokal. Bisa juga menjalankan server HTTP lokal di laptop/Termux:

```bash
cd app/src/main/assets
python3 -m http.server 8080
```

Lalu akses `http://localhost:8080` dari browser pada perangkat yang sama. **Mode preview browser** hanya mendukung file contoh dan impor/unduh, bukan izin folder Android seperti di aplikasi native.

## Struktur proyek

```text
NQ-Code-Android/
  .github/workflows/android-apk.yml     # Otomatis menghasilkan debug APK
  app/build.gradle.kts
  app/src/main/AndroidManifest.xml
  app/src/main/java/dev/nolqu/nqcode/MainActivity.java  # Native SAF bridge
  app/src/main/assets/index.html        # Interface
  app/src/main/assets/style.css         # Tema dan layout adaptif
  app/src/main/assets/app.js            # Editor + file manager
  app/src/main/res/drawable/ic_launcher.xml
  build.gradle.kts
  settings.gradle.kts
  gradle.properties
  gradle/wrapper/gradle-wrapper.properties
```

## Keamanan dan privasi

- Semua data diproses lokal; aplikasi tidak meminta izin internet.
- Akses file diberikan melalui pemilih file/folder Android; tidak memakai izin akses semua file.
- WebView hanya boleh memuat asset aplikasi (`file:///android_asset/`).
- JavaScript bridge tersedia hanya untuk UI lokal, bukan halaman web pihak ketiga.
- Unsaved tabs (hingga batas snapshot) disimpan sebagai localStorage WebView; jangan simpan kredensial/rahasia di demo tanpa memperhitungkan penyimpanan perangkat.

## Rencana lanjutan

Editor berbasis LSP (autocomplete/refactoring), workspace search, integrated terminal yang sesuai kebijakan sandbox Android, akses Git, sistem tema/plugin, editor berbasis CodeMirror, dan integrasi build Android.

License: MIT, lihat `LICENSE`.
