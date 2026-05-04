// src/pages/GroupsPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getGroups } from "../api/groups";
import GroupCard from "../components/GroupCard";
import CreateGroupModal from "../components/CreateGroupModal";
import JoinGroupModal from "../components/JoinGroupModal";
import { Plus, UserPlus, Users, TrendingUp, Wallet, RefreshCw } from "lucide-react";

export default function GroupsPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const fetchGroups = () => {
    setLoading(true);
    setError(null);
    getGroups()
      .then(setGroups)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // ── Derived stats ──────────────────────────────────────────────────────────
const totalSaved = groups.reduce((sum, g) => sum + Number(g.total_saved || 0), 0);

const totalGoal = groups.reduce((sum, g) => sum + Number(g.savings_goal || 0), 0);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleCreated = newGroup => {
    setGroups(prev => [newGroup, ...prev]);
  };

  const handleJoined = () => {
    // Refetch so the newly joined group appears with full data
    fetchGroups();
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-8 pb-16 space-y-8">
      {/* ── Page header ───────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Groups</h1>
          <p className="text-sm text-gray-400 mt-1">Save together, reach goals faster.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setJoinOpen(true)}
            className="flex items-center gap-2 text-sm font-semibold border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <UserPlus size={15} strokeWidth={2.5} />
            Join Group
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 text-sm font-bold bg-violet text-white px-4 py-2.5 rounded-xl hover:bg-violet-dark transition-colors"
          >
            <Plus size={16} strokeWidth={2.5} />
            New Group
          </button>
        </div>
      </div>

      {/* ── Summary stats ─────────────────────────────── */}
      {!loading && !error && groups.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            Icon={Users}
            label="Total Groups"
            value={groups.length}
            color="text-violet"
            bg="bg-violet/10"
          />
          <StatCard
            Icon={Wallet}
            label="Total Saved"
            value={`₱${totalSaved.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`}
            color="text-teal"
            bg="bg-teal/10"
          />
          <StatCard
            Icon={TrendingUp}
            label="Combined Goal"
            value={
              totalGoal > 0
                ? `₱${totalGoal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
                : "—"
            }
            color="text-amber"
            bg="bg-amber/10"
          />
        </div>
      )}

      {/* ── Error state ───────────────────────────────── */}
      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-100 px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-red-700">Failed to load groups</p>
            <p className="text-xs text-red-400 mt-0.5">{error}</p>
          </div>
          <button
            onClick={fetchGroups}
            className="flex items-center gap-1.5 text-sm font-bold text-red-600 hover:text-red-800 transition-colors"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* ── Loading skeleton ──────────────────────────── */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-shimmer rounded-2xl h-52" />
          ))}
        </div>
      )}

      {/* ── Empty state ───────────────────────────────── */}
      {!loading && !error && groups.length === 0 && (
        <EmptyState onCreate={() => setCreateOpen(true)} onJoin={() => setJoinOpen(true)} />
      )}

      {/* ── Groups grid ───────────────────────────────── */}
      {!loading && !error && groups.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((g, i) => (
            <GroupCard
              key={g.id}
              group={g}
              index={i}
              onClick={() => navigate(`/groups/${g.id}`)}
            />
          ))}
        </div>
      )}

      {/* ── Modals ────────────────────────────────────── */}
      <CreateGroupModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleCreated}
      />
      <JoinGroupModal
        isOpen={joinOpen}
        onClose={() => setJoinOpen(false)}
        onSuccess={handleJoined}
      />
    </main>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ Icon, label, value, color, bg }) {
  return (
    <div className="bg-white rounded-2xl shadow-card px-5 py-4 flex items-center gap-4">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}
      >
        <Icon size={20} className={color} strokeWidth={2} />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className={`text-lg font-extrabold mt-0.5 ${color}`}>{value}</p>
      </div>
    </div>
  );
}

function EmptyState({ onCreate, onJoin }) {
  return (
    <div className="bg-white rounded-2xl shadow-card py-16 flex flex-col items-center text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-violet/10 flex items-center justify-center mb-4">
        <Users size={32} className="text-violet" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-bold text-gray-800">No groups yet</h3>
      <p className="text-sm text-gray-400 mt-2 max-w-xs">
        Create a savings group with friends or family, or join one with a Group ID.
      </p>
      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={onJoin}
          className="flex items-center gap-2 text-sm font-semibold border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <UserPlus size={15} /> Join Group
        </button>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 text-sm font-bold bg-violet text-white px-5 py-2.5 rounded-xl hover:bg-violet-dark transition-colors"
        >
          <Plus size={15} /> Create Group
        </button>
      </div>
    </div>
  );
}
