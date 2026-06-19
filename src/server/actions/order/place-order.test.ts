jest.mock("@/src/auth.config", () => ({
  auth: jest.fn(),
}));

import { auth } from "@/src/auth.config";
import { placeOrderAction } from "./place-order";
import { MockOrderRepository, MockProductRepository } from "@/tests/mocks/repositories";
import { Product, Order } from "@/src/core/entities";
import { Result } from "@/src/core/utils";
import type { TProductToOrder, TFormUserAddress } from "@/src/core/types";

const mockedAuth = auth as jest.MockedFunction<typeof auth>;

const mockProducts: TProductToOrder[] = [
  { productId: "prod-1", quantity: 2, size: "M" },
  { productId: "prod-2", quantity: 1, size: "L" },
];

const mockAddress: TFormUserAddress = {
  firstName: "John",
  lastName: "Doe",
  address: "123 Main St",
  addressInfo: "",
  postalCode: "12345",
  city: "NYC",
  country: "US",
  phone: "555-0100",
};

describe("placeOrderAction", () => {
  beforeEach(() => {
    mockedAuth.mockReset();
  });

  it("returns failure when there is no valid session", async () => {
    mockedAuth.mockResolvedValue(null);

    const mockProductRepo = MockProductRepository();
    const mockOrderRepo = MockOrderRepository();
    const action = placeOrderAction(mockProductRepo, mockOrderRepo);

    const result = await action(mockProducts, mockAddress);

    expect(result).toEqual({ success: false, message: "No hay una sesión válida" });
  });

  it("returns failure when product lookup fails", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } } as any);

    const mockProductRepo = MockProductRepository({
      listProductsByIds: async () => Result.failure(new Error("Products not found")),
    });
    const mockOrderRepo = MockOrderRepository();

    const action = placeOrderAction(mockProductRepo, mockOrderRepo);
    const result = await action(mockProducts, mockAddress);

    expect(result).toEqual({ success: false, message: "Products not found" });
  });

  it("calculates totals correctly and calls trxNewOrder", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } } as any);

    const prod1 = Product.fromJson({ id: "prod-1", price: 100 });
    const prod2 = Product.fromJson({ id: "prod-2", price: 50 });

    const mockProductRepo = MockProductRepository({
      listProductsByIds: async () => Result.success([prod1, prod2]),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let capturedPayload: any;
    const mockOrderRepo = MockOrderRepository({
      trxNewOrder: async (payload) => {
        capturedPayload = payload;
        return Result.success(Order.fromEntity({ id: "order-1" }));
      },
    });

    const action = placeOrderAction(mockProductRepo, mockOrderRepo);
    const result = await action(mockProducts, mockAddress);

    expect(result.success).toBe(true);
    expect(capturedPayload).toBeDefined();
    expect(capturedPayload.userId).toBe("user-1");
    expect(capturedPayload.itemsInOrder).toBe(3);
    expect(capturedPayload.subtotal).toBe(250);
    expect(capturedPayload.tax).toBe(37.5);
    expect(capturedPayload.total).toBeCloseTo(287.5, 10);
    expect(capturedPayload.orderItems).toHaveLength(2);
    expect(capturedPayload.orderItems[0]).toMatchObject({
      productId: "prod-1",
      quantity: 2,
      price: 100,
      size: "M",
    });
    expect(capturedPayload.orderItems[1]).toMatchObject({
      productId: "prod-2",
      quantity: 1,
      price: 50,
      size: "L",
    });
    expect(capturedPayload.address).toEqual(mockAddress);
  });

  it("returns failure when order creation fails", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } } as any);

    const prod1 = Product.fromJson({ id: "prod-1", price: 100 });

    const mockProductRepo = MockProductRepository({
      listProductsByIds: async () => Result.success([prod1]),
    });

    const mockOrderRepo = MockOrderRepository({
      trxNewOrder: async () => Result.failure(new Error("Order failed")),
    });

    const action = placeOrderAction(mockProductRepo, mockOrderRepo);
    const result = await action(mockProducts, mockAddress);

    expect(result).toEqual({ success: false, message: "Order failed" });
  });
});
