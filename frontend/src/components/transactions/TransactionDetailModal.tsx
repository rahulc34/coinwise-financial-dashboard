import { CalendarDays, Coins, CreditCard, Hash, Tag } from "lucide-react";

import type { Transaction } from "../../types/transaction";
import { formatCurrency, formatDate } from "../../utils/format";
import { Badge } from "../ui/Badge";
import { Modal } from "../ui/Modal";

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export function TransactionDetailModal({
  transaction,
  onClose,
}: TransactionDetailModalProps) {
  if (!transaction) {
    return null;
  }

  const statusVariant = transaction.is_refund
    ? "refund"
    : transaction.status === "SUCCESS"
      ? "success"
      : transaction.status === "FAILED"
        ? "failed"
        : "pending";

  return (
    <Modal open title="Transaction details" onClose={onClose}>
      <div className="p-5">
        <div className="rounded-2xl bg-gray-50 p-5 text-center">
          <p className="text-sm text-body">
            {transaction.is_refund ? "Refund amount" : "Transaction amount"}
          </p>

          <p
            className={`mt-2 text-3xl font-bold tabular-nums ${
              transaction.is_refund ? "text-violet-700" : "text-heading"
            }`}
          >
            {formatCurrency(transaction.amount, transaction.currency)}
          </p>

          <Badge variant={statusVariant} className="mt-3">
            {transaction.is_refund ? "REFUND" : transaction.status}
          </Badge>
        </div>

        <dl className="mt-5 divide-y divide-border">
          <DetailRow
            icon={CreditCard}
            label="Merchant"
            value={transaction.merchant}
          />

          <DetailRow icon={Tag} label="Category" value={transaction.category} />

          <DetailRow
            icon={CalendarDays}
            label="Date and time"
            value={formatDate(transaction.occurred_at)}
          />

          <DetailRow
            icon={CreditCard}
            label="Payment method"
            value={transaction.payment_method}
          />

          <DetailRow
            icon={Coins}
            label="Coins earned"
            value={transaction.reward_coins.toLocaleString("en-IN")}
          />

          <DetailRow
            icon={Hash}
            label="Transaction ID"
            value={transaction.transaction_id}
            monospace
          />
        </dl>
      </div>
    </Modal>
  );
}

interface DetailRowProps {
  icon: typeof CreditCard;
  label: string;
  value: string;
  monospace?: boolean;
}

function DetailRow({
  icon: Icon,
  label,
  value,
  monospace = false,
}: DetailRowProps) {
  return (
    <div className="flex gap-3 py-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        <Icon aria-hidden="true" className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <dt className="text-xs font-medium text-muted">{label}</dt>

        <dd
          className={`mt-1 break-words text-sm font-semibold text-heading ${
            monospace ? "font-mono" : ""
          }`}
        >
          {value}
        </dd>
      </div>
    </div>
  );
}
