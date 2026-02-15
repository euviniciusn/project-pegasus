BEGIN;

ALTER TABLE job_files ADD COLUMN output_mime VARCHAR(64);
ALTER TABLE job_files ADD COLUMN savings_percent NUMERIC(5, 2);
ALTER TABLE job_files ADD COLUMN warnings TEXT[] DEFAULT '{}';

COMMIT;
