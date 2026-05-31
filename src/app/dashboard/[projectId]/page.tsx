"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRedmineConfig } from "@/lib/RedmineConfigContext";
import type { RedmineProject } from "@/types/redmine";

export default function DashboardPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const { config } = useRedmineConfig();

  const [project, setProject] = useState<RedmineProject | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!config) {
      router.replace("/");
      return;
    }

    const url = `/api/projects/${encodeURIComponent(params.projectId)}?baseUrl=${encodeURIComponent(config.baseUrl)}&apiKey=${encodeURIComponent(config.apiKey)}`;
    fetch(url)
      .then((r) => {
        if (!r.ok) return r.json().then((b) => Promise.reject(new Error(b.error ?? `HTTP ${r.status}`)));
        return r.json();
      })
      .then((data: RedmineProject) => setProject(data))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [config, params.projectId, router]);

  if (loading) return <p className="text-gray-500">Loading project…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!project) return null;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">{project.name}</h1>
      <p className="text-gray-500 mb-6">{project.description}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href={`/pbi/${encodeURIComponent(params.projectId)}`}
          className="block bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow border border-transparent hover:border-indigo-300"
        >
          <h2 className="font-semibold text-xl mb-1">PBI List</h2>
          <p className="text-gray-500 text-sm">
            View all Product Backlog Items and their Redmine links.
          </p>
        </a>
      </div>
    </div>
  );
}
