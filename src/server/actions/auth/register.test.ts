import { registerUserAction } from "./register";
import { MockUserRepository } from "@/tests/mocks/repositories";
import { Result } from "@/src/core/utils";

describe("registerUserAction", () => {
  const validUser = { name: "Test", email: "test@test.com", password: "123456" };

  it("returns success with public user data when repository succeeds", async () => {
    const mockRepo = MockUserRepository({
      create: async (user) => Result.success(user),
    });

    const action = registerUserAction(mockRepo);
    const result = await action(validUser);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("test@test.com");
    }
  });

  it("returns failure when repository returns an error", async () => {
    const mockRepo = MockUserRepository({
      create: async () => Result.failure(new Error("DB error")),
    });

    const action = registerUserAction(mockRepo);
    const result = await action(validUser);

    expect(result).toEqual({
      success: false,
      message: "No se pudo crear el usuario",
    });
  });
});
