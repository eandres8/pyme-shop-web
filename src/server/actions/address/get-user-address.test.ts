jest.mock("../../providers", () => ({
  userAddressRepository: {
    findByUserId: jest.fn(),
  },
}));

import { getUserAddress } from "./get-user-address";
import { UserAddress } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

const mockUserAddressRepository = jest.requireMock("../../providers").userAddressRepository;

describe("getUserAddress", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns empty object when userId is empty", async () => {
    const result = await getUserAddress("");

    expect(result).toEqual({});
    expect(mockUserAddressRepository.findByUserId).not.toHaveBeenCalled();
  });

  it("returns empty object when repository returns failure", async () => {
    mockUserAddressRepository.findByUserId.mockResolvedValue(
      Result.failure(new Error("Not found")),
    );

    const result = await getUserAddress("user-1");

    expect(result).toEqual({});
  });

  it("returns address with country field when found", async () => {
    const address = UserAddress.fromJson({
      id: "addr-1",
      firstName: "John",
      lastName: "Doe",
      address: "123 Main St",
      city: "NYC",
      countryId: "US",
      phone: "555-0100",
      userId: "user-1",
    });
    mockUserAddressRepository.findByUserId.mockResolvedValue(Result.success(address));

    const result = await getUserAddress("user-1");

    expect(result).toHaveProperty("country", "US");
    expect(result).toHaveProperty("first_name", "John");
    expect(result).not.toHaveProperty("country_id");
  });
});
