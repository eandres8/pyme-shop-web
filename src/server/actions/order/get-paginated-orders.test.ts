jest.mock("@/src/auth.config", () => ({
  auth: jest.fn(),
}));

jest.mock("../../providers", () => ({
  orderRepository: {
    listOrders: jest.fn(),
  },
}));

import { auth } from "@/src/auth.config";
import { getPaginatedOrders } from "./get-paginated-orders";
import { Order } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

const mockedAuth = auth as jest.MockedFunction<typeof auth>;
const mockOrderRepository = jest.requireMock("../../providers").orderRepository;

describe("getPaginatedOrders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns failure when user is not admin", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { role: "user" } } as any);

    const result = await getPaginatedOrders();

    expect(result).toEqual({
      success: false,
      message: "No es un usuario válido",
    });
  });

  it("returns order list when user is admin", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { role: "admin" } } as any);
    const orders = [Order.fromEntity({ id: "order-1" })];
    mockOrderRepository.listOrders.mockResolvedValue(Result.success(orders));

    const result = await getPaginatedOrders();

    expect(result.success).toBe(true);
  });

  it("returns failure when repository returns an error", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { role: "admin" } } as any);
    mockOrderRepository.listOrders.mockResolvedValue(Result.failure(new Error("DB error")));

    const result = await getPaginatedOrders();

    expect(result).toEqual({ success: false, message: "DB error" });
  });
});
