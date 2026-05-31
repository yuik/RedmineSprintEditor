"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRedmineConfig } from "@/lib/RedmineConfigContext";

export default function HomePage() {
  const router = useRouter();
  const { setConfig } = useRedmineConfig();

  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [projectId, setProjectId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `/api/projects/${encodeURIComponent(projectId)}?baseUrl=${encodeURIComponent(baseUrl)}&apiKey=${encodeURIComponent(apiKey)}`
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      setConfig({ baseUrl, apiKey, projectId });
      router.push(`/dashboard/${encodeURIComponent(projectId)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-12">
      <h1 className="text-3xl font-bold mb-2">Connect to Redmine</h1>
      <p className="text-gray-600 mb-8">
        Enter your Redmine server details to start managing your sprint.
      </p>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-8 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="baseUrl">
            Redmine URL
          </label>
          <input
            id="baseUrl"
            type="url"
            required
            placeholder="https://your-redmine.example.com"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="apiKey">
            API Key
          </label>
          <input
            id="apiKey"
            type="password"
            required
            placeholder="Your Redmine API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="projectId"
          >
            Project ID or Identifier
          </label>
          <input
            id="projectId"
            type="text"
            required
            placeholder="my-project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold rounded-lg px-4 py-2 transition-colors"
        >
          {loading ? "Connecting…" : "Connect"}
        </button>
      </form>
    </div>
  );
}
