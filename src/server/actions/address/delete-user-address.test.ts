jest.mock("../../providers", () => ({
  userAddressRepository: {
    remove: jest.fn(),
  },
}));

import { deleteUserAddress } from "./delete-user-address";
import { UserAddress } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

const mockUserAddressRepository = jest.requireMock("../../providers").userAddressRepository;

describe("deleteUserAddress", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the address JSON when removal succeeds", async () => {
    const address = UserAddress.fromJson({ id: "addr-1", userId: "user-1" });
    mockUserAddressRepository.remove.mockResolvedValue(Result.success(address));

    const result = await deleteUserAddress("user-1");

    expect(result).toEqual(address.toJson());
  });

  it("returns null when removal fails", async () => {
    mockUserAddressRepository.remove.mockResolvedValue(Result.failure(new Error("Not found")));

    const result = await deleteUserAddress("user-1");

    expect(result).toBeNull();
  });
});
