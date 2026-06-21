import { createPrismaClientMock } from '@/tests/mocks/prisma';
import { PrismaClient } from '@/prisma/generated/prisma/client';
import { createTenantClient } from './prisma-tenant-client';

describe('prisma-tenant-client', () => {
  let mockClient: ReturnType<typeof createPrismaClientMock>;
  let tenantClient: PrismaClient;

  let productFindManyMock: jest.Mock;
  let productFindFirstMock: jest.Mock;
  let productCountMock: jest.Mock;
  let productCreateMock: jest.Mock;
  let categoryFindManyMock: jest.Mock;
  let categoryFindFirstMock: jest.Mock;
  let orderFindManyMock: jest.Mock;
  let orderCountMock: jest.Mock;
  let userFindManyMock: jest.Mock;
  let countryFindManyMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = createPrismaClientMock();

    // Add missing methods to mock
    (mockClient.category as Record<string, unknown>).findFirst = jest.fn();
    (mockClient.category as Record<string, unknown>).count = jest.fn();
    (mockClient.order as Record<string, unknown>).count = jest.fn();

    // Save references before wrapping
    productFindManyMock = mockClient.product.findMany as jest.Mock;
    productFindFirstMock = mockClient.product.findFirst as jest.Mock;
    productCountMock = mockClient.product.count as jest.Mock;
    productCreateMock = mockClient.product.create as jest.Mock;
    categoryFindManyMock = mockClient.category.findMany as jest.Mock;
    categoryFindFirstMock = mockClient.category.findFirst as jest.Mock;
    orderFindManyMock = mockClient.order.findMany as jest.Mock;
    orderCountMock = mockClient.order.count as jest.Mock;
    userFindManyMock = mockClient.user.findMany as jest.Mock;
    countryFindManyMock = mockClient.country.findMany as jest.Mock;

    tenantClient = createTenantClient(mockClient as unknown as PrismaClient, 'tenant-123');
  });

  describe('product model', () => {
    it('injects tenant_id in findMany', async () => {
      productFindManyMock.mockResolvedValue([]);

      await tenantClient.product.findMany({ where: { gender: 'men' } });

      expect(productFindManyMock).toHaveBeenCalledWith({
        where: { gender: 'men', tenant_id: 'tenant-123' },
      });
    });

    it('injects tenant_id when no where clause', async () => {
      productFindManyMock.mockResolvedValue([]);

      await tenantClient.product.findMany();

      expect(productFindManyMock).toHaveBeenCalledWith({
        where: { tenant_id: 'tenant-123' },
      });
    });

    it('injects tenant_id in findFirst', async () => {
      productFindFirstMock.mockResolvedValue(null);

      await tenantClient.product.findFirst({ where: { slug: 'test' } });

      expect(productFindFirstMock).toHaveBeenCalledWith({
        where: { slug: 'test', tenant_id: 'tenant-123' },
      });
    });

    it('injects tenant_id in count', async () => {
      productCountMock.mockResolvedValue(5);

      await tenantClient.product.count({ where: { gender: 'men' } });

      expect(productCountMock).toHaveBeenCalledWith({
        where: { gender: 'men', tenant_id: 'tenant-123' },
      });
    });

    it('injects tenant_id in create', async () => {
      productCreateMock.mockResolvedValue({});

      await tenantClient.product.create({ data: { title: 'Test' } as never });

      expect(productCreateMock).toHaveBeenCalledWith({
        data: { title: 'Test', tenant_id: 'tenant-123' },
      });
    });
  });

  describe('category model', () => {
    it('injects tenant_id in findMany', async () => {
      categoryFindManyMock.mockResolvedValue([]);

      await tenantClient.category.findMany();

      expect(categoryFindManyMock).toHaveBeenCalledWith({
        where: { tenant_id: 'tenant-123' },
      });
    });

    it('injects tenant_id in findFirst', async () => {
      categoryFindFirstMock.mockResolvedValue(null);

      await tenantClient.category.findFirst({ where: { name: 'shirts' } });

      expect(categoryFindFirstMock).toHaveBeenCalledWith({
        where: { name: 'shirts', tenant_id: 'tenant-123' },
      });
    });
  });

  describe('order model', () => {
    it('injects tenant_id in findMany', async () => {
      orderFindManyMock.mockResolvedValue([]);

      await tenantClient.order.findMany();

      expect(orderFindManyMock).toHaveBeenCalledWith({
        where: { tenant_id: 'tenant-123' },
      });
    });

    it('injects tenant_id in count', async () => {
      orderCountMock.mockResolvedValue(3);

      await tenantClient.order.count({ where: {} });

      expect(orderCountMock).toHaveBeenCalledWith({
        where: { tenant_id: 'tenant-123' },
      });
    });
  });

  describe('models without tenant_id', () => {
    it('does not modify user queries', async () => {
      userFindManyMock.mockResolvedValue([]);

      await tenantClient.user.findMany({ where: { name: 'John' } });

      expect(userFindManyMock).toHaveBeenCalledWith({
        where: { name: 'John' },
      });
    });

    it('does not modify country queries', async () => {
      countryFindManyMock.mockResolvedValue([]);

      await tenantClient.country.findMany();

      expect(countryFindManyMock).toHaveBeenCalled();
    });
  });
});
