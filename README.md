# Coinwise — Transactions, Analytics and Rewards Dashboard

Coinwise is a responsive financial dashboard for reviewing credit-card transactions, understanding spending patterns, earning reward coins, and redeeming them for vouchers and cashback.

The application processes a supplied dataset of 10,000 transactions containing duplicate IDs, mixed timestamp formats, inconsistent statuses, missing categories, and negative refund amounts.

## Live Application

- **Frontend:** https://coinwise-financial-dashboard.vercel.app
- **Backend API:** YOUR_RENDER_BACKEND_URL
- **API Documentation:** YOUR_RENDER_BACKEND_URL/docs
- **GitHub Repository:** https://github.com/rahulc34/coinwise-financial-dashboard

> The backend is hosted on Render. If the service is inactive, the first request may take a short time to complete.

## Features

### Transactions dashboard

- Server-side pagination across 10,000 transactions
- Debounced merchant-name search
- Combinable filters:
  - Category
  - Payment status
  - Date range
  - Amount range

- Sorting by transaction date and amount
- Configurable page size
- Sticky table header
- Loading, empty, updating, and error states
- Keyboard-accessible transaction rows
- Responsive layout down to 360px
- Detailed transaction modal with:
  - Focus trapping
  - Escape-to-close support
  - Outside-click dismissal
  - Focus restoration

### Spend analytics

- Spending breakdown by category
- Interactive Recharts donut chart
- Clicking a chart category filters the transaction table
- Selecting a category from the table filters highlights the corresponding chart category
- Real summary metrics:
  - Total successful spending
  - Total transactions
  - Payment success rate
  - Highest-spending category

### Rewards

- Always-visible reward coin balance
- Five seeded cashback and voucher rewards
- Select → confirm → redeem flow
- Optimistic balance update
- Automatic rollback and balance refetch when redemption fails
- Successful-redemption confirmation
- Unaffordable rewards remain visible but disabled
- Repeatable reward redemption

### Backend validation

- Unknown rewards return `404 Not Found`
- Unaffordable redemptions return `409 Conflict`
- Invalid request bodies return `422 Unprocessable Entity`
- Wallet updates and redemption records are created atomically
- PostgreSQL row locking prevents concurrent overspending
- Wallet balances cannot become negative

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- TanStack Query
- Recharts
- Lucide React
- Custom reusable UI components

### Backend

- Python
- FastAPI
- Pydantic
- Psycopg 3
- Psycopg connection pooling
- Uvicorn

### Database and deployment

- PostgreSQL
- Neon — hosted PostgreSQL
- Render — FastAPI deployment
- Vercel — Vite frontend deployment

## Architecture

```text
React + TypeScript frontend
          │
          │ HTTPS / JSON
          ▼
      FastAPI API
          │
          │ Psycopg connection pool
          ▼
     PostgreSQL database
```

The backend is separated into:

```text
API routes → Services → Repositories → PostgreSQL
```

- Routes handle HTTP requests and responses.
- Pydantic schemas validate request and response data.
- Services contain business rules.
- Repositories contain SQL and data-access logic.
- PostgreSQL constraints protect data integrity.

## Project Structure

```text
coinwise-financial-dashboard/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── scripts/
│   │   ├── inspect_data.py
│   │   └── seed.py
│   ├── tests/
│   └── requirements.txt
├── data/
│   └── transactions.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hook/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── .env.example
├── ASSUMPTIONS.md
├── DECISIONS.md
└── README.md
```

## Local Setup

### Prerequisites

Install:

- Python 3.13 or compatible version
- Node.js 20 or newer
- PostgreSQL 16 or newer
- Git

### 1. Clone the repository

```bash
git clone https://github.com/rahulc34/coinwise-financial-dashboard.git
cd coinwise-financial-dashboard
```

### 2. Create the PostgreSQL database

Using `psql`:

```sql
CREATE DATABASE coinwise;
```

### 3. Configure backend environment variables

Create `.env` in the repository root:

```env
APP_NAME=Coinwise API
APP_VERSION=1.0.0
ENVIRONMENT=development
DEBUG=false

DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/coinwise
DATABASE_POOL_MIN_SIZE=1
DATABASE_POOL_MAX_SIZE=10

FRONTEND_URL=http://localhost:5173
```

Replace `YOUR_PASSWORD` with your PostgreSQL password.

### 4. Install backend dependencies

#### Windows PowerShell

```powershell
python -m venv backend/venv
.\backend\venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
```

#### macOS or Linux

```bash
python3 -m venv backend/venv
source backend/venv/bin/activate
pip install -r backend/requirements.txt
```

### 5. Seed PostgreSQL

Run the one-command seed from the repository root:

```bash
python -m backend.scripts.seed
```

Expected output:

```text
=== DATABASE SEED COMPLETE ===
Source rows: 10000
Inserted transactions: 10000
Rejected rows: 0
Rewards inserted: 5
Initial coin balance: ...
```

The command:

1. Creates the PostgreSQL schema.
2. Normalizes the supplied transaction data.
3. Inserts all 10,000 transactions.
4. Creates the demo user and reward wallet.
5. Inserts five catalogue rewards.
6. Calculates the initial coin balance.

The seed is repeatable and resets existing demo data before insertion.

### 6. Start the backend

From the repository root:

```bash
uvicorn backend.app.main:app --reload
```

The API will be available at:

- http://127.0.0.1:8000
- http://127.0.0.1:8000/docs
- http://127.0.0.1:8000/api/health

### 7. Configure the frontend

Create `frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

### 8. Install and start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## API Endpoints

### Health

| Method | Endpoint      | Description                     |
| ------ | ------------- | ------------------------------- |
| `GET`  | `/api/health` | Check API and PostgreSQL health |

### Transactions

| Method | Endpoint                 | Description                |
| ------ | ------------------------ | -------------------------- |
| `GET`  | `/api/transactions`      | Paginated transaction list |
| `GET`  | `/api/transactions/meta` | Available filter metadata  |
| `GET`  | `/api/transactions/{id}` | Transaction details        |

Supported transaction parameters:

```text
page
page_size
search
category
status
date_from
date_to
amount_min
amount_max
sort_by
sort_order
```

Example:

```text
GET /api/transactions?page=1&page_size=50&search=airtel&status=SUCCESS&sort_by=amount&sort_order=desc
```

### Analytics

| Method | Endpoint                    | Description                  |
| ------ | --------------------------- | ---------------------------- |
| `GET`  | `/api/analytics/summary`    | Dashboard summary metrics    |
| `GET`  | `/api/analytics/categories` | Spending grouped by category |

### Rewards

| Method | Endpoint                 | Description              |
| ------ | ------------------------ | ------------------------ |
| `GET`  | `/api/rewards/balance`   | Current wallet balance   |
| `GET`  | `/api/rewards/catalogue` | Active reward catalogue  |
| `POST` | `/api/rewards/redeem`    | Redeem a selected reward |

Redemption request:

```json
{
  "reward_id": "REWARD_UUID"
}
```

## Data Normalization

The supplied transaction dataset contains intentionally inconsistent data.

The seed process handles:

- Duplicate external transaction IDs
- Lowercase and uppercase statuses
- Null and empty categories
- Negative refund amounts
- ISO timestamps ending in `Z`
- ISO timestamps containing timezone offsets
- Unix epoch milliseconds
- Date-only values
- Day-first timestamps using `DD/MM/YYYY HH:MM:SS`

Normalization occurs during import. The original JSON file remains unchanged.

### Duplicate IDs

The original transaction ID is preserved as `transaction_id`, but it is not used as the database primary key.

PostgreSQL generates an internal primary key for every row, allowing transactions with duplicate external IDs and different details to remain available.

### Negative amounts

Negative amounts represent refunds or reversals. They are:

- Preserved as negative values
- Displayed as refunds
- Excluded from reward earnings
- Excluded from positive-spending analytics

## Reward Rules

- One coin is earned for every complete ₹100 spent.
- Only successful transactions with a positive amount earn coins.
- Earnings are capped at 100 coins per transaction.
- Failed, pending, zero-value, and refund transactions earn zero coins.
- Catalogue rewards can be redeemed repeatedly.
- A reward remains visible when unaffordable, but its action is disabled.

## Important Technical Decisions

### Server-side pagination

The table uses server-side pagination, filtering, searching, and sorting instead of sending all 10,000 records to the browser.

This:

- Reduces the initial response size
- Keeps the interface responsive
- Uses PostgreSQL indexes
- Scales beyond the supplied dataset

### Hand-built table

The transaction table was built without a component library. It includes custom styling, sticky headers, responsive behaviour, keyboard interaction, and explicit loading, empty, and error states.

### Server state

TanStack Query manages transactions, analytics, coin balance, catalogue data, and redemption mutations.

Local React state is limited to temporary interface state such as filters, selected transactions, selected rewards, and modal visibility.

### Atomic redemption

Reward redemption uses a PostgreSQL transaction and locks the wallet row with `SELECT ... FOR UPDATE`.

The wallet update and redemption record either both succeed or both roll back, preventing concurrent requests from spending the same coins.

More detailed reasoning is available in [DECISIONS.md](./DECISIONS.md). Product and data assumptions are documented in [ASSUMPTIONS.md](./ASSUMPTIONS.md).

## Accessibility

Implemented accessibility touches include:

- Semantic table markup
- Keyboard-focusable transaction rows
- Visible focus styles
- Accessible modal roles and labels
- Modal focus trapping
- Escape-to-close behaviour
- Focus restoration after modal dismissal
- Accessible button labels
- Status and error announcements

## Completed Scope

- PostgreSQL schema and one-command seed
- Import and normalization of all 10,000 transactions
- Server-side transaction pagination
- Merchant search
- Combinable transaction filters
- Date and amount sorting
- Transaction detail modal
- Category-spending analytics
- Chart-to-table category filtering
- Dashboard summary metrics
- Reward balance and catalogue
- Atomic redemption with validation
- Optimistic balance update and rollback
- Responsive design
- Deployed frontend, backend, and PostgreSQL

## Not Implemented

The following optional functionality was intentionally left out to keep the core implementation focused:

- Monthly spending-trend chart
- Authentication and multiple user accounts
- External voucher fulfilment
- Full automated end-to-end test suite

## Deployment

### Frontend

The Vite frontend is deployed on Vercel with:

```env
VITE_API_URL=YOUR_RENDER_BACKEND_URL/api
```

### Backend

The FastAPI backend is deployed on Render with:

```bash
pip install -r backend/requirements.txt
```

and:

```bash
uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
```

### Database

The production database is hosted on Neon PostgreSQL and initialized using the same documented seed command.

## Author

**Rahul Chaurasiya**

- GitHub: https://github.com/rahulc34
- Email: [rahul.connectt@gmail.com](mailto:rahul.connectt@gmail.com)
