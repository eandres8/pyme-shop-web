jest.mock("@/src/auth.config", () => ({
  auth: jest.fn(),
}));

import { auth } from "@/src/auth.config";
import { getOrderListByUserAction } from "./get-order-list-by-user";
import { MockOrderRepository } from "@/tests/mocks/repositories";
import { Order } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

const mockedAuth = auth as jest.MockedFunction<typeof auth>;

describe("getOrderListByUserAction", () => {
  beforeEach(() => {
    mockedAuth.mockReset();
  });

  it("returns failure when user is not authenticated", async () => {
    mockedAuth.mockResolvedValue(null);

    const mockRepo = MockOrderRepository();
    const action = getOrderListByUserAction(mockRepo);

    const result = await action();

    expect(result).toEqual({ success: false, message: "Usuario no autenticado" });
  });

  it("returns order list for authenticated user", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } } as any);

    const order = Order.fromEntity({ id: "order-1", user_id: "user-1" });
    const mockRepo = MockOrderRepository({
      listOrdersByUser: async () => Result.success([order]),
    });

    const action = getOrderListByUserAction(mockRepo);
    const result = await action();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([order.toJson()]);
    }
  });

  it("returns failure when repository returns an error", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } } as any);

    const mockRepo = MockOrderRepository({
      listOrdersByUser: async () => Result.failure(new Error("DB error")),
    });

    const action = getOrderListByUserAction(mockRepo);
    const result = await action();

    expect(result).toEqual({ success: false, message: "DB error" });
  });
});
