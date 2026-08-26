# Technical Decisions

This document records the technical decisions that materially affect the implementation.

## 1. Technology stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- TanStack Query
- Recharts

React with TypeScript provides type-safe component development. Vite was selected instead of Next.js because the application is a focused client-side dashboard and does not require server-side rendering.

### Backend

- Python
- FastAPI
- Psycopg
- Pydantic

FastAPI was selected for its request validation, type hints, automatic API documentation, and clear separation between routes, services, schemas, and data-access code.

### Database

- PostgreSQL 16 or newer

PostgreSQL is used because it is required by the assignment and provides reliable transactions, constraints, indexing, numeric types, and row-level locking for reward redemption.

## 2. Backend structure

The backend is divided into the following layers:

- API routes handle HTTP requests and responses.
- Pydantic schemas validate request and response data.
- Services contain application and business logic.
- Repositories contain database queries.
- Core modules contain configuration and reusable normalization logic.
- Database modules contain the schema and connection management.

This separation keeps HTTP handling, business rules, and SQL concerns from being combined in one file.

## 3. Source-data preservation

The supplied `transactions.json` file is treated as immutable input.

Normalization is performed during seeding instead of rewriting the source file. This preserves the provided dataset while ensuring that the application queries consistent database values.

## 4. Internal and external transaction IDs

The original transaction ID is stored as `transaction_id`, but it is not used as a unique database key.

PostgreSQL generates an internal `BIGSERIAL` primary key for every transaction row. This decision preserves all supplied records, including records that share an external ID but contain different transaction details.

The source row number is also stored to make imports traceable and repeatable.

## 5. Timestamp handling

Every supported timestamp format is converted to a timezone-aware Python `datetime` and then stored as PostgreSQL `TIMESTAMPTZ`.

All values are normalized to UTC to provide consistent filtering, sorting, grouping, and monthly analytics.

Slash-formatted timestamps use the day-first `DD/MM/YYYY HH:MM:SS` format. This prevents valid dates such as `21/08/2025` from being rejected and prevents ambiguous dates such as `05/08/2025` from being interpreted incorrectly.

## 6. Monetary storage

Transaction amounts and reward values use PostgreSQL `NUMERIC` columns instead of floating-point columns.

Python uses `Decimal` while normalizing monetary values. This avoids floating-point rounding errors in filters, analytics, and reward calculations.

## 7. Reward coin storage

Each transaction’s earned coins are calculated by a PostgreSQL generated column based on its status and amount.

This keeps the reward rule consistent even when transactions are queried outside the Python service.

The wallet stores the user’s current spendable balance separately because redemptions change the current balance without changing historical transaction earnings.

## 8. Reward redemption consistency

Reward redemption will execute inside a PostgreSQL transaction.

The backend will lock the user’s wallet row with `SELECT ... FOR UPDATE` before validating and subtracting coins. The balance update and redemption record will either both succeed or both roll back.

This prevents concurrent requests from spending the same coins and ensures the balance cannot become negative.

## 9. Transaction loading strategy

The application will use server-side pagination, filtering, searching, and sorting.

Although loading and virtualizing all 10,000 records in the browser is possible, server-side querying was selected because it:

- Reduces the initial payload.
- Scales beyond the supplied dataset.
- Keeps filtering and sorting consistent.
- Demonstrates backend and database fundamentals.
- Allows PostgreSQL indexes to support common queries.

The frontend will display a hand-built responsive table without using a table component library.

## 10. Search strategy

Merchant search will be debounced on the frontend to avoid sending a request after every immediate keystroke.

The backend will perform case-insensitive merchant matching. A functional index on `LOWER(merchant)` supports this query pattern.

For a much larger production dataset, PostgreSQL trigram search could be introduced, but it is unnecessary for the current scope.

## 11. Filtering and sorting

Transaction filters will be represented as URL query parameters so the backend remains the source of truth.

Supported filters include:

- Category
- Date range
- Amount range
- Payment status
- Merchant search

Supported sorting includes:

- Transaction date
- Transaction amount

Only approved sort fields and directions will be accepted by the backend. User-provided column names will not be inserted directly into SQL.

## 12. Spend analytics

Analytics will be calculated from successful transactions.

The first chart will show spending by category. Selecting a category in the chart will update the transaction table’s category filter.

A monthly spending trend may be added after the core requirements are complete.

Aggregation will be performed by PostgreSQL rather than repeatedly calculating totals from table rows in the browser.

## 13. Frontend state management

TanStack Query will manage server state, including:

- Transactions
- Coin balance
- Rewards catalogue
- Analytics
- Redemption requests

Local React state will manage temporary interface state, including:

- Open or closed modals
- Selected transaction
- Selected reward
- Unsubmitted filter controls

A separate global state-management library is unnecessary for the current application size.

## 14. Frontend component system

The frontend will include a small internal design system with reusable components such as:

- Button
- Card
- Badge
- Input
- Select
- Modal
- Skeleton
- Empty state
- Error state

Colours, typography, spacing, border radius, and shadows will be defined using shared design tokens.

The transaction table will be implemented without a component library, as required by the assignment.

## 15. Responsive table design

The desktop table will use a sticky header with clear hover and keyboard-focus states.

On narrow screens, lower-priority columns may be hidden or rearranged while important information remains accessible. Transaction details will remain available through the row detail view.

The layout will be tested down to a width of 360 pixels.

## 16. Seed strategy

The seed command creates the schema, clears existing demo data, normalizes the source transactions, inserts all valid transactions, creates the rewards catalogue, and creates the initial wallet.

The seed process is intentionally repeatable. Rerunning it returns the application to a predictable demo state.

Rejected rows are reported with their source row number, transaction ID, and rejection reason.

## 17. Error handling

The API will return meaningful HTTP status codes:

- `200` for successful reads and redemption
- `404` when a transaction or reward does not exist
- `409` when the wallet balance is insufficient
- `422` for invalid request data
- `500` for unexpected server errors

Expected business errors will have stable, user-friendly messages. Unexpected internal details will not be exposed to the frontend.

## 18. Deployment configuration

Frontend and backend configuration will be provided through environment variables.

Secrets and real connection strings will not be committed. An `.env.example` file documents the required configuration.

The README will include local setup instructions, the one-command seed process, deployed URLs or a demo-video link, and any unfinished functionality.
