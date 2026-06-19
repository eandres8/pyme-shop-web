jest.mock("@/src/auth.config", () => ({
  auth: jest.fn(),
}));

import { auth } from "@/src/auth.config";
import { changeUserRoleAction } from "./change-user-role";
import { MockUserRepository } from "@/tests/mocks/repositories";
import { User } from "@/src/core/entities";
import { Result } from "@/src/core/utils";
import { revalidatePath } from "next/cache";

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

const mockedAuth = auth as jest.MockedFunction<typeof auth>;

describe("changeUserRoleAction", () => {
  beforeEach(() => {
    mockedAuth.mockReset();
    (revalidatePath as jest.Mock).mockClear();
  });

  it("returns failure when user is not admin", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { role: "user" } } as any);

    const mockRepo = MockUserRepository();
    const action = changeUserRoleAction(mockRepo);

    const result = await action("some-id", "admin");

    expect(result).toEqual({ success: false, message: "No es un usuario válido" });
  });

  it("returns success with public user data when admin changes role", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { role: "admin" } } as any);

    const updatedUser = User.fromJson({ id: "user-id", name: "Test", email: "test@test.com", role: "admin" });
    const mockRepo = MockUserRepository({
      changeRole: async () => Result.success(updatedUser),
    });

    const action = changeUserRoleAction(mockRepo);
    const result = await action("user-id", "admin");

    expect(result).toEqual({ success: true, data: updatedUser.toPublic() });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/users");
  });

  it("returns failure when repository returns an error", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { role: "admin" } } as any);

    const mockRepo = MockUserRepository({
      changeRole: async () => Result.failure(new Error("Update failed")),
    });

    const action = changeUserRoleAction(mockRepo);
    const result = await action("user-id", "admin");

    expect(result).toEqual({ success: false, message: "Update failed" });
  });
});
