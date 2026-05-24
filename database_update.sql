-- Migration dari versi lama (users/todos/mata_kuliah/jadwal) ke versi production.
-- Untuk instalasi baru, cukup import database/studyflow.sql.

RENAME TABLE mata_kuliah TO subjects;
RENAME TABLE todos TO tasks;
RENAME TABLE jadwal TO schedules;

ALTER TABLE users
  CHANGE nama_lengkap name VARCHAR(120) NOT NULL,
  ADD COLUMN avatar VARCHAR(255) DEFAULT NULL AFTER password,
  ADD COLUMN theme ENUM('light','dark') NOT NULL DEFAULT 'light' AFTER avatar,
  CHANGE dibuat_pada created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHANGE diupdate_pada updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE subjects
  CHANGE nama name VARCHAR(120) NOT NULL,
  ADD COLUMN color VARCHAR(20) NOT NULL DEFAULT '#4f46e5' AFTER name,
  ADD COLUMN icon VARCHAR(20) NOT NULL DEFAULT 'book' AFTER color,
  CHANGE dibuat_pada created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE tasks
  CHANGE nama_tugas title VARCHAR(180) NOT NULL,
  CHANGE mata_kuliah subject_name VARCHAR(120) NOT NULL,
  CHANGE prioritas priority ENUM('rendah','sedang','tinggi') NOT NULL DEFAULT 'sedang',
  CHANGE sudah_selesai is_done TINYINT(1) NOT NULL DEFAULT 0,
  CHANGE dibuat_pada created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHANGE diupdate_pada updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN subject_id INT UNSIGNED DEFAULT NULL AFTER user_id,
  ADD COLUMN category VARCHAR(60) NOT NULL DEFAULT 'tugas' AFTER priority;

ALTER TABLE schedules
  CHANGE judul title VARCHAR(180) NOT NULL,
  CHANGE tanggal schedule_date DATE NOT NULL,
  CHANGE jam schedule_time TIME NOT NULL,
  CHANGE kategori category ENUM('kuliah','organisasi','ujian','pribadi','deadline') NOT NULL DEFAULT 'kuliah',
  CHANGE dibuat_pada created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHANGE diupdate_pada updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS notifications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    task_id INT UNSIGNED DEFAULT NULL,
    title VARCHAR(180) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('deadline','reminder','system') NOT NULL DEFAULT 'deadline',
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_notifications_user_id (user_id),
    KEY idx_notifications_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
