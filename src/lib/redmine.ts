import type {
  RedmineIssue,
  RedmineProject,
  RedmineTracker,
  RedmineIssuePriority,
  CreateIssuePayload,
  UpdateIssuePayload,
} from "@/types/redmine";

export class RedmineClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    // Trim trailing slashes for consistent URL construction.
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.apiKey = apiKey;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": this.apiKey,
        ...(options.headers ?? {}),
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Redmine API error ${res.status} ${res.statusText}: ${text}`
      );
    }

    return res.json() as Promise<T>;
  }

  /** Fetch project details. */
  async getProject(projectId: string): Promise<RedmineProject> {
    const data = await this.request<{ project: RedmineProject }>(
      `/projects/${projectId}.json`
    );
    return data.project;
  }

  /** Fetch all issues for a project. */
  async getIssues(
    projectId: string,
    params: Record<string, string> = {}
  ): Promise<RedmineIssue[]> {
    const query = new URLSearchParams({ project_id: projectId, limit: "100", ...params });
    const data = await this.request<{ issues: RedmineIssue[] }>(
      `/issues.json?${query}`
    );
    return data.issues;
  }

  /** Fetch issues that are PBIs (Product Backlog Items). */
  async getPBIIssues(projectId: string, pbiTrackerId: number): Promise<RedmineIssue[]> {
    return this.getIssues(projectId, { tracker_id: String(pbiTrackerId) });
  }

  /** Fetch child issues for a given parent issue. */
  async getChildIssues(parentIssueId: number): Promise<RedmineIssue[]> {
    const data = await this.request<{ issues: RedmineIssue[] }>(
      `/issues.json?parent_id=${parentIssueId}&limit=100`
    );
    return data.issues;
  }

  /** Fetch a single issue by ID. */
  async getIssue(issueId: number): Promise<RedmineIssue> {
    const data = await this.request<{ issue: RedmineIssue }>(
      `/issues/${issueId}.json`
    );
    return data.issue;
  }

  /** Create a new issue in the project. */
  async createIssue(
    projectId: string,
    payload: CreateIssuePayload
  ): Promise<RedmineIssue> {
    const data = await this.request<{ issue: RedmineIssue }>("/issues.json", {
      method: "POST",
      body: JSON.stringify({ issue: { ...payload, project_id: projectId } }),
    });
    return data.issue;
  }

  /** Update an existing issue. */
  async updateIssue(
    issueId: number,
    payload: UpdateIssuePayload
  ): Promise<void> {
    await this.request(`/issues/${issueId}.json`, {
      method: "PUT",
      body: JSON.stringify({ issue: payload }),
    });
  }

  /** Fetch available trackers. */
  async getTrackers(): Promise<RedmineTracker[]> {
    const data = await this.request<{ trackers: RedmineTracker[] }>(
      "/trackers.json"
    );
    return data.trackers;
  }

  /** Fetch issue priorities. */
  async getIssuePriorities(): Promise<RedmineIssuePriority[]> {
    const data = await this.request<{
      issue_priorities: RedmineIssuePriority[];
    }>("/enumerations/issue_priorities.json");
    return data.issue_priorities;
  }
}
