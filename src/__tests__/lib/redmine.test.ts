import { RedmineClient } from "@/lib/redmine";
import type { RedmineIssue, RedmineProject } from "@/types/redmine";

const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockOk(body: unknown) {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as Response);
}

function mockError(status: number, text = "") {
  return Promise.resolve({
    ok: false,
    status,
    statusText: "Error",
    json: () => Promise.resolve({ errors: [text] }),
    text: () => Promise.resolve(text),
  } as Response);
}

describe("RedmineClient", () => {
  const baseUrl = "https://redmine.example.com";
  const apiKey = "test-api-key";
  let client: RedmineClient;

  beforeEach(() => {
    client = new RedmineClient(baseUrl, apiKey);
    mockFetch.mockReset();
  });

  describe("constructor", () => {
    it("trims trailing slash from baseUrl", async () => {
      const c = new RedmineClient("https://redmine.example.com/", apiKey);
      mockFetch.mockReturnValue(mockOk({ project: { id: 1, identifier: "test", name: "Test" } }));
      await c.getProject("test");
      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toBe("https://redmine.example.com/projects/test.json");
    });
  });

  describe("getProject", () => {
    it("calls the correct endpoint", async () => {
      const project: Partial<RedmineProject> = { id: 1, identifier: "myproject", name: "My Project" };
      mockFetch.mockReturnValue(mockOk({ project }));

      const result = await client.getProject("myproject");

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/projects/myproject.json`,
        expect.objectContaining({
          headers: expect.objectContaining({ "X-Redmine-API-Key": apiKey }),
        })
      );
      expect(result).toEqual(project);
    });

    it("throws on non-ok response", async () => {
      mockFetch.mockReturnValue(mockError(404, "Not Found"));
      await expect(client.getProject("missing")).rejects.toThrow("404");
    });
  });

  describe("getIssues", () => {
    it("fetches issues with project_id param", async () => {
      const issues: Partial<RedmineIssue>[] = [
        { id: 1, subject: "Issue 1" },
        { id: 2, subject: "Issue 2" },
      ];
      mockFetch.mockReturnValue(mockOk({ issues }));

      const result = await client.getIssues("myproject");

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain("project_id=myproject");
      expect(result).toEqual(issues);
    });

    it("appends extra params", async () => {
      mockFetch.mockReturnValue(mockOk({ issues: [] }));
      await client.getIssues("myproject", { tracker_id: "2" });

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain("tracker_id=2");
    });
  });

  describe("createIssue", () => {
    it("posts to /issues.json with correct body", async () => {
      const issue: Partial<RedmineIssue> = { id: 10, subject: "New Issue" };
      mockFetch.mockReturnValue(mockOk({ issue }));

      const result = await client.createIssue("myproject", {
        subject: "New Issue",
        description: "desc",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/issues.json`,
        expect.objectContaining({ method: "POST" })
      );
      const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
      expect(body.issue.project_id).toBe("myproject");
      expect(body.issue.subject).toBe("New Issue");
      expect(result).toEqual(issue);
    });
  });

  describe("updateIssue", () => {
    it("sends PUT to /issues/:id.json", async () => {
      mockFetch.mockReturnValue(mockOk({}));

      await client.updateIssue(42, { subject: "Updated" });

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/issues/42.json`,
        expect.objectContaining({ method: "PUT" })
      );
      const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
      expect(body.issue.subject).toBe("Updated");
    });
  });

  describe("getTrackers", () => {
    it("returns trackers", async () => {
      const trackers = [{ id: 1, name: "Bug" }, { id: 2, name: "Feature" }];
      mockFetch.mockReturnValue(mockOk({ trackers }));

      const result = await client.getTrackers();
      expect(result).toEqual(trackers);
    });
  });
});
