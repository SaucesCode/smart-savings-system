// src/pages/AnalyticsPage.jsx
// Route: /analytics
// Fetches wallet, transactions, and groups once — passes slices to each chart.

import { useEffect, useState } from "react";
import { getWallet } from "../api/wallet";
import { getTransactions } from "../api/transactions";
import { getGroups } from "../api/groups";
import SpendingLineChart from "../components/charts/SpendingLineChart";
import TypeDoughnutChart from "../components/charts/TypeDoughnutChart";
import GoalProgressChart from "../components/charts/GoalProgressChart";
import MonthlyBarChart from "../components/charts/MonthlyBarChart";
import {
  TrendingUp,
  PieChart,
  Target,
  BarChart2,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  RefreshCw,
} from "lucide-react";

export default function AnalyticsPage() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = () => {
    setLoading(true);
    setError(null);
    Promise.all([getWallet(), getTransactions(), getGroups()])
      .then(([w, txs, gs]) => {
        setWallet(w);
        setTransactions(txs);
        setGroups(gs);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ── Derived summary stats ──────────────────────────────────────────────────
  const confirmed = transactions.filter(tx => tx.status === "confirmed");
  const totalDeposits = confirmed
    .filter(tx => tx.transaction_type === "deposit")
    .reduce((s, tx) => s + parseFloat(tx.amount), 0);
  const totalWithdrawals = confirmed
    .filter(
      tx => tx.transaction_type === "withdrawal" || tx.transaction_type === "contribution",
    )
    .reduce((s, tx) => s + parseFloat(tx.amount), 0);
  const netSavings = totalDeposits - totalWithdrawals;
  const pendingCount = transactions.filter(tx => tx.status === "pending").length;

  if (loading) return <PageSkeleton />;

  if (error)
    return (
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-red-50 rounded-2xl px-6 py-8 text-center space-y-3">
          <p className="font-semibold text-red-700">{error}</p>
          <button
            onClick={fetchAll}
            className="flex items-center gap-2 mx-auto text-sm font-bold text-red-600 hover:text-red-800 transition-colors"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </main>
    );

  return (
    <main className="max-w-5xl mx-auto px-6 py-8 pb-16 space-y-8">
      {/* ── Page header ───────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Analytics</h1>
          <p className="text-sm text-gray-400 mt-1">Your savings activity at a glance.</p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 border border-gray-200 rounded-xl px-3 py-2 transition-colors"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── Summary stat cards ────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          Icon={Wallet}
          label="Wallet Balance"
          value={`₱${Number(wallet?.balance ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`}
          color="text-violet"
          bg="bg-violet/10"
        />
        <StatCard
          Icon={ArrowDownCircle}
          label="Total Deposited"
          value={`₱${totalDeposits.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`}
          color="text-teal"
          bg="bg-teal/10"
        />
        <StatCard
          Icon={ArrowUpCircle}
          label="Total Withdrawn"
          value={`₱${totalWithdrawals.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`}
          color="text-coral"
          bg="bg-coral/10"
        />
        <StatCard
          Icon={TrendingUp}
          label="Net Savings"
          value={`₱${netSavings.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`}
          color={netSavings >= 0 ? "text-emerald-600" : "text-red-500"}
          bg={netSavings >= 0 ? "bg-emerald-50" : "bg-red-50"}
          sub={pendingCount > 0 ? `${pendingCount} pending` : null}
        />
      </div>

      {/* ── Top row: Line + Doughnut ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Balance Over Time" Icon={TrendingUp} className="lg:col-span-2">
          <SpendingLineChart transactions={transactions} />
        </ChartCard>

        <ChartCard title="By Transaction Type" Icon={PieChart}>
          <TypeDoughnutChart transactions={transactions} />
        </ChartCard>
      </div>

      {/* ── Bottom row: Monthly bar + Goal progress ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Monthly Activity" Icon={BarChart2}>
          <MonthlyBarChart transactions={transactions} />
        </ChartCard>

        <ChartCard title="Savings Goal Progress" Icon={Target}>
          <GoalProgressChart wallet={wallet} groups={groups} />
        </ChartCard>
      </div>
    </main>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ Icon, label, value, color, bg, sub }) {
  return (
    <div className="bg-white rounded-2xl shadow-card px-5 py-4 flex items-center gap-3">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}
      >
        <Icon size={20} className={color} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium truncate">{label}</p>
        <p className={`text-base font-extrabold mt-0.5 truncate ${color}`}>{value}</p>
        {sub && <p className="text-xs text-amber-500 font-medium mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function ChartCard({ title, Icon, children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl shadow-card p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-5">
        <Icon size={16} className="text-violet" strokeWidth={2.5} />
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function PageSkeleton() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <div className="animate-shimmer h-8 w-40 rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="animate-shimmer rounded-2xl h-20" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="animate-shimmer rounded-2xl h-72 lg:col-span-2" />
        <div className="animate-shimmer rounded-2xl h-72" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="animate-shimmer rounded-2xl h-72" />
        <div className="animate-shimmer rounded-2xl h-72" />
      </div>
    </main>
  );
}
