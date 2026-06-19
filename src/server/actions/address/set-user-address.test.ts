jest.mock("../../providers", () => ({
  userAddressRepository: {
    findByUserId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

import { setUserAddress } from "./set-user-address";
import { UserAddress } from "@/src/core/entities";
import { Result } from "@/src/core/utils";
import type { TFormUserAddress } from "@/src/core/types";

const mockUserAddressRepository = jest.requireMock("../../providers").userAddressRepository;

const mockAddress: TFormUserAddress = {
  firstName: "John",
  lastName: "Doe",
  address: "123 Main St",
  addressInfo: "",
  postalCode: "12345",
  city: "NYC",
  country: "US",
  phone: "555-0100",
};

describe("setUserAddress", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls create when user has no existing address", async () => {
    mockUserAddressRepository.findByUserId.mockResolvedValue(
      Result.success(UserAddress.fromJson({ id: "" })),
    );
    mockUserAddressRepository.create.mockResolvedValue(
      Result.success(UserAddress.fromJson({ id: "new-addr" })),
    );

    const result = await setUserAddress(mockAddress, "user-1");

    expect(mockUserAddressRepository.create).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
  });

  it("calls update when user already has an address", async () => {
    mockUserAddressRepository.findByUserId.mockResolvedValue(
      Result.success(UserAddress.fromJson({ id: "addr-1" })),
    );
    mockUserAddressRepository.update.mockResolvedValue(
      Result.success(UserAddress.fromJson({ id: "addr-1" })),
    );

    const result = await setUserAddress(mockAddress, "user-1");

    expect(mockUserAddressRepository.update).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
  });

  it("throws when findByUserId returns an error", async () => {
    mockUserAddressRepository.findByUserId.mockResolvedValue(
      Result.failure(new Error("DB error")),
    );

    await expect(setUserAddress(mockAddress, "user-1")).rejects.toThrow("DB error");
  });

  it("returns failure when create returns an error", async () => {
    mockUserAddressRepository.findByUserId.mockResolvedValue(
      Result.success(UserAddress.fromJson({ id: "" })),
    );
    mockUserAddressRepository.create.mockResolvedValue(
      Result.failure(new Error("Create failed")),
    );

    const result = await setUserAddress(mockAddress, "user-1");

    expect(result.success).toBe(false);
    expect(result).toHaveProperty("message", "Create failed");
  });

  it("returns failure when update returns an error", async () => {
    mockUserAddressRepository.findByUserId.mockResolvedValue(
      Result.success(UserAddress.fromJson({ id: "addr-1" })),
    );
    mockUserAddressRepository.update.mockResolvedValue(
      Result.failure(new Error("Update failed")),
    );

    const result = await setUserAddress(mockAddress, "user-1");

    expect(result.success).toBe(false);
    expect(result).toHaveProperty("message", "Update failed");
  });
});
