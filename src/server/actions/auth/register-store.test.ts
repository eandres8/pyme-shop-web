jest.mock("../../providers", () => ({
  userRepository: {
    create: jest.fn(),
  },
  tenantRepository: {
    createWithAdmin: jest.fn(),
  },
}));

import { registerUserStore } from "./register-store";
import { User } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

const mockUserRepository = jest.requireMock("../../providers").userRepository;
const mockTenantRepository = jest.requireMock("../../providers").tenantRepository;

const baseData = {
  name: "Owner",
  email: "owner@example.com",
  password: "secret",
  storeaddress: "Calle 1",
  storephone: "3000000000",
};

describe("registerUserStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects a store whose slug is a reserved keyword", async () => {
    // BACKLIST_KEY_WORDS in the test env includes "admin".
    const result = await registerUserStore({ ...baseData, storename: "admin" });

    expect(result.success).toBe(false);
    expect(mockUserRepository.create).not.toHaveBeenCalled();
    expect(mockTenantRepository.createWithAdmin).not.toHaveBeenCalled();
  });

  it("creates the user and store when the slug is allowed", async () => {
    const user = User.fromJson({ id: "user-1", email: "owner@example.com" });
    mockUserRepository.create.mockResolvedValue(Result.success(user));
    mockTenantRepository.createWithAdmin.mockResolvedValue(Result.success({}));

    const result = await registerUserStore({ ...baseData, storename: "Mi Tienda" });

    expect(result.success).toBe(true);
    expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
    expect(mockTenantRepository.createWithAdmin).toHaveBeenCalledTimes(1);
    // slug is derived from the store name.
    const [tenantArg] = mockTenantRepository.createWithAdmin.mock.calls[0];
    expect(tenantArg.slug).toBe("mi-tienda");
  });
});
