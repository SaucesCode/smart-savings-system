// src/pages/Dashboard.jsx
// Navbar removed — Layout/Sidebar handles navigation now.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getGroups } from "../api/groups";
import WalletCard from "../components/WalletCard";
import GroupCard from "../components/GroupCard";
import RecentTransactions from "../components/RecentTransactions";
import { Button } from "../components/ui";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  useEffect(() => {
    getGroups()
      .then(setGroups)
      .catch(() => {})
      .finally(() => setLoadingGroups(false));
  }, []);

  const displayName =
    user?.user_metadata?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there";

  return (
    <main className="max-w-5xl mx-auto px-6 py-8 pb-16 space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-800">
          Good {getTimeOfDay()}, <span className="text-violet">{displayName} 👋</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">Here's your savings overview.</p>
      </div>

      {/* Top row: Wallet + Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <WalletCard />
        <div className="flex flex-col gap-3">
          <QuickStatCard
            emoji="🏦"
            label="Active Groups"
            value={groups.length}
            color="text-violet"
            bg="bg-violet/10"
          />
          <QuickStatCard
            emoji="✅"
            label="Confirmed"
            value="—"
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <QuickStatCard
            emoji="⏳"
            label="Pending"
            value="—"
            color="text-amber-500"
            bg="bg-amber-50"
          />
        </div>
      </div>

      {/* Recent Transactions */}
      <RecentTransactions onSeeAll={() => navigate("/transactions")} />

      {/* Groups */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">My Groups</h2>
          <Button
            onClick={() => navigate("/groups")}
            className="text-sm font-semibold bg-violet text-white px-4 py-2 rounded-xl hover:bg-violet-dark transition-colors"
          >
            + New Group
          </Button>
        </div>

        {loadingGroups ? (
          <GroupsSkeleton />
        ) : groups.length === 0 ? (
          <EmptyGroups />
        ) : (
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
      </section>
    </main>
  );
}

function QuickStatCard({ emoji, label, value, color, bg }) {
  return (
    <div className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 shadow-card">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${bg}`}>
        {emoji}
      </div>
      <div>
        <p className={`text-xl font-extrabold leading-none ${color}`}>{value}</p>
        <p className="text-xs text-gray-400 mt-1">{label}</p>
      </div>
    </div>
  );
}

function GroupsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="animate-shimmer rounded-2xl h-44" />
      ))}
    </div>
  );
}

function EmptyGroups() {
  return (
    <div className="bg-white rounded-2xl shadow-card py-12 text-center text-gray-400">
      <span className="text-4xl">👥</span>
      <p className="font-semibold mt-3 text-gray-600">No groups yet</p>
      <p className="text-sm mt-1">Create or join a group to start saving together.</p>
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}
