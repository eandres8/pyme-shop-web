import { createPrismaClientMock } from '@/tests/mocks/prisma';
import { PrismaClient } from '@/prisma/generated/prisma/client';
import { CategoryRepository } from './category.repository';
import { Category } from '@/src/core/entities';

const mockClient = createPrismaClientMock();
const repo = CategoryRepository(mockClient as unknown as PrismaClient);

describe('CategoryRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCategories', () => {
    it('creates categories via $transaction and returns them', async () => {
      mockClient.$transaction.mockResolvedValue([
        { id: 'cat-1', name: 'men' },
        { id: 'cat-2', name: 'women' },
      ]);

      const result = await repo.createCategories(['men', 'women']);

      expect(mockClient.$transaction).toHaveBeenCalledTimes(1);
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toHaveLength(2);
        expect(result.data[0]).toBeInstanceOf(Category);
        expect(result.data[0].name).toBe('men');
      }
    });

    it('returns Result.failure when $transaction fails', async () => {
      mockClient.$transaction.mockRejectedValue(new Error('Transaction error'));

      const result = await repo.createCategories(['men']);

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Transaction error');
      }
    });
  });

  describe('listCategories', () => {
    it('returns all categories', async () => {
      mockClient.category.findMany.mockResolvedValue([
        { id: 'cat-1', name: 'men' },
        { id: 'cat-2', name: 'women' },
      ]);

      const result = await repo.listCategories();

      expect(mockClient.category.findMany).toHaveBeenCalledTimes(1);
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toHaveLength(2);
        expect(result.data[0]).toBeInstanceOf(Category);
      }
    });

    it('returns empty array when no categories', async () => {
      mockClient.category.findMany.mockResolvedValue([]);

      const result = await repo.listCategories();

      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toEqual([]);
      }
    });

    it('returns Result.failure when prisma throws', async () => {
      mockClient.category.findMany.mockRejectedValue(new Error('Query error'));

      const result = await repo.listCategories();

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Query error');
      }
    });
  });
});
