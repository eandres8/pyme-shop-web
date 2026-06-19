jest.mock("@/src/auth.config", () => ({
  auth: jest.fn(),
}));

import { auth } from "@/src/auth.config";
import { getPaginatedOrdersAction } from "./get-paginated-orders";
import { MockOrderRepository } from "@/tests/mocks/repositories";
import { Order } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

const mockedAuth = auth as jest.MockedFunction<typeof auth>;

describe("getPaginatedOrdersAction", () => {
  beforeEach(() => {
    mockedAuth.mockReset();
  });

  it("returns failure when user is not admin", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { role: "user" } } as any);

    const mockRepo = MockOrderRepository();
    const action = getPaginatedOrdersAction(mockRepo);

    const result = await action();

    expect(result).toEqual({ success: false, message: "No es un usuario válido" });
  });

  it("returns order list when user is admin", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { role: "admin" } } as any);

    const order = Order.fromEntity({ id: "order-1", user_id: "user-1" });
    const mockRepo = MockOrderRepository({
      listOrders: async () => Result.success([order]),
    });

    const action = getPaginatedOrdersAction(mockRepo);
    const result = await action();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([order.toJson()]);
    }
  });

  it("returns failure when repository returns an error", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { role: "admin" } } as any);

    const mockRepo = MockOrderRepository({
      listOrders: async () => Result.failure(new Error("DB error")),
    });

    const action = getPaginatedOrdersAction(mockRepo);
    const result = await action();

    expect(result).toEqual({ success: false, message: "DB error" });
  });
});
