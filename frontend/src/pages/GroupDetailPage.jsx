// src/pages/GroupDetailPage.jsx
// Route: /groups/:id
// Shows group header, member list, transaction history, and contribute button.

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getGroups, getGroupTransactions, updateGroupTransactionStatus } from "../api/groups";
import GroupContributeModal from "../components/GroupContributeModal";
import GroupGCashEditor from "../components/GroupGCashEditor";

import {
  ArrowLeft,
  Users,
  Target,
  Calendar,
  Crown,
  UserCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Handshake,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

const STATUS_META = {
  pending: { Icon: Clock, cls: "bg-amber-100 text-amber-700" },
  confirmed: { Icon: CheckCircle2, cls: "bg-emerald-100 text-emerald-700" },
  rejected: { Icon: XCircle, cls: "bg-red-100 text-red-700" },
};

export default function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [group, setGroup] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);
  const [error, setError] = useState(null);
  const [contributeOpen, setContributeOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;


  // ── Fetch group ────────────────────────────────────────────────────────────
  const fetchGroup = useCallback(() => {
    setLoadingGroup(true);
    getGroups()
      .then(list => {
        const found = list.find(g => String(g.id) === String(id));
        if (!found) {
          setError("Group not found or you are not a member.");
          return;
        }
        setGroup(found);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoadingGroup(false));
  }, [id]);

  // ── Fetch transactions ─────────────────────────────────────────────────────
  const fetchTransactions = useCallback(() => {
    setLoadingTx(true);
    getGroupTransactions(id)
      .then(setTransactions)
      .catch(() => {})
      .finally(() => setLoadingTx(false));
  }, [id]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const myMembership = group?.members?.find(m => m.user_id === user?.id);
  const isAdmin = myMembership?.role === "admin";
  const progress =
    group?.savings_goal && group.savings_goal > 0
      ? Math.min((group.total_saved / group.savings_goal) * 100, 100)
      : null;

  const totalPages = Math.ceil(transactions.length / PER_PAGE);
  const paginated = transactions.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ── Contribute success ─────────────────────────────────────────────────────
  const handleContributeSuccess = newTx => {
    setTransactions(prev => [newTx, ...prev]);
    setPage(1);
    // Don't refetch group balance yet — it updates only after admin confirms
  };

  // ── Admin: confirm / reject ────────────────────────────────────────────────
  const handleStatusUpdate = async (txId, status) => {
    try {
      const updated = await updateGroupTransactionStatus(id, txId, status);
      setTransactions(prev => prev.map(t => (t.id === txId ? updated : t)));
      if (status === "confirmed") fetchGroup(); // refresh balance
    } catch (err) {
      alert(err.message);
    }
  };

  // ── Loading / error ────────────────────────────────────────────────────────
  if (loadingGroup) return <PageSkeleton />;
  if (error)
    return (
      <main className="max-w-3xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate("/groups")}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Groups
        </button>
        <div className="bg-red-50 rounded-2xl px-6 py-8 text-center">
          <p className="font-semibold text-red-700">{error}</p>
        </div>
      </main>
    );

  return (
    <main className="max-w-3xl mx-auto px-6 py-8 pb-16 space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate("/groups")}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Groups
      </button>

      {/* ── Group header card ──────────────────────────── */}
      <div className="rounded-2xl overflow-hidden shadow-card">
        {/* Gradient top */}
        <div className="relative bg-gradient-to-br from-teal to-teal-light text-white px-8 py-8 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-12 -left-6  w-40 h-40 rounded-full bg-white/5  pointer-events-none" />

          {/* Admin badge */}
          {isAdmin && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 rounded-full px-3 py-1 mb-3 relative">
              <ShieldCheck size={12} strokeWidth={2.5} /> Admin
            </span>
          )}

          <h1 className="text-2xl font-extrabold tracking-tight relative">{group.name}</h1>

          {group.description && (
            <p className="text-sm opacity-75 mt-1 relative">{group.description}</p>
          )}

          <p className="text-4xl font-extrabold tracking-tight mt-4 relative">
            ₱
            {Number(group.total_saved).toLocaleString("en-PH", {
              minimumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs opacity-70 mt-1 relative">Current balance</p>

          {/* Progress */}
          {progress !== null && (
            <div className="mt-5 relative">
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

          {/* Contribute button */}
          <button
            onClick={() => setContributeOpen(true)}
            className="mt-6 relative flex items-center gap-2 bg-white text-teal font-bold text-sm rounded-xl px-5 py-2.5 hover:bg-teal-light hover:text-white transition-colors"
          >
            <Handshake size={16} strokeWidth={2.5} /> Contribute
          </button>
        </div>

        {/* Meta row */}
        <div className="bg-white px-8 py-4 flex flex-wrap gap-5">
          <MetaItem
            Icon={Users}
            label={`${group.member_count ?? group.members?.length ?? 0} members`}
          />
          {group.goal_amount && (
            <MetaItem
              Icon={Target}
              label={`Goal: ₱${Number(group.goal_amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`}
            />
          )}
          {group.target_date && (
            <MetaItem
              Icon={Calendar}
              label={`Target: ${new Date(group.target_date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}`}
            />
          )}
        </div>
      </div>

      {/* ── Members ───────────────────────────────────── */}
      <section className="bg-white rounded-2xl shadow-card p-6">
        <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Users size={16} className="text-teal" /> Members
        </h2>
        <div className="space-y-3">
          {group.members?.map(member => (
            <MemberRow key={member.id} member={member} currentUserId={user?.id} />
          ))}
        </div>
      </section>

      {/* ── Transaction history ────────────────────────── */}
      <section className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <Handshake size={16} className="text-teal" /> Contributions
          </h2>
          <button
            onClick={fetchTransactions}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {loadingTx && <TxSkeleton />}

        {!loadingTx && transactions.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <Handshake size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No contributions yet. Be the first!</p>
          </div>
        )}

        {!loadingTx &&
          paginated.map((tx, i) => (
            <GroupTxRow
              key={tx.id}
              tx={tx}
              isLast={i === paginated.length - 1}
              isAdmin={isAdmin}
              onConfirm={() => handleStatusUpdate(tx.id, "confirmed")}
              onReject={() => handleStatusUpdate(tx.id, "rejected")}
            />
          ))}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-sm font-semibold text-teal disabled:opacity-30 hover:text-teal-dark transition-colors"
            >
              ← Previous
            </button>
            <span className="text-xs text-gray-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="text-sm font-semibold text-teal disabled:opacity-30 hover:text-teal-dark transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </section>

      {group && (
        <GroupGCashEditor
          group={group}
          isAdmin={isAdmin}
          onUpdated={updated => setGroup(updated)}
        />
      )}

      {/* Contribute modal */}
      <GroupContributeModal
        isOpen={contributeOpen}
        onClose={() => setContributeOpen(false)}
        onSuccess={handleContributeSuccess}
        group={group}
      />
    </main>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MetaItem({ Icon, label }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-gray-500">
      <Icon size={14} className="text-teal" strokeWidth={2} />
      <span>{label}</span>
    </div>
  );
}

function MemberRow({ member, currentUserId }) {
  const isMe = String(member.user_id) === String(currentUserId);
  const isAdmin = member.role === "admin";

  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-teal/10 flex items-center justify-center flex-shrink-0">
        {isAdmin ? (
          <Crown size={16} className="text-teal" strokeWidth={2} />
        ) : (
          <UserCircle size={18} className="text-gray-400" strokeWidth={1.5} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">
          {isMe ? "You" : member.name || `User ${member.name}`}
        </p>
        <p className="text-xs text-gray-400">
          Joined{" "}
          {new Date(member.joined_at).toLocaleDateString("en-PH", {
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
      <span
        className={`text-xs font-bold rounded-full px-3 py-1 ${isAdmin ? "bg-teal/10 text-teal" : "bg-gray-100 text-gray-400"}`}
      >
        {isAdmin ? "Admin" : "Member"}
      </span>
    </div>
  );
}

function GroupTxRow({ tx, isLast, isAdmin, onConfirm, onReject }) {
  const statusMeta = STATUS_META[tx.status] ?? STATUS_META.pending;
  const { Icon: StatusIcon } = statusMeta;
  const [actioning, setActioning] = useState(false);

  const handleAction = async fn => {
    setActioning(true);
    await fn();
    setActioning(false);
  };

  return (
    <div
      className={`flex items-start gap-3 py-3 ${!isLast ? "border-b border-gray-100" : ""}`}
    >
      <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0">
        <Handshake size={18} className="text-teal" strokeWidth={2} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-bold text-gray-800">
            ₱{Number(tx.amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
          </p>
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5 ${statusMeta.cls}`}
          >
            <StatusIcon size={11} strokeWidth={2.5} />
            {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
          </span>
        </div>

        <p className="text-xs text-gray-400 mt-0.5">
          {new Date(tx.created_at).toLocaleDateString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          {tx.reference_number ? ` · #${tx.reference_number}` : ""}
        </p>

        {tx.note && <p className="text-xs text-gray-400 truncate">{tx.note}</p>}

        {/* Admin actions — only shown for pending transactions */}
        {isAdmin && tx.status === "pending" && (
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => handleAction(onConfirm)}
              disabled={actioning}
              className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
            >
              <CheckCircle2 size={12} strokeWidth={2.5} /> Confirm
            </button>
            <button
              onClick={() => handleAction(onReject)}
              disabled={actioning}
              className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
            >
              <XCircle size={12} strokeWidth={2.5} /> Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <div className="animate-shimmer h-4 w-32 rounded" />
      <div className="rounded-2xl overflow-hidden shadow-card">
        <div className="animate-shimmer h-56 w-full" />
        <div className="bg-white px-8 py-4 space-y-2">
          <div className="animate-shimmer h-3 w-48 rounded" />
        </div>
      </div>
      <div className="animate-shimmer rounded-2xl h-40" />
      <div className="animate-shimmer rounded-2xl h-64" />
    </main>
  );
}

function TxSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-3">
          <div className="animate-shimmer w-10 h-10 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="animate-shimmer h-3 w-24 rounded" />
            <div className="animate-shimmer h-2.5 w-36 rounded" />
          </div>
          <div className="animate-shimmer h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
