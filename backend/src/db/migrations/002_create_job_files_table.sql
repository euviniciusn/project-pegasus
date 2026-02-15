BEGIN;

CREATE TABLE job_files (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id          UUID         NOT NULL REFERENCES jobs (id) ON DELETE CASCADE,
    original_name   VARCHAR(255) NOT NULL,
    original_key    VARCHAR(512) NOT NULL,
    original_size   INTEGER      NOT NULL,
    original_format image_format NOT NULL,
    converted_key   VARCHAR(512),
    converted_size  INTEGER,
    status          file_status  NOT NULL DEFAULT 'pending',
    error_message   TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_job_files_job_id  ON job_files (job_id);
CREATE INDEX idx_job_files_status  ON job_files (status);

COMMIT;
