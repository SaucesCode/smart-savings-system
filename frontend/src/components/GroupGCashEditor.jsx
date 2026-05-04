import { useState } from "react";
import { Smartphone, User, Link, Pencil, Check, X, Loader2 } from "lucide-react";
import { updateGroupGCash } from "../api/groups";

export default function GroupGCashEditor({ group, isAdmin, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    gcash_number: group.gcash_number || "",
    gcash_name: group.gcash_name || "",
    gcash_qr_url: group.gcash_qr_url || "",
  });

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const updated = await updateGroupGCash(group.id, form);
      onUpdated(updated); // bubble up to GroupDetailPage to refresh group state
      setEditing(false);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      gcash_number: group.gcash_number || "",
      gcash_name: group.gcash_name || "",
      gcash_qr_url: group.gcash_qr_url || "",
    });
    setEditing(false);
    setError("");
  };

  const isEmpty = !group.gcash_number && !group.gcash_name && !group.gcash_qr_url;

  return (
    <div className="mt-8 rounded-2xl bg-white shadow-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-violet" />
          <h2 className="text-base font-semibold text-gray-800">Group GCash Details</h2>
        </div>
        {isAdmin && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-sm text-violet hover:text-violet-dark font-medium transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>

      {/* Empty state for non-admins */}
      {isEmpty && !isAdmin && (
        <p className="text-sm text-gray-400">No GCash details set for this group yet.</p>
      )}

      {/* Empty state for admins — nudge to fill in */}
      {isEmpty && isAdmin && !editing && (
        <div className="rounded-xl bg-amber/10 border border-amber/30 px-4 py-3 text-sm text-amber-dark flex items-center gap-2">
          <Smartphone className="w-4 h-4 shrink-0" />
          No GCash details set yet. Add them so members know where to send contributions.
        </div>
      )}

      {error && <p className="text-sm text-coral mb-4">{error}</p>}

      {!isEmpty && (
        <div className="space-y-4">
          {/* GCash Number */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              GCash Number
            </label>
            {editing ? (
              <input
                type="text"
                value={form.gcash_number}
                onChange={e => setForm(f => ({ ...f, gcash_number: e.target.value }))}
                placeholder="09XX XXX XXXX"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet/30 focus:border-violet transition"
              />
            ) : (
              <p className="text-sm text-gray-800 font-medium">
                {group.gcash_number || (
                  <span className="text-gray-400 font-normal">Not set</span>
                )}
              </p>
            )}
          </div>

          {/* GCash Name */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
              <User className="w-3.5 h-3.5" />
              Account Name
            </label>
            {editing ? (
              <input
                type="text"
                value={form.gcash_name}
                onChange={e => setForm(f => ({ ...f, gcash_name: e.target.value }))}
                placeholder="Juan dela Cruz"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet/30 focus:border-violet transition"
              />
            ) : (
              <p className="text-sm text-gray-800 font-medium">
                {group.gcash_name || (
                  <span className="text-gray-400 font-normal">Not set</span>
                )}
              </p>
            )}
          </div>

          {/* QR Code */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
              <Link className="w-3.5 h-3.5" />
              QR Code Image URL
            </label>
            {editing ? (
              <input
                type="url"
                value={form.gcash_qr_url}
                onChange={e => setForm(f => ({ ...f, gcash_qr_url: e.target.value }))}
                placeholder="https://..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet/30 focus:border-violet transition"
              />
            ) : group.gcash_qr_url ? (
              <img
                src={group.gcash_qr_url}
                alt="Group GCash QR"
                className="w-32 h-32 object-contain rounded-xl border border-gray-100"
              />
            ) : (
              <span className="text-sm text-gray-400">Not set</span>
            )}
          </div>
        </div>
      )}

      {/* Editing mode fields when was previously empty */}
      {isEmpty && isAdmin && editing && (
        <div className="space-y-4 mt-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
              <Smartphone className="w-3.5 h-3.5" /> GCash Number
            </label>
            <input
              type="text"
              value={form.gcash_number}
              onChange={e => setForm(f => ({ ...f, gcash_number: e.target.value }))}
              placeholder="09XX XXX XXXX"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet/30 focus:border-violet transition"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
              <User className="w-3.5 h-3.5" /> Account Name
            </label>
            <input
              type="text"
              value={form.gcash_name}
              onChange={e => setForm(f => ({ ...f, gcash_name: e.target.value }))}
              placeholder="Juan dela Cruz"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet/30 focus:border-violet transition"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
              <Link className="w-3.5 h-3.5" /> QR Code Image URL
            </label>
            <input
              type="url"
              value={form.gcash_qr_url}
              onChange={e => setForm(f => ({ ...f, gcash_qr_url: e.target.value }))}
              placeholder="https://..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet/30 focus:border-violet transition"
            />
          </div>
        </div>
      )}

      {/* Save / Cancel */}
      {editing && (
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-violet text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-violet-dark transition disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="flex items-center gap-2 border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
