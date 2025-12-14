-- Add table for exam monitoring events
CREATE TABLE IF NOT EXISTS exam_monitorings (
  id VARCHAR(255) PRIMARY KEY,
  enrollment_id VARCHAR(255) NOT NULL,
  switch_tab_count INTEGER DEFAULT 0,
  fullscreen_exit_count INTEGER DEFAULT 0,
  metadata JSON DEFAULT NULL,
  exam_start_media_id VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_exam_monitorings_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
);

-- Optionally add foreign key to medias if you want DB-level enforcement
-- ALTER TABLE exam_monitorings
--   ADD CONSTRAINT fk_exam_monitorings_media FOREIGN KEY (exam_start_media_id) REFERENCES medias(id) ON DELETE SET NULL;
