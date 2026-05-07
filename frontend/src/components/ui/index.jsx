// src/components/ui/index.jsx
// ─────────────────────────────────────────────────────────────────────────────
// SmartSave Design System
// All primitives are built on the project's Tailwind tokens.
// Import what you need:
//   import { Button, Card, Badge, Input, Textarea, Modal, EmptyState, Skeleton } from "../ui";
// ─────────────────────────────────────────────────────────────────────────────

// ── Button ────────────────────────────────────────────────────────────────────
// variant: 'primary' | 'secondary' | 'ghost' | 'danger'
// size:    'sm' | 'md' | 'lg'

const BUTTON_VARIANTS = {
  primary: "bg-violet text-white hover:bg-violet-dark disabled:opacity-50",
  secondary:
    "border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50",
  ghost: "text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50",
  danger: "bg-coral text-white hover:bg-coral-dark disabled:opacity-50",
  teal: "bg-teal text-white hover:bg-teal-dark disabled:opacity-50",
};

const BUTTON_SIZES = {
  sm: "px-3 py-1.5 text-xs rounded-xl gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-6 py-3   text-sm rounded-xl gap-2",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  className = "",
  ...props
}) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`
        inline-flex items-center justify-center font-bold transition-colors
        ${BUTTON_VARIANTS[variant] ?? BUTTON_VARIANTS.primary}
        ${BUTTON_SIZES[size] ?? BUTTON_SIZES.md}
        ${className}
      `}
    >
      {loading ? (
        <Spinner size={size === "sm" ? 12 : 15} />
      ) : Icon ? (
        <Icon size={size === "sm" ? 13 : 15} strokeWidth={2.5} />
      ) : null}
      {children}
    </button>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
// variant: 'default' | 'gradient-violet' | 'gradient-teal' | 'gradient-coral'

const CARD_VARIANTS = {
  default: "bg-white shadow-card border border-gray-100",
  "gradient-violet": "bg-gradient-to-br from-violet to-violet-light text-white shadow-card",
  "gradient-teal": "bg-gradient-to-br from-teal to-teal-light text-white shadow-card",
  "gradient-coral": "bg-gradient-to-br from-coral to-coral-light text-white shadow-card",
  "gradient-amber": "bg-gradient-to-br from-amber to-amber-light text-white shadow-card",
};

export function Card({ children, variant = "default", className = "", ...props }) {
  return (
    <div
      {...props}
      className={`rounded-2xl overflow-hidden ${CARD_VARIANTS[variant] ?? CARD_VARIANTS.default} ${className}`}
    >
      {children}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
// variant: 'pending' | 'confirmed' | 'rejected' | 'admin' | 'member' | 'info'

const BADGE_VARIANTS = {
  pending: "bg-amber-100   text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100     text-red-700",
  admin: "bg-teal/10     text-teal",
  member: "bg-gray-100    text-gray-400",
  info: "bg-violet/10   text-violet",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100   text-amber-700",
  error: "bg-red-100     text-red-700",
};

export function Badge({ children, variant = "info", icon: Icon, className = "" }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-0.5
        ${BADGE_VARIANTS[variant] ?? BADGE_VARIANTS.info}
        ${className}
      `}
    >
      {Icon && <Icon size={11} strokeWidth={2.5} />}
      {children}
    </span>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────

export function Input({
  label,
  error,
  hint,
  prefix,
  icon: Icon,
  className = "",
  containerClassName = "",
  ...props
}) {
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div
        className={`
          flex items-center gap-2 border rounded-xl px-4 py-2.5 transition
          focus-within:ring-2 focus-within:ring-violet/40 focus-within:border-violet
          ${error ? "border-red-300" : "border-gray-200"}
          bg-white
        `}
      >
        {prefix && (
          <span className="text-gray-400 font-semibold text-sm flex-shrink-0">{prefix}</span>
        )}
        {Icon && <Icon size={15} className="text-gray-400 flex-shrink-0" />}
        <input
          {...props}
          className={`flex-1 text-sm font-semibold text-gray-800 outline-none bg-transparent placeholder:font-normal placeholder:text-gray-400 ${className}`}
        />
      </div>
      {error && <FieldError message={error} />}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────────────────────────────

export function Textarea({ label, error, hint, rows = 3, className = "", ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        {...props}
        rows={rows}
        className={`
          w-full border rounded-xl px-4 py-3 text-sm text-gray-800 resize-none
          focus:outline-none focus:ring-2 focus:ring-violet/40 focus:border-violet transition
          placeholder:text-gray-400
          ${error ? "border-red-300" : "border-gray-200"}
          ${className}
        `}
      />
      {error && <FieldError message={error} />}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

// ── Modal Shell ───────────────────────────────────────────────────────────────
// Handles backdrop, centering, and header. Pass content as children.

import { X } from "lucide-react";

export function Modal({
  isOpen,
  onClose,
  title,
  icon: Icon,
  iconColor = "text-violet",
  children,
  maxWidth = "max-w-md",
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {Icon && <Icon size={18} className={iconColor} strokeWidth={2.5} />}
            <h2 className="text-base font-bold text-gray-800">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── InfoBanner ────────────────────────────────────────────────────────────────
// For inline contextual messages inside modals / pages.
// variant: 'info' | 'warning' | 'error' | 'success'

import { Info, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

const BANNER_VARIANTS = {
  info: { bg: "bg-blue-50", text: "text-blue-700", Icon: Info },
  warning: { bg: "bg-amber-50", text: "text-amber-700", Icon: AlertCircle },
  error: { bg: "bg-red-50", text: "text-red-600", Icon: XCircle },
  success: { bg: "bg-emerald-50", text: "text-emerald-700", Icon: CheckCircle2 },
};

export function InfoBanner({ children, variant = "info", className = "" }) {
  const { bg, text, Icon } = BANNER_VARIANTS[variant] ?? BANNER_VARIANTS.info;
  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium ${bg} ${text} ${className}`}
    >
      <Icon size={16} className="flex-shrink-0 mt-0.5" strokeWidth={2.5} />
      <span>{children}</span>
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
// Reusable metric tile used on Dashboard, Analytics, Groups pages.

export function StatCard({
  icon: Icon,
  label,
  value,
  color = "text-violet",
  bg = "bg-violet/10",
  sub,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-card px-5 py-4 flex items-center gap-4">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}
      >
        <Icon size={20} className={color} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium truncate">{label}</p>
        <p className={`text-lg font-extrabold mt-0.5 truncate ${color}`}>{value}</p>
        {sub && <p className="text-xs text-amber-500 font-medium mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center px-6">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-violet/10 flex items-center justify-center mb-4">
          <Icon size={28} className="text-violet" strokeWidth={1.5} />
        </div>
      )}
      {title && <p className="text-base font-bold text-gray-700">{title}</p>}
      {description && <p className="text-sm text-gray-400 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

export function Skeleton({ className = "" }) {
  return <div className={`animate-shimmer rounded-xl ${className}`} />;
}

export function SkeletonCard({ lines = 2 }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-5 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────

export function Divider({ className = "" }) {
  return <hr className={`border-gray-100 ${className}`} />;
}

// ── Spinner ───────────────────────────────────────────────────────────────────

export function Spinner({ size = 16, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin ${className}`}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── FieldError ────────────────────────────────────────────────────────────────
// Used internally by Input/Textarea; also exported for custom use.

export function FieldError({ message }) {
  return (
    <p className="flex items-center gap-1 text-xs text-red-500">
      <AlertCircle size={12} />
      {message}
    </p>
  );
}

// ── PageHeader ────────────────────────────────────────────────────────────────

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-800">{title}</h1>
        {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// ── SectionHeader ─────────────────────────────────────────────────────────────

export function SectionHeader({ title, icon: Icon, iconColor = "text-violet", action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
        {Icon && <Icon size={16} className={iconColor} strokeWidth={2.5} />}
        {title}
      </h2>
      {action}
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────

export function Pagination({ page, totalPages, onPrev, onNext, accentColor = "text-violet" }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-5">
      <button
        onClick={onPrev}
        disabled={page === 1}
        className={`text-sm font-semibold disabled:opacity-30 hover:opacity-70 transition-opacity ${accentColor}`}
      >
        ← Previous
      </button>
      <span className="text-xs text-gray-400">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={page === totalPages}
        className={`text-sm font-semibold disabled:opacity-30 hover:opacity-70 transition-opacity ${accentColor}`}
      >
        Next →
      </button>
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
// tabs: [{ key, label, icon: Icon }]

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
      {tabs.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all
            ${
              active === key
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }
          `}
        >
          {Icon && <Icon size={14} strokeWidth={2.5} />}
          {label}
        </button>
      ))}
    </div>
  );
}
