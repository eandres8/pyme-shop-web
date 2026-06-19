jest.mock("@/src/auth.config", () => ({
  auth: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("../../providers", () => ({
  userRepository: {
    changeRole: jest.fn(),
  },
}));

import { auth } from "@/src/auth.config";
import { changeUserRole } from "./change-user-role";
import { User } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

const mockedAuth = auth as jest.MockedFunction<typeof auth>;
const mockUserRepository = jest.requireMock("../../providers").userRepository;

const publicUser = User.fromJson({
  id: "user-1",
  name: "Test",
  email: "test@test.com",
  role: "user",
});

describe("changeUserRole", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns failure when user is not admin", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { role: "user" } } as any);

    const result = await changeUserRole("some-id", "admin");

    expect(result).toEqual({
      success: false,
      message: "No es un usuario válido",
    });
    expect(mockUserRepository.changeRole).not.toHaveBeenCalled();
  });

  it("returns success with public user data when admin changes role", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { role: "admin" } } as any);
    mockUserRepository.changeRole.mockResolvedValue(Result.success(publicUser));

    const result = await changeUserRole("user-id", "admin");

    expect(result).toEqual({ success: true, data: publicUser.toPublic() });
  });

  it("returns failure when repository returns an error", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { role: "admin" } } as any);
    mockUserRepository.changeRole.mockResolvedValue(Result.failure(new Error("Update failed")));

    const result = await changeUserRole("user-id", "admin");

    expect(result).toEqual({ success: false, message: "Update failed" });
  });
});
