import { NextRequest, NextResponse } from "next/server";
import { RedmineClient } from "@/lib/redmine";
import type { CreateIssuePayload } from "@/types/redmine";

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const { searchParams } = req.nextUrl;
  const baseUrl = searchParams.get("baseUrl");
  const apiKey = searchParams.get("apiKey");

  if (!baseUrl || !apiKey) {
    return NextResponse.json(
      { error: "baseUrl and apiKey query params are required" },
      { status: 400 }
    );
  }

  const extraParams: Record<string, string> = {};
  const trackerId = searchParams.get("tracker_id");
  if (trackerId) extraParams.tracker_id = trackerId;
  const parentId = searchParams.get("parent_id");
  if (parentId) extraParams.parent_id = parentId;

  try {
    const client = new RedmineClient(baseUrl, apiKey);
    const issues = await client.getIssues(params.projectId, extraParams);
    return NextResponse.json(issues);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const { searchParams } = req.nextUrl;
  const baseUrl = searchParams.get("baseUrl");
  const apiKey = searchParams.get("apiKey");

  if (!baseUrl || !apiKey) {
    return NextResponse.json(
      { error: "baseUrl and apiKey query params are required" },
      { status: 400 }
    );
  }

  const payload: CreateIssuePayload = await req.json();

  try {
    const client = new RedmineClient(baseUrl, apiKey);
    const issue = await client.createIssue(params.projectId, payload);
    return NextResponse.json(issue, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
