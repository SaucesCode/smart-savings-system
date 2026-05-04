// src/components/GroupCard.jsx
// Props:
//   group   — group object from the API
//   index   — position in the list (drives gradient rotation)
//   onClick — optional navigation callback

const GRADIENTS = [
  "from-teal to-teal-light",
  "from-coral to-coral-light",
  "from-amber to-amber-light",
  "from-gray-700 to-gray-600",
];

export default function GroupCard({ group, index = 0, onClick }) {
  const gradient = GRADIENTS[index % GRADIENTS.length];

  const progress =
    group.goal_amount && group.goal_amount > 0
      ? Math.min((group.current_balance / group.goal_amount) * 100, 100)
      : null;

  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl p-6 text-white shadow-card cursor-pointer
        bg-gradient-to-br ${gradient}
        transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover
      `}
    >
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-12 -left-5 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />

      {/* Header row */}
      <div className="flex justify-between items-center mb-3 relative">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
          <GroupIcon />
        </div>
        <span className="text-xs font-semibold bg-white/20 rounded-full px-3 py-1">
          👥 {group.member_count ?? group.members?.length ?? 0} members
        </span>
      </div>

      {/* Name */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-bold text-gray-800 truncate">{group.name}</h3>

        {group.invite_code && (
          <span
            onClick={() => {
              navigator.clipboard.writeText(group.invite_code);
              alert("Invite code copied!");
            }}
            className="cursor-pointer text-[10px] font-mono bg-gray-100 hover:bg-gray-200 text-gray-500 px-2 py-1 rounded-lg"
          >
            #{group.invite_code}
          </span>
        )}
      </div>

      {/* Description */}
      {group.description && (
        <p className="text-xs opacity-75 mt-1 line-clamp-2 relative">{group.description}</p>
      )}

      {/* Balance */}
      <p className="text-3xl font-extrabold mt-3 tracking-tight relative">
        ₱ {Number(group.total_saved).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
      </p>

      {/* Progress toward goal */}
      {progress !== null && (
        <div className="mt-3 relative">
          <div className="flex justify-between text-xs opacity-80 mb-1.5">
            <span>Goal</span>
            <span>
              ₱
              {Number(group.goal_amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/25 overflow-hidden">
            <div
              className="h-full rounded-full bg-white/90 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Target date */}
      {group.target_date && (
        <p className="text-xs opacity-75 mt-3 relative">
          🎯 Target:{" "}
          {new Date(group.target_date).toLocaleDateString("en-PH", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      )}
    </div>
  );
}

function GroupIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
