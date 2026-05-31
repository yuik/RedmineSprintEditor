"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { RedmineIssue } from "@/types/redmine";

interface TicketCardProps {
  issue: RedmineIssue;
  sequence: string;
  redmineBaseUrl: string;
  onInsertAfter: () => void;
}

export default function TicketCard({
  issue,
  sequence,
  redmineBaseUrl,
  onInsertAfter,
}: TicketCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: issue.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-xl shadow p-4 flex items-start gap-3 border border-transparent hover:border-indigo-200 transition-colors"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 select-none"
        aria-label="Drag to reorder"
      >
        ⠿
      </button>

      {/* Sequence badge */}
      <span className="shrink-0 font-mono text-xs bg-indigo-50 text-indigo-700 rounded px-2 py-1 mt-0.5">
        {sequence}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs text-gray-400">#{issue.id}</span>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
            {issue.status.name}
          </span>
        </div>
        <p className="font-medium text-sm leading-snug">{issue.subject}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1 items-end shrink-0">
        <a
          href={`${redmineBaseUrl}/issues/${issue.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-600 hover:underline whitespace-nowrap"
        >
          Open ↗
        </a>
        <button
          type="button"
          onClick={onInsertAfter}
          title="Insert ticket after this one"
          className="text-xs text-green-600 hover:text-green-800 whitespace-nowrap"
        >
          + Insert
        </button>
      </div>
    </div>
  );
}
