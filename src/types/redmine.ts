export interface RedmineIssue {
  id: number;
  subject: string;
  description: string;
  status: {
    id: number;
    name: string;
  };
  priority: {
    id: number;
    name: string;
  };
  tracker: {
    id: number;
    name: string;
  };
  project: {
    id: number;
    identifier: string;
    name: string;
  };
  parent?: {
    id: number;
  };
  custom_fields?: Array<{
    id: number;
    name: string;
    value: string;
  }>;
  created_on: string;
  updated_on: string;
}

export interface RedmineProject {
  id: number;
  identifier: string;
  name: string;
  description: string;
  status: number;
  created_on: string;
  updated_on: string;
}

export interface RedmineTracker {
  id: number;
  name: string;
}

export interface RedmineIssuePriority {
  id: number;
  name: string;
}

export interface CreateIssuePayload {
  subject: string;
  description?: string;
  tracker_id?: number;
  priority_id?: number;
  parent_issue_id?: number;
  custom_fields?: Array<{ id: number; value: string }>;
}

export interface UpdateIssuePayload {
  subject?: string;
  description?: string;
  custom_fields?: Array<{ id: number; value: string }>;
}

export interface RedmineConfig {
  baseUrl: string;
  apiKey: string;
  projectId: string;
}

/** Ticket numbering position, e.g. "1", "2-a", "1-1-a-3" */
export type TicketSequence = string;
