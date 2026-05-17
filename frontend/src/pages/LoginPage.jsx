// src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Bolt,
  Mail,
  Lock,
  ArrowRight,
  UserPlus,
  AlertCircle,
  Wallet,
  Users,
  Smartphone,
  BarChart2,
} from "lucide-react";

export default function LoginPage() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = isSignUp
      ? await signUpWithEmail(email, password)
      : await signInWithEmail(email, password);

    if (error) {
      setError(error.message);
    } else {
      navigate("/");
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ─────────────────────────────────────────────────────── */}
      <div className="relative hidden lg:flex flex-col justify-between bg-violet w-1/2 px-16 py-14 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute top-1/2 -left-20 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-20 right-10 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />

        {/* Brand */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <Bolt size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-white font-extrabold text-xl tracking-tight">SmartSave</span>
        </div>

        {/* Tagline */}
        <div className="relative z-10 space-y-4">
          <h1 className="text-5xl font-extrabold text-white leading-tight tracking-tight">
            Save smarter,
            <br />
            together.
          </h1>
          <p className="text-lg text-white/70 leading-relaxed max-w-sm">
            Manage personal savings and group funds with GCash — all in one place.
          </p>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-4">
          {FEATURES.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-white" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{label}</p>
                <p className="text-xs text-white/60">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────────────────────── */}
      <div className="flex-1 bg-[#F8F7FF] flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-md">
          {/* Mobile brand — only on small screens */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-violet flex items-center justify-center">
              <Bolt size={17} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-violet font-extrabold text-lg">SmartSave</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-800">
              {isSignUp ? "Create account" : "Welcome back"}
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              {isSignUp
                ? "Join SmartSave and start saving today"
                : "Sign in to your account to continue"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 mb-6">
              <AlertCircle size={15} className="flex-shrink-0" strokeWidth={2.5} />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Email address
              </label>
              <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-5 py-3.5 focus-within:ring-2 focus-within:ring-violet/30 focus-within:border-violet transition">
                <Mail size={16} className="text-gray-400 flex-shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="flex-1 text-sm text-gray-800 bg-transparent outline-none placeholder:text-gray-400 font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Password
              </label>
              <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-5 py-3.5 focus-within:ring-2 focus-within:ring-violet/30 focus-within:border-violet transition">
                <Lock size={16} className="text-gray-400 flex-shrink-0" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="flex-1 text-sm text-gray-800 bg-transparent outline-none placeholder:text-gray-400 font-medium"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 bg-violet text-white font-bold text-sm rounded-2xl py-4 hover:bg-violet-dark transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isSignUp ? (
                <UserPlus size={16} strokeWidth={2.5} />
              ) : (
                <ArrowRight size={16} strokeWidth={2.5} />
              )}
              {loading ? "Loading..." : isSignUp ? "Create account" : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6 text-xs text-gray-400">
            <div className="flex-1 h-px bg-gray-200" />
            or continue with
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-2xl py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <GoogleLogo />
            Continue with Google
          </button>

          {/* Toggle */}
          <p className="text-center text-sm text-gray-400 mt-8">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(s => !s);
                setError(null);
              }}
              className="text-violet font-bold hover:text-violet-dark transition-colors"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Wallet,
    label: "Personal wallet",
    sub: "Track your balance and set savings goals",
  },
  {
    icon: Users,
    label: "Group savings",
    sub: "Save together with friends and family",
  },
  {
    icon: Smartphone,
    label: "GCash payments",
    sub: "Submit and verify contributions easily",
  },
  {
    icon: BarChart2,
    label: "Analytics",
    sub: "Visualise your savings progress over time",
  },
];

// ── Google Logo ───────────────────────────────────────────────────────────────

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
