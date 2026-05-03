// src/components/GCashDepositModal.jsx
import { useState } from "react";
import { createTransaction } from "../api/transactions";
import {
  X,
  ArrowLeft,
  Check,
  Copy,
  Smartphone,
  AlertCircle,
  ArrowDownCircle,
} from "lucide-react";

const GCASH_NUMBER = import.meta.env.VITE_GCASH_NUMBER || "09XX XXX XXXX";
const GCASH_NAME = import.meta.env.VITE_GCASH_NAME || "SmartSave Admin";

const STEP_AMOUNT = 1;
const STEP_QR = 2;
const STEP_REF = 3;

const STEP_LABELS = {
  [STEP_AMOUNT]: "Enter Amount",
  [STEP_QR]: "Pay via GCash",
  [STEP_REF]: "Confirm Payment",
};

export default function GCashDepositModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(STEP_AMOUNT);
  const [amount, setAmount] = useState("");
  const [refNumber, setRefNumber] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleAmountNext = () => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setErrors({ amount: "Please enter a valid amount greater than ₱0." });
      return;
    }
    setErrors({});
    setStep(STEP_QR);
  };

  const handleSubmit = async () => {
    if (!refNumber.trim()) {
      setErrors({ ref: "Please enter your GCash reference number." });
      return;
    }
    if (refNumber.trim().length < 6) {
      setErrors({ ref: "Reference number looks too short. Please check." });
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const tx = await createTransaction({
        transaction_type: "deposit",
        amount: parseFloat(amount),
        reference_number: refNumber.trim(),
        note: note.trim(),
      });
      onSuccess(tx);
      handleClose();
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(STEP_AMOUNT);
    setAmount("");
    setRefNumber("");
    setNote("");
    setErrors({});
    setSubmitting(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={e => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {step > STEP_AMOUNT && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="flex items-center gap-2">
              <ArrowDownCircle size={18} className="text-violet" strokeWidth={2.5} />
              <h2 className="text-base font-bold text-gray-800">{STEP_LABELS[step]}</h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step indicator */}
        <StepIndicator current={step} total={3} />

        {/* Step content */}
        <div className="px-6 py-6">
          {step === STEP_AMOUNT && (
            <StepAmount
              amount={amount}
              setAmount={setAmount}
              error={errors.amount}
              onNext={handleAmountNext}
            />
          )}
          {step === STEP_QR && <StepQR amount={amount} onNext={() => setStep(STEP_REF)} />}
          {step === STEP_REF && (
            <StepReference
              amount={amount}
              refNumber={refNumber}
              setRefNumber={setRefNumber}
              note={note}
              setNote={setNote}
              errors={errors}
              submitting={submitting}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-1.5 px-6 py-2.5 bg-gray-50 border-b border-gray-100">
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const active = n === current;
        const done = n < current;
        return (
          <div key={n} className="flex items-center gap-1.5">
            <div
              className={`
              w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all
              ${done ? "bg-violet text-white" : ""}
              ${active ? "bg-violet text-white ring-4 ring-violet/20" : ""}
              ${!done && !active ? "bg-gray-200 text-gray-400" : ""}
            `}
            >
              {done ? <Check size={12} strokeWidth={3} /> : n}
            </div>
            {n < total && (
              <div
                className={`h-0.5 w-8 rounded-full transition-colors ${done ? "bg-violet" : "bg-gray-200"}`}
              />
            )}
          </div>
        );
      })}
      <span className="ml-2 text-xs text-gray-400 font-medium">
        Step {current} of {total}
      </span>
    </div>
  );
}

// ── Step 1: Amount ────────────────────────────────────────────────────────────

function StepAmount({ amount, setAmount, error, onNext }) {
  const QUICK = [100, 500, 1000, 5000];

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">How much would you like to deposit?</p>

      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Amount
        </label>
        <div
          className={`flex items-center gap-2 border rounded-xl px-4 py-3 transition focus-within:ring-2 focus-within:ring-violet/40 focus-within:border-violet ${error ? "border-red-300" : "border-gray-200"}`}
        >
          <span className="text-gray-400 font-semibold text-sm">₱</span>
          <input
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            className="flex-1 text-xl font-bold text-gray-800 outline-none bg-transparent"
            autoFocus
          />
        </div>
        {error && (
          <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
            <AlertCircle size={12} /> {error}
          </p>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Quick select
        </p>
        <div className="grid grid-cols-4 gap-2">
          {QUICK.map(q => (
            <button
              key={q}
              onClick={() => setAmount(String(q))}
              className={`py-2 rounded-xl text-sm font-bold border transition-colors
                ${
                  String(amount) === String(q)
                    ? "bg-violet text-white border-violet"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:border-violet hover:text-violet"
                }`}
            >
              ₱{q.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-violet text-white font-bold rounded-xl py-3 hover:bg-violet-dark transition-colors"
      >
        Continue →
      </button>
    </div>
  );
}

// ── Step 2: GCash QR ──────────────────────────────────────────────────────────

function StepQR({ amount, onNext }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(GCASH_NUMBER.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5 text-center">
      <div className="bg-blue-50 rounded-xl px-4 py-3 text-sm text-blue-700 font-medium">
        Send exactly{" "}
        <span className="font-extrabold">
          ₱{Number(amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
        </span>{" "}
        to this GCash account
      </div>

      {/* QR placeholder */}
      <div className="mx-auto w-48 h-48 bg-gray-50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
        <Smartphone size={40} className="text-gray-300" />
        <p className="text-xs text-gray-400 mt-2 font-medium">GCash QR Code</p>
        <p className="text-xs text-gray-300 mt-1">Replace with real QR image</p>
      </div>

      {/* Account details */}
      <div className="bg-gray-50 rounded-xl px-5 py-4 space-y-3 text-left">
        <DetailRow label="Account Name" value={GCASH_NAME} />
        <DetailRow
          label="Account Number"
          value={GCASH_NUMBER}
          action={
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1 text-xs font-bold transition-colors ${copied ? "text-emerald-600" : "text-violet hover:text-violet-dark"}`}
            >
              {copied ? <Check size={12} strokeWidth={3} /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
          }
        />
        <DetailRow
          label="Amount"
          value={`₱${Number(amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`}
        />
      </div>

      <p className="text-xs text-gray-400">
        Open GCash, scan the QR or send to the number above, then come back here.
      </p>

      <button
        onClick={onNext}
        className="w-full bg-violet text-white font-bold rounded-xl py-3 hover:bg-violet-dark transition-colors"
      >
        I've Sent the Payment →
      </button>
    </div>
  );
}

function DetailRow({ label, value, action }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-gray-800">{value}</span>
        {action}
      </div>
    </div>
  );
}

// ── Step 3: Reference number ──────────────────────────────────────────────────

function StepReference({
  amount,
  refNumber,
  setRefNumber,
  note,
  setNote,
  errors,
  submitting,
  onSubmit,
}) {
  return (
    <div className="space-y-5">
      <div className="bg-amber-50 rounded-xl px-4 py-3 text-sm text-amber-700 font-medium flex items-start gap-2">
        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
        <span>
          Your deposit of{" "}
          <span className="font-extrabold">
            ₱{Number(amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
          </span>{" "}
          will be <span className="font-extrabold">Pending</span> until an admin verifies it.
        </span>
      </div>

      {/* Reference number */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          GCash Reference Number <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={refNumber}
          onChange={e => setRefNumber(e.target.value)}
          placeholder="e.g. 1234567890"
          autoFocus
          className={`w-full border rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet/40 focus:border-violet transition
            ${errors.ref ? "border-red-300" : "border-gray-200"}`}
        />
        {errors.ref && (
          <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
            <AlertCircle size={12} /> {errors.ref}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-1.5">
          Found in your GCash transaction history after sending.
        </p>
      </div>

      {/* Note */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Note <span className="text-gray-300 font-normal normal-case">(optional)</span>
        </label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="e.g. January savings deposit"
          rows={2}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet/40 focus:border-violet transition resize-none"
        />
      </div>

      {errors.submit && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-xl px-4 py-3">
          <AlertCircle size={14} className="flex-shrink-0" />
          {errors.submit}
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={submitting}
        className="w-full bg-violet text-white font-bold rounded-xl py-3 hover:bg-violet-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <span className="animate-spin">⏳</span> Submitting...
          </>
        ) : (
          "Submit Deposit"
        )}
      </button>
    </div>
  );
}
