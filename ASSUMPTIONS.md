# Product Assumptions

## Transaction data

- Duplicate external transaction IDs are preserved because their other
  attributes can differ. PostgreSQL will use a separate internal primary key.
- Status values are trimmed and normalized to uppercase.
- Null and empty categories are displayed as `Uncategorized`.
- Negative amounts represent refunds or reversals.
- Mixed timestamps are converted to UTC.
- Date-only timestamps are interpreted as midnight UTC.
- The original `transactions.json` file remains unchanged.
