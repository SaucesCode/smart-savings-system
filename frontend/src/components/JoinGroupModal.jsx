// src/components/JoinGroupModal.jsx
// User enters a group ID to join an existing group.
// On success, calls onSuccess(member) so GroupsPage can refetch.
//
// Props:
//   isOpen    — boolean
//   onClose   — dismiss callback
//   onSuccess — called after successfully joining

import { useState } from 'react';
import { joinGroup, getGroups } from '../api/groups';
import { X, UserPlus, Hash, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function JoinGroupModal({ isOpen, onClose, onSuccess }) {
  const [groupId,    setGroupId]    = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState(null);
  const [success,    setSuccess]    = useState(null); // group name after join

  if (!isOpen) return null;

  const handleJoin = async () => {
    const id = groupId.trim();
    if (!id) {
      setError('Please enter a group ID.');
      return;
    }
    if (isNaN(Number(id)) || Number(id) <= 0) {
      setError('Group ID must be a positive number.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const member = await joinGroup(id);
      // Fetch the group name to show in the success message
      const groups = await getGroups();
      const joined = groups.find((g) => g.id === member.group);
      setSuccess(joined?.name ?? `Group #${id}`);
      setTimeout(() => {
        onSuccess(member);
        handleClose();
      }, 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setGroupId('');
    setError(null);
    setSuccess(null);
    setSubmitting(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-teal" strokeWidth={2.5} />
            <h2 className="text-base font-bold text-gray-800">Join a Group</h2>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-5">

          {/* Success state */}
          {success ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <CheckCircle2 size={28} className="text-emerald-600" strokeWidth={2} />
              </div>
              <div>
                <p className="font-bold text-gray-800">You're in!</p>
                <p className="text-sm text-gray-400 mt-1">
                  Successfully joined <span className="font-semibold text-gray-600">{success}</span>
                </p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500">
                Ask the group admin for the Group ID, then enter it below.
              </p>

              {/* Group ID input */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Group ID <span className="text-red-400">*</span>
                </label>
                <div className={`flex items-center gap-2 border rounded-xl px-4 py-3 transition focus-within:ring-2 focus-within:ring-teal/40 focus-within:border-teal
                  ${error ? 'border-red-300' : 'border-gray-200'}`}
                >
                  <Hash size={16} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="number"
                    min="1"
                    value={groupId}
                    onChange={(e) => {
                      setGroupId(e.target.value);
                      if (error) setError(null);
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleJoin(); }}
                    placeholder="e.g. 42"
                    className="flex-1 text-base font-bold text-gray-800 outline-none bg-transparent"
                    autoFocus
                  />
                </div>
                {error && (
                  <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
                    <AlertCircle size={12} /> {error}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1.5">
                  The group admin can find the ID in their group settings.
                </p>
              </div>

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
                  onClick={handleJoin}
                  disabled={submitting}
                  className="flex-1 bg-teal text-white text-sm font-bold rounded-xl py-3 hover:bg-teal-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting
                    ? <><span className="animate-spin inline-block">⏳</span> Joining...</>
                    : <><UserPlus size={15} strokeWidth={2.5} /> Join Group</>
                  }
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}