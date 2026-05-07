// src/pages/TransactionsPage.jsx
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getTransactions, updateTransactionStatus } from '../api/transactions'
import { getPendingAdminTransactions, updateGroupTransactionStatus } from '../api/groups'
import {
  ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle2,
  XCircle, ShieldCheck, RefreshCw, ArrowLeftRight, Handshake,
} from 'lucide-react'

const TABS = { MY: 'my', VERIFY: 'verify' }

const TX_TYPE_META = {
  deposit:    { Icon: ArrowDownCircle, color: 'text-teal',  bg: 'bg-teal/10',  label: 'Deposit' },
  withdrawal: { Icon: ArrowUpCircle,   color: 'text-coral', bg: 'bg-coral/10', label: 'Withdrawal' },
}

const STATUS_META = {
  pending:   { Icon: Clock,         cls: 'bg-amber-100 text-amber-700' },
  confirmed: { Icon: CheckCircle2,  cls: 'bg-emerald-100 text-emerald-700' },
  rejected:  { Icon: XCircle,       cls: 'bg-red-100 text-red-700' },
}

const PER_PAGE = 10

export default function TransactionsPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState(TABS.MY)

  // ── My transactions ──────────────────────────────────────────────────────
  const [myTxs, setMyTxs]         = useState([])
  const [myLoading, setMyLoading] = useState(true)
  const [myError, setMyError]     = useState(null)
  const [myPage, setMyPage]       = useState(1)

  // ── Pending admin ────────────────────────────────────────────────────────
  const [pending, setPending]           = useState([])
  const [pendingLoading, setPendingLoading] = useState(true)
  const [pendingError, setPendingError] = useState(null)
  const [isAdmin, setIsAdmin]           = useState(false)

  const fetchMyTxs = useCallback(() => {
    setMyLoading(true)
    setMyError(null)
    getTransactions()
      .then(setMyTxs)
      .catch(err => setMyError(err.message))
      .finally(() => setMyLoading(false))
  }, [])

  const fetchPending = useCallback(() => {
    setPendingLoading(true)
    setPendingError(null)
    getPendingAdminTransactions()
      .then(data => {
        setPending(data)
        setIsAdmin(true)
      })
      .catch(err => {
        // 403 = not an admin anywhere — hide the tab silently
        if (err.message?.includes('403') || err.response?.status === 403) {
          setIsAdmin(false)
        } else {
          setPendingError(err.message)
          setIsAdmin(true) // still show tab, just show error
        }
      })
      .finally(() => setPendingLoading(false))
  }, [])

  useEffect(() => { fetchMyTxs() },  [fetchMyTxs])
  useEffect(() => { fetchPending() }, [fetchPending])

  // ── Admin: confirm / reject group tx ─────────────────────────────────────
  const handleGroupTxAction = async (tx, status) => {
    try {
      const updated = await updateGroupTransactionStatus(tx.group, tx.id, status)
      setPending(prev => prev.filter(t => t.id !== tx.id))
    } catch (err) {
      alert(err.message)
    }
  }

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(myTxs.length / PER_PAGE)
  const paginated  = myTxs.slice((myPage - 1) * PER_PAGE, myPage * PER_PAGE)

  return (
    <main className="max-w-3xl mx-auto px-6 py-8 pb-16 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Transactions</h1>
          <p className="text-sm text-gray-400 mt-1">
            Your payment history{isAdmin ? ' · and pending verifications' : ''}.
          </p>
        </div>
        <button
          onClick={() => { fetchMyTxs(); fetchPending() }}
          className="text-gray-400 hover:text-gray-600 transition-colors mt-1"
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        <TabBtn
          active={tab === TABS.MY}
          onClick={() => setTab(TABS.MY)}
          Icon={ArrowLeftRight}
          label="My Transactions"
        />
        {isAdmin && (
          <TabBtn
            active={tab === TABS.VERIFY}
            onClick={() => setTab(TABS.VERIFY)}
            Icon={ShieldCheck}
            label={`Verify Payments${pending.length > 0 ? ` (${pending.length})` : ''}`}
            accent
          />
        )}
      </div>

      {/* ── Tab: My Transactions ─────────────────────────────────────────── */}
      {tab === TABS.MY && (
        <section className="bg-white rounded-2xl shadow-card p-6">
          {myLoading && <TxSkeleton />}

          {myError && (
            <div className="text-center py-10">
              <p className="text-sm text-red-500">{myError}</p>
              <button onClick={fetchMyTxs} className="text-xs text-teal mt-2 font-semibold">
                Retry
              </button>
            </div>
          )}

          {!myLoading && !myError && myTxs.length === 0 && (
            <EmptyState
              Icon={ArrowLeftRight}
              message="No transactions yet. Make a deposit from your Wallet page."
            />
          )}

          {!myLoading && !myError && paginated.map((tx, i) => (
            <PersonalTxRow
              key={tx.id}
              tx={tx}
              isLast={i === paginated.length - 1}
            />
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
              <button
                onClick={() => setMyPage(p => Math.max(1, p - 1))}
                disabled={myPage === 1}
                className="text-sm font-semibold text-teal disabled:opacity-30 hover:text-teal-dark transition-colors"
              >
                ← Previous
              </button>
              <span className="text-xs text-gray-400">
                Page {myPage} of {totalPages}
              </span>
              <button
                onClick={() => setMyPage(p => Math.min(totalPages, p + 1))}
                disabled={myPage === totalPages}
                className="text-sm font-semibold text-teal disabled:opacity-30 hover:text-teal-dark transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </section>
      )}

      {/* ── Tab: Verify Payments ─────────────────────────────────────────── */}
      {tab === TABS.VERIFY && isAdmin && (
        <section className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <ShieldCheck size={16} className="text-teal" />
            <h2 className="text-base font-bold text-gray-800">Pending Group Contributions</h2>
          </div>

          {pendingLoading && <TxSkeleton />}

          {pendingError && (
            <div className="text-center py-10">
              <p className="text-sm text-red-500">{pendingError}</p>
              <button onClick={fetchPending} className="text-xs text-teal mt-2 font-semibold">
                Retry
              </button>
            </div>
          )}

          {!pendingLoading && !pendingError && pending.length === 0 && (
            <EmptyState
              Icon={CheckCircle2}
              message="All caught up — no pending contributions to verify."
              color="text-emerald-400"
            />
          )}

          {!pendingLoading && !pendingError && pending.map((tx, i) => (
            <AdminTxRow
              key={tx.id}
              tx={tx}
              isLast={i === pending.length - 1}
              onConfirm={() => handleGroupTxAction(tx, 'confirmed')}
              onReject={() => handleGroupTxAction(tx, 'rejected')}
            />
          ))}
        </section>
      )}
    </main>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TabBtn({ active, onClick, Icon, label, accent }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all
        ${active
          ? accent
            ? 'bg-violet text-white shadow-sm'
            : 'bg-white text-gray-800 shadow-sm'
          : 'text-gray-500 hover:text-gray-700'
        }`}
    >
      <Icon size={14} strokeWidth={2.5} />
      {label}
    </button>
  )
}

function PersonalTxRow({ tx, isLast }) {
  const meta   = TX_TYPE_META[tx.type] ?? TX_TYPE_META.deposit
  const status = STATUS_META[tx.status] ?? STATUS_META.confirmed
  const { Icon, color, bg } = meta
  const { Icon: StatusIcon, cls } = status

  return (
    <div className={`flex items-center gap-3 py-3 ${!isLast ? 'border-b border-gray-100' : ''}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
        <Icon size={18} className={color} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800">{meta.label}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {new Date(tx.created_at).toLocaleDateString('en-PH', {
            month: 'short', day: 'numeric', year: 'numeric'
          })}
          {tx.gcash_reference ? ` · #${tx.gcash_reference}` : ''}
        </p>
        {tx.note && <p className="text-xs text-gray-400 truncate">{tx.note}</p>}
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <p className={`text-sm font-extrabold ${tx.type === 'deposit' ? 'text-teal' : 'text-coral'}`}>
          {tx.type === 'deposit' ? '+' : '-'}₱{Number(tx.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
        </p>
        <span className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5 ${cls}`}>
          <StatusIcon size={11} strokeWidth={2.5} />
          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
        </span>
      </div>
    </div>
  )
}

function AdminTxRow({ tx, isLast, onConfirm, onReject }) {
  const [actioning, setActioning] = useState(false)

  const handleAction = async fn => {
    setActioning(true)
    await fn()
    setActioning(false)
  }

  return (
    <div className={`flex items-start gap-3 py-4 ${!isLast ? 'border-b border-gray-100' : ''}`}>
      <div className="w-10 h-10 rounded-xl bg-violet/10 flex items-center justify-center flex-shrink-0">
        <Handshake size={18} className="text-violet" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-bold text-gray-800">
            ₱{Number(tx.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-gray-400">Group #{tx.group}</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          {new Date(tx.created_at).toLocaleDateString('en-PH', {
            month: 'short', day: 'numeric', year: 'numeric'
          })}
          {tx.gcash_reference ? ` · #${tx.gcash_reference}` : ''}
        </p>
        {tx.note && <p className="text-xs text-gray-400 truncate mt-0.5">{tx.note}</p>}

        {/* Screenshot link */}
        {tx.gcash_screenshot_url && (
          <a
            href={tx.gcash_screenshot_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-teal font-semibold hover:underline mt-1 inline-block"
          >
            View Screenshot →
          </a>
        )}

        {/* Confirm / Reject */}
        <div className="flex items-center gap-2 mt-2.5">
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
      </div>
    </div>
  )
}

function EmptyState({ Icon, message, color = 'text-gray-300' }) {
  return (
    <div className="text-center py-12">
      <Icon size={36} className={`mx-auto mb-3 ${color}`} strokeWidth={1.5} />
      <p className="text-sm text-gray-400 max-w-xs mx-auto">{message}</p>
    </div>
  )
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
  )
}