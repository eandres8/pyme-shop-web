import { Order } from "@/src/core/entities";
import { Result } from "@/src/core/utils";
import type { IOrderRepository } from "@/src/server/interfaces";

type MockOverrides = {
  getById?: (id: string) => ReturnType<IOrderRepository["getById"]>;
  trxNewOrder?: (payload: Record<string, unknown>) => ReturnType<IOrderRepository["trxNewOrder"]>;
  listOrdersByUser?: (userId: string) => ReturnType<IOrderRepository["listOrdersByUser"]>;
  listOrders?: () => ReturnType<IOrderRepository["listOrders"]>;
};

export function MockOrderRepository(overrides: MockOverrides = {}): IOrderRepository {
  return {
    getById: overrides.getById ?? (async (id) => Result.success(Order.fromEntity({ id, user_id: "" }))),
    trxNewOrder: overrides.trxNewOrder ?? (async () => Result.success(Order.fromEntity({}))),
    listOrdersByUser: overrides.listOrdersByUser ?? (async () => Result.success([])),
    listOrders: overrides.listOrders ?? (async () => Result.success([])),
  };
}
