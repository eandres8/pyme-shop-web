import { Order } from "@/src/core/entities";
import type { TNewOrder } from "@/src/core/types";
import { Result } from "@/src/core/utils";

export interface IOrderRepository {
  getById(id: string): Promise<Result<Order>>;
  trxNewOrder(payload: TNewOrder): Promise<Result<Order>>;
  listOrdersByUser(userId: string): Promise<Result<Order[]>>;
  listOrders(tenantId?: string): Promise<Result<Order[]>>;
}
