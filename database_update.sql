-- Migration untuk project StudyFlow lama.
-- Jalankan hanya jika database lama sudah punya tabel users/todos/mata_kuliah/jadwal.

ALTER TABLE todos
  ADD COLUMN prioritas ENUM('rendah','sedang','tinggi') NOT NULL DEFAULT 'sedang'
  AFTER deadline;

ALTER TABLE todos
  ADD COLUMN diupdate_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  AFTER dibuat_pada;

ALTER TABLE jadwal
  ADD COLUMN diupdate_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  AFTER dibuat_pada;
