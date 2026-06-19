import { getUserAddress } from "./get-user-address";
import { MockUserAddressRepository } from "@/tests/mocks/repositories";
import { UserAddress } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

describe("getUserAddress", () => {
  it("returns empty object when userId is empty", async () => {
    const mockRepo = MockUserAddressRepository();
    const action = getUserAddress(mockRepo);

    const result = await action("");

    expect(result).toEqual({});
  });

  it("returns empty object when repository returns failure", async () => {
    const mockRepo = MockUserAddressRepository({
      findByUserId: async () => Result.failure(new Error("Not found")),
    });

    const action = getUserAddress(mockRepo);
    const result = await action("user-1");

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
    const mockRepo = MockUserAddressRepository({
      findByUserId: async () => Result.success(address),
    });

    const action = getUserAddress(mockRepo);
    const result = await action("user-1");

    expect(result).toHaveProperty("country", "US");
    expect(result).toHaveProperty("first_name", "John");
    expect(result).not.toHaveProperty("country_id");
  });
});
