import json
from collections import Counter
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_FILE = PROJECT_ROOT / "data" / "transactions.json"

REQUIRED_FIELDS = {
    "id",
    "timestamp",
    "merchant",
    "amount",
    "currency",
    "status",
}


def is_empty(value: Any) -> bool:
    return value is None or (
        isinstance(value, str) and not value.strip()
    )


def detect_timestamp_type(value: Any) -> str:
    if isinstance(value, (int, float)):
        return "epoch_milliseconds"

    if not isinstance(value, str):
        return "invalid_type"

    value = value.strip()

    if not value:
        return "empty"

    if value.isdigit():
        return "numeric_string"

    if "T" in value and value.endswith("Z"):
        return "iso_utc"

    if "T" in value and (
        "+" in value[10:] or "-" in value[10:]
    ):
        return "iso_timezone_offset"

    if len(value) == 10:
        return "date_only"

    if "/" in value:
        return "slash_formatted"

    return "other_string"


def main() -> None:
    if not DATA_FILE.exists():
        raise FileNotFoundError(
            f"Dataset not found: {DATA_FILE}"
        )

    with DATA_FILE.open("r", encoding="utf-8") as file:
        transactions = json.load(file)

    if not isinstance(transactions, list):
        raise ValueError("transactions.json must contain a JSON array")

    id_counts = Counter()
    status_counts = Counter()
    timestamp_counts = Counter()

    missing_required = Counter()
    missing_categories = 0
    negative_amounts = 0
    zero_amounts = 0
    invalid_amounts = 0

    for transaction in transactions:
        transaction_id = transaction.get("id")

        if not is_empty(transaction_id):
            id_counts[str(transaction_id).strip()] += 1

        status = transaction.get("status")

        if is_empty(status):
            status_counts["<missing>"] += 1
        else:
            status_counts[str(status).strip()] += 1

        timestamp_counts[
            detect_timestamp_type(transaction.get("timestamp"))
        ] += 1

        for field in REQUIRED_FIELDS:
            if is_empty(transaction.get(field)):
                missing_required[field] += 1

        if is_empty(transaction.get("category")):
            missing_categories += 1

        amount = transaction.get("amount")

        try:
            numeric_amount = float(amount)

            if numeric_amount < 0:
                negative_amounts += 1
            elif numeric_amount == 0:
                zero_amounts += 1
        except (TypeError, ValueError):
            invalid_amounts += 1

    duplicate_ids = {
        transaction_id: count
        for transaction_id, count in id_counts.items()
        if count > 1
    }

    duplicate_rows = sum(
        count - 1 for count in duplicate_ids.values()
    )

    print("\n=== TRANSACTION DATA REPORT ===")
    print(f"Total records: {len(transactions)}")
    print(f"Unique external IDs: {len(id_counts)}")
    print(f"Duplicated IDs: {len(duplicate_ids)}")
    print(f"Additional duplicate rows: {duplicate_rows}")
    print(f"Missing/empty categories: {missing_categories}")
    print(f"Negative amounts: {negative_amounts}")
    print(f"Zero amounts: {zero_amounts}")
    print(f"Invalid amounts: {invalid_amounts}")

    print("\nStatus values:")
    for status, count in status_counts.most_common():
        print(f"  {status}: {count}")

    print("\nTimestamp formats:")
    for timestamp_type, count in timestamp_counts.most_common():
        print(f"  {timestamp_type}: {count}")

    print("\nMissing required fields:")
    if missing_required:
        for field, count in missing_required.items():
            print(f"  {field}: {count}")
    else:
        print("  None")

    print("\nDuplicate transaction IDs:")
    if duplicate_ids:
        for transaction_id, count in duplicate_ids.items():
            print(f"  {transaction_id}: {count}")
    else:
        print("  None")


if __name__ == "__main__":
    main()