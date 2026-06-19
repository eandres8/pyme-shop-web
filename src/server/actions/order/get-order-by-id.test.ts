jest.mock("@/src/auth.config", () => ({
  auth: jest.fn(),
}));

jest.mock("../../providers", () => ({
  orderRepository: {
    getById: jest.fn(),
  },
}));

import { auth } from "@/src/auth.config";
import { getOrderById } from "./get-order-by-id";
import { Order } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

const mockedAuth = auth as jest.MockedFunction<typeof auth>;
const mockOrderRepository = jest.requireMock("../../providers").orderRepository;

describe("getOrderById", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns failure when user is not authenticated", async () => {
    mockedAuth.mockResolvedValue(null);

    const result = await getOrderById("order-1");

    expect(result).toEqual({
      success: false,
      message: "Usuario no autenticado",
    });
  });

  it("returns order detail when authenticated user owns the order", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { id: "user-1", role: "user" } } as any);
    const order = Order.fromEntity({ id: "order-1", user_id: "user-1" });
    mockOrderRepository.getById.mockResolvedValue(Result.success(order));

    const result = await getOrderById("order-1");

    expect(result.success).toBe(true);
  });

  it("throws when non-owner user tries to access order", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { id: "user-2", role: "user" } } as any);
    const order = Order.fromEntity({ id: "order-1", user_id: "user-1" });
    mockOrderRepository.getById.mockResolvedValue(Result.success(order));

    await expect(getOrderById("order-1")).rejects.toThrow("No hay permisos para esta consulta");
  });

  it("allows admin to access any order", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { id: "admin-1", role: "admin" } } as any);
    const order = Order.fromEntity({ id: "order-1", user_id: "user-1" });
    mockOrderRepository.getById.mockResolvedValue(Result.success(order));

    const result = await getOrderById("order-1");

    expect(result.success).toBe(true);
  });

  it("returns failure when repository returns an error", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { id: "user-1", role: "user" } } as any);
    mockOrderRepository.getById.mockResolvedValue(Result.failure(new Error("Not found")));

    const result = await getOrderById("invalid-id");

    expect(result).toEqual({ success: false, message: "Not found" });
  });
});
