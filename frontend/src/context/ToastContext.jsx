// src/context/ToastContext.jsx
import { createContext, useContext, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const STYLES = {
  success: {
    bar: "bg-emerald-500",
    icon: "text-emerald-500",
    bg: "bg-white",
  },
  error: {
    bar: "bg-coral",
    icon: "text-coral",
    bg: "bg-white",
  },
  warning: {
    bar: "bg-amber",
    icon: "text-amber",
    bg: "bg-white",
  },
  info: {
    bar: "bg-violet",
    icon: "text-violet",
    bg: "bg-white",
  },
};

let _id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback(id => {
    // Trigger exit animation first
    setToasts(prev => prev.map(t => (t.id === id ? { ...t, exiting: true } : t)));
    // Remove after animation completes
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }, 320);
  }, []);

  const show = useCallback(
    (message, type = "info", duration = 4000) => {
      const id = ++_id;
      setToasts(prev => [...prev, { id, message, type, exiting: false }]);

      if (duration > 0) {
        timers.current[id] = setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss],
  );

  const toast = {
    success: (msg, dur) => show(msg, "success", dur),
    error: (msg, dur) => show(msg, "error", dur),
    warning: (msg, dur) => show(msg, "warning", dur),
    info: (msg, dur) => show(msg, "info", dur),
    dismiss,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {createPortal(<ToastContainer toasts={toasts} onDismiss={dismiss} />, document.body)}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ── Toast Container ───────────────────────────────────────────────────────────

function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-6 right-6 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none"
      aria-live="polite"
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// ── Single Toast ──────────────────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }) {
  const { id, message, type, exiting } = toast;
  const style = STYLES[type] ?? STYLES.info;
  const Icon = ICONS[type] ?? Info;

  return (
    <div
      className={`
        pointer-events-auto flex items-start gap-3 rounded-2xl shadow-card
        border border-gray-100 px-4 py-3.5 max-w-sm w-full
        transition-all duration-300 ease-out
        ${style.bg}
        ${exiting ? "opacity-0 translate-x-4 scale-95" : "opacity-100 translate-x-0 scale-100"}
      `}
      style={{ willChange: "transform, opacity" }}
    >
      {/* Coloured left bar */}
      <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${style.bar}`} />

      {/* Icon */}
      <Icon size={18} className={`flex-shrink-0 mt-0.5 ${style.icon}`} strokeWidth={2.5} />

      {/* Message */}
      <p className="flex-1 text-sm font-medium text-gray-800 leading-snug">{message}</p>

      {/* Close */}
      <button
        onClick={() => onDismiss(id)}
        className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors mt-0.5"
        aria-label="Dismiss"
      >
        <X size={15} />
      </button>
    </div>
  );
}
