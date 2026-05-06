// src/components/CreateGroupModal.jsx
// Creates a new savings group.
// On success, calls onSuccess(newGroup) so GroupsPage can prepend it.
//
// Props:
//   isOpen     — boolean
//   onClose    — dismiss callback
//   onSuccess  — called with the created group object

import { useState } from "react";
import { createGroup } from "../api/groups";
import { X, Users, Target, Calendar, FileText, AlertCircle, Smartphone } from "lucide-react";

export default function CreateGroupModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    savings_goal: "",
    target_date: "",
    gcash_number: "",
    gcash_name: "",
    gcash_qr_url: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const set = field => e => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Group name is required.";
    if (form.name.trim().length > 100) newErrors.name = "Name must be under 100 characters.";
    if (form.savings_goal && isNaN(parseFloat(form.savings_goal))) {
      newErrors.savings_goal = "Goal must be a valid number.";
    }
    if (form.savings_goal && parseFloat(form.savings_goal) <= 0) {
      newErrors.savings_goal = "Goal must be greater than ₱0.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        ...(form.savings_goal && { savings_goal: parseFloat(form.savings_goal) }),
        ...(form.target_date && { target_date: form.target_date }),
        gcash_number: form.gcash_number.trim(),
        gcash_name: form.gcash_name.trim(),
        gcash_qr_url: form.gcash_qr_url.trim(),
      };
      const group = await createGroup(payload);
      onSuccess(group);
      handleClose();
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm({
      name: "",
      description: "",
      savings_goal: "",
      target_date: "",
      gcash_number: "",
      gcash_name: "",
      gcash_qr_url: "",
    });
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
          <div className="flex items-center gap-2">
            <Users size={18} className="text-violet" strokeWidth={2.5} />
            <h2 className="text-base font-bold text-gray-800">Create a Group</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Group Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. Family Emergency Fund"
              autoFocus
              className={`w-full border rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet/40 focus:border-violet transition
                ${errors.name ? "border-red-300" : "border-gray-200"}`}
            />
            {errors.name && <FieldError message={errors.name} />}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <FileText size={12} />
                Description{" "}
                <span className="text-gray-300 font-normal normal-case">(optional)</span>
              </span>
            </label>
            <textarea
              value={form.description}
              onChange={set("description")}
              placeholder="What is this group saving for?"
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet/40 focus:border-violet transition resize-none"
            />
          </div>

          {/* Goal + Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5">
                  <Target size={12} />
                  Goal Amount
                </span>
              </label>
              <div
                className={`flex items-center gap-1.5 border rounded-xl px-3 py-2.5 transition focus-within:ring-2 focus-within:ring-violet/40 focus-within:border-violet
                ${errors.savings_goal ? "border-red-300" : "border-gray-200"}`}
              >
                <span className="text-gray-400 text-sm font-semibold">₱</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.savings_goal}
                  onChange={set("savings_goal")}
                  placeholder="0.00"
                  className="flex-1 text-sm font-bold text-gray-800 outline-none bg-transparent w-0"
                />
              </div>
              {errors.savings_goal && <FieldError message={errors.savings_goal} />}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  Target Date
                </span>
              </label>
              <input
                type="date"
                value={form.target_date}
                onChange={set("target_date")}
                min={new Date().toISOString().split("T")[0]}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet/40 focus:border-violet transition"
              />
            </div>
          </div>

          {/* Info note */}
          <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-3">
            💡 You'll be added as <span className="font-bold text-gray-600">Admin</span>{" "}
            automatically. Admins can verify contributions and manage members.
          </p>

          {/* GCash Payment Details */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Smartphone size={12} />
                GCash Payment Details
                <span className="text-gray-300 font-normal normal-case">
                  (optional — can set later)
                </span>
              </span>
            </label>

            {/* Number + Name row */}
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={form.gcash_number}
                onChange={set("gcash_number")}
                placeholder="09XX XXX XXXX"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet/40 focus:border-violet transition"
              />
              <input
                type="text"
                value={form.gcash_name}
                onChange={set("gcash_name")}
                placeholder="Account name"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet/40 focus:border-violet transition"
              />
            </div>

            {/* QR URL */}
            <input
              type="url"
              value={form.gcash_qr_url}
              onChange={set("gcash_qr_url")}
              placeholder="QR code image URL (optional)"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet/40 focus:border-violet transition"
            />
          </div>

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
              disabled={submitting}
              className="flex-1 bg-violet text-white text-sm font-bold rounded-xl py-3 hover:bg-violet-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="animate-spin inline-block">⏳</span> Creating...
                </>
              ) : (
                <>
                  <Users size={15} strokeWidth={2.5} /> Create Group
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldError({ message }) {
  return (
    <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
      <AlertCircle size={12} /> {message}
    </p>
  );
}
