jest.mock("@/src/auth.config", () => ({
  auth: jest.fn(),
}));

jest.mock("../../providers", () => ({
  userRepository: {
    findByTenant: jest.fn(),
  },
}));

import { auth } from "@/src/auth.config";
import { getUserFiltered } from "./get-user-filtered";
import { User } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

const mockedAuth = auth as jest.MockedFunction<typeof auth>;
const mockUserRepository = jest.requireMock("../../providers").userRepository;

describe("getUserFiltered", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns failure when user is not admin", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { role: "user" } } as any);

    const result = await getUserFiltered("tenant-1");

    expect(result).toEqual({
      success: false,
      message: "No es un usuario válido",
    });
    expect(mockUserRepository.findByTenant).not.toHaveBeenCalled();
  });

  it("returns users list when admin calls it", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { role: "admin" } } as any);
    const users = [
      User.fromJson({ id: "1", name: "Alice", email: "alice@test.com" }),
      User.fromJson({ id: "2", name: "Bob", email: "bob@test.com" }),
    ];
    mockUserRepository.findByTenant.mockResolvedValue(Result.success(users));

    const result = await getUserFiltered("tenant-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
    }
  });

  it("returns failure when repository returns an error", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { role: "admin" } } as any);
    mockUserRepository.findByTenant.mockResolvedValue(Result.failure(new Error("DB error")));

    const result = await getUserFiltered("tenant-1");

    expect(result).toEqual({ success: false, message: "DB error" });
  });
});
