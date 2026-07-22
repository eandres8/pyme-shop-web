jest.mock("@/src/auth.config", () => ({
  auth: jest.fn(),
}));

import { auth } from "@/src/auth.config";
import { requireSessionTenant } from "./require-session-tenant";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedAuth = auth as jest.MockedFunction<any>;

describe("requireSessionTenant", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the tenant id when present in session", async () => {
    mockedAuth.mockResolvedValue({ user: { tenant: "tenant-1" } });

    await expect(requireSessionTenant()).resolves.toBe("tenant-1");
  });

  it("throws when there is no session", async () => {
    mockedAuth.mockResolvedValue(null);

    await expect(requireSessionTenant()).rejects.toThrow();
  });

  it("throws when the session has no user", async () => {
    mockedAuth.mockResolvedValue({});

    await expect(requireSessionTenant()).rejects.toThrow();
  });

  it("throws when tenant is an empty string", async () => {
    mockedAuth.mockResolvedValue({ user: { tenant: "" } });

    await expect(requireSessionTenant()).rejects.toThrow();
  });

  it("throws when tenant is undefined", async () => {
    mockedAuth.mockResolvedValue({ user: {} });

    await expect(requireSessionTenant()).rejects.toThrow();
  });
});
