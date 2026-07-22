import { createPrismaClientMock } from '@/tests/mocks/prisma';
import { PrismaClient } from '@/prisma/generated/prisma/client';
import { OrderRepository } from './order.repository';
import { Order } from '@/src/core/entities';
import type { TNewOrder } from '@/src/core/types';

const mockClient = createPrismaClientMock();
const repo = OrderRepository(mockClient as unknown as PrismaClient);

const mockOrderEntity = {
  id: 'order-1',
  subtotal: 100,
  tax: 16,
  total: 116,
  items_in_order: 2,
  is_paid: false,
  paid_at: null,
  user_id: 'user-1',
  created_at: new Date(),
  updated_at: new Date(),
  orderItems: [
    {
      id: 'oi-1',
      order_id: 'order-1',
      price: 50,
      product_id: 'prod-1',
      quantity: 1,
      size: 'M',
      product: {
        title: 'Test Product',
        slug: 'test-product',
        productImages: [{ url: 'https://example.com/img.jpg' }],
      },
    },
  ],
  orderAddresses: {
    id: 'addr-1',
    address: '123 Test St',
    city: 'Test City',
    phone: '555-0000',
    first_name: 'John',
    last_name: 'Doe',
    address_info: null,
    postal_code: '12345',
    country_id: 'country-1',
    order_id: 'order-1',
  },
};

const mockTx = {
  product: { update: jest.fn() },
  order: { create: jest.fn() },
  orderAddress: { create: jest.fn() },
};

describe('OrderRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getById', () => {
    it('returns the order when found', async () => {
      mockClient.order.findFirst.mockResolvedValue(mockOrderEntity);

      const result = await repo.getById('order-1');

      expect(mockClient.order.findFirst).toHaveBeenCalledTimes(1);
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toBeInstanceOf(Order);
      }
    });

    it('returns Result.failure when order does not exist', async () => {
      mockClient.order.findFirst.mockResolvedValue(null);

      const result = await repo.getById('order-1');

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toBe('La orden order-1 no existe');
      }
    });

    it('returns Result.failure when prisma throws', async () => {
      mockClient.order.findFirst.mockRejectedValue(new Error('Query error'));

      const result = await repo.getById('order-1');

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Query error');
      }
    });
  });

  describe('trxNewOrder', () => {
    const basePayload: TNewOrder = {
      userId: 'user-1',
      tenantId: 'tenant-1',
      itemsInOrder: 2,
      subtotal: 100,
      tax: 16,
      total: 116,
      orderItems: [
        { productId: 'prod-1', quantity: 1, size: 'M', price: 50 },
        { productId: 'prod-2', quantity: 1, size: 'L', price: 50 },
      ],
      address: {
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Test St',
        addressInfo: '',
        postalCode: '12345',
        city: 'Test City',
        country: 'country-1',
        phone: '555-0000',
      },
      mapStock: { 'prod-1': 1, 'prod-2': 1 },
    };

    beforeEach(() => {
      mockClient.$transaction.mockImplementation(async (cb: (...args: unknown[]) => unknown) => cb(mockTx));
      mockTx.product.update.mockResolvedValue({ id: 'prod-1', title: 'P1', in_stock: 5 });
    });

    it('completes transaction and returns Order', async () => {
      mockClient.$transaction.mockImplementation(async (cb: (...args: unknown[]) => unknown) => {
        mockTx.product.update.mockResolvedValue({ id: 'prod-1', title: 'P1', in_stock: 5 });
        mockTx.order.create.mockResolvedValue(mockOrderEntity);
        mockTx.orderAddress.create.mockResolvedValue({});

        return (cb(mockTx) as Promise<unknown>).then(() => ({
          order: mockOrderEntity,
          address: {},
          updatedProducts: [{ id: 'prod-1', in_stock: 5 }],
        }));
      });

      const result = await repo.trxNewOrder(basePayload);

      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toBeInstanceOf(Order);
      }
    });

    it('persists tenant_id from the payload on order creation', async () => {
      mockClient.$transaction.mockImplementation(async (cb: (...args: unknown[]) => unknown) => {
        mockTx.product.update.mockResolvedValue({ id: 'prod-1', title: 'P1', in_stock: 5 });
        mockTx.order.create.mockResolvedValue(mockOrderEntity);
        mockTx.orderAddress.create.mockResolvedValue({});

        return (cb(mockTx) as Promise<unknown>).then(() => ({
          order: mockOrderEntity,
          address: {},
          updatedProducts: [{ id: 'prod-1', in_stock: 5 }],
        }));
      });

      await repo.trxNewOrder(basePayload);

      expect(mockTx.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenant_id: 'tenant-1',
          }),
        }),
      );
    });

    it('returns Result.failure when stock is insufficient', async () => {
      mockClient.$transaction.mockImplementation(async (cb: (...args: unknown[]) => unknown) => {
        mockTx.product.update.mockResolvedValue({ id: 'prod-1', title: 'P1', in_stock: -1 });

        return cb(mockTx);
      });

      const result = await repo.trxNewOrder(basePayload);

      expect(result.isOk).toBe(false);
    });

    it('returns Result.failure when $transaction throws', async () => {
      mockClient.$transaction.mockRejectedValue(new Error('Transaction error'));

      const result = await repo.trxNewOrder(basePayload);

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Transaction error');
      }
    });
  });

  describe('listOrdersByUser', () => {
    it('returns orders for a user', async () => {
      mockClient.order.findMany.mockResolvedValue([mockOrderEntity]);

      const result = await repo.listOrdersByUser('user-1');

      expect(mockClient.order.findMany).toHaveBeenCalledWith({
        where: { user_id: 'user-1' },
        include: { orderItems: true, orderAddresses: true },
      });
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0]).toBeInstanceOf(Order);
      }
    });

    it('returns empty array when user has no orders', async () => {
      mockClient.order.findMany.mockResolvedValue([]);

      const result = await repo.listOrdersByUser('user-1');

      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toEqual([]);
      }
    });

    it('returns Result.failure when prisma throws', async () => {
      mockClient.order.findMany.mockRejectedValue(new Error('Query error'));

      const result = await repo.listOrdersByUser('user-1');

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Query error');
      }
    });
  });

  describe('listOrders', () => {
    it('returns all orders sorted by created_at desc', async () => {
      mockClient.order.findMany.mockResolvedValue([mockOrderEntity]);

      const result = await repo.listOrders();

      expect(mockClient.order.findMany).toHaveBeenCalledWith({
        orderBy: { created_at: 'desc' },
        where: undefined,
        include: { orderItems: true, orderAddresses: true },
      });
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toHaveLength(1);
      }
    });

    it('filters by tenantId when provided', async () => {
      mockClient.order.findMany.mockResolvedValue([mockOrderEntity]);

      const result = await repo.listOrders('tenant-1');

      expect(mockClient.order.findMany).toHaveBeenCalledWith({
        orderBy: { created_at: 'desc' },
        where: { tenant_id: 'tenant-1' },
        include: { orderItems: true, orderAddresses: true },
      });
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toHaveLength(1);
      }
    });

    it('returns empty array when no orders exist', async () => {
      mockClient.order.findMany.mockResolvedValue([]);

      const result = await repo.listOrders();

      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toEqual([]);
      }
    });

    it('returns Result.failure when prisma throws', async () => {
      mockClient.order.findMany.mockRejectedValue(new Error('Query error'));

      const result = await repo.listOrders();

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Query error');
      }
    });
  });
});
