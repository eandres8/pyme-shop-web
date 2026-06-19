jest.mock("../../providers", () => ({
  userRepository: {
    create: jest.fn(),
    findByEmail: jest.fn(),
  },
}));

import { registerUser } from "./register";
import { User } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

const mockUserRepository = jest.requireMock("../../providers").userRepository;

describe("registerUser", () => {
  const validUser = { name: "Test", email: "test@test.com", password: "123456" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns success with public user data when repository succeeds", async () => {
    const user = User.fromJson({ ...validUser, id: "test-uuid" }).cipherPass();
    mockUserRepository.create.mockResolvedValue(Result.success(user));

    const result = await registerUser(validUser);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("test@test.com");
    }
  });

  it("returns failure when repository returns an error", async () => {
    mockUserRepository.create.mockResolvedValue(Result.failure(new Error("DB error")));

    const result = await registerUser(validUser);

    expect(result).toEqual({
      success: false,
      message: "No se pudo crear el usuario",
    });
  });
});
