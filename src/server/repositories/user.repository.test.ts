import { createPrismaClientMock } from '@/tests/mocks/prisma';
import { PrismaClient } from '@/prisma/generated/prisma/client';
import { UserRepository } from './user.repository';
import { User } from '@/src/core/entities';

const mockClient = createPrismaClientMock();
const repo = UserRepository(mockClient as unknown as PrismaClient);

const mockUserEntity = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@test.com',
  emailVerified: new Date(),
  password: 'hashed-password',
  role: 'user',
  image: '',
  created_at: new Date(),
  updated_at: new Date(),
};

describe('UserRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates a user and returns Result.success', async () => {
      mockClient.user.create.mockResolvedValue(mockUserEntity);

      const user = User.fromJson({ name: 'Test User', email: 'test@test.com' });
      const result = await repo.create(user);

      expect(mockClient.user.create).toHaveBeenCalledTimes(1);
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toBeInstanceOf(User);
        expect(result.data.email).toBe('test@test.com');
      }
    });

    it('returns Result.failure when prisma throws', async () => {
      mockClient.user.create.mockRejectedValue(new Error('DB error'));

      const user = User.fromJson({ name: 'Test', email: 'test@test.com' });
      const result = await repo.create(user);

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('DB error');
      }
    });
  });

  describe('findByEmail', () => {
    it('returns the user when found', async () => {
      mockClient.user.findUnique.mockResolvedValue(mockUserEntity);

      const result = await repo.findByEmail('test@test.com');

      expect(mockClient.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toBeInstanceOf(User);
        expect(result.data.email).toBe('test@test.com');
      }
    });

    it('returns Result.failure when prisma throws', async () => {
      mockClient.user.findUnique.mockRejectedValue(new Error('Query error'));

      const result = await repo.findByEmail('test@test.com');

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Query error');
      }
    });
  });

  describe('findByTenant', () => {
    it('returns users list', async () => {
      mockClient.user.findMany.mockResolvedValue([mockUserEntity]);

      const result = await repo.findByTenant('tenant-1');

      expect(mockClient.user.findMany).toHaveBeenCalledTimes(1);
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0]).toBeInstanceOf(User);
      }
    });

    it('returns empty array when no users', async () => {
      mockClient.user.findMany.mockResolvedValue([]);

      const result = await repo.findByTenant('tenant-1');

      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toEqual([]);
      }
    });

    it('returns Result.failure when prisma throws', async () => {
      mockClient.user.findMany.mockRejectedValue(new Error('Query error'));

      const result = await repo.findByTenant('tenant-1');

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Query error');
      }
    });
  });

  describe('changeRole', () => {
    it('updates the user role and returns Result.success', async () => {
      mockClient.user.update.mockResolvedValue({ ...mockUserEntity, role: 'admin' });

      const result = await repo.changeRole('user-1', 'admin');

      expect(mockClient.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { role: 'admin' },
      });
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toBeInstanceOf(User);
      }
    });

    it('returns Result.failure when prisma throws', async () => {
      mockClient.user.update.mockRejectedValue(new Error('Update error'));

      const result = await repo.changeRole('user-1', 'admin');

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Update error');
      }
    });
  });
});
