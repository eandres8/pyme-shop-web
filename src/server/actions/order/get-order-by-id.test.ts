jest.mock("@/src/auth.config", () => ({
  auth: jest.fn(),
}));

import { auth } from "@/src/auth.config";
import { getOrderByIdAction } from "./get-order-by-id";
import { MockOrderRepository } from "@/tests/mocks/repositories";
import { Order } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

const mockedAuth = auth as jest.MockedFunction<typeof auth>;

describe("getOrderByIdAction", () => {
  beforeEach(() => {
    mockedAuth.mockReset();
  });

  it("returns failure when user is not authenticated", async () => {
    mockedAuth.mockResolvedValue(null);

    const mockRepo = MockOrderRepository();
    const action = getOrderByIdAction(mockRepo);

    const result = await action("order-1");

    expect(result).toEqual({ success: false, message: "Usuario no autenticado" });
  });

  it("returns order detail when authenticated user owns the order", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { id: "user-1", role: "user" } } as any);

    const order = Order.fromEntity({ id: "order-1", user_id: "user-1" });
    const mockRepo = MockOrderRepository({
      getById: async () => Result.success(order),
    });

    const action = getOrderByIdAction(mockRepo);
    const result = await action("order-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(order.toFormData());
    }
  });

  it("throws when non-owner user tries to access order", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { id: "user-2", role: "user" } } as any);

    const order = Order.fromEntity({ id: "order-1", user_id: "user-1" });
    const mockRepo = MockOrderRepository({
      getById: async () => Result.success(order),
    });

    const action = getOrderByIdAction(mockRepo);

    await expect(action("order-1")).rejects.toThrow("No hay permisos para esta consulta");
  });

  it("allows admin to access any order", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { id: "admin-1", role: "admin" } } as any);

    const order = Order.fromEntity({ id: "order-1", user_id: "user-1" });
    const mockRepo = MockOrderRepository({
      getById: async () => Result.success(order),
    });

    const action = getOrderByIdAction(mockRepo);
    const result = await action("order-1");

    expect(result.success).toBe(true);
  });

  it("returns failure when repository returns an error", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { id: "user-1", role: "user" } } as any);

    const mockRepo = MockOrderRepository({
      getById: async () => Result.failure(new Error("Not found")),
    });

    const action = getOrderByIdAction(mockRepo);
    const result = await action("invalid-id");

    expect(result).toEqual({ success: false, message: "Not found" });
  });
});
