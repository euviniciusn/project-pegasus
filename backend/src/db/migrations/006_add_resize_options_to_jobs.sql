BEGIN;

ALTER TABLE jobs ADD COLUMN resize_width SMALLINT NULL
  CHECK (resize_width IS NULL OR resize_width BETWEEN 1 AND 16383);

ALTER TABLE jobs ADD COLUMN resize_height SMALLINT NULL
  CHECK (resize_height IS NULL OR resize_height BETWEEN 1 AND 16383);

ALTER TABLE jobs ADD COLUMN resize_percent SMALLINT NULL
  CHECK (resize_percent IS NULL OR resize_percent BETWEEN 1 AND 100);

COMMIT;
