jest.mock("@/src/auth.config", () => ({
  auth: jest.fn(),
}));

jest.mock("../../providers", () => ({
  orderRepository: {
    listOrdersByUser: jest.fn(),
  },
}));

import { auth } from "@/src/auth.config";
import { getOrderListByUser } from "./get-order-list-by-user";
import { Order } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

const mockedAuth = auth as jest.MockedFunction<typeof auth>;
const mockOrderRepository = jest.requireMock("../../providers").orderRepository;

describe("getOrderListByUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns failure when user is not authenticated", async () => {
    mockedAuth.mockResolvedValue(null);

    const result = await getOrderListByUser();

    expect(result).toEqual({
      success: false,
      message: "Usuario no autenticado",
    });
  });

  it("returns order list for authenticated user", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } } as any);
    const orders = [
      Order.fromEntity({ id: "order-1" }),
      Order.fromEntity({ id: "order-2" }),
    ];
    mockOrderRepository.listOrdersByUser.mockResolvedValue(Result.success(orders));

    const result = await getOrderListByUser();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
    }
  });

  it("returns failure when repository returns an error", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } } as any);
    mockOrderRepository.listOrdersByUser.mockResolvedValue(Result.failure(new Error("DB error")));

    const result = await getOrderListByUser();

    expect(result).toEqual({ success: false, message: "DB error" });
  });
});
