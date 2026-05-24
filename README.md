# StudyFlow PHP Native

StudyFlow adalah aplikasi dashboard tugas mahasiswa berbasis PHP native + MySQL. UI utama tetap memakai desain, warna, layout, animasi, kalender, dan komponen yang sudah ada. Backend dirapikan agar cocok untuk shared hosting gratis seperti InfinityFree.

## Fitur

- Register, login, logout, session protection.
- Password disimpan dengan `password_hash()`.
- Data tugas, mata kuliah, dan jadwal dipisah per user.
- CRUD tugas: tambah, edit, hapus, status selesai/belum, deadline, prioritas.
- CRUD mata kuliah per akun.
- Kalender interaktif: klik tanggal untuk melihat/tambah agenda.
- Dashboard statistik tugas, deadline dekat, agenda hari ini.
- Prepared statement di semua endpoint database.

## Struktur Folder

```text
studyflow-php/
├── index.php
├── login.html
├── dashboard.php
├── .htaccess
├── config/
│   └── database.php
├── includes/
│   └── app.php
├── backend/
│   ├── login.php
│   ├── register.php
│   ├── logout.php
│   ├── ambil_todo.php
│   ├── tambah_todo.php
│   ├── update_todo.php
│   ├── hapus_todo.php
│   ├── ambil_mata_kuliah.php
│   ├── tambah_mata_kuliah.php
│   ├── hapus_mata_kuliah.php
│   ├── ambil_jadwal.php
│   ├── tambah_jadwal.php
│   └── hapus_jadwal.php
├── assets/
│   ├── css/home.css
│   ├── js/script.js
│   └── images/icon1.PNG
├── uploads/
└── database/
    └── studyflow.sql
```

## Install di InfinityFree

1. Buat akun dan hosting di InfinityFree.
2. Buka **File Manager** atau FTP.
3. Upload semua file project ke folder `htdocs`.
4. Buka **Control Panel > MySQL Databases**.
5. Buat database baru. Catat:
   - MySQL host
   - database name
   - username
   - password
6. Buka **phpMyAdmin** dari panel InfinityFree.
7. Pilih database yang baru dibuat.
8. Import file `database/studyflow.sql`.
9. Edit file `config/database.php`:

```php
return [
    'host' => 'sqlXXX.infinityfree.com',
    'username' => 'if0_XXXXXXX',
    'password' => 'password_database_kamu',
    'database' => 'if0_XXXXXXX_studyflow',
    'port' => 3306,
    'charset' => 'utf8mb4',
];
```

10. Buka domain kamu. `index.php` otomatis mengarahkan ke login atau dashboard.

## Cara Login Pertama Kali

Tidak ada akun default demi keamanan.

1. Buka halaman login.
2. Klik **Daftar di sini**.
3. Buat akun dengan nama, email, dan password.
4. Setelah register berhasil, login dengan email dan password tersebut.

Saat akun baru dibuat, daftar mata kuliah default otomatis dibuat untuk akun itu. User lain akan mendapat data sendiri dan tidak bisa melihat data akun lain.

## Install Lokal

1. Copy folder ke `C:\laragon\www\studyflow-php` atau `C:\xampp\htdocs\studyflow-php`.
2. Import `database.sql` lewat phpMyAdmin.
3. Edit `config/database.php` jika nama database atau password berbeda.
4. Buka `http://localhost/studyflow-php`.

## Catatan Hosting

- Tidak membutuhkan Node.js.
- Tidak membutuhkan Composer.
- Tidak membutuhkan command terminal di hosting.
- Upload file, import database, edit config, lalu jalan.
- Jika muncul pesan koneksi database gagal, cek kembali `config/database.php` dan pastikan tabel sudah diimport.
