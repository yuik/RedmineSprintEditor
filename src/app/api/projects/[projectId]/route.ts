import { NextRequest, NextResponse } from "next/server";
import { RedmineClient } from "@/lib/redmine";

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

  try {
    const client = new RedmineClient(baseUrl, apiKey);
    const project = await client.getProject(params.projectId);
    return NextResponse.json(project);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
