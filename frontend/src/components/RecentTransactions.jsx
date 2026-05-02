// src/components/RecentTransactions.jsx
import { useEffect, useState } from "react";
import { getTransactions } from "../api/transactions";

const TYPE_META = {
  deposit: { emoji: "⬇️", label: "Deposit", color: "bg-emerald-100" },
  withdrawal: { emoji: "⬆️", label: "Withdrawal", color: "bg-red-100" },
  contribution: { emoji: "🤝", label: "Contribution", color: "bg-violet/10" },
};

const STATUS_STYLES = {
  pending: "bg-amber-100   text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100     text-red-800",
};

const STATUS_DOT = {
  pending: "bg-amber-400",
  confirmed: "bg-emerald-500",
  rejected: "bg-red-500",
};

export default function RecentTransactions({ onSeeAll }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getTransactions()
      .then(list => setTransactions(list.slice(0, 5)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-2xl p-6 bg-white shadow-card">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-bold text-gray-800">Recent Transactions</h3>
        <button
          onClick={onSeeAll}
          className="text-sm font-semibold text-violet hover:text-violet-dark transition-colors"
        >
          See all →
        </button>
      </div>

      {/* Loading */}
      {loading && <SkeletonRows />}

      {/* Error */}
      {error && <p className="text-sm text-red-600 py-3">{error}</p>}

      {/* Empty */}
      {!loading && !error && transactions.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <span className="text-4xl">🧾</span>
          <p className="mt-2 text-sm">No transactions yet.</p>
        </div>
      )}

      {/* Rows */}
      {!loading &&
        !error &&
        transactions.map((tx, i) => (
          <TransactionRow key={tx.id} tx={tx} isLast={i === transactions.length - 1} />
        ))}
    </div>
  );
}

function TransactionRow({ tx, isLast }) {
  const meta = TYPE_META[tx.transaction_type] ?? {
    emoji: "💳",
    label: tx.transaction_type,
    color: "bg-gray-100",
  };
  const statusCls = STATUS_STYLES[tx.status] ?? STATUS_STYLES.pending;
  const dotCls = STATUS_DOT[tx.status] ?? STATUS_DOT.pending;
  const isCredit = tx.transaction_type === "deposit";

  return (
    <div
      className={`flex items-center gap-3 py-3 ${!isLast ? "border-b border-gray-100" : ""}`}
    >
      {/* Icon */}
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${meta.color}`}
      >
        {meta.emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{meta.label}</p>
        <p className="text-xs text-gray-400 mt-0.5 truncate">
          {new Date(tx.created_at).toLocaleDateString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          {tx.reference_number ? ` · #${tx.reference_number}` : ""}
        </p>
      </div>

      {/* Amount + badge */}
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-bold ${isCredit ? "text-emerald-600" : "text-red-600"}`}>
          {isCredit ? "+" : "-"}₱
          {Number(tx.amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
        </p>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2 py-0.5 mt-1 ${statusCls}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${dotCls}`} />
          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
        </span>
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-3 py-2">
          <div className="animate-shimmer w-11 h-11 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="animate-shimmer h-3 w-28 rounded" />
            <div className="animate-shimmer h-2.5 w-20 rounded" />
          </div>
          <div className="animate-shimmer h-4 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}
