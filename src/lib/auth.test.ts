import { describe, expect, it } from "vitest";
import { canWrite } from "./auth";

describe("workspace authorization", () => {
  it("allows write access only for owner, admin, and developer roles", () => {
    expect(canWrite("owner")).toBe(true);
    expect(canWrite("admin")).toBe(true);
    expect(canWrite("developer")).toBe(true);
    expect(canWrite("viewer")).toBe(false);
  });
});
