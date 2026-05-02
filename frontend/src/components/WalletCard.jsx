// src/components/WalletCard.jsx
import { useEffect, useState } from "react";
import { getWallet } from "../api/wallet";

export default function WalletCard() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getWallet()
      .then(setWallet)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <WalletCardSkeleton />;
  if (error) return <WalletCardError message={error} />;

  const progress =
    wallet.savings_goal && wallet.savings_goal > 0
      ? Math.min((wallet.balance / wallet.savings_goal) * 100, 100)
      : null;

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 shadow-card bg-gradient-to-br from-violet to-violet-light text-white">
      {/* Decorative blob */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />

      <p className="text-xs font-semibold tracking-widest uppercase opacity-80">My Wallet</p>

      <p className="text-4xl font-extrabold mt-2 tracking-tight leading-none">
        ₱{Number(wallet.balance).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
      </p>

      {progress !== null ? (
        <div className="mt-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs opacity-80">Savings Goal</span>
            <span className="text-xs font-bold">
              ₱
              {Number(wallet.savings_goal).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/25 overflow-hidden">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-right mt-1.5 opacity-75">
            {progress.toFixed(0)}% reached
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm opacity-70">No savings goal set yet.</p>
      )}
    </div>
  );
}

function WalletCardSkeleton() {
  return (
    <div className="rounded-2xl p-6 shadow-card bg-white space-y-3">
      <div className="animate-shimmer h-3 w-1/3 rounded-md" />
      <div className="animate-shimmer h-9 w-1/2 rounded-md" />
      <div className="animate-shimmer h-2 w-full rounded-full mt-4" />
    </div>
  );
}

function WalletCardError({ message }) {
  return (
    <div className="rounded-2xl p-6 shadow-card bg-red-50 text-red-800">
      <p className="font-semibold">Could not load wallet</p>
      <p className="text-sm mt-1 opacity-75">{message}</p>
    </div>
  );
}
