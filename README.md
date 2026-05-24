# StudyFlow - PHP Native + MySQL

Aplikasi manajemen tugas mahasiswa yang ringan, modern, responsive, dan siap upload ke InfinityFree. UI tetap mengikuti konsep desain referensi: clean dashboard, card modern, kalender interaktif, dark/light mode, toast, modal, dan empty state.

## Struktur Project

```text
studyflow-php/
├── index.php
├── login.html
├── dashboard.php
├── .htaccess
├── assets/
│   ├── css/home.css
│   ├── js/script.js
│   └── images/
├── auth/
│   ├── login.php
│   ├── register.php
│   ├── logout.php
│   ├── change_password.php
│   └── profile.php
├── backend/
│   ├── ambil_todo.php
│   ├── tambah_todo.php
│   ├── update_todo.php
│   ├── hapus_todo.php
│   ├── ambil_mata_kuliah.php
│   ├── tambah_mata_kuliah.php
│   ├── update_mata_kuliah.php
│   ├── hapus_mata_kuliah.php
│   ├── ambil_jadwal.php
│   ├── tambah_jadwal.php
│   └── hapus_jadwal.php
├── config/database.php
├── includes/app.php
├── database/studyflow.sql
├── pages/
└── uploads/
```

## Database

Nama database default: `todo_app`

Tabel:
- `users`
- `subjects`
- `tasks`
- `schedules`
- `notifications`

Semua query utama menggunakan prepared statement dan setiap data dibatasi berdasarkan `user_id`.

## Install di InfinityFree

1. Login ke InfinityFree.
2. Buat hosting dan buka **File Manager**.
3. Upload semua isi folder project ke `htdocs`.
4. Buka **MySQL Databases** dan buat database baru.
5. Catat host, username, password, dan nama database.
6. Buka phpMyAdmin dari panel InfinityFree.
7. Pilih database kamu.
8. Import file `database/studyflow.sql`.
9. Edit `config/database.php`:

```php
return [
    'host' => 'sqlXXX.infinityfree.com',
    'username' => 'if0_XXXXXXX',
    'password' => 'password_database_kamu',
    'database' => 'if0_XXXXXXX_todo_app',
    'port' => 3306,
    'charset' => 'utf8mb4',
];
```

10. Buka domain kamu. `index.php` otomatis mengarahkan ke login atau dashboard.

## Akun Demo

Jika memakai file SQL bawaan:

- Email: `demo@studyflow.test`
- Password: `password`

Kamu juga bisa langsung membuat akun baru lewat menu register. Akun baru otomatis mendapat daftar mata kuliah default.

## Fitur

- Register, login, logout, session protection.
- Ganti password.
- Edit nama profil.
- Upload dan hapus foto profil.
- Dark mode tersimpan ke akun.
- CRUD mata kuliah dengan warna dan icon.
- CRUD tugas dengan deadline, prioritas, status, filter, dan pencarian.
- Kalender interaktif dan agenda per tanggal.
- Dashboard statistik, progress produktivitas, deadline dekat, dan agenda hari ini.
- Toast, modal, loading-friendly fetch, empty state.

## Troubleshooting

**Blank page atau error 500**
- Pastikan `config/database.php` benar.
- Pastikan `database/studyflow.sql` sudah diimport.
- Cek file log sederhana di `uploads/php-error.log`.

**Login demo gagal**
- Pastikan import SQL selesai tanpa error.
- Jika tabel sudah ada sebelum import, hapus user demo lama atau buat akun baru dari register.

**Upload foto gagal**
- Pastikan folder `uploads/profile` ikut terupload.
- Ukuran file maksimal 2MB, format JPG/PNG.

**Asset CSS/JS tidak muncul**
- Pastikan semua folder `assets/`, `auth/`, `backend/`, `config/`, `includes/`, `database/`, dan `uploads/` berada langsung di dalam `htdocs`.

## Catatan

Project ini tidak membutuhkan Node.js, Composer, `npm start`, `artisan serve`, atau command terminal di hosting. Cukup upload file, import database, edit config, lalu jalan.
