# Technical Decisions

## Data normalization during seeding

Normalization happens in the backend seed process instead of rewriting the
source JSON. This keeps the supplied dataset unchanged while ensuring that the
database contains consistent values.

## Duplicate transaction IDs

The source transaction ID is not used as the database primary key because the
dataset contains duplicate IDs with different transaction details. An internal
database-generated key will identify each row, while the original ID remains
available for display and searching.

## Timestamp storage

All supported timestamp formats are converted to UTC and stored using
PostgreSQL `TIMESTAMPTZ`.
