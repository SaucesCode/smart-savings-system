// src/pages/WalletPage.jsx
import { useEffect, useState, useCallback } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Handshake,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { getWallet, updateSavingsGoal } from "../api/wallet";
import { getTransactions } from "../api/transactions";
import GCashDepositModal from "../components/GCashDepositModal";
import WithdrawalModal from "../components/WithdrawalModal";
import GCashDetailsEditor from "../components/GCashDetailsEditor";

export default function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTx, setNewTx] = useState(null); // optimistic prepend after deposit

  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const fetchWallet = useCallback(() => {
    setLoading(true);
    getWallet()
      .then(setWallet)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const handleDepositSuccess = tx => {
    fetchWallet();
    setNewTx(tx);
  };

  const handleWithdrawalSuccess = tx => {
    fetchWallet();
    setNewTx(tx);
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-8 pb-16 space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-800">My Wallet</h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage your balance, goal, and transactions.
        </p>
      </div>

      {/* ── Wallet header card ─────────────────────────── */}
      {loading && <WalletHeaderSkeleton />}
      {error && <ErrorBanner message={error} onRetry={fetchWallet} />}

      {!loading && !error && wallet && (
        <WalletHeader
          wallet={wallet}
          onWalletUpdated={setWallet}
          onDepositClick={() => setDepositOpen(true)}
          onWithdrawClick={() => setWithdrawOpen(true)}
        />
      )}

      {/* ── Transaction history ────────────────────────── */}
      {!loading && !error && <TransactionHistory newTx={newTx} />}

      {/* ── Modals ────────────────────────────────────── */}
      <GCashDepositModal
        isOpen={depositOpen}
        onClose={() => setDepositOpen(false)}
        onSuccess={handleDepositSuccess}
      />
      <WithdrawalModal
        isOpen={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        onSuccess={handleWithdrawalSuccess}
        walletBalance={wallet?.balance ?? 0}
      />
      <GCashDetailsEditor />
    </main>
  );
}

// ── Wallet Header ─────────────────────────────────────────────────────────────

function WalletHeader({ wallet, onWalletUpdated, onDepositClick, onWithdrawClick }) {
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(wallet.savings_goal ?? "");
  const [saving, setSaving] = useState(false);
  const [goalError, setGoalError] = useState(null);

  const progress =
    wallet.savings_goal && wallet.savings_goal > 0
      ? Math.min((wallet.balance / wallet.savings_goal) * 100, 100)
      : null;

  const handleSaveGoal = async () => {
    const parsed = parseFloat(goalInput);
    if (isNaN(parsed) || parsed < 0) {
      setGoalError("Please enter a valid amount.");
      return;
    }
    setGoalError(null);
    setSaving(true);
    try {
      const updated = await updateSavingsGoal(wallet.id, parsed);
      onWalletUpdated(updated);
      setEditingGoal(false);
    } catch (err) {
      setGoalError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelGoal = () => {
    setGoalInput(wallet.savings_goal ?? "");
    setGoalError(null);
    setEditingGoal(false);
  };

  return (
    <div className="rounded-2xl overflow-hidden shadow-card">
      {/* ── Top: balance ──────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-violet to-violet-light text-white px-8 py-8 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-12 -left-6  w-40 h-40 rounded-full bg-white/5  pointer-events-none" />

        <p className="text-xs font-semibold tracking-widest uppercase opacity-75 relative">
          Available Balance
        </p>
        <p className="text-5xl font-extrabold tracking-tight mt-2 relative">
          ₱{Number(wallet.balance).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
        </p>

        {/* Progress bar (if goal set) */}
        {progress !== null && (
          <div className="mt-6 relative">
            <div className="flex justify-between text-xs opacity-80 mb-2">
              <span>Progress toward goal</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/25 overflow-hidden">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mt-7 relative">
          <button
            onClick={onDepositClick}
            className="flex-1 flex items-center justify-center gap-2 bg-white text-violet font-bold text-sm rounded-xl py-2.5 hover:bg-violet-light hover:text-white transition-colors"
          >
            <span>⬇️</span> Deposit
          </button>
          <button
            onClick={onWithdrawClick}
            className="flex-1 flex items-center justify-center gap-2 bg-white/20 text-white font-bold text-sm rounded-xl py-2.5 hover:bg-white/30 transition-colors border border-white/30"
          >
            <span>⬆️</span> Withdraw
          </button>
        </div>
      </div>

      {/* ── Bottom: savings goal ─────────────────────── */}
      <div className="bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Savings Goal
            </p>
            {!editingGoal && (
              <p className="text-xl font-extrabold text-gray-800 mt-0.5">
                {wallet.savings_goal ? (
                  `₱${Number(wallet.savings_goal).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
                ) : (
                  <span className="text-gray-400 font-medium text-base">Not set</span>
                )}
              </p>
            )}
          </div>

          {!editingGoal && (
            <button
              onClick={() => setEditingGoal(true)}
              className="text-sm font-semibold text-violet hover:text-violet-dark transition-colors"
            >
              {wallet.savings_goal ? "Edit goal" : "+ Set goal"}
            </button>
          )}
        </div>

        {/* Inline goal editor */}
        {editingGoal && (
          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-semibold text-sm">₱</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={goalInput}
                onChange={e => setGoalInput(e.target.value)}
                placeholder="e.g. 10000"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet/40 focus:border-violet transition"
                autoFocus
              />
            </div>

            {goalError && <p className="text-xs text-red-500">{goalError}</p>}

            <div className="flex gap-2">
              <button
                onClick={handleSaveGoal}
                disabled={saving}
                className="flex-1 bg-violet text-white text-sm font-bold rounded-xl py-2.5 hover:bg-violet-dark transition-colors disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Goal"}
              </button>
              <button
                onClick={handleCancelGoal}
                disabled={saving}
                className="flex-1 border border-gray-200 text-gray-500 text-sm font-semibold rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Transaction History ───────────────────────────────────────────────────────
// Placeholder shell — full paginated version built in Step 4.

function TransactionHistory({ newTx }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  useEffect(() => {
    getTransactions()
      .then(setTransactions)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Prepend new transaction optimistically when deposit succeeds
  useEffect(() => {
    if (!newTx) return;
    setTransactions(prev => {
      const alreadyExists = prev.some(t => t.id === newTx.id);
      return alreadyExists ? prev : [newTx, ...prev];
    });
    setPage(1); // jump back to first page to show it
  }, [newTx]);

  const totalPages = Math.ceil(transactions.length / PER_PAGE);
  const paginated = transactions.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <h2 className="text-base font-bold text-gray-800 mb-4">Transaction History</h2>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="animate-shimmer w-11 h-11 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="animate-shimmer h-3 w-32 rounded" />
                <div className="animate-shimmer h-2.5 w-20 rounded" />
              </div>
              <div className="animate-shimmer h-4 w-16 rounded" />
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && transactions.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <span className="text-4xl">🧾</span>
          <p className="text-sm mt-2">No transactions yet. Make your first deposit!</p>
        </div>
      )}

      {!loading &&
        !error &&
        paginated.map((tx, i) => (
          <TransactionRow key={tx.id} tx={tx} isLast={i === paginated.length - 1} />
        ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-sm font-semibold text-violet disabled:opacity-30 hover:text-violet-dark transition-colors"
          >
            ← Previous
          </button>
          <span className="text-xs text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="text-sm font-semibold text-violet disabled:opacity-30 hover:text-violet-dark transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

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

function TransactionRow({ tx, isLast }) {
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
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bgCls}`}
      >
        <TxIcon size={20} className={meta.iconCls} strokeWidth={2} />
      </div>
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
        {tx.note && <p className="text-xs text-gray-400 truncate">{tx.note}</p>}
      </div>
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

function WalletHeaderSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden shadow-card">
      <div className="bg-gradient-to-br from-violet to-violet-light px-8 py-8 space-y-4">
        <div className="animate-shimmer h-3 w-32 rounded opacity-40" />
        <div className="animate-shimmer h-12 w-56 rounded opacity-40" />
        <div className="animate-shimmer h-2  w-full rounded-full mt-4 opacity-30" />
        <div className="flex gap-3 mt-4">
          <div className="animate-shimmer flex-1 h-10 rounded-xl opacity-40" />
          <div className="animate-shimmer flex-1 h-10 rounded-xl opacity-40" />
        </div>
      </div>
      <div className="bg-white px-8 py-5">
        <div className="animate-shimmer h-3 w-24 rounded" />
        <div className="animate-shimmer h-6 w-36 rounded mt-2" />
      </div>
    </div>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="rounded-2xl bg-red-50 border border-red-100 px-6 py-5 flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-red-700">Failed to load wallet</p>
        <p className="text-xs text-red-400 mt-0.5">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="text-sm font-bold text-red-600 hover:text-red-800 transition-colors"
      >
        Retry
      </button>
    </div>
  );
}
