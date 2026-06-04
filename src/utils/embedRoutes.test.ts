import { describe, expect, it } from "vitest";
import { embedRoute, parseEmbedRoute } from "./embedRoutes";

describe("embed routes", () => {
  it("parses supported embed routes and encoded ids", () => {
    expect(parseEmbedRoute("/embed/country/USA")).toEqual({ kind: "country", id: "USA" });
    expect(parseEmbedRoute("/embed/exposure/openai--market_access--eu-ai-act-regional")).toEqual({
      kind: "exposure",
      id: "openai--market_access--eu-ai-act-regional",
    });
    expect(embedRoute("obligation", "ca-sb-53-incident-reporting")).toBe(
      "/embed/obligation/ca-sb-53-incident-reporting"
    );
  });

  it("rejects unsupported embed routes", () => {
    expect(parseEmbedRoute("/embed/nope/USA")).toBeNull();
    expect(parseEmbedRoute("/country/USA")).toBeNull();
  });
});
