BEGIN;

CREATE TABLE analytics_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type      VARCHAR(32)   NOT NULL,
    input_format    image_format  NOT NULL,
    output_format   image_format  NOT NULL,
    input_size      INTEGER       NOT NULL,
    output_size     INTEGER       NOT NULL,
    savings_percent NUMERIC(5, 1) NOT NULL,
    duration_ms     INTEGER       NOT NULL,
    quality         SMALLINT      NOT NULL,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_events_created_at ON analytics_events (created_at);

COMMIT;
