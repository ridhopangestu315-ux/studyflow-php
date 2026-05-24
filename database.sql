-- StudyFlow - PHP Native + MySQL
-- Database: todo_app

CREATE DATABASE IF NOT EXISTS todo_app
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE todo_app;

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) DEFAULT NULL,
    theme ENUM('light','dark') NOT NULL DEFAULT 'light',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subjects (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    name VARCHAR(120) NOT NULL,
    color VARCHAR(20) NOT NULL DEFAULT '#4f46e5',
    icon VARCHAR(20) NOT NULL DEFAULT 'book',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_subject_per_user (user_id, name),
    KEY idx_subjects_user_id (user_id),
    CONSTRAINT fk_subjects_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tasks (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    subject_id INT UNSIGNED DEFAULT NULL,
    title VARCHAR(180) NOT NULL,
    subject_name VARCHAR(120) NOT NULL,
    deadline DATE NOT NULL,
    priority ENUM('rendah','sedang','tinggi') NOT NULL DEFAULT 'sedang',
    category VARCHAR(60) NOT NULL DEFAULT 'tugas',
    is_done TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_tasks_user_id (user_id),
    KEY idx_tasks_subject_id (subject_id),
    KEY idx_tasks_deadline (deadline),
    KEY idx_tasks_is_done (is_done),
    CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_tasks_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS schedules (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    title VARCHAR(180) NOT NULL,
    schedule_date DATE NOT NULL,
    schedule_time TIME NOT NULL,
    category ENUM('kuliah','organisasi','ujian','pribadi','deadline') NOT NULL DEFAULT 'kuliah',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_schedules_user_id (user_id),
    KEY idx_schedules_date (schedule_date),
    CONSTRAINT fk_schedules_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
    KEY idx_notifications_is_read (is_read),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Akun demo opsional:
-- Email: demo@studyflow.test
-- Password: password
INSERT INTO users (name, email, password, theme)
VALUES ('Demo Student', 'demo@studyflow.test', '$2y$10$m126gMMEKHThfyzRLfkv5.LH7UOwR9YZKRK6U9BzN8lplqUYt3yEe', 'light')
ON DUPLICATE KEY UPDATE email = email;

INSERT IGNORE INTO subjects (user_id, name, color, icon)
SELECT id, 'Pemrograman Web', '#e11d48', 'code' FROM users WHERE email = 'demo@studyflow.test';

INSERT IGNORE INTO subjects (user_id, name, color, icon)
SELECT id, 'Jaringan Komputer', '#0891b2', 'network' FROM users WHERE email = 'demo@studyflow.test';
