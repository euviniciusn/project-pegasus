BEGIN;

-- ── ENUMs ──
CREATE TYPE job_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE file_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE image_format AS ENUM ('png', 'jpg', 'webp');

-- ── Jobs ──
CREATE TABLE jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token   VARCHAR(64)  NOT NULL,
    status          job_status   NOT NULL DEFAULT 'pending',
    output_format   image_format NOT NULL,
    quality         SMALLINT     NOT NULL DEFAULT 82
                    CHECK (quality BETWEEN 1 AND 100),
    total_files     SMALLINT     NOT NULL DEFAULT 0,
    completed_files SMALLINT     NOT NULL DEFAULT 0,
    failed_files    SMALLINT     NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    expires_at      TIMESTAMPTZ  NOT NULL
);

CREATE INDEX idx_jobs_session_token ON jobs (session_token);
CREATE INDEX idx_jobs_status        ON jobs (status);
CREATE INDEX idx_jobs_expires_at    ON jobs (expires_at);

COMMIT;
