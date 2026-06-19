import { deleteUserAddress } from "./delete-user-address";
import { MockUserAddressRepository } from "@/tests/mocks/repositories";
import { UserAddress } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

describe("deleteUserAddress", () => {
  it("returns the address JSON when removal succeeds", async () => {
    const address = UserAddress.fromJson({ id: "addr-1", userId: "user-1" });
    const mockRepo = MockUserAddressRepository({
      remove: async () => Result.success(address),
    });

    const action = deleteUserAddress(mockRepo);
    const result = await action("user-1");

    expect(result).toEqual(address.toJson());
  });

  it("returns null when removal fails", async () => {
    const mockRepo = MockUserAddressRepository({
      remove: async () => Result.failure(new Error("Not found")),
    });

    const action = deleteUserAddress(mockRepo);
    const result = await action("user-1");

    expect(result).toBeNull();
  });
});
