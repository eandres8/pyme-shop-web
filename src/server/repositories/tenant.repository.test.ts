import { createPrismaClientMock } from '@/tests/mocks/prisma';
import { PrismaClient } from '@/prisma/generated/prisma/client';
import { TenantRepository } from './tenant.repository';
import { Tenant, TenantUser } from '@/src/core/entities';
import type { TTenantEntity, TTenantUserEntity } from '@/src/core/types';
import type { ICategoryRepository } from '../interfaces';
import { Result } from '@/src/core/utils';

const mockClient = createPrismaClientMock();

const mockCategoryRepository: ICategoryRepository = {
  createCategories: jest.fn().mockResolvedValue(Result.success([])),
  createCategoriesForTenant: jest.fn().mockResolvedValue(Result.success([])),
  listCategories: jest.fn().mockResolvedValue(Result.success([])),
};

const repo = TenantRepository(mockClient as unknown as PrismaClient, mockCategoryRepository);

const mockTenantEntity: TTenantEntity = {
  id: 'tenant-1',
  name: 'Mi Tienda',
  slug: 'mi-tienda',
  created_at: new Date(),
  updated_at: new Date(),
  phone: '',
  address: '',
  users: []
};

const mockTenantUserEntity: TTenantUserEntity = {
  id: 'tu-1',
  user_id: 'user-1',
  tenant_id: 'tenant-1',
  role: 'admin',
};

describe('TenantRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates a tenant and returns it', async () => {
      mockClient.tenant.create.mockResolvedValue(mockTenantEntity);

      const tenant = Tenant.fromJson({ name: 'Mi Tienda', slug: 'mi-tienda' });
      const result = await repo.create(tenant);

      expect(mockClient.tenant.create).toHaveBeenCalledTimes(1);
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toBeInstanceOf(Tenant);
        expect(result.data.name).toBe('Mi Tienda');
        expect(result.data.slug).toBe('mi-tienda');
      }
    });

    it('returns Result.failure when prisma throws', async () => {
      mockClient.tenant.create.mockRejectedValue(new Error('Unique constraint'));

      const tenant = Tenant.fromJson({ name: 'Mi Tienda', slug: 'mi-tienda' });
      const result = await repo.create(tenant);

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Unique constraint');
      }
    });
  });

  describe('findById', () => {
    it('returns the tenant when found', async () => {
      mockClient.tenant.findUnique.mockResolvedValue(mockTenantEntity);

      const result = await repo.findById('tenant-1');

      expect(mockClient.tenant.findUnique).toHaveBeenCalledWith({ where: { id: 'tenant-1' } });
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toBeInstanceOf(Tenant);
        expect(result.data.id).toBe('tenant-1');
      }
    });

    it('returns Result.failure when tenant does not exist', async () => {
      mockClient.tenant.findUnique.mockResolvedValue(null);

      const result = await repo.findById('non-existent');

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toBe('Tenant no encontrado');
      }
    });

    it('returns Result.failure when prisma throws', async () => {
      mockClient.tenant.findUnique.mockRejectedValue(new Error('Query error'));

      const result = await repo.findById('tenant-1');

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Query error');
      }
    });
  });

  describe('findBySlug', () => {
    it('returns the tenant when found by slug', async () => {
      mockClient.tenant.findUnique.mockResolvedValue(mockTenantEntity);

      const result = await repo.findBySlug('mi-tienda');

      expect(mockClient.tenant.findUnique).toHaveBeenCalledWith({ where: { slug: 'mi-tienda' } });
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toBeInstanceOf(Tenant);
        expect(result.data.slug).toBe('mi-tienda');
      }
    });

    it('returns Result.failure when tenant does not exist', async () => {
      mockClient.tenant.findUnique.mockResolvedValue(null);

      const result = await repo.findBySlug('non-existent');

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toBe('Tenant no encontrado');
      }
    });

    it('returns Result.failure when prisma throws', async () => {
      mockClient.tenant.findUnique.mockRejectedValue(new Error('Query error'));

      const result = await repo.findBySlug('mi-tienda');

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Query error');
      }
    });
  });

  describe('addUser', () => {
    it('adds a user to tenant successfully', async () => {
      mockClient.tenantUser.create.mockResolvedValue(mockTenantUserEntity);

      const result = await repo.addUser('tenant-1', 'user-1', 'admin');

      expect(mockClient.tenantUser.create).toHaveBeenCalledTimes(1);
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toBeInstanceOf(TenantUser);
        expect(result.data.userId).toBe('user-1');
        expect(result.data.tenantId).toBe('tenant-1');
        expect(result.data.role).toBe('admin');
      }
    });

    it('returns Result.failure when unique constraint is violated', async () => {
      mockClient.tenantUser.create.mockRejectedValue(
        new Error('Unique constraint failed on the fields: (`user_id`, `tenant_id`)'),
      );

      const result = await repo.addUser('tenant-1', 'user-1', 'admin');

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Unique constraint');
      }
    });

    it('returns Result.failure when prisma throws', async () => {
      mockClient.tenantUser.create.mockRejectedValue(new Error('Query error'));

      const result = await repo.addUser('tenant-1', 'user-1', 'admin');

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Query error');
      }
    });
  });

  describe('listUsers', () => {
    it('returns users for a tenant', async () => {
      mockClient.tenantUser.findMany.mockResolvedValue([
        { ...mockTenantUserEntity, user: { id: 'user-1', name: 'Test User' } },
      ]);

      const result = await repo.listUsers('tenant-1');

      expect(mockClient.tenantUser.findMany).toHaveBeenCalledWith({
        where: { tenant_id: 'tenant-1' },
        include: { user: true },
      });
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0]).toBeInstanceOf(TenantUser);
      }
    });

    it('returns empty array when tenant has no users', async () => {
      mockClient.tenantUser.findMany.mockResolvedValue([]);

      const result = await repo.listUsers('tenant-1');

      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toEqual([]);
      }
    });

    it('returns Result.failure when prisma throws', async () => {
      mockClient.tenantUser.findMany.mockRejectedValue(new Error('Query error'));

      const result = await repo.listUsers('tenant-1');

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Query error');
      }
    });
  });

  describe('removeUser', () => {
    it('removes a user from tenant', async () => {
      mockClient.tenantUser.deleteMany.mockResolvedValue({ count: 1 });

      const result = await repo.removeUser('tenant-1', 'user-1');

      expect(mockClient.tenantUser.deleteMany).toHaveBeenCalledWith({
        where: { tenant_id: 'tenant-1', user_id: 'user-1' },
      });
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toBe(1);
      }
    });

    it('returns 0 when no user was removed', async () => {
      mockClient.tenantUser.deleteMany.mockResolvedValue({ count: 0 });

      const result = await repo.removeUser('tenant-1', 'non-existent');

      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toBe(0);
      }
    });

    it('returns Result.failure when prisma throws', async () => {
      mockClient.tenantUser.deleteMany.mockRejectedValue(new Error('Query error'));

      const result = await repo.removeUser('tenant-1', 'user-1');

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Query error');
      }
    });
  });

  describe('createWithAdmin', () => {
    it('creates tenant, assigns admin, and copies categories via transaction', async () => {
      (mockCategoryRepository.listCategories as jest.Mock).mockResolvedValue(
        Result.success([
          { id: 'cat-1', name: 'Electronics' },
          { id: 'cat-2', name: 'Clothing' },
        ]),
      );
      (mockCategoryRepository.createCategoriesForTenant as jest.Mock).mockResolvedValue(
        Result.success([]),
      );

      mockClient.$transaction.mockImplementation(
        async (cb: (...args: unknown[]) => unknown) => {
          const tx = {
            tenant: {
              create: jest.fn().mockResolvedValue(mockTenantEntity),
            },
            tenantUser: {
              create: jest.fn().mockResolvedValue(mockTenantUserEntity),
            },
          };
          return cb(tx);
        },
      );

      const tenant = Tenant.fromJson({ name: 'Mi Tienda', slug: 'mi-tienda' });
      const result = await repo.createWithAdmin(tenant, 'user-1');

      expect(mockClient.$transaction).toHaveBeenCalledTimes(1);
      expect(mockCategoryRepository.listCategories).toHaveBeenCalledTimes(1);
      expect(mockCategoryRepository.createCategoriesForTenant).toHaveBeenCalledWith('tenant-1', ['Electronics', 'Clothing']);
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.data).toBeInstanceOf(Tenant);
      }
    });

    it('returns Result.failure when transaction fails', async () => {
      mockClient.$transaction.mockRejectedValue(new Error('Transaction error'));

      const tenant = Tenant.fromJson({ name: 'Mi Tienda', slug: 'mi-tienda' });
      const result = await repo.createWithAdmin(tenant, 'user-1');

      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error.message).toContain('Transaction error');
      }
    });
  });
});
