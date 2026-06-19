jest.mock("@/src/auth.config", () => ({
  auth: jest.fn(),
}));

import { auth } from "@/src/auth.config";
import { getUserFilteredAction } from "./get-user-filtered";
import { MockUserRepository } from "@/tests/mocks/repositories";
import { User } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

const mockedAuth = auth as jest.MockedFunction<typeof auth>;

describe("getUserFilteredAction", () => {
  beforeEach(() => {
    mockedAuth.mockReset();
  });

  it("returns failure when user is not admin", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { role: "user" } } as any);

    const mockRepo = MockUserRepository();
    const action = getUserFilteredAction(mockRepo);

    const result = await action("tenant-1");

    expect(result).toEqual({ success: false, message: "No es un usuario válido" });
  });

  it("returns users list when admin calls it", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { role: "admin" } } as any);

    const user = User.fromJson({ id: "user-1", name: "Test", email: "test@test.com" });
    const mockRepo = MockUserRepository({
      findByTenant: async () => Result.success([user]),
    });

    const action = getUserFilteredAction(mockRepo);
    const result = await action("tenant-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([user.toPublic()]);
    }
  });

  it("returns failure when repository returns an error", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { role: "admin" } } as any);

    const mockRepo = MockUserRepository({
      findByTenant: async () => Result.failure(new Error("DB error")),
    });

    const action = getUserFilteredAction(mockRepo);
    const result = await action("tenant-1");

    expect(result).toEqual({ success: false, message: "DB error" });
  });
});
