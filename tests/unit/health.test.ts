import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  it("returns the PawPal health payload", async () => {
    expect(await (await GET()).json()).toEqual({
      status: "ok",
      service: "pawpal",
    });
  });
});
