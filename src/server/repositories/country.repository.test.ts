import { createPrismaClientMock } from '@/tests/mocks/prisma';
import { PrismaClient } from '@/prisma/generated/prisma/client';
import { CountryRepository } from './country.repository';

const mockClient = createPrismaClientMock();
const repo = CountryRepository(mockClient as unknown as PrismaClient);

describe('CountryRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMultiple', () => {
    it('creates countries via $transaction and returns count', async () => {
      mockClient.$transaction.mockResolvedValue([
        { id: 'MX', name: 'Mexico' },
        { id: 'US', name: 'United States' },
      ]);

      const result = await repo.createMultiple([
        { id: 'MX', name: 'Mexico' },
        { id: 'US', name: 'United States' },
      ]);

      expect(mockClient.$transaction).toHaveBeenCalledTimes(1);
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toBe(2);
      }
    });

    it('returns Result.failure when $transaction fails', async () => {
      mockClient.$transaction.mockRejectedValue(new Error('Transaction error'));

      const result = await repo.createMultiple([{ id: 'MX', name: 'Mexico' }]);

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Transaction error');
      }
    });
  });

  describe('list', () => {
    it('returns countries sorted by name asc', async () => {
      mockClient.country.findMany.mockResolvedValue([
        { id: 'MX', name: 'Mexico' },
        { id: 'US', name: 'United States' },
      ]);

      const result = await repo.list();

      expect(mockClient.country.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toHaveLength(2);
      }
    });

    it('returns empty array when no countries', async () => {
      mockClient.country.findMany.mockResolvedValue([]);

      const result = await repo.list();

      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toEqual([]);
      }
    });

    it('returns Result.failure when prisma throws', async () => {
      mockClient.country.findMany.mockRejectedValue(new Error('Query error'));

      const result = await repo.list();

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Query error');
      }
    });
  });
});
