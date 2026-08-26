# Product Assumptions

This document records the product and data assumptions made where the assignment brief leaves implementation details open.

## 1. Application scope

- The application represents a single consumer viewing their own transactions, spending analytics, coin balance, and available rewards.
- Authentication is outside the scope of this take-home assignment.
- A single demo user is created by the seed script because the supplied dataset does not associate transactions with multiple users.
- All supplied transactions belong to this seeded demo user.

## 2. Transaction identifiers

- The `id` supplied in `transactions.json` is treated as an external transaction identifier.
- Duplicate external transaction IDs are preserved because some records with the same ID contain different transaction details.
- PostgreSQL uses a separate internally generated primary key to identify each database row.
- Duplicate records are not automatically merged or deleted because there is insufficient information to determine which record is authoritative.

## 3. Transaction statuses

- Transaction status values are trimmed and normalized to uppercase.
- For example, `success`, `SUCCESS`, and `Success` are stored as `SUCCESS`.
- The supported statuses are `SUCCESS`, `FAILED`, and `PENDING`.
- Only successful transactions are considered when calculating earned reward coins.

## 4. Transaction categories

- A null, missing, empty, or whitespace-only category is normalized to `Uncategorized`.
- `Uncategorized` appears as a normal category in transaction filters and spending analytics.
- The original merchant or transaction data is not used to guess a missing category.

## 5. Negative amounts and refunds

- A transaction with a negative amount represents a refund or reversal.
- Negative amounts are preserved rather than converted to positive values.
- Refunds are clearly identified in the user interface.
- Refunds do not earn reward coins, even when their transaction status is `SUCCESS`.
- Refunds reduce net-spending totals where net spending is displayed.
- Failed and pending transactions are excluded from spending analytics unless explicitly stated otherwise in the interface.

## 6. Timestamp normalization

- All timestamps are converted to UTC before being stored in PostgreSQL.
- PostgreSQL stores transaction timestamps using `TIMESTAMPTZ`.
- ISO 8601 timestamps ending in `Z` are treated as UTC.
- ISO 8601 timestamps containing an offset, such as `+05:30`, are converted to UTC.
- Numeric timestamps are interpreted as Unix epoch milliseconds.
- Date-only timestamps are interpreted as midnight UTC.
- Slash-formatted timestamps are interpreted as `DD/MM/YYYY HH:MM:SS`, consistent with the dataset and its Indian financial-app context.
- The application formats stored timestamps for display without modifying the original point in time.

## 7. Monetary values

- Transaction amounts are stored using PostgreSQL `NUMERIC(12, 2)` rather than floating-point values.
- The default and expected currency is INR.
- Monetary values are displayed using Indian currency formatting.
- Transactions retain their provided currency value after it is trimmed and converted to uppercase.

## 8. Reward coin calculation

- A successful transaction with a positive amount earns one coin for every complete ₹100 spent.
- Partial ₹100 amounts do not earn partial coins.
- Coin earnings are capped at 100 coins per transaction.
- Failed transactions, pending transactions, zero-value transactions, and refunds earn zero coins.
- The initial wallet balance is calculated from all eligible seeded transactions.
- Redeeming a reward subtracts its coin cost from the wallet balance.
- A wallet balance is never allowed to become negative.

## 9. Rewards catalogue

- The application provides a small seeded catalogue of cashback and voucher rewards.
- Each reward has a fixed coin cost and reward value.
- Only active rewards can be redeemed.
- A reward remains available for repeated redemption unless it is marked inactive.
- Reward fulfilment is simulated; integration with an external voucher or payment provider is outside the assignment scope.

## 10. Redemption behaviour

- The user must select and confirm a reward before redemption.
- A redemption succeeds only when the reward exists, is active, and the user has enough coins.
- An unknown reward is treated as not found.
- An inactive reward cannot be redeemed.
- An unaffordable reward is rejected without changing the wallet balance.
- The balance update and redemption record are performed as one atomic database operation.
- If redemption fails, the frontend restores or refetches the authoritative balance.

## 11. Data import

- The supplied `transactions.json` file remains unchanged.
- Data normalization happens during the seed process.
- Running the seed command resets and recreates the demo data.
- Rows with invalid essential fields are rejected and reported instead of being silently inserted.
- A successful seed is expected to insert all 10,000 supplied transactions.
