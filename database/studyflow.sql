-- StudyFlow PHP Native - MySQL schema
-- Import file ini melalui phpMyAdmin.

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(190) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nama_lengkap VARCHAR(120) NOT NULL,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diupdate_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS mata_kuliah (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    nama VARCHAR(120) NOT NULL,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_mk_per_user (user_id, nama),
    KEY idx_mk_user_id (user_id),
    CONSTRAINT fk_mk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS todos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    nama_tugas VARCHAR(180) NOT NULL,
    mata_kuliah VARCHAR(120) NOT NULL,
    deadline DATE NOT NULL,
    prioritas ENUM('rendah','sedang','tinggi') NOT NULL DEFAULT 'sedang',
    sudah_selesai TINYINT(1) NOT NULL DEFAULT 0,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diupdate_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_todos_user_id (user_id),
    KEY idx_todos_deadline (deadline),
    KEY idx_todos_status (sudah_selesai),
    CONSTRAINT fk_todos_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS jadwal (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    judul VARCHAR(180) NOT NULL,
    tanggal DATE NOT NULL,
    jam TIME NOT NULL,
    kategori ENUM('kuliah','organisasi','ujian','pribadi','deadline') NOT NULL DEFAULT 'kuliah',
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diupdate_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_jadwal_user_id (user_id),
    KEY idx_jadwal_tanggal (tanggal),
    CONSTRAINT fk_jadwal_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
