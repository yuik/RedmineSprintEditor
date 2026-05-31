import { NextRequest, NextResponse } from "next/server";
import { RedmineClient } from "@/lib/redmine";
import type { UpdateIssuePayload } from "@/types/redmine";

export async function GET(
  req: NextRequest,
  { params }: { params: { issueId: string } }
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

  try {
    const client = new RedmineClient(baseUrl, apiKey);
    const issue = await client.getIssue(Number(params.issueId));
    return NextResponse.json(issue);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { issueId: string } }
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

  const payload: UpdateIssuePayload = await req.json();

  try {
    const client = new RedmineClient(baseUrl, apiKey);
    await client.updateIssue(Number(params.issueId), payload);
    return new NextResponse(null, { status: 204 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
