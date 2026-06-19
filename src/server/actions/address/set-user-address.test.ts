import { setUserAddress } from "./set-user-address";
import { MockUserAddressRepository } from "@/tests/mocks/repositories";
import { UserAddress } from "@/src/core/entities";
import { Result } from "@/src/core/utils";
import type { TFormUserAddress } from "@/src/core/types";

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

describe("setUserAddressAction", () => {
  it("calls create when user has no existing address", async () => {
    const createMock = jest.fn(async (address: UserAddress) => Result.success(address));

    const mockRepo = MockUserAddressRepository({
      findByUserId: async () => Result.success(UserAddress.fromJson({ id: "" })),
      create: createMock,
    });

    const action = setUserAddress(mockRepo);
    const result = await action(mockAddress, "user-1");

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
  });

  it("calls update when user already has an address", async () => {
    const updateMock = jest.fn(async (address: UserAddress) => Result.success(address));

    const mockRepo = MockUserAddressRepository({
      findByUserId: async () => Result.success(UserAddress.fromJson({ id: "addr-1" })),
      update: updateMock,
    });

    const action = setUserAddress(mockRepo);
    const result = await action(mockAddress, "user-1");

    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
  });

  it("throws when findByUserId returns an error", async () => {
    const mockRepo = MockUserAddressRepository({
      findByUserId: async () => Result.failure(new Error("DB error")),
    });

    const action = setUserAddress(mockRepo);

    await expect(action(mockAddress, "user-1")).rejects.toThrow("DB error");
  });

  it("returns failure when create returns an error", async () => {
    const mockRepo = MockUserAddressRepository({
      findByUserId: async () => Result.success(UserAddress.fromJson({ id: "" })),
      create: async () => Result.failure(new Error("Create failed")),
    });

    const action = setUserAddress(mockRepo);
    const result = await action(mockAddress, "user-1");

    expect(result.success).toBe(false);
    expect(result).toHaveProperty("message", "Create failed");
  });

  it("returns failure when update returns an error", async () => {
    const mockRepo = MockUserAddressRepository({
      findByUserId: async () => Result.success(UserAddress.fromJson({ id: "addr-1" })),
      update: async () => Result.failure(new Error("Update failed")),
    });

    const action = setUserAddress(mockRepo);
    const result = await action(mockAddress, "user-1");

    expect(result.success).toBe(false);
    expect(result).toHaveProperty("message", "Update failed");
  });
});
