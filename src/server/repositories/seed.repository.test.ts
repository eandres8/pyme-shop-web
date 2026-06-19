import { createPrismaClientMock } from '@/tests/mocks/prisma';
import { PrismaClient } from '@/prisma/generated/prisma/client';
import { SeedRepository } from './seed.repository';

const mockClient = createPrismaClientMock();
const repo = SeedRepository(mockClient as unknown as PrismaClient);

describe('SeedRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('resetTables', () => {
    it('returns Result.success(true) when all deleteMany resolve', async () => {
      mockClient.orderAddress.deleteMany.mockResolvedValue({ count: 0 });
      mockClient.orderItem.deleteMany.mockResolvedValue({ count: 0 });
      mockClient.order.deleteMany.mockResolvedValue({ count: 0 });
      mockClient.user.deleteMany.mockResolvedValue({ count: 0 });
      mockClient.userAddress.deleteMany.mockResolvedValue({ count: 0 });
      mockClient.country.deleteMany.mockResolvedValue({ count: 0 });
      mockClient.category.deleteMany.mockResolvedValue({ count: 0 });
      mockClient.product.deleteMany.mockResolvedValue({ count: 0 });
      mockClient.productImage.deleteMany.mockResolvedValue({ count: 0 });

      const result = await repo.resetTables();

      expect(mockClient.orderAddress.deleteMany).toHaveBeenCalledTimes(1);
      expect(mockClient.orderItem.deleteMany).toHaveBeenCalledTimes(1);
      expect(mockClient.order.deleteMany).toHaveBeenCalledTimes(1);
      expect(mockClient.user.deleteMany).toHaveBeenCalledTimes(1);
      expect(mockClient.userAddress.deleteMany).toHaveBeenCalledTimes(1);
      expect(mockClient.country.deleteMany).toHaveBeenCalledTimes(1);
      expect(mockClient.category.deleteMany).toHaveBeenCalledTimes(1);
      expect(mockClient.product.deleteMany).toHaveBeenCalledTimes(1);
      expect(mockClient.productImage.deleteMany).toHaveBeenCalledTimes(1);
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toBe(true);
      }
    });

    it('returns Result.failure when a deleteMany fails', async () => {
      mockClient.orderAddress.deleteMany.mockResolvedValue({ count: 0 });
      mockClient.orderItem.deleteMany.mockResolvedValue({ count: 0 });
      mockClient.order.deleteMany.mockResolvedValue({ count: 0 });
      mockClient.user.deleteMany.mockResolvedValue({ count: 0 });
      mockClient.userAddress.deleteMany.mockRejectedValue(new Error('Delete error'));

      const result = await repo.resetTables();

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toBe('Delete error');
      }
    });
  });
});
