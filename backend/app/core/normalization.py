from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from typing import Any


ALLOWED_STATUSES = {
    "SUCCESS",
    "FAILED",
    "PENDING",
}


class NormalizationError(ValueError):
    pass


def normalize_required_text(
    value: Any,
    field_name: str,
) -> str:
    if value is None:
        raise NormalizationError(
            f"{field_name} is required"
        )

    normalized = str(value).strip()

    if not normalized:
        raise NormalizationError(
            f"{field_name} cannot be empty"
        )

    return normalized


def normalize_category(value: Any) -> str:
    if value is None:
        return "Uncategorized"

    normalized = str(value).strip()

    return normalized or "Uncategorized"


def normalize_status(value: Any) -> str:
    normalized = normalize_required_text(
        value,
        "status",
    ).upper()

    if normalized not in ALLOWED_STATUSES:
        raise NormalizationError(
            f"Unsupported status: {normalized}"
        )

    return normalized


def normalize_currency(value: Any) -> str:
    normalized = normalize_required_text(
        value or "INR",
        "currency",
    ).upper()

    if len(normalized) != 3:
        raise NormalizationError(
            f"Invalid currency: {normalized}"
        )

    return normalized


def normalize_amount(value: Any) -> Decimal:
    try:
        return Decimal(str(value)).quantize(
            Decimal("0.01")
        )
    except (InvalidOperation, TypeError, ValueError):
        raise NormalizationError(
            f"Invalid amount: {value}"
        )


def normalize_timestamp(value: Any) -> datetime:
    if isinstance(value, (int, float)):
        return datetime.fromtimestamp(
            value / 1000,
            tz=timezone.utc,
        )

    if not isinstance(value, str):
        raise NormalizationError(
            f"Invalid timestamp type: {type(value).__name__}"
        )

    normalized = value.strip()

    if not normalized:
        raise NormalizationError(
            "Timestamp cannot be empty"
        )

    if normalized.isdigit():
        return datetime.fromtimestamp(
            int(normalized) / 1000,
            tz=timezone.utc,
        )

    if normalized.endswith("Z"):
        normalized = normalized[:-1] + "+00:00"

    supported_formats = (
    "%Y-%m-%d",
    "%d/%m/%Y %H:%M:%S",
)

    try:
        parsed = datetime.fromisoformat(normalized)
    except ValueError:
        parsed = None

        for timestamp_format in supported_formats:
            try:
                parsed = datetime.strptime(
                    normalized,
                    timestamp_format,
                )
                break
            except ValueError:
                continue

        if parsed is None:
            raise NormalizationError(
                f"Unsupported timestamp format: {value}"
            )

    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)

    return parsed.astimezone(timezone.utc)


def normalize_transaction(
    transaction: dict[str, Any],
    source_row_number: int,
) -> dict[str, Any]:
    amount = normalize_amount(
        transaction.get("amount")
    )

    return {
        "transaction_id": normalize_required_text(
            transaction.get("id"),
            "id",
        ),
        "occurred_at": normalize_timestamp(
            transaction.get("timestamp")
        ),
        "merchant": normalize_required_text(
            transaction.get("merchant"),
            "merchant",
        ),
        "category": normalize_category(
            transaction.get("category")
        ),
        "amount": amount,
        "currency": normalize_currency(
            transaction.get("currency")
        ),
        "status": normalize_status(
            transaction.get("status")
        ),
        "payment_method": normalize_required_text(
            transaction.get("payment_method"),
            "payment_method",
        ),
        "is_refund": amount < 0,
        "source_row_number": source_row_number,
    }