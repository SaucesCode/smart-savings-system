// src/components/Sidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Wallet,
  Users,
  ArrowLeftRight,
  BarChart2,
  LogOut,
  Coins,
} from "lucide-react";

const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/wallet", label: "Wallet", Icon: Wallet },
  { to: "/groups", label: "Groups", Icon: Users },
  { to: "/transactions", label: "Transactions", Icon: ArrowLeftRight },
  { to: "/analytics", label: "Analytics", Icon: BarChart2 },
];

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "User";

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-60 bg-white border-r border-gray-200 flex flex-col z-50">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-gray-100 flex-shrink-0">
        <Coins className="text-violet" size={22} strokeWidth={2.5} />
        <span className="text-lg font-extrabold text-violet">SmartSave</span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_LINKS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors
              ${
                isActive
                  ? "bg-violet text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User info + sign out */}
      <div className="px-4 py-4 border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-violet/10 flex items-center justify-center text-violet font-bold text-sm flex-shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 border border-gray-200 rounded-xl py-2 hover:bg-gray-50 hover:text-gray-800 transition-colors"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
