"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRedmineConfig } from "@/lib/RedmineConfigContext";
import TicketFlow, { type FlowTicket } from "@/components/TicketFlow";
import type { RedmineIssue } from "@/types/redmine";

/** Extracts the sequence tag from a ticket subject.
 *  Convention: subject starts with "[<sequence>] " e.g. "[2-a] Implement login"
 */
function parseSubjectSequence(subject: string): {
  sequence: string;
  title: string;
} {
  const match = subject.match(/^\[([^\]]+)\]\s+(.+)/);
  if (match) return { sequence: match[1], title: match[2] };
  return { sequence: "", title: subject };
}

/** Builds a subject string that embeds the sequence tag. */
function buildSubjectWithSequence(sequence: string, title: string): string {
  return sequence ? `[${sequence}] ${title}` : title;
}

export default function FlowPage() {
  const params = useParams<{ projectId: string; pbiId: string }>();
  const router = useRouter();
  const { config } = useRedmineConfig();

  const [pbi, setPbi] = useState<RedmineIssue | null>(null);
  const [flowTickets, setFlowTickets] = useState<FlowTicket[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const apiBase = `/api/projects/${encodeURIComponent(params.projectId)}/issues`;
  const authParams = config
    ? `baseUrl=${encodeURIComponent(config.baseUrl)}&apiKey=${encodeURIComponent(config.apiKey)}`
    : "";

  useEffect(() => {
    if (!config) {
      router.replace("/");
      return;
    }

    const fetchData = async () => {
      try {
        // Load PBI issue
        const pbiRes = await fetch(
          `/api/issues/${params.pbiId}?${authParams}`
        );
        if (!pbiRes.ok) throw new Error(`HTTP ${pbiRes.status}`);
        const pbiData: RedmineIssue = await pbiRes.json();
        setPbi(pbiData);

        // Load child issues
        const childRes = await fetch(
          `${apiBase}?${authParams}&parent_id=${params.pbiId}`
        );
        if (!childRes.ok) throw new Error(`HTTP ${childRes.status}`);
        const children: RedmineIssue[] = await childRes.json();

        const tickets: FlowTicket[] = children.map((issue) => {
          const { sequence } = parseSubjectSequence(issue.subject);
          return { issue, sequence: sequence || String(issue.id) };
        });

        // Sort by sequence string for initial display
        tickets.sort((a, b) => a.sequence.localeCompare(b.sequence));
        setFlowTickets(tickets);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, params.pbiId, params.projectId]);

  const handleCreateTicket = async (
    subject: string,
    description: string,
    sequence: string,
    _insertAfterIndex: number
  ): Promise<RedmineIssue> => {
    const fullSubject = buildSubjectWithSequence(sequence, subject);
    const res = await fetch(
      `${apiBase}?${authParams}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: fullSubject,
          description,
          parent_issue_id: Number(params.pbiId),
        }),
      }
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `HTTP ${res.status}`);
    }
    return res.json();
  };

  const handleReorder = async (tickets: FlowTicket[]) => {
    // Update each ticket's subject to embed its new sequence.
    const updates = tickets.map(async (t) => {
      const { title } = parseSubjectSequence(t.issue.subject);
      const newSubject = buildSubjectWithSequence(t.sequence, title);
      if (newSubject === t.issue.subject) return; // No change
      await fetch(
        `/api/issues/${t.issue.id}?${authParams}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject: newSubject }),
        }
      );
    });
    await Promise.all(updates);
  };

  if (loading) return <p className="text-gray-500">Loading flow…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <a
            href={`/pbi/${encodeURIComponent(params.projectId)}`}
            className="text-indigo-600 hover:underline text-sm"
          >
            ← PBI List
          </a>
          <h1 className="text-2xl font-bold mt-1">
            Flow: {pbi?.subject ?? `PBI #${params.pbiId}`}
          </h1>
          {pbi?.description && (
            <p className="text-gray-500 text-sm mt-1">{pbi.description}</p>
          )}
        </div>
        {pbi && config && (
          <a
            href={`${config.baseUrl}/issues/${pbi.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-600 hover:underline whitespace-nowrap"
          >
            Open PBI in Redmine ↗
          </a>
        )}
      </div>

      <div className="mt-6">
        <TicketFlow
          initialTickets={flowTickets}
          redmineBaseUrl={config?.baseUrl ?? ""}
          onCreateTicket={handleCreateTicket}
          onReorder={handleReorder}
        />
      </div>
    </div>
  );
}
