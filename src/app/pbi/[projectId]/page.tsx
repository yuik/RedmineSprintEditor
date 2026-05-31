"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRedmineConfig } from "@/lib/RedmineConfigContext";
import type { RedmineIssue } from "@/types/redmine";

export default function PBIPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const { config } = useRedmineConfig();

  const [issues, setIssues] = useState<RedmineIssue[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!config) {
      router.replace("/");
      return;
    }

    // Fetch PBI tracker issues – by convention, tracker_id=2 is "Feature" which
    // acts as PBI. In a real project you can configure the tracker ID.
    const url = `/api/projects/${encodeURIComponent(params.projectId)}/issues?baseUrl=${encodeURIComponent(config.baseUrl)}&apiKey=${encodeURIComponent(config.apiKey)}&tracker_id=2`;
    fetch(url)
      .then((r) => {
        if (!r.ok) return r.json().then((b) => Promise.reject(new Error(b.error ?? `HTTP ${r.status}`)));
        return r.json();
      })
      .then((data: RedmineIssue[]) => setIssues(data))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [config, params.projectId, router]);

  if (loading) return <p className="text-gray-500">Loading PBI list…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Product Backlog Items</h1>
        <a
          href={`/dashboard/${encodeURIComponent(params.projectId)}`}
          className="text-indigo-600 hover:underline text-sm"
        >
          ← Dashboard
        </a>
      </div>

      {issues.length === 0 ? (
        <p className="text-gray-500">No PBI tickets found for this project.</p>
      ) : (
        <ul className="space-y-3">
          {issues.map((issue) => (
            <li
              key={issue.id}
              className="bg-white rounded-xl shadow p-4 flex items-start gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-indigo-600 bg-indigo-50 rounded px-1.5 py-0.5">
                    #{issue.id}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {issue.status.name}
                  </span>
                </div>
                <p className="font-medium truncate">{issue.subject}</p>
                {issue.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {issue.description}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 items-end shrink-0">
                <a
                  href={`${config?.baseUrl}/issues/${issue.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 hover:underline whitespace-nowrap"
                >
                  Open in Redmine ↗
                </a>
                <a
                  href={`/flow/${encodeURIComponent(params.projectId)}/${issue.id}`}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded px-2 py-1 whitespace-nowrap transition-colors"
                >
                  View Flow
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
