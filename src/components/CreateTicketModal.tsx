"use client";

import React, { useState } from "react";

interface CreateTicketModalProps {
  onClose: () => void;
  onSubmit: (data: { subject: string; description: string; sequence: string }) => Promise<void>;
  /** Suggested sequence label for the new ticket. */
  suggestedSequence: string;
}

export default function CreateTicketModal({
  onClose,
  onSubmit,
  suggestedSequence,
}: CreateTicketModalProps) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [sequence, setSequence] = useState(suggestedSequence);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;
    setError("");
    setLoading(true);
    try {
      await onSubmit({ subject: subject.trim(), description: description.trim(), sequence: sequence.trim() });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 id="modal-title" className="text-xl font-bold mb-4">
          Create Ticket
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="ticket-sequence">
              Sequence
            </label>
            <input
              id="ticket-sequence"
              type="text"
              value={sequence}
              onChange={(e) => setSequence(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. 1, 2-a, 3-1"
            />
            <p className="text-xs text-gray-400 mt-1">
              Numbers = ordered steps · Letters = parallel steps (e.g. 2-a, 2-b)
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="ticket-subject">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="ticket-subject"
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ticket title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="ticket-description">
              Description
            </label>
            <textarea
              id="ticket-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Optional description"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm" role="alert">
              {error}
            </p>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border hover:bg-gray-50 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-medium transition-colors"
            >
              {loading ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
