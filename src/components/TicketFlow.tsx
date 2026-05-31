"use client";

import React, { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import TicketCard from "@/components/TicketCard";
import CreateTicketModal from "@/components/CreateTicketModal";
import { renumberSequences } from "@/lib/ticketNumbering";
import type { RedmineIssue } from "@/types/redmine";

export interface FlowTicket {
  issue: RedmineIssue;
  sequence: string;
}

interface TicketFlowProps {
  initialTickets: FlowTicket[];
  redmineBaseUrl: string;
  onCreateTicket: (
    subject: string,
    description: string,
    sequence: string,
    insertAfterIndex: number
  ) => Promise<RedmineIssue>;
  onReorder: (tickets: FlowTicket[]) => Promise<void>;
}

export default function TicketFlow({
  initialTickets,
  redmineBaseUrl,
  onCreateTicket,
  onReorder,
}: TicketFlowProps) {
  const [tickets, setTickets] = useState<FlowTicket[]>(initialTickets);
  const [insertAfterIndex, setInsertAfterIndex] = useState<number | null>(null);
  const [renumbering, setRenumbering] = useState(false);
  const [reorderError, setReorderError] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = tickets.findIndex((t) => t.issue.id === active.id);
      const newIndex = tickets.findIndex((t) => t.issue.id === over.id);
      const reordered = arrayMove(tickets, oldIndex, newIndex);
      setTickets(reordered);
      setReorderError("");
      try {
        await onReorder(reordered);
      } catch (e: unknown) {
        setReorderError(
          e instanceof Error ? e.message : "Failed to save order"
        );
        // Revert
        setTickets(tickets);
      }
    },
    [tickets, onReorder]
  );

  const handleRenumber = async () => {
    setRenumbering(true);
    setReorderError("");
    try {
      const newSequences = renumberSequences(tickets.map((t) => t.sequence));
      const renumbered = tickets.map((t, i) => ({
        ...t,
        sequence: newSequences[i],
      }));
      setTickets(renumbered);
      await onReorder(renumbered);
    } catch (e: unknown) {
      setReorderError(
        e instanceof Error ? e.message : "Failed to renumber tickets"
      );
    } finally {
      setRenumbering(false);
    }
  };

  const handleInsertAfter = (index: number) => {
    setInsertAfterIndex(index);
  };

  const handleCreateSubmit = async (data: {
    subject: string;
    description: string;
    sequence: string;
  }) => {
    const idx = insertAfterIndex ?? tickets.length - 1;
    const newIssue = await onCreateTicket(
      data.subject,
      data.description,
      data.sequence,
      idx
    );
    const newTicket: FlowTicket = {
      issue: newIssue,
      sequence: data.sequence,
    };
    const updated = [...tickets];
    updated.splice(idx + 1, 0, newTicket);
    setTickets(updated);
    setInsertAfterIndex(null);
  };

  const suggestedSequence = (() => {
    const idx = insertAfterIndex ?? tickets.length - 1;
    if (tickets.length === 0) return "1";
    const afterSeq = tickets[idx]?.sequence ?? "";
    const parts = afterSeq.split("-");
    const last = parts[parts.length - 1];
    const isNum = /^\d+$/.test(last);
    if (isNum) {
      parts[parts.length - 1] = String(parseInt(last, 10) + 1);
      return parts.join("-");
    }
    return afterSeq;
  })();

  return (
    <div>
      {reorderError && (
        <p className="text-red-600 text-sm mb-3" role="alert">
          {reorderError}
        </p>
      )}

      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">
          Drag tickets to reorder. Use <strong>+ Insert</strong> to add a ticket
          at a specific position.
        </p>
        <button
          type="button"
          onClick={handleRenumber}
          disabled={renumbering || tickets.length === 0}
          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 text-white text-sm font-medium transition-colors whitespace-nowrap"
        >
          {renumbering ? "Renumbering…" : "🔢 Renumber"}
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No tickets in this flow yet.</p>
          <button
            type="button"
            onClick={() => setInsertAfterIndex(-1)}
            className="mt-3 text-indigo-600 hover:underline text-sm"
          >
            + Add first ticket
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tickets.map((t) => t.issue.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {tickets.map((ticket, index) => (
                <TicketCard
                  key={ticket.issue.id}
                  issue={ticket.issue}
                  sequence={ticket.sequence}
                  redmineBaseUrl={redmineBaseUrl}
                  onInsertAfter={() => handleInsertAfter(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="mt-4">
        <button
          type="button"
          onClick={() => setInsertAfterIndex(tickets.length - 1)}
          className="text-sm text-indigo-600 hover:underline"
        >
          + Add ticket at end
        </button>
      </div>

      {insertAfterIndex !== null && (
        <CreateTicketModal
          onClose={() => setInsertAfterIndex(null)}
          onSubmit={handleCreateSubmit}
          suggestedSequence={suggestedSequence}
        />
      )}
    </div>
  );
}
