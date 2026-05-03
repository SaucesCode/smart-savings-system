// src/components/RecentTransactions.jsx
import { useEffect, useState } from "react";
import { getTransactions } from "../api/transactions";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Handshake,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  Receipt,
} from "lucide-react";

const TYPE_META = {
  deposit: {
    Icon: ArrowDownCircle,
    label: "Deposit",
    iconCls: "text-emerald-600",
    bgCls: "bg-emerald-50",
  },
  withdrawal: {
    Icon: ArrowUpCircle,
    label: "Withdrawal",
    iconCls: "text-red-500",
    bgCls: "bg-red-50",
  },
  contribution: {
    Icon: Handshake,
    label: "Contribution",
    iconCls: "text-violet",
    bgCls: "bg-violet/10",
  },
};

const STATUS_META = {
  pending: { Icon: Clock, cls: "bg-amber-100 text-amber-700" },
  confirmed: { Icon: CheckCircle2, cls: "bg-emerald-100 text-emerald-700" },
  rejected: { Icon: XCircle, cls: "bg-red-100 text-red-700" },
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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-bold text-gray-800">Recent Transactions</h3>
        <button
          onClick={onSeeAll}
          className="text-sm font-semibold text-violet hover:text-violet-dark transition-colors"
        >
          See all →
        </button>
      </div>

      {loading && <SkeletonRows />}

      {error && <p className="text-sm text-red-500 py-3">{error}</p>}

      {!loading && !error && transactions.length === 0 && (
        <div className="text-center py-10 text-gray-400 space-y-2">
          <Receipt size={36} className="mx-auto opacity-40" />
          <p className="text-sm">No transactions yet.</p>
        </div>
      )}

      {!loading &&
        !error &&
        transactions.map((tx, i) => (
          <TransactionRow key={tx.id} tx={tx} isLast={i === transactions.length - 1} />
        ))}
    </div>
  );
}

export function TransactionRow({ tx, isLast }) {
  const meta = TYPE_META[tx.transaction_type] ?? {
    Icon: CreditCard,
    label: tx.transaction_type,
    iconCls: "text-gray-400",
    bgCls: "bg-gray-100",
  };
  const statusMeta = STATUS_META[tx.status] ?? STATUS_META.pending;
  const isCredit = tx.transaction_type === "deposit";
  const { Icon: TxIcon } = meta;
  const { Icon: StatusIcon } = statusMeta;

  return (
    <div
      className={`flex items-center gap-3 py-3 ${!isLast ? "border-b border-gray-100" : ""}`}
    >
      {/* Type icon */}
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bgCls}`}
      >
        <TxIcon size={20} className={meta.iconCls} strokeWidth={2} />
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

      {/* Amount + status */}
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-bold ${isCredit ? "text-emerald-600" : "text-red-500"}`}>
          {isCredit ? "+" : "-"}₱
          {Number(tx.amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
        </p>
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5 mt-1 ${statusMeta.cls}`}
        >
          <StatusIcon size={11} strokeWidth={2.5} />
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
