import { useState, useEffect } from "react";
import { Smartphone, User, Link, Pencil, Check, X, Loader2 } from "lucide-react";
import { getProfile, updateProfileGCash } from "../api/profile";

export default function GCashDetailsEditor() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    gcash_number: "",
    gcash_name: "",
    gcash_qr_url: "",
  });

  useEffect(() => {
    getProfile()
      .then(data => {
        setProfile(data);
        setForm({
          gcash_number: data.gcash_number || "",
          gcash_name: data.gcash_name || "",
          gcash_qr_url: data.gcash_qr_url || "",
        });
      })
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const updated = await updateProfileGCash(form);
      setProfile(prev => ({ ...prev, ...updated }));
      setEditing(false);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      gcash_number: profile?.gcash_number || "",
      gcash_name: profile?.gcash_name || "",
      gcash_qr_url: profile?.gcash_qr_url || "",
    });
    setEditing(false);
    setError("");
  };

  if (loading)
    return <div className="mt-8 rounded-2xl bg-white shadow-card p-6 animate-shimmer h-40" />;

  return (
    <div className="mt-8 rounded-2xl bg-white shadow-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-violet" />
          <h2 className="text-base font-semibold text-gray-800">My GCash Details</h2>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-sm text-violet hover:text-violet-dark font-medium transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>

      {error && <p className="text-sm text-coral mb-4">{error}</p>}

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
              {profile?.gcash_number || (
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
              {profile?.gcash_name || (
                <span className="text-gray-400 font-normal">Not set</span>
              )}
            </p>
          )}
        </div>

        {/* QR URL */}
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
          ) : profile?.gcash_qr_url ? (
            <img
              src={profile.gcash_qr_url}
              alt="GCash QR"
              className="w-32 h-32 object-contain rounded-xl border border-gray-100"
            />
          ) : (
            <span className="text-sm text-gray-400">Not set</span>
          )}
        </div>
      </div>

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
