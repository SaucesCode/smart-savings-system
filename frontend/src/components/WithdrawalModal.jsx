// src/components/WithdrawalModal.jsx
// Single-step withdrawal request.
// User enters amount + note → submitted as Pending withdrawal.
// Admin confirms → balance is deducted server-side.
//
// Props:
//   isOpen       — boolean
//   onClose      — dismiss callback
//   onSuccess    — called with new transaction object after submit
//   walletBalance — current balance (used for max validation)

import { useState } from "react";
import { createTransaction } from "../api/transactions";
import { X, ArrowUpCircle, AlertCircle, Wallet, FileText } from "lucide-react";

export default function WithdrawalModal({ isOpen, onClose, onSuccess, walletBalance = 0 }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    const parsed = parseFloat(amount);

    if (isNaN(parsed) || parsed <= 0) {
      newErrors.amount = "Please enter a valid amount greater than ₱0.";
    } else if (parsed > parseFloat(walletBalance)) {
      newErrors.amount = `Insufficient balance. Your wallet has ₱${Number(walletBalance).toLocaleString("en-PH", { minimumFractionDigits: 2 })}.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      const tx = await createTransaction({
        transaction_type: "withdrawal",
        amount: parseFloat(amount),
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
    setAmount("");
    setNote("");
    setErrors({});
    setSubmitting(false);
    onClose();
  };

  const parsed = parseFloat(amount) || 0;
  const isOverLimit = parsed > parseFloat(walletBalance);
  const progressPct =
    walletBalance > 0 ? Math.min((parsed / parseFloat(walletBalance)) * 100, 100) : 0;

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
          <div className="flex items-center gap-2">
            <ArrowUpCircle size={18} className="text-coral" strokeWidth={2.5} />
            <h2 className="text-base font-bold text-gray-800">Withdraw Funds</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Available balance pill */}
          <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-4 py-3">
            <Wallet size={16} className="text-violet flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400 font-medium">Available balance</p>
              <p className="text-sm font-extrabold text-gray-800">
                ₱{Number(walletBalance).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Amount to Withdraw <span className="text-red-400">*</span>
            </label>
            <div
              className={`flex items-center gap-2 border rounded-xl px-4 py-3 transition focus-within:ring-2 focus-within:ring-coral/40 focus-within:border-coral
              ${errors.amount || isOverLimit ? "border-red-300" : "border-gray-200"}`}
            >
              <span className="text-gray-400 font-semibold text-sm">₱</span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={e => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors(prev => ({ ...prev, amount: undefined }));
                }}
                placeholder="0.00"
                className="flex-1 text-xl font-bold text-gray-800 outline-none bg-transparent"
                autoFocus
              />
            </div>

            {/* Live balance bar */}
            {parsed > 0 && (
              <div className="mt-2 space-y-1">
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${isOverLimit ? "bg-red-400" : "bg-coral"}`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p
                  className={`text-xs text-right font-medium ${isOverLimit ? "text-red-500" : "text-gray-400"}`}
                >
                  {isOverLimit
                    ? "Exceeds available balance"
                    : `₱${(parseFloat(walletBalance) - parsed).toLocaleString("en-PH", { minimumFractionDigits: 2 })} will remain`}
                </p>
              </div>
            )}

            {errors.amount && (
              <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
                <AlertCircle size={12} /> {errors.amount}
              </p>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <FileText size={12} />
                Note <span className="text-gray-300 font-normal normal-case">(optional)</span>
              </span>
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Rent payment, emergency fund..."
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral transition resize-none"
            />
          </div>

          {/* Info banner */}
          <div className="flex items-start gap-2.5 bg-amber-50 rounded-xl px-4 py-3 text-sm text-amber-700">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>
              Withdrawals are <span className="font-bold">Pending</span> until an admin
              approves them. Your balance will be deducted only after confirmation.
            </span>
          </div>

          {/* Submit error */}
          {errors.submit && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-xl px-4 py-3">
              <AlertCircle size={14} className="flex-shrink-0" />
              {errors.submit}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 border border-gray-200 text-gray-500 text-sm font-semibold rounded-xl py-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || isOverLimit || parsed <= 0}
              className="flex-1 bg-coral text-white text-sm font-bold rounded-xl py-3 hover:bg-coral-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="animate-spin inline-block">⏳</span> Submitting...
                </>
              ) : (
                <>
                  <ArrowUpCircle size={16} strokeWidth={2.5} /> Request Withdrawal
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
